/*
  Treebeard : https://github.com/caneruguz/treebeard
 */

/*
 *  Ensure unique IDs among trees and leaves
 */
var idCounter = 0;
function getUID() {
    return idCounter++;
}



function AscByAttr (data) {
    return function(a,b){
        console.log(a, b, data);
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

function DescByAttr (data) {
    return function(a,b){
        console.log(a, b, data);
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

/*
 *  Indexes by id, shortcuts to the tree objects. Use example var item = Indexes[23];
 */
var Indexes = {};

/*
 *  Item constructor
 */
var Item = function(data) {
    if(data === undefined){
        this.data = {};
        this.id = getUID();
    } else {
        this.data = data;
        this.id = data.id || getUID();
    }
    this.depth = null;
    this.children =  [];
    this.parentID = null;
    this.kind = null;
};

/*
 *  Adds child item into the item
 */
Item.prototype.add = function(component) {
    component.parentID = this.id;
    component.depth = this.depth + 1;
    this.children.push(component);
    this.open = true;
    return this;
};

/*
 *  Move item from one place to another
 */
Item.prototype.move = function(to){
    var parentID = this.parentID;
    var toItem = Indexes[to];
    var parent = Indexes[parentID];
    toItem.add(this);
    parent.remove_child(parseInt(this.id));
};

/*
 *  Deletes itself
 */
Item.prototype.remove_self = function(){
    var parent = this.parentID;
    var removed = removeByProperty(parent.children, 'id', this.id);
    return this;
};

/*
 *  Deletes child, currently used for delete operations
 */
Item.prototype.remove_child = function(childID){
    var removed = removeByProperty(this.children, 'id', childID);
    return this;
};

/*
 *  Returns next sibling
 */
Item.prototype.next = function(){
    var next, parent;
    parent = Indexes[this.parentID];
    for(var i =0; i < parent.children.length; i++){
        if(parent.children[i].id === this.id){
            next = parent.children[i+1];
        }
    }
    return next;
};

/*
 *  Returns previous sibling
 */
Item.prototype.prev = function(){
    var prev, parent;
    parent = Indexes[this.parentID];
    for(var i =0; i < parent.children.length; i++){
        if(parent.children[i].id === this.id){
            prev = parent.children[i-1];
        }
    }
    return prev;
};

/*
 *  Returns single child based on id
 */
Item.prototype.child = function(id){
    var child;
    for(var i =0; i < this.children.length; i++){
        if(this.children[i].id === id){
            child = this.children[i];
        }
    }
    return child;
};

/*
 *  Returns parent directly above
 */
Item.prototype.parent = function(){
    return Indexes[this.parentID];
};

Item.prototype.sort_children = function(type, attr){
    console.log(type, attr);
    if(type === "asc"){
        this.children.sort(AscByAttr(attr));
    }
    if(type === "desc"){
        this.children.sort(DescByAttr(attr));
    }
};

/*
 *  Helper function that removes an item from an array of items based on the value of an attribute of that item
 */
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

/*
 *  Publish/Subscribe for main events / components taken from Addy Osmani
 */
var Pubsub = {
    topics : {},
    token : -1,
    publish : function(topic, args){
        if ( !this.topics[topic] ) {
            return false;
        }
        var subscribers = this.topics[topic],
            len = subscribers ? subscribers.length : 0;
        while (len--) {
            subscribers[len].func( topic, args );
        }
        return this;
    },
    subscribe : function(topic, func){
        if (!this.topics[topic]) {
            this.topics[topic] = [];
        }
        var token = ( ++this.token ).toString();
        this.topics[topic].push({
            token: token,
            func: func
        });
        return token;
    },
    unsubscribe : function(token){
        for ( var m in this.topics ) {
            if ( this.topics[m] ) {
                for ( var i = 0, j = this.topics[m].length; i < j; i++ ) {
                    if ( this.topics[m][i].token === token ) {
                        this.topics[m].splice( i, 1 );
                        return token;
                    }
                }
            }
        }
        return this;
    }
};


/*
 *  Initialize and namespace the module
 */
var Treebeard = {};

/*
 *  An example of the data model, used for demo.
 */
Treebeard.model = function (level){
    return {
        indent :  level,
        id : Math.floor(Math.random()*(100)),
        load : true,
        status : true,
        show : true,
        loadUrl : "small.json",
        person  : "JohnnyB. Goode",
        title  :  "Around the World in 80 Days",
        date : "Date",
        filtered : false,
        children : []
    };
};

/*
 *  Grid methods
 */
Treebeard.controller = function () {
    var self = this;
    this.data = m.request({method: "GET", url: "small.json"})
        .then(function(value){self.treeData = self.buildTree(value); })
        .then(function(){ self.flatten(self.treeData.children);})
        .then(function(){
            console.log(self.flatData);
            console.log(Indexes);
            self.calculate_visible();
            self.calculate_height();
            console.log("Treedata", self.treeData);
        });
    this.flatData = [];
    this.treeData = {};
    this.filterText = m.prop("");
    this.showRange = [];
    this.filterOn = false;
    this.sort = { ascOn : false, descOn : false, column : "" };
    this.options = Treebeard.options;
    this.rangeMargin = 0;
    this.detailItem = {};
    this.visibleCache = 0;
    this.visibleIndexes = [];
    this.visibleTop = [];
    this.lastLocation = 0; // The last scrollTop location, updates on every scroll.
    this.lastNonFilterLocation = 0; //The last scrolltop location before filter was used.
    this.currentPage = m.prop(1);

    /*
     *  Rebuilds the tree data with an API
     */
    this.buildTree = function(data, parent){
        var tree, children, len, child;
        if (Array.isArray(data)) {
            tree = new Item();
            children = data;
        } else {
            tree = new Item(data);
            children = data.children;
            tree.depth = parent.depth+1;
            tree.kind = data.kind;
        }
        if(children){
            len = children.length;
            for (var i = 0; i < len; i++) {
                child = self.buildTree(children[i], tree);
                tree.add(child);
            }
        }
        return tree;
    };


    /*
     *  Turns the tree structure into a flat index of nodes
     */
    this.flatten = function(value, visibleTop){
        self.flatData = [];
        var openLevel = 1 ;
        var recursive = function redo(data, show, topLevel) {
            var length = data.length;
            for (var i = 0; i < length; i++) {
                console.log( "openLevel", openLevel);
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
                    console.log("Redo");
                    self.calculate_visible(visibleTop);
                    self.calculate_height();
                    m.redraw();
                }
            }
        };
        recursive(value, true, true);
        return value;
    };

    /*
     *  Initializes after the view
     */
    this.init = function(el, isInit){
        if (isInit) { return; }
        var containerHeight = $('#tb-tbody').height();
        self.options.showTotal = Math.floor(containerHeight/self.options.rowHeight);
        console.log("ShowTotal", self.options.showTotal);
        $('#tb-tbody').scroll(function(){
            // snap scrolling to intervals of items;
            // get current scroll top
            var scrollTop = $(this).scrollTop();
            // are we going up or down? Compare to last scroll location
            var diff = scrollTop - self.lastLocation;
            // going down, increase index
            if (diff > 0 && diff < self.options.rowHeight){
                $(this).scrollTop(self.lastLocation+self.options.rowHeight);
            }
            // going up, decrease index
            if (diff < 0 && diff > -self.options.rowHeight){
                $(this).scrollTop(self.lastLocation-self.options.rowHeight);
            }

            var itemsHeight = self.calculate_height();
            var innerHeight = $(this).children('.tb-tbody-inner').outerHeight();
            scrollTop = $(this).scrollTop();
            var location = scrollTop/innerHeight*100;
            console.log("Visible cache", self.visibleCache);
            var index = Math.round(location/100*self.visibleCache);
            self.rangeMargin = Math.round(itemsHeight*(scrollTop/innerHeight));
            self.refresh_range(index);
            m.redraw(true);
            self.lastLocation = scrollTop;
       });
        $(".tdTitle").draggable({ helper: "clone" });
        $(".tb-row").droppable({
            tolerance : "pointer",
            hoverClass : "highlight",
            drop: function( event, ui ) {
                var to = $(this).attr("data-id");
                var from = ui.draggable.attr("data-id");
                var item = Indexes[from];
                if (to !== from ){
                    item.move(to);
                    self.flatten(self.treeData.children, self.visibleTop);
                }
            }
        });
    };

    /*
     *  Deletes a single node from view, deletes from the tree
     */
    this.delete_node = function(parentID, itemID  ){
        console.log(parentID, itemID);
        var parent = Indexes[parentID];
        parent.remove_child(itemID);
        console.log("Parent after", parent);
        if(self.options.onDelete){
            self.options.onDelete.call(parent);
        }
        console.log("Treedata", self.treeData);
        self.flatten(self.treeData.children, self.visibleTop);
    };

    /*
     *  Adds a new node;
     */
    this.add_node = function(parentID){
        console.log(parentID);
        // add to the tree and reflatten
        var newItem = new Treebeard.model();
        var item = new Item(newItem);
        var parent = Indexes[parentID];
        console.log(parent);
        parent.add(item);
        console.log("parent after", parent);
        self.flatten(self.treeData.children, self.visibleTop);
    };


    /*
     *  Returns the index of an item in the flat row list
     */
    this.return_index = function(id){
        var len = self.flatData.length;
        for(var i = 0; i < len; i++) {
            var o = self.flatData[i];
            if(o.row.id === id) {
                return i;
            }
        }
    };

    /*
     *  Returns whether a single row contains the filtered items
     */
    this.row_filter_result = function(row){
        var filter = self.filterText().toLowerCase();
        var titleResult = row.title.toLowerCase().indexOf(filter);
        if (titleResult > -1){
            return true;
        } else {
            return false;
        }
    };

    /*
     *  runs filter functions and resets depending on whether there is a filter word
     */
    this.filter = function(e){
        m.withAttr("value", self.filterText)(e);
        var filter = self.filterText().toLowerCase();
        if(filter.length === 0){
            self.filterOn = false;
            self.calculate_visible(0);
            self.calculate_height();
            m.redraw(true);
            // restore location of scroll
            $('#tb-tbody').scrollTop(self.lastNonFilterLocation);
        } else {
            if(!self.filterOn){
                self.filterOn = true;
                self.lastNonFilterLocation = self.lastLocation;
            }
            console.log("Visible Top", self.visibleTop);
            var index = self.visibleTop;
            if(!self.visibleTop){
                index = 0;
            }
            self.calculate_visible(index);
            self.calculate_height();
            m.redraw(true);
        }
    };


    /*
     *  During pagination jumps to specific page
     */
    this.jump_to_page = function(e){
        m.withAttr("value", self.currentPage)(e);
        var page = parseInt(self.currentPage());
        //vvvvv THIS GETS THE INDEX OF THE FULL LIST
        var index = (self.options.showTotal*(page-1));
        self.refresh_range(self.visibleIndexes[index]);
    };


    /*
     *  Toggles whether a folder is collapes or open
     */
    this.toggle_folder = function(topIndex, index) {
        var len = self.flatData.length;
        var tree = Indexes[self.flatData[index].id];
        var item = self.flatData[index];

        if (item.row.kind === "folder" && item.row.children.length === 0) {
            // lazyloading
            m.request({method: "GET", url: "small.json"})
                .then(function (value) {
                    var child, i;
                    for (i = 0; i < value.length; i++) {
                        child = self.buildTree(value[i], tree);
                        tree.add(child);
                    }
                    tree.data.open = true;
                })
                .then(function(){
                    self.flatten(self.treeData.children, topIndex);
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
                if (item.row.open) {
                    // closing
                    o.row.show = false;
                } else {
                    // opening
                    o.row.show = true;
                    if(!o.row.open){
                        skipLevel = o.depth;
                        skip = true;
                    }
                }
            }
            item.row.open = !item.row.open;
            self.calculate_visible(topIndex);
            self.calculate_height();
            m.redraw(true);
        }
    };

    /*
     *  Sets the item that willl be shared on the right side with details
     */
    this.set_detail_item = function(index){
        self.detailItem = self.flatData[index].row;
        m.redraw(true);
    };

    /*
     *  Sorting toggles, incomplete -- TODO: Finish Sorting
     */
    this.ascToggle = function(){
        var type = $(this).attr('data-direction');
        var parent = $(this).parent();
        // turn all styles off
        $('.asc-btn, .desc-btn').addClass('tb-sort-inactive');
        if(self.sort[type]){
            // turn off
            self.sort[type] = false;
        } else {
            // turn on
            self.treeData.sort_children(type,"title");
            parent.children('.'+type+'-btn').removeClass('tb-sort-inactive');
            self.sort[type]= true;
            self.flatten(self.treeData.children, 0);

        }
        self.ascOn = !self.ascOn;
    };


//    this.order = function (type){

//        +            var recursive = function redo(data){
//            +                data.map( function(item, index, array){
//                +                    if(type === "asc"){
//                    +                        item.children.sort(titleASC);
//                    +                    } else {
//                    +                        item.children.sort(titleDESC);
//                    +                    }
//                +                    if(item.children.length > 0 ){ redo(item.children) } ;
//                +                });
//            +            }
//            +            // First reorder the top data
//            +            if(type === "asc"){
//            +               self.data().sort(titleASC);
//            +            } else {
//            +                self.data().sort(titleDESC);
//            +            }
//        +            // Then start recursive loop
//            +            recursive(self.data());
//


    /*
     *  Calculate how tall the wrapping div should be so that scrollbars appear properly
     */
    this.calculate_height = function(){
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
    };

    /*
     *  Calculates total number of visible items to return a row height
     */
    this.calculate_visible = function(rangeIndex){
        rangeIndex = rangeIndex || 0;
        var len = self.flatData.length;
        var total = 0;
        self.visibleIndexes = [];
        for ( var i = 0; i < len; i++){
            var o = self.flatData[i].row;
            if(self.filterOn){
                if(self.row_filter_result(o)) {
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
    };

    /*
     *  Refreshes the view to start the the location where begin is the starting index
     */
    this.refresh_range = function(begin){
        var len = self.visibleCache;
        console.log('vislen', len);
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

    /*
     *  Changes view to continous scroll
     */
     //TODO Remove overflow, scroll
    this.toggle_scroll = function(){
        self.options.paginate = false;
        $('#tb-tbody').css('overflow', 'scroll');
        $('.tb-paginate').removeClass('active');
        $('.tb-scroll').addClass('active');
    };

    /*
     *  Changes view to paginate
     */
     //TODO Remove overflow, hidden
    this.toggle_paginate = function(){
        self.options.paginate = true;
        $('#tb-tbody').css('overflow', 'hidden');
        $('.tb-scroll').removeClass('active');
        $('.tb-paginate').addClass('active');
        var first = self.showRange[0];
        var pagesBehind = Math.floor(first/self.options.showTotal);
        var firstItem = (pagesBehind*self.options.showTotal);
        self.currentPage(pagesBehind+1);
        self.refresh_range(firstItem);
    };

    /*
     *  During pagination goes up one page
     */
    this.page_up = function(){
        // get last shown item index and refresh view from that item onwards
        var last = self.showRange[self.options.showTotal-1];
        console.log("Last", last);
        if(last && last+1 < self.flatData.length){
            self.refresh_range(last+1);
            self.currentPage(self.currentPage()+1);
        }
    };

    /*
     *  During pagination goes down one page
     */
    this.page_down = function(){
        var firstIndex = self.showRange[0];
        // var visibleArray = self.visibleIndexes.map(function(visIndex){return visIndex;});
        var first = self.visibleIndexes.indexOf(firstIndex);
        //console.log(visibleArray);
        //console.log(first);
        if(first && first > 0) {
            self.refresh_range(first - self.options.showTotal);
            self.currentPage(self.currentPage()-1);
        }
    };


    /*
     *  conditionals for what to show for toggle state
     */
    this.subFix = function(item){
        if(item.children.length > 0 || item.kind === "folder"){
            if(item.children.length > 0 && item.open){
                return [
                    m("span.expand-icon-holder", m("i.fa.fa-minus-square-o", " ")),
                    m("span.expand-icon-holder", m("i.fa.fa-folder-o", " "))
                ];
            } else {
                return [
                    m("span.expand-icon-holder", m("i.fa.fa-plus-square-o", " ")),
                    m("span.expand-icon-holder", m("i.fa.fa-folder-o", " "))
                ];
            }
        } else {
            return [
                m("span.expand-icon-holder"),
                m("span.expand-icon-holder", m("i.fa."+item.icon, " "))
            ];
        }
    };
};


Treebeard.view = function(ctrl){
    console.log(ctrl.showRange);
    return [
        m('.gridWrapper.row', {config : ctrl.init},  [
            m('.col-sm-8', [
                m(".tb-table", [
                    m('.tb-head',[
                        m(".row", [
                            m(".col-xs-8", [
                                m("input.form-control[placeholder='filter'][type='text']",{
                                    style:"width:300px;display:inline; margin-right:20px;",
                                    onkeyup: ctrl.filter,
                                    value : ctrl.filterText()}
                                ),
                                m('span', { style : "width: 120px"}, "Visible : " + ctrl.visibleCache)
                            ])
                        ])
                    ]),
                    m(".tb-rowTitles.m-t-md", [
                        ctrl.options.columns.map(function(col){
                            var sortView = "";
                            if(col.sort){
                                sortView =  [
                                     m('i.fa.fa-sort-asc.tb-sort-inactive.asc-btn', {
                                         onclick: ctrl.ascToggle, "data-direction": "asc"
                                     }),
                                     m('i.fa.fa-sort-desc.tb-sort-inactive.desc-btn', {
                                         onclick: ctrl.ascToggle, "data-direction": "desc"
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
                                ctrl.showRange.map(function(item){
                                    var indent = ctrl.flatData[item].depth;
                                    var row = ctrl.flatData[item].row;
                                    var cols = ctrl.options.columns;
                                    var padding, css;
                                    if(ctrl.filterOn){
                                        padding = 0;
                                    } else {
                                        padding = indent*20;
                                    }
                                    if(row.id === ctrl.detailItem.id){ css = "tb-row-active"; } else { css = ""; }
                                    return  m(".tb-row", {
                                        class : css,
                                        "data-id" : row.id,
                                        "data-level": indent,
                                        "data-index": item,
                                        style : "height: "+ctrl.options.rowHeight+"px;",
                                        onclick : function(){
                                            ctrl.set_detail_item(item);
//                                            ctrl.options.onClick.call(Indexes[row.id]);
                                            Pubsub.publish('itemclick',Indexes[row.id] );
                                        }}, [
                                        ctrl.options.columns.map(function(col, index) {
                                            var cell;
                                            if(index === 0){
                                               cell = m(".tb-td.tdTitle", {
                                                    "data-id" : row.id,
                                                    style : "padding-left: "+padding+"px; width:"+cols[0].width },  [
                                                    m("span.tdFirst", {
                                                            onclick: function(){ ctrl.toggle_folder(ctrl.visibleTop, item); }},
                                                        ctrl.subFix(row)),
                                                    m("span", row.id+" "),
                                                    m("span.title-text", row[col.data]+" ")
                                               ]);
                                            } else if(col.title === "Actions"){
                                                cell = m(".tb-td", { style : "width:"+cols[2].width }, [
                                                    m("button.btn.btn-danger.btn-xs", {
                                                            "data-id" : row.id,
                                                            onclick: function(){ ctrl.delete_node(row.parent, row.id ); }},
                                                        " X "),
                                                    m("button.btn.btn-success.btn-xs", {
                                                        "data-id" : row.id,
                                                        onclick: function(){ ctrl.add_node(row.id);}
                                                    }," Add "),
                                                    m("button.btn.btn-info.btn-xs", {
                                                            "data-id" : row.id,
                                                            onclick: function(){
                                                                var selector = '.tb-row[data-id="'+row.id+'"]';
                                                                $(selector).css('font-weight', 'bold');
                                                                console.log(selector);
                                                            }},
                                                        "?")
                                                ]);
                                            } else {
                                                cell = m(".tb-td", { style : "width:"+cols[1].width }, [
                                                    m('span', row[col.data])
                                                ]);
                                            }
                                            return cell;
                                        })

                                    ]);
                                })
                            ])

                        ])
                    ]),
                    m('.tb-footer', [
                        m(".row", [
                            m(".col-xs-4",
                                m('.btn-group.padder-10', [
                                    m("button.btn.btn-default.btn-sm.active.tb-scroll",
                                        { onclick : ctrl.toggle_scroll },
                                        "Scroll"),
                                    m("button.btn.btn-default.btn-sm.tb-paginate",
                                        { onclick : ctrl.toggle_paginate },
                                        "Paginate")
                                ])
                            ),
                            m('.col-xs-8', [ m('.padder-10', [
                                (function(){
                                    if(ctrl.options.paginate){
                                        return m('.pull-right', [
                                            m('button.btn.btn-default.btn-sm',
                                                { onclick : ctrl.page_down},
                                                [ m('i.fa.fa-chevron-left')]),
                                            m('input.h-mar-10',
                                                {
                                                    type : "text",
                                                    style : "width: 30px;",
                                                    onkeyup: ctrl.jump_to_page,
                                                    value : ctrl.currentPage()
                                                }
                                            ),
                                            m('button.btn.btn-default.btn-sm',
                                                { onclick : ctrl.page_up},
                                                [ m('i.fa.fa-chevron-right')
                                            ])
                                        ]);
                                    }
                                }())
                            ])])
                        ])
                    ])
                ])
            ]),
            m('.col-sm-4', [
                m('.tb-details', [
                    m('h2', ctrl.detailItem.title),
                    m('h4.m-t-md', ctrl.detailItem.person),
                    m('p.m-t-md', ctrl.detailItem.desc),
                    m('i.m-t-md', ctrl.detailItem.date)
                ])
            ])
        ])
    ];

};

/*
 *  Starts treebard with user options;
 */
Treebeard.run = function(element, options){
    Treebeard.options = options;
    m.module(element, Treebeard);
};

/*
 *  User defined options
 */
var options = {
    rowHeight : 35,
    showTotal : 15,
    paginate : false,
    lazyLoad : false,
    columns : [
        {
            title: "Title",
            width : "60%",
            data : "title",
            sort : true
        },
        {
            title: "Author",
            width : "30%",
            data : "person",
            sort : true
        },
        {
            title: "Actions",
            width : "10%",
            sort : false
        }
    ],
    onDelete : function(){
        console.log(this);
    },
    onClick : function(){

//        console.log("This", this);
//        console.log("Next", this.next());
//        console.log("Parent", this.parent());
    },
    itemclick : function(){

    }
};

function logger(topic, item){
    console.log("topic", topic);
    console.log("Item:", item);
}
var myLogger = Pubsub.subscribe('itemclick', logger);

setTimeout(function(){
    console.log("Time out");
    console.log(myLogger);
    Pubsub.unsubscribe(myLogger);
}, 5000);
/*
 *  User defined code to implement Treebeard anywhere on the page.
 */
Treebeard.run(document.getElementById("grid"), options);