var averages = [];
    sectionList = [];
    terms = [];
function fetchGrades(course){
    var bigChart = $('#overallChart');
    var saveData = $.ajax({
        type: 'GET',
        url: "/api/grades",
        data: {
            course: course,
        },
        success: res => { console.log("Success"); },
    }).always(function(data, status) {
        chart(data, bigChart);
    });
}
// This is the graph code.
function chart(grades, bigChart){
    var dropdownList = [];
    for (var term in grades['grades']) {
        termGradeDict = grades['grades'][term];
        terms.push(term);
        termSections = [];
        var sum = 0;
        for (var sect in termGradeDict){
            termSections.push(sect);
            sum += parseFloat(termGradeDict[sect][0]);
            sect = sect.replace(/["']/g, "").split("|");
            dropdownList.push(term +" Section " + sect[2]+" "+sect[1] + " " + sect[0]);
        }
        var termGPA = Math.round((sum*1.0/Object.keys(termGradeDict).length)*100)/100;
        averages.push(termGPA);
        sectionList.push((term,termSections));
    }
    console.log(dropdownList);

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


    var myLineChart = new Chart(bigChart, {
        type: 'line',
        data: data,
        options: options,
    });
}
