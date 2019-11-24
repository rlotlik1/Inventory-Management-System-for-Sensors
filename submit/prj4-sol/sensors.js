'use strict';

const assert = require('assert');
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const querystring = require('querystring');

const Mustache = require('./mustache');
const widgetView = require('./widget-view');

const STATIC_DIR = 'statics';
const TEMPLATES_DIR = 'templates';

function serve(port, model, base = '') {
  //@TODO

  const app = express();
  app.locals.port = port;
  app.locals.model = model;
  app.locals.base = base;
  process.chdir(__dirname);
  app.use('/', express.static(STATIC_DIR));
  setupRoutes(app);
  app.listen(port, function () {
    console.log(`listening on port ${port}`);
  });
}

module.exports = serve;

function setupRoutes(app) {
  app.get('/search-sensor-type.html', search(app, 'tst-sensor-types-search-page'));
  app.post('/search-sensor-type.html', bodyParser.urlencoded({
    extended: true
  }), doSearch(app, 'tst-sensor-types-search-page'));
  app.get('/sensor-types/add.html', create(app, 'tst-add-sensor-types-page'));
  app.post('/sensor-types/add.html', bodyParser.urlencoded({
    extended: true
  }), createUser(app, 'tst-add-sensor-types-page'));

  app.get('/sensors.html', searchSensors(app, 'tst-sensors-search'));
  app.post('/sensors.html', bodyParser.urlencoded({
    extended: true
  }), doSearchSensors(app, 'tst-sensors-search'));
  app.get('/sensors/add.html', createSensors(app, 'tst-add-sensors-page'));
  app.post('/sensors/add.html', bodyParser.urlencoded({
    extended: true
  }), createUserSensors(app, 'tst-add-sensors-page'))
}

const FIELDS_INFO = {
  id: {
    friendlyName: 'Sensor-Type Id',
    isSearch: true,
    isId: true,
    isRequired: true,
    regex: /^[A-Za-z0-9\d\-_\s]+$/,
    error: 'User Id field can only contain alphanumerics or _',
  },
  modelNumber: {
    friendlyName: 'Model Number',
    isSearch: true,
    isModel: true,
    regex: /^[A-Za-z0-9\d\-_\s]+$/,
    error: "First Name field can only contain alphabetics, -, ' or space",
  },

  manufacturer: {
    friendlyName: 'Manufacturer',
    isSearch: true,
    isManufacturer: true,
    regex: /^[A-Za-z0-9\d\-_\s]+$/,
    error: "First Name field can only contain alphabetics, -, ' or space",
  },

  measure: {
    friendlyName: 'Measure',
    isMeasure: true,
    options: [{
        value: "Select",
        text: "Select"
      },
      {
        value: "temperature",
        text: "Temperature"
      },
      {
        value: "pressure",
        text: "Pressure"
      },
      {
        value: "flow",
        text: "Flow Rate"
      },
      {
        value: "humidity",
        text: "Relative Humidity"
      },
    ]
  },

  limits: {
    friendlyName: 'Limits',
    friendlyMax: 'Limits-Max',
    friendlyMin: 'Limits-Min',
    isLimit: true,
    error: "Both Min and Max values must be numeric for 'Limits'",
    regex: /^\d+$/,

  },

  ID: {
    friendlyName: 'Sensor ID',
    isSensor: true,
    issensid:true,
    regex: /^[A-Za-z0-9\d\-_\s]+$/,
    error: "First Name field can only contain alphabetics, -, ' or space",
  },

  model: {
    friendlyName: 'Model',
    isSensor: true,
    ismodel:true,
    regex: /^[A-Za-z0-9\d\-_\s]+$/,
    error: "First Name field can only contain alphabetics, -, ' or space",
  },

  period: {
    friendlyName: 'Period',
    isSensor: true,
    isPeriod:true,
    regex: /^\d+$/,
    error: "First Name field can only contain alphabetics, -, ' or space",
  },

  expected: {
    friendlyName: 'Expected Range',
    friendlyExpMin: 'Min',
    friendlyExpMax: 'Max',
    isExp: true,
    regex: /^\d+$/,
  },
};

const FIELDS =
  Object.keys(FIELDS_INFO).map((n) => Object.assign({
    name: n
  }, FIELDS_INFO[n]));

function search(app, formId) {
  return async function (req, res) {

    const mustache = new Mustache();
    const r = await app.locals.model.list('sensor-types', req.query);

    console.log(r);
    let next = r.next;

    if (r.next !== undefined) {
      next = next.replace("zdu.binghamton.edu", "localhost");
      next = next.replace("sensor-types", "search-sensor-type.html");
      r["next"] = next;
      console.log(next);
    }

    if (r.prev !== undefined) {
      let prev = r.prev;
      prev = prev.replace("zdu.binghamton.edu", "localhost");
      prev = prev.replace("sensor-types", "search-sensor-type.html");
      r["prev"] = prev;
      console.log(prev);
    }

    const model = {
      base: app.locals.base,
      fields: FIELDS,
      result: r
    };
    const html = mustache.render(formId, model);
    res.send(html);
  };
};

