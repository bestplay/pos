"use strict";
var http = require('http');
var util = require('util');
var url = require('url');
var router = require('./router.js');

function httpServer(callback){
	var server = http.createServer(function(req,res){
		// handle messages...
		if(req.method == "GET"){
			console.log("GET");
			var params = url.parse(req.url,true).query;
			router(params,res);
		}else{
			console.log("POST");
			var data = "";
			req.on('data',function(c){
				data += c;
			});
			req.on('end',function(){
				try{
					data = JSON.parse(data);
				}catch(e){
					console.log(e);
				}
				router(data,res);
			});
		}

	}).listen(10007,callback);
}


module.exports = httpServer;