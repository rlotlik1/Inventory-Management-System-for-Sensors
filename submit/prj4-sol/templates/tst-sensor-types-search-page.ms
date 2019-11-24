<!DOCTYPE html>
<html>
  <head>
    <title>Searching Sensor-Type</title>
    <link rel="stylesheet" href="/css/style.css">
  </head>
  <body>
  <h1>Search Sensor Type</h1>
  
  <ul>
      {{#errors}}
        <li class="error">{{.}}</li>
      {{/errors}}
  </ul>
  <form method="POST">
   <p>
	 
   </p>
  {{#fields}}
  {{#isSearch}}
  
  <label>
	    <span class="label">{{friendlyName}}:</span> 
	    <input name="{{name}}" value="{{value}}">
	</label>
  
  {{/isSearch}}

  {{#isMeasure}}
    
    <label>
      <span class="label"> {{friendlyName}}:</span>
    
    <select name="{{name}}" value="{{value}}">
    {{#options}}
      <option value="{{value}}"> {{text}}</option>
    {{/options}}
    </select>
   </label>
  {{/isMeasure}}
 <br/>
	    {{#errorMessage}}
	      <span class="error">{{errorMessage}}</span><br/>
	    {{/errorMessage}}
 
 {{/fields}}
  
<input name="submit" type="submit" value="Submit" style="margin-left:80%">


  </form>
{{#result}}
  <table class="summary">
        <thead>
    	   <tr>
                  <th>Sensor Type ID</th>
                  <th>Manufacturer</th>
                  <th>Model Number</th>
                  <th>Measure</th>
                  <th colspan="2">Limits</th>
    	   </tr>
    	   <tr>
                  <th></th>
                  <th></th>
                  <th></th>
                  <th></th>
                  <th>Min</th>
                  <th>Max</th>
    	   </tr>
         </thead>
         <tbody>
         {{#result.data}}
         <tr>

            <td>
    		       
               {{{id}}}
               
    		     </td>
             <td>
             {{{modelNumber}}}
             </td>
             <td>
             {{{manufacturer}}}
             </td>
             <td>
             {{{quantity}}}
             </td>
             <td>
             {{{limits.min}}}
             </td>
             <td>
             {{{limits.max}}}
             </td>
          </tr>
          {{/result.data}}
         </tbody>
  </table>
  {{/result}}

  <div class="scroll">
  {{#result.next}}
    <a class="tst-next" href={{result.next}} rel="next"> >></a>
    {{/result.next}}

  </div>


  <div class="scroll">
  {{#result.prev}}
    <a class="tst-prev" href={{result.prev}} rel="prev"> << </a>
    {{/result.prev}}

  </div>
  

  {{>footer}}
  </body>
</html>