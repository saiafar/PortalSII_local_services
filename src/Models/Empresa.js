const SQL = require("mssql");
const Config = require("./Config");

class Empresa{
    constructor(){
        this.rut = null;
        this.razon_social = null;
        this.giro = null;
        this.nombre_comercial = null;
        this.direccion = null;
        this.comuna = null;
        this.ciudad = null;
    }

    async getData(){
        try{
            let config = new Config();
            await SQL.connect({  
                server: config.sqlServer,  //update me
                user: config.sqlUser, //update me
                password: config.sqlPass,
                database: config.sqlDatabase,
                port: config.sqlPort,
                options:{
                    enableArithAbort: false
                }});
            let opciones = await SQL.query(`SELECT Nombre, Valor
                                            FROM Opciones 
                                            Where Nombre = 'EMPRESA_RUT' 
                                            OR Nombre = 'EMPRESA_RAZON_SOCIAL' 
                                            OR Nombre = 'EMPRESA_GIRO' 
                                            OR Nombre = 'EMPRESA_NOMBRE_COMERCIAL' 
                                            OR Nombre = 'EMPRESA_DIRECCION' 
                                            OR Nombre = 'EMPRESA_COMUNA' 
                                            OR Nombre = 'EMPRESA_CIUDAD' `);

            opciones.recordsets[0].forEach(row => {
                if(row.Nombre == 'EMPRESA_RUT'){
                    this.rut = row.Valor;
                }else if(row.Nombre == 'EMPRESA_RAZON_SOCIAL'){
                    this.razon_social = row.Valor;
                }else if(row.Nombre == 'EMPRESA_GIRO'){
                    this.giro = row.Valor;
                }else if(row.Nombre == 'EMPRESA_NOMBRE_COMERCIAL'){
                    this.nombre_comercial = row.Valor;
                }else if(row.Nombre == 'EMPRESA_DIRECCION'){
                    this.direccion = row.Valor;
                }else if(row.Nombre == 'EMPRESA_COMUNA'){
                    this.comuna = row.Valor;
                }else if(row.Nombre == 'EMPRESA_CIUDAD'){
                    this.ciudad = row.Valor;
                }
            });
        }catch(err){
            console.log(err);
        }
    }

    getJson(){
        return {
            rut: this.rut,
            giro: this.giro,
            razonsocial:this.razon_social,
            nombrecomercial:this.nombre_comercial,
            direccion:this.direccion,
            comuna:this.comuna,
            ciudad:this.ciudad
        }
    }

    

}

module.exports = Empresa;