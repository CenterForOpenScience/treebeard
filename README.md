
<p align="center">
  <img src="https://raw.githubusercontent.com/caneruguz/treebeard/master/dist/treebeard.png" alt="Treebeard Logo"/>
</p>
<i style="text-align:center"> Logo designed by [fayetality](https://github.com/fayetality "fayetality")  </i>

treebeard
=========

Hierarchical data renderer built with Mithril


Components 
----- 
**This Project relies on these technologies for its workflow so it's important to familiarize yourself before starting.**

**Npm**  
https://www.npmjs.org/  
Node package management, for server side dependencies and making gulp work

**Bower**  
http://bower.io/  
front end dependencies


**Gulp**  
http://gulpjs.com/  
builds the distribution by running important tasks including concatenation, minification(we are not doing this yet, but will), compiling less files. 


**Browserify**  
http://browserify.org/
Browserify handles dependencies and scope for js libraries. It uses the CommonJS method. All components need to be working with browserify. There is a gulp task that is takign care of applying browserify.  

**Bootstrap**  
http://getbootstrap.com/  
Forms the basic design with flat colors taken from elsewhere. If you are working with html you need to use the Bootstrap syntax. 

**Mithril**  
http://lhorie.github.io/mithril/  
JS framework used for building the application. This application won't make sense without some understanding of Mithril. 


Installation
-----
After cloning the project, go to the main project folder and  run the following commands to install dependencies

For NPM:

```npm install```

for Bower 

```bower install```

then run gulp like this 

``` gulp ```

Gulp will be watching for changes in the CSS, LESS and JS files so any time you change the distribution folder will be automatically regenerated. 


If you would like a simple server instance for this app you can install http-server
https://www.npmjs.org/package/http-server
Install with NPM:

``` npm install http-server ```
