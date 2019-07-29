var averages = [];
    sectionList = [];
    terms = [];
var ctx = $('#sampleChart');
function fetchGrades(course){
    var saveData = $.ajax({
        type: 'GET',
        url: "/api",
        data: {
            action: 'grades',
            course: course,
        },
        success: res => { console.log("Success"); },
    }).always(function(data, status) {
        chart(data, ctx);
    });
}
// This is the graph code.
function chart(grades, ctx){
    for (var term in grades['grades']) {
        termGradeDict = grades['grades'][term];
        terms.push(term);
        termSections = [];
        var sum = 0;
        for (var sect in termGradeDict){
            termSections.push(sect);
            sum += parseFloat(termGradeDict[sect][0]);
        }
        var termGPA = Math.round((sum*1.0/Object.keys(termGradeDict).length)*100)/100;
        averages.push(termGPA);
        sectionList.push((term,termSections));
    }
    console.log(sectionList);
    var ctx = $('#sampleChart');

    var data = {
        labels: terms,
        datasets:[
            {
            label:"GPA",
            fill: false,
            pointRadius: 5,
            borderColor:'#007bff',
            data: averages,
            }
        ]
    };

    var options = {
        legend:{
            display:false,
        },
        responsiveness:true,
        maintainAspectRatio:false,
        scales :{
            yAxes:[{
                ticks:{
                    beginAtZero:true,
                    max:4,
                },
            }],
        },
    };


    var myLineChart = new Chart(ctx, {
        type: 'line',
        data: data,
        options: options,
    });
}
