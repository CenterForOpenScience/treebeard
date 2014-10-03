
// Initialize the module
var grid = {};

// Set property for data and get the data

grid.model = function (level){
    return {
        level :  level,
        id : Math.floor(Math.random()*(1000000000000)),
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
    columns : [
        {
            title: "Title",
            width : "60%"
        },
        {
            title: "Author",
            width : "30%"
        },
        {
            title: "Actions",
            width : "10%"
        }
    ]
};


grid.controller = function () {
    var self = this;
    this.data = m.request({method: "GET", url: "sample.json"}).then(flatten);
    this.flatData = [];
    this.filterData = [];
    this.filterText = m.prop("");
    this.showRange = [];
    this.filterOn = false;
    this.layout = grid.layout;
    this.rangeMargin = 0;
    this.detailItem = {};
    this.visibleCache = 0;


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
                self.flatData.push(item);
                if(show && !data[i].open){ show = false; }
                if (children.length > 0) {
                    redo(children, show);
                }
            }
        };
        recursive(value, true);
        self.initialize_range();
        return value;
    }

    this.calculate_height = function(){
        var visible = self.calculate_visible();
        var itemsHeight = visible*self.layout.rowHeight;
        $('.tb-tbody-inner').height(itemsHeight);
        return itemsHeight;
    };
    /*
     *  Initializes after the view
     */
    this.init = function(el, isInit){
        if (isInit) { return; }
        $('.tb-tbody').scroll(function(){
            var itemsHeight = self.calculate_height();
            var scrollTop = $(this).scrollTop();
            var innerHeight = $(this).children('.tb-tbody-inner').outerHeight();
            var location = scrollTop/innerHeight*100;
            var index = Math.round(location/100*self.visibleCache);
            console.log("Visible", self.visibleCache);
            self.rangeMargin = Math.round(itemsHeight*(scrollTop/innerHeight));
            self.refresh_range(index);
            m.redraw(true);
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
    this.return_last_childrow = function(index, level){
        var len = self.flatData.length;
        var lastIndex = index+1;
        for(var i = index+1; i < len; i++) {
            var o = self.flatData[i];
            lastIndex = i;
            console.log("i", i, "len", len, "level", level, "o-level", o.row.indent);
            if(o.row.indent <= level) {
                return lastIndex;
            }
            if(i === len-1){
                return lastIndex;
            }
        }
        if(index+1 >= len)  {
            return self.flatData.length;
        }
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
     *  Completes an action on selected node and children if there are any
     */
    this.node_action = function(id, action, scope, selector){
        var scope = scope || "all";
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
                if(doit){ self.node_action(children[k], self.delete_node); }
            }
        }
    };

    /*
     *  Shows the initial number of rows as the page loads or resetting from other views
     */
    this.initialize_range = function(){
        var len = self.flatData.length;
        var range = [];
        for ( var i = 0; i < len; i++){
            if(range.length === self.layout.showTotal){ break; }
            var o = self.flatData[i];
            if(o.row.show){
                range.push(i);
            }
        }
        self.showRange = range;
    };

    /*
     *  Initializes the first rows for the filtering function
     */
    this.initialize_filter = function (){
        var len = self.flatData.length;
        var range = [];
        for ( var i = 0; i < len; i++){
            if(range.length === self.layout.showTotal){ break; }
            var o = self.flatData[i].row;
            if(self.row_filter_result(o)){
                range.push(i);
            }
        }
        self.showRange = range;
        m.redraw();
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
            self.initialize_range();
        } else {
            self.filterOn = true;
            self.initialize_filter();
        }
    };

    /*
     *  Toggles weather a folder is collapes or opn
     */
    this.toggle_folder = function(topIndex, index){
        var len = self.flatData.length;
        var item = self.flatData[index].row;
        var level = item.indent;
        for ( var i = index+1; i < len; i++){
            var o = self.flatData[i].row;
            if(o.indent <= level){ break; }
            if(item.open){
                o.show = false;
            } else {
                o.show = true;
            }
        }
        item.open = !item.open;
        self.calculate_height();
        self.refresh_range(topIndex);
        m.redraw(true);
    };

    /*
     *  Toggles all row views to expand everything or collapse everything
     */
    this.toggle_expand = function(){

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
        var range = [];
        var counter = begin;
        for ( var i = begin; i < len; i++){
            if(range.length === self.layout.showTotal ){break;}
            var o = self.flatData[i].row;
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
        console.log(self.showRange[0] === range[0]);
        if(self.showRange[0] === range[0]){
            console.log("Range", range[1]);
            self.refresh_range(range[1]);
        } else {
            self.showRange = range;
        }
    };

    /*
     *  Calculates total number of visible items to return a row height
     */
    this.calculate_visible = function(){
        var len = self.flatData.length;
        var total = 0;
        for ( var i = 0; i < len; i++){
            var o = self.flatData[i].row;
            if(self.filterOn){
                if(self.row_filter_result(o)) {
                    total++;
                }
            } else {
                if(o.show){
                    total++;
                }
            }

        }
        self.visibleCache = total;
        return total;
    };



    /*
     *  What to show for toggle state, this will simplify with the use of icons
     */
    this.subFix = function(item){
        if(item.children.length > 0 ){
            if(item.open){
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
        m('.gridWrapper.row',{config : ctrl.init},  [
            m('.col-sm-8', [
                m(".tb-table", [
                    m('.tb-head',[
                        m(".row", [
                            m(".col-xs-8", [
                                m("input.form-control[placeholder='filter'][type='text']", {
                                    style:"width:300px",
                                    onkeyup: ctrl.filter,
                                    value : ctrl.filterText()} )
                            ]),
                            m('.col-xs-4', m('.btn-group.padder-10', [
                                m("button.btn.btn-default.btn-sm", { onclick: ctrl.expand}, "Expand All"),
                                m("button.btn.btn-default.btn-sm",{ onclick: ctrl.collapse}, "Collapse All")
                            ]))
                        ])
                    ]),
                    m(".tb-rowTitles", [
                        ctrl.layout.columns.map(function(col){
                            return m('.tb-th', { style : "width: "+ col.width }, col.title);
                        })
                    ]),
                    m(".tb-tbody", [
                        m('.tb-tbody-inner', [
                            m('', { style : "padding-left: 15px;margin-top:"+ctrl.rangeMargin+"px" }, [
                                ctrl.showRange.map(function(item){
                                    var row = ctrl.flatData[item].row;
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
                                            m("span", row.title+" ")
                                        ]),
                                        m(".tb-td", { style : "width:"+cols[1].width }, row.name),
                                        m(".tb-td", { style : "width:"+cols[2].width }, [
                                            m("button.btn.btn-danger.btn-xs", {
                                                "data-id" : row.id,
                                                onclick: function(){ ctrl.node_action(row.id, ctrl.delete_node); }},
                                                " X "),
                                            m("button.btn.btn-success.btn-xs", {
                                                "data-id" : row.id,
                                                onclick: function(){ ctrl.node_action(row.id, ctrl.add_node, "top");}},
                                                " Add ")
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
                                    m("button.btn.btn-default.btn-sm","Paginate"),
                                    m("button.btn.btn-default.btn-sm", "Scroll")
                                ])
                            ),
                            m('.col-xs-8', [ m('.padder-10', "Pages")])
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


