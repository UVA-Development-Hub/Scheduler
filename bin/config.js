var config = {};

config.mongo_user = process.env.MONGO_USERNAME;
config.mongo_pass = process.env.MONGO_PASSWORD;
config.redis_url = process.env.REDIS_URL;
config.mongo_url = 'mongodb+srv://' + config.mongo_user + ':' + config.mongo_pass + '@userdata-r5w4z.mongodb.net/test?retryWrites=true&w=majority';
config.google_oauth_client = process.env.GOOGLE_OAUTH2_CLIENT;
config.google_oauth_secret = process.env.GOOGLE_OAUTH2_SECRET;
config.redirect_uri = process.env.REDIRECT_URI;

modle.exports = config;
