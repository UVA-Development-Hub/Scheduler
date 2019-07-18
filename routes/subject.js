var express = require('express');
var router = express.Router();
var mongo = require('../bin/mongo.js');


router.get('/:subject', (req, res) => {
    mongo.getTerms((err,termsList) => {
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
        //console.log("Terms:\n",termsList);
        var recentTerm = termsList[termsList.length-1]["_id"];
        mongo.searchTerm(recentTerm, {'subject': req.params.subject}, (err, data) => {
            //console.log(data);
            console.log(data);
            var new_result = [],
                itemIndex = 0;
            for (x = 0; x < data.length; x++) {
                itemIndex = tocompare(new_result, data[x]);
                if(itemIndex > -1) new_result[itemIndex].section.push(data[x]);
                else {
                    new_result.push({
                        subject:data[x].subject,
                        number: data[x].catalog_number,
                        title: data[x].title,
                        section: [
                            data[x]
                        ],
                    });
                }
            }
            res.render('subject/subject', {
                course_subjects: new_result,
            });
        });
    });
});

router.get('/', (req, res) => {
    res.send("The future home of a page which shows subjects.");
    mongo.getTerms((err,termsList) => {
        //console.log("Terms:\n",termsList);
        var recentTerm = termsList[termsList.length-1]["_id"];
        mongo.searchTerm(recentTerm, {'subject': req.params.subject}, (err, data) => {
            console.log(data);
            res.render('subject/subject_landing', {
                course_subjects: data,
            });
        });
    });
});

module.exports = router;
