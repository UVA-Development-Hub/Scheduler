var express = require('express');
var router = express.Router();
var mongo = require('../bin/mongo.js');
var asyc = require('async');



router.get('/:term/:id', (req, res) => {
    // In this view, you need to determine whether the id given was a mnemonic id or a numerical id.
    // A mnemonic id consists of the subject and class number together: "CS2150", "STS1500", etc
    // A numberical id consists of just a number, like 10253
    // mongo.getTerms('', {subject: req.params.subject}, {catalog_number: req.params.catalog_number} )
    // mongo.getTerms('', {sis_id: req.params.id}, )
    if (isNaN(req.params.id)) {
        split(req.params.id)

        // Parallel accepts two arguments: a) an array of async functions, and a single function that
        // explains what to do when they're all finished. Access the info with data[i] where i is the
        // i_th async function.
        asyc.parallel([
            callback => {
                mongo.searchTerm(req.params.term, {'sis_id': parseInt(req.params.id)}, callback);
            },
            callback => {
                // get grade data
                //mongo.searchGrades()
            }
        ], function(err, data) {
            res.render('course/term_and_mid', {
                specific_class: data[0][0],
                grades: data[1],
            });
        });
    }
    else {
      mongo.searchTerm(req.params.term, {'sis_id': parseInt(req.params.id)}, data => {
        console.log(data[0]['subject'], data[0]['catalog_number'])
        mongo.searchGrades(data[0]['subject'], data[0]['catalog_number'], grades => {
          //res.send(grades);
          res.render('course/term_and_id', {
            specific_class: data[0],
            grades: grades[0]
          });
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
