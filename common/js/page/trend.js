$(function(){
	idSite = getQueryString("siteId");
	t = getQueryString("t");
	$("[data-toggle='tooltip']").tooltip();
	//默认最近7天
	$("#date").html(getDateStr(-6)+" ~ "+getDateStr(0));
    	$("#startDate").val(getDateStr(-6));
	$("#endDate").val(getDateStr(0));
	// 加载访客概览图
	ajax_visit_summary();
	// 加载访客趋势图
	var visitTrendChart = null;
	init_visit();
	ajax_visit();
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
			// 加载访客概览图
			ajax_visit_summary();
			// 加载访客趋势图
			ajax_visit();
			// 加载访客数据表
			ajaxCsTable();
		} 
    });
});
// 结束时间选择事件
function dateSelect(){
	$("#date").html($("#startDate").val()+" ~ "+$("#endDate").val());
	ajax_visit_summary();
	ajax_visit();
	// 加载访客数据表
	ajaxCsTable();
}
// 图表自适应
window.onresize = function(){
	visitTrendChart.resize();
}

// 访客趋势图start
// 加载访客概览图
function ajax_visit_summary(){
	var startDate = $("#startDate").val();
	var endDate = $("#endDate").val();
	var p1 = "module=API&method=MultiSites.getOne&idSite="+idSite+"&period=range&date="+startDate+","+endDate+"&format=JSON&token_auth="+t;
	var p2 = "module=API&method=VisitsSummary.get&idSite="+idSite+"&period=range&date="+startDate+","+endDate+"&format=JSON&token_auth="+t;
	var urls = new Array();
	urls.push(encodeURI(p1));
	urls.push(encodeURI(p2));
	var p = getBulkRequestParam(urls);
	ajax_jsonp(piwik_url, p, function(data){
		data = eval(data);
		var ms = data[0];
		var vs = data[1];
		$("#d_pv").html(ms["nb_pageviews"]);
		$("#d_uv").html(vs["nb_uniq_visitors"]);
		$("#d_visit").html(vs["nb_visits"]);
		$("#d_user").html(vs["nb_users"]);
		$("#d_br").html(vs["bounce_rate"]);
		$("#d_at").html(formatTime(vs["avg_time_on_site"]));
	});
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
		param = {module:"API",method:"VisitsSummary.get",idSite:idSite,period:"day",date:startDate+","+endDate,format:"json",token_auth:t,columns:"nb_uniq_visitors"};
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
			visitTrendChart.hideLoading();
			visitTrendChart.setOption(option);
		});
	}
	// 访问
	else if("visit" == visitTendencyIndex){
		param = {module:"API",method:"VisitsSummary.get",idSite:idSite,period:"day",date:startDate+","+endDate,format:"json",token_auth:t,columns:"nb_visits"};
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
			visitTrendChart.hideLoading();
			visitTrendChart.setOption(option);
		});
	}
	// 用户数
	else if("user" == visitTendencyIndex){
		param = {module:"API",method:"VisitsSummary.get",idSite:idSite,period:"day",date:startDate+","+endDate,format:"json",token_auth:t,columns:"nb_users"};
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
			visitTrendChart.hideLoading();
			visitTrendChart.setOption(option);
		});
	}
	// 跳出率
	else if("br" == visitTendencyIndex){
		param = {module:"API",method:"VisitsSummary.get",idSite:idSite,period:"day",date:startDate+","+endDate,format:"json",token_auth:t,columns:"bounce_rate"};
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
			visitTrendChart.hideLoading();
			visitTrendChart.setOption(option);
		});
	}
	// 平均访问时长(秒)
	else if("at" == visitTendencyIndex){
		param = {module:"API",method:"VisitsSummary.get",idSite:idSite,period:"day",date:startDate+","+endDate,format:"json",token_auth:t,columns:"avg_time_on_site"};
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
				legend: {data:["平均访问时长"]},
				tooltip:{formatter:function(params){return params[0].name + ' <br/>' + params[0].seriesName + ": " + formatTime(params[0].value);}},
		    		xAxis: {data:categories},
		    		yAxis: {axisLabel:{formatter: '{value}'}},
		    		series:[{name:'平均访问时长',type:'line',stack: '平均访问时长',itemStyle:{normal:{color: '#87CEEB',lineStyle:{color:'#87CEEB'}}},
		            areaStyle: {normal: {color:'#87CEEB'}},data:datas
		    		}]
			};
			visitTrendChart.hideLoading();
			visitTrendChart.setOption(option);
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

