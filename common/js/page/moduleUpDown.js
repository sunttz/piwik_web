$(function(){
	idSite = getQueryString("siteId");
	t = getQueryString("t");
	module = decodeURIComponent(getQueryString("module"));
	startDate = getQueryString("startDate");
	endDate = getQueryString("endDate");
	grade = getQueryString("grade");
	$("#date").html(startDate+" ~ "+endDate);
	$("#trendUrl").html(cutStr(module,80));
    ajaxMind();
    $("#returnVisitModule").click(function(){
    		if(grade == "no"){
    			window.location.href="visitPageTitle.html?siteId="+idSite+"&t="+t+"&grade="+grade+"&sd="+startDate+"&ed="+endDate;
    		}else{
    			window.history.back();
    		}
    });
});		

// 请求页面上下游数据
function ajaxMind(){
	var param = {date:startDate+','+endDate,actionType:'title',actionName:module,format:'json',module:'API',method:'Transitions.getTransitionsForAction',filter_limit:-1,idSite:idSite,period:'range',token_auth:t};
	//console.info(param);
	ajax_jsonp(piwik_url,param,function(data){
		//{result: "error", message: "NoDataForAction"}
		data = eval(data);
		//console.info(data);
		if(data.hasOwnProperty("result") && data.result == "error"){
			$("#jsmind_container").html("<br/><p>&nbsp;&nbsp;本模块在"+startDate+"~"+endDate+"期间没有被访问过或者不正确</p>");
		}else{
			anaMind(data);
		}
	});
}

// 格式化页面上下游数据
function anaMind(pageUpDownData){
	var mind = {
	    /* 元数据，定义思维导图的名称、作者、版本等信息 */
	    "meta":{
	        "name":"moduleUpDown-tree",
	        "author":"pud",
	        "version":"0.1"
	    },
	    /* 数据格式声明 */
	    "format":"node_tree",
	    /* 数据内容 */
	    "data":{}
	};
	var data = {};
	var previousPages = null; // 来自内部页面
	var website = null; // 来自网站
	var direct = null; // 直接输入
	var followingPages = null; // 转向站内页面
	var outlinks = null; // 离站链接
	var exits = null; // 退出页
	var previousPagesTotal = 0;
	var websiteTotal = 0;
	var followingPagesTotal = 0;
	var outlinksTotal = 0;
	// 来自内部页面数据格式化
	var previousPagesData = pageUpDownData['previousPages'];
	if(previousPagesData.length > 0){
		children = [];
		for(var i in previousPagesData){
			var row = previousPagesData[i];
			previousPagesTotal += row.referrals;
		}
		for(var i in previousPagesData){
			var row = previousPagesData[i];
			var label = decodeURIComponent(row.label);
			var referrals = row.referrals;
			var prop = (referrals/previousPagesTotal*100).toFixed(0);
			topic = '<span title="'+label+'">'+label+'</span><br/><font size=2>'+referrals+' 次来自站内页面  占'+prop+'%</font>';
			children.push({id:'previousPages'+i,topic:topic});
		}	
		previousPages = {id:'previousPages',topic:'来自内部页面',direction:'left',expanded:true,children:children};
	}
	// 来自网站数据格式化
	var referrersData = pageUpDownData['referrers'];
	if(referrersData.length > 1){
		var details = referrersData[1]['details'];
		websiteTotal = referrersData[1].visits;
		children = [];
		for(var i in details){
			var row = details[i];
			var label = decodeURIComponent(row.label);
			var referrals = row.referrals;
			var prop = (referrals/websiteTotal*100).toFixed(0);
			topic = '<span title="'+label+'">'+label+'</span><br/><font size=2>'+referrals+' 次来自网站  占'+prop+'%</font>';
			children.push({id:'website'+i,topic:topic});
		}
		website = {id:'website',topic:'来自网站',direction:'left',expanded:true,children:children};
	}
	// 直接输入格式化
	var visits = referrersData[0].visits;
	if(visits != 0){
		direct = {id:'direct',topic:'直接访问	'+visits+'次',direction:'left'}
	}
	// 转向站内页面格式化
	var followingPagesData = pageUpDownData['followingPages'];
	if(followingPagesData.length > 0){
		children = [];
		for(var i in followingPagesData){
			var row = followingPagesData[i];
			followingPagesTotal += row.referrals;
		}
		for(var i in followingPagesData){
			var row = followingPagesData[i];
			var label = decodeURIComponent(row.label);
			var referrals = row.referrals;
			var prop = (referrals/followingPagesTotal*100).toFixed(0);
			topic = '<span title="'+label+'">'+label+'</span><br/><font size=2>'+referrals+' 次转向站内页面  占'+prop+'%</font>';
			children.push({id:'followingPages'+i,topic:topic});
		}
		followingPages = {id:'followingPages',topic:'转向站内页面',direction:'right',expanded:true,children:children};
	}
	// 离站链接格式化
	var outlinksData = pageUpDownData['outlinks'];
	if(outlinksData.length > 0){
		children = [];
		for(var i in outlinksData){
			var row = outlinksData[i];
			outlinksTotal += row.referrals;
		}
		for(var i in outlinksData){
			var row = outlinksData[i];
			var label = decodeURIComponent(row.label);
			var referrals = row.referrals;
			var prop = (referrals/outlinksTotal*100).toFixed(0);
			topic = '<span title="'+label+'">'+label+'</span><br/><font size=2>'+referrals+' 次转向外部链接  占'+prop+'%</font>';
			children.push({id:'outlinks'+i,topic:topic});
		}
		outlinks = {id:'outlinks',topic:'转向外部链接',direction:'right',expanded:true,children:children};
	}
	// 退出页格式化
	var e = pageUpDownData['pageMetrics'].exits;
	if(e != 0){
		exits = {id:'exits',topic:'直接退出	'+e+'次',direction:'right'};
	}
	// 组装
	var pv = pageUpDownData['pageMetrics'].pageviews; // 浏览量
	var loops = pageUpDownData['pageMetrics'].loops; // 刷新次数
	topic = '<font size=3>'+module+'<br/>&nbsp;&nbsp;'+pv+' 浏览量<hr style="margin:5px 0 5px 0"/>'
			+'入口流量<br/>'
			+'<font size=2>&nbsp;&nbsp;'+previousPagesTotal+' 次来自站内页面<br/>&nbsp;&nbsp;'+websiteTotal+' 次来自网站</br>&nbsp;&nbsp;'+visits+' 次来自直接访问<br/>&nbsp;&nbsp;'+loops+' 次刷新页面<br/></font>'
			+'出口流量<br/>'
			+'<font size=2>&nbsp;&nbsp;'+followingPagesTotal+' 次转向站内页面</br>&nbsp;&nbsp;'+outlinksTotal+' 次转向外部链接</br>&nbsp;&nbsp;'+e+' 次直接退出</font>'
			+'</font>';
	data = {"id":"root","topic":topic,"children":[]};
	children = [];
	if(previousPages != null){
		children.push(previousPages);
	}
	if(website != null){
		children.push(website);
	}
	if(direct != null){
		children.push(direct);
	}
	if(followingPages != null){
		children.push(followingPages);
	}
	if(outlinks != null){
		children.push(outlinks);
	}
	if(exits != null){
		children.push(exits);
	}
	data['children']=children;
	mind['data'] = data;
	showJsmind(mind);
}

// 展示jsmind图
function showJsmind(mind){
	var options = {                   
        container:'jsmind_container', 
        editable:false,                
        theme:'info',                
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
}
