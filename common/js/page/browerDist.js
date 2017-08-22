var browserData = null; // 浏览器分布原始数据
$(function(){
	idSite = getQueryString("siteId");
	t = getQueryString("t");
	//默认最近7天
	$("#date").html(getDateStr(-6)+" ~ "+getDateStr(0));
    	$("#startDate").val(getDateStr(-6));
	$("#endDate").val(getDateStr(0));
	
	var browserPieChart = null;
	init_pie();
	var browserBarChart = null;
	init_bar();
	ajax_browser(); // 获取浏览器分布数据
	
	
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
			ajax_browser(); // 获取浏览器分布数据
		} 
    });
});
// 结束时间选择事件
function dateSelect(){
	$("#date").html($("#startDate").val()+" ~ "+$("#endDate").val());
	$("#dateDiv button").removeClass("active");
	ajax_browser(); // 获取浏览器分布数据
}
// 图表自适应
window.onresize = function(){
	browserPieChart.resize();
	browserBarChart.resize();
}

// ajax请求浏览器分布数据
function ajax_browser(){
	var startDate = $("#startDate").val();
	var endDate = $("#endDate").val();
	var browserIndex = $("#browserIndex").val(); // 指标
	var param = {};
	if(browserIndex == "browsers"){
		param = {module:'API',method:'DevicesDetection.getBrowsers',idSite:idSite,period:'range',date:startDate+','+endDate,format:'json',token_auth:t,filter_sort_column:'nb_visits',filter_sort_order:'desc'};
	}else if(browserIndex == "browsersVersions"){
		param = {module:'API',method:'DevicesDetection.getBrowserVersions',idSite:idSite,period:'range',date:startDate+','+endDate,format:'json',token_auth:t,filter_sort_column:'nb_visits',filter_sort_order:'desc'};
	}else if(browserIndex == "osFamilies"){
		param = {module:'API',method:'DevicesDetection.getOsFamilies',idSite:idSite,period:'range',date:startDate+','+endDate,format:'json',token_auth:t,filter_sort_column:'nb_visits',filter_sort_order:'desc'};
	}else if(browserIndex == "osVersions"){
		param = {module:'API',method:'DevicesDetection.getOsVersions',idSite:idSite,period:'range',date:startDate+','+endDate,format:'json',token_auth:t,filter_sort_column:'nb_visits',filter_sort_order:'desc'};
	}else if(browserIndex == "resolution"){
		param = {module:'API',method:'Resolution.getResolution',idSite:idSite,period:'range',date:startDate+','+endDate,format:'json',token_auth:t,filter_sort_column:'nb_visits',filter_sort_order:'desc'};
	}
	browserPieChart.showLoading();
	browserBarChart.showLoading();
	ajax_jsonp(piwik_url,param,function(data){
		data = eval(data);
		browserData = data;
		// console.info(browserData);
		anaPieBar(); // 加载图表
		anaCsTable(); // 加载详情表格
	});
}

// 初始化饼图
function init_pie(){
	browserPieChart = echarts.init(document.getElementById('browserPie'));
	var option = {
	    tooltip : {
	        trigger: 'item',
	        formatter: "{a} <br/>{b} : {c} ({d}%)"
	    },
	    legend: {
	    		show : false,
	        orient: 'vertical',
	        left: 'left',
	        data: []
	    },
	    series : [
	        {
	            name: '访问',
	            type: 'pie',
	            radius : '55%',
	            center: ['50%', '60%'],
	            data:[],
	            itemStyle: {
	                emphasis: {
	                    shadowBlur: 10,
	                    shadowOffsetX: 0,
	                    shadowColor: 'rgba(0, 0, 0, 0.5)'
	                }
	            }
	        }
	    ]
	};
	browserPieChart.setOption(option);
}

// 初始化柱状图
function init_bar(){
	browserBarChart = echarts.init(document.getElementById('browserBar'));
	var option = { 
	    tooltip : {
	        trigger: 'axis',
	        axisPointer : {            // 坐标轴指示器，坐标轴触发有效
	            type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
	        }
	    },
	    grid: {
	        left: '3%',
	        right: '4%',
	        bottom: '3%',
	        containLabel: true
	    },
	    xAxis : [
	        {
	            type : 'category',
	            data : [],
	            axisTick: {
	                alignWithLabel: true
	            }
	        }
	    ],
	    yAxis : [
	        {
	            type : 'value'
	        }
	    ],
	    series : [
	        {
	            name:'访问',
	            type:'bar',
	            barWidth: '60%',
	            data:[],
	            itemStyle: {
					normal: {
						color: function(params) {
							var colorList = ['#c23531','#2f4554', '#61a0a8', '#d48265', '#91c7ae','#749f83',  '#ca8622', '#bda29a','#6e7074', '#546570', '#c4ccd3'];
							return colorList[params.dataIndex]
						},
						label: {
							show: false
						}
					}
				}
	        }
	    ]
	};
	browserBarChart.setOption(option);
}

