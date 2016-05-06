var cluster = require('cluster');
// var os = require('os');
var main = require('./main.js');

// (function init(){
//     process.on("uncaughtException", function(e){ 
//         console.error(e); 
//     });

// })();

if (cluster.isMaster){
  // for (var i = 0, n = os.cpus().length; i < n; i += 1)
    cluster.fork();
    // cluster.on('exit', function(worker, code, signal) {
    // 	console.log(code,signal);
    //     console.log('worker ' + worker.process.pid + ' died');
    //     if(code !== 0){
    //     	process.nextTick(function(){ cluster.fork(); });
    //     }
    // });
}
else{
  main();
}