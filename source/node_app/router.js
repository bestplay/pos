"use strict";
var dbm = require('./dbm.js');
var path = require('path');
var exec = require('child_process').exec;

function printOrder(str,cb){
	var cmdStr = path.join(__dirname,"..","tools","printer");
	var a = str.split('<br>');
	var t_s = "";
	for(var i=0; i<a.length; i++){
		t_s += ' -t "' + a[i] + '"';
	}
	cmdStr += t_s;
	console.log('Print cmd: ',cmdStr);
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

		case "searchGoods":
			dbm.searchGoods(m.key,function(e,r){
				if(e){ console.log(e); }
				res.end(JSON.stringify({act:m.act, res:r}));
			});
			break;


		default :
			res.end(JSON.stringify(m));
			break;
	}


}

module.exports = handler;
 