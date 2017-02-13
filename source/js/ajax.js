function ajax(url,method,data,cb){
	var qs = ""
	if(method.toLowerCase == "get"){
		qs = null;
	}else{
		if(typeof data == "object"){
			qs = JSON.stringify(data);
		}else if(typeof data == "string"){
			qs = data;
		}else{
			throw "data need a object or string type";
			return;
		}
	}
	var xmlhttp=new XMLHttpRequest();
	xmlhttp.timeout = 3000;
	// xmlhttp.ontimeout = function (e) {
	//   cb(e);
	// };
	xmlhttp.onreadystatechange = function(){
		if (xmlhttp.readyState==4){
				// 4 = "loaded"
			if (xmlhttp.status==200){
				// 200 = OK
				// ...our code here...
				// xmlhttp.responseText

				cb(xmlhttp.responseText);
			} else {
				// alert("Problem retrieving XML data");
				// cb("Problem retrieving XML data",xmlhttp.responseText);
				if(url.indexOf("localhost") == -1){
					cb();
				}else{
					console.log("AJAX 请求错误");
				}
				return;
			}
		}
	};
	xmlhttp.open(method,url,true);
	xmlhttp.send(qs);
}

