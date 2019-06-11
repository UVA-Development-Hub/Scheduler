// The files here in the routes folder are used to route a user's request
// to the destination we've chosen. To better understand this, consider
// this example:
// Imagine we had an app which allowed users to browse fruits. A plan which
// makes sense would be to have the URLs look like project.com/fruits/apple.
// To do this, we would make a file here in the routes folder called fuits.js,
// which would have router.get's for each fruit which exists. Meanwhile, in
// start.js we would create an app.get for fruits, using a require(routes/fruits)
// statement. This can be somewhat confusing, but we'll go over it until we're
// all on the same page.

var express = require('express');
var router = express.Router();
const fetch = require("node-fetch");

var all_classes;
const url = 'https://api.devhub.virginia.edu/v1/courses';
fetch(url)
	.then((resp) => resp.json())
	.then(function(data) {
    all_classes = data['class_schedules']['records'];
	}).catch(function(error) {
		console.log('Fetch failed!');
	});

router.use('/', function(req, res, next) {
  res.render('index', {
    title: 'UVA Scheduler',
    uva_classes: all_classes
  });

});

module.exports = router;
