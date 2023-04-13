const electron = require('electron');
const SQL = require("mssql");
const fetch = require("node-fetch");

const path = require('path');
const userDataPath = electron.app.getPath('userData');
const fs = require('fs');


const Boleta = require("../Models/Boleta");
const Config = require("../Models/Config");
const Empresa = require("../Models/Empresa");
const Session = require("../Models/Session");

class BoletaController{
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
			let initSesion = false;
            let empresa = new Empresa();
            await empresa.getData(); 
            this.empresa = empresa.getJson();
            let session = null;
            await SQL.connect(this.connConfig)
            let rsBoletas = await SQL.query('SELECT TOP (100) * FROM Documentos WHERE EnvioPortalWeb = 0 AND Tipo = 3 ORDER BY ID desc')
            //console.log('boleta', rsBoletas.recordsets[0]);
            if(rsBoletas.recordsets[0].length > 0){
                session = new Session(this.config.apiUser, this.config.apiPass);
                await session.login();
				initSesion = true;
            }
            rsBoletas.recordsets[0].forEach(async rowBoleta => {
                let rsDetalles = await SQL.query(`SELECT TOP 100 dd.ID, dd.Cantidad, dd.Precio, dd.Granel, dd.ProductoID, p.Nombre FROM DocumentosDetalles dd JOIN Productos p ON (p.ID = dd.ProductoID) WHERE DocumentoID = ${rowBoleta.ID}`)     
                //console.log('boleta', rowBoleta);
                let boleta = new Boleta(rowBoleta.ID, rowBoleta.Folio, rowBoleta.Fecha);
                rsDetalles.recordsets[0].forEach(row => {
                    boleta.addDetalle(row.ProductoID, row.Nombre, row.Precio, parseInt(row.Cantidad));
                });
                
                
                let jsonEmpresa = JSON.stringify(empresa.getJson());
                let jsonBoleta = boleta.getJson();
                let body = {
                    rut: empresa.rut,
                    folio: boleta.folio,
                    fecha: boleta.fechaEmision,
                    total: boleta.total,
                    empresa: jsonEmpresa,
                    compra: JSON.stringify(jsonBoleta.detalles)
                   // token: session.token
                }
                console.log(session.token)
                let bodysend = JSON.stringify(body)
                console.log(bodysend);
                let response = await fetch(this.config.apiServer+'/api/boleta', {
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
                        let rsBoletas = await SQL.query('UPDATE Documentos SET EnvioPortalWeb = 1 WHERE ID = '+boleta.id)   
                    }else{
						
						console.log('--> ERR');
						fs.writeFileSync(path.join(userDataPath, 'response.html'), text);
					}
                }catch(err){
                   console.log('ERROR-------------------------------------->', err);
                    
                }
                
                
            });
			
			if(initSesion)
				session.logout();
            
        }catch(err){
            console.log('ERROR: ', err)
        }
        
            
    }
}

module.exports = BoletaController;