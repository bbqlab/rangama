function App()
{
  this.state = 0;          // using this to know if i'm ready to start application
  this.online = false;
  this.templates = {};
  

  App.prototype.render = function(id, tpl, params, callback) {
    
    if(this.templates[tpl])
    {
      $.ui.updateContentDiv(id,$.template(tpl,params));
      if(callback) callback();
    }
    else
    {
      $.get('views/' + tpl + '.js' , function(data) {
        app.templates[tpl] = data;
        $('body').append('<script id="' + tpl + '" type="text/html">' + data + '</script>');
        $.ui.updateContentDiv(id,$.template(tpl,params));
        if(callback) callback();
      });
    }
  }

  App.prototype.try_to_start = function()
  {
    app.state++;

    if(app.state==3)
    {
      app.setup();
      app.main();
    }
  }

  /* SETUP APPLICATION (set landscape orientation, click handler, fill background...) */
  App.prototype.setup = function()
  {

    if(typeof AppMobi.device!='undefined')
    {
      AppMobi.device.setRotateOrientation('landscape');
      AppMobi.device.setAutoRotate(false);
      AppMobi.device.managePower(false,false);
      AppMobi.device.hideSplashScreen();
    }
    $.ui.transitionTime = '4';
    $.ui.customClickHandler = this.clickHandler;
    $.ui.showBackbutton=false

    //this.fill_background();
//    this.facebook_init();
  }

  App.prototype.facebook_init = function() 
  {
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
          app.auth_facebook_login(response);
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
  }


  /* this is called on touch for every anchor (target represent the anchor DOM element)
   * search for a function of the app called as the href parameter and call it if needed (with parameters on need)
   * load a panel with the id if no function is found */
  App.prototype.clickHandler = function(target)
  {
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
  }

}

var app = new App();
app.facebook_init();

document.addEventListener("DOMContentLoaded",app.try_to_start,false);
document.addEventListener("jq.ui.ready",app.try_to_start,false);
//document.addEventListener("appMobi.device.ready",app.try_to_start,false);
document.addEventListener("appMobi.device.update.available",onUpdateAvailable,false); 
document.addEventListener("facebookLoaded",app.try_to_start,false);

function onUpdateAvailable(evt) 
{
  if (evt.type == "appMobi.device.update.available") 
    if (confirm(evt.updateMessage)==true) 
      AppMobi.device.installUpdate()
}

app.main = function(){
  $.console.init({only_on_mobile:true});
  app.load_settings();
  if(app.username != '' && app.password != '')
  {
    if(!app.is_logged())
    {
      app.login(true, function() {
        app.online = true;
        if(!app.is_logged())
        {
          $.ui.loadContent('#login', false, false);
        }
        else
        {
          app.show_game_list();
        }
      });
    }
    else
    {
      
      app.show_game_list();
    }
  }
  else {
    if(app.is_facebook_user())
    {
       app.facebook_login();
    }
    else
    {
      $.ui.loadContent('#login', false, false);
    }
  }

};

app.show_game_list = function() {
  $.getJSON(app.backend + 'list_games', {token: app.token}, function(res) {
    app.fill_game_list(res.data.games);
  });
};

app.fill_game_list = function(games) {
  var html = '';
  app.game_list=games;
//  $.ui.updateContentDiv('#game_list',$.template('view_games_list',{ games: app.game_list }));
  app.render('#game_list', 'view_games_list', { games:app.game_list }, function() {
    $.ui.loadContent('#game_list', false, false);
    $('#wodrs_title').addClass('wodrs_title_animation');
    $.ui.scrollToTop();
  });
};


app.set_game_score = function(id,score){
  $.each(app.game_list.running, function(index, game) {
    if( game.gamesId == id ){
      app.game_list.running[index].score1 = score;
      return false;
    }
  });

}

app.get_game = function(id){
  var game_found = null;

  $.each(app.game_list.running, function(index, game) {
    if( game.gamesId == id ){
      game_found = game;
      return false;
    }
  });


  if(! game_found )
  {
    $.each(app.game_list.running_opponent, function(index, game) {
      if( game.gamesId == id ){
        game_found = game;
        return false;
      }
    });
  } 


  if(! game_found )
  {
    $.each(app.game_list.completed, function(index, game) {
      if( game.gamesId == id ){
        game_found = game;
        return false;
      }
    });
  } 

  return game_found;
};

app.request_player = function() {
  $('#request_player_button').addClass('spin').html('Waiting player..').addClass('button_disabled');
  $.getJSON(app.backend + 'request_player', {token: app.token}, function(res) {
    app.game_check_interval = setTimeout(app.check_games,1000);
  });
};

app.check_games = function() {
  $.getJSON(app.backend +'list_games', {token:app.token}, function(res) {
    if(res.data.games.running.length > 0)
    {
      $('#request_player_button').removeClass('spin').html('New game').removeClass('button_disabled');
      clearInterval(app.game_check_interval);
      app.fill_game_list(res.data.games);
    }
    else
    {
      app.game_check_interval = setTimeout(app.check_games,1000);
    }
  });
};

app.start_game = function(game_id) {
  $.ui.scrollToTop();
//  $('#wodrs_title').addClass('title_out');
  app.current_game = new RangamaGame(game_id);
  app.current_game.start();
  $.ui.loadContent('#game_play',false,false);
  $.ui.scrollToTop();
};

app.stop_game = function() {
  app.current_game.stop();
}

app.show_register = function() {
  $.ui.loadContent('#register',false,false);
};

