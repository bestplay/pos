
function ajax(url,method,cb){
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

				cb(null,xmlhttp);
			} else {
				// alert("Problem retrieving XML data");
				cb("Problem retrieving XML data",xmlhttp);
			}
		}
	};
	xmlhttp.open(method,url,true);
	xmlhttp.send(null);


	function state_Change(){
		if (xmlhttp.readyState==4){
			// 4 = "loaded"
		}
		if (xmlhttp.status==200){
			// 200 = OK
			// ...our code here...
			// xmlhttp.responseText
		} else {
			alert("Problem retrieving XML data");
		}
	}
}

