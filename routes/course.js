var express = require('express');
var router = express.Router();
var mongo = require('../bin/mongo.js');
var async = require('async');



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
        console.log(subject);

        var course_number = req.params.id.replace(/^[A-Za-z]{2,4}/, "")+"";
        console.log(course_number);

        // Parallel accepts two arguments: a) an array of async functions, and a single function that
        // explains what to do when they're all finished. Access the info with data[i] where i is the
        // i_th async function.
        async.parallel([
            async.reflect(function(callback) {
                // get grade data
                mongo.searchGrades(subject, course_number, callback);
            }),
            async.reflect(function(callback){
                mongo.searchTerm(req.params.term, {'subject': subject, 'catalog_number': course_number}, callback);
            })
        ], function(err, data) {
          console.log(data[1]['value']);
          if(!data[1]['value'][0]){
            res.send("Course not found.");
          }
          else if(!data[1]['value']){
              console.log(data[1]['value'])
            //No grades -- explicit false
            res.render('course/term_and_mid', {
                class_info: data[1]['value'],
                grades: false,
                title : subject+" "+course_number,
                user: req.session.user,

            });
          }
          else{
            //Grades exist
            res.render('course/term_and_mid', {
                class_info: data[1]['value'],
                grades: data[0]['value'],
                title : subject+course_number,
                user: req.session.user,

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
          mongo.searchGrades(data[0]['subject'], data[0]['catalog_number'], (err, grades) => {
            if(!grades[0]){
              //No grades -- explicit false.
              res.render('course/term_and_id', {
                specific_class: data[0],
                grades: false,
                title: data[0]['subject']+" "+data[0]['catalog_number'],
                user: req.session.user,

              });
            }
            else{
              //Grades.
              res.render('course/term_and_id', {
                specific_class: data[0],
                grades: grades[0]['grades'],
                title: data[0]['subject']+data[0]['catalog_number'],
                user: req.session.user,
              });
            }
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
    mongo.searchTerm(req.params.term, {page: 0, per: 25}, (err, data, max_page) => {
        res.render('course/term', {
            title: 'Classes in term ' + req.params.term,
            course_terms_and_ids: data,
            max_page,
            user: req.session.user,
            // subject: data.subject
        });
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
