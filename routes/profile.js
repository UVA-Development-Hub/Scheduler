var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
    if(req.session.user) {
        // User's id can be accessed with req.session.user.id
        // Hit Mongo to get the user's data
        res.render('profile', {
            title: 'User Profile',
            firstName: req.session.user.firstName,
            lastName: req.session.user.lastName,
            imageUrl: req.session.user.image
            gradYear: req.session.user.

        });

    } else {
        req.query.return = '/profile';
        res.redirect('/auth/login')
    }
});

module.exports = router;
