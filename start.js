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
var bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

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

// Pages which use middleware to render
app.use('/auth', auth);
app.use('/profile', profile);
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