app.register = function() {
  username = $('#reg_username').val();
  password = $('#reg_password').val();
  $.getJSON(app.backend + 'register', {username: username, password: password },
            function(data) {
              if(data.error)
              {
                $('body').popup({title: "Error", message: data.data });
              }
              else
              {
                app.token = data.data.token;
                localStorage.setItem('token', JSON.stringify(app.token));
                localStorage.setItem('username', username);
                localStorage.setItem('password', password);
                app.show_game_list();
                window.scrollTo(0,1);
              }
    });
};

app.is_logged = function() {
  return app.token != '';
};

app.login = function(storage, callback) {
  if(storage)
  {
    username = app.username;
    password = app.password;
  }
  else
  {
    username = $('#login_username').val();
    password = $('#login_password').val();
  }
  $.getJSON(app.backend + 'login', {username: username, password: password },
            function(data) {
              if(data.error)
              {
                $('body').popup({title: "Error", message: data.data });
              }
              else
              {
                app.token = data.data.token;
                localStorage.setItem('token', app.token)
                localStorage.setItem('username', username)
                localStorage.setItem('password', password)
                if(callback)
                { 
                  callback();
                }
                else
                {

                  app.show_game_list();
                  //$.ui.loadContent('#game_list', false, false);
                }
              }
    });
};

app.facebook_login = function() {

  FB.getLoginStatus(function(response) {
    if (response.status === 'connected') {
      // the user is logged in and has authenticated the app
      app.auth_facebook_login(response); 
    } else {
      // the user isn't logged in to Facebook or hasn't auth 
      FB.login(function(){},{scope: 'publish_actions'});
    }
  });
};

app.is_facebook_user = function() {
   return app.facebook_user != 0;
};

app.auth_facebook_login = function(auth, callback) {
  FB.api('/me', function(user) {
    data = auth.authResponse;
    data.name = user.name;
    data.email = user.username + '@facebook.com';
    
    $.getJSON(app.backend + 'facebook_login', data, function(res) {
      app.token = res.data.token;
      app.facebook_user = 1;
      app.facebook_id = user.id;
      localStorage.setItem('token', app.token);
      localStorage.setItem('username', user.name);
      localStorage.setItem('password', '');
      localStorage.setItem('facebook_user', 1);
      localStorage.setItem('facebook_id', user.id);
      if(callback)
        callback(res);
      app.show_game_list();
    });
  });
};

app.logout = function() {
  localStorage.setItem('token', '');
  localStorage.setItem('username', '');
  localStorage.setItem('password', '');
  localStorage.setItem('facebook_user', 0);
  localStorage.setItem('facebook_id', '');

  app.token = '';
  app.facebook_user = 0;
  $.ui.loadContent('#login', false, false);
};

app.send_results = function(game, stats, callback){
  $.getJSON( app.backend + 'send_results', 
            { game_id: game.id, stats: stats, token: app.token }, 
            function(res){
              app.current_game.is_personal_record = res.data.is_personal_record;
              app.current_game.is_topten_record = res.data.is_topten_record;
              callback(game);

            });
};

app.send_results_to_fb = function(type, game) { 
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
    
    console.log('posting to fb for ' + app.facebook_id);
    FB.api('/' + app.facebook_id + '/feed', 'POST', {
      access_token: app.token,
      message: mess,
      name: name,
      picture: 'http://wodrs.com/public/images/wodrs_icon.png',
      description:  description,
      link: 'http://wodrs.com',
      type: 'link'
    }, function(data) { console.log(data) });

};

app.skip_word = function() {
  app.current_game.skip_word();
};


app.show_game_info = function(game_id){
  window.scrollTo(0,1);
  $('#wodrs_title').removeClass('title_out');
  if(typeof game_id=='undefined')
    game_id=app.current_game.id;

  // training mode 
  if(game_id==-1)
  {
    $.ui.loadContent('#game_list');
    return;
  }

  var game = app.get_game(game_id);
  game.facebook_user = app.facebook_user;
//  $('#game_info').html($.template('view_game_info',{ game: game }));
  app.render('#game_info', 'view_game_info', { game:game }, function() {
    $.ui.loadContent('#game_info');
  });
};

app.settings = function(){
  window.scrollTo(0,1);
  $.getJSON(app.backend + 'get_user_settings', {token: app.token}, function(res) {
      res.data.facebook_user = app.facebook_user;
      res.data.facebook_id = app.facebook_id;
//      $('#settings').html($.template('view_settings',{ settings: res.data }));
      app.render('#settings', 'view_settings', { settings:res.data }, function() {
        $.ui.loadContent('#settings');

        $('.wodrs_avatar').click(function(ev) {
          console.log($(this).attr('src'));
          $('.wodrs_avatar_selected').removeClass('wodrs_avatar_selected');
          $(this).addClass('wodrs_avatar_selected');
          $.getJSON(app.backend + 'update_avatar', {token:app.token,
                                                 url:$(this).attr('src')}, function(res) {});
        });
      });
  });
}

app.animate_logo = function(ev) {
};

app.fill_background = function() {

  html = '';
  for(i = 0; i < 140; i++)
  {
    html += randomString(10);
  }

  $('#background').html(html);

};

function randomString(len, charSet) {
    charSet = charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var randomString = '';
    for (var i = 0; i < len; i++) {
      var randomPoz = Math.floor(Math.random() * charSet.length);
      randomString += charSet.substring(randomPoz,randomPoz+1);
    }
    return randomString;
}


