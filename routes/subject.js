var express = require('express');
var router = express.Router();
var mongo = require('../bin/mongo.js');



// router.get('/:subject', (req, res) => {
//     mongo.getTerms(termsList => {
//         res.render('subject/subject', {
//             terms: Array.from(termsList),
//             recentTerm: terms[terms.length - 1]
//         });
//         mongo.searchTerm(recentTerm, {'subject': req.params.subject}, (err, data) => {
//             console.log(data);
//             res.render('subject/subject', {
//                 course_subjects: data['subject']
//             });
//         });
//     });
//
// });

router.get('/:subject', (req, res) => {
    mongo.getTerms((err,termsList) => {
        //console.log("Terms:\n",termsList);
        var recentTerm = termsList[termsList.length-1]["_id"];
        mongo.searchTerm(recentTerm, {'subject': req.params.subject}, (err, data) => {
            console.log(data);
            res.render('subject/subject', {
                course_subjects: data,
            });
        });
    });
});

module.exports = router;