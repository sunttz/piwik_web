$(function(){
	idSite = getQueryString("siteId");
	t = getQueryString("t");
	//默认最近7天
	$("#date").html(getDateStr(-6)+" ~ "+getDateStr(0));
    	$("#startDate").val(getDateStr(-6));
	$("#endDate").val(getDateStr(0));
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
			
		} 
    });
    // 加载饼图数据
    var entryPie = null;
	initPie();
	ajaxPie();
	// 加载折线图数据
	var entryLine = null;
	initLine();
	// 加载详情表格数据
	initCsTable();
	
});

// 结束时间选择事件
function dateSelect(){
	$("#date").html($("#startDate").val()+" ~ "+$("#endDate").val());
	
}
// 图表自适应
window.onresize = function(){
	entryPie.resize();
	entryLine.resize();
}

// 饼图start
var pieData = null;
// 初始化饼图
function initPie(){
	entryPie = echarts.init(document.getElementById('entryPie'));
	option = {
	    tooltip: {
	        trigger: 'item',
	        formatter: "{a} <br/>{b}: {c} ({d}%)"
	    },
	    series: [
	        {
	            //name:'贡献浏览量',
	            type:'pie',
	            radius: ['50%', '70%'],
	            data:[
//	                {value:335, name:'直接访问'},
//	                {value:310, name:'邮件营销'},
//	                {value:234, name:'联盟广告'},
//	                {value:135, name:'视频广告'},
//	                {value:1548, name:'搜索引擎'}
	            ] 
	        }
	    ]
	};
	entryPie.setOption(option);
}

function ajaxPie(){
	var startDate = $("#startDate").val();
	var endDate = $("#endDate").val();
	var param = {module:'API',method:'Actions.getEntryPageUrls',idSite:idSite,period:'range',date:startDate+","+endDate,format:'json',token_auth:t,filter_limit:'10',filter_sort_column:'entry_nb_visits',filter_sort_order:'desc'};
	ajax_jsonp(piwik_url,param,function(data){
		data = eval(data);
		pieData = data;
		entry_btn('cv');
	});
}

// 指标按钮点击事件
function entry_btn(index){
	$("#entry_btn_text").text("指标："+$("#btn_"+index).text());
	$("#entryIndex").val(index);
	var name = "";
	var cvData = [];
	if("cv"==index){
		name = "贡献浏览量";
		for(var k in pieData){
			var row = pieData[k];
			cvData.push({value:row.entry_nb_visits,name:row.label});
		}
	}
	option = {
		tooltip: {
	        formatter: function(params){return cutStr(params.name,42) + ' <br/>' + name + "：" +params.value + "<br/>占比：" + params.percent + "%";}
	    },
		series : [{
			name : name,
			data : cvData
		}]
	}
	entryPie.setOption(option);
}
// 饼图end

// 折线图start
function initLine(){
	entryLine = echarts.init(document.getElementById('entryLine'));
	option = {
	    title: {
	        text: '折线图堆叠'
	    },
	    tooltip: {
	        trigger: 'axis'
	    },
	    legend: {
	        data:['邮件营销','联盟广告','视频广告','直接访问','搜索引擎']
	    },
	    grid: {
	        left: '3%',
	        right: '4%',
	        bottom: '3%',
	        containLabel: true
	    },
	    toolbox: {
	        feature: {
	            saveAsImage: {}
	        }
	    },
	    xAxis: {
	        type: 'category',
	        boundaryGap: false,
	        data: ['周一','周二','周三','周四','周五','周六','周日']
	    },
	    yAxis: {
	        type: 'value'
	    },
	    series: [
	        {
	            name:'邮件营销',
	            type:'line',
	            data:[120, 132, 101, 134, 90, 230, 210]
	        },
	        {
	            name:'联盟广告',
	            type:'line',
	            data:[220, 182, 191, 234, 290, 330, 310]
	        },
	        {
	            name:'视频广告',
	            type:'line',
	            data:[150, 232, 201, 154, 190, 330, 410]
	        },
	        {
	            name:'直接访问',
	            type:'line',
	            data:[320, 332, 301, 334, 390, 330, 320]
	        },
	        {
	            name:'搜索引擎',
	            type:'line',
	            data:[820, 932, 901, 934, 1290, 1330, 1320]
	        }
	    ]
	};
	entryLine.setOption(option);
}
// 折线图end

// url详情表格start
// 构造表格数据
function initCsTable(){
	var data = [
		{a:'2017-08-09',b:'2',c:'1',d:'1',e:'1',f:'0%',g:'00:00:25'},
		{a:'2017-08-08',b:'2',c:'1',d:'1',e:'1',f:'0%',g:'00:00:25'},
		{a:'2017-08-07',b:'2',c:'1',d:'1',e:'1',f:'0%',g:'00:00:25'},
		{a:'2017-08-06',b:'2',c:'1',d:'1',e:'1',f:'0%',g:'00:00:25'},
		{a:'2017-08-05',b:'2',c:'1',d:'1',e:'1',f:'0%',g:'00:00:25'},
		{a:'2017-08-04',b:'2',c:'1',d:'1',e:'1',f:'0%',g:'00:00:25'}
	];
	var cs = new table({
		"tableId": "cs_table", //必须
		"headers": ["日期", "浏览量(PV)", "访客数(UV)", "访问", "用户数","跳出率","平均访问时长"], //必须
		"customHeader" : "<thead><tr><th rowspan='2'>日期</th><th colspan='4'>网站基础指标</th><th colspan='2'>流量质量指标</th></tr><tr><th>浏览量(PV)</th><th>访客数(UV)</th><th>访问</th><th>用户数</th><th>跳出率</th><th>平均访问时长</th></tr></thead>", // 自定义表头，若定义则覆盖默认表头
		"data": data, //必须
		"displayNum": 15, //必须  默认 10
		"groupDataNum": 9 //可选  默认 10
	});
}
// url详情表格end