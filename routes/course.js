var express = require('express');
var router = express.Router();
var mongo = require('../bin/mongo.js');



router.get('/:term/:id', (req, res) => {
    // In this view, you need to determine whether the id given was a mnemonic id or a numerical id.
    // A mnemonic id consists of the subject and class number together: "CS2150", "STS1500", etc
    // A numberical id consists of just a number, like 10253
    // mongo.getTerms('', {subject: req.params.subject}, {catalog_number: req.params.catalog_number} )
    // mongo.getTerms('', {sis_id: req.params.id}, )
    if (isNaN(req.params.id)) {
        split(req.params.id)
        // console.log("Error")
        // res.render('course/term_and_id', {
        //     Error: "Not found"
        // })
    }
    else {
        mongo.searchTerm(req.params.term, {'sis_id': parseInt(req.params.id)}, data => {
            console.log(data);
            res.render('course/term_and_id', {
                specific_class: data[0],
            });
        });
    }

    // if (isNan(req.params.term) && isNan(req.params.id)) {
    //     res.render('course/term_and_id', {
    //         Error: "Not found"
    //     })
    // }
    //
    // elif (!(req.params.term && req.params.id in data)) {
    //     res.render('course/term_and_id', {
    //         Error: "Not found"
    //     })



});

router.get('/:term', (req, res) => {
    mongo.searchTerm(req.params.term, {}, data => {
       console.log(data);
       res.render('course/term', {
           title: 'Classes in term ' + req.params.term,
           course_terms_and_ids: data
           // subject: data.subject
       });
   });


    // res.send("Display all classes from term " + req.params.term + ".");
});


router.get('/', (req, res) => {
    res.send("The future home of a page which explains the course view, searching for courses, etc.");
});

module.exports = router;
