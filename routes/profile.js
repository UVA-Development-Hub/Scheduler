var express = require('express');
var router = express.Router();
var mongo = require('../bin/mongo.js');

router.get('/new', (req, res) => {
    if(req.session.user) {
        if(req.session.user.displayName == '') {
            // A new user. Ask them to fill out some basic profile info on the new profile page
            res.render('profile/new', {
                title: 'Update Info',
                user: req.session.user
            });
        } else res.redirect('/profile');
    } else {
        req.query.return = '/profile/new';
        res.redirect('/auth/login');
    }
});

// Handle the information sumbission by updating the user's info
router.post('/new', (req, res) => {
    var specifiers = {};

    mongo.updateUser(req.session.user._id, specifiers, done => {
        // Update complete
        res.redirect('/profile');
    });
});

router.get('/', (req, res) => {
    if (req.session.user) {
        // If the user has just joined the site, redirect them to where they can
        // fill out their information
        console.log("'" + req.session.user.displayName + "'");
        if(req.session.user.displayName == '') res.redirect('/profile/new');
        else {
            res.render('profile/profile', {
                title: 'User Profile',
                user: req.session.user
            });
        }
    } else {
        req.query.return = '/profile';
        res.redirect('/auth/login')
    }
});

module.exports = router;
