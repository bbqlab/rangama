/**
 * jq.sortable.js - a sortable lists library for html5 mobile apps
 *
 */
(function($) {
    var cache = [];

    var objId= function(obj) {
        if(!obj.jqmSortableId) obj.jqmSortableId=$.uuid();
        return obj.jqmSortableId;
    }

    $.fn.sortable = function(opts) {
        var tmp, id;

        for (var i = 0; i < this.length; i++) {
            //cache system
            id = objId(this[i]);
            if(!cache[id]){
                tmp = new sortable(this[i], opts);
                cache[id] = tmp;
            } else { 
                tmp = cache[id];
            }
        }
        return this.length == 1 ? tmp : this;
    };

    var _event = {
        target: function(evt) {
            var target = false;
            if(evt instanceof MouseEvent)
            {
              target = evt.target;
            }
            else if(evt instanceof TouchEvent)
            {
              target = evt.touches[0].target;
            }

            return target;
        },

        get_pos: function(evt) {
            var posx = 0;
            var posy = 0;
            
            if (!e) var e = window.event;

            if(e.type == 'touchend' && e.changedTouches) {
              touch = e.changedTouches[0];
              posx = touch.clientX;
              posy = touch.clientY;
            }
            else if (e.pageX || e.pageY)   {
              posx = e.pageX;
              posy = e.pageY;
            }
            else if (e.clientX || e.clientY)  {
              posx = e.screenX;
              posy = e.screenY;
            }

            return {x: posx, y: posy};
        }
    };

    var defaults = {
        overlap: 'ui-overlap',
        dragged: 'ui-dragged',
        placeholder: 'ui-placeholder',
        relative_to: '#game_play',
        after_drag: false,
        on_drag: false,
        before_drag: false
    };

    var sortable = (function() {
        var sortable = function(containerEl, opts) {
            this.opts = {};
            if (typeof containerEl === "string" || containerEl instanceof String) {
                this.container = document.getElementById(containerEl);
            } else {
                this.container = containerEl;
            }
            if (!this.container) {
                alert("Error finding container for sortable " + containerEl);
                return;
            }
            if (this instanceof sortable) {
                for (var j in defaults) {
                    if (defaults.hasOwnProperty(j)) {
                        this.opts[j] = defaults[j];
                    }
                }
                for (var j in opts) {
                    if (opts.hasOwnProperty(j)) {
                        this.opts[j] = opts[j];
                    }
                }
            } else {
                return new sortable(containerEl, opts);
            }

            var that = this;
            this.li = [];

            jq(this.sortable).bind('destroy', function(e){
                var id = that.sortable.jqmSortableId;
                // window event need to be cleaned up manually, 
                // remaining binds are automatically killed in 
                // the dom cleanup process
                if(cache[id]) delete cache[id];
                e.stopPropagation();
            });
           
            // initial setup
            var $container=$(this.container);
            var data = Array.prototype.slice.call(this.container.childNodes);
            var relative_offset = false;
            if(this.opts.relative_to) {
              relative_offset = $(this.opts.relative_to).offset();
            }

            while(data.length>0) {
                var myEl=data.splice(0,1);
                myEl=$container.find(myEl)
                if(!myEl.is('li'))
                   continue;
                
                var li_offset = myEl.offset();
                if(relative_offset) { 
                  margin = parseInt($(this.opts.relative_to).css('marginLeft'));
                  li_offset.top = li_offset.top - relative_offset.top;
                  li_offset.left = li_offset.left - relative_offset.left + margin;
                }

                this.li.push({elem: myEl, offset: li_offset}); 
                myEl.bind('touchmove', function(e) {that.drag(e);});
                myEl.bind('touchend', function(e) {that.drag_end(e);});
                myEl.bind('touchstart', function(e) {that.drag_start(e);});

                myEl.bind('mousemove', function(e) {that.drag(e);});
                $(document).bind('mouseup', function(e) {that.drag_end(e);});
                myEl.bind('mousedown', function(e) {that.drag_start(e);});
            }


        };

        sortable.prototype = {
            dragging: false,

            offset: {x: 0, y: 0},

            overlay: -1,

            li:[],

            default_options: {},

            placeholder: false,
            target: false,
            elem: false,
            elem_idx: -1,

            log: function(message) {
                $('#log').append('<li>'+message+'</li>');
            },

            drag_start: function(evt) {
                this.elem_idx = this.index(_event.get_pos(evt));
                if(this.elem_idx >= 0 && !this.dragging) {
                    var that = this;
                    this.dragging = true;
                    this.elem = $(_event.target(evt));
                    if(this.opts.before_drag) {
                        this.opts.before_drag(this.elem, function() {
                            $(that.elem).addClass(this.opts.dragged);
                            that.target = that.detach_elem(that.elem, evt);
                            that.create_placeholder(that.elem);
                        });
                    }
                    else
                    {
                      $(this.elem).addClass(this.opts.dragged);
                      this.target = this.detach_elem(this.elem, evt);
                      this.create_placeholder(this.elem);
                    }
                }
            },

            drag_end: function(evt) {
                var pos = _event.get_pos(evt);
                var overlap = this.is_overlapping( pos)
                var elem_changed = false;
                var dragged_id = -1;
                if(overlap >= 0) {
                    dragged_id = this.change_elements(overlap);
                    var elem_changed = true;
                }
                this.attach_elem();
                this.destroy_placeholder();
                $('.'+this.opts.overlap).removeClass(this.opts.overlap);
                $('.'+this.opts.dragged).removeClass(this.opts.dragged);
                this.target = false;
                this.dragging = false;
                if(this.opts.after_drag) {
                    this.opts.after_drag(dragged_id, overlap);
                }

            },

            drag: function(evt) {
                if(this.dragging) {
                    pos = _event.get_pos(evt);
                    target = _event.target(evt);
                    this.move_elem(this.target, pos.x, pos.y);
                    var overlap = this.is_overlapping(pos)
                    this.highligh_overlap(overlap);
                }
            },

            highligh_overlap: function(idx) {
              $('.'+this.opts.overlap).removeClass(this.opts.overlap);
              if(idx >= 0)
              {
                $(this.li[idx]['elem']).addClass(this.opts.overlap);
              }
            },


            detach_elem: function(elem, evt) {
                pos = _event.get_pos(evt);
                target = $(elem).clone();
                $(elem).parent().append(target);
                elem_pos = $(elem).offset();
                parent_pos = $(elem).parent().offset();

                this.offset.x = pos.x - elem_pos.left + parent_pos.left ;
                this.offset.y = pos.y - elem_pos.top + parent_pos.top;
                
                $(target).css({position: 'absolute'});
                  
                this.move_elem(target, pos.x, pos.y);
                return target;
            },

            change_elements: function(pos) {
                var idx = this.elem_idx;
                if(idx < 0) return;
                var dragged = this.li[idx]['elem'];
                var overlap = this.li[pos]['elem'];
                

                $(dragged).removeClass('l' + idx).addClass('l' + pos);
                $(overlap).removeClass('l' + pos).addClass('l' + idx);

                this.li[idx]['elem'] = overlap;
                this.li[pos]['elem'] = dragged;

                $(dragged).insertBefore(overlap);
                $(this.placeholder).insertBefore(overlap);
                
                if(idx == 0)
                {
                    $(dragged).parent().prepend(overlap);
                }
                else
                {
                    $(overlap).insertAfter(this.li[idx - 1]['elem']);
                }



                this.elem_idx = pos;

                return idx;
            },

            is_overlapping: function(pos) {
                var overlap = -1;
                idx = this.index(pos);
                if(idx >= 0 && idx != this.elem_idx)
                {
                  overlap = idx;
                }
                return overlap;
            },

            index: function(pos) {
                var offset;
                for (var i = 0; i < this.li.length; i++) {
                    offset = this.li[i]['offset'];
                    if(offset.top <= pos.y && (offset.top+offset.height) >= pos.y) {
                        if(offset.left <= pos.x && (offset.left+offset.width) >= pos.x) {
                          return i;
                        }
                    }
                };

                return -1;
            },

            move_elem: function(elem, x, y) {
                elem_pos = $(elem).offset();
                var real_x = Math.floor(x - this.offset.x);
                    real_y = Math.floor(y - this.offset.y);

                $(elem).css({top: real_y + 'px',
                             left: real_x + 'px'});
            },

            attach_elem: function() {
                $(this.target).remove();
            },

            create_placeholder: function(elem) {
                var placeholder = $('<li>.</li>');
                $(placeholder).addClass(this.opts.placeholder);
                $(placeholder).css({width: $(elem).width(),
                                    height: $(elem).height()});

                $(placeholder).insertAfter($(elem));
                $(elem).hide();

                this.placeholder = placeholder;
                return placeholder;
            },

            destroy_placeholder: function() {
                if(this.placeholder) {
                    $(this.elem).show()
                    $(this.placeholder).remove();
                    this.placeholder = false;
                }
            }
        };

        return sortable;
    })();

})(jq);
