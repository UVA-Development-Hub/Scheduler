var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
  res.render('profile', {
    title: 'User Profile'
  });

});

module.exports = router;
