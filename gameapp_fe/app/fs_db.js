

var fs_db = {

  loaded: {},
  tables: {},

  init: function() {
    var tmp = localStorage.getItem('fs_db_tables');
    if(tmp)
      fs_db.loaded = JSON.parse(tmp);
    document.addEventListener("appMobi.cache.media.update", fs_db.update, false);
    document.addEventListener("appMobi.cache.media.add", fs_db.complete, false);
  },


  // download db
  download: function(url,name,oncomplete,onupdate) {
    var url = app.backend + url; 
    fs_db.loaded[name] = { url: url, oncomplete: oncomplete, onupdate: onupdate };
    AppMobi.cache.addToMediaCacheExt(url,name);
  },
  
  // unload db
  unload: function(name){
    if(fs_db.tables[name]){
      fs_db.tables[name]=null;
      delete fs_db.tables[name];
      return;
    }
  },

  // load db
  load: function(name,onload) {
    if(fs_db.tables[name]){
        if(typeof onload=='function') onload();
        return;
    }
    var localUrl = AppMobi.cache.getMediaCacheLocalURL(fs_db.loaded[name].url);

    $.getJSON(localUrl,null,function(result){
      try {
        fs_db.tables[name] = result;
        if(typeof onload=='function') onload();
      }
      catch(e){
        console.log("Error loading data from " + localUrl);
        console.log(e);
      }
    });
  },
  

  // delete db from memory and script tag from DOM
  remove: function(name) {
    
  },

  update: function(e) {
    if( fs_db.loaded[e.id] && fs_db.loaded[e.id].onupdate )
      fs_db.loaded[e.id].onupdate(e);
  },

  // gestione eventi download complete/update
  complete: function(e){

    var tmp  = localStorage.getItem('fs_db_tables');
    var current_completed_tables = {};
    if( tmp )
      current_completed_tables = JSON.parse(localStorage.getItem('fs_db_tables'));

    current_completed_tables[e.id] = fs_db.loaded[e.id];
    localStorage.setItem('fs_db_tables',JSON.stringify(current_completed_tables));
    if( fs_db.loaded[e.id] && fs_db.loaded[e.id].oncomplete )
        fs_db.loaded[e.id].oncomplete(e);

  }

};


fs_db.init();
