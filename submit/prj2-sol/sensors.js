'use strict';

const AppError = require('./app-error');
const validate = require('./validate');

const assert = require('assert');
const mongo = require('mongodb').MongoClient;

class Sensors {


  /** Return a new instance of this class with database as
   *  per mongoDbUrl.  Note that mongoDbUrl is expected to
   *  be of the form mongodb://HOST:PORT/DB.
   */
  static async newSensors(mongoDbUrl) {
    //@TODO
    
    const url=mongoDbUrl;
    const reg=url.match(/(\w+):\/\/([^/]+)(.*)/);
    const [_,s,base,dbname]=reg;
    const dbase=dbname.slice(1);
    const client=await mongo.connect(mongoDbUrl,MONGO_OPTIONS);
    if(client.isConnected())
    {
      console.log("Connected");
    }
    return new Sensors(base,client,dbase);    
  }

  constructor(base,client,dbase)
  {
    this.base=base;
    this.client=client;
    const dbConnection=client.db(dbase);
    for(const [k,v] of Object.entries(COLLECTIONST))
    {
      this[k]=dbConnection.collection(v);
    }

    for(const [k,v] of Object.entries(COLLECTIONS))
    {
      this[k]=dbConnection.collection(v);
    }

    for(const [k,v] of Object.entries(COLLECTIONSD))
    {
      this[k]=dbConnection.collection(v);
    }
  }

  /** Release all resources held by this Sensors instance.
   *  Specifically, close any database connections.
   */
  async close() {
    //@TODO
    await this.client.close();  
  }

  /** Clear database */
  async clear() {
    //@TODO
    for(const [k,v] of Object.entries(COLLECTIONST))
    {
      await this[k].deleteMany({});
    }
    for(const [k,v] of Object.entries(COLLECTIONS))
    {
      await this[k].deleteMany({});
    }
    for(const [k,v] of Object.entries(COLLECTIONSD))
    {
      await this[k].deleteMany({});
    }
    return {};
  }

  /** Subject to field validation as per validate('addSensorType',
   *  info), add sensor-type specified by info to this.  Replace any
   *  earlier information for a sensor-type with the same id.
   *
   *  All user errors must be thrown as an array of AppError's.
   */
  async addSensorType(info) {
    const sensorType = validate('addSensorType', info);
    var check=await this.sensorType.findOne({_id:sensorType.id});

    if(!check)
    {
      for(const [k,v] of Object.entries(COLLECTIONST))
      {
        await this[k].insertOne({_id:sensorType.id,sensorType});
      }
    }

    else{
      for(const [k,v] of Object.entries(COLLECTIONST))
      {
        await this[k].updateOne({_id:sensorType.id},{$set:{sensorType}});
      }
    }
    //@TODO
  }
  
  /** Subject to field validation as per validate('addSensor', info)
   *  add sensor specified by info to this.  Note that info.model must
   *  specify the id of an existing sensor-type.  Replace any earlier
   *  information for a sensor with the same id.
   *
   *  All user errors must be thrown as an array of AppError's.
   */
  async addSensor(info) {
    const sensor = validate('addSensor', info);
    //@TODO

    var checkSensor=await this.sensor.findOne({_id:sensor.id});

    if(!checkSensor)
    {
      for(const [k,v] of Object.entries(COLLECTIONS))
      {
        await this[k].insertOne({_id:sensor.id,sensor});
      }
    }
    else{

      for(const [k,v] of Object.entries(COLLECTIONS))
      {
        await this[k].updateOne({_id:sensor.id},{$set:{sensor}});
      }

    }
  }

