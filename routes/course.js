var express = require('express');
var router = express.Router();
var mongo = require('../bin/mongo.js');



router.get('/:term/:id', (req, res) => {
    // In this view, you need to determine whether the id given was a mnemonic id or a numerical id.
    // A mnemonic id consists of the subject and class number together: "CS2150", "STS1500", etc
    // A numberical id consists of just a number, like 10253
    // mongo.getTerms('', {subject: req.params.subject}, {catalog_number: req.params.catalog_number} )
    mongo.getTerms('', {sis_id: req.params.id}, )
    res.send("Display information on class with catalog (or mnemonic) id " + req.params.id + " from term " + req.params.term + ".");
    // res.send(req.params.subject + req.params.catalog_number);
});

router.get('/:term', (req, res) => {
    mongo.searchTerm('1192', {}, data => {
       console.log(data);
       res.render('course/term', {
           title: 'Classes in term ' + req.params.term,
           courses: data
       });
   });

    res.send("Display all classes from term " + req.params.term + ".");
});

router.get('/', (req, res) => {
    res.send("The future home of a page which explains the course view, searching for courses, etc.");
});

module.exports = router;
