"use strict";
var exec = require("child_process").exec;
var path = require("path");


var nw_path = path.join(process.cwd(),'..','..','nw','nw');
var nwapp_path = path.join(process.cwd(),'..','..','pos');

function startWeb(){
    // open web page.
	var cmd = '"' + nw_path + '" "' + nwapp_path + '"';
	// console.log(cmd);
	exec(cmd);
}

module.exports = startWeb;