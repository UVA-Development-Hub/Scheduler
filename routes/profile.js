var express = require('express');
var router = express.Router();
var mongo = require('../bin/mongo.js');

router.get('/new', (req, res) => {
    if(req.session.user) {
        if(req.session.user.displayName != '') {

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
        if(req.session.user.displayName == '') res.redirect('/profile/new');
        else {
            res.render('profile', {
                title: 'User Profile',
                firstName: req.session.user.firstName,
                lastName: req.session.user.lastName,
                imageUrl: req.session.user.profileImg
            });
        }
    } else {
        req.query.return = '/profile';
        res.redirect('/auth/login')
    }
});

module.exports = router;
