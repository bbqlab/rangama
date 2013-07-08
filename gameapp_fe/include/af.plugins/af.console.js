/**
 * @author Barbecue Lab // bbqlab.com
 * @desc a console.log substitution and error handler for mobile device
 *       with local and remote log capabilities
 *
 * Usage: 
 *   Double tap on device to show/hide console panel
 *
 * Include it in your project:
 *   <script src="jq.console.js" type="text/javascript" charset="utf-8"></script>
 *   stylesrc
 *
 * Initialize:
 *   $.console.init(options);
 *
 *   options is an object with following properties:
 *     only_on_mobile: boolean | enable only on mobile device (default true) 
 *     local_logging: boolean | enable local console (default true)
 *     remote_logging: boolean | enable remote logging (default true)
 *     remote_url: string | an url where moblog will POST your log
 *
 * Example:
 *
 *  $.console.init( { only_on_mobile: false, 
 *                    remote_url: "http://192.168.1.123/debug.php" } );
 *  console.log("Test jqMobi console plugin!");
 *  undeclaredFunction();
 *
 */

(function($){
  $.console = {

    visible: false,
    is_mobile: (/iPhone|iPod|iPad|Android|BlackBerry/).test(navigator.userAgent),
    settings: { enabled: true,
                only_on_mobile: true,
                remote_url: "",
                local_logging: true,
                remote_logging: false },

    // rewrite console.log function
    // load settings
    init: function(options){
    
      this.settings = $.extend(this.settings,options);
      console.log(this.settings);

      if(!this.settings.enabled || (this.settings.only_on_mobile && !this.is_mobile)) return;

      console.log("Init afMobi console!");

      // add console div inside DOM 
      this.add_console();

      // window.onerror binding
      this.event_bindings();

      // override console.log
      this.override_console_log();

    },

    override_console_log: function(){
      console.log = this.log;
    },

    add_console: function(){
      if(!this.settings.local_logging) return;

      $('body').append('<ul id="af_console"></ul>');
      this.console = $('#af_console');
    },

    event_bindings: function(){
      window.onerror = function(error,file,line)
      {
        $.console.log(error,file.split('/').slice(-2).join('/')+':'+line,true);
      };
    
      if(!this.settings.local_logging) return;

      var action;
//      $(document).on('doubleTap', this.toggle_console);
      console.log('dsadsa');
      $('#consolebtn').on('click', this.toggle_console);
    },

    toggle_console: function(){
      console.log('toggle');
      if($.console.visible)
      {
        $.console.console.removeClass('af_console_show');
        $.console.visible = false;
      }
      else{
        $.console.console.addClass('af_console_show');
        $.console.visible = true;
      }
    },

    
    log: function(message,scope,is_error){

      if((typeof message == "object") && (message !== null)) {
        var obj_msg = '';
        obj_msg = "Object " +  + "<br>";
        obj_msg += "len " + message.length + "<br>";
        for(attr in message) {
            obj_msg += attr + ' -> ' + message[attr] + ' | ';
        }
        message = obj_msg;
      }

      if($.console.settings.local_logging){
        var msg = '<li' + (is_error?' class="error"':'') + '>';
        if( scope) msg += '<div class="right">[' + scope + ']</div>';
        msg += '<div class="left">' + message + '</div>';
        msg += '<div style="clear:both"></div>';
        msg += '</li>';
        $.console.console.prepend(msg);
      }

      // remote logging
      if($.console.settings.remote_logging && $.console.settings.remote_url)
        $.post($.console.settings.remote_url, {message: message + ' [' + scope + ']' });
    }
  };

})(af);
