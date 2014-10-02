
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
    }
}


grid.controller = function () {
    var self = this;
    this.data = m.request({method: "GET", url: "sample_50.json"}).then(flatten);
    this.flatData = [];
    this.filterText = m.prop("");
    this.showRange = [];
    this.showTotal = 20;
    this.filterOn = false;
    this.rowHeight = 35;

    /*
     *  Turns the tree structure into a flat index of nodes
     */
    function flatten(value) {
        var recursive = function redo(data) {
            var length = data.length;
            for (var i = 0; i < length; i++) {
                var children = data[i].children;
                var childIDs = [];
                var item = {
                    id: data[i].id,
                    row: data[i]
                }
                for(var j = 0; j < data[i].children.length; j++){
                    childIDs.push(data[i].children[j].id);
                }
                item.row.children = childIDs;
                self.flatData.push(item);
                if (children) {
                    redo(children);
                }
            }
        };
        recursive(value);
        self.initialize_range();
        return value;
    }

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
        }
        item.children.push(newItem.id);
        var insert = self.return_last_childrow(index, item.level);
        self.flatData.splice(insert, 0, node);
        console.log("insert", insert, "newItem", node);
        console.log(self.flatData[insert]);
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
            console.log("i", i, "len", len, "level", level, "o-level", o.row.level);
            if(o.row.level <= level) {
                return lastIndex;
            }
            if(i === len-1){
                return lastIndex;
            }
        }
        if(index+1 >= len)  {
            return self.flatData.length;
        }
    }

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
    }


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
                if(o.row.children && scope == "all"){
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
            if(range.length === self.showTotal){ break; }
            var o = self.flatData[i];
            if(o.row.show){
                range.push(i);
            }
        }
        self.showRange = range;
    }

    /*
     *  Refreshes the view as the user scrolls down
     */
    this.add_to_bottom = function(amount){
        var amount = amount || 1;
        var index = self.showRange[self.showRange.length-1];
        var len = self.flatData.length;
        var totalAdded = 0;
        if(len-(index) < amount ){
            amount = len-(index);
        }
        // remove the first rows from range
        self.showRange.splice(0, amount);
        // add the next visible row to range
        for ( var i = index+1; i < len; i++){
            var o = self.flatData[i];
            console.log(i);
            if(o.row.show){
                self.showRange.push(i);
                totalAdded++;
                if(totalAdded === amount ){
                    break;
                }
            }
        }
        console.log("bottom");
        console.log(self.showRange);
        m.redraw(true);
    }

    /*
     *  Refreshes the view as the user scrolls up
     */
    this.add_to_top = function(amount){
        var amount = amount || 1;
        var index = self.showRange[0];
        var totalRemoved = 0;
        if(index < amount ){
            amount = index;
        }
        // remove the last rows from range
        console.log("Amount", self.showRange.length-1-amount);
        self.showRange.splice(self.showRange.length-1-amount, amount);
        // add the previous visible row to range
        var index = self.showRange[0];
        console.log("Index", index);
        for ( var i = index-1; i > -1 ; i--){
            var o = self.flatData[i];
            console.log("i", i);
            if(o.row.show){
                self.showRange.unshift(i);
                totalRemoved++;
                if(totalRemoved === amount){
                    break;
                }
            }
        }
        console.log("bottom");
        console.log(self.showRange);
        m.redraw(true);
    }

    /*
     *  Initializes the first rows for the filtering function
     */
    this.initialize_filter = function (){
        var len = self.flatData.length;
        var range = [];
        for ( var i = 0; i < len; i++){
            if(range.length === self.showTotal){ break; }
            var o = self.flatData[i].row;
            if(self.row_filter_result(o)){
                range.push(i);
            }
        }
        self.showRange = range;
        m.redraw();
    }

    /*
     *  Returns whether a single row contains the filtered items
     */
    this.row_filter_result = function(row){
        var filter = self.filterText().toLowerCase();
        var titleResult = row.title.toLowerCase().indexOf(filter);
        var authorResult = row.name.toLowerCase().indexOf(filter);
        if (titleResult > -1 || authorResult > -1){
            return true;
        } else {
            return false;
        }
    }

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
    }

    /*
     *  Toggles weather a folder is collapes or opn
     */
    this.toggle_folder = function(){

    }

    /*
     *  Toggles all row views to expand everything or collapse everything
     */
    this.toggle_expand = function(){

    }

    this.calculate_visible = function(){
        var len = self.flatData.length;
        var total = 0;
        for ( var i = 0; i < len; i++){
            var o = self.flatData[i].row;
            if(o.show){
                total++;
            }
        }
        return total;
    }

    /*
     *  Initializes after the view
     */
    this.init = function(el, isInit){
        if (isInit) return;
        var visible = self.calculate_visible();
        $('.gridInner').height(visible*self.rowHeight);
        $('.gridWrapper').scroll(function(){
            var scrollTop = $(this).scrollTop();
            var innerHeight = $(this).children('.gridInner').outerHeight();
            var location = scrollTop/innerHeight*100;
            console.log("Location", location);
            var index = location/100*visible;
            console.log("Index", index);
//            var height = $(this).height();
//
//            if(innerHeight-scrollTop < height ){
//                self.add_to_bottom(3);
//            }
//            if(scrollTop < 100 && self.showRange[0] !== 0){
//                self.add_to_top(3);
//            }
        })
    };

}


