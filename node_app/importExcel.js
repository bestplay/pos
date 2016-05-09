var xlsx = require('node-xlsx');

// 1: barcode 	/ name 		/ specifi
// 3: barcode 	/ name 		/ specifi 	/ unit 		/ other_price 	
// 4: name 		/ specifi 	/ unit 		/ barcode 	----3 pages.


// barcode / name / specifi / unit / price / other_price / cost 

var dbm = require('./dbm.js');
function importData(){
	dbm.createGoodsTable(function(){
		console.log('# Import ---------------------');

		var sql = "INSERT INTO GOODS (name,bcode,specifi,unit,price,other_price,cost) VALUES (?,?,?,?,?,?,?)";


		// 
		var sql1 = "INSERT INTO GOODS (bcode,name,specifi) VALUES (?,?,?)";
		var sql3 = "INSERT INTO GOODS (bcode,name,specifi,unit,other_price) VALUES (?,?,?,?,?)";
		var sql4 = "INSERT INTO GOODS (name,specifi,unit,bcode) VALUES (?,?,?,?)";



		var res = xlsx.parse('../barcodeData/bc1.xls');
		var d = res[0].data;

		for(var i=0; i<d.length; i++){
			if(!d[i][1]){continue;}

			for(var k=0;k<d[i].length; k++){
				if(typeof d[i][k] == "string"){
					d[i][k] = d[i][k].trim();
				}
			}

			dbm.db.run(sql1,d[i]);
		}



		res = xlsx.parse('../barcodeData/bc3.xls');
		d = res[0].data;

		for(var i=0; i<d.length; i++){
			if(!d[i][1]){continue;}

			for(var k=0;k<d[i].length; k++){
				if(typeof d[i][k] == "string"){
					d[i][k] = d[i][k].trim();
				}
			}
			d[i][4] && (d[i][4] = d[i][4] * 100);
			dbm.db.run(sql3,d[i]);
		}

		res = xlsx.parse('../barcodeData/bc4.xls');
		for(var j=0; j<res.length; j++){

			d = res[j].data;

			for(var i=0; i<d.length; i++){
				if(!d[i][0]){continue;}

				for(var k=0;k<d[i].length; k++){
					if(typeof d[i][k] == "string"){
						d[i][k] = d[i][k].trim();
					}
				}
				dbm.db.run(sql4,d[i]);
			}
		}



		dbm.db.all("SELECT * FROM GOODS", function(e,r){
			console.log('----1')
			console.log(e);
			console.log(r.length);
		});
	});
}

function distinct(){
	var s = "select * from goods where bcode in (select  bcode  from  goods  group  by  bcode  having  count(bcode) > 1) order by bcode"
	dbm.db.all(s,function(e,r){
		var ids = [];

		for(var i=0;i<r.length;i++){
			var keys = Object.getOwnPropertyNames(r[i]);
			r[i].w = 0;
			for(var j=0;j<keys.length;j++){
				if(r[i][keys[j]]){
					r[i].w += 1;
				}
			}
			ids.push(r[i].id);
		}
		// console.log(r);

		var saveList = {};
		var n;
		for(var p=0;p<r.length;p++){
			n = r[p].bcode + '';
			if(saveList[n]){
				if(r[p].w > saveList[n].w){
					saveList[n] = r[p];
				}
			}else{
				saveList[n] = r[p];
			}
		}

		var sIds = [];

		for(var pp in saveList){
			sIds.push(saveList[pp].id);
		}

		var dIds = [];
		for(var e=0;e<ids.length;e++){
			if(sIds.indexOf(ids[e])==-1){
				dIds.push(ids[e]);
			}
		}

		// console.log(dIds);
		// console.log('saveList length: ', saveList.length);
		// console.log('sIds length: ', sIds.length);
		// console.log(dIds.length);
		// console.log(r.length);


	// CREATE UNIQUE INDEX IX_bcode ON goods (bcode);



		dIds.forEach(function(i){
			var s = "DELETE FROM GOODS WHERE id=?";
			dbm.db.run(s,i);
		})

	});
}


distinct();

