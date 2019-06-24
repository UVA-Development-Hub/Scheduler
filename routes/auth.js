var express = require('express');
var session = require('express-session');
var router = express.Router();
var passport = require('passport');
const authSetup = require('../bin/auth.js');

router.get('/login', (req, res, next) => {
    // Make a note of where the user wants to go
    // after authentication is complete
    if (req.query.return) req.session.oauth2return = req.query.return;
        next();
    },
    // Invoke oauth2 with passport
    passport.authenticate('google', {scope: ['email', 'profile']})
);


module.exports = router;
