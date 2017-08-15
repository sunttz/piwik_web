var urlSummary = null; // 概览数据,切换时间刷新
var urlDetail = null; // 详情数据,切换时间刷新

$(function(){
	idSite = getQueryString("siteId");
	t = getQueryString("t");
	url = getQueryString("href");
	$("[data-toggle='tooltip']").tooltip();
	$("#trendUrl").html(cutStr(url,50));
	//默认最近30天
	$("#date").html(getDateStr(-29)+" ~ "+getDateStr(0));
    	$("#startDate").val(getDateStr(-29));
	$("#endDate").val(getDateStr(0));
	
	// 初始化url趋势图
	var urlTrendChart = null;
	init_visit();
	ajaxUrlData(); // 刷新当前url趋势数据
	
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
			ajaxUrlData(); // 刷新当前url趋势数据
		} 
    });
});
// 结束时间选择事件
function dateSelect(){
	$("#date").html($("#startDate").val()+" ~ "+$("#endDate").val());
	ajaxUrlData(); // 刷新当前url趋势数据
}
// 图表自适应
window.onresize = function(){
	urlTrendChart.resize();
}

// 刷新当前url趋势数据
function ajaxUrlData(){
	var startDate = $("#startDate").val();
	var endDate = $("#endDate").val();
	var p1 = "module=API&method=Actions.getPageUrl&pageUrl="+url+"&idSite="+idSite+"&period=range&date="+startDate+","+endDate+"&format=JSON&token_auth="+t;
	var p2 = "module=API&method=Actions.getPageUrl&pageUrl="+url+"&idSite="+idSite+"&period=day&date="+startDate+","+endDate+"&format=JSON&token_auth="+t;
	var urls = new Array();
	urls.push(encodeURI(p1));
	urls.push(encodeURI(p2));
	var p = getBulkRequestParam(urls);
	ajax_jsonp(piwik_url,p,function(data){
		data = eval(data);
		urlSummary = data[0];
		urlDetail = data[1];
		ana_visit_summary(); // 加载url概览图
		ana_visit();// 加载url趋势图
		anaCsTable(); // 加载访客数据表
		
	});
}

