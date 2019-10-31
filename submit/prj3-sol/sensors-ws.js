const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');
const AppError = require('./app-error');

const OK = 200;
const CREATED = 201;
const BAD_REQUEST = 400;
const NOT_FOUND = 404;
const CONFLICT = 409;
const SERVER_ERROR = 500;

function serve(port, sensors) {
  //@TODO set up express app, routing and listen
  const app=express();
  app.locals.port=port;
  app.locals.model=sensors;
  setupRoutes(app);
  app.listen(port,function(){
    console.log(`Listening on port ${port}`);
  });
}

module.exports = { serve:serve};

function setupRoutes(app)
{
  app.use(cors());
  app.use(bodyParser.json());
  app.get('/sensor-types',async function(req,res){

    const q=req.query || {};
    try{
      const results= await app.locals.model.findSensorTypes(q);
    
      const self1=requestUrl(req);
      const check="http://"+req.headers.host+"/sensor-types";
      results.self=self1;

      for(var i=0;i<results.data.length;i++)
      {
          results.data[i].self=check+"/"+results.data[i].id;
      }

      if(results.nextIndex!==-1 && q._count!==undefined)
      {
        results.next=check+"?_index="+results.nextIndex+"&_count="+q._count;
      } 
      else if(results.nextIndex!==-1){
      
        results.next=check+"?_index="+results.nextIndex;
      }
      

      if(q._index!==undefined && q._count!==undefined)
      {
        const val=q._index-q._count;
        results.prev=check+"?_index="+val+"&_count="+q._count;
      }
      res.json(results);

    }
    catch(err)
    {
      const mapped=mapError(err);
      res.status(mapped.status).json(mapped);
    }
  });

  app.get('/sensor-types/:id',async function(req,res){

    try{
      const id=req.params.id;
      const self1=requestUrl(req);

      const check="http://"+req.headers.host+"/sensor-types";
      var flag=-1;
      var v=0;
      const results=await app.locals.model.findSensorTypes({id:id});
      results.self=self1;

        const c=results.data;
        for(var i=0;i<c.length;i++)
        {
         
          if(c[i].id === id)
            {
              flag = i;
              v = c[i];
              break;
            }
        }

        if(flag!==-1)
        {
          const data = {
            "data" : [v]
            }
            for(var i=0;i<results.data.length;i++)
            {   
                results.data[i].self=check+"/"+id;
            }
            data.self=self1;
            data.nextIndex=-1;
            res.json(data);
        }

        else{
          
          const err1={
            "errors":[{
              code:NOT_FOUND,
              message:`no data for sensor-type id ${id}`
            }]
          }
          res.json(err1);
          

        }
        
    }
    catch(err)
    {
      res.status(404).send(err);
    }
  });

  app.get('/sensors',async function(req,res){

    const q=req.query || {};
    
    try{
      const results=await app.locals.model.findSensors(q);
      const self1=requestUrl(req);
      const check="http://"+req.headers.host+"/sensors";
      results.self=self1;

      if(results.nextIndex!==-1 && q._count!==undefined)
      {
        
          results.next=self1+"?_index="+results.nextIndex+"&_count="+q._count;
      }

        else if(results.nextIndex!==-1){
          results.next=self1+"?_index="+results.nextIndex;
        }
      

      for(var i=0;i<results.data.length;i++)
      {
          results.data[i].self=check+"/"+results.data[i].id;
      }

      if(q._index!==undefined && q._count!==undefined)
      {
        const val=q._index-q._count;
        results.prev=check+"?_index="+val+"&_count="+q._count;
      }
      res.json(results);
    }
    catch(err)
    {
      const mapped=mapError(err);
      res.status(mapped.status).json(mapped);
    }

  });

  app.get('/sensors/:id',async function(req,res){

    try{
      const id=req.params.id;
      const self1=requestUrl(req);
      const check="http://"+req.headers.host+"/sensors";
      const results=await app.locals.model.findSensors({id:id});
      results.self=self1;
      for(var i=0;i<results.data.length;i++)
      {
          results.data[i].self=check+"/"+results.data[i].id;
      }
      res.json(results);
    }
    catch(err)
    {
      const mapped=mapError(err);
      res.status(mapped.status).json(mapped);
    }
  });

  app.post('/sensor-types',async function(req,res){

    try{
      const obj=req.body;
      const results=await app.locals.model.addSensorType(obj);
      res.append('Location',requestUrl(req) + '/' +results);
      res.sendStatus(CREATED);
    }
    catch(err)
    {
      const mapped=mapError(err);
      res.status(mapped.status).json(mapped);
    }
  });

  app.post('/sensors',async function(req,res){

    try{
      const obj=req.body;
      const results=await app.locals.model.addSensor(obj);
      res.append('Location',requestUrl(req) + '/' +results);
      res.sendStatus(CREATED);
    }
    catch(err){
      const mapped=mapError(err);
      res.status(mapped.status).json(mapped);
    }
  });

  app.post('/sensor-data/:sensorId',async function(req,res){

    try{
      const obj=req.body;
      for(var k in obj)
      {
        req.params[k]=obj[k];
      }
      const senData=req.params;
      console.log(senData);
      const results=await app.locals.model.addSensorData(senData);
      res.append('Location',requestUrl(req) + '/' +req.params.timestamp);
      res.sendStatus(CREATED);
    }
    catch(err)
    {
      const mapped=mapError(err);
      res.status(mapped.status).json(mapped);
    }
  });

  app.get('/sensor-data/:sensorId',async function(req,res){

    try{
      const id=req.params.sensorId;
      const self1=requestUrl(req);
      const check="http://"+req.headers.host+"/sensor-data";

      for(var k in req.query)
      {
        req.params[k]=req.query[k];
      }

      const q=req.params;
      var results=await app.locals.model.findSensorData(q);
      results.self=self1;
      for(var i=0;i<results.data.length;i++)
      {
          results.data[i].self=check+"/"+results.data[i].timestamp;
      }
      res.json(results);
    }
    catch(err){
      const mapped=mapError(err);
      res.status(mapped.status).json(mapped);
    }
  });

  app.get('/sensor-data/:SensorId/:times',async function(req,res){

    try{

        const id=req.params.SensorId;
        const timestamp1=parseInt(req.params.times);
        var flag=-1;
        var v=0;
        const self1=requestUrl(req);
        const check="http://"+req.headers.host+"/sensor-data";

        const results=await app.locals.model.findSensorData({sensorId:id,timestamp:timestamp1});
        const c=results.data;
        for(var i=0;i<c.length;i++)
        {
         
          if(c[i].timestamp === timestamp1)
            {
              flag = i;
              v = c[i];
              break;
            }
        }

        if(flag!==-1)
        {
          const data = {
            "data" : [v]
            }
            for(var i=0;i<results.data.length;i++)
            {   
                results.data[i].self=check+"/"+results.data[i].timestamp;
            }
            data.self=self1;
            data.nextIndex=-1;
            res.json(data);
        }

        else{
          const err1={
            "errors":[{
              code:NOT_FOUND,
              message:`no data for timestamp ${timestamp1}`
            }]
          }
          //res.json(err1);
          res.status(404).send(err1);

        }
        
    }
    catch(err){
      const mapped=mapError(err);
      res.status(mapped.status).json(mapped);
    }
  });

  app.use(doErrors());
 
}

function doErrors(app){
  return async function(err,req,res,next){
    res.status(SERVER_ERROR);
    res.json({code:'SERVER_ERROR',message:err.message});
    console.log(err);
  };
}


//@TODO routing function, handlers, utility functions

const ERROR_MAP={
  EXISTS:CONFLICT,
  NOT_FOUND:NOT_FOUND
}

function mapError(err){
  console.log(err);
  return err.isDomain
    ?{status:(ERROR_MAP[err.errorCode] || BAD_REQUEST),
    code:err.errorCode,
    message:err.message
  }
  : {status:SERVER_ERROR,
    code:'INTERNAL',
    message:err.toString()
  };
}

function requestUrl(req){
  const port=req.app.locals.port;
  return `${req.protocol}://${req.hostname}:${port}${req.originalUrl}`;
}


/*
function errorWrap(handler) {
  return async (req, res, next) => {
    try {
      await handler(req, res, next);
    }
    catch (err) {
      next(err);
    }
  };
}*/