  /** Subject to field validation as per validate('addSensorData',
   *  info), add reading given by info for sensor specified by
   *  info.sensorId to this. Note that info.sensorId must specify the
   *  id of an existing sensor.  Replace any earlier reading having
   *  the same timestamp for the same sensor.
   *
   *  All user errors must be thrown as an array of AppError's.
   */
  async addSensorData(info) {
    const sensorData = validate('addSensorData', info);
    //@TODO

    var checkData=await this.sensorData.findOne({_id:sensorData.sensorId});

    if(!checkData)
    {
      for(const [k,v] of Object.entries(COLLECTIONSD))
      {
        await this[k].insertOne({_id:sensorData.sensorId,sensorData});
      }
    }
    else{

      for(const [k,v] of Object.entries(COLLECTIONSD))
      {
        await this[k].updateOne({_id:sensorData.sensorId},{$set:{sensorData}});
      }
    }
  }

  /** Subject to validation of search-parameters in info as per
   *  validate('findSensorTypes', info), return all sensor-types which
   *  satisfy search specifications in info.  Note that the
   *  search-specs can filter the results by any of the primitive
   *  properties of sensor types (except for meta-properties starting
   *  with '_').
   *
   *  The returned value should be an object containing a data
   *  property which is a list of sensor-types previously added using
   *  addSensorType().  The list should be sorted in ascending order
   *  by id.
   *
   *  The returned object will contain a lastIndex property.  If its
   *  value is non-negative, then that value can be specified as the
   *  _index meta-property for the next search.  Note that the _index
   *  (when set to the lastIndex) and _count search-spec
   *  meta-parameters can be used in successive calls to allow
   *  scrolling through the collection of all sensor-types which meet
   *  some filter criteria.
   *
   *  All user errors must be thrown as an array of AppError's.
   */
  async findSensorTypes(info) {
    //@TODO
    const searchSpecs = validate('findSensorTypes', info);
    var example={};
    for(var key in searchSpecs)
    {
      if(!(key==="_index"||key==="_count"))
      {
        if(key==="id")
        {
          if(searchSpecs.id!==null)
            example[key]=searchSpecs[key];
        }
        else if(key==="limits")
        {
          if(searchSpecs[key]['min']!==undefined)
            example['limits.min']=Number(searchSpecs[key]["min"]);
          if(searchSpecs[key]['max']!==undefined)
            example['limits.max']=Number(searchSpecs[key]["max"]);
        }
        else
          example[key]=searchSpecs[key];
      }
    }

    console.log(example);
    
    var sr = {};
    for(const key in example)
    {
      var k = "sensorType."+key;
      sr[k] = example[key];
    }
    var counting= await this.sensorType.find(sr).count();
    var search=await this.sensorType.find(sr).skip(searchSpecs._index).limit(searchSpecs._count).toArray();

    return { data: [search], nextIndex:  counting>searchSpecs._index+searchSpecs._count?searchSpecs._index+searchSpecs._count:-1};
  }
  
  /** Subject to validation of search-parameters in info as per
   *  validate('findSensors', info), return all sensors which satisfy
   *  search specifications in info.  Note that the search-specs can
   *  filter the results by any of the primitive properties of a
   *  sensor (except for meta-properties starting with '_').
   *
   *  The returned value should be an object containing a data
   *  property which is a list of all sensors satisfying the
   *  search-spec which were previously added using addSensor().  The
   *  list should be sorted in ascending order by id.
   *
   *  If info specifies a truthy value for a _doDetail meta-property,
   *  then each sensor S returned within the data array will have an
   *  additional S.sensorType property giving the complete sensor-type
   *  for that sensor S.
   *
   *  The returned object will contain a lastIndex property.  If its
   *  value is non-negative, then that value can be specified as the
   *  _index meta-property for the next search.  Note that the _index (when 
   *  set to the lastIndex) and _count search-spec meta-parameters can be used
   *  in successive calls to allow scrolling through the collection of
   *  all sensors which meet some filter criteria.
   *
   *  All user errors must be thrown as an array of AppError's.
   */
  async findSensors(info) {
    //@TODO
    const searchSpecs = validate('findSensors', info);
    var exampleSensor={};
    for(var key in searchSpecs)
    {
      if(!(key==="_index"||key==="_count"||key==="_doDetail"))
      {
        if(key==="id")
        {
          if(searchSpecs.id!==null)
          {
            exampleSensor[key]=searchSpecs[key];
          }
          
        }
        else if(key==="period")
        {
          exampleSensor[key]=Number(searchSpecs[key]);
        }

        else if(key==="expected")
        {
          if(searchSpecs[key]['min']!==undefined)
          {
            exampleSensor['expected.min']=Number(searchSpecs[key]['min']);
          }
          if(searchSpecs[key]['max']!==undefined)
          {
            exampleSensor['expected.max']=Number(searchSpecs[key]['max']);
          }


        }
        else
          exampleSensor[key]=searchSpecs[key];
      }
    }
    var sr = {};
    for(const key in exampleSensor)
    {
      var k = "sensor."+key;
      sr[k] = exampleSensor[key];
    }
    var counting= await this.sensor.find(sr).count();
    var search=await this.sensor.find(sr).skip(searchSpecs._index).limit(searchSpecs._count).toArray();
    for(key in searchSpecs)
    {
      
      if(key==="_doDetail" && searchSpecs._doDetail==="true")
      {
        var searchType=await this.sensorType.findOne({'sensorType.id' : search[0]["sensor"]["model"]});
      }
    }

    return { data: [search,searchType], nextIndex:  counting>searchSpecs._index+searchSpecs._count?searchSpecs._index+searchSpecs._count:-1};
  }
  
