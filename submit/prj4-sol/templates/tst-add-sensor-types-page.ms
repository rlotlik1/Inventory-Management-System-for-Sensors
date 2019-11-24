<!DOCTYPE html>
<html>
  <head>
    <title>Adding Sensor-Type</title>
    <link rel="stylesheet" href="/css/style.css">
  </head>
  <body>
  <h1>Create/Update Sensor-Type</h1>

  

  <form method="POST">
  
<p>

</p>

  {{#fields}}
  {{#isId}}
  
  <label>
	    <span class="label">{{friendlyName}} *:</span> 
	    <input name="{{name}}" value="{{value}}">
      <ul>
      {{#errors.id}}
        <li class="error">{{{errors.id}}}</li>
      {{/errors.id}}
      </ul>
  </label>
  
  {{/isId}}

  {{#isModel}}
  
  <label>
	    <span class="label">{{friendlyName}} *:</span> 
	    <input name="{{name}}" value="{{value}}">
      <ul>
      {{#errors.modelNumber}}
        <li class="error">{{{errors.modelNumber}}}</li>
      {{/errors.modelNumber}}
      </ul>
  </label>
  
  {{/isModel}}

  {{#isManufacturer}}
  
  <label>
	    <span class="label">{{friendlyName}} *:</span> 
	    <input name="{{name}}" value="{{value}}">
      <ul>
      {{#errors.manufacturer}}
        <li class="error">{{{errors.manufacturer}}}</li>
      {{/errors.manufacturer}}
      </ul>
  </label>
  
  {{/isManufacturer}}

  {{#isMeasure}}
    
    <label>
      <span class="label"> {{friendlyName}} *:</span>
    
    <select name="{{name}}" value="{{value}}">
    {{#options}}
      <option value="{{value}}"> {{text}}</option>
    {{/options}}
    </select>
    <ul>
      {{#errors.measure}}
        <li class="error">{{{errors.measure}}}</li>
      {{/errors.measure}}
      </ul>
   </label>
  {{/isMeasure}}


    {{#isLimit}}

    <label>
      <span class="label"> {{friendlyName}} *: {{friendlyMin}} <input name="{{name}}" value="{{value}}"></span></br>
      <span class="label"> {{friendlyMax}} <input name="{{name}}" value="{{value}}"> </span>
      <ul>
      {{#errors.limits}}
        <li class="error">{{{errors.limits}}}</li>
      {{/errors.limits}}
      </ul>
    </label>
    
    {{/isLimit}}

    <br/>
	    {{#errorMessage}}
	      <span class="error">{{errorMessage}}</span><br/>
	  {{/errorMessage}}
  {{/fields}}
  <input name="submit" type="submit" value="Add">
  </form>
  {{>footer}}
  </body>
</html>