
function buildSearchQuery(params) {
    var query = {};

    if(params.subject && params.subject != '') query.subject = params.subject.toUpperCase();
    if(params.catalog_number && params.catalog_number !='') query.catalog_number = params.catalog_number;
    // IGNORE TITLE
    //if(params.title && params.title != '') query.title = params.title;
    if(params.dayinput && params.dayinput != '') query.days = dayinput;
    // IGNORE INSTRUCTOR
    //if(params.instructor && params.instructor != '') query.instructor == params.instructor;
    return query;
}

function compareSections(courseList, course){
    for(var i = 0; i < courseList.length; i++) if(course.subject === courseList[i].subject && course.catalog_number === courseList[i].catalog_number) return i;
    return -1;
}

function sectionate(courseArray) {
    var ret = [], dex = 0;
    for (i = 0; i < courseArray.length; i++) {
        dex = compareSections(ret, courseArray[i]);
        //console.log(dex);
        if(dex > -1) ret[dex].sections.push(courseArray[i]);
        else {
            ret.push({
                subject: courseArray[i].subject,
                catalog_number: courseArray[i].catalog_number,
                title: courseArray[i].title,
                sections: [
                    courseArray[i],
                ],
            });
        }
    }
    return ret;
}

module.exports = {
    buildSearchQuery,
    sectionate,
};
