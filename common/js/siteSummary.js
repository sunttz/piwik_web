//访问趋势图
//http://192.168.169.129/piwik/index.php?module=API&method=VisitsSummary.getVisits&idSite=1&period=day&date=last7&format=json&token_auth=e71ba827b18991f694bc0929508c3dfb&translateColumnNames=1
function changeMenu(){
	parent.changeMenu("menu-child-33");
}

$(document).ready(function(){
	idSite = getQueryString("siteId");
	t = getQueryString("t");
	// 加载今日流量
	$("[data-toggle='tooltip']").tooltip();
	getTodayFlow();
	// 加载访客趋势图
	var visitTendencyChart = null;
	init_visit();
	ajax_visit();
	
});
// 图表自适应
window.onresize = function(){
  visitTendencyChart.resize();
}

// 今日流量
function getTodayFlow(){
	var p_t1 = "module=API&method=MultiSites.getOne&idSite="+idSite+"&period=day&date=today&format=JSON&token_auth="+t;
	var p_t2 = "module=API&method=VisitsSummary.get&idSite="+idSite+"&period=day&date=today&format=JSON&token_auth="+t;
	var p_y1 = "module=API&method=MultiSites.getOne&idSite="+idSite+"&period=day&date=yesterday&format=JSON&token_auth="+t;
	var p_y2 = "module=API&method=VisitsSummary.get&idSite="+idSite+"&period=day&date=yesterday&format=JSON&token_auth="+t;
	var urls = new Array();
	urls.push(encodeURI(p_t1));
	urls.push(encodeURI(p_t2));
	urls.push(encodeURI(p_y1));
	urls.push(encodeURI(p_y2));
	var p = getBulkRequestParam(urls);
	ajax_jsonp(piwik_url, p, function(data){
		data = eval(data);
		var ms_t = data[0];
		var vs_t = data[1];
		var ms_y = data[2];
		var vs_y = data[3];
		var todayTr = "<td>今日</td><td>"+ms_t["nb_pageviews"]+"</td><td>"+vs_t["nb_uniq_visitors"]+"</td><td>"+vs_t["nb_visits"]+"</td><td>"+vs_t["nb_users"]+"</td><td>"+vs_t["bounce_rate"]+"</td><td>"+vs_t["avg_time_on_site"]+"</td>";
		var yesterdayTr = "<td>昨日</td><td>"+ms_y["nb_pageviews"]+"</td><td>"+vs_y["nb_uniq_visitors"]+"</td><td>"+vs_y["nb_visits"]+"</td><td>"+vs_y["nb_users"]+"</td><td>"+vs_y["bounce_rate"]+"</td><td>"+vs_y["avg_time_on_site"]+"</td>";
		$("#today-flow-table tr.today").html(todayTr);
		$("#today-flow-table tr.yesterday").html(yesterdayTr);
	});
}

