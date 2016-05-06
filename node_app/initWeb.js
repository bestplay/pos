"use strict";
var exec = require("child_process").exec;
var path = require("path");
var fs = require("fs");


var nw_path = path.join(process.cwd(),'..','..','nw','nw');
var nwapp_path = path.join(process.cwd(),'..','..','pos');
var configPath = path.join(nwapp_path,'js','config.js');

function startWeb(port){

	// write conifg.js 
    var info = {};
    info.localWsPort = port;
    
    fs.writeFileSync(configPath,'localParams = ' + JSON.stringify(info) + ';');

    // open web page.
	var cmd = '"' + nw_path + '" "' + nwapp_path + '"';
	// console.log(cmd);
	exec(cmd);
}

module.exports = startWeb;