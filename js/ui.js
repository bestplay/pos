var ui = {};


ui.goodsArr = [];
ui.goodsSum = 0.00;

ui.orderStatus = 0;
ui.url = 'http://localhost:' + localParams.localWsPort;


ui.init = function(){
	var waitMask = document.getElementById('fullMask');
	var bc_input = document.getElementById("barcode");

	var O_WAIT = 0;
	var O_CONFIRM = 1;
	var O_CHECKING = 2;
	var O_FINISHED = 9;

	var barcode = document.getElementById("barcode");
	var goods_list = document.getElementById("goods_list");
	var dialog = document.getElementById("dialog");
	var settle_btn = document.getElementById("settle_btn");
	var sum = document.getElementById("sum");


	// forcus input panel when inited.
	bc_input.focus();

	settle_btn.onclick = function(){
		onClickSettle();
	}

	barcode.onkeypress = function(){
		if(event.keyCode!=13){ return; }
		onBcClickEnter();
	}

	// onpress F5 to check out.
	document.body.onkeydown = function(){
			if( event.keyCode != 116 || ui.goodsArr.length == 0 ){
			return;
		}
		onClickSettle();
	}

	// click ENTER at barcode input panel.
	function onBcClickEnter(){
		var bcode = barcode.value.trim();
		if(!bcode){
			return;
		}

		if(ui.orderStatus == O_FINISHED){

			// clear ui.goodsArr;
			ui.goodsArr = [];
			ui.goodsSum = 0.00;
			initCartUI();
			dialog.style.display = "none";
			ui.orderStatus = O_WAIT;
		}

		// TODO query barcode from DB 
		var url = ui.url + '?act=getGoods&bcode=' + bcode;
		ajax(url,'get',function(e,result){
			var r;
			if(result){
				r = JSON.parse(result);
				addGoodsToCart(r);
			}else {
				// add new goods.
				saveNewGoodsToDB(bcode);
			}
		})
	}

	// click settle button.
	function onClickSettle(){
		// ui.orderStatus += 1;
		if(ui.orderStatus == 0){
			// show dialog
			showSettleDlg();
		}else if(ui.orderStatus == 1) {
			// check out
			confirmSettle();
		}else {
			// ignore
		}
	}
	// show settle dialog
	function showSettleDlg(){
		ui.orderStatus = O_CONFIRM;

		console.log('showSettleDlg');
		var str = "";
		str += '<p>';
		str += ''
		str += '</p>';


		str += '<p>';
		str += '<input autocomplete="off" id="dialog_submit" type="button" value="打印结账" />';
		str += '<input autocomplete="off" id="dialog_cancle" type="button" value="取消" />';
		str += '</p>';
		dialog.innerHTML = str;
		dialog.style.display = "block";


		var submitBtn = document.getElementById("dialog_submit");
		var cancleBtn = document.getElementById("dialog_cancle");
		cancleBtn.onclick = function(){
			dialog.style.display = "none";
			// set orderStatus back to last status.
			ui.orderStatus = O_WAIT;
		}
		submitBtn.onclick = function(){
			confirmSettle();
		}
	}

	// comfirmSettle printer and finish order.
	function confirmSettle(){
		ui.orderStatus = O_CHECKING;
		var dataArr = getOrderData();
		var pStr = formatPrint(dataArr);
		console.log(pStr);


		// print..

		var cmdStr = path.join("tools","printer");
		cmdStr += ' -t "'+ pStr +'"';
		exec(cmdStr,function(err,stdout,stderr){
			console.log(err);
			console.log(stdout);
		});



		// clear ui.goodsArr;
		// ui.goodsArr = [];
		// ui.goodsSum = 0.00;
		// initCartUI();
		// dialog.style.display = "none";
		ui.orderStatus = O_FINISHED;
	}




	// init cart panel UI
	function initCartUI(){
		var str = "";

		str += '<tr>';
				str += '<th style="width:5%">序号</th>';
				str += '<th style="width:25%">商品编号</th>';
				str += '<th style="width:30%">商品名称</th>';
				str += '<th style="width:12%">单价</th>';
				str += '<th style="width:10%">数量</th>';
				str += '<th style="width:18%">金额</th>';
		str += '</tr>';
		goods_list.innerHTML = str;

		sum.innerHTML = ui.goodsSum = 0;
	}

	// add goods to order
	function addGoodsToCart(item){

		item.count = 1;
		ui.goodsArr.push(item);
		ui.goodsSum =  Math.round(( ui.goodsSum + item.count * item.price ) * 100) / 100;


		var e = document.createElement("tr");

		var no = ui.goodsArr.length;
		var str = "<td>" + no + "</td>";
		str += "<td>" + item.barcode + "</td>";
		str += "<td>" + item.name + "</td>";
		str += "<td>" + item.price + "</td>";
		str += "<td>" + item.count + "</td>";
		str += "<td>" + item.price * item.count + "</td>";

		e.innerHTML = str;
		goods_list.appendChild(e);
		sum.innerHTML = ui.goodsSum;
	}

	function saveNewGoodsToDB(barcode){
		query(barcode,function(err,info){
			if(err){
				console.log(err);
				return;
			}
			var i;
			try{
				i = JSON.parse(info);
			}catch(e){
				return;
			}
			if(i && i.price){

			}
			if(i && i.titleSrc){
				var fs = require("fs");
				var http = require("http");
				var path = require("path");
				var picPath = path.join('.','tmp','barcod_name.png');
				console.log(i.titleSrc);
				http.get(i.titleSrc, function(res){
					var d = "";
					res.setEncoding("binary")
					res.on("data",function(chunk){
						console.log(chunk.length);
						d += chunk;
					})
					res.on("end",function(){
						console.log(picPath);
						try {
							fs.writeFileSync(picPath, d, "binary");

						} catch (e) {
							console.log(e);
							return;
						} finally {

						}
						// use ocr
						var tesseractPath = path.join("tools","Tesseract","tesseract");
						var txtPath = path.join('tmp','barcode_name');
						var cmdStr = tesseractPath + ' "' + picPath + '" "' + txtPath + '" -l chi_sim -psm 6';
						exec(cmdStr,function(err,stdout,stderr){
							if(err){
								console.log(err);
								return;
							}
							try {
								var name = fs.readFileSync(txtPath + '.txt');
							} catch (e) {
								console.log(e);
								return;
							} finally {

							}

							var nameEle = document.getElementById('dialog_name');
							var price2Ele = document.getElementById('dialog_price2');
							nameEle.value = name;
							price2Ele.innerHTML = i.price;


						});
					})
				});
			}

		});
		var dialog = document.getElementById("dialog");

		var str = '<div style=>';
		str += '<p>';
		str += '条形码：<span  id="dialog_barcode">' + barcode + '</span>';
		str += '</p>';
		str += '<p>';
		str += '商品名称：<input autocomplete="off" id="dialog_name" type="text" />';
		str += '</p>';
		str += '<p>';
		str += '商品价格：<input autocomplete="off" id="dialog_price" type="number" /> 元';
		str += '</p>';
		str += '<p>';
		str += '参考价格：<span id="dialog_price2"></span>元';
		str += '</p>';
		str += '<p>';
		str += '<input autocomplete="off" id="dialog_submit" type="button" value="保存" />';
		str += '<input autocomplete="off" id="dialog_cancle" type="button" value="取消" />';
		str += '</p>';

		str += '<p>';
		str += '<span id="dialog_tips" style="visibility:hidden;color:red;">[商品名称]或者[商品价格]未填写</span>';
		str += '</p>';

		str += '</div>';

		dialog.innerHTML = str;
		dialog.style.display = "block";

		// todo query goods from internet.



		var submitBtn = document.getElementById("dialog_submit");
		var cancleBtn = document.getElementById("dialog_cancle");
		cancleBtn.onclick = function(){
			dialog.style.display = "none";
			// todo abort all requests.
		}
		submitBtn.onclick = function(){
			// check input
			var dialog_barcode = document.getElementById("dialog_barcode");
			var dialog_name = document.getElementById("dialog_name");
			var dialog_price = document.getElementById("dialog_price");
			var dialog_tips = document.getElementById("dialog_tips");

			if(!dialog_price.value || !dialog_name.value){
				dialog_tips.style.visibility = "visible";
			}else {

				var item = {};
				item.barcode = dialog_barcode.innerHTML;
				item.name = dialog_name.value;
				item.price = dialog_price.value;

				console.log(item);

				localStorage.setItem(item.barcode,JSON.stringify(item));

				dialog.style.display = "none";
			}
		}
	}

}
