var averages = [];
    sectionList = [];
    terms = [];
function buildChart(course){
    var bigChart = $('#overallChart');
    var profChart = $('#profChart');
    var profSelect = $('#profSelect');
    var saveData = $.ajax({
        type: 'GET',
        url: "/api/grades",
        data: {
            course: course,
        },
        success: res => { console.log("Success"); },
    }).always(function(data, status) {
        trendChart(data, bigChart, profSelect, profChart);
        sectionChart(data, profSelect, profChart);
    });
}

// This is the graph code.
function trendChart(grades, bigChart, profSelect, profChart){
    //Gather data/build dropdown
    var dropdownList = [];
    for (var term in grades['grades']) {
        termGradeDict = grades['grades'][term];
        terms.push(term);
        termSections = [];
        var sum = 0;
        for (var sect in termGradeDict){
            sectionList.push(term+"*"+sect);
            sum += parseFloat(termGradeDict[sect][0]);
            sect = sect.replace(/["']/g, "").split("|");
            dropdownList.push(term +" Section " + sect[2]+" "+sect[1] + " " + sect[0]);
        }
        var termGPA = Math.round((sum*1.0/Object.keys(termGradeDict).length)*100)/100;
        averages.push(termGPA);
    }

    for (i = sectionList.length-1; i > -1 ; i--){
        profSelect.append( '<option value="'+sectionList[i]+'">'+dropdownList[i]+'</option>' );
    }

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

function sectionChart(grades, profSelect, profChart){
    gradeMap = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "D-", "F", "OT", "DR", "W"];
    section = profSelect.val().split("*");
    // Gives an array such as ["1118", "'Floryan|Mark|1'"]
    chartData=grades['grades'][section[0]][section[1]].slice(1,16);
    var data = {
        labels: gradeMap,
        datasets:[
            {
            label:"Number",
            borderColor:'#007bff',
            data: chartData,
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
                },
            }],
        },
    };


    var myBarChart = new Chart(profChart, {
        type: 'bar',
        data: data,
        options: options,
    });
}
