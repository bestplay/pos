var wrapper = function(){
	var sqlite3 = require('sqlite3').verbose();
	var path = require('path');

	var db_path = path.join(__dirname,'tinyshop.sqlite3');
	var db = new sqlite3.Database(db_path);

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

	function searchGoods (key,cb) {
		// body...
		var sql = 'SELECT * FROM GOODS WHERE bcode=? OR name LIKE ? LIMIT 20';
		db.all(sql,key,'%'+key+'%',cb)
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
		//  bcode
		if(!Number(goods.bcode) || goods.bcode.toString().indexOf('.') != -1 || (goods.price && (!Number(goods.price) || (goods.price + '.').split('.')[1].length > 2 ))){
			console.log("[saveGoods]",'goods data error!');
			return;
		}


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
			if(r){
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
	ret_obj.searchGoods = searchGoods;
	ret_obj.saveGoods = saveGoods;
	ret_obj.getGoodsInfo = getGoodsInfo;
	ret_obj.isTableExsit = isTableExsit;
	ret_obj.db = db;
	ret_obj.createGoodsTable = createGoodsTable;
	return ret_obj;
}

if(typeof module != "undefined"){
		module.exports = wrapper();
}