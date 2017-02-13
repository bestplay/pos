(function(){

  console.log("-----------1")
  process.on('uncaughtException', function (err) {
    console.log(err);
  });

  setTimeout(function(){
    var gui = window.require('nw.gui');
    var option = {
      key : "Ctrl+1",
      active : function() {
        global.console.log("Global desktop keyboard shortcut: " + this.key + " active."); 
      },
      failed : function(msg) {
        // :(, fail to register the |key| or couldn't parse the |key|.
        global.console.log(msg);
        require('nw.gui').Window.get().close();
      }
    };

    // Create a shortcut with |option|.
    var shortcut = new gui.Shortcut(option);
    // Register global desktop shortcut, which can work without focus.
    gui.App.registerGlobalHotKey(shortcut,function(){
      console.log("registerGlobalHotKey.........")
    });

    // If register |shortcut| successfully and user struck "Ctrl+Shift+A", |shortcut|
    // will get an "active" event.

    // You can also add listener to shortcut's active and failed event.
    shortcut.on('active', function() {
      window.focus();
    });

    // shortcut.on('failed', function(msg) {
    //   console.log(msg);
    // });

    // Unregister the global desktop shortcut.
    // gui.App.unregisterGlobalHotKey(shortcut);

  },4000);

})();
