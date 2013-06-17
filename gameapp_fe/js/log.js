App.prototype.log = function(message) {
  //console.log("SONO QUI " + message );
  if( typeof message == 'object' )
  {
    var msg='';
    for( property in message )
      msg += property + ' ' + message[property] + "\n";
    console.log(msg);
    $.post(app.log_backend + 'log', { message: msg });
  }
  else
  {
    console.log(message);
    $.post(app.log_backend + 'log', { message: message });
  }
};

