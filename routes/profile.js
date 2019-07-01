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
    if(req.session.user) {
        var specifiers = {
            displayName: req.body.displayName,
            enrollmentData: {
                school: req.body.school,
                major: req.body.major,
                double_major: req.body.double_major,
                minor: req.body.minor
            }
        };
        mongo.updateUser(req.session.user._id, specifiers, done => {
            // Update complete
            res.redirect('/profile');
        });
    } else {
        req.query.return = '/profile/new';
        res.redirect('/auth/login');
    }
});

router.get('/', (req, res) => {
    if (req.session.user) {
        // If the user has just joined the site, redirect them to where they can
        // fill out their information
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
