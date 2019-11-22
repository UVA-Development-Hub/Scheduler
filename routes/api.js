var router = require('express').Router(),
    session = require('express-session'),
    assert = require('assert'),
    mongo = require('../bin/mongo.js');

function res200(res, message) {
    res.status(200);
    res.send("200 - OK. " + message);
}

function res400(res, message) {
    res.status(400);
    res.send("400 - Bad Request. This is caused by malformed syntax. " + message);
}

function res401(res, message) {
    res.status(401);
    res.send("401 - Unauthorized. This API call requires you to have a session cookie for our website. " + message);
}

function res404(res, message) {
    res.status(404);
    res.send("404 - Not Found. The requested API call does not exist. " + message);
}

router.get('/current_term', (req, res) => {
    mongo.getRecentTerm((err, data) => {
        res.status(200).send({term: data});
    });
});

router.get('/all_terms', (req, res) => {
    mongo.getTerms((err, data) => {
        res.status(200).send({terms: data});
    });
});

router.get('/search', (req, res) => {
    try {
        let term = req.query.term_id; delete req.query.term_id;
        let scratch = req.query.scratch_duplicates !== undefined; delete req.query.scratch_duplicates;

        req.query.per = req.query.per || 50; // Default to 50 items per page.

        let fuzzy = false;
        if(req.query.fuzzy == 1){
            fuzzy = true;
            console.log(req.query.fuzzy)
        }

        mongo.searchTerm(term, req.query, (err, data, pages) => {
            res.status(200);
            if(scratch) {
                let Clean = data.reduce((noDupes, item, index, src) => {
                    if(index === 0 || src[index - 1].common_name !== item.common_name)
                        noDupes.push(item);
                    return noDupes;
                }, []);
                res.send({
                    pages,
                    data: Clean
                });
            } else res.send({pages, data});
        }, null, fuzzy=fuzzy);
    } catch(e) { res400(res, '') };
});

router.get('/subjects', (req, res) => {
    mongo.getSubjects((err, data) => {
        if(err) res.status(500).send("Request could not be processed")
        else res.send(data);
    })
});

router.post('/cart', (req, res) => {
    try {
        if(req.session.user) {
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
                            res200(res, "- Cart updated.");
                        });
                    }
                } else {
                    var dex = binContains(req.session.user[available_bins[x]], req.body.course);
                    if(dex > -1) {
                        req.session.user[available_bins[x]].splice(dex, 1);
                        var update = []; update[available_bins[x]] = req.session.user[available_bins[x]];
                        mongo.updateUser(req.session.user._id, update, fresh_user => {
                            req.session.user = fresh_user;
                            res200(res, "- Cart updated.");
                        });
                    }
                }
            }, () => {
                res400(res, "- Invalid course reference received.");
            });
        } else res401(res, '');
    } catch(e) { res400(res, ''); }
});

router.get('/calendar', (req, res) => {
    try {
        if(req.session.user) {
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
            res.status(200); res.send(user_events);
        } else res401(res, '');
    } catch(e) { res400(res, ''); }
});

router.get('/grades', (req, res) => {
    var term = req.query.term;
    mongo.searchGrades(req.query.course['subject'], req.query.course['catalog_number'], (err, data) => {
        res.status(200);
        res.send(data[0]);
    });
});

router.get('/get-meetings', (req, res) => {
    try {
        // Run input validation
        assert(/^1\d{2}[1268]$/.test(req.query.term_id));
        assert(/^\d{5}$/.test(req.query.sis_id));

        // Get the course data
        mongo.searchTerm(req.query.term_id, { sis_id: req.query.sis_id }, false, (err, data) => {
            if(err || !data[0]) res404(res, ' This should be a 500.');
            else {
                res.status(200);
                res.send(data[0].meetings);
            }
        });

    } catch(e) { res400(res, " You must provide querystring arguments 'term_id' (a 4 digit number which begins with 1 end ends with 1, 2, 6, or 8) and 'sis_id' (a 5 digit number)."); }
});

router.use('/:anything', (req, res) => {
    res404(res, '');
});

router.use('/', (req, res) => {
    res.status(200); res.send("API Landing");
});

module.exports = router;
