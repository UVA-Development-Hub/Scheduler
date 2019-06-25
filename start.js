// Configure the different routes
var index = require('./routes/index'); // this line brings in routes/index.js
var profile = require('./routes/profile');
var auth = require('./routes/auth');



// Create the app, which is used to route user requests around the
// different templates/pages.
var express = require('express');
var session = require('express-session');
var app = express();
var passport = require('passport');

app.set('view engine', 'pug'); // tell the app to use pug.js to render our templates
app.use(express.static('public'));
const sessionConfig = {
    resave: false,
    saveUninitialized: false,
    secret: 'sssHHH',
    signed: true,
    // Todo: store session with Redis. Until this is implemented, auth'ed sessions
    // will have the ability to spontaneously logout.
    //store: new redisStore({ host: 'localhost', port: 6379, client: client,ttl :  260}),
};
app.use(session(sessionConfig));
app.use(passport.initialize());

// Basic pages that live directly off the landing
app.get('/login', function (req, res) {
    req.query.return = '/profile';
    res.render('login'); // knows to render login.pug because we did app.set('pug') on line 15
});

app.get('/test', function (req, res) {
    res.render('testLayouts');
});


// Retrieve node module files
app.get('/js/tablesorter.js', function(req, res) {
    res.sendFile(__dirname + '/node_modules/tablesorter/dist/js/jquery.tablesorter.js');
});
app.get('/css/tablesorter.theme.blue.css', function(req, res) {
    res.sendFile(__dirname + '/node_modules/tablesorter/dist/css/theme.blue.css');
});

// Pages which use middleware to render
app.use('/auth', auth);
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
