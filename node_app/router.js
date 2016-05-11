"use strict";
var dbm = require('./dbm.js');
var path = require('path');
var exec = require('child_process').exec;

function printOrder(str,cb){
	var cmdStr = path.join("..","tools","printer");
	cmdStr += ' -t "'+ str +'"';
	exec(cmdStr,function(err,stdout,stderr){
		console.log(err);
		console.log(stdout);
		cb();
	});
}


function handler(m,res){
	console.log(m);

	switch(m.act){
		case "getGoods":
			dbm.getGoodsInfo(m.bcode,function(e,r){
				if(e){ console.log(e); }
				
				console.log("response: ",r);
				res.end(JSON.stringify(r));
			});
			break;

		case "saveGoods":
			dbm.saveGoods(m.goods,function(){
				res.end(JSON.stringify({act:m.act, res:"done"}));
			});
			break;
		case "print":
			printOrder(m.info,function(){
				res.end(JSON.stringify({act:m.act, res:"done"}));
			});
			break;

		default :
			res.end(JSON.stringify(m));
			break;
	}
}

module.exports = handler;
 