// 指标详情表start
// 请求数据并加载
function ajaxCsTable(){
	var csData = [];
	var startDate = $("#startDate").val();
	var endDate = $("#endDate").val();
	var p1 = "module=API&method=MultiSites.getOne&idSite="+idSite+"&period=day&date="+startDate+","+endDate+"&format=JSON&token_auth="+t;
	var p2 = "module=API&method=VisitsSummary.get&idSite="+idSite+"&period=day&date="+startDate+","+endDate+"&format=JSON&token_auth="+t;
	var urls = new Array();
	urls.push(encodeURI(p1));
	urls.push(encodeURI(p2));
	var p = getBulkRequestParam(urls);
	ajax_jsonp(piwik_url, p, function(data){
		data = eval(data);
		var ms = data[0];
		var vs = data[1];
		for(var k in vs){
			var v = vs[k];
			var uv = v.nb_uniq_visitors;
			if(uv == null || uv == ""){
				uv = 0;
			}
			var visit = v.nb_visits;
			if(visit == null || visit == ""){
				visit = 0;
			}
			var user = v.nb_users;
			if(user == null || user == ""){
				user = 0;
			}
			var br = v.bounce_rate;
			if(br == null || br == ""){
				br = "0%";
			}
			csData.push({time:k,pv:ms[k].nb_pageviews,uv:uv,visit:visit,user:user,br:br,at:formatTime(v.avg_time_on_site)});
		}
		initCsTable(csData);
	});
}
// 构造表格数据
function initCsTable(csData){
	var cs = new table({
		"tableId": "cs_table", //必须
		"headers": ["日期", "浏览量(PV)", "访客数(UV)", "访问", "用户数","跳出率","平均访问时长"], //必须
		"data": csData.reverse(), //必须
		"displayNum": 15, //必须  默认 10
		"groupDataNum": 9 //可选  默认 10
	});
}
// 抽象化表格
function abstractTable() {
	// ---------内容属性
	this.id = null; // 每个表格都有唯一的一个id
	this.tableobj = null; //表格对象
	this.rowNum = 0; //行数
	this.colNum = 0; //列数
	this.header = []; //表头数据
	this.content = []; //body数据
	// ----------提供外部使用获得表格内部数据
	this.currentClickRowID = 0; //当前点击的行数据
	// --- 通过表头来获得这张表的列数
	this.getColNum = function() {
		this.colNum = this.header.length;
		return this.colNum;
	}
	// ----------- 表格自我构建行为
	this.clearTable = function() {};
	this.showHeader = function() {};
	this.showContent = function(begin, end) {};
	this.showFoot = function() {};
	// --------- 分页功能属性
	this.allDataNum = 0; // 总数据条数
	this.displayNum = 10; // 每页显示条数
	this.maxPageNum = 0; // 最大页码值
	this.currentPageNum = 1; // 当前页码值
	//tfoot分页组
	this.groupDataNum = 10; //每组显示10页
	this.groupNum = 1; //当前组
	// -------- 分页功能行为
	this.paginationFromBeginToEnd = function(begin, end) {}
	this.first = function() {} //首页
	this.last = function() {} //最后一页
	this.prev = function() {} //上一页
	this.next = function() {} //下一页
	this.goto = function() {} //跳到某页
	// ----------- 表格初始化
	this.init = function(begin, end) {}
}

//表格对象模板
function tableTemplet(table_id) {
	abstractTable.call(this);
	this.id = table_id;
}
/**
 * 表格对象
 * @param options
 */
