var fs = require("fs");

function exportData(){
	for(var i=0; ;i++){
		var getKey = localStorage.key(i);
		if(!getKey){
			return;
		}
		var value = localStorage.getItem(getKey);

		try {
			fs.appendFileSync("goodsData",value + '\n');
		} catch (e) {
			console.log(e);
			alert("文件操作失败");
			return;
		}
	}
}

function importData(file){
	var d;
	try {
		d = fs.readFileSync(file);
	} catch (e) {
		console.log(e);
		alert("文件操作失败");
		return;
	}
	var arr = d.trim().split('\n');
	var dataArr = [];

	// read data file
	for(var i=0; i<arr.length; i++){
		var it;
		try{
			it = JSON.parse(arr[i]);
		}catch(e){
			console.log(e);
			alert("Parsing file Error! Please check data file retry.");
			return;
		}
		dataArr.push(it);
	}

	// set data to localStorage
	for(var i=0; i<dataArr.length; i++){
		localStorage.setItem(dataArr[i].barcode, JSON.stringify(dataArr[i]));
	}
	alert("导入成功！共导入 " + dataArr.length + " 条数据。");
}

exports.export = exportData;
exports.import = importData;
