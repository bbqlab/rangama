function RangamaGame(id){
  this.id = id;
  this.words = [];
  this.word_id = -1;
  this.current_word = [];
  this.word_time = 0;//app['game_time'];
  this.rules = {letter_weight: 7};
  this.facebook_user = app.facebook_user;
  this.score = 0;

  this.stats = {
    total: {right_moves:0, bad_moves: 0},
    partial: []
  };

  this.audio_ok = [];
  this.audio_ok.push(new Audio('audio/ok1.wav'));
  this.audio_ok.push(new Audio('audio/ok2.wav'));
  this.audio_ok.push(new Audio('audio/ok3.wav'));
  for(i in this.audio_ok) {
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
  var that = this;
  this.word_list = new WordList(this.id);
  this.word_list.load(function() {
    that.draw_word(that.next_word());
    that.bind_events();
    $.ui.scrollToTop('#game_play');
  });
};

RangamaGame.prototype.timer_tick = function() {
  var game = app.current_game;
  var word_time = ++game.word_time;
};

RangamaGame.prototype.stop = function() {
    window.clearInterval(this.game_interval);
    var game = app.current_game;

    app.send_results(this, this.stats, function () {
      game = app.current_game;
      game.unbind_events();
      app.set_game_score(game.id,game.score);
      app.show_game_results(game);
    });
};

RangamaGame.prototype.next_word = function() {
  var anagrams = this.word_list.next_word();
  this.real_word = anagrams.anagram.split('');
  this.current_word = anagrams.word.split('');

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
  word = shuffle(word);
  
  return word;
};

RangamaGame.prototype.draw_word = function(word) {
  var that = this;
  this.stats.partial[++this.word_id] = {right_moves:0, bad_moves:0};
  app.render('#anagram_box', 'view_anagram_word', {word: word}, function() {
    $('.sortable').sortable({
      before_drag: that.init_drag,
      after_drag: that.end_drag
    });
    this.word_interval = window.setInterval( this.timer_tick, 1000 );
    that.check_word(-1, -1);
  });
};

RangamaGame.prototype.init_drag = function(dragged) {
  console.log("Start dragging");
  $('.letter').addClass('shake');
};

RangamaGame.prototype.end_drag = function(dragged,overlap){
  window.app.current_game.change_letters(dragged,overlap);
  $('.letter').removeClass('shake');
};

RangamaGame.prototype.change_letters = function(dragged, overlap) {
  if(overlap < 0) return;            
  var game = app.current_game;
  var temp = game.current_word[dragged];
  game.current_word[dragged] = game.current_word[overlap];
  game.current_word[overlap] = temp;

  $('.l' + dragged).attr('id','l' + overlap);

  game.check_word(dragged, overlap);
};

RangamaGame.prototype.check_word = function(dragged, overlap) {
  var correct = true;
  for (var i = 0; i < this.current_word.length; i++) {
    if(this.current_word[i] == this.real_word[i]) {
      if(!$('.l'+i).hasClass('correct_letter')) {
        $('.l'+i).addClass('correct_letter');
        if(i == dragged || i == overlap) 
          this.stats.partial[this.word_id].right_moves++;
      }
    } else {
      correct = false;
      if($('.l'+i).hasClass('correct_letter')) {
        $('.l'+i).removeClass('correct_letter');
      }
      if(i == dragged) this.stats.partial[this.word_id].bad_moves++;
    }
  }
  
  if(correct) {
    this.word_hit();
  }
};


RangamaGame.prototype.random_ok = function() {
  var rand =  Math.floor(Math.random() * 3);
  return this.audio_ok[rand];
};

RangamaGame.prototype.word_hit = function() {
  var word = this.current_word.join('');

  window.clearInterval(this.word_interval);
  this.score += this.get_score(word);

  this.stats.total.right_moves += this.stats.partial[this.word_id].right_moves;
  this.stats.total.bad_moves += this.stats.partial[this.word_id].bad_moves;

  app.log(this.stats);

  this.word_time = 0;
  $('.game_score').html(this.score);

  var word = this.next_word();

  $('.feedback').addClass('feedback_on');
  var that = this;

  function go_next() {
    $('.feedback').removeClass('feedback_on');
    console.log('finishing game ' + that.word_id);
    if(that.word_id == 10) { // game over
      that.stop();
    } else {
      that.draw_word(word);
    }
  }

  setTimeout(go_next, 1500);
};

RangamaGame.prototype.get_score = function(word) {
   var stats = this.stats.partial[this.word_id];
   var score;
   
   console.log('score is ' + score);
   console.log('moves bad: ' + stats.moves);
   console.log('word time is: ' + this.word_time);

   score = parseInt(score * (stats.right_moves) / (stats.bad_moves+1));
   return score;
};

RangamaGame.prototype.skip_word = function() {
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


