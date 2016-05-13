"use strict";
var exec = require("child_process").exec;
var path = require("path");


var nw_path = path.join(__dirname,'..','..','libary','nw','nw');
var nwapp_path = path.join(__dirname,'..');

function startWeb(){
    // open web page.
	var cmd = '"' + nw_path + '" "' + nwapp_path + '"';
	// console.log(cmd);
	exec(cmd,console.log);
}

module.exports = startWeb;