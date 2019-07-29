
// Create the app instance and configure all its innerworkings.
var express = require('express'),
    session = require('express-session'),
    config = require('./bin/config.js'), // Load config variables
    app = express(), // Create app instance
    mongo = require('./bin/mongo.js'), // Include Mongo handler
    client = require('redis').createClient(config.redis_url), // Create the client to connect to Redis
    RedisStore = require('connect-redis')(session), // Configure the store
    passport = require('passport'), // Passport used to handle authentication
    bodyParser = require("body-parser");

app.use(bodyParser.json()), // Use json format for the body parser
app.use(bodyParser.urlencoded({ // ... and also use extended encoded urls
    extended: true
}));

app.set('view engine', 'pug'); // Set default engine to pugjs
app.use(express.static('public')); // Tell node where to find our static files
app.use(session({ // Configure session store
    secret: 'sssHHH',
    resave: false,
    saveUninitialized: false,
    store: new RedisStore({
        host: 'localhost',
        port: 6379,
        client: client,
        ttl: 3600
    }),
}));
app.use(passport.initialize()); // Create the passport instance the app will use

// Link different page urls the various route handling middlewares

app.use('/subject', require('./routes/subject'));
app.use('/profile', require('./routes/profile'));
app.use('/course', require('./routes/course'));
app.use('/auth', require('./routes/auth'));
app.use('/api', require('./routes/api'));
app.use('/', require('./routes/index'));



// Initialize http server using the app configured above
var http = require('http');
var server = http.createServer(app);
let port = process.env.PORT; // Use either the Heroku port or 8000
if (port == null || port == "") port = 8000;

// After the client has successfully connected to the Redis instance, it prints
// a success message.
client.on('ready', success => {
    console.log("Redis is ready");
});

// If there is an error in connecting to the Redis instance, this error handler
// will be called repeatedly until the issue is resolved.
client.on('error',err => {
    console.log("Error in Redis:");
    console.log(err);
});

// Start the server after establishing a connection to Mongo.
mongo.client.connect(err => {
    if (err) console.log(err); // Mongo could not connect. Log the error.
    else { // Connected to Mongo, start server.
        console.log("Mongo is ready");
        server.listen(port);
    }
})