grid.view = function(ctrl){
console.log(ctrl.showRange);
    return [ m(".row", [ m(".col-xs-12", [
        m("input.form-control[placeholder='filter'][type='text']", { style:"width:300px", onkeyup: ctrl.filter, value : ctrl.filterText()} ),
        m("button.btn.btn-default", { onclick: ctrl.expand}, "Expand All"),
        m("button.btn.btn-default",{ onclick: ctrl.collapse}, "Collapse All")
    ])
    ]),
        m('.gridWrapper',{config : ctrl.init}, [
            m(".gridInner", [ m("table.table", [
                m("thead", [
                    m("th", { width : "50%"}, [
                        m("span", "Title"),
                        m("i", { "data-order" :"asc", onclick : m.withAttr("data-order", ctrl.order)}, " [asc]"),
                        m("i", { "data-order" :"desc", onclick : m.withAttr("data-order", ctrl.order)}, " [desc]")
                    ]),
                    m("th", "Person"),
                    m("th", "Date"),
                    m("th", "Actions")
                ]),
                m("tbody", [
                    m(".tb-paddingRow"),
                    ctrl.showRange.map(function(item){
                        var row = ctrl.flatData[item].row;
                        var padding;
                        if(ctrl.filterOn){
                            padding = 0;
                        } else {
                            padding = row.level*20;
                        }
                        return  m("tr.tb-row", { "data-id" : row.id, "data-level": row.level, style : "height: "+ctrl.rowHeight+"px"}, [
                            m("td.tdTitle", {"data-id" : item.id, style : "padding-left: "+padding+"px" },  [
                                m("span.tdFirst", { onclick: function() { row.status = !row.status; }}, "--"),
                                m("span", row.id+" "),
                                m("span", row.title+" ")
                            ]),
                            m("td", row.name + " "),
                            m("td", row.date + " "),
                            m("td", { width : "150"}, [
                                m("button.btn.btn-danger.btn-xs", {"data-id" : row.id, onclick: function(){ ctrl.node_action(row.id, ctrl.delete_node) }},  " X "),
                                m("button.btn.btn-success.btn-xs", {"data-id" : row.id, onclick: function(){ ctrl.node_action(row.id, ctrl.add_node, "top"); } },  " Add ")
                            ])
                        ])
                    }),
                    m(".tb-paddingRow")
                ])
                ])
            ])
        ])
    ]

}

m.module(document.getElementById("grid"), grid);


