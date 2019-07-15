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
    res.render('testLayouts', {
        title: 'Test Page',
        user: req.session.user,
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

//search page
router.get('/search', function(req, res){
    // Get the terms list so you can pick a semester
    mongo.getTerms(termsList => {
        res.render('search', {
            title : 'Search Page',
            user: req.session.user,
            terms: termsList,
            results:[],
            input: {
                'subject': '',
                'catalog_number': '',
                'classTitle' :'',
                'instructor' : '',
                'monday' : false,
                'tuesday' : false,
                'wednesday' : false,
                'thursday' : false,
                'friday' : false,
                'saturday' : false,
            },
            user: req.session.user
        });
    });
});

router.post('/search', function(req, res){
    var thedays = [
        req.body.monday,
        req.body.tuesday,
        req.body.wednesday,
        req.body.thursday,
        req.body.friday,
        req.body.saturday,
    ], daynames = [
        'M',
        'T',
        'W',
        'R',
        'F',
        'S'
    ], dayinput = '',
        tosubmit = {};

    thedays.forEach((checkbox, index) => {
        if(checkbox) dayinput = dayinput + daynames[index];
    });

    if (req.body.catalog_number !='') tosubmit.catalog_number =req.body.catalog_number;
    if(req.body.subject != '') tosubmit.subject = req.body.subject.toUpperCase();
    if(dayinput != '') tosubmit.days = dayinput;

    function tocompare(courseList,course){
        var ret = -1;
        for(var i = 0; i < courseList.length; i++) {
            if(course.subject === courseList[i].subject && course.catalog_number === courseList[i].number) {
                ret = i;
                break;
            }
        }
        return ret;
    }

    // Retrieve the search results and terms list in parallel
    async.parallel([
        async.reflect( callback => {
            mongo.getTerms(callback);
        }),
        async.reflect( callback => {
            mongo.searchTerm(req.body.term_id, tosubmit, callback);
        })
    ], (err, data) => {
        var new_result = [],
            itemIndex = 0;
        for (x = 0; x < data[1]['value'].length; x++) {
            itemIndex = tocompare(new_result, data[1]['value'][x]);
            if(itemIndex > -1) new_result[itemIndex].section.push(data[1]['value'][x]);
            else {
                new_result.push({
                    subject:data[1]['value'][x].subject,
                    number: data[1]['value'][x].catalog_number,
                    title: data[1]['value'][x].title,
                    section: [
                        data[1]['value'][x]
                    ],
                });
            }
        }

        res.render('search', {
            title : 'Search Page',
            terms: data[0],
            results: new_result,
            input: req.body,
            selected_term: req.body.term_id,
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
