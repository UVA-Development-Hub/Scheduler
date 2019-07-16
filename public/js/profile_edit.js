$(document).ready(function() {
    $('#double_major').change(function() {
        $('#double_major_input').toggle('slow');
    });

    if($('#double_major').is(':checked')) {
        $('#double_major_input').show();
    }
});
