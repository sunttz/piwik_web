
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
	// 加载Top10受访页面
	top10Visit();
	// 加载Top10入口页面
	top10Entry();
	// 加载地域分布
	var map_distribution_chart = null;
	init_mapDistribution();
	ajax_mapDistribution();
	// 加载top10最优性能页面
	top10WellPage();
	// 加载top10最差性能页面
	top10BadPage();
});
// 图表自适应
window.onresize = function(){
	visitTendencyChart.resize();
	map_distribution_chart.resize();
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
		var todayTr = "<td>今日</td><td>"+ms_t["nb_pageviews"]+"</td><td>"+vs_t["nb_uniq_visitors"]+"</td><td>"+vs_t["nb_visits"]+"</td><td>"+vs_t["nb_users"]+"</td><td>"+vs_t["bounce_rate"]+"</td><td>"+formatTime(vs_t["avg_time_on_site"])+"</td>";
		var yesterdayTr = "<td>昨日</td><td>"+ms_y["nb_pageviews"]+"</td><td>"+vs_y["nb_uniq_visitors"]+"</td><td>"+vs_y["nb_visits"]+"</td><td>"+vs_y["nb_users"]+"</td><td>"+vs_y["bounce_rate"]+"</td><td>"+formatTime(vs_y["avg_time_on_site"])+"</td>";
		$("#today-flow-table tr.today").html(todayTr);
		$("#today-flow-table tr.yesterday").html(yesterdayTr);
	});
}

