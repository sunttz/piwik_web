$(function(){
	idSite = getQueryString("siteId");
	t = getQueryString("t");
	//默认最近7天
	$("#date").html(getDateStr(-6)+" ~ "+getDateStr(0));
    	$("#startDate").val(getDateStr(-6));
	$("#endDate").val(getDateStr(0));
	// 饼图和折线图原始数据，调整时间则更新该值
	var pieData = [];
	var lineData = {};
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
			ajaxPieLine(); // 更新图表数据
			ajaxCsTable(); // 更新详情表格
		} 
    });
    // 初始化饼图
    var entryPie = null;
	initPie();
	// 初始化折线图
	var entryLine = null;
	initLine();
	// 更新图表数据
	ajaxPieLine();
	// 加载详情表格数据
	ajaxCsTable();
	
});

// 结束时间选择事件
function dateSelect(){
	$("#date").html($("#startDate").val()+" ~ "+$("#endDate").val());
	$("#dateDiv button").removeClass("active");
	ajaxPieLine(); // 更新图表数据
	ajaxCsTable(); // 更新详情表格
}
// 图表自适应
window.onresize = function(){
	entryPie.resize();
	entryLine.resize();
}

// 饼图折线图start
/**
 * 1.切换时间时更新pieData和lineData即折线图饼图的原始数据
 * 2.调用ajaxPieLine方法更新数据
 * 3.调用refreshPieLine方法更新图表
 */
// 初始化饼图
function initPie(){
	entryPie = echarts.init(document.getElementById('entryPie'));
	option = {
	    tooltip: {trigger: 'item', formatter: "{a} <br/>{b}: {c} ({d}%)"},
	    grid: {
	        top: '3%',
	    },
	    series: [{type:'pie',radius: ['40%', '60%'],label: {normal: {show: true,formatter: '{d}%'}},data:[]}]
	};
	entryPie.setOption(option);
}

// 初始化折线图
function initLine(){
	entryLine = echarts.init(document.getElementById('entryLine'));
	option = {
	    tooltip: {
	        trigger: 'axis'
	    },
	    legend: {
	        data:[],
	        bottom : '0%',
	        selected: {}
	    },
	    grid: {
	        left: '5%',
	        right: '5%',
	        top: '3%',
	        bottom : '20%',
	        containLabel: true
	    },
	    xAxis: {
	        type: 'category',
	        boundaryGap: false,
	        data: []
	    },
	    yAxis: {
	        type: 'value'
	    },
	    series: []
	};
	entryLine.setOption(option);
}

// 更新饼图折线图数据
function ajaxPieLine(){
	var startDate = $("#startDate").val();
	var endDate = $("#endDate").val();
	var param = {module:'API',method:'Actions.getEntryPageUrls',idSite:idSite,period:'range',date:startDate+","+endDate,format:'json',token_auth:t,filter_limit:'10',filter_sort_column:'entry_nb_visits',filter_sort_order:'desc'};
	entryPie.showLoading();
	entryLine.showLoading();
	ajax_jsonp(piwik_url,param,function(data){
		data = eval(data);
		pieData = data;
		// 根据top10的url获取各url趋势数据
		lineData = {};
		if(pieData.length!=0){
			var urls = new Array();
			// 获取top10的url
			var top10Urls = [];
			for(var k in pieData){
				var url = pieData[k].url;
				top10Urls.push(url);
			}
			// 组装接口参数
			for(var k in top10Urls){
				var url = top10Urls[k];
				if(url != null && url != ""){
					urls.push(encodeURI("module=API&method=Actions.getPageUrl&pageUrl="+url+"&idSite="+idSite+"&period=day&date="+startDate+","+endDate+"&format=json&token_auth="+t));
				}
			}
			var p = getBulkRequestParam(urls);
			// 组装折线图数据
			ajax_jsonp(piwik_url,p,function(data){
				data = eval(data);
				for(var i=0;i<top10Urls.length;i++){
					var url = top10Urls[i];
					lineData[url] = data[i];
				}
				refreshPieLine();
			});
		}else{
			refreshPieLine();
		}
		
	});
}

