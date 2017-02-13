"use strict";
var exec = require("child_process").exec;
var path = require("path");

var nwPath = path.join(__dirname,'..','..','libary','nw','nw.exe');
// 查找进程信息	
// wmic process get name,executablepath,processid|findstr /c:"C:\Users\wayne lu\Desktop\nw\nw.exe";


// listen the nw.exe process' running status
function listen(){
	var cmd = 'wmic process get name,executablepath,processid|findstr /c:';
	cmd = cmd + '"' + nwPath + '"';

	var arr = [];
	setInterval(function(){
		exec(cmd,function(err,stdout,stderr){
			if(!stdout){
				console.log("Found app exit. exit this process too.");
				process.exit();
			}
		})
	},3000);
}


function killApp(appName){
	var cmd = 'taskkill /f /im ' + appName;
	exec(cmd,console.log);
}


module.exports.listen = listen;