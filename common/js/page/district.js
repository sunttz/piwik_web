var districtData = null; // 区域分布数据
var anhui = {'anqing':'安庆市','bengbu':'蚌埠市','chuzhou':'滁州市','chizhou':'池州市','bozhou':'亳州市','hefei':'合肥市','huaibei':'淮北市','huainan':'淮南市','huangshan':'黄山市','luan':'六安市','maanshan':'马鞍山市','suzhou':'宿州市','tongling':'铜陵市','wuhu':'芜湖市','xuancheng':'宣城市'};
$(function(){
	idSite = getQueryString("siteId");
	t = getQueryString("t");
	//默认最近7天
	$("#date").html(getDateStr(-6)+" ~ "+getDateStr(0));
    	$("#startDate").val(getDateStr(-6));
	$("#endDate").val(getDateStr(0));
	// 初始化地域分布图
	var districtMapChart = null;
	init_map();
	ajax_district(); // 获取区域分布数据

	
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
			ajax_district(); // 获取区域分布数据
		} 
    });
});
// 结束时间选择事件
function dateSelect(){
	$("#date").html($("#startDate").val()+" ~ "+$("#endDate").val());
	$("#dateDiv button").removeClass("active");
	ajax_district(); // 获取区域分布数据
}
// 图表自适应
window.onresize = function(){
	districtMapChart.resize();
}

// 获取区域分布数据
function ajax_district(){
	var startDate = $("#startDate").val();
	var endDate = $("#endDate").val();
	var param = {module:'API',method:'UserCountry.getCity',idSite:idSite,period:'range',date:startDate+','+endDate,format:'json',token_auth:t,filter_sort_column:'nb_visits',filter_sort_order:'desc'};
	ajax_jsonp(piwik_url, param, function(data){
		data = eval(data);
		districtData = data;
		ana_map(); // 加载区域分布图
		anaCsTable(); // 加载指标详情表
	});
}

// 地域分布图start

// 初始化地域分布图
function init_map(){
	districtMapChart = echarts.init(document.getElementById('districtMap'));
    districtMapChart.setOption({
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
	        inRange: {color: ['#e0ffff', '#006edd']},
	        calculable : true
        },
        series: [{name:"访问量",type: 'map',map: 'anhui',data:[]}]
    });
}

