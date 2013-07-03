

App.prototype.current_log_level = 2;

App.prototype.log_levels = {
    'INFO': 0,
    'ERROR': 1,
    'DEBUG': 2
};

App.prototype.log = function(message, level) {
  if(level === undefined) {
    level = 'DEBUG';
  }

  if(this.log_levels[level] <= this.current_log_level)
  {
    console.log(message);
  }
};

