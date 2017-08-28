var userTrendData = null; // 用户趋势数据
var label = ""; // 用户ID
$(function(){
	idSite = getQueryString("siteId");
	t = getQueryString("t");
	label = getQueryString("label");
	//默认最近7天
	$("#date").html(getDateStr(-6)+" ~ "+getDateStr(0));
    	$("#startDate").val(getDateStr(-6));
	$("#endDate").val(getDateStr(0));
	$("#userLabel").html(label);
	// 初始化用户趋势图
	var userTrendChart = null;
	init_userTrendChart();
	ajax_userTrend();
	
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
				  $("#date").html(getDateStr(0));
				  break;
				case "yesterday":
					$("#startDate").val(getDateStr(-1));
					$("#endDate").val(getDateStr(-1));
					$("#date").html(getDateStr(-1));
				  break;
				case "thisWeek":
					$("#startDate").val(getDateStr(-6));
					$("#endDate").val(getDateStr(0));
					$("#date").html(getDateStr(-6)+" ~ "+getDateStr(0));
				  break;
				case "thisMonth":
					$("#startDate").val(getDateStr(-29));
					$("#endDate").val(getDateStr(0));
					$("#date").html(getDateStr(-29)+" ~ "+getDateStr(0));
				  break;
				default:
					null;
			};
			ajax_userTrend();
		} 
    });
});
// 结束时间选择事件
function dateSelect(){
	$("#date").html($("#startDate").val()+" ~ "+$("#endDate").val());
	$("#dateDiv button").removeClass("active");
	ajax_userTrend();
}
// 图表自适应
window.onresize = function(){
	userTrendChart.resize();
}

// 获取用户趋势数据
function ajax_userTrend(){
	var startDate = $("#startDate").val();
	var endDate = $("#endDate").val();
	var param = {module:'API',method:'UserId.getUsers',idSite:idSite,period:'day',date:startDate+','+endDate,format:'JSON',token_auth:t,label:label};
	ajax_jsonp(piwik_url,param,function(data){
		userTrendData = eval(data);
		ana_userTrendChart();
		anaCsTable();
	});
}

// 初始化用户趋势图
function init_userTrendChart(){
	userTrendChart = echarts.init(document.getElementById('userTrend'));
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
	userTrendChart.setOption(option);
}
//加载用户趋势图
function ana_userTrendChart(){
	var userTrendIndex = $("#userTrendIndex").val(); // 指标
	userTrendChart.showLoading();
	var categories = new Array();
	var datas = new Array();
	var option = {};
	var name = "";
	// 访问
	if("nv"==userTrendIndex){
		name = "访问";
		for(var time in userTrendData){
			categories.push(time);
			var v = userTrendData[time];
			if(v.length == 0){
				datas.push(0);
			}else{
				datas.push(v[0].nb_visits);
			}
		}
	}
	// 活动	
	else if("na"==userTrendIndex){
		name = "活动";
		for(var time in userTrendData){
			categories.push(time);
			var v = userTrendData[time];
			if(v.length == 0){
				datas.push(0);
			}else{
				datas.push(v[0].nb_actions);
			}
		}
	}
	// 平均活动次数	
	else if("ana"==userTrendIndex){
		name = "平均活动次数";
		for(var time in userTrendData){
			categories.push(time);
			var v = userTrendData[time];
			if(v.length == 0){
				datas.push(0);
			}else{
				v = v[0];
				var ana = (v.nb_actions / v.nb_visits).toFixed(1);
				datas.push(ana);
			}
		}
	}
	// 网站平均停留时间	
	else if("atos"==userTrendIndex){
		name = "网站平均停留时间";
		for(var time in userTrendData){
			categories.push(time);
			var v = userTrendData[time];
			if(v.length == 0){
				datas.push(0);
			}else{
				v = v[0];
				var atos = (v.sum_visit_length / v.nb_visits).toFixed(0);
				datas.push(atos);
			}
		}
	}
	// 跳出率	
	else if("br"==userTrendIndex){
		name = "跳出率";
		for(var time in userTrendData){
			categories.push(time);
			var v = userTrendData[time];
			if(v.length == 0){
				datas.push(0);
			}else{
				v = v[0];
				var br = (v.bounce_count / v.nb_visits * 100).toFixed(0);
				datas.push(br);
			}
		}
	}
	
	if("atos"==userTrendIndex){
		option = {
			legend: {data:[name]},
			tooltip:{formatter:function(params){return params[0].name + ' <br/>' + params[0].seriesName + ": " + formatTime(params[0].value);}},
	    		xAxis: {data:categories},
	    		yAxis: {axisLabel:{formatter: '{value}'}},
	    		series:[{name:name,type:'line',itemStyle:{normal:{color: '#87CEEB',lineStyle:{color:'#87CEEB'}}},
	            areaStyle: {normal: {color:'#87CEEB'}},data:datas
	    		}]
		};
	}else if("br"==userTrendIndex){
		option = {
			legend: {data:[name]},
			tooltip:{formatter:function(params){return params[0].name + ' <br/>' + params[0].seriesName + ": " + params[0].value + '%';}},
	    		xAxis: {data:categories},
	    		yAxis: {axisLabel:{formatter: '{value}%'}},
	    		series:[{name:name,type:'line',itemStyle:{normal:{color: '#87CEEB',lineStyle:{color:'#87CEEB'}}},
	            areaStyle: {normal: {color:'#87CEEB'}},data:datas
	    		}]
		};
	}
	else{
		option = {
			legend: {data:[name]},
			tooltip:{formatter:function(params){return params[0].name + ' <br/>' + params[0].seriesName + ": " + params[0].value;}},
	    		xAxis: {data:categories},
	    		yAxis: {axisLabel:{formatter: '{value}'}},
	    		series:[{name:name,type:'line',itemStyle:{normal:{color: '#87CEEB',lineStyle:{color:'#87CEEB'}}},
	            areaStyle: {normal: {color:'#87CEEB'}},data:datas
	    		}]
		};
	}
	userTrendChart.hideLoading();
	userTrendChart.setOption(option);
}

