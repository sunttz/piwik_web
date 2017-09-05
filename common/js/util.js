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

/*获取地址栏参数*/
function getQueryString(name){
	var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
	var r = window.location.search.substr(1).match(reg);
	if(r!=null) return r[2]; return null;
}

/*获取批量请求参数*/
function getBulkRequestParam(urls){
	return {module:"API",method:"API.getBulkRequest",format:"json",urls:urls};
}

/*获取字符串长度（中文2，英文1）*/
function getStrLength (str) {
    var realLength = 0, len = str.length, charCode = -1;
    for (var i = 0; i < len; i++) {
        charCode = str.charCodeAt(i);
        if (charCode >= 0 && charCode <= 128) realLength += 1;
        else realLength += 2;
    }
    return realLength;
};

/** 
 * js截取字符串，中英文都能用 
 * @param str：需要截取的字符串 
 * @param len: 需要截取的长度 
 */
function cutStr(str, len) {
    var str_length = 0;
    var str_len = 0;
    str_cut = new String();
    str_len = str.length;
    for (var i = 0; i < str_len; i++) {
        a = str.charAt(i);
        str_length++;
        if (escape(a).length > 4) {
            //中文字符的长度经编码之后大于4  
            str_length++;
        }
        str_cut = str_cut.concat(a);
        if (str_length >= len) {
            str_cut = str_cut.concat("...");
            return str_cut;
        }
    }
    //如果给定字符串小于指定长度，则返回源字符串；  
    if (str_length < len) {
        return str;
    }
}

//获取addDayCount天后的日期 
function getDateStr(addDayCount){ 
	var dd = new Date(); 
	dd.setDate(dd.getDate()+addDayCount);
	var y = dd.getFullYear(); 
	var m = (dd.getMonth()+1)<10?"0"+(dd.getMonth()+1):(dd.getMonth()+1);//获取当前月份的日期，不足10补0
	var d = dd.getDate()<10?"0"+dd.getDate():dd.getDate(); //获取当前几号，不足10补0
	return y+"-"+m+"-"+d; 
}

// 格式化秒值格式
function formatTime(seconds) {
	if(seconds == null || seconds == "" || seconds == 0){
		return "00:00:00";
	}else{
		return [
		        parseInt(seconds / 60 / 60),
		        parseInt(seconds / 60 % 60),
		        parseInt(seconds % 60)
		    ]
		        .join(":")
		        .replace(/\b(\d)\b/g, "0$1");
	}
}