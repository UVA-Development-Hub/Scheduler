var express = require('express');
var router = express.Router();
var mongo = require('../bin/mongo.js');
var async = require('async');
var lib = require('../bin/lib.js');


router.get('/:term/:id', (req, res) => {
    // In this view, you need to determine whether the id given was a mnemonic id or a numerical id.
    // A mnemonic id consists of the subject and class number together: "CS2150", "STS1500", etc
    // A numberical id consists of just a number, like 10253
    // mongo.getTerms('', {subject: req.params.subject}, {catalog_number: req.params.catalog_number} )
    // mongo.getTerms('', {sis_id: req.params.id}, )
    if (isNaN(req.params.id)) {
        var validMIDTest = new RegExp("^[A-Za-z]{2,4}[0-9]{4}$");
        var isValidMID = validMIDTest.test(req.params.id);
        //console.log(isValidMID);
        //req.param.id.split()

        if (!isValidMID){
          res.send("Improper course code.");
          return;
        }

        var subject = req.params.id.replace(/[0-9]{4}$/, "").toUpperCase();

        var course_number = req.params.id.replace(/^[A-Za-z]{2,4}/, "")+"";

        // Parallel accepts two arguments: a) an array of async functions, and a single function that
        // explains what to do when they're all finished. Access the info with data[i] where i is the
        // i_th async function.
        mongo.searchTerm(req.params.term, {'subject': subject, 'catalog_number': course_number}, (err, data) => {
            if(!data[0]){
                res.send("Course not found.");
            }
            else{
                //Grades exist
                res.render('course/term_and_mid', {
                    class_info: data,
                    title : subject+course_number,
                    user: req.session.user,
                    term: req.params.term,
                });
            }
        });
    }


    else {
      mongo.searchTerm(req.params.term, {'sis_id': req.params.id}, (err, data) => {
        if (!(data[0])){
            res.send("Course not found.");
        }
        else{
          res.render('course/term_and_id', {
            course: data[0],
            title: data[0]['subject']+data[0]['catalog_number'],
            user: req.session.user,
            term: req.params.term,
          });
        }
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
    res.render('course/term', {
        title: 'Classes in term ' + req.params.term,
        user: req.session.user,
        term: req.params.term,
        // subject: data.subject
    });


    // res.send("Display all classes from term " + req.params.term + ".");
});


router.get('/', (req, res) => {
    mongo.getTerms( (err, data) => {
        console.log(data);
        data.reverse()
            res.render('course/course', {
                termsList: data,
            });
    });
    // res.send("The future home of a page which explains the course view, searching for courses, etc.");
});

module.exports = router;