// 指标按钮点击事件
function userTrend_btn(index){
	$("#userTrend_btn_text").text("指标："+$("#btn_"+index).text());
	$("#userTrendIndex").val(index);
	ana_userTrendChart();
}

// 指标详情表start
// 解析用户趋势数据
function anaCsTable(){
	var csData = [];
	for(var time in userTrendData){
		var v = userTrendData[time];
		if(v.length == 0){
			csData.push({time:time,nv:'0',na:'0',ana:'0',atos:'00:00:00',br:'0%'});
		}else{
			v = v[0];
			var nv = v.nb_visits;
			var na = v.nb_actions;
			var ana = (na / nv).toFixed(1);
			var atos = formatTime((v.sum_visit_length / nv).toFixed(0));
			var br = (v.bounce_count / nv * 100).toFixed(0) + '%';
			csData.push({time:time,nv:nv,na:na,ana:ana,atos:atos,br:br});
		}
	}
	initCsTable(csData);
}
// 构造表格数据
function initCsTable(csData){
	var customHeader = "<thead>"
						+"<tr><th rowspan='2'>日期</th><th colspan='2'>网站基础指标</th><th colspan='3'>流量质量指标</th></tr>"
						+"<tr><th title='访客第一次访问你的网站或者距离上次访问时间超过30分钟，会被统计为新的访问。'>访问</th>"
						+"<th title='访客执行的活动次数。活动包括查看页面、站内搜索、下载或者离站链接。'>活动</th>"
						+"<th title='访问期间的平均活动次数 (包括查看页面、站内搜索、下载或离站链接)。'>平均活动次数</th>"
						+"<th title='平均停留时间。'>网站平均停留时间</th>"
						+"<th title='只查看单个页面的百分比，即访客直接从入口页面离开网站。'>跳出率</th>"
						+"</tr></thead>";
	var cs = new table({
		"tableId": "cs_table", //必须
		"headers": ["日期", "访问", "活动", "平均活动次数", "网站平均停留时间","跳出率"], //必须
		"customHeader" : customHeader, // 自定义表头，若定义则覆盖默认表头
		"data": csData.reverse(), //必须
		"displayNum": 15, //必须  默认 10
		"groupDataNum": 9 //可选  默认 10
	});
}
// 指标详情表end