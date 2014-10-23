 //
 //    Treebeard : hierarchical grid built with Mithril
 //    https://github.com/caneruguz/treebeard
 //

;(function (global, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory();
    } else {
        // Browser globals (root is window)
        global.Treebeard = factory();
    }
}(this, function () {

     function log(){

     }

    // Create unique ids
    //
    var idCounter = 0;
    function getUID() {
        return idCounter++;
    }
     // Check if variable is function
     //
    function isFunction(x) {
        return Object.prototype.toString.call(x) === '[object Function]';
    }
     // Return string if variable is truthy whether its a function or string
     //
    function FunctionOrString(x){
        if(!x){
            return "";
        }
        if(isFunction(x)){
            return x();
        } else {
            return x;
        }
    }

     // Sorts ascending based on any attribute on data
     //
    function AscByAttr (data) {
        return function _compare(a,b){
            var titleA = a.data[data].toLowerCase().replace(/\s+/g, " ");
            var titleB = b.data[data].toLowerCase().replace(/\s+/g, " ");
            if (titleA < titleB){
                return -1;
            }
            if (titleA > titleB){
                return 1;
            }
            return 0;
        };
    }

     // Sorts descending based on any attribute on data
     //
    function DescByAttr (data) {
        return function _compare(a,b){
            var titleA = a.data[data].toLowerCase().replace(/\s/g, '');
            var titleB = b.data[data].toLowerCase().replace(/\s/g, '');
            if (titleA > titleB){
                return -1;
            }
            if (titleA < titleB){
                return 1;
            }
            return 0;
        };
    }

     // Helper function that removes an item from an array of items based on the value of an attribute of that item
     //
    function removeByProperty(arr, attr, value){
        var i = arr.length;
        while(i--){
            if(arr[i] && arr[i].hasOwnProperty(attr) && (arguments.length > 2 && arr[i][attr] === value )){
                arr.splice(i,1);
                return true;
            }
        }
        return false;
    }

     // Indexes by id, shortcuts to the tree objects. Use example: var item = Indexes[23];
     //
    var Indexes = {};

     // Item constructor
     //
    var Item = function _item(data) {
        if(data === undefined){
            this.data = {};
            this.id = getUID();
        } else {
            this.data = data;
            this.id = data.id || getUID();
        }
        this.depth = 0;
        this.children =  [];
        this.parentID = null;
        this.kind = null;
    };

     // Adds child item into the item
     //
    Item.prototype.add = function _item_add(component) {
        component.parentID = this.id;
            component.depth = this.depth + 1;
        this.children.push(component);
        this.open = true;
        return this;
    };

     // Move item from one place to another
     //
    Item.prototype.move = function _item_move(to){
        var toItem = Indexes[to];
        var parentID = this.parentID;
        var parent = Indexes[parentID];
        toItem.add(this);
        if(parentID > -1){
            parent.remove_child(parseInt(this.id));
        }
    };

     // Deletes itself
     //
    Item.prototype.remove_self = function _item_remove_self(){
            var parent = this.parent();
            var removed = removeByProperty(parent.children, 'id', this.id);
            return this;
    };

     // Deletes child, currently used for delete operations
     //
    Item.prototype.remove_child = function _item_remove_child(childID){
        var removed = removeByProperty(this.children, 'id', childID);
        return this;
    };

     // Returns next sibling
     //
    Item.prototype.next = function _item_next(){
        var next, parent;
        parent = Indexes[this.parentID];
        for(var i =0; i < parent.children.length; i++){
            if(parent.children[i].id === this.id){
                next = parent.children[i+1];
            }
        }
        return next;
    };

     // Returns previous sibling
     //
    Item.prototype.prev = function _item_prev(){
        var prev, parent;
        parent = Indexes[this.parentID];
        for(var i =0; i < parent.children.length; i++){
            if(parent.children[i].id === this.id){
                prev = parent.children[i-1];
            }
        }
        return prev;
    };

     // Returns single child based on id
     //
    Item.prototype.child = function _item_child(id){
        var child;
        for(var i =0; i < this.children.length; i++){
            if(this.children[i].id === id){
                child = this.children[i];
            }
        }
        return child;
    };

     // Returns parent directly above
     //
    Item.prototype.parent = function _item_parent(){
        return Indexes[this.parentID];
    };

    Item.prototype.sort_children = function _item_sort(type, attr){
        if(type === "asc"){
            this.children.sort(AscByAttr(attr));
        }
        if(type === "desc"){
            this.children.sort(DescByAttr(attr));
        }
    };

     // Initialize and namespace the module
     //
    var Treebeard = {};

     // An example of the data model, used for demo.
     //
    Treebeard.model = function _treebeard_model(level){
        return {
            id : Math.floor(Math.random()*(10000)),
            load : true,
            status : true,
            show : true,
            loadUrl : "small.json",
            person  : "JohnnyB. Goode",
            name  :  "Around the World in 80 Days",
            date : "Date",
            filtered : false,
            kind : "file",
            children : []
        };
    };

     // Grid methods
     //
    Treebeard.controller = function _treebeard_controller() {
        // private variables 
        var self = this;        // Treebard.controller
        var _sort = { asc : false, desc : false, column : "" }; // Temp variables for sorting
        var _lastLocation = 0; // The last scrollTop location, updates on every scroll.
        var _lastNonFilterLocation = 0; //The last scrolltop location before filter was used.

        // public variables
        this.flatData = [];
        this.treeData = {};
        this.filterText = m.prop("");
        this.showRange = [];    // Array of indexes that the range shows
        this.options = Treebeard.options;
        this.selected = undefined;      // The row selected on click.  
        this.rangeMargin = 0;   // Top margin, required for proper scrolling
        this.visibleCache = 0;  // Total number of viewable items (may or may not be visible on the screen)
        this.visibleIndexes = [];  // List of items viewable as a result of an operation like filter. 
        this.visibleTop = [];      // The first visible item. 
        this.currentPage = m.prop(1); // for pagination
        this.dropzone = null;       // Treebeard's own dropzone object
        this.droppedItem = {};      // Cache of the dropped item 
        this.filterOn = false;  // Filter state for use across the app

        // Rebuilds the tree data with an API
         //
        this.build_tree = function _build_tree(data, parent){
            var tree, children, len, child;
            if (Array.isArray(data)) {
                tree = new Item();
                children = data;
            } else {
                tree = new Item(data);
                if(typeof data.data !== "undefined"){
                    children = data.data[0].children;
                }else{
                    children = data.children;
                }
                tree.depth = parent.depth+1;
                tree.kind = data.kind;
            }
            if(children){
                len = children.length;
                for (var i = 0; i < len; i++) {
                    child = self.build_tree(children[i], tree);
                    tree.add(child);
                }
            }
            return tree;
        };

         // Turns the tree structure into a flat index of nodes
         //
        this.flatten = function _flatten(value, visibleTop){
            self.flatData = [];
            var openLevel = 1 ;
            var recursive = function redo(data, show, topLevel) {
                var length = data.length;
                for (var i = 0; i < length; i++) {
                    if(openLevel && data[i].depth <= openLevel ){
                        show = true;
                    }
                    var children = data[i].children;
                    var childIDs = [];
                    var flat = {
                        id: data[i].id,
                        depth : data[i].depth,
                        row: data[i].data
                    };
                    for(var j = 0; j < data[i].children.length; j++){
                        childIDs.push(data[i].children[j].id);
                    }
                    flat.row.children = childIDs;
                    flat.row.show = show;
                    if(data[i].children.length > 0 && !data[i].data.open ){
                        show = false;
                        if(openLevel > data[i].depth) { openLevel = data[i].depth; }
                    }
                    self.flatData.push(flat); // add to flatlist
                    if (children.length > 0) {
                        redo(children, show, false);
                    }
                    Indexes[data[i].id] = data[i];
                    if(topLevel && i === length-1){
                        _calculate_visible(visibleTop);
                        _calculate_height();
                        m.redraw();
                    }
                }
            };
            recursive(value, true, true);
            return value;
        };

        // Helper function to redraw if user makes changes to the item (like deleting through a hook)
        this.redraw = function _redraw(){
            self.flatten(self.treeData.children, self.visibleTop);
        };


        // Initializes after the view
         //
        this.init = function _init(el, isInit){
            if (isInit) { return; }
            var containerHeight = $('#tb-tbody').height();
            self.options.showTotal = Math.floor(containerHeight/self.options.rowHeight);
            $('#tb-tbody').scroll(function _scroll_hook(){
                var scrollTop = $(this).scrollTop();                    // get current scroll top
                var diff = scrollTop - _lastLocation;                    //Compare to last scroll location
                if (diff > 0 && diff < self.options.rowHeight){         // going down, increase index
                    $(this).scrollTop(_lastLocation+self.options.rowHeight);
                }
                if (diff < 0 && diff > -self.options.rowHeight){       // going up, decrease index     
                    $(this).scrollTop(_lastLocation-self.options.rowHeight);
                }
                var itemsHeight = _calculate_height();
                var innerHeight = $(this).children('.tb-tbody-inner').outerHeight();
                scrollTop = $(this).scrollTop();
                var location = scrollTop/innerHeight*100;
                var index = Math.round(location/100*self.visibleCache);
                self.rangeMargin = Math.round(itemsHeight*(scrollTop/innerHeight));
                self.refresh_range(index);
                m.redraw(true);
                _lastLocation = scrollTop;
            });
            if(self.options.allowMove){
                move_on();
            }
            if(self.options.uploads){ _apply_dropzone(); }
        };

        function move_on (){
            $(".td-title").draggable({ helper: "clone" });
            $(".tb-row").droppable({
                tolerance : "touch",
                cursor : "move",
                out: function ui_out( event, ui ) {
                    $('.tb-row.tb-h-success').removeClass('tb-h-success');
                    $('.tb-row.tb-h-error').removeClass('tb-h-error');
                },
                over: function _ui_over( event, ui ) {
                    var to = $(this).attr("data-id");
                    var from = ui.draggable.attr("data-id");
                    var toItem = Indexes[to];
                    var item = Indexes[from];
                    if(to !== from && self.options.movecheck(toItem, item)) {
                        $(this).addClass('tb-h-success');
                    } else {
                        $(this).addClass('tb-h-error');
                    }
                },
                drop: function _ui_drop( event, ui ) {
                    var to = $(this).attr("data-id");
                    var from = ui.draggable.attr("data-id");
                    var toItem = Indexes[to];
                    var item = Indexes[from];
                    if(to !== from){
                        if(self.options.movecheck.call(self, toItem, item)){
                            item.move(to);
                            self.flatten(self.treeData.children, self.visibleTop);
                            if(self.options.onmove){
                                self.options.onmove(toItem, item);
                            }
                        } else {
                            alert("You can't move your item here.");
                        }
                    }

                }
            });
        }
        function move_off (){
            $(".td-title").draggable("destroy");
            $(".tb-row").droppable("destroy");
        }
         // Deletes item from tree and refreshes view
         //
        this.delete_node = function _delete_node(parentID, itemID  ){
            var item = Indexes[itemID];
            var itemcopy = $.extend({}, item);
            $.when(self.options.deletecheck(item)).done(function _resolve_delete_check(check){
                if(check){
                    var parent = Indexes[parentID];
                    parent.remove_child(itemID);
                    self.flatten(self.treeData.children, self.visibleTop);
                    if(self.options.ondelete) {
                        self.options.ondelete.call(self, itemcopy);
                    }
                }
            });

        };

         // Adds a new node;
         //
        this.add_node = function _add_node(parentID){
            var newItem = new Treebeard.model();
            var item = new Item(newItem);
            var parent = Indexes[parentID];
            parent.add(item);
            self.flatten(self.treeData.children, self.visibleTop);
        };

         // Returns the object from the tree
         //
        this.find = function _find(id){
            return Indexes[id];
        };

         // Returns the index of an item in the flat row list
         //
        function _return_index(id){
            var len = self.flatData.length;
            for(var i = 0; i < len; i++) {
                var o = self.flatData[i];
                if(o.row.id === id) {
                    return i;
                }
            }
        }

         // Returns whether a single row contains the filtered items
         //
        function _row_filter_result(row){
            var filter = self.filterText().toLowerCase();
            var titleResult = row.title.toLowerCase().indexOf(filter);
            if (titleResult > -1){
                return true;
            } else {
                return false;
            }
        }

         // runs filter functions and resets depending on whether there is a filter word
         //
        this.filter = function _filter(e){
            m.withAttr("value", self.filterText)(e);
            var filter = self.filterText().toLowerCase();
            if(filter.length === 0){
                self.filterOn = false;
                _calculate_visible(0);
                _calculate_height();
                m.redraw(true);
                $('#tb-tbody').scrollTop(_lastNonFilterLocation); // restore location of scroll
                if(self.options.onfilterreset){
                    self.options.onfilterreset.call(self, filter);
                }
            } else {
                if(!self.filterOn){
                    self.filterOn = true;
                    _lastNonFilterLocation = _lastLocation;
                }
                var index = self.visibleTop;
                if(!self.visibleTop){
                    index = 0;
                }
                _calculate_visible(index);
                _calculate_height();
                m.redraw(true);
                if(self.options.onfilter){
                    self.options.onfilter.call(self, filter);
                }
            }
        };

         // Toggles whether a folder is collapes or open
         //
        this.toggle_folder = function _toggle_folder(topIndex, index, event) {
            var len = self.flatData.length;
            var tree = Indexes[self.flatData[index].id];
            var item = self.flatData[index];
            if (self.options.lazyLoad && item.row.kind === "folder" && item.row.children.length === 0) {
                $.when(self.options.resolve_lazyload_url(self, tree)).done(function _resolve_lazyload_done(url){
                    m.request({method: "GET", url: url})
                        .then(function _geturl_buildtree(value) {
                            var child, i;
                            for (i = 0; i < value.length; i++) {
                                child = self.build_tree(value[i], tree);
                                tree.add(child);
                            }
                            tree.data.open = true;
                        })
                        .then(function _geturl_flatten(){
                            self.flatten(self.treeData.children, topIndex);
                        });
                });
            } else {
                var skip = false;
                var skipLevel = item.depth;
                var level = item.depth;
                for (var i = index + 1; i < len; i++) {
                    var o = self.flatData[i];
                    if (o.depth <= level) {break;}
                    if(skip && o.depth > skipLevel){ continue;}
                    if(o.depth === skipLevel){ skip = false; }
                    if (item.row.open) {                    // closing
                        o.row.show = false;
                    } else {                                 // opening
                        o.row.show = true;
                        if(!o.row.open){
                            skipLevel = o.depth;
                            skip = true;
                        }
                    }
                }
                item.row.open = !item.row.open;
                _calculate_visible(topIndex);
                _calculate_height();
                m.redraw(true);
            }
            if(self.options.ontogglefolder){
                self.options.ontogglefolder.call(self, tree, event);
            }
        };

         // Sorting toggles, incomplete (why incomplete?) 
         //
        this.ascToggle = function _ascToggle(){
            var type = $(this).attr('data-direction');
            var field = $(this).attr('data-field');
            var parent = $(this).parent();
            $('.asc-btn, .desc-btn').addClass('tb-sort-inactive');  // turn all styles off
            _sort.asc = false;
            _sort.desc = false;
            if(!_sort[type]){
               var counter = 0;
               var recursive = function redo(data){
                    data.map( function _map_toggle(item){
                        item.sort_children(type, field);
                        if(item.children.length > 0 ){ redo(item.children); }
                        counter++;
                    });
                };
                self.treeData.sort_children(type, field);           // Then start recursive loop
                recursive(self.treeData.children);
                parent.children('.'+type+'-btn').removeClass('tb-sort-inactive');
                _sort[type] = true;
                self.flatten(self.treeData.children, 0);
            }
        };

         // Calculate how tall the wrapping div should be so that scrollbars appear properly
         //
        function _calculate_height(){
            var itemsHeight;
            if(!self.paginate){
                var visible = self.visibleCache;
                itemsHeight = visible*self.options.rowHeight;
            }else {
                itemsHeight = self.options.showTotal*self.options.rowHeight;
                self.rangeMargin = 0;
            }
            $('.tb-tbody-inner').height(itemsHeight);
            return itemsHeight;
        }

         // Calculates total number of visible items to return a row height
         //
        function _calculate_visible(rangeIndex){
            rangeIndex = rangeIndex || 0;
            var len = self.flatData.length;
            var total = 0;
            self.visibleIndexes = [];
            for ( var i = 0; i < len; i++){
                var o = self.flatData[i].row;
                if(self.filterOn){
                    if(_row_filter_result(o)) {
                        total++;
                        self.visibleIndexes.push(i);
                    }
                } else {
                    if(o.show){
                        self.visibleIndexes.push(i);
                        total++;
                    }
                }

            }
            self.visibleCache = total;
            self.refresh_range(rangeIndex);
            return total;
        }

         // Refreshes the view to start the the location where begin is the starting index
         //
        this.refresh_range = function _refresh_range(begin){
            var len = self.visibleCache;
            var range = [];
            var counter = 0;
            self.visibleTop = begin;
            for ( var i = begin; i < len; i++){
                if( range.length === self.options.showTotal ){break;}
                var index = self.visibleIndexes[i];
                range.push(index);
                counter++;
            }
            self.showRange = range;
            m.redraw(true);
        };

         // Changes view to continous scroll
         //
        this.toggle_scroll = function _toggle_scroll(){
            self.options.paginate = false;
            //$('#tb-tbody').css('overflow', 'scroll');
            $('.tb-paginate').removeClass('active');
            $('.tb-scroll').addClass('active');
            self.refresh_range(0);
        };

         // Changes view to paginate
         //
        this.toggle_paginate = function _toggle_pagination(){
            self.options.paginate = true;
            $('.tb-scroll').removeClass('active');
            $('.tb-paginate').addClass('active');
            var firstIndex = self.showRange[0];
            var first = self.visibleIndexes.indexOf(firstIndex);
            var pagesBehind = Math.floor(first/self.options.showTotal);
            var firstItem = (pagesBehind*self.options.showTotal);
            self.currentPage(pagesBehind+1);
            self.refresh_range(firstItem);
        };

         // During pagination goes up one page
         //
        this.page_up = function _page_up(){
            // get last shown item index and refresh view from that item onwards
            var lastIndex = self.showRange[self.options.showTotal-1];
            var last = self.visibleIndexes.indexOf(lastIndex);
            if(last > -1 && last+1 < self.visibleCache){
                self.refresh_range(last+1);
                self.currentPage(self.currentPage()+1);
            }
        };

         // During pagination goes down one page
         //
        this.page_down = function _page_down(){
            var firstIndex = self.showRange[0];
            var first = self.visibleIndexes.indexOf(firstIndex);
            if(first && first > 0) {
                self.refresh_range(first - self.options.showTotal);
                self.currentPage(self.currentPage()-1);
            }
        };

         // During pagination jumps to specific page
         //
        this.go_to_page = function _go_to_page(value){
            if(value && value > 0 && value <= (Math.ceil(self.visibleIndexes.length/self.options.showTotal))) {
                var index = (self.options.showTotal * (value - 1));
                self.currentPage(value);
                self.refresh_range(index);
            }
        };

         // Apply dropzone to grid
         //
        function _apply_dropzone(){
            if(self.dropzone){ _destroy_dropzone(); }               // Destroy existing dropzone setup
            var eventList = ["drop", "dragstart", "dragend", "dragenter", "dragover", "dragleave", "addedfile", "removedfile", "thumbnail", "error", "processing", "uploadprogress", "sending", "success", "complete", "canceled", "maxfilesreached", "maxfilesexceeded"];
            var options = $.extend({
                init: function _dz_init() {
                    for (var i = 0; i < eventList.length; i++){
                        var ev = eventList[i];
                        if(self.options.dropzone[ev]){
                            var dropzone = this;
                            this.on(ev, function(arg) { self.options.dropzone[ev].call(dropzone, self, arg); });
                        }
                    }
                },
                accept : function _dz_accept(file, done){
                    console.log("Accept", this, self, file);
                    if(self.options.addcheck.call(this, self, self.droppedItem, file)){
                        $.when(self.options.resolve_upload_url.call(self, self.droppedItem))
                            .then(function _resolve_upload_url_then(newUrl){
                                if(newUrl){
                                    self.dropzone.url = newUrl;
                                }
                                return newUrl;
                            })
                            .done(function _resolve_upload_url_done(){
                                done();
                            });
                    } else {
                        alert("This isn't allowed");
                    }
                },
                drop : function _dz_drop(event){
                    var rowId =  $(event.target).closest('.tb-row').attr('data-id');
                    var item  = Indexes[rowId];
                    self.droppedItem = item;
                },
                success : function _dz_success(file, response){
                    var mockResponse = new Treebeard.model();
                    var mockTree = new Item(mockResponse);
                    self.droppedItem.add(mockTree);
                    self.flatten(self.treeData.children, self.visibleTop);
                    if(self.options.onadd){
                        self.options.onadd.call(this, self, self.droppedItem, file, response);
                    }
                }                
            }, self.options.dropzone);           // Extend default options
            self.dropzone = new Dropzone('#'+self.options.divID, options );            // Initialize dropzone
        }

         // Remove dropzone from grid
         //
        function _destroy_dropzone(){
            self.dropzone.destroy();
        }

        function _load_data(data){
            if (data instanceof Array){
                $.when(self.build_tree(data)).then(function _buildtree_then(value){
                    self.treeData = value;
                    Indexes[0] = value;
                    self.flatten(self.treeData.children);
                    return value;
                }).done(function _buildtree_done(){
                    _calculate_visible();
                    _calculate_height();
                });
            } else {
                m.request({method: "GET", url: data})
                    .then(function _request_buildtree(value){
                        self.treeData = self.build_tree(value);
                    })
                    .then(function _request_flatten(){
                        Indexes[0] = self.treeData; self.flatten(self.treeData.children);
                    })
                    .then(function _request_calculate(){
                        _calculate_visible();
                        _calculate_height();
                        console.log("FlatData", self.flatData);
                        console.log("treeData", self.treeData);
                    });
            }
        }
        _load_data(Treebeard.options.filesData);
    };

    Treebeard.view = function treebeard_view(ctrl){
        console.log(ctrl.showRange);
        return [
            m('.gridWrapper.row', {config : ctrl.init},  [
                m('.col-sm-8', [
                    m(".tb-table", [
                        (function ShowHeadA(){
                            if(ctrl.options.showFilter || ctrl.options.title){
                               return m('.tb-head',[
                                   m(".row", [
                                       m(".col-xs-6", [
                                           m("h3.tb-grid-title", FunctionOrString(ctrl.options.title))
                                       ]),
                                       m(".col-xs-6", [
                                           (function ShowFilterA(){
                                               if(ctrl.options.showFilter){
                                                   return m("input.form-control[placeholder='filter'][type='text']",{
                                                           style:"width:100%;display:inline;",
                                                           onkeyup: ctrl.filter,
                                                           value : ctrl.filterText()}
                                                   );
                                               }
                                           }())
                                       ])
                                   ])
                               ]);
                            }
                        }()),
                        m(".tb-row-titles.m-t-md", [
                            ctrl.options.columns.map(function _map_column_titles(col){
                                var sortView = "";
                                if(col.sort){
                                    sortView =  [
                                         m('i.fa.fa-sort-asc.tb-sort-inactive.asc-btn', {
                                             onclick: ctrl.ascToggle, "data-direction": "asc", "data-field" : col.data
                                         }),
                                         m('i.fa.fa-sort-desc.tb-sort-inactive.desc-btn', {
                                             onclick: ctrl.ascToggle, "data-direction": "desc", "data-field" : col.data
                                         })
                                    ];
                                }
                                return m('.tb-th', { style : "width: "+ col.width }, [
                                    m('span.padder-10', col.title),
                                    sortView
                                ]);
                            })
                        ]),
                        m("#tb-tbody", [
                            m('.tb-tbody-inner', [
                                m('', { style : "padding-left: 15px;margin-top:"+ctrl.rangeMargin+"px" }, [
                                    ctrl.showRange.map(function _map_range_view(item, index){
                                        var oddEvenClass = "tb-odd";
                                        if(index % 2 === 0){
                                            oddEvenClass = "tb-even";
                                        }
                                        var indent = ctrl.flatData[item].depth;
                                        var id = ctrl.flatData[item].id;
                                        var row = ctrl.flatData[item].row;
                                        var padding, css;
                                        if(ctrl.filterOn){
                                            padding = 0;
                                        } else {
                                            padding = indent*20;
                                        }
                                        if(id === ctrl.selected){ css = "tb-row-active"; } else { css = ""; }
                                        return  m(".tb-row", {
                                            "class" : css + " " + oddEvenClass,
                                            "data-id" : id,
                                            "data-level": indent,
                                            "data-index": item,
                                            "data-rIndex": index,
                                            style : "height: "+ctrl.options.rowHeight+"px;",
                                            onclick : function _row_click(event){
                                                ctrl.selected = id;
                                                if(ctrl.options.onselectrow){
                                                    ctrl.options.onselectrow.call(ctrl, Indexes[row.id], event);
                                                }
                                            }}, [
                                            ctrl.options.columns.map(function _map_columns_content(col) {
                                                var cell;
                                                cell = m(".tb-td", { style : "width:"+col.width }, [
                                                    m('span', row[col.data])
                                                ]);
                                                if(col.folderIcons === true){
                                                   cell = m(".tb-td.td-title", {
                                                        "data-id" : id,
                                                        style : "padding-left: "+padding+"px; width:"+col.width },  [
                                                        m("span.tdFirst", {
                                                            onclick: function _folder_toggle_click(event){
                                                                ctrl.toggle_folder(ctrl.visibleTop, item, event);
                                                            }},
                                                            (function _toggle_view(){
                                                                var itemTree = Indexes[row.id];
                                                                if(row.children.length > 0 || row.kind === "folder"){
                                                                    if(row.children.length > 0 && row.open){
                                                                        return [
                                                                            m("span.expand-icon-holder",
                                                                                m("i.fa.fa-minus-square-o", " ")
                                                                            ),
                                                                            m("span.expand-icon-holder",
                                                                                ctrl.options.resolve_icon.call(self, itemTree)
                                                                            )
                                                                        ];
                                                                    } else {
                                                                        return [
                                                                            m("span.expand-icon-holder",
                                                                                m("i.fa.fa-plus-square-o", " ")
                                                                            ),
                                                                            m("span.expand-icon-holder",
                                                                                ctrl.options.resolve_icon.call(self, itemTree)
                                                                            )
                                                                        ];
                                                                    }
                                                                } else {
                                                                    return [
                                                                        m("span.expand-icon-holder"),
                                                                        m("span.expand-icon-holder",
                                                                            ctrl.options.resolve_icon.call(self, itemTree)
                                                                        )
                                                                    ];
                                                                }
                                                            }())
                                                        ),
                                                        m("span.title-text", row[col.data]+" ")
                                                   ]);
                                                }
                                                if(col.actionIcons === true){
                                                    cell = m(".tb-td", { style : "width:"+col.width }, [
                                                        m("button.btn.btn-danger.btn-xs", {
                                                            "data-id" : id,
                                                            onclick: function _delete_click(){
                                                                ctrl.delete_node(row.parent, id);
                                                            }},
                                                            " X "),
                                                        m("button.btn.btn-success.btn-xs", {
                                                            "data-id" : id,
                                                            onclick: function _add_click(){ ctrl.add_node(id);}
                                                        }," Add ")
                                                    ]);
                                                }
                                                if(col.custom){
                                                    cell = m(".tb-td", { style : "width:"+col.width }, [
                                                        col.custom.call(row, col)
                                                    ]);
                                                }
                                                return cell;
                                            })

                                        ]);
                                    })
                                ])

                            ])
                        ]),
                        (function() {
                            if (ctrl.options.paginate || ctrl.options.paginateToggle) {
                                return m('.tb-footer', [
                                    m(".row", [
                                        m(".col-xs-4",
                                            (function _show_paginate_toggle() {
                                                if (ctrl.options.paginateToggle) {
                                                    return m('.btn-group.padder-10', [
                                                        m("button.btn.btn-default.btn-sm.active.tb-scroll",
                                                            { onclick : ctrl.toggle_scroll },
                                                            "Scroll"),
                                                        m("button.btn.btn-default.btn-sm.tb-paginate",
                                                            { onclick : ctrl.toggle_paginate },
                                                            "Paginate")
                                                    ]);
                                                }
                                            }())
                                        ),
                                        m('.col-xs-8', [ m('.padder-10', [
                                            (function _show_paginate(){
                                                if(ctrl.options.paginate){
                                                    var total_visible = ctrl.visibleIndexes.length;
                                                    var total = Math.ceil(total_visible/ctrl.options.showTotal);
                                                    return m('.pull-right', [
                                                        m('button.btn.btn-default.btn-sm',
                                                            { onclick : ctrl.page_down},
                                                            [ m('i.fa.fa-chevron-left')]),
                                                        m('input.h-mar-10',
                                                            {
                                                                type : "text",
                                                                style : "width: 30px;",
                                                                onkeyup: function(e){
                                                                    var page = parseInt(e.target.value);
                                                                    ctrl.go_to_page(page);
                                                                },
                                                                value : ctrl.currentPage()
                                                            }
                                                        ),
                                                        m('span', "/ "+total+" "),
                                                        m('button.btn.btn-default.btn-sm',
                                                            { onclick : ctrl.page_up},
                                                            [ m('i.fa.fa-chevron-right')
                                                            ])
                                                    ]);
                                                }
                                            }())
                                        ])])
                                    ])
                                ]);
                            }
                        }())


                    ])
                ])
            ])
        ];
    };

     // Starts treebard with user options;
     //
    Treebeard.run = function _treebeard_run(options){
        Treebeard.options = $.extend({
            divID : "myGrid",
            filesData : "small.json",
            rowHeight : 35,         // Pixel height of the rows, needed to calculate scrolls and heights
            showTotal : 15,         // Actually this is calculated with div height, not needed. NEEDS CHECKING
            paginate : false,       // Whether the applet starts with pagination or not.
            paginateToggle : false, // Show the buttons that allow users to switch between scroll and paginate.
            lazyLoad : false,       // If true should not load the sub contents of unopen files.
            uploads : true,         // Turns dropzone on/off.
            columns : [],           // Defines columns based on data
            showFilter : true,     // Gives the option to filter by showing the filter box.
            title : false,          // Title of the grid, boolean, string OR function that returns a string.
            allowMove : true,       // Turn moving on or off.
            onfilter : function(filterText){   // Fires on keyup when filter text is changed.
                // this = treebeard object;
                // filterText = the value of the filtertext input box.
                console.log("on filter: this", this, 'filterText', filterText);
            },
            onfilterreset : function(filterText){   // Fires when filter text is cleared.
                // this = treebeard object;
                // filterText = the value of the filtertext input box.
                console.log("on filter reset: this", this, 'filterText', filterText);
            },
            deletecheck : function(item){  // When user attempts to delete a row, allows for checking permissions etc.
                // this = treebeard object;
                // item = Item to be deleted.
            },
            ondelete : function(){  // When row is deleted successfully
                // this = treebeard object;
                // item = a shallow copy of the item deleted, not a reference to the actual item
                console.log("ondelete", this);
            },
            movecheck : function(to, from){ //This method gives the users an option to do checks and define their return
                // this = treebeard object;
                // from = item that is being moved
                // to = the target location
                console.log("movecheck: to", to, "from", from);
                return true;
            },
            onmove : function(to, from){  // After move happens
                // this = treebeard object;
                // to = actual tree object we are moving to
                // from = actual tree object we are moving
                console.log("onmove: to", to, "from", from);
            },
            addcheck : function(treebeard, item, file){
                // this = dropzone object
                // treebeard = treebeard object
                // item = item to be added to
                // file = info about the file being added
                console.log("Add check", this, treebeard, item, file);
                return true;
            },
            onadd : function(treebeard, item, file, response){
                // this = dropzone object;
                // item = item the file was added to
                // file = file that was added
                // response = what's returned from the server
                console.log("On add", this, treebeard, item, file, response);
            },
            onselectrow : function(row, event){
                // this = dropzone object
                // row = item selected
                // event = mouse click event object
                console.log("onselectrow", this, row, event);
            },
            ontogglefolder : function(item, event){
                // this = dropzone object
                // item = toggled folder item
                // event = mouse click event object
                console.log("ontogglefolder", this, item, event);
            },
            dropzone : {            // All dropzone options.
                url: "http://www.torrentplease.com/dropzone.php",  // When users provide single URL for all uploads
                dragstart : function(treebeard, event){     // An example dropzone event to override.
                    // this = dropzone object
                    // treebeard = treebeard object
                    // event = event passed in
                }
            },
            resolve_icon : function(item){     //Here the user can interject and add their own icons, uses m()
                // this = treebeard object;
                // Item = item acted on
                if(item.kind === "folder"){
                    return m("i.fa.fa-folder-o", " ");
                }else {
                    if(item.data.icon){
                        return m("i.fa."+item.icon, " ");
                    } else {
                        return m("i.fa.fa-file ");
                    }
                }
            },
            resolve_upload_url : function(item){  // Allows the user to calculate the url of each individual row
                // this = treebeard object;
                // Item = item acted on
                return "/upload";
            },
            resolve_lazyload_url : function(item){
                // this = treebeard object;
                // Item = item acted on
                return "small.json";
            }

        }, options);
        m.module(document.getElementById(Treebeard.options.divID), Treebeard);
    };

    return Treebeard;
}));