// url趋势图start
// 加载url概览图
function ana_visit_summary(){
	if(urlSummary.length == 0){
		$("#d_nh").html("0");
		$("#d_nv").html("0");
		$("#d_atop").html("00:00:00");
		$("#d_br").html("0%");
		$("#d_er").html("0%");
		$("#d_atg").html("0");
	}else{
		var d = urlSummary[0];
		$("#d_nh").html(d.nb_hits);
		$("#d_nv").html(d.nb_visits);
		$("#d_atop").html(formatTime(d.avg_time_on_page));
		$("#d_br").html(d.bounce_rate);
		$("#d_er").html(d.exit_rate);
		$("#d_atg").html(d.avg_time_generation);
	}
}
// 初始化url趋势图
function init_visit(){
	urlTrendChart = echarts.init(document.getElementById('urlTrend'));
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
	urlTrendChart.setOption(option);
}
//加载url趋势图
function ana_visit(){
	var urlTendencyIndex = $("#urlTendencyIndex").val(); // 指标
	var option = {};
	urlTrendChart.showLoading();
	// 浏览量(PV)
	if("nh"==urlTendencyIndex){
		var categories = new Array();
		var datas = new Array();
		for(var k in urlDetail){
			categories.push(k);
			if(urlDetail[k].length == 0){
				datas.push(0);
			}else{
				datas.push(urlDetail[k][0].nb_hits);
			}
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
		urlTrendChart.hideLoading();
		urlTrendChart.setOption(option);
	}
	// 唯一页面浏览量
	else if("nv"==urlTendencyIndex){
		var categories = new Array();
		var datas = new Array();
		for(var k in urlDetail){
			categories.push(k);
			if(urlDetail[k].length == 0){
				datas.push(0);
			}else{
				datas.push(urlDetail[k][0].nb_visits);
			}
		}
		option = {
			legend: {data:["唯一页面浏览量"]},
			tooltip:{formatter:function(params){return params[0].name + ' <br/>' + params[0].seriesName + ": " + params[0].value;}},
	    		xAxis: {data:categories},
	    		yAxis: {axisLabel:{formatter: '{value}'}},
	    		series:[{name:'唯一页面浏览量',type:'line',stack: '唯一页面浏览量',itemStyle:{normal:{color: '#87CEEB',lineStyle:{color:'#87CEEB'}}},
	            areaStyle: {normal: {color:'#87CEEB'}},data:datas
	    		}]
		};
		urlTrendChart.hideLoading();
		urlTrendChart.setOption(option);
	}
	// 平均访问时长
	else if("atop" == urlTendencyIndex){
		var categories = new Array();
		var datas = new Array();
		for(var k in urlDetail){
			categories.push(k);
			if(urlDetail[k].length == 0){
				datas.push(0);
			}else{
				datas.push(urlDetail[k][0].avg_time_on_page);
			}
			
		}
		option = {
			legend: {data:["平均访问时长"]},
			tooltip:{formatter:function(params){return params[0].name + ' <br/>' + params[0].seriesName + ": " + formatTime(params[0].value);}},
	    		xAxis: {data:categories},
	    		yAxis: {axisLabel:{formatter: '{value}'}},
	    		series:[{name:'平均访问时长',type:'line',stack: '平均访问时长',itemStyle:{normal:{color: '#87CEEB',lineStyle:{color:'#87CEEB'}}},
	            areaStyle: {normal: {color:'#87CEEB'}},data:datas
	    		}]
		};
		urlTrendChart.hideLoading();
		urlTrendChart.setOption(option);
	}
	// 跳出率
	else if("br" == urlTendencyIndex){
		var categories = new Array();
		var datas = new Array();
		for(var k in urlDetail){
			categories.push(k);
			var br = urlDetail[k];
			if(br.length == 0){
				datas.push("0");
			}else{
				var s = br[0].bounce_rate;
				datas.push(s.substr(0,s.length-1));
			}
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
		urlTrendChart.hideLoading();
		urlTrendChart.setOption(option);
	}
	// 退出率
	else if("er" == urlTendencyIndex){
		var categories = new Array();
		var datas = new Array();
		for(var k in urlDetail){
			categories.push(k);
			var er = urlDetail[k];
			if(er.length == 0){
				datas.push("0");
			}else{
				var s = er[0].exit_rate;
				datas.push(s.substr(0,s.length-1));
			}
		}
		option = {
			legend: {data:["退出率"]},
			tooltip:{formatter:function(params){return params[0].name + ' <br/>' + params[0].seriesName + ": " + params[0].value + '%';}},
	    		xAxis: {data:categories},
	    		yAxis: {axisLabel:{formatter: '{value}%'}},
	    		series:[{name:'退出率',type:'line',stack: '退出率',itemStyle:{normal:{color: '#87CEEB',lineStyle:{color:'#87CEEB'}}},
	            areaStyle: {normal: {color:'#87CEEB'}},data:datas
	    		}]
		};
		urlTrendChart.hideLoading();
		urlTrendChart.setOption(option);
	}
	// 平均生成时长(秒)
	else if("atg" == urlTendencyIndex){
		var categories = new Array();
		var datas = new Array();
		for(var k in urlDetail){
			categories.push(k);
			if(urlDetail[k].length == 0){
				datas.push(0);
			}else{
				datas.push(urlDetail[k][0].avg_time_generation);
			}
		}
		option = {
			legend: {data:["平均生成时长"]},
			tooltip:{formatter:function(params){return params[0].name + ' <br/>' + params[0].seriesName + ": " + params[0].value + '秒';}},
	    		xAxis: {data:categories},
	    		yAxis: {axisLabel:{formatter: '{value}秒'}},
	    		series:[{name:'平均生成时长',type:'line',stack: '平均生成时长',itemStyle:{normal:{color: '#87CEEB',lineStyle:{color:'#87CEEB'}}},
	            areaStyle: {normal: {color:'#87CEEB'}},data:datas
	    		}]
		};
		urlTrendChart.hideLoading();
		urlTrendChart.setOption(option);
	}
}

// 指标按钮点击事件
function urlTendency_btn(index){
	$("#urlTendency_btn_text").text("指标："+$("#btn_"+index).text());
	$("#urlTendencyIndex").val(index);
	ana_visit(); // 刷新url趋势图
}
// 访客趋势图end

// url指标详情表start
// 解析数据并加载
function anaCsTable(){
	var csData = [];
	for(var k in urlDetail){
		var v = urlDetail[k];
		if(v.length == 0){
			csData.push({time:k,pv:0,nv:0,atop:'00:00:00',br:'0%',er:'0%',atg:0});
		}else{
			var row = v[0];
			csData.push({time:k,pv:row.nb_hits,nv:row.nb_visits,atop:formatTime(row.avg_time_on_page),br:row.bounce_rate,er:row.exit_rate,atg:row.avg_time_generation});	
		}
	};
	initCsTable(csData);
}
// 构造表格数据
function initCsTable(csData){
	var cs = new table({
		"tableId": "cs_table", //必须
		"headers": ["日期", "浏览量", "唯一页面浏览量", "平均访问时长", "跳出率","退出率","平均生成时长(秒)"], //必须
		"customHeader" : "<thead><tr><th rowspan='2'>日期</th><th colspan='2'>网站基础指标</th><th colspan='4'>流量质量指标</th></tr><tr><th>浏览量</th><th>唯一页面浏览量</th><th>平均访问时长</th><th>跳出率</th><th>退出率</th><th>平均生成时长(秒)</th></tr></thead>", // 自定义表头，若定义则覆盖默认表头
		"data": csData.reverse(), //必须
		"displayNum": 15, //必须  默认 10
		"groupDataNum": 9 //可选  默认 10
	});
}
// url指标详情表end