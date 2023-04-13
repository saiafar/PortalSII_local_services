const {app, BrowserWindow, Menu, Tray} = require('electron');
const express =  require('express');
const appex = express();
const url = require('url');
const path = require('path');
const fs = require('fs');
const fetch = require('node-fetch')
const http = require('http')


var os = require("os");

const Server = require('./server.js');
const VentaController = require('./Controllers/VentaController.js');

const userDataPath = app.getPath('userData');
try {
    fs.statSync(path.join(userDataPath, 'data'));
} catch(e) {
    fs.mkdirSync(path.join(userDataPath, 'data'));
}

let mainWindow = null;
let tray = null;



function sendServices(){
    let vent = new VentaController();
    vent.send();
    setTimeout(sendServices, 300000);
}



app.on('ready', () => {

    sendServices();
    


    serExpress = new Server();
    tray = new Tray(path.join(__dirname, 'icon','logo_slack.png'))
    
    const contextMenu = Menu.buildFromTemplate([
        { label: 'Configuracion', click:function(){
            mainWindow.show();
        }},
        { label: 'Salir',  click:function(){
            process.exit();
        }}
    ])
    tray.setToolTip('PortalWeb')
    tray.setContextMenu(contextMenu)
    
    
    mainWindow = new BrowserWindow({show:false})
    mainWindow.loadURL('http://localhost:3000/config');

    mainWindow.on('minimize', function(event){
        event.preventDefault();
        mainWindow.hide();
    })

    mainWindow.on('close', function(event){
        if(!app.isQuiting){
            event.preventDefault();
            mainWindow.hide();
        }

        return false;
    })

});