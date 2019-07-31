var currentPage = 0;
var arr;

$(document).ready( function() {
    arr= $(".pageselector");
    d = getUrlParams(location.search);
    currentPage = parseInt(d.page || 1) - 1;
    if(currentPage < 0) currentPage = 0;
    window.history.pushState({"html": $('html')[0].outerHTML, "pageTitle": $("title").text()},"", window.location.href.replace(/([&?]page=)(.*)(&{1}.*){0,1}/, '$1' + (currentPage + 1) + '$3'));
    currentPage--;
    loadPage(currentPage + 1);
});

function setButtons(pageNumber) {
    console.log("Configuring buttons: " + pageNumber + " " + maxPage);
    currentPage = pageNumber;
    $(".pageselector").show();
    for(var i = maxPage; i < 10; i++) $(arr[i + 1]).hide();
    if (currentPage < 5) {
        for(var i=0; i<5;i++ ) {
            $(arr[i]).attr("onclick", "urlAndLoad("+ parseInt(i)+")");
            $(arr[i]).html(parseInt(i + 1));
        }

        for(var i=5; i<10;i++ ) {
            $(arr[i]).attr("onclick", "urlAndLoad("+ parseInt(i)+")");
            $(arr[i]).html(parseInt(i + 1));
        }
    } else if (currentPage > parseInt(maxPage-10)) {
        for(var i=0; i<5;i++ ) {
            $(arr[i]).attr("onclick", "urlAndLoad("+ parseInt(i+maxPage-9)+")");
            $(arr[i]).html(parseInt(i + 1+maxPage-9));
        }
        for(var i=5; i<10;i++ ) {
            $(arr[i]).attr("onclick", "urlAndLoad("+ parseInt(i+maxPage-9)+")");
            $(arr[i]).html(parseInt(i + 1+maxPage-9));
        }
    } else {
        for(var i=0; i<5;i++ ) {
            $(arr[i]).attr("onclick", "urlAndLoad("+ parseInt(pageNumber-5+i)+")");
            $(arr[i]).html(parseInt((pageNumber-5+i) + 1 ));
        }
        for(var i=5; i<10;i++ ) {
            $(arr[i]).attr("onclick", "urlAndLoad("+ parseInt(pageNumber+i-5)+")");
            $(arr[i]).html(parseInt((pageNumber+i-5)+ 1));
        }
    }

    $(arr).each(function() {
        if(parseInt($(this).html())-1 == currentPage) $(this).addClass('bg-uva-orange');
        else $(this).removeClass('bg-uva-orange');
    });

};

function loadPage(pg) {
    getSearchPage(parseInt(pg), 25, (data, max, term) => {
        maxPage = max - 1;
        // Write new search results to the #results element
        var newHTML = ` `, i = 0;
        while(i < data.length) {
            var course = data[i];
            var currentCatalog = course.catalog_number;
            var courseLink = "/course/"+term+"/"+course.subject+currentCatalog
            const subjectHeader = `
                <div class="row">
                    <div class="col-md-12" style="margin-top:50px;">
                        <h3 class="bg-uva-orange course-header">
                            <a href=${courseLink}>
                                <b>${course.subject} ${currentCatalog} - ${course.title}</b>
                            </a>
                        </h3>
                        <div class="col-md-12 course-section-container">
                            <div class="row">
                                <div class="col-md-12">
                                    <p class="section-title-thick" style="overflow:hidden">${course.desc}</p>
                                </div>
                            </div>
                        </div>
                        <table class="wide">`;
            newHTML += subjectHeader;
            while(i < data.length && course.catalog_number == currentCatalog) {
                var spanstyle = "",
                    enrollmentcontents = ``,
                    instructors = ``,
                    ins = [];
                // Determine styling for various spans
                switch(course.status) {
                    case 'Wait List':
                    spanstyle = "color:#e57200;";
                    enrollmentcontents = `<span>${course.enrolled} / ${course.enroll_limit} | </span><span style="color:red;">${course.waiting}`;
                    break;

                    case 'Open':
                    spanstyle = "color:green;";
                    enrollmentcontents = `<span style="color:green">${course.enrolled} / ${course.enroll_limit}`;
                    if(course.waiting != 0) enrollmentcontents += ` | <span style="color:red;">${course.waiting}</span>`;
                    break;

                    default:
                    enrollmentcontents = `<span style="color:green">${course.enrolled} / ${course.enroll_limit}`;
                    if(course.waiting != 0) enrollmentcontents += ` | <span style="color:red;">${course.waiting}</span>`;
                    break;
                }

                // Create instructors list
                course.instructors.forEach( item => {
                    if(!ins.includes(item)) {
                        ins.push(item);
                        instructors += `<p>${item}</p>`;
                    }
                });

                // Format the template string
                var sisLink = "/course/"+term+"/"+course.sis_id;
                const sectionData = `
                    <tr class="wide">
                        <td class="wide">
                            <div class="row section-title course-section-header">
                                <div class="col-sm-2">
                                    <a href=${sisLink}>
                                        <b><p class="sis_id">${course.sis_id} - ${course.section}</p></b>
                                    </a>
                                </div>
                                <div class="col">
                                    <b><p>${course.type}</p></b>
                                </div>
                                <div class="col-sm-5">${instructors}</div>
                                <div class="col-sm-2">
                                    <b><span style="${spanstyle}">${course.status}</span></b>
                                </div>
                                <div class="col">
                                    <b><p>${enrollmentcontents}</p></b>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-12 calspot">
                                    <p>Future home of the calendar</p>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-12">
                                    <p>Grade data is fetched by combining the instructor with the subject and number. It does not factor in labs/discussions or their instructors, etc.</p>
                                    <p>Future home of the grade distribution information</p>
                                </div>
                            </div>
                        </td>
                    </tr>`;
                // Append to the results
                i++;
                course = data[i];
                newHTML += sectionData;
            }
            // Append closing tags
            newHTML += `</table></div></div>`;
        }
        // Load the new html into the frame
        $("#results").html(newHTML);
        setButtons(pg);
    });
}

function urlAndLoad(pg) {
    window.history.pushState({"html": $('html')[0].outerHTML, "pageTitle": $("title").text()},"", window.location.href.replace(/([&?]page=)(\w+)(&{1}.*){0,1}/, '$1' + (pg + 1) + '$3'));
    if(pg != currentPage) loadPage(pg);
}

function nextPage() {
    if(currentPage != parseInt(maxPage)) urlAndLoad(currentPage + 1);
};

function previousPage() {
    if(currentPage != 0) urlAndLoad(currentPage - 1);
};
