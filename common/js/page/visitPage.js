$(function(){
	idSite = getQueryString("siteId");
	t = getQueryString("t");
	//默认最近7天
	$("#date").html(getDateStr(-6)+" ~ "+getDateStr(0));
    	$("#startDate").val(getDateStr(-6));
	$("#endDate").val(getDateStr(0));
	// 加载访客数据表
	ajaxCsTable();
	
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
			// 加载访客数据表
			ajaxCsTable();
		} 
    });
});
// 结束时间选择事件
function dateSelect(){
	$("#date").html($("#startDate").val()+" ~ "+$("#endDate").val());
	$("#dateDiv button").removeClass("active");
	// 加载访客数据表
	ajaxCsTable();
}

// URL详情表start
// 请求数据并加载
function ajaxCsTable(){
	var csData = [];
	var startDate = $("#startDate").val();
	var endDate = $("#endDate").val();
	var param = {module:'API',method:'Actions.getPageUrls',idSite:idSite,period:'range',date:startDate+","+endDate,format:'json',token_auth:t,filter_sort_column:'nb_hits',filter_sort_order:'desc'};
	ajax_jsonp(piwik_url, param, function(data){
		data = eval(data);
		for(var k in data){
			var v = data[k];
			csData.push({url:'<a href="'+v.url+'" target="_blank">'+cutStr(v.url,100)+'</a>',href:'<a href="historyTrend.html?siteId='+idSite+'&t='+t+'&href='+v.url+'" title="查看历史趋势"><span class="glyphicon glyphicon-chevron-right"></span></a>',pv:v.nb_hits,uv:v.nb_visits,atop:formatTime(v.avg_time_on_page),br:v.bounce_rate,er:v.exit_rate,atg:v.avg_time_generation});
		}
		initCsTable(csData);
	});
}
// 构造表格数据
function initCsTable(csData){
	var cs = new table({
		"tableId": "cs_table", //必须
		"headers": ["页面URL", "","浏览量", "唯一页面浏览量", "平均访问时长", "跳出率","退出率","平均生成时长(秒)"], //必须
		"customHeader" : "<thead><tr><th rowspan='2' colspan='2'>页面URL</th><th colspan='2'>网站基础指标</th><th colspan='4'>流量质量指标</th></tr><tr><th>浏览量</th><th>唯一页面浏览量</th><th>平均访问时长</th><th>跳出率</th><th>退出率</th><th>平均生成时长(秒)</th></tr></thead>", // 自定义表头，若定义则覆盖默认表头
		"data": csData, //必须
		"displayNum": 15, //必须  默认 10
		"groupDataNum": 9 //可选  默认 10
	});
}
// URL详情表end