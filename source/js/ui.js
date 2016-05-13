var ui = {};


ui.goodsArr = [];
ui.goodsSum = 0.00;

ui.orderStatus = 0;
ui.url = 'http://localhost:' + config.localWsPort;


ui.init = function(){
	var waitMask = document.getElementById('fullMask');

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
	var modify_goods = document.getElementById("modify_goods");


	// forcus input panel when inited.
	barcode.focus();

	settle_btn.onclick = function(){
		onClickSettle();
	}

	modify_goods.onclick = function(){
		modifyGoodsDlg();
	}

	barcode.onkeypress = function(){
		if(event.keyCode!=13){ return; }
		onBcClickEnter();
	}

	document.body.onkeydown = function(){
		// onpress F5 to check out.
		if( event.keyCode == 116 ){
			onClickSettle();
		// press DELETE to remove
		}else if( event.keyCode == 46 ){
			// freeze order changing while showing masks.
			if(waitMask.style.display != "none"){
				return;
			}
			removeLastGoods();
		}
		
	}

	// TODO 
	function modifyGoodsDlg(){
		var str = '';
		str += '<div style="height:50px;">';
		str += '<input id="search_text" style="width:380px;line-height:24px;" type="text" />'
		str += '<input id="search_btn" type="button" value="查  找" />'
		str += '</div>';
		str += '<div id="search_result" style="height:310px;overflow-y:scroll;overflow-x:hidden;">';
		str += '查找结果显示在这里';
		str += '</div>'

		str += '<div style="height:50px;text-align:center;">';
		str += '<input id="cancleBtn" type="button" value="   取  消   " />'
		str += '</div>'
		dlg_cnt.innerHTML = str;

		var search_text = document.getElementById('search_text');
		var search_btn = document.getElementById('search_btn');
		var search_result = document.getElementById('search_result');
		var cancleBtn = document.getElementById('cancleBtn');

		search_result.onclick = function(e){
			var t = e.target.parentNode;
			if( t.className == "search_r_item"){
				console.log(t);
				var goods = JSON.parse(t.getElementsByTagName('div')[0].innerHTML.trim());

				// 修改商品
				alterGoodsDlg(goods,true);
			}
		}

		// do search 
		search_btn.onclick = function(){
			var key = search_text.value.trim();
			var data = {act:"searchGoods",key:key};
			var result;
			ajax(ui.url,'post',data,function(result){
				var r = JSON.parse(result).res;
				if(r && r.length > 0){
					console.log(r);
					showResult(r);
				}else {
					result = "没有搜索到商品。"
				}
			})
		}
		// show search result
		function showResult(r){
			var str = "";
			for(var i=0; i<r.length; i++){
				// r[i].specifi
				// r[i].unit
				// r[i].cost

				// r[i].name
				// r[i].bcode
				// r[i].price

				str += '<div class="search_r_item">';
				str += '<span style="width:79%;border-right: 1px solid #fff;">' + (r[i].name || '') + '</span>';
				str += '<span style="width:19%;">' + (r[i].price || '') + '</span>';
				str += '<div style="display:none;">' + JSON.stringify(r[i]) + '</div>';
				str += '</div>';
			}
			search_result.innerHTML = str;
		}

		// close dialog
		cancleBtn.onclick = function(){
			hideDialog();
		}

		initDlg(500,400);
		search_text.focus();
	}

	function hideDialog(){
		dialog.style.display = "none";
		dlg_cnt.innerHTML = "";
		switchMask(false);
	}
 
	function getOrderData(){
		// prepare order data.
		var order = {};
		var gs = ui.goodsArr;
		for(var i=0;i<ui.goodsArr.length; i++){
			var ikey = gs[i].bcode;
			var ival = gs[i];
			if(order[ikey]){
				order[ikey].count = order[ikey].count + ival.count;
			}else {
				order[ikey] = {};
				order[ikey].count = ival.count;
				order[ikey].name = ival.name;
				order[ikey].price = ival.price;
			}
		}

		// save into an Array
		var nArr = Object.getOwnPropertyNames(order);
		var dataArr = [];
		for (var i = 0; i < nArr.length; i++) {
			dataArr.push(order[nArr[i]]);
		}
		console.log(dataArr);
		return dataArr;
	}

	function formatPrint(goodsArr){
		var bSep = "================================" + "\n";
		var lSep = "--------------------------------" + "\n";
		var str = "";
		str += "欢迎光临 "+ config.shopName +"\n";
		str += bSep;
		str += "商品名称/价格/数量/金额" + "\n";
		str += lSep;
		var it;
		var count = 0;
		for (var i = 0; i < goodsArr.length; i++) {
			it = goodsArr[i];
			str += it.name + ' /' + it.price + '/' + it.count + '/'  + it.count * it.price + '\n';
			str += lSep;
			count += it.count;
		}
		str += "消费" + goodsArr.length + "类("+count+"件), 合计:" + ui.goodsSum + "元" + '\n';
		str += bSep;
		str += "销售时间:" + (new Date()).toLocaleString();

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

		// fouse barcode input when close dialogs.
		if(!f){
			barcode.focus();
			barcode.select();
		}
	}

	// click ENTER at barcode input panel.
	function onBcClickEnter(){
		var bcode = barcode.value.trim();
		barcode.select();
		if(!bcode){
			return;
		}

		if(ui.orderStatus == O_FINISHED){
			// clear ui.goodsArr;
			ui.goodsArr = [];
			ui.goodsSum = 0.00;
			initCartUI();
			hideDialog();
			
			ui.orderStatus = O_WAIT;
		}
		if( !Number(bcode) || bcode.toString().indexOf('.') != -1 ){
			console.log("Barcode type error!");
			var tips_str = ' @@-> 请检查编码?!';
			var pos = barcode.value.indexOf(tips_str);
			if(pos != -1){
				barcode.value = barcode.value.slice(0,pos) + tips_str;
			}else{
				barcode.value += tips_str;
			}
			barcode.select();
			return;
		}

		var url = ui.url;
		var data = {act:"getGoods",bcode:bcode};
		ajax(url,'post',data,function(result){
			var r = JSON.parse(result);
			if(r){
				if(r.price){
					addGoodsToCart(r);
				}else{
					// set price..
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
		if( ui.goodsArr.length == 0 ){
			console.log("There is no goods.")
			return;
		}
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
		var width = 400;
		var height = 300;
		ui.orderStatus = O_CONFIRM;


		var orderDataArr = getOrderData();
		var pStr = formatPrint(orderDataArr);
		var preStr = pStr.replace(/\n/g,'<br>');

		console.log('showSettleDlg');
		var str = "";
		str += '<p style="height:'+(height-50)+'px;overflow-x:hidden;overflow-y:scroll;">';
		str += preStr;
		str += '<input id="print_string" value="'+preStr+'" style="display:none" />';
		str += '</p>';


		str += '<p>';
		str += '<input autocomplete="off" id="dialog_submit" type="button" value="打印结账" />'; 	// TODO 第二次变为 “重新打印”
		str += '<input autocomplete="off" id="dialog_cancle" type="button" value="取消" />';
		str += '</p>';
		dlg_cnt.innerHTML = str;
		initDlg(width,height);


		var submitBtn = document.getElementById("dialog_submit");
		var cancleBtn = document.getElementById("dialog_cancle");
		cancleBtn.onclick = function(){
			hideDialog();			
			// set orderStatus back to last status.
			ui.orderStatus = O_WAIT;
		}
		submitBtn.onclick = function(){
			confirmSettle();
		}
	}

	// comfirmSettle printer and finish order.
	function confirmSettle(){
		var printStr = document.getElementById('print_string').value;
		ui.orderStatus = O_CHECKING;
		console.log(printStr);

		// TODO print..
		var data = { act:"print",info:printStr };

		var submitBtn = document.getElementById("dialog_submit");
		var cancleBtn = document.getElementById("dialog_cancle");
		submitBtn.value = "重新打印";
		cancleBtn.value = "关闭对话";
		ajax(ui.url,'post',data,function(r){
			console.log(r);
			bottom_panel.style.visibility = 'visible';
			barcode.value = '';
			barcode.focus();
		})


		// clear ui.goodsArr;
		ui.goodsArr = [];
		ui.goodsSum = 0.00;
		initCartUI();
		// hideDialog();
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

		if(ui.goodsSum.toString().length >= 8){
			alert("总价真的这么多？再检查下！");
		}
	}
	// remove last goods from cart
	function removeLastGoods(){
		if(ui.goodsArr.length == 0){
			return;
		}
		var it = ui.goodsArr.pop();
		if(ui.goodsSum == 0){
			alert("程序有错。总价已经为零！！！");
			return;
		}
		ui.goodsSum = Math.round(( ui.goodsSum - it.count * it.price ) * 100 ) / 100;

		sum.innerHTML = ui.goodsSum;
		// TODO remove last <tr> element from  goods_list
		var els = goods_list.getElementsByTagName('tr');
		var el = els[els.length-1];
		el.parentNode.removeChild(el);
	}

	function getGoodsInfoFromInternet(bcode){
		// alter goods dialog 
		alterGoodsDlg({ bcode: bcode });


		var web_search = document.getElementById("web_search");
		var nameEl = document.getElementById("dialog_name");

		var url = "https://www.baidu.com/s?wd=" + bcode;
		ajax(url,'get','',function(r){


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

			try{
				var el = document.createElement( 'html' ); 
				el.innerHTML = r;

				var content = el.getElementsByClassName("c-container");

				// console.log(content[0]);

				// first <a> 			inner
				// class c-abstract 	inner
				// delet <em>

				console.log('length:  ',content.length);

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

			}catch(e){
				newEl.innerHTML = '';
			}

			newEl.onselect = function(){
				var s = window.getSelection().toString();
				nameEl.value = s.trim();
			};

			web_search.appendChild(newEl);

			if(!r || !newEl.innerHTML.trim()){
				console.log(bcode," search result is null");
				newEl.innerHTML = "没有搜索到参考数据。"
				return;
			}
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
		switchMask(true);
		dlg_cnt.style.width = width + "px";
		dlg_cnt.style.height = height + "px";
		dlg_cnt.style.left = "-"+ (width/2) +"px";
		dlg_cnt.style.top = "-"+ (height/2) +"px";
		dialog.style.display = "block";
	};

	function alterGoodsDlg(goods,enable){
		function freezeInput(v){
			var attr_string = 'disabled="disabled" '
			if(enable){
				attr_string = '';
			}
			var r = v ? ' value="'+v+'" ' + attr_string : '';
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
		str += '<div>';
		str += '<input autocomplete="off" id="dialog_submit" type="button" value="保存" />';
		str += '<input autocomplete="off" id="dialog_cancle" type="button" value="取消" />';
		str += '</div>';

		str += '<p>';
		str += '<span id="dialog_tips" style="visibility:hidden;color:red;">[商品名称]或者[商品价格]填写错误</span>';
		str += '</p>';

		str += '</div>';

		dlg_cnt.innerHTML = str;
		initDlg(600,400);

		var webSearch = document.createElement("div");
		webSearch.id = "web_search";
		webSearch.style.width = "300px";
		webSearch.style.height = "400px";
		webSearch.style.display = "inline-block";

		dlg_cnt.appendChild(webSearch);

		// query goods from internet.

		var submitBtn = document.getElementById("dialog_submit");
		var cancleBtn = document.getElementById("dialog_cancle");

		var dialog_barcode = document.getElementById("dialog_barcode");
		var dialog_name = document.getElementById("dialog_name");
		var dialog_price = document.getElementById("dialog_price");
		var dialog_tips = document.getElementById("dialog_tips");
		cancleBtn.onclick = function(){
			hideDialog();
			// submitBtn.disabled = false;
			
			// todo abort all requests.
		}
		submitBtn.onclick = function(){
			// check input
			submitBtn.disabled = true;

			// check values
			if(!dialog_price.value || !dialog_name.value || !Number(dialog_price.value) || (dialog_price.value + '.').split('.')[1].length > 2 ){
				dialog_tips.style.visibility = "visible";
				submitBtn.disabled = false;
			}else {

				goods.name = dialog_name.value.trim();
				goods.price = dialog_price.value.trim();

				console.log(goods);
				// save goods to DB
				saveGoodsInfoToDB(goods,function(){
					hideDialog();
				});
			}
		}
	}

}
