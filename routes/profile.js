var express = require('express');
var router = express.Router();
var mongo = require('../bin/mongo.js');

router.get('/', function(req, res) {
    if (req.session.user) {
        // User's id can be accessed with req.session.user.id
        // Hit Mongo to get the user's data
        res.render('profile', {
            title: 'User Profile',
            firstName: req.session.user.firstName,
            lastName: req.session.user.lastName,
<<<<<<< HEAD
            imageUrl: req.session.user.image,
            // gradYear: req.session.user.expectedGradYear

=======
            imageUrl: req.session.user.profileImg
>>>>>>> 75bd8c5147a1e4193839b3f3aba55facfa1c51f9
        });

    } else {
        req.query.return = '/profile';
        res.redirect('/auth/login')
    }
});

module.exports = router;
