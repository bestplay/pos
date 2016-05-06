// init node app

window.onload = function(){
	// 1 connect to node ws server.
	// 2 init UI

	wsClient.connectWs(function onOpen(){
		// use wsClient.client to send msg
		// show UI
		ui.init();
	});
};