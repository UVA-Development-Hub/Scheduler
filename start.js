// Configure the different routes
var index = require('./routes/index'); // this line brings in routes/index.js
var profile = require('./routes/profile');
var auth = require('./routes/auth');
var course = require('./routes/course');


// Create the app, which is used to route user requests around the
// different templates/pages.
var express = require('express');
var session = require('cookie-session');
var config = require('./bin/config.js');
//var client = require('redis').createClient();
//var RedisStore = require('connect-redis')(session);
var app = express();
var passport = require('passport');
var bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.set('view engine', 'pug'); // tell the app to use pug.js to render our templates
app.use(express.static('public'));
const sessionConfig = {
    secret: 'sssHHH',
    resave: false,
    saveUninitialized: false,
    // Todo: store session with Redis. Until this is implemented, auth'ed sessions
    // will have the ability to spontaneously logout.
    /*store: new RedisStore({
        host: '192.168.0.140',
        port: 6379,
        client: client,
        ttl: 260
    })/**/
};
app.use(session(sessionConfig));
app.use(passport.initialize());

// Pages which use middleware to render
app.use('/auth', auth);
app.use('/profile', profile);
app.use('/course', course);
app.use('/', index);


// Create an http server with the preconfigured app
var http = require('http');
var server = http.createServer(app);

// Pull the correct port from Heroku, or use the default (8000)
let port = process.env.PORT;
if (port == null || port == "") port = 8000;

// Start the server
var mongo = require('./bin/mongo.js');
mongo.client.connect(err => {
    if (err) console.log(err);
    else server.listen(port);
})
