
function WordList(game_id){
  this.dictionary = [];
  this.game_id = game_id;
  this.words = [];
  this.completed = [];
  this.n_dictionary_words=0;
  this.current = -1;
  this.current_distance = 4;
  this.fetched = 0;
}

WordList.prototype.each = function(callback) {
   $.each(this.words, function(id, word) {
      callback(id, word);
   });
};

WordList.prototype.load = function(callback) {
  this.fetch_words(callback);
};

WordList.prototype.fetch_words = function(callback) {
  var that = this;

  var params = {
    token: app.token,
    gamesId: this.game_id,
    limit: 20,
    offset: this.fetched,
    distance: this.current_distance
  };

  $.getJSON(app.backend+"/get_words", params, function(words) {
    that.words = words.data;
    callback();
  });
}


WordList.prototype.next_word = function() { 
  var word = this.words.pop();
  console.log(word);
  if(this.words.length == 0)
  {
    //TODO
  }
  return word;
}

WordList.prototype.check_word = function(word) {
  word = word.toLowerCase();
  var id = this.words.indexOf(word.toLowerCase());

  // WORD MATCHED (remove it and getting a new one from dictionary)
  if(id>=0)
  {
    this.update_word(id);
    return id;
  }
  else
  {
    id = -2;
    $.each(this.words,function(index,selected_word){
      if(selected_word.indexOf(word)==0){ id = -1; return false; }
    });
    return id;
  }
};


