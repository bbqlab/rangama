
function WordList(){
  this.dictionary = [];
  this.words = [];
  this.completed = [];
  this.n_dictionary_words=0;
  this.load();
}

WordList.prototype.each = function(callback) {
   $.each(this.words, function(id, word) {
      callback(id, word);
   });
};

WordList.prototype.load = function() {
  this.dictionary = italian_dictionary;
  this.n_dictionary_words = this.dictionary.length;
  this.init_current_words();
};

WordList.prototype.init_current_words = function() {
  this.words = this.take_dictionary_words(6);
  console.log(this.words);
};

WordList.prototype.next_word = function() {
  var word = this.words.pop();
  if(this.words.length == 0)
  {
    this.init_current_words();
  }
  return word;
}

WordList.prototype.take_dictionary_words = function(n) {
  var i=0,id;
  var words = [];

  for(;i<n;i++)
  {
    id=Math.floor(Math.random()*this.n_dictionary_words);
    words = words.concat(this.dictionary.splice(id,1));
  }

  return words;

};

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

WordList.prototype.get_word = function(id) {
  return this.words[id];
};

WordList.prototype.update_word = function(id) {
  this.words[id]=this.take_dictionary_words(1)[0];
};

