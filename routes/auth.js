var express = require('express');
var session = require('express-session');
var router = express.Router();
var passport = require('passport');
const authSetup = require('../bin/auth.js');

router.get('/login', (req, res, next) => { next(); },
    // Invoke oauth2 with passport
    passport.authenticate('google', {scope: ['email', 'profile']})
);

router.get('/google/callback',
    // Finish OAuth2 flow using Passport.js
    passport.authenticate('google'),
    (req, res) => {
        // Redirects to the last accessed url or to the profile page
        const redirect = req.session.oauth2return || '/profile';
        delete req.session.oauth2return;
        req.session.user = req.user;
        res.redirect(redirect);
    }
);

module.exports = router;
