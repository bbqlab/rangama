App.prototype.load_settings = function() 
{
  var that = this;
  // first parameter is default value, if second parameter is true
  // is encoded in JSON
  //console.log("LOAD SETTINGS");
  var default_settings = { 
                            backend: ['http://192.168.1.140/rangama_be/gameapp/',false],
                            log_backend: ['http://192.168.1.123/bestone/log_message/',false],
                            username: ['',false],
                            password: ['',false],
                            token:['', false],
                            game_time: [60,false],
                            app_name: ['Wodrs',false],
                            facebook_user:[0, false],
                            facebook_id:['', false],
                            current_version: [0,false],
                            user: [null,true],
                         };

  $.each(default_settings,
    function(idx,value)
    {
      var tmp_value = localStorage.getItem(idx);
      if( tmp_value != null && tmp_value != undefined )
      {
        // settings is JSON encoded ?
        console.log(idx + ' = ' + tmp_value);
        if( value[1] )
          that[idx]=JSON.parse(tmp_value);
        else
          that[idx]=tmp_value;
      }
      else
      {
        that[idx]=value[0];
      }
    }); 
 
};

App.prototype.reset = function() {
  localStorage.clear();
};
