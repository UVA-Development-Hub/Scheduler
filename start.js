// Configure the different routes
var index = require('./routes/index'); // this line brings in routes/index.js



// Create the app, which is used to route user requests around the
// different templates/pages.
var express = require('express');
var app = express();
app.set('view engine', 'pug'); // tell the app to use pug.js to render our templates
app.get('/', index);



// Create an http server with the preconfigured app
var http = require('http');
var server = http.createServer(app);

// Pull the correct port from Heroku, or use the default (8000)
let port = process.env.PORT;
if (port == null || port == "") port = 8000;

// Start the server
server.listen(port);