function table(options) {
	if(!options) {
		return;
	}
	if(!$.isPlainObject(options)) {
		return;
	}
	tableTemplet.call(this, options.tableId);
	//得到表格对象
	this.tableobj = $("#" + this.id);
	//清空表格内容
	this.clearTable = function() {
		this.tableobj.html(" ");
	}
	// 实现分页行为
	this.paginationFromBeginToEnd = function(x, y) {
		this.maxPageNum = Math.ceil(this.allDataNum / this.displayNum);
		var arrPage = [];
		for(var i = x; i < y; i++) {
			arrPage.push(this.content[i]);
		}
		return arrPage;
	}
	this.showHeader = function() {
//		if(this.header != null) {
//			var $thead = $("<thead>"),
//				$tr = $("<tr>"),
//				$th;
//			for(var i = 0; i < this.colNum; i++) {
//				$th = $("<th>").html(this.header[i]);
//				$th.appendTo($tr);
//			}
//			$tr.appendTo($thead);
//			$thead.appendTo(this.tableobj)
//		}
		// 自定义title
		var $thead = $("<thead><tr><th rowspan='2'>日期</th><th colspan='4'>网站基础指标</th><th colspan='2'>流量质量指标</th></tr><tr><th>浏览量(PV)</th><th>访客数(UV)</th><th>访问</th><th>用户数</th><th>跳出率</th><th>平均访问时长</th></tr></thead>");
		$thead.appendTo(this.tableobj);
	}
	//初始化tbody
	this.showContent = function(begin, end) {
		if(this.content != null) {
			var $tbody = $("<tbody>"),
				$tr,
				$td;
			var tempDaTa = this.paginationFromBeginToEnd(begin, end),
				len = tempDaTa.length;
			// 循环创建行
			for(var i = 0; i < len; i++) {
				$tr = $("<tr>").appendTo($tbody);
//				if(i % 2 == 1) {
//					$tr.addClass("evenrow");
//				}
				// 循环创建列 取得对象中的键
				for(var key in tempDaTa[i]) {
					$td = $("<td>").html(tempDaTa[i][key]).appendTo($tr);
				}
			}
			this.tableobj.append($tbody);
		}
	}
	//初始化tfoot
	this.showFoot = function() {
		var $tfoot = $("<tfoot>"),
			$tr = $("<tr>"),
			$td = $("<td>").attr("colspan", this.colNum).addClass("paging");
		$tr.append($td);
		$tfoot.append($tr);
		this.tableobj.append($tfoot);
		this.pagination($td);
	}
	//表格分页
	this.pagination = function(tdCell) {
		var $td = typeof(tdCell) == "object" ? tdCell : $("#" + tdCell);
		//首页
		var oA = $("<a/>");
		oA.attr("href", "#1");
		oA.html("首页");
		$td.append(oA);
		//上一页
		if(this.currentPageNum >= 2) {
			var oA = $("<a/>");
			oA.attr("href", "#" + (this.currentPageNum - 1));
			oA.html("上一页");
			$td.append(oA);
		}
		//普通显示格式
		if(this.maxPageNum <= this.groupDataNum) { // 10页以内 为一组
			for(var i = 1; i <= this.maxPageNum; i++) {
				var oA = $("<a/>");
				oA.attr("href", "#" + i);
				if(this.currentPageNum == i) {
					oA.attr("class", "current");
				}
				oA.html(i);
				$td.append(oA);
			}
		} else { //超过10页以后（也就是第一组后）
			if(this.groupNum <= 1) { //第一组显示
				for(var j = 1; j <= this.groupDataNum; j++) {
					var oA = $("<a/>");
					oA.attr("href", "#" + j);
					if(this.currentPageNum == j) {
						oA.attr("class", "current");
					}
					oA.html(j);
					$td.append(oA);
				}
			} else { //第二组后面的显示
				var begin = (this.groupDataNum * (this.groupNum - 1)) + 1,
					end,
					maxGroupNum = Math.ceil(this.maxPageNum / this.groupDataNum);
				if(this.maxPageNum % this.groupDataNum != 0 && this.groupNum == maxGroupNum) {
					end = this.groupDataNum * (this.groupNum - 1) + this.maxPageNum % this.groupDataNum
				} else {
					end = this.groupDataNum * (this.groupNum);
				}
				for(var j = begin; j <= end; j++) {
					var oA = $("<a/>");
					oA.attr("href", "#" + j);
					if(this.currentPageNum == j) {
						oA.attr("class", "current");
					}
					oA.html(j);
					$td.append(oA);
				}
			}
		}
		//下一页
		if((this.maxPageNum - this.currentPageNum) >= 1) {
			var oA = $("<a/>");
			oA.attr("href", "#" + (this.currentPageNum + 1));
			oA.html("下一页");
			$td.append(oA);
		}
		//尾页
		var oA = $("<a/>");
		oA.attr("href", "#" + this.maxPageNum);
		oA.html("尾页");
		$td.append(oA);
		var page_a = $td.find('a');
		var tempThis = this;
		page_a.unbind("click").bind("click", function() {
			var nowNum = parseInt($(this).attr('href').substring(1));
			if(nowNum > tempThis.currentPageNum) { //下一组
				if(tempThis.currentPageNum % tempThis.groupDataNum == 0) {
					tempThis.groupNum += 1;
					var maxGroupNum = Math.ceil(tempThis.maxPageNum / tempThis.groupDataNum);
					if(tempThis.groupNum >= maxGroupNum) {
						tempThis.groupNum = maxGroupNum;
					}
				}
			}
			if(nowNum < tempThis.currentPageNum) { //上一组
				if((tempThis.currentPageNum - 1) % tempThis.groupDataNum == 0) {
					tempThis.groupNum -= 1;
					if(tempThis.groupNum <= 1) {
						tempThis.groupNum = 1;
					}
				}
			}
			if(nowNum == tempThis.maxPageNum) { //直接点击尾页
				var maxGroupNum = Math.ceil(tempThis.maxPageNum / tempThis.groupDataNum);
				tempThis.groupNum = maxGroupNum;
			}
			if(nowNum == 1) {
				var maxGroupNum = Math.ceil(tempThis.maxPageNum / tempThis.groupDataNum);
				tempThis.groupNum = 1;
			}
			tempThis.currentPageNum = nowNum;
			tempThis.init((tempThis.currentPageNum - 1) * tempThis.displayNum,
				tempThis.currentPageNum * tempThis.displayNum);
			return false;
		});
	}
	//初始化
	this.init = function(begin, end) {
		this.header = options.headers;
		this.colNum = this.header.length;
		this.content = options.data;
		this.allDataNum = this.content.length;
		if(options.displayNum) {
			this.displayNum = options.displayNum;
		}
		if(options.groupDataNum) {
			this.groupDataNum = options.groupDataNum;
		}
		this.clearTable();
		this.showHeader();
		this.showContent(begin, end);
		this.showFoot();
	}
	this.init(0, options.displayNum);
}
// 指标详情表end