"use strict";

// set process title

var initWs = require('./initWs.js');
var initWeb = require('./initWeb.js');

function run(){
	initWs(function(){
		// init webpage
		initWeb();
	});
}

run();
// module.exports = run;
