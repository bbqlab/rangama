function RangamaGame(id){
  this.id = id;
  this.words = [];
  this.current_word = [];
  this.game_time = 180;//app['game_time'];
  this.rules = { letter_weight: 10 };
  this.score = 0;

  this.audio_ok = [];
  this.audio_ok.push(new Audio('audio/ok1.wav'));
  this.audio_ok.push(new Audio('audio/ok2.wav'));
  this.audio_ok.push(new Audio('audio/ok3.wav'));
  for(i in this.audio_ok)
  {
    this.audio_ok[i].load();
  }
  this.audio_error = new Audio('audio/error.wav');
  this.audio_error.load();
  this.audio_panic = new Audio('audio/panic.wav');
  this.audio_panic.load();
  this.audio_gong = new Audio('audio/panic.wav');
  this.audio_gong.load();
};

RangamaGame.prototype.start = function() {
  this.word_list = new WordList();
  var word = this.next_word();
  this.draw_word(word);
  this.bind_events();
  $.ui.scrollToTop();
//  this.game_interval = window.setInterval( this.timer_tick, 1000 );
};


RangamaGame.prototype.timer_tick = function() {
  var game = app.current_game;
  var game_time = --game.game_time;

  /* game over */
  if(game_time==0) {
    app.stop_game(); return; 
  };
  
  /* bouncing timer */
  if(game_time<10) {
    if(game_time%2)
      $('.game_timer').removeClass('bounce');
    else
      $('.game_timer').addClass('bounce');
  }
  
  if(game_time==10)
  {
//    game.audio_panic.play();
  }

  $('.game_timer').html('0:'+game_time);
};

RangamaGame.prototype.stop = function() {
    window.clearInterval(this.game_interval);
    var game = app.current_game;

    var precision = (100*game.n_key_matched/game.n_key_pressed);
    var stats_n_key_pressed = (100*game.n_key_pressed/600);
    var stats_n_key_matched = (100*game.n_key_matched/360);

    var stats = {};

    stats['key_pressed'] = game.n_key_pressed;
    stats['key_bad'] = game.n_key_pressed - game.n_key_matched;
    stats['key_good'] = game.n_key_matched;
    stats['score'] = this.score;

    app.send_results(this, stats, function () {
      game = app.current_game;

      game.precision = (100*game.n_key_matched/game.n_key_pressed).toFixed(2);
      game.unbind_events();

      $.ui.loadContent('#results', false, false );
      app.set_game_score(game.id,game.score);

      game.facebook_user = app.facebook_user;
      $('#results').html($.template('view_results',{ game: game }));

      setTimeout( "$('#typing')[0].blur();", 40);

      function set_results()
      {
        $('#stats_precision').css('width',precision + '%');
        $('#stats_n_key_pressed').css('width',stats_n_key_pressed + '%');
        $('#stats_n_key_matched').css('width',stats_n_key_matched + '%');

        $('#score_label').addClass('score_label_big');
        $('#score_number').addClass('score_number_big');

        if(game.is_topten_record){
          $('#topten_record').addClass('record_popup_out');
          if(app.facebook_user)
          {
            app.send_results_to_fb('topten', game);
          }
        }

        if(game.is_personal_record) {
          console.log('personal record');
          $('#personal_record').addClass('record_popup_out');
          if(app.facebook_user)
          {
            app.send_results_to_fb('personal', game);
          }
        }
      }

      setTimeout(set_results,500);//$('#stats_precision').css('width','"+ precision + "%');",500);
    });
};

RangamaGame.prototype.next_word = function() {
  this.real_word = this.word_list.next_word().split("");
  this.current_word = this.shuffle_word(this.real_word);

  return this.current_word;
};

RangamaGame.prototype.shuffle_word = function(real_word) {
  //+ Jonas Raoni Soares Silva
  //@ http://jsfromhell.com/array/shuffle [v1.0]
  function shuffle(o){ //v1.0
      for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
      return o;
  }; 

  var word = $.extend([],real_word);

  var idx1 = Math.floor(Math.random() * (word.length + 1));
      idx2 = Math.floor(Math.random() * (word.length + 1));;
  var idx1 = 0,
      idx2 = 1;
  
  word.splice(idx1, 1);
  word.splice(idx2, 1);

  word = shuffle(word);

  word.splice(idx1, 0, real_word[idx1]);
  if(idx2 >= idx1) idx2++;
  word.splice(idx2, 0, real_word[idx2]);
  
  return word;
};

RangamaGame.prototype.draw_word = function(word) {
  var that = this;
  app.render('#anagram_box', 'view_anagram_word', { word: word }, function() {
    $('.sortable').sortable({
      after_drag: that.change_letters
    });

    that.check_word();
  });
};

RangamaGame.prototype.change_letters = function(dragged, overlap) {
  if(overlap < 0) return;            
  var game = app.current_game;
  var temp = game.current_word[dragged];
  game.current_word[dragged] = game.current_word[overlap];
  game.current_word[overlap] = temp;

  $('.l' + dragged).attr('id','l' + overlap);

  game.check_word();
};

RangamaGame.prototype.check_word = function() {
  var correct = true;

  for (var i = 0; i < this.current_word.length; i++) {
    if(this.current_word[i] == this.real_word[i]) {
      if(!$('.l'+i).hasClass('correct_letter')) {
        $('.l'+i).addClass('correct_letter');
      }
    }
    else
    {
      correct = false;
      if($('.l'+i).hasClass('correct_letter')) {
        $('.l'+i).removeClass('correct_letter');
      }
    }
  }
  
  if(correct)
  {
    this.word_hit();
  }
};


RangamaGame.prototype.random_ok = function() {
  var rand =  Math.floor(Math.random() * 3);
  return this.audio_ok[rand];
}

RangamaGame.prototype.word_hit = function() {
  var word = this.current_word.join('');
  this.score += word.length*this.rules.letter_weight;
  this.n_key_matched+=word.length;
  $('.game_score').html(this.score);
  var word = this.next_word();
  this.draw_word(word);
};

RangamaGame.prototype.current_word_out = function() {
};

RangamaGame.prototype.clear_current_word = function(type) {
  this.current_word_out();
  this.current_word = [];
  this.next_word();
};


RangamaGame.prototype.refresh_word = function() {
};

RangamaGame.prototype.bind_events = function() {
};

RangamaGame.prototype.unbind_events = function() {
};


