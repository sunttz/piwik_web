$(function(){
	idSite = getQueryString("siteId");
	t = getQueryString("t");
	$("[data-toggle='tooltip']").tooltip();
	//默认最近7天
    	$("#startDate").val(getDateStr(-6));
	$("#endDate").val(getDateStr(0));
	// 加载访客趋势图
	var visitTrendChart = null;
	init_visit();
	ajax_visit();
	
	//时间切换
	$("#dateDiv button").click(function() {
		var str = $(this).attr("data");
		if (str == "today"
				|| str == "yesterday"
				|| str == "thisWeek"
				|| str == "thisMonth") {
			$("#dateDiv .btn").removeClass("active");
			$("#dateDiv .btn[data="+str+"]").addClass("active");
			$("#startDate").val("");
			$("#endDate").val("");
			$("#dateKind").val(str);
			switch(str){
				case "today":
				  $("#startDate").val(getDateStr(0));
				  $("#endDate").val(getDateStr(0));
				  break;
				case "yesterday":
					$("#startDate").val(getDateStr(-1));
					$("#endDate").val(getDateStr(-1));
				  break;
				case "thisWeek":
					$("#startDate").val(getDateStr(-6));
					$("#endDate").val(getDateStr(0));
				  break;
				case "thisMonth":
					$("#startDate").val(getDateStr(-29));
					$("#endDate").val(getDateStr(0));
				  break;
				default:
					null;
			};
			// 加载访客趋势图
			ajax_visit();
		} 
    });
});

// 图表自适应
window.onresize = function(){
	visitTrendChart.resize();
}

// 访客趋势图start
// 加载访客概览图
function ajax_visit_summary(){
	
}
// 初始化访客趋势图
function init_visit(){
	visitTrendChart = echarts.init(document.getElementById('visitTrend'));
	var option = {
	    title: {},
	    tooltip: {trigger: 'axis',},
	    legend: {bottom : '6%'},
	    grid: {left: '8%',right: '8%',top: '5%',containLabel: true},
	    toolbox: {feature: {}},
	    xAxis: {type: 'category',boundaryGap: false},
	    yAxis: {type: 'value'},
	    series: []
	};
	visitTrendChart.setOption(option);
}
//加载访客趋势图
function ajax_visit(){
	var startDate = $("#startDate").val();
	var endDate = $("#endDate").val();
	var visitTendencyIndex = $("#visitTendencyIndex").val(); // 指标
	var param = {};
	var option = {};
	visitTrendChart.showLoading();
	// 浏览量(PV)
	if("pv"==visitTendencyIndex){
		param = {module:"API",method:"MultiSites.getOne",idSite:idSite,period:"day",date:startDate+","+endDate,format:"json",token_auth:t};
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
			visitTrendChart.hideLoading();
			visitTrendChart.setOption(option);
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
}

// 指标按钮点击事件
function visitTendency_btn(index){
	$("#visitTendency_btn_text").text("指标："+$("#btn_"+index).text());
	$("#visitTendencyIndex").val(index);
	// 刷新访客趋势图
	ajax_visit();
}
// 访客趋势图end