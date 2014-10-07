
// Initialize the module
var grid = {};

// Set property for data and get the data
grid.model = function (level){
    return {
        level :  level,
        id : Math.floor(Math.random()*(100)),
        load : true,
        status : true,
        show : true,
        loadUrl : "small.json",
        name  : "JohnnyB. Goode",
        title  :  "Around the World in 80 Days",
        date : "Date",
        filtered : false,
        children : []
    };
};

grid.layout = {
    rowHeight : 35,
    showTotal : 15,
    paginate : false,
    lazyLoad : false,
    columns : [
        {
            title: "Title",
            width : "60%",
            sort : true
        },
        {
            title: "Author",
            width : "30%",
            sort : false
        },
        {
            title: "Actions",
            width : "10%",
            sort : false
        }
    ]
};


grid.controller = function () {
    var self = this;
    this.data = m.request({method: "GET", url: "sample.json"}).then(flatten).then(function(){ self.refresh_range(0); m.redraw(true); });
    this.flatData = [];
    this.filterIndexes = [];
    this.filterText = m.prop("");
    this.showRange = [];
    this.filterOn = false;
    this.layout = grid.layout;
    this.rangeMargin = 0;
    this.detailItem = {};
    this.visibleCache = 0;
    this.visibleIndexes = [];
    this.expandAllState = false;
    this.collapseAllState = false;
    this.lastLocation = 0; // The last scrollTop location, updates on every scroll.
    this.lastNonFilterLocation = 0; //The last scrolltop location before filter was used.
    this.currentPage = m.prop(1);


    /*
     *  Turns the tree structure into a flat index of nodes
     */
    function flatten(value) {
        var recursive = function redo(data, show) {
            var length = data.length;
            for (var i = 0; i < length; i++) {
                var children = data[i].children;
                var childIDs = [];
                var item = {
                    id: data[i].id,
                    row: data[i]
                };
                for(var j = 0; j < data[i].children.length; j++){
                    childIDs.push(data[i].children[j].id);
                }
                item.row.children = childIDs;
                item.row.show = show;
                if(data[i].children.length > 0 && !data[i].open ){
                    show = false;
                }
                self.flatData.push(item);
                if (children.length > 0) {
                    redo(children, show);
                }
            }
        };
        recursive(value, true);
        return value;
    }

    this.calculate_height = function(){
        var itemsHeight;
        if(!self.paginate){
            var visible = self.calculate_visible();
            itemsHeight = visible*self.layout.rowHeight;
        }else {
            itemsHeight = self.layout.showTotal*self.layout.rowHeight;
            self.rangeMargin = 0;
        }
        $('.tb-tbody-inner').height(itemsHeight);
        return itemsHeight;
    };
    /*
     *  Initializes after the view
     */
    this.init = function(el, isInit){
        if (isInit) { return; }
        var containerHeight = $('#tb-tbody').height();
        self.layout.showTotal = Math.floor(containerHeight/self.layout.rowHeight);
        console.log("ShowTotal", self.layout.showTotal);
        self.calculate_visible();
        self.refresh_range(0);
        $(".tb-row").dropzone({
            init : function(){
                this.on("complete", function (file) {
                    console.log(this.element);
                    alert("The element you selected is: "+$(this.element).find('.title-text').text() + " with ID:" + $(this.element).attr('data-id'));
                });
            },
            url: "/file/post"

        });
        $('#tb-tbody').scroll(function(){
            // snap scrolling to intervals of items;
            // get current scroll top
            var scrollTop = $(this).scrollTop();
            // are we going up or down? Compare to last scroll location
            var diff = scrollTop - self.lastLocation;
            console.log(diff);
            // going down, increase index
            if (diff > 0 && diff < self.layout.rowHeight){
                $(this).scrollTop(self.lastLocation+self.layout.rowHeight);
            }
            // going up, decrease index
            if (diff < 0 && diff > -self.layout.rowHeight){
                $(this).scrollTop(self.lastLocation-self.layout.rowHeight);
            }

            var itemsHeight = self.calculate_height();
            var innerHeight = $(this).children('.tb-tbody-inner').outerHeight();
            scrollTop = $(this).scrollTop();
            var location = scrollTop/innerHeight*100;
            console.log("Visible cache", self.visibleCache);
            var index = Math.round(location/100*self.visibleCache);
//            console.log("Visible", self.visibleCache);
            self.rangeMargin = Math.round(itemsHeight*(scrollTop/innerHeight));
//            console.log("ScrollTop", scrollTop, "Location", location, "Index", index);
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
                if (to != from ){
                    self.move(from, to);
                }
            }
        });
    };

    /*
     *  Deletes a single node from view; child nodes are handles at node_action
     */
    this.delete_node = function(index){
        self.flatData.splice(index, 1);
    };

    /*
     *  Adds a new node;
     */
    this.add_node = function(index){
        var item = self.flatData[index].row;
        var level = item.level+1;
        var newItem = new grid.model(level);
        var node = {
            id: newItem.id,
            row: newItem
        };
        item.children.push(newItem.id);
        var insert = self.return_last_childrow(index, item.level);
        self.flatData.splice(insert, 0, node);
    };

    /*
     *  Finds the last row within the nodes to add a node to the end of the appropriate rows;
     */
    this.return_last_childrow = function(index){
        var row = self.flatData[index].row;
        if(row.children.length > 0 ){
            var len = self.flatData.length;
            var level = row.indent;
            var lastIndex = index+1;
            for(var i = index+1; i < len; i++) {
                var o = self.flatData[i];
                if(o.row.indent <= level){
                    return lastIndex;
                }
                if(o.row.indent == level+1 ){
                    lastIndex = i;
                }
                if(o.row.indent > level+1){
                    continue; 
                }
                if(i === len-1){
                    return lastIndex;
                }
            }
            if(index+1 >= len)  {
                return null;
            } 
        } else {
            return index; 
        }

    };

    /*
     *  Returns the index of an item in the flat row list
     */
    this.return_index = function(id){
        var len = self.flatData.length;
        for(var i = 0; i < len; i++) {
            var o = self.flatData[i];
            if(o.row.id == id) {
                return i;
            }
        }
    };


    /*
     *  Completes an action on selected node and children if there are any: think of the children!
     */
    this.node_action = function(id, action, scope, selector){
        scope = scope || "all";
        var len = self.flatData.length;
        var i, j, k, index;
        var children = [];
        for(i = 0; i < len; i++){
            var o = self.flatData[i];
            if(o.row.id === id){
                if(o.row.children && scope === "all"){
                    for(j = 0; j < o.row.children.length; j++){
                        children.push(o.row.children[j]);
                    }
                }
                index = i;
                break;
            }
        }
        if(index){ action(index, id); }

        if(children.length > 0){
            for(k = 0; k < children.length; k++){
                var doit = true;
                if(selector){
                    doit = false;
                    if(children[k] === selector){
                        doit = true;
                    }
                }
                if(doit){ self.node_action(children[k], action); }
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
            self.refresh_range(0);
            // restore location of scroll
            $('#tb-tbody').scrollTop(self.lastNonFilterLocation);
        } else {
            if(!self.filterOn){
                self.filterOn = true;
                self.lastNonFilterLocation = self.lastLocation;
            }
            var index = self.showRange[0];
            if(!self.showRange[0]){
                index = 0;
            }
            self.refresh_range(index);
            console.log(index);
            self.calculate_visible();
        }
    };


    /*
     *  During pagination jumps to specific page
     */
    this.jump_to_page = function(e){
        m.withAttr("value", self.currentPage)(e);
        var page = parseInt(self.currentPage());
        var index = (self.layout.showTotal*page)+1;
        self.refresh_range(self.visibleIndexes[index]);
    };


    /*
     *  Toggles weather a folder is collapes or opn
     */

    this.toggle_folder = function(topIndex, index) {
        var len = self.flatData.length;
        console.log(topIndex, index);
        var item = self.flatData[index].row;

        function lazy_flatten(value, topIndex, index, level) {
            console.log(value, topIndex, index, level);
            var row = self.flatData[index].row;
            index = index+1;
            var recursive = function redo(data, show, level) {
                var length = data.length;

                for (var i = 0; i < length; i++) {
                    var children = data[i].children;
                    var childIDs = [];
                    var item = {
                        id: data[i].id,
                        row: data[i]
                    };

                    for (var j = 0; j < data[i].children.length; j++) {
                        childIDs.push(data[i].children[j].id);
                    }
                    item.row.children = childIDs;
                    item.row.show = show;
                    item.row.indent = level;
                    if (data[i].children.length > 0 && !data[i].open) {
                        show = false;
                    }
                    self.flatData.splice(index, 0, item);
                    index++;
                    if (children.length > 0) {
                        redo(children, show, level + 1);
                    }
                    console.log("Item",item, "index", index);

                    if(item.row.indent === row.indent+1){
                        row.children.push(item.row.id);
                    }
                }
            };
            recursive(value, true, level);
            return value;
        }
        function lazy_update(topIndex){
            self.refresh_range(topIndex);
            m.redraw(true);
        }

        // lazy loading
        if (item.kind === "folder" && item.children.length === 0) {
            m.request({method: "GET", url: "small.json"})
                .then(function (value) {
                lazy_flatten(value, topIndex, index, item.indent + 1);
                })
                .then(function(){ lazy_update(topIndex); });
        } else {
            var level = item.indent;
            for (var i = index + 1; i < len; i++) {
                var o = self.flatData[i].row;
                if (o.indent <= level) {
                    break;
                }
                if (item.open) {
                    o.show = false;
                } else {
                    o.show = true;
                }
            }
            item.open = !item.open;
            self.calculate_height();
            self.refresh_range(topIndex);
            m.redraw(true);
        }
    };

    this.move = function(from, to){
        var fromIndex = self.return_index(from);
        var fromData = self.flatData[fromIndex].row;
        var toIndex = self.return_index(to);
        var toData = self.flatData[toIndex].row;
        var insert = self.return_last_childrow(toIndex);
        console.log("Returned insert", insert);
        var indent = toData.indent+1;
        var collectFrom = [];
        var len = self.flatData.length;

        collect();
        // first collect
        function collect (){
            console.log("Collect from index", fromIndex);
            for(var i = fromIndex; i < len; i++){
                console.log("Insert", insert);
                var item = self.flatData[i];
                if (item.row.indent <= fromData.indent && item.row.id !== fromData.id) {
                    add();
                    break;
                }
                collectFrom.push(item);
                insert++;
            }

        }


        // then add
        function add(){
            var topLevel = collectFrom[0].row.indent;
            console.log("topLevel", topLevel);
            console.log("Collect From Array:", collectFrom);
            for(var j = 0; j < collectFrom.length; j++){
                var o = collectFrom[j];
                var levelDiff = o.row.indent - topLevel;
                o.row.indent = indent+levelDiff;
                console.log("final indent:", o.row.indent, levelDiff);
                self.flatData.splice(insert, 0, o);
                insert++;
                toData.children.push(o.row.id);
                if(j === collectFrom.length-1){
                    console.log("Inserted", insert+1, self.flatData[insert+1] );
                    remove();
                }
            }
        }

        // then delete
        function remove (){
            // get indexes again
//            fromIndex = self.return_index(from);
            console.log(fromIndex, toIndex);
            if(fromIndex > toIndex){
                console.log("fromIndex is bigger. Collect length:", collectFrom.length);
                fromIndex = fromIndex + collectFrom.length;
            }

            console.log("FromIndex", fromIndex);
            var total = fromIndex+collectFrom.length;
            for(var k = fromIndex; k < total; k++){
                console.log(k);
                var node = self.flatData[k];
                console.log(node);
//                if (node.row.indent <= fromData.indent && node.row.id !== fromData.id) {
//
//                }
                self.flatData.splice(k,1);
                if(k === total-1){
                    toData.open = true;
                    m.redraw();
                }

            }
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
     *  Refreshes the view to start the the location where begin is the starting index
     */
    this.refresh_range = function(begin){
        var len = self.flatData.length;
        if(self.filterOn){ begin = self.filterIndexes[begin];}
        var skip = false;
        var skipLevel = 0;
        var range = [];
        var counter = begin;
        for ( var i = begin; i < len; i++){
            if(range.length === self.layout.showTotal ){break;}
            var o = self.flatData[i].row;
            // Should we skip this (i.e. if the folder is closed)
            if(skip && o.indent > skipLevel){ continue;}
            if(o.indent === skipLevel){ skip = false; }
            if(self.filterOn){
                if(self.row_filter_result(o)) {
                    range.push(i);
                    counter++;
                }
            } else {
                if(o.show){
                    range.push(i);
                    counter++;
                }
            }
        }

            self.showRange = range;
    };

    /*
     *  Calculates total number of visible items to return a row height
     */
    this.calculate_visible = function(){
        var len = self.flatData.length;
        var total = 0;
        self.filterIndexes = [];
        self.visibleIndexes = [];
        for ( var i = 0; i < len; i++){
            var o = self.flatData[i].row;
            if(self.filterOn){
                if(self.row_filter_result(o)) {
                    total++;
                    self.filterIndexes.push(i);
                }
            } else {
                if(o.show){
                    self.visibleIndexes.push(i);
                    total++;
                }
            }

        }
        self.visibleCache = total;
        return total;
    };

    /*
     *  Changes view to continous scroll
     */
    this.toggle_scroll = function(){
        self.layout.paginate = false;
        $('.tb-paginate').removeClass('active');
        $('.tb-scroll').addClass('active');
    };

    /*
     *  Changes view to paginate
     */
    this.toggle_paginate = function(){
        self.layout.paginate = true;
        $('.tb-scroll').removeClass('active');
        $('.tb-paginate').addClass('active');
        var first = self.showRange[0];
        var pagesBehind = Math.floor(first/self.layout.showTotal);
        var firstItem = (pagesBehind*self.layout.showTotal)+1;
        self.currentPage(pagesBehind+1);
        self.refresh_range(firstItem);
    };

    this.page_up = function(){
        // get last shown item index and refresh view from that item onwards
        var last = self.showRange[self.layout.showTotal-1];
        console.log("Last", last);
        if(last && last+1 < self.flatData.length){
            self.refresh_range(last+1);
            self.currentPage(self.visibleIndexes[self.currentPage()+1]);
        }
    };
    this.page_down = function(){
        var first = self.showRange[0];
        if(first && first > 0) {
            self.refresh_range(self.visibleIndexes[first - self.layout.showTotal]);
            self.currentPage(self.currentPage()-1);
        }
    };


    /*
     *  What to show for toggle state, this will simplify with the use of icons
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


grid.view = function(ctrl){
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
                                (function(){ if(ctrl.filterOn) {
                                    return m('span', { style : "width: 120px"}, "Results : " + ctrl.visibleCache); }
                                }())
                            ])
                        ])
                    ]),
                    m(".tb-rowTitles.m-t-md", [
                        ctrl.layout.columns.map(function(col){
                            var sortView = "";
                            if(col.sort){
                                sortView =  [
                                     m('i.fa.fa-sort-alpha-desc.tb-sort-inactive.padder-10'),
                                     m('i.fa.fa-sort-alpha-asc.tb-sort-inactive.padder-10')
                                ];
                            }
                            return m('.tb-th', { style : "width: "+ col.width }, [
                                m('span', col.title),
                                sortView
                            ]);
                        })
                    ]),
                    m("#tb-tbody", [
                        m('.tb-tbody-inner', [
                            m('', { style : "padding-left: 15px;margin-top:"+ctrl.rangeMargin+"px" }, [
                                ctrl.showRange.map(function(item){
                                    var row = ctrl.flatData[item].row;
//                                    console.log(row);

                                    var cols = ctrl.layout.columns;
                                    var padding, css;
                                    if(ctrl.filterOn){
                                        padding = 0;
                                    } else {
                                        padding = row.indent*20;
                                    }
                                    if(row.id === ctrl.detailItem.id){ css = "tb-row-active"; } else { css = ""; }
                                    return  m(".tb-row", {
                                        class : css,
                                        "data-id" : row.id,
                                        "data-level": row.indent,
                                        "data-index": item,
                                        style : "height: "+ctrl.layout.rowHeight+"px;",
                                        onclick : function(){ ctrl.set_detail_item(item); }}, [
                                        m(".tb-td.tdTitle", {
                                            "data-id" : row.id,
                                            style : "padding-left: "+padding+"px; width:"+cols[0].width },  [
                                            m("span.tdFirst", {
                                                onclick: function(){ ctrl.toggle_folder(ctrl.showRange[0], item); }},
                                                ctrl.subFix(row)),
                                            m("span", row.id+" "),
                                            m("span.title-text", row.title+" ")
                                        ]),
                                        m(".tb-td", { style : "width:"+cols[1].width }, [
                                            m('span', row.person),

                                        ]),
                                        m(".tb-td", { style : "width:"+cols[2].width }, [
                                            m("button.btn.btn-danger.btn-xs", {
                                                "data-id" : row.id,
                                                onclick: function(){ ctrl.node_action(row.id, ctrl.delete_node); }},
                                                " X "),
                                            m("button.btn.btn-success.btn-xs", {
                                                "data-id" : row.id,
                                                onclick: function(){ ctrl.node_action(row.id, ctrl.add_node, "top");}},
                                                " Add ")
                                            ,m("button.btn.btn-info.btn-xs", {
                                                    "data-id" : row.id,
                                                    onclick: function(){
                                                        var selector = '.tb-row[data-id="'+row.id+'"]';
                                                        $(selector).css('font-weight', 'bold');
                                                        console.log(selector);
                                                    }},
                                                "?")
                                        ])
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
                                    if(ctrl.layout.paginate){
                                        return m('.pull-right', [
                                            m('button.btn.btn-default.btn-sm',{ onclick : ctrl.page_down}, [ m('i.fa.fa-chevron-left')]),
                                            m('input.h-mar-10', { type : "text", style : "width: 30px;", onkeyup: ctrl.jump_to_page, value : ctrl.currentPage()} ),
                                            m('button.btn.btn-default.btn-sm',{ onclick : ctrl.page_up}, [ m('i.fa.fa-chevron-right')])
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

m.module(document.getElementById("grid"), grid);


