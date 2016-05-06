var wsClient = {};
wsClient.connectWs = function(onOpen){
	var url = "ws://localhost:" + localParams.localWsPort;
	var wsLocal = new WebSocket(url);
	wsClient.client = wsLocal;
	wsLocal.onopen = function(evt) {
		console.log("[onopen] ");
		onOpen();
	}

	wsLocal.onmessage = function(evt) {
		console.log('[onmessage] ' + evt.data);
		if (evt.data.match(/^emit:/)) {
			// Local Node call window.socket.emit('message', data)                                                
			window.socket.emit('message', evt.data.replace(/^emit:/, ''));
		} else {
			// Local Node call window.handleGetIceData
			console.log('---------1')
			handleNodeMsg(evt.data);
		}
	}

	// handle message from node ws server.
	function handleNodeMsg(m){
		if (typeof m == "string") {
			try{
				m = JSON.parse(m);
			}catch(e){
				console.log('JSON parse error:',e);
			}
		}
		switch(m.act){
			case 'test':

				break;
			default:
				break;
		}
	}

}





