var urlDetail = null; // 详情数据,切换时间刷新

$(function(){
	idSite = getQueryString("siteId");
	t = getQueryString("t");
	url = getQueryString("href");
	startDate = getQueryString("startDate");
	endDate = getQueryString("endDate");
	$("#date").html(startDate+" ~ "+endDate);
	$("#trendUrl").html(cutStr(url,50));
	
	var mind = {
	    /* 元数据，定义思维导图的名称、作者、版本等信息 */
	    "meta":{
	        "name":"jsMind-demo-tree",
	        "author":"hizzgdev@163.com",
	        "version":"0.2"
	    },
	    /* 数据格式声明 */
	    "format":"node_tree",
	    /* 数据内容 */
	    "data":{"id":"root","topic":"jsMind","children":[
	        {"id":"easy","topic":"Easy","direction":"left","expanded":false,"children":[
	            {"id":"easy1","topic":"Easy to show"},
	            {"id":"easy2","topic":"Easy to edit"},
	            {"id":"easy3","topic":"Easy to store"},
	            {"id":"easy4","topic":"Easy to embed"}
	        ]},
	        {"id":"open","topic":"Open Source","direction":"right","expanded":true,"children":[
	            {"id":"open1","topic":"on GitHub"},
	            {"id":"open2","topic":"BSD License"}
	        ]},
	        {"id":"powerful","topic":"Powerful","direction":"right","children":[
	            {"id":"powerful1","topic":"Base on Javascript"},
	            {"id":"powerful2","topic":"Base on HTML5"},
	            {"id":"powerful3","topic":"Depends on you"}
	        ]},
	        {"id":"other","topic":"test node","direction":"left","children":[
	            {"id":"other1","topic":"I'm from local variable"},
	            {"id":"other2","topic":"I can do everything"}
	        ]}
	    ]}
	};
    var options = {                   // options 将在下一章中详细介绍
        container:'jsmind_container', // [必选] 容器的ID，或者为容器的对象
        editable:false,                // [可选] 是否启用编辑
        theme:'info',                // [可选] 主题
        support_html : true,
        view:{
	       hmargin:30,        // 思维导图距容器外框的最小水平距离
	       vmargin:50,         // 思维导图距容器外框的最小垂直距离
	       line_width:2,       // 思维导图线条的粗细
	       line_color:'#555'   // 思维导图线条的颜色
	   },
    };
    var jm = new jsMind(options);
    jm.show(mind);
    
});		
	

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