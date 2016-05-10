"use strict";
var dbm = require('./dbm.js');

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

		default :
			res.end(JSON.stringify(m));
			break;
	}
}

module.exports = handler;
 