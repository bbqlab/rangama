
App.prototype.template_engine = function() {
    var that = this;
    Handlebars.registerHelper('equal', function(lvalue, rvalue, options) {
      if (arguments.length < 3)
          throw new Error("Handlebars Helper equal needs 2 parameters");
      if( lvalue!=rvalue ) {
          return options.inverse(this);
      } else {
          return options.fn(this);
      }
    });

    Handlebars.registerHelper('notequal', function(lvalue, rvalue, options) {
      if (arguments.length < 3)
          throw new Error("Handlebars Helper equal needs 2 parameters");
      if( lvalue==rvalue ) {
          return options.inverse(this);
      } else {
          return options.fn(this);
      }
    });


    $.get('views/view_game_row.js' , function(data) {
        Handlebars.registerPartial('game_row', data)
    });
  };

App.prototype.render = function(id, tpl, params, callback) {
    console.log(params);
    if(this.templates[tpl])
    {
      html = this.templates[tpl](params);
      $.ui.updateContentDiv(id,html);
      if(callback) callback();
    }
    else
    {
      var that = this;
      $.get('views/' + tpl + '.js' , function(data) {
        var template = Handlebars.compile(data);
        that.templates[tpl] = template;
        html = template(params);
        $.ui.updateContentDiv(id,html);
        if(callback) callback();
      });
    }
  };