  /** Subject to validation of search-parameters in info as per
   *  validate('findSensorData', info), return all sensor readings
   *  which satisfy search specifications in info.  Note that info
   *  must specify a sensorId property giving the id of a previously
   *  added sensor whose readings are desired.  The search-specs can
   *  filter the results by specifying one or more statuses (separated
   *  by |).
   *
   *  The returned value should be an object containing a data
   *  property which is a list of objects giving readings for the
   *  sensor satisfying the search-specs.  Each object within data
   *  should contain the following properties:
   * 
   *     timestamp: an integer giving the timestamp of the reading.
   *     value: a number giving the value of the reading.
   *     status: one of "ok", "error" or "outOfRange".
   *
   *  The data objects should be sorted in reverse chronological
   *  order by timestamp (latest reading first).
   *
   *  If the search-specs specify a timestamp property with value T,
   *  then the first returned reading should be the latest one having
   *  timestamp <= T.
   * 
   *  If info specifies a truthy value for a doDetail property, 
   *  then the returned object will have additional 
   *  an additional sensorType giving the sensor-type information
   *  for the sensor and a sensor property giving the sensor
   *  information for the sensor.
   *
   *  Note that the timestamp search-spec parameter and _count
   *  search-spec meta-parameters can be used in successive calls to
   *  allow scrolling through the collection of all readings for the
   *  specified sensor.
   *
   *  All user errors must be thrown as an array of AppError's.
   */
  async findSensorData(info) {
    //@TODO
    const searchSpecs = validate('findSensorData', info);
    console.log(searchSpecs);
    var example={};
    for(var key in searchSpecs)
    {
      console.log(key);
      if(!(key==="_count"))
      {
        if(key==="id")
        {
          if(searchSpecs.sensorId!==null)
            example[key]=searchSpecs[key];
        }
        else
          example[key]=searchSpecs[key];
      }
    }
    var sr = {};
    for(const key in example)
    {
      var k = "sensorData."+key;
      sr[k] = example[key];
    }
    var counting= await this.sensorData.find(sr).count();
    console.log(counting);
    var search=await this.sensorData.find(sr).limit(searchSpecs._count).toArray();

    return { data: [search], nextIndex:  counting>searchSpecs._index+searchSpecs._count?searchSpecs._index+searchSpecs._count:-1};
  
  }

  
  
} //class Sensors

module.exports = Sensors.newSensors;

const COLLECTIONST={
  sensorType:'sensorT'
};

const COLLECTIONS={
  sensor:'sensor',
};

const COLLECTIONSD={
  sensorData:'sensorData'
};


//Options for creating a mongo client
const MONGO_OPTIONS = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};


function inRange(value, range) {
  return Number(range.min) <= value && value <= Number(range.max);
}
