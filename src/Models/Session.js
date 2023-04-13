const electron = require('electron');
const fetch = require("node-fetch");
const fs = require('fs');

const Config = require("./Config");


class Session{

    constructor(email, pass){
        this.email = email;
        this.username = "";
        this.password = pass;
        this.token = null;
    }

    async login(){
        let config = new Config();
        const body = { email: config.apiUser, password: config.apiPass };
        console.log(body);
         let response = await fetch(config.apiServer+'/api/login', {
            method: 'post',
            body:    JSON.stringify(body),
            headers: { 'Content-Type': 'application/json' },
        })

        let json = await response.json();
        
        if(json.status == 'ok'){
            this.token = json.token;
			console.log(this.token);
            return true;
        }else{
            this.token = false;
            return false;
        }
            
    }

    async logout(){
        let config = new Config();
        const body = { token: this.token };
        let response = await fetch(config.apiServer+'/api/logout', {
            method: 'post',
            body:    JSON.stringify(body),
            headers: { 'Content-Type': 'application/json' },
        })
    }

    getToken(){

    }
}

module.exports = Session;