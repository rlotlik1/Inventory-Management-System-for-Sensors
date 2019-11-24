<!DOCTYPE html>
<html>
  <head>
    <title>Searching Sensors</title>
    <link rel="stylesheet" href="/css/style.css">
  </head>
  <body>
  <h1>Search Sensors</h1>

  <ul>
      {{#errors}}
        <li class="error">{{.}}</li>
      {{/errors}}
  </ul>

  <form method="POST">
   

   {{#fields}}
   {{#isSensor}}

    <label>
	    <span class="label">{{friendlyName}}:</span> 
	    <input name="{{name}}" value="{{value}}">
      
	  </label> 
       
  {{/isSensor}}
  <br/>
   {{/fields}}

   {{#period}}
        <li class="error">{{{period}}}</li>
   {{/period}}

  <input name="submit" type="submit" value="Search">
  
  </form>

  <table class="summary">
        <thead>
    	   <tr>
                  <th>Sensor ID</th>
                  <th>Model</th>
                  <th>Period</th>
                  <th colspan="2">Expected Range</th>
                  
    	   </tr>
    	   <tr>
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
             {{{model}}}
             </td>
             <td>
             {{{period}}}
             </td>
             
             <td>
             {{{expected.min}}}
             </td>
             <td>
             {{{expected.max}}}
             </td>
          </tr>
          {{/result.data}}
         </tbody>
  </table>

  <div class="scroll">
  {{#result.next}}
    <a class="tst-next" href={{result.next}} rel="next"> >></a>
    {{/result.next}}

  </div>


  <div class="scroll">
  {{#result.prev}}
    <a class="tst-prev" href={{result.prev}} rel="prev"> <<</a>
    {{/result.prev}}

  </div>

  {{>footer}}
  </body>
</html>