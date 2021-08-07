let go = {};

$(document).ready(main);

function main(){
    log("Page is Loaded");

    // Expand/Collapse table Button
    $(document).on('click', '#btnExpand', function() {
        $('#section').css({
            'overflow': 'inherit'
        });
        $(this).html("Collapse");
        $(this).attr('id','btnCollapse');
    });
    $(document).on('click', '#btnCollapse', function() {
        $('#section').css({
            'overflow': 'scroll'
        });
        $(this).html("Expand");
        $(this).attr('id','btnExpand');

    });
    
    // Loading Json Data
    let option = {
        url:"https://ejd.songho.ca/ios/covid19.json", 
        type: "GET", 
        dataType: "json"
    };
    $.ajax(option).then(data => {
        log("Success");

        go.json = data;
        defaultCanada();
        changeHandler(go.json);
        
    }).catch(() => log("Error loading JSON"));

    // change event handler
    function changeHandler(){
        $("#province").change(function(){

            // Deleting previous table
            $("#table tbody tr").remove();
            // Getting selected Province from drop down
            var e = document.getElementById("province");
            var strProv = e.options[e.selectedIndex].text;
            // logging if province was changed and to which province
            log("selected province is " + strProv);
            // Filtering data by selected province
            go.provData = go.json.filter( e => e.prname == strProv);
            // Displaying data in table
            tableCreate(go.provData);
            // sorting data by date
            const sortedProv = go.provData.sort((a,b) => b.date - a.date);
            // Removing existing HTML date-diplay after every Province selection to avoid duplicates
            var dateDom = document.getElementById("createdDate");
            dateDom.remove();
            // 
            valuesArray(go.provData);
            // 
            const lastItem = sortedProv[sortedProv.length-1];
            var dailyDom = document.getElementById("createdDaily");
            dailyDom.remove();
            var totalDom = document.getElementById("createdTotal");
            totalDom.remove();
            addCases(lastItem);
            console.log(lastItem);
            
        })
    }
    // Default Canada data selected on load
    function defaultCanada(){
        var e = document.getElementById("province");
        var strProv = e.options[e.selectedIndex].text;
        go.provData = go.json.filter( e => e.prname == strProv);
        // Creating table with default Canada data
        tableCreate(go.provData);
        const sortedProv = go.provData.sort((a,b) => b.date - a.date);
        var dateDom = document.getElementById("createdDate");
        dateDom.remove();
        valuesArray(go.provData);
        const lastItem = sortedProv[sortedProv.length-1];
        var dailyDom = document.getElementById("createdDaily");
        dailyDom.remove();
        var totalDom = document.getElementById("createdTotal");
        totalDom.remove();
        addCases(lastItem);
        console.log(lastItem);
    }

    // Populating table wihh data
    function tableCreate(data){
        for(let e of data){
            var markup = '';
            markup += '<tr>';
            markup += '<td>' + e.date + '</td>';
            markup += '<td>' + e.numtoday + '</td>';
            markup += '<td>' + e.numtotal + '</td>';
            markup += '<td>' + e.numteststoday + '</td>';
            markup += '<td>' + e.numtests + '</td>';
            markup += '<td>' + e.numdeathstoday + '</td>';
            markup += '<td>' + e.numdeaths + '</td>';
            tableBody = $("table tbody");
            tableBody.append(markup);
        }
    }
   
    
    function addCases(lastItem){
        var para = document.createElement("b");
        para.setAttribute("id", "createdDaily");
        var node = document.createTextNode(lastItem.numtoday);
        para.appendChild(node);
        var daily = document.getElementById("daily_cases");
        daily.appendChild(para);

        var totalpara = document.createElement("b");
        totalpara.setAttribute("id", "createdTotal");
        var node = document.createTextNode(lastItem.numtotal);
        totalpara.appendChild(node);
        var total = document.getElementById("total_cases");
        total.appendChild(totalpara);
    }

    function valuesArray(){
        const MS_PER_DAY = 24 * 60 * 60 * 1000;
        let time1 = new Date("2020-01-31").getTime();
        let time2 = new Date("2020-02-08").getTime();
        let dateCount = (time2 -time1) / MS_PER_DAY + 1;

        let values = new Array(dateCount).fill(0);
        let dates = new Array(dateCount).fill(0);

        // for second graph
        let values2 = new Array(dateCount).fill(0);

        let firstTime = new Date(go.provData[0].date).getTime();
        for(let e of go.provData){
            let currTime = new Date(e.date).getTime();
            let index = (currTime - firstTime) /MS_PER_DAY;
            values[index] = e.numtoday;
            values.push(values[index]);

            dates[index] = e.date;
            dates.push(dates[index]);

            // for second graph
            values2[index] = e.numtotal;
            values2.push(values[index]);
        }
        
        // drawing first graph and inserting in HTML
        drawChart(dates,values);
        var datepara = document.createElement("b");
        datepara.setAttribute("id", "createdDate");
        var lastDate = dates[dates.length - 1];
        var node = document.createTextNode(lastDate);
        datepara.appendChild(node);
        var date2 = document.getElementById("calendarLabel");
        date2.appendChild(datepara); 
        
        // drawing second graph 
        drawChart2(dates,values2);
    }

    function drawChart(xValues, yValues){
        if(go.chart)
            go.chart.destroy();
        let context = document.getElementById("chart").getContext("2d");

        go.chart = new Chart(context,
        {
            type:"line",
            data:
            {
                labels:xValues,
                datasets:
                [{
                    data: yValues,
                    lineTension: 0,
                    backgroundColor: [

                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)',
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(153, 102, 255, 0.2)',
                        'rgba(255, 159, 64, 0.2)'
                    ],
                    pointBorderColor: 'rgb(255,0,0)',
                    pointBackgroundColor: 'rgb(255,0,0)',
                    pointHoverBorderColor: '#55bae7',
                    pointHoverBackgroundColor: '#55bae7'
                }]
            },
            options:
            {
                maintainAspectRatio: false,
                responsive:true,
                title:
                {
                    display: true,
                    text: "Daily Confirmed Cases",
                    fontSize:16
                },
                legend:
                {
                    display:false
                }
            }

        });
    }

    function drawChart2(xValues, yValues){
        if(go.chart2)
            go.chart2.destroy();
        let context = document.getElementById("chart2").getContext("2d");

        go.chart = new Chart(context,
        {
            type:"line",
            data:
            {
                labels:xValues,
                datasets:
                [{
                    data: yValues,
                    lineTension: 0,
                    backgroundColor: [
                        'rgba(63, 145, 227, 0.2)',
                    ],
                    pointBorderColor: 'rgb(52,119,235)',
                    pointBackgroundColor: 'rgb(52,119,235)',
                    pointHoverBorderColor: '#34eb8c',
                    pointHoverBackgroundColor: '#34eb8c'
                }]
            },
            options:
            {
                maintainAspectRatio: false,
                responsive:true,
                title:
                {
                    display: true,
                    text: "Total Confirmed Cases",
                    fontSize:16
                },
                legend:
                {
                    display:false
                }
            }

        });
    }
    
}
