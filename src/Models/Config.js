const electron = require('electron');
const path = require('path');
const userDataPath = electron.app.getPath('userData');
const fs = require('fs');

class Config{
    constructor(){
        this.filename = 'config.json';
        this.dataDirectory = path.join(userDataPath, 'data');
        this.sqlServer = 'DESKTOP-QM4E7LR\\PORTALWEB';
        this.sqlUser = 'sa';
        this.sqlPass = 'portal';
        this.sqlDatabase = 'PuntoVenta';
        this.sqlPort = 1433; 

        this.apiServer = "http://boletas.local:8081";
        this.apiUser = "saiafar@gmail.com";
        this.apiPass = "123456789";

        this.get();
    }

    write(data){
        fs.writeFileSync(path.join(this.dataDirectory, this.filename), JSON.stringify(data));
    }

    read(filename){
        if (fs.existsSync(path.join(this.dataDirectory, this.filename))) {
            let data = fs.readFileSync(path.join(this.dataDirectory, this.filename), "utf8");
            data = (data != '')?JSON.parse(data):'';
            return data;
        }else{
            return false
        }
    }

    get(){
        let data;
        console.log('config.get');
		if(data = this.read(this.filename)){
            console.log('config.get - 2');
            this.sqlServer = data.sqlServer;
            this.sqlUser = data.sqlUser;
            this.sqlPass = data.sqlPass;
            this.sqlDatabase = data.sqlDatabase;
            this.sqlPort = data.sqlPort; 

            this.apiServer = data.apiServer;
            this.apiUser = data.apiUser;
            this.apiPass = data.apiPass;
        }
    }

    save(){
        this.data = {
            sqlServer: this.sqlServer,
            sqlUser: this.sqlUser,
            sqlPass: this.sqlPass,
            sqlDatabase: this.sqlDatabase,
            sqlPort: this.sqlPort,
            apiServer: this.apiServer,
            apiUser: this.apiUser,
            apiPass: this.apiPass,
        }
        this.write(this.data);
    }
}

module.exports = Config;