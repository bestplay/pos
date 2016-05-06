var wrapper = function(){
	var sqlite3 = require('sqlite3').verbose();
	var db = new sqlite3.Database('test.sqlite3');


	function isTableExsit(tName){
		var sql = "SELECT COUNT(*) FROM sqlite_master where type='table' and name='lorem'";

		console.log('1112323');
		db.all(sql,function(err,res){
			global.console.log("-----");
			global.console.log(err);
			global.console.log(res);
			global.console.log("-----");
			db.close();
		});
	}


	console.log("ttttttttttttt...");
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

	var ret_obj = {};
	ret_obj.isTableExsit = isTableExsit;
	ret_obj.db = db;
	ret_obj.test_sql = test_sql;
	return ret_obj;
}

if(typeof module != "undefined"){
		module.exports = wrapper();
}