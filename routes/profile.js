var express = require('express');
var router = express.Router();
var mongo = require('../bin/mongo.js');

router.get('/new', (req, res) => {
    if(req.session.user) {
        if(req.session.user.displayName == '') {
            // A new user. Ask them to fill out some basic profile info on the new profile page
            // 'tx' indicates programs of major types (major/minor) and that we don't care ('x')
            // about the second specifier type
            mongo.getPrograms(['major', 'minor'], data => {
                res.render('profile/new', {
                    title: 'Update Info',
                    user: req.session.user,
                    majors: data['major'],
                    minors: data['minor'],
                    sub_to: '/profile/new'
                });
            });
        } else res.redirect('/profile');
    } else {
        req.query.return = '/profile/new';
        res.redirect('/auth/login');
    }
});

router.get('/edit', (req, res) => {
    if(req.session.user) {
        res.render('profile/edit'), {
            title: 'Edit My Details',
            user: req.session.user
        }
    } else {
        req.query.return = '/profile/edit';
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
        mongo.updateUser(req.session.user._id, specifiers, () => {
            // Update the user stored in session
            mongo.getOneUser(req.session.user._id, user => {
                req.session.user = user;
                res.redirect('/profile');
            });
        });
    } else {
        req.query.return = '/profile/new';
        res.redirect('/auth/login');
    }
});

router.post('/edit', (req, res) => {
    var specifiers = {
        displayName: req.body.displayName,
        enrollmentData: {
            school: req.body.school,
            major: req.body.major,
            double_major: req.body.double_major,
            minor: req.body.minor
        }
    };
    mongo.updateUser(req.session.user._id, specifiers, () => {
        mongo.getOneUser(req.session.user._id, user => {
            req.session.user = user;
            res.redirect('/profile');
        });
    });
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
