"use strict";
var WebSocketServer = require('ws').Server;

function wsServer(port,callback){
	port = port || 10007;
	var t = {};
	createServer(cback);

	function createServer(cback){
		var wss = new WebSocketServer({ port: port });
		wss.on("error",cback);
		t = setTimeout(function(){
			console.log("using port : " + port);
			callback && callback(wss, port);
		},1000);
	}
	function cback(e){
		port ++;
		if(port > 60000){
			throw "Tried too many ports and failed!";
			return;
		}
		clearTimeout(t);
		console.log("port is used try listening port : " + port);
		createServer(cback);
	}
}


module.exports = wsServer;