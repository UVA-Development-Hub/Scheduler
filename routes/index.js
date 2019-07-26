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
            mongo.getRecentTerm( term => {
                mongo.searchTerm(req.query.term_id || term._id, query, callback);
            });
        })
    ], (err, data) => {
        var new_result = lib.sectionate(data[1].value[0]);
        res.render('search', {
            title : 'Search Page',
            terms: data[0]['value'],
            results: new_result,
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

router.use('/api', (req, res) => {
    // Helper functions / variables
    // AJAX handler
    try {
        if(req.method == 'POST') {
            if(req.session.user) {
                // AUTHENTICATED POST
                switch(req.body.action) {
                    case 'cart_op':
                    const available_bins = ['bin', 'cart', 'enrolled'];

                    function binContains(bin, course) {
                        for(var i = 0; i < bin.length; i++) if(bin[i].sis_id == course.sis_id && bin[i].term == course.term) return i;
                        return -1;
                    }
                    // Check if the reference given is valid
                    mongo.validateReference(req.body.course, () => {
                        var x = parseInt(req.body.bin || 0); // cart is either 0 (default) or the one specified
                        if(x > 2) x = 0;
                        if(req.body.append) {
                            if(binContains(req.session.user[available_bins[x]], req.body.course) == -1) {
                                req.session.user[available_bins[x]].push(req.body.course);
                                var update = []; update[available_bins[x]] = req.session.user[available_bins[x]];
                                mongo.updateUser(req.session.user._id, update, fresh_user => {
                                    req.session.user = fresh_user;
                                });
                            }
                        } else {
                            var dex = binContains(req.session.user[available_bins[x]], req.body.course);
                            if(dex > -1) {
                                req.session.user[available_bins[x]].splice(dex, 1);
                                var update = []; update[available_bins[x]] = req.session.user[available_bins[x]];
                                mongo.updateUser(req.session.user._id, update, fresh_user => {
                                    req.session.user = fresh_user;
                                });
                            }
                        }
                    }, () => {
                        console.log("Invalid reference");
                    });
                    break;

                    default:
                    console.log("Unknown or unsupported type operation!");
                    break;
                }
                res.status(200);
                res.send("200 - OK");
            } else {
                // UNAUTHENTICATED POST
                res.status(403);
                res.send("403 - Unauthenticated POSTS are unsupported");
            }
        } else {
            if(req.session.user) {
                // AUTHENTICATED GET

                switch(req.query.action) {

                    // Calendar
                    case "calendar":
                    var weekdays = ['Su','Mo','Tu','We','Th','Fr','Sa'];
                    var term = req.query.term;
                    var user_events = [];
                    req.session.user.cart.forEach(function(cart_course){
                        mongo.searchTerm(term, {"sis_id":cart_course.sis_id}, (err, data) => {
                            data[0]['meetings'].forEach(function(meeting_event) {
                                for (i = 0; i < weekdays.length; i++){
                                    if (meeting_event.includes(weekdays[i])){
                                        // Please don't ask about the below unless it breaks.
                                        var new_event = {
                                            title:data[0].subject+data[0].catalog_number+"-"+data[0].section,
                                            start:moment(moment().day(i).format("YYYY-MM-DD")+"T"+data[0].meetings[i].start).format(),
                                            end:moment(moment().day(i).format("YYYY-MM-DD")+"T"+data[0].meetings[i].finish).format(),
                                        };
                                        user_events.push(new_event);
                                    }
                                }
                            });
                        });
                    });
                    res.send(user_events);
                    break;

                    default:
                    console.log("Unknown or unsupported type operation!");
                    break;
                }
            } else {
                // UNAUTHENTICATED GET
                switch(req.query.action) {
                    case "search":
                    var term = req.query.term_id;
                    delete req.query.action; delete req.query.term_id;
                    mongo.searchTerm(term, req.query, (err, data, pages) => {
                        res.status(200);
                        res.send({'pages': pages, 'data': data});
                    });
                    break;

                    case "calendar":
                    res.send("Sign in necessary.");
                    break;

                    default:
                    console.log("Unknown or unsupported type operation!");
                    break;
                }
            }
        }
    } catch (ex) {
        res.status(500);
        res.send("AJAX request could not be processed");
    }
});



// This is the base landing page. It's always the LAST definition
router.use('/', function(req, res, next) {
    res.render('index', {
        title: 'Home',
        user: req.session.user
    });
});

module.exports = router;
