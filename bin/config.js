var config = {};

config.mongo_user = process.env.MONGO_USERNAME;
config.mongo_pass = process.env.MONGO_PASSWORD;
config.redis_url = process.env.REDIS_URL || '';
config.mongo_url = 'mongodb+srv://' + config.mongo_user + ':' + config.mongo_pass + '@userdata-r5w4z.mongodb.net/test?retryWrites=true&w=majority';
config.redirect_uri = process.env.REDIRECT_URI || 'http://localhost:8000/auth/google/callback';

if(process.env.GOOGLE_OAUTH2_CLIENT) {
    // Pull from heroku config
    config.google_oauth_client = process.env.GOOGLE_OAUTH2_CLIENT;
    config.google_oauth_secret = process.env.GOOGLE_OAUTH2_SECRET;
} else {
    // Pull from local config (outside of the repo)
    var credentials = require('../../credentials.js');
    config.google_oauth_client = credentials.google_client;
    config.google_oauth_secret = credentials.google_secret;
    config.mongo_user = credentials.mongo_user;
    config.mongo_pass = credentials.mongo_pass;
}

module.exports = config;
