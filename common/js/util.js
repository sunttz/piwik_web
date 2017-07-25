/*设置cookie*/
function setCookie(name, value, min){
	if(min == null || min == ''){
		min = 30;
	}
	var exp  = new Date();
	exp.setTime(exp.getTime() + min*60*1000);
	document.cookie = name + "="+ escape (value) + "; path=/;expires=" + exp.toGMTString();
}

/*获取cookie*/
function getCookie(name) {
	var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
	if(arr = document.cookie.match(reg))
		return unescape(arr[2]); 
	else 
		return null; 
}

//清除cookie    
function clearCookie(name) {    
    setCookie(name, "", -1);    
}

/*ajax请求*/
function ajax(url, param, datat, callback) {  
	$.ajax({  
		type: "post",  
		url: url,  
		data: param,  
		dataType: datat,  
		success: callback,  
		error: function () {  
			alert("请求异常.."); 
		}
	});  
}  

/*ajax跨域请求*/
function ajax_jsonp(url, param, callback) {  
	$.ajax({  
		type: "post",  
		url: url,  
		data: param,  
		dataType: "jsonp",
		jsonp: "callback",
		success: callback,  
		error: function () {  
			alert("请求异常.."); 
		}
	});  
} 