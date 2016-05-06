var exec = require("child_process").exec;
var path = require("path");

var dbm = require("./js/db.js");

// globals
global.goodsArr = [];
global.goodsSum = 0.00;

global.orderStatus = 0;

var O_WAIT = 0;
var O_CONFIRM = 1;
var O_CHECKING = 2;
var O_FINISHED = 9;

// goods saved in localStorage
var goods = {
  barcode:"",
  name:"",
  price:""
}

// TODO list
// 结账打印
// 根据条码网上查询
// 导出导入数据 localStorage  almost done!



// onsubmit event
var barcode = document.getElementById("barcode");
var goods_list = document.getElementById("goods_list");
var dialog = document.getElementById("dialog");
var settle_btn = document.getElementById("settle_btn");

// init
window.onload = init;



function init(){
  settle_btn.onclick = function(){
    doSettle();
  }

  barcode.onkeypress = function(){
    if(event.keyCode!=13){ return; }

    var bcode = barcode.value.trim();
    if(!bcode){
      return;
    }

    if(global.orderStatus == O_FINISHED){

      // clear global.goodsArr;
      global.goodsArr = [];
      global.goodsSum = 0.00;
      clearUI();
      dialog.style.display = "none";
      global.orderStatus = O_WAIT;
    }


    var result = localStorage.getItem(bcode+"");
    var r;
    if(result){
      r = JSON.parse(result);
      addGoods(r);
    }else {
      // add new goods.
      saveNewGoods(bcode);
    }

  }

  // onpress F5 to check out.
  document.body.onkeydown = function(){
      if( event.keyCode != 116 || global.goodsArr.length == 0 ){
      return;
    }
    doSettle();
  }
}


// Query barcode info
function query(barcode,cb){
  console.log("start query barcode from internet..");

  var ajax = require('./js/ajax.js').ajax;
  var urlStr = "http://www.liantu.com/tiaoma/query.php?ean=";
  urlStr += barcode;
  ajax(urlStr,"GET",function(err,xmlhttp){
    if(err){
      console.log(err);
      cb(err)
      return;
    }
    // console.log(xmlhttp.responseText);
    var info = xmlhttp.responseText;
    if(info){
      console.log(info);
      cb(null,info);
    }else {
      console.log("没有查到条码信息");
      cb("nothing");
    }
  });
}


function doSettle(){
  // global.orderStatus += 1;
  if(global.orderStatus == 0){
    // show dialog
    showSettleDlg();
  }else if(global.orderStatus == 1) {
    // check out
    checkout();
  }else {
    // ignore
  }
}

function getOrderData(){
// prepare order data.
  var order = {};
  var gs = global.goodsArr;
  for(var i=0;i<global.goodsArr.length; i++){
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
  str += "消费" + goodsArr.length + "项, 合计:" + global.goodsSum + "元" + '\n';
  str += bSep;
  str += "销售时间:" + (new Date()).toLocaleString() + '\n';
  str += "谢谢惠顾 --翡翠芳龄超市";

  return str;
}

// show settle dialog
function showSettleDlg(){
  global.orderStatus = O_CONFIRM;

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
    global.orderStatus = O_WAIT;
  }
  submitBtn.onclick = function(){
    checkout();
  }
}

// 清除界面
function clearUI(){
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
  updateUi();
}

// printer and finish order.
function checkout(){
  global.orderStatus = O_CHECKING;
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



  // clear global.goodsArr;
  // global.goodsArr = [];
  // global.goodsSum = 0.00;
  // clearUI();
  // dialog.style.display = "none";
  global.orderStatus = O_FINISHED;
}



// add goods to order
function addGoods(item){

  item.count = 1;
  global.goodsArr.push(item);
  global.goodsSum =  Math.round(( global.goodsSum + item.count * item.price ) * 100) / 100;

  updateUi(item);
}

// update goods to UI
function updateUi(item){
  if(item){
    var e = document.createElement("tr");

    var no = global.goodsArr.length;
    var str = "<td>" + no + "</td>";
    str += "<td>" + item.barcode + "</td>";
    str += "<td>" + item.name + "</td>";
    str += "<td>" + item.price + "</td>";
    str += "<td>" + item.count + "</td>";
    str += "<td>" + item.price * item.count + "</td>";

    e.innerHTML = str;
    goods_list.appendChild(e);
  }

  var sum = document.getElementById("sum");
  sum.innerHTML = global.goodsSum;
}

// set and save new goods to localStorage
// test :　6901028129657
// ean
// :
// "6901028129657"
// fac_name
// :
// "湖南中烟工业有限责任公司"
// faccode
// :
// "6901028"
// guobie
// :
// "中国"
// name
// :
// ""
// price
// :
// 15
// sort_id
// :
// 7
// supplier
// :
// "湖南中烟工业有限责任公司"
// titleSrc
// :
// "http://www.liantu.com/tiaoma/eantitle.php?title=WitqTGNuVVYvNE5HeTE3RHArTHFWQT09"




function saveNewGoods(barcode){
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
