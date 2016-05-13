## Test data

6908512108211

6908512109218

6908512108426


## New workaround

- 使用 nw.js 单纯作为 UI。node 运行在原生 node.exe 中。
- 两者使用 websocket 通信。

## 开发环境
- nw.js 	0.8.6 (体积小)
- node 		4.4.4


// install sqlite3 for nw.js
npm install sqlite3 --build-from-source --runtime=node-webkit --target_arch=ia32 --target="0.14.2"

## TODO LIST
- win32 后台启动 node (或者直接使用 node.exe + 运行参数)

- check process 检查 node webkit 运行状态。如果退出则跟着退出。


// 查找进程信息	
wmic process get name,executablepath,processid|findstr pid






// launcher
	WinExec("\"C:\\Users\\wayne lu\\Desktop\\pos\\node_app\\node.exe\" \"C:\\Users\\wayne lu\\Desktop\\pos\\node_app\\main.js\"", SW_HIDE);
	return 0;