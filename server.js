const http = require("http");
const express = require('express');
const bodyParser = require('body-parser');
const Sequelize = require('sequelize');

/**
 * init orm using sqlite db
 */
const seqPG = new Sequelize('devicedb', null, null, {
  dialect: 'sqlite',
  storage: './device.sqlite'
});

const app = express();

/**
 * allow json parsing post request
 */
function initRequestBody(app, bodyParser){
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({
    extended: true
  }));
}

/**
 * access controls
 */
function initHttpHeader(app){
  app.use(function(request, response, next) {
    response.header("Access-Control-Allow-Origin", "*");
    response.header("Access-Control-Allow-Methods", "*");  
    response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
  });  
}

/**
 * init REST endpoints
 */
function initAPIRoutes(app, seq){
  
  ['device'].map((r)=>{
    return require('./routes/'+r)(
      app,
      seq
    );
  });

  seq.seqPG.sync();

}

/**
 * init functions
 */
async function bootStrap(){
  
  try{
    await seqPG.authenticate();
  }catch(e){
    console.error('Database cannot connect');
    return;
  }

  initRequestBody(app, bodyParser);
  initHttpHeader(app);
  initAPIRoutes(app, {Sequelize: Sequelize, seqPG: seqPG});

  const server = app.listen(3000, "127.0.0.1", ()=>{
    console.log(`server running ${server.address().address} : ${server.address().port}`);
  });  

}


/**
 * main entry when server runs
 */
bootStrap();







