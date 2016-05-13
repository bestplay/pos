"use strict";
var exec = require("child_process").exec;

var appName = "tinyshop.exe";


var nodeAppPath = ;
var nwjsAppPath = ;

// 查找进程信息	
// wmic process get name,executablepath,processid|findstr /c:"C:\Users\wayne lu\Desktop\nw\nw.exe";

function killApp(){
	var cmd = 'taskkill /f /im ' + appName;
	exec(cmd,console.log);
}


module.exports.killApp = killApp;