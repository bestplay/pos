var wrapper = function(){
	var sqlite3 = require('sqlite3').verbose();
	var db = new sqlite3.Database('tinyshop.sqlite3');


	function isTableExsit(tName,cb){
		var sql = "SELECT COUNT(*) as count FROM sqlite_master where type='table' and name='" + tName + "'";

		console.log('1112323');
		db.all(sql,function(err,res){
			global.console.log("-----");
			global.console.log(err);
			global.console.log(res);
			global.console.log("-----");
			db.close();
			var ret = true;
			ret = (res[0].count > 0 ? ret : (!ret));
			console.log(ret);
			cb && cb(ret);
		});
	}
	// barcode / name / specifi / unit / price / other_price / cost 

	function createGoodsTable(cb){
		var sql = "CREATE TABLE GOODS( \
			   id 			INTEGER PRIMARY KEY  AUTOINCREMENT  NOT NULL, \
			   name 		VARCHAR(50)    NOT NULL, \
			   bcode 		INT     NOT NULL, \
			   specifi		VARCHAR(10), \
			   unit			VARCHAR(10), \
			   price 		INT, \
			   other_price 	INT, \
			   cost         INT \
			)";

		// db.run(sql);
		isTableExsit("GOODS",function(r){
			if(!r){
				console.log("creating table goods...");
				db.run(sql,function(){
					cb && cb();
				});
			}else{
				cb&&cb();
			}
		});
	}

	function test_sql(){
		global.console.log('db......................');
		var sqlite3 = require('sqlite3').verbose();
		var db = new sqlite3.Database('test.sqlite3', function(err){
			if(err){
				// TODO DB error
				console.log(err); return;
			}

			db.serialize(function() {
				db.run("CREATE TABLE lorem (info TEXT)");

				var stmt = db.prepare("INSERT INTO lorem VALUES (?)");
				for (var i = 0; i < 10; i++) {
						stmt.run("Ipsum " + i);
				}
				stmt.finalize();

				db.each("SELECT rowid AS id, info FROM lorem", function(err, row) {
						console.log(row.id + ": " + row.info);
				});
			});

			db.close();
		});
		return("1234456");
	}

	function getGoodsInfo(bcode,cb){
		var s = "SELECT * FROM GOODS WHERE bcode=? LIMIT 1";
		db.all(s,bcode,function(e,r){
			var res = r[0];
			if(res){
				var ks = Object.getOwnPropertyNames(res);
				ks.forEach(function(k){
					res[k] = res[k] || "";
				});
			}
			res = res || null;
			cb(e,res);
		});
	}

	function saveGoods(goods,cb){
		//  
		var sql = "";
		var keys = Object.getOwnPropertyNames(goods);
		var values = [];
		var update_keys_str = "";
		var insert_keys_str = "";
		for(var i=0; i<keys.length; i++){
			values.push(goods[keys[i]]);

			update_keys_str += (',' + keys[i] + '=? ');
			insert_keys_str += ',?';

		}
		update_keys_str = update_keys_str.slice(1);
		insert_keys_str = insert_keys_str.slice(1);

		getGoodsInfo(goods.bcode,function(e,r){
			if(r && r.length > 0){
				// update
				sql = 'UPDATE GOODS SET ' + update_keys_str;
				sql += ('WHERE bcode=?');
				values.push(goods.bcode);

			}else{
				// insert
				sql = 'INSERT INTO GOODS (' + keys.join(',') + ') VALUES (' + insert_keys_str + ')'; 
			}
			console.log(sql);
			db.run(sql,values,function(e,r){
				if(e){
					console.log(e);
					return;
				}
				console.log("VALUE CHANGES: " , this.changes, this.lastID);
				cb && cb();
			});
		})
	}


	var ret_obj = {};
	ret_obj.saveGoods = saveGoods;
	ret_obj.getGoodsInfo = getGoodsInfo;
	ret_obj.isTableExsit = isTableExsit;
	ret_obj.db = db;
	ret_obj.test_sql = test_sql;
	ret_obj.createGoodsTable = createGoodsTable;
	return ret_obj;
}

if(typeof module != "undefined"){
		module.exports = wrapper();
}