// 时间切换
function changeDate(date){
	$("#dateDiv .btn").removeClass("active");
	$("#dateDiv .btn[data="+date+"]").addClass("active");
	$("#date").val(date);
	// 加载访客趋势图
	ajax_visit();
	// 加载Top10受访页面
	top10Visit();
	// 加载Top10入口页面
	top10Entry();
	// 加载地域分布
	ajax_mapDistribution();
	// 加载top10最优性能页面
	top10WellPage();
	// 加载top10最差性能页面
	top10BadPage();
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
				tooltip:{formatter:function(params){return params[0].name + ' <br/>' + params[0].seriesName + ": " + formatTime(params[0].value);}},
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
// 跳转趋势分析详情
function jumpTrend(){
	parent.changeMenu("menu-child-13");
	window.location.href = "m1/trend.html?siteId="+idSite+"&t="+t;
}
// 访客趋势图end

// Top10受访页面start
function top10Visit(){
	var date = $("#date").val(); // 日期
	var p_1 = "module=API&method=Actions.getPageUrls&idSite="+idSite+"&period=range&date="+date+"&format=json&token_auth="+t+"&filter_limit=10&filter_sort_column=nb_hits&filter_sort_order=desc&flat=1";
	var p_2 = "module=API&method=MultiSites.getOne&idSite="+idSite+"&period=range&date="+date+"&format=JSON&token_auth="+t;
	var urls = new Array();
	urls.push(encodeURI(p_1));
	urls.push(encodeURI(p_2));
	var p = getBulkRequestParam(urls);
	ajax_jsonp(piwik_url,p,function(data){
		data = eval(data);
		var totalPv = data[1].nb_pageviews;
		var pages = data[0];
		var tbodyHtml = "";
		for(var k in pages){
			var page = pages[k];
			var label = page.label;
			// label最长42字符
			if(getStrLength(label) > 42){
				label = cutStr(label,42);
			}
			var url = page.url;
			var pv = page.nb_hits;
			var prop = Math.round(pv / totalPv * 10000) / 100.00 + "%";
			tbodyHtml += "<tr>";
			tbodyHtml += "<td title='"+url+"'><a target='_blank' href='"+url+"'>"+label+"</a></td>";
			tbodyHtml += "<td align='center'>"+pv+"</td>";
			tbodyHtml += "<td><div title='"+prop+"' style='background-color:#87CEEB; width:"+prop+";'>"+prop+"</div></td>";
			tbodyHtml += "</tr>";
		}
		$("#top10_visit_tbody").html(tbodyHtml);
	});
}
// 跳转受访页面
function jumpVisitPage(){
	parent.changeMenu("menu-child-33");
	window.location.href = "m3/visitPage.html?siteId="+idSite+"&t="+t+"&source=page";
}
// Top10受访页面end
   
// Top10入口页面start
function top10Entry(){
	var date = $("#date").val(); // 日期
	var p_1 = "module=API&method=Actions.getEntryPageUrls&idSite="+idSite+"&period=range&date="+date+"&format=JSON&token_auth="+t;
	var p_2 = "module=API&method=Actions.getEntryPageUrls&idSite="+idSite+"&period=range&date="+date+"&format=JSON&token_auth="+t+"&filter_limit=10&filter_sort_column=entry_nb_visits&filter_sort_order=desc&flat=1";
	var urls = new Array();
	urls.push(encodeURI(p_1));
	urls.push(encodeURI(p_2));
	var p = getBulkRequestParam(urls);
	ajax_jsonp(piwik_url,p,function(data){
		data = eval(data);
		var totalPv = 0; // 入口页面浏览量总和
		var totalEntry = data[0];
		for(var i in totalEntry){
			totalPv += parseInt(totalEntry[i].entry_nb_visits);
		}
		var entrys = data[1];
		var tbodyHtml = "";
		for(var j in entrys){
			var entry = entrys[j];
			var label = entry.label;
			// label最长42字符
			if(getStrLength(label) > 42){
				label = cutStr(label, 42);
			}
			var url = entry.url;
			var pv = entry.entry_nb_visits; // 贡献浏览量
			var prop = Math.round(pv / totalPv * 10000) / 100.00 + "%";
			tbodyHtml += "<tr>";
			tbodyHtml += "<td title='"+url+"'><a target='_blank' href='"+url+"'>"+label+"</a></td>";
			tbodyHtml += "<td align='center'>"+pv+"</td>";
			tbodyHtml += "<td><div title='"+prop+"' style='background-color:#87CEEB; width:"+prop+";'>"+prop+"</div></td>";
			tbodyHtml += "</tr>";
		}
		$("#top10_entry_tbody").html(tbodyHtml);
	});
}
// 跳转入口页面
function jumpEntryPage(){
	parent.changeMenu("menu-child-33");
	window.location.href = "m3/entryPage.html?siteId="+idSite+"&t="+t;
}
// Top10入口页面end

// 地图分布start
function init_mapDistribution(){
	map_distribution_chart = echarts.init(document.getElementById('map_distribution'));
    map_distribution_chart.setOption({
    		tooltip: {
            trigger: 'item',
            formatter: function(param){
            		var val = param.value;
            		if(isNaN(val)){
            			val = 0;
            		}
            		return param.name + '<br/>'+ val +' 访问量';
            }
       	},
    		visualMap: {
            min: 0,
	        max: 100,
	        left: 'left',
	        top: 'bottom',
	        text: ['高','低'],
	        inRange: {
	            color: ['#e0ffff', '#006edd']
	        },
	        calculable : true
        },
        series: [{
        		name:"访问量",
            type: 'map',
            map: 'anhui',
            data:[
//          		{name:'合肥市',value:'0'},
//          		{name:'亳州市',value:'0'},
//          		{name:'淮北市',value:'0'},
//          		{name:'宿州市',value:'0'},
//          		{name:'阜阳市',value:'0'},
//          		{name:'蚌埠市',value:'0'},
//          		{name:'淮南市',value:'0'},
//          		{name:'滁州市',value:'0'},
//          		{name:'六安市',value:'0'},
//          		{name:'芜湖市',value:'0'},
//          		{name:'马鞍山市',value:'0'},
//          		{name:'安庆市',value:'0'},
//          		{name:'池州市',value:'0'},
//          		{name:'铜陵市',value:'0'},
//          		{name:'宣城市',value:'0'},
//          		{name:'黄山市',value:'0'}
            ]
        }]
    });
}

var anhui = {'anqing':'安庆市','bengbu':'蚌埠市','chuzhou':'滁州市','chizhou':'池州市','bozhou':'亳州市','hefei':'合肥市','huaibei':'淮北市','huainan':'淮南市','huangshan':'黄山市','luan':'六安市','maanshan':'马鞍山市','suzhou':'宿州市','tongling':'铜陵市','wuhu':'芜湖市','xuancheng':'宣城市'};
function ajax_mapDistribution(){
	var date = $("#date").val(); // 日期
	var param = {module:"API",method:"UserCountry.getCity",idSite:idSite,period:"range",date:date,format:"json",token_auth:t};
	var maxVisits = 0;
	var cities = new Array();
	var option = {};
	map_distribution_chart.showLoading();
	ajax_jsonp(piwik_url,param,function(data){
		data = eval(data);
		for(var key in data){
			var city = data[key];
			// 安徽
			if(city.region == '01'){
				var city_name = city.city_name.toLowerCase();
				var city_name_cn = anhui[city_name];
				if(city_name_cn != null && city_name_cn != ""){
					var nb_visits = city.nb_visits;
					if(nb_visits > maxVisits){
						maxVisits = nb_visits;
					}
					cities.push({name:city_name_cn,value:nb_visits});
				}
			}
		}
		if(maxVisits != 0){
			option = {
				visualMap : {
					max : maxVisits
				},
				series : [{
					data : cities
				}]
			};
		}else{
			option = {
				visualMap : {
					max : 100
				},
				series : [{
					data : []
				}]
			};
		}
		map_distribution_chart.setOption(option);
		map_distribution_chart.hideLoading();
	});
}

// 跳转地域分布详情
function jumpDistrict(){
	parent.changeMenu("menu-child-43");
	window.location.href = "m4/district.html?siteId="+idSite+"&t="+t;
}
// 地图分布end

// Top10最优性能页面start
function top10WellPage(){
	var date = $("#date").val(); // 日期
	var p_1 = "module=API&method=Actions.getPageUrls&idSite="+idSite+"&period=range&date="+date+"&format=json&token_auth="+t+"&filter_limit=10&filter_sort_column=avg_time_generation&filter_sort_order=asc&flat=1";
	var urls = new Array();
	urls.push(encodeURI(p_1));
	var p = getBulkRequestParam(urls);
	ajax_jsonp(piwik_url,p,function(data){
		data = eval(data);
		var pages = data[0];
		var tbodyHtml = "";
		for(var k in pages){
			var page = pages[k];
			var label = page.label;
			// label最长42字符
			if(getStrLength(label) > 42){
				label = cutStr(label,42);
			}
			var url = page.url;
			var atg = page.avg_time_generation;
			tbodyHtml += "<tr>";
			tbodyHtml += "<td title='"+url+"'><a target='_blank' href='"+url+"'>"+label+"</a></td>";
			tbodyHtml += "<td align='center'>"+atg+"</td>";
			tbodyHtml += "</tr>";
		}
		$("#top10_wellPage_tbody").html(tbodyHtml);
	});
}
// 跳转受访页面
function jumpWellPage(){
	parent.changeMenu("menu-child-33");
	window.location.href = "m3/visitPage.html?siteId="+idSite+"&t="+t+"&source=wellPage";
}
// Top10最优性能页面end

// Top10最差性能页面start
function top10BadPage(){
	var date = $("#date").val(); // 日期
	var p_1 = "module=API&method=Actions.getPageUrls&idSite="+idSite+"&period=range&date="+date+"&format=json&token_auth="+t+"&filter_limit=10&filter_sort_column=avg_time_generation&filter_sort_order=desc&flat=1";
	var urls = new Array();
	urls.push(encodeURI(p_1));
	var p = getBulkRequestParam(urls);
	ajax_jsonp(piwik_url,p,function(data){
		data = eval(data);
		var pages = data[0];
		var tbodyHtml = "";
		for(var k in pages){
			var page = pages[k];
			var label = page.label;
			// label最长42字符
			if(getStrLength(label) > 42){
				label = cutStr(label,42);
			}
			var url = page.url;
			var atg = page.avg_time_generation;
			tbodyHtml += "<tr>";
			tbodyHtml += "<td title='"+url+"'><a target='_blank' href='"+url+"'>"+label+"</a></td>";
			tbodyHtml += "<td align='center'>"+atg+"</td>";
			tbodyHtml += "</tr>";
		}
		$("#top10_badPage_tbody").html(tbodyHtml);
	});
}
// 跳转受访页面
function jumpBadPage(){
	parent.changeMenu("menu-child-33");
	window.location.href = "m3/visitPage.html?siteId="+idSite+"&t="+t+"&source=badPage";
}
// Top10最差性能页面end