// 时间切换
function changeDate(date){
	$("#dateDiv .btn").removeClass("active");
$("#dateDiv .btn[data="+date+"]").addClass("active");
$("#date").val(date);
	ajax_visit();
}
// 访客趋势图start
// 初始化访客趋势图
function init_visit(){
visitTendencyChart = echarts.init(document.getElementById('visitTendency'));
var option = {
    title: {},
    tooltip: {trigger: 'axis',},
    legend: {bottom : '6%'},
    grid: {left: '8%',right: '8%',top: '8%',containLabel: true},
    toolbox: {feature: {}},
    xAxis: {type: 'category',boundaryGap: false},
    yAxis: {type: 'value'},
    series: []
};
visitTendencyChart.setOption(option);
}
//加载访客趋势图
function ajax_visit(){
	var date = $("#date").val(); // 日期
	var visitTendencyIndex = $("#visitTendencyIndex").val(); // 指标
	var param = {};
	var option = {};
	visitTendencyChart.showLoading();
	// 浏览量(PV)
	if("pv"==visitTendencyIndex){
		param = {module:"API",method:"MultiSites.getOne",idSite:idSite,period:"day",date:date,format:"json",token_auth:t};
		ajax_jsonp(piwik_url, param, function(data){
			data = eval(data);
			var categories = new Array();
		var datas = new Array();
		for(var k in data){
			categories.push(k);
			datas.push(data[k].nb_pageviews);
		}
		option = {
			legend: {data:["浏览量(PV)"]},
			tooltip:{formatter:function(params){return params[0].name + ' <br/>' + params[0].seriesName + ": " + params[0].value;}},
	    		xAxis: {data:categories},
	    		yAxis: {axisLabel:{formatter: '{value}'}},
	    		series:[{name:'浏览量(PV)',type:'line',stack: '浏览量(PV)',itemStyle:{normal:{color: '#87CEEB',lineStyle:{color:'#87CEEB'}}},
	            areaStyle: {normal: {color:'#87CEEB'}},data:datas
	    		}]
		};
		visitTendencyChart.hideLoading();
		visitTendencyChart.setOption(option);
		});
	}
	// 访客数(UV)
	else if("uv"==visitTendencyIndex){
		param = {module:"API",method:"VisitsSummary.get",idSite:idSite,period:"day",date:date,format:"json",token_auth:t,columns:"nb_uniq_visitors"};
		ajax_jsonp(piwik_url, param, function(data){
			data = eval(data);
			var categories = new Array();
		var datas = new Array();
		for(var k in data){
			categories.push(k);
			datas.push(data[k]);
		}
		option = {
			legend: {data:["访客数(UV)"]},
			tooltip:{formatter:function(params){return params[0].name + ' <br/>' + params[0].seriesName + ": " + params[0].value;}},
	    		xAxis: {data:categories},
	    		yAxis: {axisLabel:{formatter: '{value}'}},
	    		series:[{name:'访客数(UV)',type:'line',stack: '访客数(UV)',itemStyle:{normal:{color: '#87CEEB',lineStyle:{color:'#87CEEB'}}},
	            areaStyle: {normal: {color:'#87CEEB'}},data:datas
	    		}]
		};
		visitTendencyChart.hideLoading();
		visitTendencyChart.setOption(option);
		});
	}
	// 访问
	else if("visit" == visitTendencyIndex){
		param = {module:"API",method:"VisitsSummary.get",idSite:idSite,period:"day",date:date,format:"json",token_auth:t,columns:"nb_visits"};
		ajax_jsonp(piwik_url, param, function(data){
			data = eval(data);
			var categories = new Array();
		var datas = new Array();
		for(var k in data){
			categories.push(k);
			datas.push(data[k]);
		}
		option = {
			legend: {data:["访问"]},
			tooltip:{formatter:function(params){return params[0].name + ' <br/>' + params[0].seriesName + ": " + params[0].value;}},
	    		xAxis: {data:categories},
	    		yAxis: {axisLabel:{formatter: '{value}'}},
	    		series:[{name:'访问',type:'line',stack: '访问',itemStyle:{normal:{color: '#87CEEB',lineStyle:{color:'#87CEEB'}}},
	            areaStyle: {normal: {color:'#87CEEB'}},data:datas
	    		}]
		};
		visitTendencyChart.hideLoading();
		visitTendencyChart.setOption(option);
		});
	}
	// 用户数
	else if("user" == visitTendencyIndex){
		param = {module:"API",method:"VisitsSummary.get",idSite:idSite,period:"day",date:date,format:"json",token_auth:t,columns:"nb_users"};
		ajax_jsonp(piwik_url, param, function(data){
			data = eval(data);
			var categories = new Array();
		var datas = new Array();
		for(var k in data){
			categories.push(k);
			datas.push(data[k]);
		}
		option = {
			legend: {data:["用户数"]},
			tooltip:{formatter:function(params){return params[0].name + ' <br/>' + params[0].seriesName + ": " + params[0].value;}},
	    		xAxis: {data:categories},
	    		yAxis: {axisLabel:{formatter: '{value}'}},
	    		series:[{name:'用户数',type:'line',stack: '用户数',itemStyle:{normal:{color: '#87CEEB',lineStyle:{color:'#87CEEB'}}},
	            areaStyle: {normal: {color:'#87CEEB'}},data:datas
	    		}]
		};
		visitTendencyChart.hideLoading();
		visitTendencyChart.setOption(option);
		});
	}
	// 跳出率
	else if("br" == visitTendencyIndex){
		param = {module:"API",method:"VisitsSummary.get",idSite:idSite,period:"day",date:date,format:"json",token_auth:t,columns:"bounce_rate"};
		ajax_jsonp(piwik_url, param, function(data){
			data = eval(data);
			var categories = new Array();
		var datas = new Array();
		for(var k in data){
			categories.push(k);
			var br = data[k];
			if(br instanceof Array){
				br = "0";
			}else{
				br = br.substr(0,br.length-1);
			}
			datas.push(br);
		}
		option = {
			legend: {data:["跳出率"]},
			tooltip:{formatter:function(params){return params[0].name + ' <br/>' + params[0].seriesName + ": " + params[0].value + '%';}},
	    		xAxis: {data:categories},
	    		yAxis: {axisLabel:{formatter: '{value}%'}},
	    		series:[{name:'跳出率',type:'line',stack: '跳出率',itemStyle:{normal:{color: '#87CEEB',lineStyle:{color:'#87CEEB'}}},
	            areaStyle: {normal: {color:'#87CEEB'}},data:datas
	    		}]
		};
		visitTendencyChart.hideLoading();
		visitTendencyChart.setOption(option);
		});
	}
	// 平均访问时长(秒)
	else if("at" == visitTendencyIndex){
		param = {module:"API",method:"VisitsSummary.get",idSite:idSite,period:"day",date:date,format:"json",token_auth:t,columns:"avg_time_on_site"};
		ajax_jsonp(piwik_url, param, function(data){
			data = eval(data);
			var categories = new Array();
		var datas = new Array();
		for(var k in data){
			categories.push(k);
			var at = data[k];
			if(at instanceof Array){
				at = 0;
			}
			datas.push(at);
		}
		option = {
			legend: {data:["平均访问时长(秒)"]},
			tooltip:{formatter:function(params){return params[0].name + ' <br/>' + params[0].seriesName + ": " + params[0].value;}},
	    		xAxis: {data:categories},
	    		yAxis: {axisLabel:{formatter: '{value}'}},
	    		series:[{name:'平均访问时长(秒)',type:'line',stack: '平均访问时长(秒)',itemStyle:{normal:{color: '#87CEEB',lineStyle:{color:'#87CEEB'}}},
	            areaStyle: {normal: {color:'#87CEEB'}},data:datas
	    		}]
		};
		visitTendencyChart.hideLoading();
		visitTendencyChart.setOption(option);
		});
	}
	/**
	var param_visits = "module=API&method=VisitsSummary.getVisits&idSite="+idSite+"&period=day&date="+date+"&format=json&token_auth="+t+"&translateColumnNames=1";
	var param_uniqueVisitors = "module=API&method=VisitsSummary.getUniqueVisitors&idSite="+idSite+"&period=day&date="+date+"&format=json&token_auth="+t;
	var urls = new Array();
	urls.push(encodeURI(param_visits));
	urls.push(encodeURI(param_uniqueVisitors));
	var param = {module:"API",method:"API.getBulkRequest",format:"json",urls:urls};
	visitTendencyChart.showLoading();
	ajax_jsonp(piwik_url, param, function(data){
		data = eval(data);
	var categories = new Array();
	var datas = new Array();
	var visit_data = data[0];
	for(var cat in visit_data){
		categories.push(cat);
		datas.push(visit_data[cat]);
	}
	var uniqueVisitors_data = data[1];
	var categories1 = new Array();
	var datas1 = new Array();
	for(var cat1 in uniqueVisitors_data){
		categories1.push(cat1);
		datas1.push(uniqueVisitors_data[cat1]);
	}
	var option = {
		legend: {
        		data:['访问',"唯一访客"]
    		},
    		xAxis: {
    			data:categories
    		},
    		series:[{
    			name:'访问',
            type:'line',
            stack: '访问',
            areaStyle: {normal: {}},
            data:datas
    		},{
    			name:'唯一访客',
            type:'line',
            stack: '唯一访客',
            areaStyle: {normal: {}},
            data:datas1
    		}]
	};
	visitTendencyChart.hideLoading();
	visitTendencyChart.setOption(option);
	});
	*/
}

// 浏览量、访客数按钮点击事件
function visitTendency_btn1(index){
	$("#visitTendency_btn_text").text("其他");
$("#visitTendencyIndex").val(index);
$("#btn_group button").removeClass("active");
$("#btn_"+index).addClass("active");
// 刷新访客趋势图
	ajax_visit();
}
// 访客趋势图其他按钮点击事件
function visitTendency_btn2(index){
	$("#visitTendency_btn_text").text($("#btn_"+index).text());
$("#visitTendencyIndex").val(index);
$("#btn_group button").removeClass("active");
$("#btn_other").addClass("active");
// 刷新访客趋势图
	ajax_visit();
}
// 访客趋势图end
   