// 解析图表数据
function anaPieBar(){
	// 如果超过10条记录，则只展示前10条
	var bd = browserData;
	if(bd.length > 10){
		bd = bd.slice(0,10);
	}
	var xData = [];
	var pieData = [];
	var barData = [];
	var browserIndex = $("#browserIndex").val(); // 指标
	if(browserIndex == "browsers"){
		name = "浏览器名称";
	}else if(browserIndex == "browsersVersions"){
		name = "浏览器版本";
	}else if(browserIndex == "osFamilies"){
		name = "操作系统名称";
	}else if(browserIndex == "osVersions"){
		name = "操作系统版本";
	}else if(browserIndex == "resolution"){
		name = "画面分辨率";
	}
	for(var k in bd){
		var row = bd[k];
		var label = row.label;
		var nv = row.nb_visits;
		xData.push(label);
		pieData.push({value:nv,name:label});
		barData.push(nv);
	}
	var pieOption = {
		legend: {
	        data: xData
	    },
	    series : [{
	            data: pieData,
	    }]
	}
	browserPieChart.setOption(pieOption);
	browserPieChart.hideLoading();
	var barOption = {
		xAxis : [
	        {
	            data : xData,
	        }
	    ],
	    series : [
	        {
	            data:barData
	        }
	    ]
	};
	browserBarChart.setOption(barOption);
	browserBarChart.hideLoading();
}

// 指标按钮点击事件
function browser_btn(index){
	$("#browserBtn button").removeClass("active");
	$("#btn_"+index).addClass("active");
	$("#browserIndex").val(index);
	ajax_browser(); // 获取浏览器分布数据
}

// 指标详情表start
// 解析数据并加载
function anaCsTable(){
	var csData = [];
	var name = "";
	var browserIndex = $("#browserIndex").val(); // 指标
	if(browserIndex == "browsers"){
		name = "浏览器名称";
		
	}else if(browserIndex == "browsersVersions"){
		name = "浏览器版本";
	}else if(browserIndex == "osFamilies"){
		name = "操作系统名称";
	}else if(browserIndex == "osVersions"){
		name = "操作系统版本";
	}else if(browserIndex == "resolution"){
		name = "画面分辨率";
	}
	for(var k in browserData){
		var row = browserData[k];
		var label = row.label;
		var nv = row.nb_visits;
		var na = row.nb_actions;
		var ana = (na / nv).toFixed(1);
		var atos = formatTime((row.sum_visit_length / nv).toFixed(0));
		var br = (row.bounce_count / nv * 100).toFixed(0) + '%';
		csData.push({label:label,nv:nv,na:na,ana:ana,atos:atos,br:br});
	}
	initCsTable(csData,name);
	
}
// 构造表格数据
function initCsTable(csData,name){
	var customHeader = "<thead>"
						+"<tr><th rowspan='2'>"+name+"</th><th colspan='2'>网站基础指标</th><th colspan='3'>流量质量指标</th></tr>"
						+"<tr>"
							+"<th title='访客第一次访问你的网站或者距离上次访问时间超过30分钟，会被统计为新的访问。'>访问</th>"
							+"<th title='访客执行的活动次数。活动包括查看页面、站内搜索、下载或者离站链接。'>活动</th>"
							+"<th title='访问期间的平均活动次数 (包括查看页面、站内搜索、下载或离站链接)。'>平均活动次数</th>"
							+"<th title='平均停留时间。'>网站平均停留时间</th>"
							+"<th title='只查看单个页面的百分比，即访客直接从入口页面离开网站。'>跳出率</th>"
						+"</tr></thead>";
	var cs = new table({
		"tableId": "cs_table", //必须
		"headers": ["日期", "浏览量(PV)", "访客数(UV)", "访问", "用户数","跳出率","平均访问时长"], //必须
		"customHeader" : customHeader, // 自定义表头，若定义则覆盖默认表头
		"data": csData, //必须
		"displayNum": 15, //必须  默认 10
		"groupDataNum": 9 //可选  默认 10
	});
}
// 指标详情表end