//const SQLConnection = require('tedious').Connection;
//const Request = require('tedious').Request;  
//const TYPES = require('tedious').TYPES;
const SQL = require("mssql");

class Connection{
    constructor(){
        this.connConfig = {  
            server: 'DESKTOP-QM4E7LR\\PORTALWEB',  //update me
            user: 'sa', //update me
            password: 'portal',
            database: 'PuntoVenta',
            port: 1433,
            options:{
                enableArithAbort: false
            }
        };

        this.conn = null;
    }

    executeQuery(query){
        SQL.connect(this.connConfig, function (err) {
    
            if (err) console.log(err);
    
            // create Request object
            var request = new SQL.Request();
               
            // query to the database and get the records
            request.query(query, function (err, recordset) {
    
                // send records as a response
                //console.log(recordset.recordsets);
                recordset.recordsets[0].forEach(row => {
                    console.log(row);
                    /*request.query(query, function (err, recordset) {
                        if (err) console.log(err)
                        console.log(recordset.recordsets);
                    });*/
                });
                
                
            });
        });
        
    }
}

module.exports = Connection;