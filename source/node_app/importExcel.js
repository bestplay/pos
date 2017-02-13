var xlsx = require('node-xlsx');

// 1: barcode 	/ name 		/ specifi
// 3: barcode 	/ name 		/ specifi 	/ unit 		/ other_price 	
// 4: name 		/ specifi 	/ unit 		/ barcode 	----3 pages.


// barcode / name / specifi / unit / price / other_price / cost 

var dbm = require('./dbm.js');
function importData(){
	dbm.createGoodsTable(function(){
			dbm.db.all('select count(*) from goods',function(e,r){
				console.log('GOODS COUNT : ',r);
			});
			return;


		console.log('# Import ---------------------');

		var sql = "INSERT INTO GOODS (name,bcode,specifi,unit,price,other_price,cost) VALUES (?,?,?,?,?,?,?)";


		// 
		var sql1 = "INSERT INTO GOODS (bcode,name,specifi) VALUES (?,?,?)";
		var sql3 = "INSERT INTO GOODS (bcode,name,specifi,unit,other_price) VALUES (?,?,?,?,?)";
		var sql4 = "INSERT INTO GOODS (name,specifi,unit,bcode) VALUES (?,?,?,?)";



		var res = xlsx.parse('./barcode11.xlsx');
		var d = res[0].data;

			var keys = Object.getOwnPropertyNames(d);
			// console.log(typeof d);
			// console.log(d[keys[0]],d[keys[1]],d[keys[2]]);
			// console.log('===============1');
			// var kk = keys[keys.length-2];

			// console.log(d[kk]);
			// console.log('===============2');

			var item;
			function cl(it){
				if(!it){
					return "";
				}
				var res;
				res = it.trim ? it.trim() : it ;
				return res;
			}
			for(var i=1;i<keys.length;i++){
				item = d[keys[i]];

				dbm.db.run(sql3,cl(item[0]),cl(item[1]),cl(item[2]),cl(item[3]),cl(item[4]),function(e,r){
					if(e){
						console.log(i)
					}
				})
			}





			// console.log(d.[0],d.[1],d.[2]);
			// console.log('-----------last one:');
			// console.log(d.[d.length-1]);



			return;



		for(var i=0; i<d.length; i++){
			if(!d[i][1]){continue;}

			for(var k=0;k<d[i].length; k++){
				if(typeof d[i][k] == "string"){
					d[i][k] = d[i][k].trim();
				}
			}

			dbm.db.run(sql1,d[i]);
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


// distinct();


importData();





// 5/13日前 134716 