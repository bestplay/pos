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
	var dlg_cnt = document.getElementById("dialog_content");
	var settle_btn = document.getElementById("settle_btn");
	var sum = document.getElementById("sum");
	var bottom_panel = document.getElementById("bottom_panel");


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

 
	function getOrderData(){
		// prepare order data.
		var order = {};
		var gs = ui.goodsArr;
		for(var i=0;i<ui.goodsArr.length; i++){
			var ikey = gs[i].barcode;
			var ival = gs[i];
			if(order[ikey]){
				order[ikey].count = order[ikey].count + ival.count;
			}else {
				order[ikey] = ival;
			}
		}

		// save into an Array
		var nArr = Object.getOwnPropertyNames(order);
		var dataArr = [];
		for (var i = 0; i < nArr.length; i++) {
			dataArr.push(order[nArr[i]]);
		}

		return dataArr;
	}

	function formatPrint(goodsArr){
		var bSep = "================================" + "\n";
		var lSep = "--------------------------------" + "\n";
		var str = bSep;
		str += "商品名称/价格/数量/金额" + "\n";
		str += lSep;
		var it;
		for (var i = 0; i < goodsArr.length; i++) {
			it = goodsArr[i];
			str += it.name + ' /' + it.price + '/' + it.count + '/'  + it.count * it.price + '\n';
			str += lSep;
		}
		str += "消费" + goodsArr.length + "项, 合计:" + ui.goodsSum + "元" + '\n';
		str += bSep;
		str += "销售时间:" + (new Date()).toLocaleString() + '\n';
		str += "谢谢惠顾 --翡翠芳龄超市";

		return str;
	}





	function switchMask(f){
		var mask = "none";
		var btmPanel = "visible";
		if(f){
			btmPanel = 'hidden';
			mask = "block";
		}
		waitMask.style.display = mask;
		bottom_panel.style.visibility = btmPanel;
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
			di
			ui.orderStatus = O_WAIT;
		}

		var url = ui.url;
		var data = {act:"getGoods",bcode:bcode};
		ajax(url,'post',data,function(result){
			var r = JSON.parse(result);
			if(r){
				if(r.price){
					addGoodsToCart(r);
				}else{
					// TODO set price..
					alterGoodsDlg(r);
				}
			}else {
				// add new goods.
				getGoodsInfoFromInternet(bcode);
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

		initDlg(400,300);
		console.log('showSettleDlg');
		var str = "";
		str += '<p>';
		str += ''
		str += '</p>';


		str += '<p>';
		str += '<input autocomplete="off" id="dialog_submit" type="button" value="打印结账" />';
		str += '<input autocomplete="off" id="dialog_cancle" type="button" value="取消" />';
		str += '</p>';
		dlg_cnt.innerHTML = str;
		dialog.style.display = "block";


		var submitBtn = document.getElementById("dialog_submit");
		var cancleBtn = document.getElementById("dialog_cancle");
		cancleBtn.onclick = function(){
			dlg_cnt.innerHTML = "";
			dialog.style.display = "none";
			// set orderStatus back to last status.
			ui.orderStatus = O_WAIT;
		}
		submitBtn.onclick = function(){
			confirmSettle();
		}
	}

	// comfirmSettle printer and finish order.
	function confirmSettle(cb){
		ui.orderStatus = O_CHECKING;
		var dataArr = getOrderData();
		var pStr = formatPrint(dataArr);
		console.log(pStr);


		// TODO print..

		var data = { act:"print",info:pStr };
		ajax(ui.url,'post',data,function(r){
			console.log(r);
			cb();
		})


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
		str += "<td>" + item.bcode + "</td>";
		str += "<td>" + item.name + "</td>";
		str += "<td>" + (item.price || "") + "</td>";
		str += "<td>" + item.count + "</td>";
		str += "<td>" + item.price * item.count + "</td>";

		e.innerHTML = str;
		goods_list.appendChild(e);
		sum.innerHTML = ui.goodsSum;
	}

	function getGoodsInfoFromInternet(bcode){
		// alter goods dialog 
		alterGoodsDlg({ bcode: bcode });


		var web_search = document.getElementById("web_search");
		var nameEl = document.getElementById("dialog_name");

		var url = "https://www.baidu.com/s?wd=" + bcode;
		ajax(url,'get','',function(r){
			if(!r){
				console.log(bcode," search result is null");
				return;
			}
			var el = document.createElement( 'html' ); 
			el.innerHTML = r;

			var content = el.getElementsByClassName("c-container");

			// console.log(content[0]);

			// first <a> 			inner
			// class c-abstract 	inner
			// delet <em>

			console.log('length:  ',content.length);


			var newEl = document.createElement('textarea');
			newEl.style.color = "#000";
			newEl.style.width = "100%";
			newEl.style.height = "100%";
			newEl.style.fontSize = "20px";
			newEl.style.fontWeight = "bold";
			newEl.style.padding = "10px 10px 20px 10px";
			newEl.style.overflowY = "scroll";
			newEl.style.overflowX = "hidden";
			newEl.style.resize = "none";

			newEl.id = "searchInfo";
			// newEl.style.display = "none";

			var c_str = "";
			for(var i=0; i<content.length; i++){
				console.log('----------------',i);
				var e = content[i];

				var t = e.getElementsByTagName("a")[0].innerHTML;
				var c = e.getElementsByClassName("c-abstract")[0].innerHTML;
				t = t.replace(/<em>[^<]*<\/em>/,"    ");
				c = c.replace(/<em>[^<]*<\/em>/,"    ");
				c_str += ( t + '\n\n' + c + '\n\n' );
			}

			newEl.innerHTML = c_str;
			newEl.onselect = function(){
				var s = window.getSelection().toString();
				nameEl.value = s.trim();
			};

			web_search.appendChild(newEl);
		});
	}

	// update or insert to DB.
	function saveGoodsInfoToDB(goods,callback){
		// TODO
		var data = { act: "saveGoods", goods:goods };

		ajax(ui.url,'post',data,function(r){
			console.log(r);
			callback();
		})
	}

	function initDlg(width,height){
		dlg_cnt.style.width = width + "px";
		dlg_cnt.style.height = height + "px";
		dlg_cnt.style.left = "-"+ (width/2) +"px";
		dlg_cnt.style.top = "-"+ (height/2) +"px";
		dialog.style.display = "block";
	};

	function alterGoodsDlg(goods){
		switchMask(true);
		initDlg(600,400);
		function freezeInput(v){
			var r = v ? ' value="'+v+'" disabled="disabled" ' : '';
			return r;
		}

		var str = '<div style="width:300px;display:inline-block">';
		str += '<p>';
		str += '条形码：<span  id="dialog_barcode">' + goods.bcode + '</span>';
		str += '</p>';
		str += '<p>';
		str += '商品名称：<input autocomplete="off" id="dialog_name" type="text"'+freezeInput(goods.name)+'/>';
		str += '</p>';
		str += '<p>';
		str += '商品价格：<input autocomplete="off" id="dialog_price" type="number"'+freezeInput(goods.price)+'/> 元';
		str += '</p>';
		str += '<p>';
		str += '参考价格：<span id="dialog_price2">'+(goods.other_price||"")+'</span>元';
		str += '</p>';
		str += '<p>';
		str += '<input autocomplete="off" id="dialog_submit" type="button" value="保存" />';
		str += '<input autocomplete="off" id="dialog_cancle" type="button" value="取消" />';
		str += '</p>';

		str += '<p>';
		str += '<span id="dialog_tips" style="visibility:hidden;color:red;">[商品名称]或者[商品价格]填写错误</span>';
		str += '</p>';

		str += '</div>';

		dlg_cnt.innerHTML = str;

		var webSearch = document.createElement("div");
		webSearch.id = "web_search";
		webSearch.style.width = "300px";
		webSearch.style.height = "400px";
		webSearch.style.display = "inline-block";

		dlg_cnt.appendChild(webSearch);

		// todo query goods from internet.

		var submitBtn = document.getElementById("dialog_submit");
		var cancleBtn = document.getElementById("dialog_cancle");

		var dialog_barcode = document.getElementById("dialog_barcode");
		var dialog_name = document.getElementById("dialog_name");
		var dialog_price = document.getElementById("dialog_price");
		var dialog_tips = document.getElementById("dialog_tips");
		cancleBtn.onclick = function(){
			dlg_cnt.innerHTML = "";
			dialog.style.display = "none";
			// submitBtn.disabled = false;
			switchMask(false);
			// todo abort all requests.
		}
		submitBtn.onclick = function(){
			// check input
			submitBtn.disabled = true;

			if(!dialog_price.value || !dialog_name.value){
				dialog_tips.style.visibility = "visible";
				submitBtn.disabled = false;

			}else {

				goods.name = dialog_name.value;
				goods.price = dialog_price.value;

				console.log(goods);
				// TODO save goods to DB
				saveGoodsInfoToDB(goods,function(){
					dlg_cnt.innerHTML = "";
					dialog.style.display = "none";
					switchMask(false);
				});
			}
		}
	}

}
