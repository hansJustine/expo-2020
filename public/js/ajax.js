

$.get('/adminhub/api/datas', (data) => {
    const charData = JSON.stringify(data.allAwards);
    const charData2 = JSON.stringify(data.allBooths);
    var options = {
        series: [{
            data: []
        }],
        chart: {
            type: 'bar',
            height: 300
        },
        title: {
            text: '',
            align: 'center'
        },
        subtitle: {
            text: 'Votes',
            align: 'center',
            floating: true
        },
        dataLabels: {
            enabled: true
        },
        plotOptions: {
            bar: {
                distributed: true
            }
        },
        xaxis: {
            categories: [],
        },
        colors: [],
        tooltip:{
            theme: 'dark',
            y: {
                title: {
                    formatter: function(){
                        return ''
                    }
                }
            }
        }
    };
    
    for(var i = 0; i < data.allAwards.length; i++){
            options.title.text = data.allAwards[i].awardName + ' Award'
            data.allBooths.forEach((booth) => {
                options.xaxis.categories.push(booth.boothName);
                window[booth._id] = 0 
                booth.vote.forEach((vote) => { 
                    if(vote.awardId == data.allAwards[i]._id){ 
                        window[booth._id] += Number(vote.voteCount) 
                    }
                });
                options.series[0].data.push(window[booth._id]);
                options.colors.push(booth.color);
            });
            var chart = new ApexCharts(document.querySelector('#award'+i), options);
            chart.render();
            options.series[0].data = [];
            options.xaxis.categories = [];
            options.colors = [];
            options.title.text = '';
    }
});

$.get('/adminhub/api/datas', (data) => {
    const charData = JSON.stringify(data.states);
    const webState = data.states;
    if(webState.state){
        $('.stateBtn').text("We're Going Offline");
        $('.stateMsg').text("ONLINE");
        $('.webState').css("color", "#20d420");
    }else{
        $('.stateBtn').text("We're Going Live");
        $('.stateMsg').text("OFFLINE");
        $('.webState').css("color", "red");
    }
});

$.qrCodeReader.jsQRpath = '/js/jsQR/jsQR.js';
$.qrCodeReader.beepPath = '/audio/beep.mp3';

// $('#openreader-btn').qrCodeReader({
//     target: '#target-input',
//     audioFeedback: true,
//     multiple: false,
//     skipDuplicates: true,
//     lineColor: '#FF3B58',
//     callback: function(codes) {
//         $.ajax({
//             type: 'POST',
//             url: '/login',
//             contentType: 'application/json',
//             data: JSON.stringify({'username': codes, 'password': codes}),
//             success: function (data) {
//                 window.location.href = '/login'
//             }
//         })
//     }
// });

$('#voteBtn').qrCodeReader({
    target: '#printCode',
    audioFeedback: true,
    multiple: false,
    skipDuplicates: true,
    lineColor: '#FF3B58',
    callback: function(code) {
        $.ajax({
            type: 'POST',
            url: '/vote',
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify({'code': code, 'awardId': $('#awardId').val()})
        }).done(function(data){
            const stringifyData = JSON.stringify(data); 
            if(data.status == '400'){
                toastr.error(data.msg, "Error");
            }
            if(data.status == '200'){
                toastr.success(data.msg, "Success!");
            }
        }).fail(function(data){
        })
        
    }
});

toastr.options = {
    "closeButton": true,
    "debug": false,
    "newestOnTop": false,
    "progressBar": false,
    "positionClass": "toast-top-center",
    "preventDuplicates": true,
    "showDuration": "300",
    "hideDuration": "1000",
    "timeOut": "5000",
    "extendedTimeOut": "1000",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut"
  }
