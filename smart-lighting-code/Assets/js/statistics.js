$(document).ready(function(){
	$.ajax({
        type: "post",
        url : "https://meaja.xyz/LateMan/Statistics",
        data: {
        },
        timeout : 2000,
        success: function(data){

        	var TotalClass = $("#TotalClass").text(data.totalClass);
        	var TotalLate = $("#TotalLate").text(data.totalLate);
        	var Value = data.totalLate*100 / data.totalClass;
        	var Percent = $("#Percent").text(Value.toFixed(2) + "%");
        	if(Value < 50)
        		Percent.css("color","#9CCF31");
        	else
        		Percent.css("color","#cc0000");

        	$('#Graph').highcharts({

    	        chart: {
    	            polar: true,
    	            type: 'line'
    	        },

    	        title: {
    	            text: '수업 별 지각 통계',
    	        },

    	        pane: {
    	            size: '80%'
    	        },

    	        xAxis: {
    	            categories: ['경영학 원론', '컴파일러 구성', '창의설계 프로젝트1', '임베디드 시스템 프로젝트', '리더십과 커뮤니케이션'],
    	            tickmarkPlacement: 'on',
    	            lineWidth: 0
    	        },

    	        yAxis: {
    	            gridLineInterpolation: 'polygon',
    	            lineWidth: 0,
    	            min: 0
    	        },

    	        tooltip: {
    	            shared: true,
    	            pointFormat: '<span style="color:{series.color}">{series.name}: <b>{point.y:,.0f}회</b><br/>'
    	        },

    	        legend: {
    	        	align: 'center',
    	            verticalAlign: 'bottom',
    	            y: 0,
    	            layout: 'horizontal'
    	        },

    	        series: [{
    	            name: '총 지각 수',
    	            data: data.totalClassLate,
    	            pointPlacement: 'on'
    	        }, {
    	            name: '이번 달 지각 수',
    	            data: data.thisMonthClassLate,
    	            pointPlacement: 'on'
    	        }]

    	    });
        },
        error: function(err){
        	console.log(err);
        }
 	});

});
