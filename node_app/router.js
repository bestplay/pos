"use strict";
var dbm = require('./dbm.js');

function handler(m,res){
	console.log(m);

	switch(m.act){
		case "getGoods":
			dbm.getGoodsInfo(m.bcode,function(e,r){
				console.log('1111');
				if(e){ console.log(e); }
				res.end(r);
			});
			break;

		default :
			break;
	}
}

module.exports = handler;
