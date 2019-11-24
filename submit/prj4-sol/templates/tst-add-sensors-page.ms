Hello, Unregistered 
 
New sheet
<!DOCTYPE html>
<html>
  <head>
    <title>Adding Sensors</title>
    <link rel="stylesheet" href="/css/style.css">
  </head>
  <body>
  <h1>Create/Update Sensors</h1>

 

    <form method="POST">
    
  {{#fields}}
  {{#issensid}}
  
  <label>
	    <span class="label">{{friendlyName}} *:</span> 
	    <input name="{{name}}" value="{{value}}">
      {{#errors.ID}}
        <li class="error">{{{errors.ID}}}</li>
      {{/errors.ID}}
  </label>
  
  {{/issensid}}

  {{#ismodel}}
  
  <label>
	    <span class="label">{{friendlyName}} *:</span> 
	    <input name="{{name}}" value="{{value}}">
      {{#errors.model}}
        <li class="error">{{{errors.model}}}</li>
      {{/errors.model}}
  </label>
  
  {{/ismodel}}

  {{#isPeriod}}
  
  <label>
	    <span class="label">{{friendlyName}} *:</span> 
	    <input name="{{name}}" value="{{value}}">
      {{#errors.period}}
        <li class="error">{{{errors.period}}}</li>
      {{/errors.period}}
  </label>
  
  {{/isPeriod}}

  {{#isExp}}

  <label>
      <span class="label"> {{friendlyName}} *: {{friendlyExpMin}} <input name="{{name}}" value="{{value}}"></span></br>
      <span class="label"> {{friendlyExpMax}} <input name="{{name}}" value="{{value}}"> </span>
    </label>

    {{#errors.expected}}
        <li class="error">{{{errors.expected}}}</li>
      {{/errors.expected}}

  {{/isExp}}
   

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
The file is too large. Can arise problems with preservation and synchronization.
Continue anyway?
Are you sure you want to delete this sheet?
All data will be deleted. Really get out?

 