
$(document).ready(function() {
    $(".dayinput").click( event => {
        var days = "";
        $(".dayinput").each(function() {
            if($(this).is(":checked")) days += $(this).attr("id");
        });
        $("#days").attr("value", days);
    });
});
