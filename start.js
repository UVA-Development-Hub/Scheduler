// Configure the different routes
var index = require('./routes/index'); // this line brings in routes/index.js
var profile = require('./routes/profile');




// Create the app, which is used to route user requests around the
// different templates/pages.
var express = require('express');
var app = express();
app.set('view engine', 'pug'); // tell the app to use pug.js to render our templates
app.use(express.static('public'));

// Basic pages that live directly off the landing
app.get('/login', function (req, res) {
  res.render('login') // knows to render login.pug because we did app.set('pug') on line 12
});

app.get('/test', function (req, res) {
    res.render('testLayouts')
});

app.get('/js/tablesorter.js', function(req, res) {
    res.sendFile(__dirname + '/node_modules/tablesorter/dist/js/jquery.tablesorter.js');
});
app.get('/css/tablesorter.theme.blue.css', function(req, res) {
    res.sendFile(__dirname + '/node_modules/tablesorter/dist/css/theme.blue.css');
});

// Pages which use middleware to render
app.use('/profile', profile);
app.get('/', index);


// Create an http server with the preconfigured app
var http = require('http');
var server = http.createServer(app);

// Pull the correct port from Heroku, or use the default (8000)
let port = process.env.PORT;
if (port == null || port == "") port = 8000;

// Start the server
server.listen(port);
