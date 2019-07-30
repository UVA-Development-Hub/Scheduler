
// Assuming a format like the search results page, loads the calendar(s) from the ith result
function loadCalendar(i) {
    var div = $(".course")[i],
        ids = [],
        calspots = $(div).find(".calspot"),
        idregX = new RegExp(/\d+/g);


    $(div).find(".sis_id").each( () => {
        $(this).css('background-color', 'red');
        ids.push(idregX.exec($(this).text()));
    });
}

// Use AJAX to get and display Mongo results
function getSearchPage(page, per, callback, dict) {
    try {
        var d = Object.assign({}, dict, getUrlParams(location.search));
        // Filter out non supported fields
        var supported = ["term_id", "subject", "catalog_number", "title", "instructor", "days"];
        Object.keys(d).forEach( key => {
            if(!supported.includes(key) || d[key] == '') delete d[key];
        });
        if(!d["term_id"]) {
            var courseRE = new RegExp(/^.*\/course\/(\d+)/g);
            d["term_id"] = courseRE.exec(window.location)[1];
        }
        d["per"] = per;
        d["page"] = page;
        $.get("/api/search", d, (data, status) => {
            callback(data.data, data.pages);
        });
    } catch(e) { $(".pageselector").hide(); }
}

// Loads subjects from the given school
function loadSubjects(from, callback) {
    $.get("/api/subjects", { school: from }).always(callback);
}