// 解析加载地域分布图
function ana_map(){
	var districtMapIndex = $("#districtMapIndex").val(); // 指标
	var option = {};
	var maxVal = 0;
	var name = "";
	var cities = new Array();
	districtMapChart.showLoading();
	if(districtMapIndex == "nv"){
		name = "访问";
		for(var key in districtData){
			var city = districtData[key];
			// 安徽
			if(city.region == '01'){
				var city_name = city.city_name.toLowerCase();
				var city_name_cn = anhui[city_name];
				if(city_name_cn != null && city_name_cn != ""){
					var nb_visits = city.nb_visits;
					if(nb_visits > maxVal){
						maxVal = nb_visits;
					}
					cities.push({name:city_name_cn,value:nb_visits});
				}
			}
		}
	}else if(districtMapIndex == "na"){
		name = "活动";
		for(var key in districtData){
			var city = districtData[key];
			if(city.region == '01'){
				var city_name = city.city_name.toLowerCase();
				var city_name_cn = anhui[city_name];
				if(city_name_cn != null && city_name_cn != ""){
					var nb_actions = city.nb_actions;
					if(nb_actions > maxVal){
						maxVal = nb_actions;
					}
					cities.push({name:city_name_cn,value:nb_actions});
				}
			}
		}
	}else if(districtMapIndex == "ana"){
		name = "平均活动次数";
		for(var key in districtData){
			var city = districtData[key];
			if(city.region == '01'){
				var city_name = city.city_name.toLowerCase();
				var city_name_cn = anhui[city_name];
				if(city_name_cn != null && city_name_cn != ""){
					var nv = city.nb_visits;
					var na = city.nb_actions;
					var ana = parseFloat((na / nv).toFixed(1));
					if(ana > maxVal){
						maxVal = ana;
					}
					cities.push({name:city_name_cn,value:ana});
				}
			}
		}
	}else if(districtMapIndex == "atos"){
		name = "网站平均停留时间";
		for(var key in districtData){
			var city = districtData[key];
			if(city.region == '01'){
				var city_name = city.city_name.toLowerCase();
				var city_name_cn = anhui[city_name];
				if(city_name_cn != null && city_name_cn != ""){
					var nv = city.nb_visits;
					var atos = parseInt((city.sum_visit_length / nv).toFixed(0));
					if(atos > maxVal){
						maxVal = atos;
					}
					cities.push({name:city_name_cn,value:atos});
				}
			}
		}
	}
	if(maxVal == 0){
		maxVal = 100;
		cities = [];
	}
	// 网站平均停留时间 特殊处理
	if(districtMapIndex == "atos"){
		option = {
			tooltip: {
	            formatter: function(param){
	            		var val = param.value;
	            		if(isNaN(val)){val = 0;}
	            		return param.name + '<br/>'+ formatTime(val) +' '+name;
	            }
	       	},
			visualMap : {
				max : maxVal
			},
			series : [{
				data : cities
			}]
		};
	}else{
		option = {
			tooltip: {
	            formatter: function(param){
	            		var val = param.value;
	            		if(isNaN(val)){val = 0;}
	            		return param.name + '<br/>'+ val +' '+name;
	            }
	       	},
			visualMap : {
				max : maxVal
			},
			series : [{
				data : cities
			}]
		};
	}
	districtMapChart.setOption(option);
	districtMapChart.hideLoading();
}


// 指标按钮点击事件
function districtMap_btn(index){
	$("#districtMap_btn_text").text("指标："+$("#btn_"+index).text());
	$("#districtMapIndex").val(index);
	ana_map();
}
// 地域分布图end

// 指标详情表start
// 解析指标详情数据
function anaCsTable(){
	var csData = [];
	for(var k in districtData){
		var v = districtData[k];
		
		var cn = v.city_name;
		var city_name = anhui[cn.toLowerCase()];
		if(city_name == null){
			city_name = cn;
		}
		var nv = v.nb_visits;
		var na = v.nb_actions;
		var ana = (na / nv).toFixed(1);
		var atos = formatTime((v.sum_visit_length / nv).toFixed(0));
		var br = (v.bounce_count / nv * 100).toFixed(0) + "%";
		csData.push({cn:city_name,nv:nv,na:na,ana:ana,atos:atos,br:br});
	}
	initCsTable(csData);
}
// 构造表格数据
function initCsTable(csData){
	var customHeader = "<thead>"
						+"<tr><th rowspan='2'>地域</th><th colspan='2'>网站基础指标</th><th colspan='3'>流量质量指标</th></tr>"
						+"<tr>"
							+"<th title='访客第一次访问你的网站或者距离上次访问时间超过30分钟，会被统计为新的访问。'>访问</th>"
							+"<th title='访客执行的活动次数。活动包括查看页面、站内搜索、下载或者离站链接。'>活动</th>"
							+"<th title='访问期间的平均活动次数 (包括查看页面、站内搜索、下载或离站链接)。'>平均活动次数</th>"
							+"<th title='平均停留时间。'>网站平均停留时间</th>"
							+"<th title='只查看单个页面的百分比，即访客直接从入口页面离开网站。'>跳出率</th>"
						+"</tr></thead>";
	var cs = new table({
		"tableId": "cs_table", //必须
		"headers": ["地域", "访问", "活动", "平均活动次数", "网站平均停留时间","跳出率"], //必须
		"customHeader" : customHeader, // 自定义表头，若定义则覆盖默认表头
		"data": csData, //必须
		"displayNum": 15, //必须  默认 10
		"groupDataNum": 9 //可选  默认 10
	});
}
// 指标详情表end