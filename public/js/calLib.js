
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
function getSearchPage(page, per) {
    // Filter out non supported fields
    var supported = ["term", "subject", "catalog_number", "title", "instructor", "days"],
        d = getUrlParams(location.search);
    Object.keys(d).forEach( key => {
        if(!supported.includes(key)) delete d[key];
    });
    d["action"] = "search";
    d["per"] = per;
    d["page"] = page;
    $.get("/api", d, (data, status) => {
        console.log(data);
    });
}
