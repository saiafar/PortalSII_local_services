const electron = require('electron');
const SQL = require("mssql");
const fetch = require("node-fetch");

const path = require('path');
const userDataPath = electron.app.getPath('userData');
const fs = require('fs');

const Config = require("../Models/Config");
const Empresa = require("../Models/Empresa");
const Session = require("../Models/Session");

class ReportesController{
    constructor(){
        let config=new Config();
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

    async getVentasDia(){
        let initsesion = false;
        try{
            let empresa = new Empresa();
            await empresa.getData(); 
            this.empresa = empresa.getJson();
            let session = null;
            await SQL.connect(this.connConfig)
            
            let rsVentas = await SQL.query(`SELECT d.Tipo,
            cm.ReferenciaID Documento,
            d.Fecha
           ,SUM(CASE WHEN cm.TipoMovimiento=1 THEN cm.Monto ELSE 0 END) - SUM(CASE WHEN cm.TipoMovimiento=2 THEN cm.Monto ELSE 0 END) as Monto
           ,cm.CajaAperturaID
           ,u.Username
           ,c.Descripcion
            FROM 
            dbo.Documentos d
            INNER JOIN CajasMovimientos cm ON cm.ReferenciaID = d.ID
            INNER JOIN CajasAperturas ca ON ca.ID = cm.CajaAperturaID
            INNER JOIN Usuarios u ON u.ID = ca.UsuarioID
            INNER JOIN Cajas c ON c.ID = ca.CajaID
            /*Where convert(date, Fecha) = convert(date, getDate())*/
            Where convert(date, Fecha) = '2020-03-12'
            GROUP BY cm.ReferenciaID, cm.CajaAperturaID, d.Tipo, d.Fecha, u.Username, c.Descripcion`)
            //console.log(rsVentas);
            session = new Session(this.config.apiUser, this.config.apiPass);
            initsesion = true;
            await session.login();
            if(rsVentas.rowsAffected[0] > 0)
                console.log(rsVentas.rowsAffected[0]);
            let body = {
                ventas: JSON.stringify(rsVentas.recordset)
                // token: session.token
            }
            console.log(session.token)
            let bodysend = JSON.stringify(body)
            //console.log(bodysend);
            console.log('---------->', this.config.apiServer+'/api/ventasdiarias');
            let response = await fetch(this.config.apiServer+'/api/ventasdiarias', {
                method: 'post',
                body:    bodysend,
                headers: { 'Content-Type': 'application/json', 'Authorization' : 'Bearer '+session.token},
            })

            try{
                console.log('reponse.JSON------------------------------------->');
                let text = await response.text();
                
                if(text == '{"status":"ok"}'){
                    console.log('--> OK');
                    
                }else{                  
                    
                    console.log('--> ERR');
                    fs.writeFileSync(path.join(userDataPath, 'response.html'), text);
                }
            
            }catch(err){
                console.log('ERROR: ', err)
            }
            if(initsesion)
                session.logout();
        }catch(err){
            console.log('ERROR: ', err)
        }
        
        
    }

    sendData(){

    }
    
}

module.exports = ReportesController;