// 更新图表
function refreshPieLine(){
	var index = $("#entryIndex").val();
	// 更新饼图
	var name = "";
	var pie = []; // 饼图数据
	if("cv"==index){
		name = "贡献浏览量";
		for(var k in pieData){
			var row = pieData[k];
			pie.push({value:row.entry_nb_visits,name:row.url});
		}
	}else if("pv"==index){
		name = "访问次数";
		for(var k in pieData){
			var row = pieData[k];
			pie.push({value:row.nb_hits,name:row.url});
		}
	}else if("uv"==index){
		name = "唯一页面访问量";
		for(var k in pieData){
			var row = pieData[k];
			pie.push({value:row.nb_visits,name:row.url});
		}
	}
	var pieOption = {
		tooltip: {
	        formatter: function(params){return cutStr(params.name,42) + ' <br/>' + name + "：" +params.value + "<br/>占比：" + params.percent + "%";}
	    },
		series : [{
			name : name,
			data : pie
		}]
	}
	entryPie.hideLoading();
	entryPie.setOption(pieOption);
	// 更新折线图
	var legendData = [];
	var xAxisData = [];
	var series = [];
	var legendSelected = {};
	for(var url in lineData){
		legendData.push(url);
		var urlTrend = lineData[url];
		var seriesData = [];
		for(var date in urlTrend){
			var dayData = urlTrend[date];
			if(dayData.length == 0){
				seriesData.push(0);
			}else{
				if("cv" == index){
					var env = dayData[0].entry_nb_visits; // 贡献浏览量
					if(env == undefined){ // 没有贡献
						env = 0;
					}else{
						env = parseInt(env);
					}
					seriesData.push(env);
				}else if("pv" == index){
					seriesData.push(dayData[0].nb_hits);
				}else if("uv" == index){
					seriesData.push(dayData[0].nb_visits);
				}
			}
		}
		if(xAxisData.length == 0){
			for(var date in urlTrend){
				xAxisData.push(date);
			}
		}
		series.push({name:url,type:'line',data:seriesData});
	}
	// 超过3个的url趋势图隐藏
	if(legendData.length > 3){
		for(var i=3;i<legendData.length;i++){
			legendSelected[legendData[i]] = false;
		}
	}
	var lineOption = {
		legend: {
	        data:legendData,
	        selected: legendSelected 
	    },
	    xAxis: {
	        data: xAxisData
	    },
	    series: series
	};
	entryLine.clear();
	initLine();
	entryLine.hideLoading();
	entryLine.setOption(lineOption);
}

// 指标按钮选择
function btnSelect(index){
	$("#entry_btn_text").text("指标："+$("#btn_"+index).text());
	$("#entryIndex").val(index);
	refreshPieLine();
}

// 饼图折线图end

// url详情表格start
// 请求表格数据
function ajaxCsTable(){
	var csData = [];
	var startDate = $("#startDate").val();
	var endDate = $("#endDate").val();
	var param = {module:'API',method:'Actions.getEntryPageUrls',idSite:idSite,period:'range',date:startDate+','+endDate,format:'json',token_auth:t,filter_sort_column:'entry_nb_visits',filter_sort_order:'desc'};
	ajax_jsonp(piwik_url,param,function(data){
		data = eval(data);
		for(var k in data){
			var row = data[k];
			csData.push({url:'<a href="'+row.url+'" target="_blank">'+cutStr(row.url,100)+'</a>',pv:row.nb_hits,uv:row.nb_visits,env:row.entry_nb_visits,br:row.bounce_rate,at:formatTime(row.avg_time_on_page),avg:row.avg_time_generation})
		}
		initCsTable(csData);
	});
}
// 构造表格数据
function initCsTable(csData){
	var customHeader = "<thead>"
						+"<tr><th rowspan='2'>页面URL</th><th colspan='2'>网站基础指标</th><th colspan='4'>流量质量指标</th></tr>"
						+"<tr><th title='页面被查看的次数。用户多次打开同一页面，浏览量值累计。'>访问次数</th>"
						+"<th title='浏览了该页面的访问次数。如果一次访问中多次浏览同一页面，只统计一次。'>唯一页面浏览量</th>"
						+"<th title='指以该页面作为入口产生的浏览量总计。'>贡献浏览量</th>"
						+"<th title='只查看单个页面的百分比，即访客直接从入口页面离开网站。'>跳出率</th>"
						+"<th title='访客在一次访问中，平均打开网站的时长。'>平均访问时长</th>"
						+"<th title='生成页面的平均时间。'>平均生成时长(秒)</th>"
						+"</tr></thead>";
	var cs = new table({
		"tableId": "cs_table", //必须
		"headers": ["页面URL", "访问次数", "唯一页面浏览量", "贡献浏览量", "跳出率","平均访问时长","平均生成时长(秒)"], //必须
		"customHeader" : customHeader, // 自定义表头，若定义则覆盖默认表头
		"data": csData, //必须
		"displayNum": 15, //必须  默认 10
		"groupDataNum": 9 //可选  默认 10
	});
}
// url详情表格end