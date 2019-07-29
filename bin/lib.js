
function buildSearchQuery(params) {
    var query = {};

    if(params.subject && params.subject != '') query.subject = params.subject.toUpperCase();
    if(params.catalog_number && params.catalog_number !='') query.catalog_number = params.catalog_number;
    if(params.days && params.days != '') query.days = params.days;

    // Use $where to search for instructors, course title
    if((params.title && params.title != '') || ((params.instructor && params.instructor != ''))) {
        query.$where = function() {
            this.instructors.forEach( item => {
                if(item.lower().indexOf(params.instructor.lower())) return true;
            });
            return false;
        };
    }
    console.log(query);
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
