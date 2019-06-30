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

var express = require('express'),
    router = express.Router(),
    appdir = require('path').dirname(require.main.filename),
    mongo=require("../bin/mongo.js");
const fetch = require("node-fetch");

router.get('/login', function (req, res) {
    req.query.return = '/profile';
    res.render('login', {
        title: 'Login',
    });
});

router.get('/test', function (req, res) {
    res.render('testLayouts', {
        title: 'Test Page'
    });
});

// Retrieve node module files
router.get('/js/tablesorter.js', function(req, res) {
    res.sendFile(appdir + '/node_modules/tablesorter/dist/js/jquery.tablesorter.js');
});
router.get('/css/tablesorter.theme.blue.css', function(req, res) {
    res.sendFile(appdir + '/node_modules/tablesorter/dist/css/theme.blue.css');
});

//search page
router.get('/search', function(req, res){
    // Get the terms list so you can pick a semester
    mongo.getTerms(termsList => {
        console.log(termsList);
        res.render('search', {
            title : 'Search Page',
            terms: termsList,
            results:[]
        });
    });
});

router.post('/search', function(req, res){
    //console.log(req.body.monday);
    var thedays = [
       req.body.monday, // assume for now these are true or false (checked or not)
       req.body.tuesday,
       req.body.wednesday,
       req.body.thursday,
       req.body.friday,
       req.body.saturday,
    ];
    var daynames = [
   'M',
   'T',
   'W',
   'R',
   'F',
   'S'
];
var dayinput = '';

thedays.forEach((checkbox, index) => {
   if(checkbox) dayinput = dayinput + daynames[index];
});

var tosubmit = {};
if(req.body.subject != '') tosubmit.subject = req.body.subject;
if(dayinput != '') tosubmit.days = dayinput;
    console.log(tosubmit);

mongo.getTerms(termsList =>{
    mongo.searchTerm('1192', tosubmit, results => {
        res.render('search', {
            title : 'Search Page',
            terms: termsList,
            results: results
        });
    });
});
});


// This is the base landing page. It's always the LAST definition
router.use('/', function(req, res, next) {
    var all_classes;
    const url = 'https://api.devhub.virginia.edu/v1/courses';
    fetch(url)
    	.then((resp) => resp.json())
    	.then(function(data) {
            all_classes = data['class_schedules']['records'];
            res.render('index', {
                uva_classes: all_classes
            });
		}).catch(function(error) {
			console.log('Fetch failed!');
			res.send('Could not retrieve API data');
    	});
});



module.exports = router;
