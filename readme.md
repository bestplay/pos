## New workaround

- 使用 nw.js 单纯作为 UI。node 运行在原生 node.exe 中。
- 两者使用 websocket 通信。

## 开发环境
- nw.js 	0.8.6 (体积小)
- node 		4.4.4


// install sqlite3 for nw.js
npm install sqlite3 --build-from-source --runtime=node-webkit --target_arch=ia32 --target="0.14.2"