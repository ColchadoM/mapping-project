(function () {
  'use strict'

  // WebSocket
  var wsURL = 'ws://172.20.10.4:1881';
  var connection;

  function onClickBtn(event) {
    var target = event.currentTarget;

    var id = $(target).data('id');
    if ( connection && connection.readyState == connection.OPEN){
      var message = {
        type : 'data',
        data : id
      };
      connection.send(JSON.stringify(message));
    }
  }

  function setupWebSocket () {
    window.WebSocket = window.WebSocket || window.MozWebSocket;

    connection = new WebSocket (wsURL);

    connection.onopen  = onConnectionOpen;
    connection.onerror = onConnectionError;
  }

  function onConnectionOpen () {
    console.log('Connected with server!');


    var message = {
      type : 'register',
      data : 'input'
    };
    connection.send(JSON.stringify(message));
  }

  function onConnectionError () {
    console.log('Error in connection :(!');
  }

  $(document).ready(function(){
    setupWebSocket ();

    $('div.btn').on('click', onClickBtn);
  });

})();
