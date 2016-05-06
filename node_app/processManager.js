"use strict";
var exec = require("child_process").exec;

var appName = "tinyshop.exe";

function killApp(){
	var cmd = 'taskkill /f /im ' + appName;
	exec(cmd);
}


module.exports.killApp = killApp;