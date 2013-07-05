
var App = function() {
  this.state = 0;          // using this to know if i'm ready to start application
  this.online = false;
  this.templates = {};
};

App.prototype = {
  try_to_start: function() {
    this.state++;
    this.log('try');
    if(this.state==1) {
      this.log('Starting App');
      this.setup();
      this.template_engine();
      this.main();
    }
  },

  /* SETUP APPLICATION (set landscape orientation, click handler, fill background...) */
  setup: function() {
    if(typeof AppMobi.device!='undefined')
    {
      AppMobi.device.setRotateOrientation('landscape');
      AppMobi.device.setAutoRotate(false);
      AppMobi.device.managePower(false,false);
      AppMobi.device.hideSplashScreen();
    }

    $.ui.transitionTime = '4';
    this.log('setting custom click');
    $.ui.customClickHandler = this.click_handler;
    $.ui.showBackbutton=false
  },

  facebook_init: function() {
    var that = this;
    window.fbAsyncInit = function() {
      // init the FB JS SDK
      FB.init({
        appId      : '257139571093057',         // App ID from the app dashboard
        channelUrl : '//wodrs.com/channel.php', // Channel file for x-domain comms
        status     : true,                      // Check Facebook Login status
        xfbml      : true                       // Look for social plugins on the page
      });

      FB.Event.subscribe('auth.authResponseChange', function(response) {
        if (response.status === 'connected') {
          that.auth_facebook_login(response);
        } else if (response.status === 'not_authorized') {
          FB.login(function(){},{scope: 'publish_actions'});
        } else {
          FB.login(function(){},{scope: 'publish_actions'});
        }
      });

      $(document).trigger('facebookLoaded');

    };

    // Load the SDK asynchronously
    (function(d, s, id){
       var js, fjs = d.getElementsByTagName(s)[0];
       if (d.getElementById(id)) {return;}
       js = d.createElement(s); js.id = id;
       js.src = "//connect.facebook.net/en_US/all.js";
       fjs.parentNode.insertBefore(js, fjs);
     }(document, 'script', 'facebook-jssdk')); 
  },


  /* this is called on touch for every anchor (target represent the anchor DOM element)
   * search for a function of the app called as the href parameter and call it if needed (with parameters on need)
   * load a panel with the id if no function is found */
  click_handler: function(target) {
    if($(target).hasClass('button_disabled')) return true;

    app.target = target;
    url = $(target).attr('href');
    
    try
    {
      args = url.split('/');
      controller = args[0];
      if( typeof app[controller] == 'function' )
      {
        if(args.length==1)
          app[controller]();
        else if(args.length==2)
          app[controller](args[1]);
        else if(args.length==3)
          app[controller](args[1],args[2]);
        else if(args.length==4)
          app[controller](args[1],args[2],args[3]);
      }
      else if( controller != '' ){
        $.ui.loadContent('#'+controller,true,false);
        return true;
      }
    }
    catch(e){
      console.log("ERROR IN CLICKHANDLER " + e);
      return false;
    }
    //returning true prevent default jq.ui event to be handled
    return true;
  },

  init_background: function() {
    return;
    var possible = 'abcdefghijklmnopqrstuvwxyz';
    var letters = [];
    for (var i = 0; i < 20; i++) {
       letters.push(possible.charAt(Math.floor(Math.random() * possible.length)));
    }

    console.log(letters);

    function random_position() {
      var bg_offset = $('#background').offset();

    }

    function random_angle() {
    }

    app.render('#background','view_background',{letters: letters},function() {
       console.log('background');
    });

  },

  main: function() {
    this.load_settings();
    this.init_background();
    var that = this;

    if(this.username != '' && this.password != '')
    {
      if(!this.is_logged())
      {
        this.login(true, function() {
          that.online = true;
          if(!that.is_logged())
          {
            $.ui.loadContent('#login', false, false);
          }
          else
          {
            that.show_game_list();
          }
        });
      }
      else
      {
        that.show_game_list();
      }
    }
    else {
      if(this.is_facebook_user())
      {
         this.facebook_login();
      }
      else
      {
        $.ui.loadContent('#login', false, false);
      }
    }
  },
  

  show_game_list: function() {
    var that = this;
    $.getJSON(this.backend + 'list_games', {token: this.token}, function(res) {
      that.fill_game_list(res.data.games);
    });
  },

  fill_game_list: function(games) {
    var html = '';
    this.game_list=games;
    this.render('#games_list', 'view_games_list', { games:this.game_list }, function() {
      $.ui.loadContent('#games_list', false, false);
      $.ui.scrollToTop('#games_list');
    });
  },

  set_game_score: function(id,score){
    var that = this;
    $.each(that.game_list.running, function(index, game) {
      if( game.gamesId == id ){
        that.game_list.running[index].score1 = score;
        return false;
      }
    });
  },

  get_game: function(id){
    var game_found = null;

    $.each(this.game_list.running, function(index, game) {
      if( game.gamesId == id ){
        game_found = game;
        return false;
      }
    });

    if(!game_found ) {
      $.each(this.game_list.running_opponent, function(index, game) {
        if( game.gamesId == id ){
          game_found = game;
          return false;
        }
      });
    } 

    if(!game_found ) {
      $.each(this.game_list.completed, function(index, game) {
        if( game.gamesId == id ){
          game_found = game;
          return false;
        }
      });
    } 

    return game_found;
  },

  request_player: function() {
    var that = this;
    $('#request_player_button').addClass('spin').html('Waiting player..').addClass('button_disabled');
    $.getJSON(this.backend + 'request_player', {token: this.token}, function(res) {
      that.game_check_interval = setTimeout(function() {that.check_games()},1000);
    });
  },

  check_games: function() {
    var that = window.app;
    console.log(that);
    $.getJSON(that.backend +'list_games', {token:that.token}, function(res) {
      if(res.data.games.running.length > 0)
      {
        $('#request_player_button').removeClass('spin').html('New game').removeClass('button_disabled');
        clearInterval(that.game_check_interval);
        that.fill_game_list(res.data.games);
      }
      else
      {
        that.game_check_interval = setTimeout(that.check_games,1000);
      }
    });
  },

  start_game: function(game_id) {
    this.current_game = new RangamaGame(game_id);
    this.current_game.start();
    $.ui.loadContent('#game_play',false,false);
    $.ui.scrollToTop('#game_play');
  },

  stop_game: function() {
    this.current_game.stop();
  },

  show_register: function() {
    $.ui.loadContent('#register',false,false);
  },

  register: function() {
    var that = this;
    username = $('#reg_username').val();
    password = $('#reg_password').val();
    $.getJSON(this.backend + 'register', {username: username, password: password },
              function(data) {
                if(data.error)
                {
                  $('body').popup({title: "Error", message: data.data });
                }
                else
                {
                  that.token = data.data.token;
                  localStorage.setItem('token', JSON.stringify(that.token));
                  localStorage.setItem('username', username);
                  localStorage.setItem('password', password);
                  that.show_game_list();
                }
      });
  },

  is_logged: function() {
    return this.token != '';
  },

  login: function(storage, callback) {
    var that = this;

    if(storage) {
      username = this.username;
      password = this.password;
    }
    else {
      username = $('#login_username').val();
      password = $('#login_password').val();
    }


    function set_user_data(data) {
      if(data.error) {
        $('body').popup({title: "Error", message: data.data });
      }
      else  {
        that.token = data.data.token;
        localStorage.setItem('token', that.token)
        localStorage.setItem('username', username)
        localStorage.setItem('password', password)
        if(callback) { 
          callback();
        }
        else  {
          that.show_game_list();
        }
      }
    }

    $.getJSON(this.backend + 'login', {username: username, password: password },set_user_data);
  },

  facebook_login: function() {
    var that = this;
    FB.getLoginStatus(function(response) {
      if (response.status === 'connected') {
        // the user is logged in and has authenticated the app
        that.auth_facebook_login(response); 
      } else {
        // the user isn't logged in to Facebook or hasn't auth 
        FB.login(function(){},{scope: 'publish_actions'});
      }
    });
  },

  is_facebook_user: function() {
     return this.facebook_user != 0;
  },

  auth_facebook_login: function(auth, callback) {
    var that = this;
    FB.api('/me', function(user) {
      data = auth.authResponse;
      data.name = user.name;
      data.email = user.username + '@facebook.com';
      
      $.getJSON(that.backend + 'facebook_login', data, function(res) {
        that.token = res.data.token;
        that.facebook_user = 1;
        that.facebook_id = user.id;
        localStorage.setItem('token', that.token);
        localStorage.setItem('username', user.name);
        localStorage.setItem('password', '');
        localStorage.setItem('facebook_user', 1);
        localStorage.setItem('facebook_id', user.id);
        if(callback)
          callback(res);
        that.show_game_list();
      });
    });
  },

  logout: function() {
    localStorage.setItem('token', '');
    localStorage.setItem('username', '');
    localStorage.setItem('password', '');
    localStorage.setItem('facebook_user', 0);
    localStorage.setItem('facebook_id', '');

    this.token = '';
    this.facebook_user = 0;
    $.ui.loadContent('#login', false, false);
  },

  send_results: function(game, stats, callback){
    var that = this;
    $.getJSON( this.backend + 'send_results', 
              { game_id: game.id, stats: stats, token: this.token }, 
              function(res){
                that.current_game.is_personal_record = res.data.is_personal_record;
                that.current_game.is_topten_record = res.data.is_topten_record;
                callback(game);
              });
  },

  send_results_to_fb: function(type, game) { 
      var mess, name, description;
      if(type == 'topten')
      {
        mess = "I joined Wodrs TopTen with  " + game.score +  " points!";
        name = "Wodrs TopTen Record!";
      }
      else
      {
        mess = "I did my personal Wodrs record with  " + game.score +  " points!"
        name = "Wodrs Personal Record!";
      }
   
      description = "Challenge your friends and your colleagues, " +
           " test your skills as a typist and try to get into the top ten!";
      
      console.log('posting to fb for ' + this.facebook_id);
      FB.api('/' + this.facebook_id + '/feed', 'POST', {
        access_token: this.token,
        message: mess,
        name: name,
        picture: 'http://wodrs.com/public/images/wodrs_icon.png',
        description:  description,
        link: 'http://wodrs.com',
        type: 'link'
      }, function(data) { console.log(data) });
  },

  game: function(method) {
    app.current_game[method]();
  },

  show_game_info: function(game_id){
    $('#wodrs_title').removeClass('title_out');
    if(typeof game_id=='undefined')
      game_id=this.current_game.id;

    // training mode 
    if(game_id==-1)
    {
      $.ui.loadContent('#game_list');
      $.ui.scrollToTop('#game_list');
      return;
    }

    var game = this.get_game(game_id);
    game.facebook_user = this.facebook_user;
    this.render('#game_info', 'view_game_info', { game:game }, function() {
      $.ui.loadContent('#game_info');
      $.ui.scrollToTop('#game_info');
    });
  },

  show_game_results: function(game) {
    this.render('#game_results', 'view_results', {game:game}, function() {
      $.ui.loadContent('#game_results', false, false );

      function set_results()
      {
        $('#score_label').addClass('score_label_big');
        $('#score_number').addClass('score_number_big');

        if(game.is_topten_record) {
          $('#topten_record').addClass('record_popup_out');
          if(this.facebook_user) {
            this.send_results_to_fb('topten', game);
          }
        }

        if(game.is_personal_record) {
          console.log('personal record');
          $('#personal_record').addClass('record_popup_out');
          if(this.facebook_user) {
            this.send_results_to_fb('personal', game);
          }
        }
      }

      setTimeout(set_results,500);
    });
  },

  settings: function() {
    var that = this;
    $.ui.scrollToTop('#settings');

    $.getJSON(this.backend + 'get_user_settings', {token: this.token}, function(res) {
        res.data.facebook_user = that.facebook_user;
        res.data.facebook_id = that.facebook_id;
        that.render('#settings', 'view_settings', { settings:res.data }, function() {
          $.ui.loadContent('#settings');

          $('.wodrs_avatar').click(function(ev) {
            console.log($(this).attr('src'));
            $('.wodrs_avatar_selected').removeClass('wodrs_avatar_selected');
            $(this).addClass('wodrs_avatar_selected');
            $.getJSON(that.backend + 'update_avatar', {token:that.token,
                                                       url:$(this).attr('src')}, function(res) {});
          });
        });
    });
  }
}

var app;

$.ui.ready(function() {
  app = new App();
  app.try_to_start();
  window.app = app;
  
  //app.facebook_init();
});

//document.addEventListener("DOMContentLoaded",app.try_to_start,false);
//document.addEventListener("$.ui.load",app.try_to_start,false);
//document.addEventListener("appMobi.device.ready",app.try_to_start,false);
//document.addEventListener("facebookLoaded",app.try_to_start,false);

document.addEventListener("appMobi.device.update.available",onUpdateAvailable,false); 

function onUpdateAvailable(evt) 
{
  if (evt.type == "appMobi.device.update.available") 
    if (confirm(evt.updateMessage)==true) 
      AppMobi.device.installUpdate()
}


function randomString(len, charSet) {
    charSet = charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var randomString = '';
    for (var i = 0; i < len; i++) {
      var randomPoz = Math.floor(Math.random() * charSet.length);
      randomString += charSet.substring(randomPoz,randomPoz+1);
    }
    return randomString;
}