function searchSensors(app, formId) {
  return async function (req, res) {

    const mustache = new Mustache();
    const r = await app.locals.model.list('sensors', req.query);

    console.log(r);
    let next = r.next;

    if (r.next !== undefined) {
      next = next.replace("zdu.binghamton.edu", "localhost");
      next = next.replace("sensors", "sensors.html");
      r["next"] = next;
      console.log(next);
    }

    if (r.prev !== undefined) {
      let prev = r.prev;
      prev = prev.replace("zdu.binghamton.edu", "localhost");
      prev = prev.replace("sensors", "sensors.html");
      r["prev"] = prev;
      console.log(prev);
    }
    const model = {
      base: app.locals.base,
      fields: FIELDS,
      result: r
    };
    const html = mustache.render(formId, model);
    res.send(html);
  };
};



function createSensors(app, formId) {
  return async function (req, res) {

    const mustache = new Mustache();
    const model = {
      base: app.locals.base,
      fields: FIELDS
    };
    const html = mustache.render(formId, model);
    res.send(html);
  };
};

function doSearch(app, formId) {

  return async function (req, res) {
    const mustache = new Mustache();
    const isSubmit = req.body.submit !== undefined;
    let users = [];
    let errors = undefined;
    const search = getNonEmptyValues(req.body);
    //console.log(search);
    if (isSubmit) {
      if (search["measure"] === "Select") {
        delete search["measure"];
      }
      if (search["measure"] !== undefined) {
        search["quantity"] = search["measure"];
        delete search["measure"];
      }
      console.log(search);


      errors = validate(search);
      const q = querystring.stringify(search);
      let data = {};
      let values = q.split("&");
      for (let i = 0; i < values.length; i++) {
        let value = values[i].split("=");
        data[value[0]] = value[1];
      }

      try {
        const r = await app.locals.model.list('sensor-types', data);
        console.log(r);
        let next = r.next;


        if (r.next !== undefined) {
          next = next.replace("zdu.binghamton.edu", "localhost");
          next = next.replace("sensor-types", "search-sensor-type.html");
          r["next"] = next;
          // console.log(next);
        }

        if (r.prev !== undefined) {
          let prev = r.prev;
          prev = prev.replace("zdu.binghamton.edu", "localhost");
          prev = prev.replace("sensor-types", "search-sensor-type.html");
          r["prev"] = prev;
          console.log(prev);
        }

      } catch (err) {
        //console.error(err);
        const model = {
          base: app.locals.base,
          fields: FIELDS,
          errors: "No Result Found"
        };
        const html = mustache.render(formId, model);
        res.send(html);
      }
    } else {
      const model = {
        base: app.locals.base,
        fields: FIELDS,
        result: r
      };
      const html = mustache.render(formId, model);
      res.send(html);
    }

  };
};

function doSearchSensors(app, formId) {

  return async function (req, res) {
    const mustache = new Mustache();
    //console.log(req.body);

    const isSubmit = req.body.submit !== undefined;
    //console.log(isSubmit);

    let users = [];
    //let errors = undefined;
    const search = getNonEmptyValues(req.body);
    search["id"] = search["ID"];
    delete search["ID"];
    //console.log(search);
    if (isSubmit) {
      //errors = validate(search);
      if (Object.keys(search).length == 0) {
        const msg = 'at least one search parameter must be specified';
        // errors = Object.assign(errors || {}, { _: msg });
      }

      const q = querystring.stringify(search);
      let data = {};
      let values = q.split("&");
      for (let i = 0; i < values.length; i++) {
        let value = values[i].split("=");
        data[value[0]] = value[1];
      }


      try {
        const r = await app.locals.model.list('sensors', data);
        //console.log(r);
        let next = r.next;


        if (r.next !== undefined) {
          next = next.replace("zdu.binghamton.edu", "localhost");
          next = next.replace("sensors", "sensors.html");
          r["next"] = next;
          //console.log(next);
        }

        if (r.prev !== undefined) {
          let prev = r.prev;
          prev = prev.replace("zdu.binghamton.edu", "localhost");
          prev = prev.replace("sensors", "sensors.html");
          r["prev"] = prev;
          // console.log(prev);
        }
        const model = {
          base: app.locals.base,
          fields: FIELDS,
          result: r
        };
        const html = mustache.render(formId, model);
        res.send(html);
      } catch (err) {

        if (err.status === 400) {

          const model = {
            base: app.locals.base,
            fields: FIELDS,
            period: "The Period field must be an integer"
          };

          const html = mustache.render(formId, model);
          res.send(html);
        } else {
          const str = "No Result Found";
          const model = {
            base: app.locals.base,
            fields: FIELDS,
            errors: str
          };
          const html = mustache.render(formId, model);
          res.send(html);
        }

      }
    } else {
      const model = {
        base: app.locals.base,
        fields: FIELDS,
        result: r
      };
      const html = mustache.render(formId, model);
      res.send(html);
    }



    // res.redirect(`${app.locals.base}/sensors.html`);
  };
};


function create(app, formId) {
  return async function (req, res) {

    const mustache = new Mustache();
    const model = {
      base: app.locals.base,
      fields: FIELDS
    };
    const html = mustache.render(formId, model);
    res.send(html);
  };
};

