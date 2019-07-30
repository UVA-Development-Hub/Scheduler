
$(document).ready(function() {
    params = getUrlParams(location.search);
    var pg = params.page || 0;
    loadPage(parseInt(pg));
    $(".dayinput").click( event => {
        var days = "";
        $(".dayinput").each(function() {
            if($(this).find("input").is(":checked")) days += $(this).attr("id");
        });
        $("#days").attr("value", days);
    });
});
