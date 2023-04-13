const electron = require('electron');
const SQL = require("mssql");
const fetch = require("node-fetch");

const path = require('path');
const userDataPath = electron.app.getPath('userData');
const fs = require('fs');


const Venta = require("../Models/Venta");
const Config = require("../Models/Config");
const Empresa = require("../Models/Empresa");
const Session = require("../Models/Session");

class VentaController{
    constructor(){
        let config = new Config();
        this.config=config;

        this.connConfig = {  
            server: config.sqlServer,  //update me
            user: config.sqlUser, //update me
            password: config.sqlPass,
            database: config.sqlDatabase,
            port: config.sqlPort,
            options:{
                enableArithAbort: false
            }
        };

        this.conn = null;

        
    }

    async send(){
        try {

            let empresa = new Empresa();
            await empresa.getData(); 
            this.empresa = empresa.getJson();
            let session = null;
            await SQL.connect(this.connConfig)
            let rsVentas = await SQL.query(`SELECT TOP (100) 
            d.Tipo tipo
            ,cm.ReferenciaID documentoID
            ,d.Folio folio
            ,d.Fecha fecha
            ,SUM(CASE WHEN cm.TipoMovimiento=1 THEN cm.Monto ELSE 0 END) - SUM(CASE WHEN cm.TipoMovimiento=2 THEN cm.Monto ELSE 0 END) as monto
            ,u.Username usuario
            ,c.Descripcion caja
            FROM dbo.Documentos d
            INNER JOIN CajasMovimientos cm ON cm.ReferenciaID = d.ID
            INNER JOIN CajasAperturas ca ON ca.ID = cm.CajaAperturaID
            INNER JOIN Usuarios u ON u.ID = ca.UsuarioID
            INNER JOIN Cajas c ON c.ID = ca.CajaID
            Where YEAR(Fecha) = YEAR(getDate())
            AND EnvioPortalWeb = 0
            GROUP BY cm.ReferenciaID, d.Folio, d.Tipo, d.Fecha, u.Username, c.Descripcion
            ORDER BY Fecha desc`)
            if(rsVentas.recordsets[0].length > 0){
                session = new Session(this.config.apiUser, this.config.apiPass);
                await session.login();
            }
            
            rsVentas.recordsets[0].forEach(async rowVenta => {
                let rsDetalles = await SQL.query(`SELECT dd.ID, dd.Cantidad, dd.Precio, dd.Granel, dd.ProductoID, p.Nombre FROM DocumentosDetalles dd JOIN Productos p ON (p.ID = dd.ProductoID) WHERE DocumentoID = ${rowVenta.documentoID}`)
                let venta = new Venta(rowVenta.documentoID, rowVenta.folio, rowVenta.tipo, rowVenta.fecha, rowVenta.usuario, rowVenta.caja, rowVenta.monto);
                rsDetalles.recordsets[0].forEach(row => {
                    venta.addDetalle(row.ProductoID, row.Nombre, row.Precio, parseInt(row.Cantidad));
                });
                
                
                let jsonEmpresa = JSON.stringify(empresa.getJson());
                let jsonVenta = venta.getJson();
                let body = {
                    rut:     empresa.rut,
                    documentoID: venta.documentoID,
                    folio:   venta.folio,
                    tipo:    venta.tipo,
                    fecha:   venta.fecha,
                    hora:    venta.hora,
                    total:   venta.total,
                    monto:   venta.monto,
                    usuario: venta.usuario,
                    caja:    venta.caja,
                    empresa: jsonEmpresa,
                    compra:  JSON.stringify(jsonVenta.detalles)
                }
                let bodysend = JSON.stringify(body)
				console.log(this.config.apiServer+'/api/ventas');
                let response = await fetch(this.config.apiServer+'/api/ventas', {
                    method: 'post',
                    body:    bodysend,
                    headers: { 'Content-Type': 'application/json', 'Authorization' : 'Bearer '+session.token},
                })
                /*
                let res = response;
                let rs = await res.text()
                fs.writeFileSync(path.join(userDataPath, 'response.html'), rs);
                */
               try{
                console.log('reponse.JSON------------------------------------->');
                let text = await response.text();
                
                if(text == '{"status":"ok"}'){
                    console.log('--> OK');
                    let rsVentaEnviada = await SQL.query('UPDATE Documentos SET EnvioPortalWeb = 1 WHERE ID = '+venta.documentoID)   
                }else{
                    
                    console.log('--> ERR');
                    fs.writeFileSync(path.join(userDataPath, 'response.html'), text);
                }
            }catch(err){
               console.log('ERROR-------------------------------------->', err);
                
            }
                
                
            });
            session.logout();
            
        }catch(err){
            console.log('ERROR: ', err)
        }
        
            
    }
}

module.exports = VentaController;