var userData = null; // 用户分布数据
$(function(){
	idSite = getQueryString("siteId");
	t = getQueryString("t");
	//默认最近7天
	$("#date").html(getDateStr(-6)+" ~ "+getDateStr(0));
    	$("#startDate").val(getDateStr(-6));
	$("#endDate").val(getDateStr(0));
	
	var userDistChart = null;
	init_userBar();
	ajax_userData(); // 获取用户分布数据
	
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
			ajax_userData();
		} 
    });
});
// 结束时间选择事件
function dateSelect(){
	$("#date").html($("#startDate").val()+" ~ "+$("#endDate").val());
	$("#dateDiv button").removeClass("active");
	ajax_userData();
}
// 图表自适应
window.onresize = function(){
	userDistChart.resize();
}

// 获取用户分布数据
function ajax_userData(){
	userDistChart.showLoading();
	var startDate = $("#startDate").val();
	var endDate = $("#endDate").val();
	var param = {module:'API',method:'UserId.getUsers',idSite:idSite,period:'range',date:startDate+','+endDate,format:'JSON',token_auth:t,filter_sort_column:'nb_visits',filter_sort_order:'desc'};
	ajax_jsonp(piwik_url, param, function(data){
		userData = eval(data);
		ana_userBar();
		anaCsTable(); // 用户数据详情表
	});
}

// 初始化用户柱状图
function init_userBar(){
	userDistChart = echarts.init(document.getElementById('userDist'));
	var option = {
	    tooltip:{trigger: 'axis',axisPointer:{type : 'shadow'}},
	    grid:{left:'3%',right:'4%',bottom:'3%',containLabel:true},
	    xAxis:[{type:'category',data:[],axisTick:{alignWithLabel: true}}],
	    yAxis:[{type:'value'}],
	    series:[{
	            name:'访问',
	            type:'bar',
	            barWidth:'60%',
	            data:[],
	            itemStyle: {
					normal: {
						color: function(params) {
							var colorList = ['#c23531','#2f4554', '#61a0a8', '#d48265', '#91c7ae','#749f83',  '#ca8622', '#bda29a','#6e7074', '#546570', '#c4ccd3'];
							return colorList[params.dataIndex]
						},
						label: {show: false}
					}
				}
	        }
	    ]
	};
	userDistChart.setOption(option);
}

// 加载用户分布柱状图
function ana_userBar(){
	// 如果超过10条记录，则只展示前10条
	var ud = userData;
	if(ud.length > 10){
		ud = ud.slice(0,10);
	}
	var xData = [];
	var barData = [];
	for(var k in ud){
		var row = ud[k];
		var label = row.label;
		var nv = row.nb_visits;
		xData.push(label);
		barData.push(nv);
	}
	var barOption = {
		xAxis : [{data : xData,}],
	    series : [{data:barData}]
	};
	userDistChart.setOption(barOption);
	userDistChart.hideLoading();
}

// 指标详情表start
// 请求数据并加载
function anaCsTable(){
	var csData = [];
	for(var k in userData){
		var v = userData[k];
		var label = v.label;
		var href = "<a href='userTrend.html?siteId="+idSite+"&t="+t+"' title='查看详情'><span class='glyphicon glyphicon-chevron-right'></span></a>";
		var nv = v.nb_visits;
		var na = v.nb_actions;
		var ana = (na / nv).toFixed(1);
		var atos = formatTime((v.sum_visit_length / nv).toFixed(0));
		var br = (v.bounce_count / nv * 100).toFixed(0) + '%';
		csData.push({label:label,href:href,nv:nv,na:na,ana:ana,atos:atos,br:br});
	}
	initCsTable(csData);
	
}
// 构造表格数据
function initCsTable(csData){
	var customHeader = "<thead>"
						+"<tr><th rowspan='2' colspan='2'>用户ID</th><th colspan='2'>网站基础指标</th><th colspan='3'>流量质量指标</th></tr>"
						+"<tr><th title='访客第一次访问你的网站或者距离上次访问时间超过30分钟，会被统计为新的访问。'>访问</th>"
						+"<th title='访客执行的活动次数。活动包括查看页面、站内搜索、下载或者离站链接。'>活动</th>"
						+"<th title='访问期间的平均活动次数 (包括查看页面、站内搜索、下载或离站链接)。'>平均活动次数</th>"
						+"<th title='平均停留时间。'>网站平均停留时间</th>"
						+"<th title='只查看单个页面的百分比，即访客直接从入口页面离开网站。'>跳出率</th>"
						+"</tr></thead>";
	var cs = new table({
		"tableId": "cs_table", //必须
		"headers": ["用户ID", "", "访问", "活动", "平均活动次数", "网站平均停留时间","跳出率"], //必须
		"customHeader" : customHeader, // 自定义表头，若定义则覆盖默认表头
		"data": csData, //必须
		"displayNum": 15, //必须  默认 10
		"groupDataNum": 9 //可选  默认 10
	});
}
// 指标详情表end