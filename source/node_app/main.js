"use strict";

// set process title

var initWs = require('./initWs.js');
var initWeb = require('./initWeb.js');
var processListener = require('./processManager.js').listen;


function run(){
	processListener();

	initWs(function(){
		// init webpage
		initWeb();
	});
}

run();
// module.exports = run;
