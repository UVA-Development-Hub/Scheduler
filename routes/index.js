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
    mongo = require("../bin/mongo.js"),
    async = require('async');
    moment = require('moment');
    lib = require('../bin/lib.js');

router.get('/login', function (req, res) {
    if(req.session.user) res.redirect('/');
    else {
        req.query.return = '/profile';
        res.render('login', {
            title: 'Login',
        });
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
})

router.get('/test', function (req, res) {
    mongo.searchGrades('CS','2150', (err, data)=>{
        console.log(data);
        res.render('testLayouts', {
            grades: data,
            title: 'Test Page',
            user: req.session.user,
        });
    });
});

// Retrieve node module files
router.get('/js/tablesorter.js', function(req, res) {
    res.sendFile(appdir + '/node_modules/tablesorter/dist/js/jquery.tablesorter.js');
});
router.get('/css/tablesorter.theme.blue.css', function(req, res) {
    res.sendFile(appdir + '/node_modules/tablesorter/dist/css/theme.blue.css');
});
router.get('/js/chart.js', function(req, res) {
    res.sendFile(appdir + '/node_modules/chart.js/dist/Chart.min.js');
});
router.get('/css/chart.css', function(req, res) {
    res.sendFile(appdir + '/node_modules/chart.js/dist/Chart.min.css');
});
router.get('/js/fullcalendar.js', function(req, res) {
    res.sendFile(appdir + '/node_modules/fullcalendar/dist/fullcalendar.js');
});
router.get('/css/fullcalendar.css', function(req, res) {
    res.sendFile(appdir + '/node_modules/fullcalendar/dist/fullcalendar.min.css');
});
router.get('/js/moment.js', function(req, res) {
    res.sendFile(appdir + '/node_modules/moment/moment.js');
});
router.get('/js/timegrid.js', function(req, res) {
    res.sendFile(appdir + '/node_modules/@fullcalendar/timegrid/main.js');
});
router.get('/css/timegrid.css', function(req, res) {
    res.sendFile(appdir + '/node_modules/@fullcalendar/timegrid/main.min.css');
});

//search page
router.get('/search', function(req, res){

    var query = lib.buildSearchQuery(req.query);

    async.parallel([
        async.reflect( callback => {
            mongo.getTerms(callback);
        }),
        async.reflect( callback => {
            // Either uses the requested term or the most recent one
            mongo.getRecentTerm( (err, term) => {
                mongo.searchTerm(req.query.term_id || term._id, query, callback);
            });
        })
    ], (err, data) => {
        res.render('search', {
            title : 'Search Page',
            terms: data[0]['value'],
            sections: lib.sectionate(data[1].value[0]),
            max_page: parseInt(data[1].value[1]),
            input: req.query,
            selected_term: req.query.term_id,
            user: req.session.user
        });
    });
});

// Page which explains how our site uses cookies to improve user experience.
router.use('/cookies', (req, res, next) => {
    res.render('info/cookies', {
        title: 'Cookies',
        user: req.session.user,
    });
});

// Page explaining how a user's data is collected, stored, and used.
router.use('/privacy', (req, res, next) => {
    res.render('info/privacy', {
        title: 'Cookies',
        user: req.session.user,
    });
});

// This is the base landing page. It's always the LAST definition
router.use('/', function(req, res, next) {
    res.render('index', {
        title: 'Home',
        user: req.session.user
    });
});

module.exports = router;
