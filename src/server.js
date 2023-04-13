const express =  require('express');

const url = require('url');
const path = require('path');
const ConfigController = require('./Controllers/ConfigController');


class Server{
    constructor(){
        this.appex = express();
        //let appex=null
        this.server = null
        

        this.startExpress();
        this.routes();
    }

    startExpress(){
        //settings
        this.appex.set('port', process.env.PORT || 3000);

        this.server = this.appex.listen(this.appex.get('port'), () => {
            console.log('server on port', this.appex.get('port'));
        })
    }

    routes(){
        this.appex.use(express.static(path.join(__dirname, 'public')));

        this.appex.get('/config', (req, res) => {
            let control = new ConfigController();
            control.config(req, res);
        });

        this.appex.get('/config/save', (req, res) => {
            let control = new ConfigController();
            control.configStorage(req, res);
        });
    }

    

}

module.exports = Server;