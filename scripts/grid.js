
// Initialize the module
var grid = {};

// Set property for data and get the data
grid.model = function (level){
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



grid.controller = function () {
    var self = this;
    this.data = m.request({method: "GET", url: "sample_20.json"}).then(flatten).then(function(value){
        self.calculate_visible(0);
        self.calculate_height();
    });
    this.flatData = [];
    this.ascData = [];
    this.descData = [];
    this.filterIndexes = [];
    this.filterText = m.prop("");
    this.showRange = [];
    this.filterOn = false;
    this.ascOn = false;
    this.descOn = false;
    this.layout = grid.options;
    this.rangeMargin = 0;
    this.detailItem = {};
    this.visibleCache = 0;
    this.visibleIndexes = [];
    this.visibleTop = [];
    this.lastLocation = 0; // The last scrollTop location, updates on every scroll.
    this.lastNonFilterLocation = 0; //The last scrolltop location before filter was used.
    this.currentPage = m.prop(1);


    /*
     *  Turns the tree structure into a flat index of nodes
     */
    function flatten(value, target) {
        target = target || self.flatData;
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
                target.push(item)   ;
                if (children.length > 0) {
                    redo(children, show);
                }
            }
        };
        recursive(value, true);
        return value;
    }

    /*
     *  Initializes after the view
     */
    this.init = function(el, isInit){
        if (isInit) { return; }
        var containerHeight = $('#tb-tbody').height();
        self.layout.showTotal = Math.floor(containerHeight/self.layout.rowHeight);
        console.log("ShowTotal", self.layout.showTotal);
//        $(".tb-row").dropzone({
//            init : function(){
//                this.on("complete", function (file) {
//                    console.log(this.element);
//                    alert("The element you selected is: "+$(this.element).find('.title-text').text() + " with ID:" + $(this.element).attr('data-id'));
//                });
//            },
//            url: "/file/post"
//
//        });
        $('#tb-tbody').scroll(function(){
            // snap scrolling to intervals of items;
            // get current scroll top
            var scrollTop = $(this).scrollTop();
            // are we going up or down? Compare to last scroll location
            var diff = scrollTop - self.lastLocation;
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
        var level = item.indent+1;
        var newItem = new grid.model(level);
        var node = {
            id: newItem.id,
            row: newItem
        };
        console.log(node);
        item.children.push(newItem.id);
        var insert = self.return_last_childrow(index, item.level);
        self.flatData.splice(insert, 0, node);
        console.log(self.visibleTop);
        console.log(self.visibleIndexes);
        self.calculate_visible(self.visibleTop);
        self.calculate_height();
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
        var index = (self.layout.showTotal*(page-1));
        self.refresh_range(self.visibleIndexes[index]);
    };


    /*
     *  Toggles weather a folder is collapes or opn
     */
    this.toggle_folder = function(topIndex, index) {
        var len = self.flatData.length;
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
            self.calculate_visible(topIndex);
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
            var skip = false;
            var skipLevel = item.indent;
            var level = item.indent;
            for (var i = index + 1; i < len; i++) {
                var o = self.flatData[i].row;
                if (o.indent <= level) {break;}
                if(skip && o.indent > skipLevel){ continue;}
                if(o.indent === skipLevel){ skip = false; }
                if (item.open) {
                    // closing
                    o.show = false;
                } else {
                    // opening
                    o.show = true;
                    if(!o.open){
                        skipLevel = o.indent;
                        skip = true;
                    }
                }

            }
            item.open = !item.open;
            self.calculate_visible(topIndex);
            self.calculate_height();
            m.redraw(true);
        }
    };

    /*
     *  Moves the entire object from one part of the flat structure to another
     */
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
            var total = fromIndex+collectFrom.length;
            for(var k = fromIndex; k < total; k++){
                var node = self.flatData[k];
//                if (node.row.indent <= fromData.indent && node.row.id !== fromData.id) {
//
//                }
                self.flatData.splice(k,1);
                if(k === total-1){
                    toData.open = true;
                    self.calculate_visible(self.visibleTop);
                    self.calculate_height();
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

    this.ascToggle = function(){
        if(self.ascOn){
            $('.asc-btn').addClass('.tb-sort-inactive');
        } else {
            $('.asc-btn').removeClass('.tb-sort-inactive');
            self.descOn = false;
            $('.desc-btn').addClass('.tb-sort-inactive');
        }
        self.ascOn = !self.ascOn;
    };
    this.descToggle = function(){
        if(self.descOn){
            $('.desc-btn').addClass('.tb-sort-inactive');
        } else {
            $('.desc-btn').removeClass('.tb-sort-inactive');
            self.ascOn = false;
            $('.asc-btn').addClass('.tb-sort-inactive');
        }
        self.ascOn = !self.ascOn;
    };



    /*
     *  Calculate how tall the wrapping div should be so that scrollbars appear properly
     */
    this.calculate_height = function(){
        var itemsHeight;
        if(!self.paginate){
            var visible = self.visibleCache;
            itemsHeight = visible*self.layout.rowHeight;
        }else {
            itemsHeight = self.layout.showTotal*self.layout.rowHeight;
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
        var len = self.visibleIndexes.length;
        var range = [];
        var counter = 0;
        self.visibleTop = begin;
        for ( var i = begin; i < len; i++){
            if( range.length === self.layout.showTotal ){break;}
            var index = self.visibleIndexes[i];
            range.push(index);
            counter++;
        }
        self.showRange = range;
        console.log("len", len);
        m.redraw(true);
    };

    /*
     *  Changes view to continous scroll
     */
     //TODO Remove overflow, scroll
    this.toggle_scroll = function(){
        self.layout.paginate = false;
        $('#tb-tbody').css('overflow', 'scroll');
        $('.tb-paginate').removeClass('active');
        $('.tb-scroll').addClass('active');
    };

    /*
     *  Changes view to paginate
     */
     //TODO Remove overflow, hidden
    this.toggle_paginate = function(){
        self.layout.paginate = true;
        $('#tb-tbody').css('overflow', 'hidden');
        $('.tb-scroll').removeClass('active');
        $('.tb-paginate').addClass('active');
        var first = self.showRange[0];
        var pagesBehind = Math.floor(first/self.layout.showTotal);
        var firstItem = (pagesBehind*self.layout.showTotal);
        self.currentPage(pagesBehind+1);
        self.refresh_range(firstItem);
    };

    /*
     *  During pagination goes up one page
     */
    this.page_up = function(){
        // get last shown item index and refresh view from that item onwards
        var last = self.showRange[self.layout.showTotal-1];
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
            self.refresh_range(first - self.layout.showTotal);
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
                                m('span', { style : "width: 120px"}, "Visible : " + ctrl.visibleCache)
                            ])
                        ])
                    ]),
                    m(".tb-rowTitles.m-t-md", [
                        ctrl.layout.columns.map(function(col){
                            var sortView = "";
                            if(col.sort){
                                sortView =  [
                                     m('i.fa.fa-sort-alpha-desc.tb-sort-inactive.padder-10.asc-btn', {
                                         onclick: self.ascToggle
                                     }),
                                     m('i.fa.fa-sort-alpha-asc.tb-sort-inactive.padder-10.desc-btn', {
                                         onclick: self.descToggle
                                     })
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
                                        onclick : function(){ ctrl.set_detail_item(item);
                                        }}, [
                                        m(".tb-td.tdTitle", {
                                            "data-id" : row.id,
                                            style : "padding-left: "+padding+"px; width:"+cols[0].width },  [
                                            m("span.tdFirst", {
                                                onclick: function(){ ctrl.toggle_folder(ctrl.visibleTop, item); }},
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
                                                onclick: function(){ ctrl.node_action(row.id, ctrl.add_node, "top");}
                                                }," Add "),
                                            m("button.btn.btn-info.btn-xs", {
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

var options = {
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

grid.run = function(element, options){
    grid.options = options;
    m.module(element, grid);
};

grid.run(document.getElementById("grid"), options);




