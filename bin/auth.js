var express = require('express'),
    config = require('./config'),
    mongo = require('./mongo.js');
//  RedisStore = require('connect-redis')(express);
const passport = require('passport'),
    GoogleStrategy = require('passport-google-oauth20').Strategy;

function extractProfile(profile, callback) {
    mongo.getOrCreateUser(profile, data => {
        console.log(data);
        callback(null, data);
    });
}

// OAuth 2-based strategies require a `verify` function which receives the
// credential (`accessToken`) for accessing the Google API on the user's behalf,
// along with the user's profile. The function must invoke `cb` with a user
// object, which will be set at `req.user` in route handlers after
// authentication.
passport.use(
    new GoogleStrategy(
    {
        clientID: config.google_oauth_client,
        clientSecret: config.google_oauth_secret,
        callbackURL: config.redirect_uri,
        accessType: 'offline',
        userProfileURL: 'https://www.googleapis.com/oauth2/v3/userinfo',
    },
    (accessToken, refreshToken, profile, callback) => {
        // Extract the minimal profile information we need from the profile object
        // provided by Google
        extractProfile(profile, callback);
        //callback(null, extractProfile(profile));
        }
    )
);

passport.serializeUser((user, callback) => {
  callback(null, user);
});
passport.deserializeUser((obj, callback) => {
  callback(null, obj);
});