function createUser(app, formId) {
  return async function (req, res) {
    const mustache = new Mustache();
    const user = getNonEmptyValues(req.body);
    let errors = validate(user, ['id', 'modelNumber', 'manufacturer', 'measure', 'limits']);
    console.log(errors);
    let min = user.limits[0];
    let max = user.limits[1];
    user.limits = {
      "min": min,
      "max": max
    };
    user["unit"] = "unit";
    user["quantity"] = user["measure"];

    if (user["quantity"] === "Select") {
      delete user["quantity"];

    }
    console.log(user);
    if (errors === {}) {
      await app.locals.model.update('sensor-types', user);

      res.redirect(`${app.locals.base}/search-sensor-type.html?id=` + user.id);
    } else {
      console.log(errors);
      const model = {
        base: app.locals.base,
        fields: FIELDS,
        errors: errors
      };
      const html = mustache.render(formId, model);
      res.send(html);

    }
  };
};

function createUserSensors(app, formId) {
  return async function (req, res) {
    const mustache=new Mustache();
    const user = getNonEmptyValues(req.body);

    user["id"] = user["ID"];
    delete user["ID"];
    console.log(user);
    let errors=validateSensor(user,['id','model','period','expected']);
    
    let min = user.expected[0];
    let max = user.expected[1];
    user.expected = {
      "min": min,
      "max": max
    };
    console.log(user);
    console.log("down");
    console.log(errors);
    
    //console.log(user);

    if(Object.keys(errors).length === 0){
      console.log("hhhhh");
    await app.locals.model.update('sensors', user);

    res.redirect(`${app.locals.base}/sensors.html?id=` + user.id);
    }
    else{
      const model = {
        base: app.locals.base,
        fields: FIELDS,
        errors: errors
      };
      const html=mustache.render(formId,model);
      res.send(html);
    }
  };
};



function getNonEmptyValues(values) {
  const out = {};
  Object.keys(values).forEach(function (k) {
    if (FIELDS_INFO[k] !== undefined) {
      const v = values[k];
      if (Array.isArray(v)) {
        var v1 = [];
        v1.push(v[0].trim());
        v1.push(v[1].trim());
        out[k] = v1;
      } else {
        if (v && v.trim().length > 0) out[k] = v.trim();
      }
    }
  });
  return out;
}

function validate(values, requires = []) {
  const errors = {};
  requires.forEach(function (name) {
    if (values[name] === undefined) {
      errors[name] =
        `A value for '${FIELDS_INFO[name].friendlyName}' must be provided`;
    } else if (values[name] === 'Select') {
      errors[name] =
        `A value for '${FIELDS_INFO[name].friendlyName}' must be provided`;
    } else if (Array.isArray(values[name])) {
      if (values[name][0] === '' || values[name][1] === '') {
        errors["limits"] =
          'Both Min and Max values must be specified for Limits';
      }
    }
  });
  for (const name of Object.keys(values)) {
    //console.log(name);
    const fieldInfo = FIELDS_INFO[name];
    const value = values[name];
    console.log(value);
    if (name === 'measure') {} else if (name === 'limits') {
      if (fieldInfo.regex && (!value[0].match(fieldInfo.regex) || !value[0].match(fieldInfo.regex))) {
        errors["limits"] = fieldInfo.error;
      }
    } else if (fieldInfo.regex && !value.match(fieldInfo.regex)) {
      errors[name] = fieldInfo.error;
    }
  }
  return errors;
}

function validateSensor(values, requires = []) {
  
  const errors = {};
  requires.forEach(function (name) {
    
    if (values[name] === undefined) {
      
      errors[name] =
        `A value for '${FIELDS_INFO[name].friendlyName}' must be provided`;
    } 
    else if (Array.isArray(values[name])) {
      
      if (values[name][0] === '' || values[name][1] === '') {
        errors["expected"] =
          'Both Min and Max values must be specified for Expected';
      }
    }
  });
  for (const name of Object.keys(values)) {
    console.log(name);
    const fieldInfo = FIELDS_INFO[name];
    console.log("here");
    console.log(fieldInfo);
    const value = values[name];
    console.log(value);
    if (name === 'expected') {
      console.log("1");
      if (fieldInfo.regex && (!value[0].match(fieldInfo.regex) || !value[0].match(fieldInfo.regex))) {
        console.log("2");
        errors["expected"] = fieldInfo.error;
        
      }
    }
    else if(name==='id')
    {
      if(fieldInfo.regex && !value.match(fieldInfo.regex))
      {
        errors[name]=fieldInfo.error;
      }
    }
     else if (fieldInfo.regex && !value.match(fieldInfo.regex)) {
      console.log("in");
      errors[name] = fieldInfo.error;
    }
  }
  return errors;
}


function fieldsWithValues(values, errors = {}) {
  return FIELDS.map(function (info) {
    const name = info.name;
    const extraInfo = {
      value: values[name]
    };
    if (errors[name]) extraInfo.errorMessage = errors[name];
    return Object.assign(extraInfo, info);
  });
}

//@TODO