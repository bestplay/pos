"use strict";

// set process title

var initWs = require('./initWs.js');
var initWeb = require('./initWeb.js');
var handleWebMsg = require('./handleWebMsg.js');
global.ws_client = global.ws_client || null;

function run(){
	initWs(10007,function(wss,port){
		console.log('ws listening ',port);
		wss.on('connection', function connection(ws) {
			if(global.ws_client){
				ws.close(400,"There is already a client connected!");
				return;
			}
			global.ws_client = ws;
			ws.send('msg s -> c');
			ws.on('message', function incoming(message) {
				console.log('received: %s', message);
				// ws.send('msg s -> c');

				handleWebMsg(message);
			});
			ws.on('close',function(code,msg){
				global.ws_client = null;
				console.log(code);
				console.log(msg);
			});
		});
		// init webpage
		initWeb(port);
	});
}

run();
// module.exports = run;
