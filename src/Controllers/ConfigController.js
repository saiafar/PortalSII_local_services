const path = require('path');
const Config = require('../Models/Config.js');



class ConfigController{
    constructor(){
        this.viewsPath = path.join(__dirname, '../views');
    }

    configStorage(req, res){
        let config = new Config();

        config.sqlServer = req.query.sql_server;
        config.sqlUser = req.query.sql_user;
        config.sqlPass = req.query.sql_pass;
        config.sqlDatabase = req.query.sql_database;
        config.sqlPort = req.query.sql_port; 

        config.apiServer = req.query.api_server;
        config.apiUser = req.query.api_user;
        config.apiPass = req.query.api_pass;

        config.save();
        this.config(req, res);
    }

    config(req, res){
        let config = new Config();
        res.render(path.join(this.viewsPath,'config/config.ejs'), {config: config});    
    }
}

module.exports = ConfigController;