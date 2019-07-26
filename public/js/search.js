
$(document).ready(function() {
    $(".dayinput").click( event => {
        var days = "";
        $(".dayinput").each(function() {
            if($(this).find("input").is(":checked")) days += $(this).attr("id");
        });
        $("#days").attr("value", days);
    });
});
