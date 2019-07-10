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

router.get('/google/callback',
    // Finish OAuth2 flow using Passport.js
    passport.authenticate('google'),

    (req, res) => {
        // Redirects to the last accessed url or to the profile page
        console.log(req.session.oauth2return);
        const redirect = req.session.oauth2return || '/profile';
        delete req.session.oauth2return;
        req.session.user = req.user;
        res.redirect(redirect);
    }
);

module.exports = router;
