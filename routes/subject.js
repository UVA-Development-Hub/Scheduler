var express = require('express');
var router = express.Router();
var mongo = require('../bin/mongo.js');
// var lib = require('../bin/lib.js');
var async = require('async');
var moment = require('moment');
appdir = require('path').dirname(require.main.filename),





// router.get('/:term/:subject', (req, res) => {
//
//     mongo.getTerms((err,termsList) => {
//         function tocompare(courseList,course){
//             var ret = -1;
//             for(var i = 0; i < courseList.length; i++) {
//                 if(course.subject === courseList[i].subject && course.catalog_number === courseList[i].number) {
//                     ret = i;
//                     break;
//                 }
//             }
//             return ret;
//         }
//         //console.log("Terms:\n",termsList);
//         var recentTerm = termsList[termsList.length-1]["_id"];
//         console.log(recentTerm);
//         mongo.searchTerm(recentTerm, {'subject': req.params.subject.toUpperCase()}, (err, data) => {
//             //console.log(data);
//             //console.log(data);
//             var new_result = [],
//                 itemIndex = 0;
//             for (x = 0; x < data.length; x++) {
//                 itemIndex = tocompare(new_result, data[x]);
//                 if(itemIndex > -1) new_result[itemIndex].section.push(data[x]);
//                 else {
//                     new_result.push({
//                         subject:data[x].subject,
//                         number: data[x].catalog_number,
//                         title: data[x].title,
//                         section: [
//                             data[x]
//                         ],
//                     });
//                 }
//             }
//                 //
//                 // async.parallel([
//                 //     async.reflect( callback => {
//                 //         mongo.getTerms(callback);
//                 //     }),
//                 //     async.reflect( callback => {
//                 //         mongo.searchTerm(req.body.term_id, tosubmit, callback);
//                 //     })
//                 // ], (err, data) => {
//                 //     var new_result = [],
//                 //         itemIndex = 0;
//                 //     for (x = 0; x < data[1]['value'].length; x++) {
//                 //         itemIndex = tocompare(new_result, data[1]['value'][x]);
//                 //         if(itemIndex > -1) new_result[itemIndex].section.push(data[1]['value'][x]);
//                 //         else {
//                 //             new_result.push({
//                 //                 subject:data[1]['value'][x].subject,
//                 //                 number: data[1]['value'][x].catalog_number,
//                 //                 title: data[1]['value'][x].title,
//                 //                 section: [
//                 //                     data[1]['value'][x]
//                 //                 ],
//                 //             });
//                 //         };
//                 //     };
//
//                     res.render('subject/subject', {
//                         course_subjects: new_result,
//                         term: recentTerm,
//                         terms_list: termsList,
//                         results: [],
//                         // title : 'Search Page',
//                         // terms: data[0]['value'],
//                         // results: new_result,
//                         // input: req.body,
//                         // selected_term: req.body.term_id,
//                         // user: req.session.user,
//                 });
//             // });
//         });
//     });
// });

router.get('/:term/:subject', (req, res) => {
    mongo.getTerms((err, termsList) => {
        res.render("subject/subject", {
            term: req.params.term,
            terms: termsList,
            title: req.params.subject.toUpperCase(),
            subject: req.params.subject.toUpperCase(),
        });
    });
});
//     mongo.searchTerm(req.params.term, {'subject':req.params.subject.toUpperCase()}, (err, data) => {
//         // console.log(data);
//         var newData = lib.sectionate(data);
//         console.log(newData);
//         res.render('subject/subject', {
//             course_subjects: data,
//             section_order: newData,
//             term: req.params.term,
//         });
//     });
// });

// router.get('/:term/:subject', (req, res) => {
//     lib.sectionate((courseArray){
//         res.render('subject/subject', {
//             course_subjects:
//         })
//     })
// })

// router.post('/:term/:subject', function(req, res){
//
//     async.parallel([
//         async.reflect( callback => {
//             mongo.getTerms(callback);
//         }),
//         async.reflect( callback => {
//             mongo.searchTerm(req.body.term_id, tosubmit, callback);
//         })
//     ], (err, data) => {
//         var new_result = [],
//             itemIndex = 0;
//         for (x = 0; x < data[1]['value'].length; x++) {
//             itemIndex = tocompare(new_result, data[1]['value'][x]);
//             if(itemIndex > -1) new_result[itemIndex].section.push(data[1]['value'][x]);
//             else {
//                 new_result.push({
//                     subject:data[1]['value'][x].subject,
//                     number: data[1]['value'][x].catalog_number,
//                     title: data[1]['value'][x].title,
//                     section: [
//                         data[1]['value'][x]
//                     ],
//                 });
//             };
//         };
//
//         res.render('subject/subject', {
//             title : 'Search Page',
//             terms: data[0]['value'],
//             results: new_result,
//             input: req.body,
//             selected_term: req.body.term_id,
//             user: req.session.user
//         });
//     });
// });

router.get('/', (req, res) => {

    mongo.getTerms((err, termsList) => {
        var recentTerm = termsList[termsList.length-1]["_id"];

        mongo.getSubjects((err, data) => {
            var subjects = {};
            data.forEach(function(val){
                if (subjects[val['school']]) {
                    subjects[val['school']].push(val);
                }
                else{
                    subjects[val['school']] = [];
                    subjects[val['school']].push(val);
                }
            });

            res.render('subject/subject_landing', {
                course_subjects: subjects,
                term: recentTerm,
                // uva_schools: values,
            });
        });
    });
});

// router.get('/', (req, res) => {
//     // res.send("The future home of a page which shows subjects.");
//     mongo.getTerms((err,termsList) => {
//         //console.log("Terms:\n",termsList);
//         var recentTerm = termsList[termsList.length-1]['_id'];
//         mongo.searchTerm(recentTerm, {'subject': req.params.subject}, (err, data) => {
//             console.log(data);
//             res.render('subject/subject_landing', {
//                 course_subjects: data,
//             });
//         });
//     });
// });

// router.get('/', (req, res) => {
//     mongo.getPrograms(['major', 'minor'], data => {
//         console.log(data['major']);
//         console.log(data['minor']);
//         res.render('subject', {
//             major_list: data['major'],
//             minor_list: data['minor'],
//         });
//     });
// });

module.exports = router;
