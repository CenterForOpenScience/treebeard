
// Initialize the fodule
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
        date : new Date,
        filtered : false,
        children : []
    }
}


grid.controller = function () {
    var self = this;
    this.data = m.request({method: "GET", url: "large.json"}).then(flatten);
    this.temp = {}; // temporary object
    this.filterText = m.prop("");
    this.totalItems = m.prop(0);
    this.flatData = [];

    /*
     *  Turns the tree structure into a flat index of nodes
     */
    function flatten(value){
        var recursive = function redo(data) {
            var length = data.length;
            for(var i = 0; i < length; i++){
                var item = {
                    id : data[i].id,
                    row : data[i]
                }
                self.flatData.push(item);
                if(data[i].children){
                    redo(data[i].children);
                }
            }
        };
        recursive(value);
        console.log(self.flatData);
        return value;
    }

    /*
     *  Returns the full node on the tree based on the flat index
     */
    this.returnNode = function(indexArray){
        var index = 0, array = [], levelArray, len, row;
        levelArray = indexArray.split(",");
        len = levelArray.length;
        row = this.data()[levelArray[0]];
        index = levelArray[0];

        for(var i = 1; i < len; i++){
            if(i == len-1){
                index = levelArray[i];
                array = row;
            }
            row = row.children[levelArray[i]];
        }
        var node = {
            row : row,
            index : parseInt(index),
            array : array
        }
        return node;
    }
    /*
     *  Renders the table row requested from the flat view
     */
    // this.renderRow = function(item, flatIndex){
        // var row = self.returnNode(item.indent).row;
        // var subFix = function(item){
        //     if(item.children.length > 0 ){
        //         if(item.status){
        //             for(var child = 0; child < item.children.length; child++){
        //                 $("[data-id="+item.children[child].id+"]").show();
        //             }
        //             return m("i.fa.fa-minus-square-o");
        //         } else {
        //             for(var child = 0; child < item.children.length; child++){
        //                 $("[data-id="+item.children[child].id+"]").hide();
        //             }
        //             return m("i.fa.fa-plus-square-o");
        //         }
        //     } else {
        //         return m.trust("");
        //     }
        // }

        // var view = function(item){
        //     var padding = item.indent*20;
        //     padding = "padding-left: "+padding+"px";
        //     return   m("tr", { "data-id" : item.id, "data-level": item.indent, "data-index" : flatIndex}, [
        //         m("td.tdTitle", {"data-id" : item.id, style : padding},  [
        //             m("span.tdFirst", {"data-id" : item.id, "data-level": item.indent, onclick: function() { item.status = !item.status; }}, subFix(item)),
        //             m("span", item.id+" "),
        //             m("span", item.title+" ")
        //         ]),
        //         m("td", item.name + " "),
        //         m("td", item.date + " "),
        //         m("td", { width : "150"}, [
        //             m("button.btn.btn-danger.btn-sm", {"data-id" : item.id, onclick: function(){ self.delete(flatIndex) }},  " X "),
        //             m("button.btn.btn-success.btn-sm", {"data-id" : item.id, onclick: m.withAttr("data-id", self.add)},  " Add ")
        //         ])
        //     ])
        // }
        // console.log("Row", row);
        // return view(row);


    // }

    /*
     *  Row crud functions
     */
    this.delete = function(index){
        var array;
        var item = self.flatData[index];
        var node = self.returnNode(item.level);
//        console.log("Returned node", node);
//        console.log("Item level", item.level);
        if(node.array.length == 0){
            array = self.data();
        } else {
            array = node.array.children;
        }
        self.flatData[index] = "";  // Delete from the flat data as well.
        console.log(array, node.index);
        array.splice(node.index, 1);
    }
    this.insertInto = function(){

    }

    /*
     *  What to show for toggle state, this will simplify with the use of icons
     */
    this.subFix = function(item){
        if(item.children){
            if(item.children.length > 0 ){
                if(item.status){
                    for(var child = 0; child < item.children.length; child++){
                        $("[data-id="+item.children[child].id+"]").show();
                    }

                    if(child > 0){
                        return [m("span.expand-icon-holder", m("i.fa.fa-minus-square-o", " ")), m("span.expand-icon-holder", m("i.fa.fa-folder-o", " "))];
                    }else{
                        return [m("span.expand-icon-holder", m("i.fa.fa-minus-square-o", " ")), m("span.expand-icon-holder", m("i.fa."+item.icon, " "))];
                    }

                } else {
                    for(var child = 0; child < item.children.length; child++){
                        $("[data-id="+item.children[child].id+"]").hide();
                    }
                    if(child > 0){
                        return [m("span.expand-icon-holder", m("i.fa.fa-plus-square-o", " ")), m("span.expand-icon-holder", m("i.fa.fa-folder-o", " "))];
                    }else{
                        console.log(item.icon);
                        return [m("span.expand-icon-holder", m("i.fa.fa-plus-square-o", " ")), m("span.expand-icon-holder", m("i.fa."+item.icon, " "))];
                    }
                }
            } else {
                return [m("span.expand-icon-holder"), m("span.expand-icon-holder", m("i.fa."+item.icon, " "))];
            }            
        }

    };

//
//
//    this.add = function(addid){ self.traverse(self.add, addid)};
//    this.expand = function(){ self.traverse("expand")};
//    this.collapse = function(){ self.traverse("collapse")};
//
//    // One traverse function to rule them all
//    this.traverse = function (action, id, id2){
//        var recursive = function redo(data){
//            var data = data || self.data();
//            var length = data.length;
//            for(var i = 0; i < length; i++){
//                var item = data[i];
//                var index = i;
//                var array = data;
//                if (item.id == id){
//                    // if item is found do things
//                    action(array, index, id2);
//                    switch(action){
//                        case "pull":
//                            self.pull(array, index, id2);
//                            break;
//                        case "push":
//                            self.push(item);
//                            break;
//                        case "add" :
//                            self.add(item);
//                            break;
//                        case "load":
//                            // if item load is true
//                            self.load(item);
//
//                            break;
//                        case "levels":
//                            self.adjustLevels(item);
//                            break;
//                    }
//                } else {
//                    // if item isn't found keep looking
//                    if(item.children.length > 0){
//                        redo(item.children);
//                    }
//                }
//                if(action == "collapse"){
//                    item.status = false;
//                }
//                if(action == "expand"){
//                    item.status = true;
//                }
//            }
//
//
//        }
//        recursive(self.data());
//    }
//
//    this.pull = function(array, index, arg){
//        var item = array[index];
//        array.splice(index, 1);
//        self.temp = item;
//        self.traverse("push",arg);
//        m.redraw();
//    };
//    this.push = function(item){
//        self.temp.level = item.level+1;
//        item.children.push(self.temp);
//    };
//    this.add = function(item){
//        var level = item.level+1;
//        var newItem = new grid.model(level);
//        item.children.push(newItem);
//        self.traverse("load", newItem.id);
//    }
//    this.load = function(item){
//        if (item.load){
//            var children = m.prop([]);
//            m.request({method: "GET", url: item.loadUrl}).then(children).then(function(){
//                children().map(function(child){
//                    item.children.push(child);
//                });
//                self.adjustLevels(item, self.totalItems());
//                m.redraw();
//            })
//        }
//    }
//    this.collapse = function(item){
//        item.status = false;
//    }
//    this.expand = function(item){
//        item.status = true;
//    }
//
//    this.adjustLevels = function redo (container, baseID){
//        var topLevel = container.level;
//        var iterid = 0;
//        container.children.map(function(item, index, array){
//            item.level = topLevel + 1;
//            item.id = baseID+1+iterid;
//            redo(item, item.id);
//            iterid++;
//        })
//    }
//
//    this.order = function (type){
//        var titleASC = function (a, b) {
//            var titleA = a.title.toLowerCase().replace(/\s+/g, " ");
//            var titleB = b.title.toLowerCase().replace(/\s+/g, " ");
//            if (titleA < titleB){
//                return -1;
//            }
//            if (titleA > titleB){
//                return 1;
//            }
//            return 0;
//        };
//        var titleDESC = function (a, b) {
//            var titleA = a.title.toLowerCase().replace(/\s/g, '');
//            var titleB = b.title.toLowerCase().replace(/\s/g, '');
//            if (titleA > titleB){
//                return -1;
//            }
//            if (titleA < titleB){
//                return 1;
//            }
//            return 0;
//        };
//        var recursive = function redo(data){
//            data.map( function(item, index, array){
//                if(type === "asc"){
//                    item.children.sort(titleASC);
//                } else {
//                    item.children.sort(titleDESC);
//                }
//                if(item.children.length > 0 ){ redo(item.children) } ;
//            });
//        }
//        // First reorder the top data
//        if(type === "asc"){
//            self.data().sort(titleASC);
//        } else {
//            self.data().sort(titleDESC);
//        }
//        // Then start recursive loop
//        recursive(self.data());
//    }
//    this.ui = function (){
//        $(".tdTitle").draggable({ helper: "clone" });
//        $("tr").droppable({
//            tolerance : "pointer",
//            hoverClass : "highlight",
//            drop: function( event, ui ) {
//                var to = $(this).attr("data-id");
//                var from = ui.draggable.attr("data-id");
//                if (to != from ){
//                    self.traverse("pull", from, to);
//                }
//            }
//        });
//        //self.count(self.data());
//    }
//
//    this.filterRun = function (){
//        self.flatData([]);
//        var titleResult = -1;
//        var authorResult = -1;
//        var filter = self.filterText().toLowerCase();
//        var recursive = function redo(data){
//            data.map( function(item, index, array){
//                if(self.filterText()){
//                    titleResult = item.title.toLowerCase().indexOf(filter);
//                    authorResult = item.title.toLowerCase().indexOf(filter);
//                    if (titleResult > -1 || authorResult > -1){
//                        item.show = true;
//                        item.flat = true;
//                    } else {
//                        item.show = false;
//                    }
//                } else {
//                    item.show = true;
//                    item.flat = false;
//                }
//                redo(item.children);
//            });
//        }
//        recursive(self.data());
//    }
//
//    this.filter = function(e){
//        m.withAttr("value", self.filterText)(e);
//        self.filterRun();
//    }

}

// Table view
grid.view = function(ctrl){
    return [ m(".row", [ m(".col-xs-12", [
        m("input.pull-left.form-control[placeholder='filter'][type='text']", { style:"width:300px", onkeyup: ctrl.filter, value : ctrl.filterText()} ),
        m("button.btn.btn-default.pull-right", { onclick: ctrl.expand}, "Expand All"),
        m("button.btn.btn-default.pull-right",{ onclick: ctrl.collapse}, "Collapse All")
    ])
    ]),
        m("div.gridWrapper",{config : ctrl.ui}, [ m("table.table", [
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
            m("tbody",[
                ctrl.flatData.map(function(item, index) {
                    
                    if(item){
                        var row = item.row;
                        return  m("tr", { "data-id" : row.id, "data-level": row.indent, "data-index" : index}, [
                            m("td.tdTitle", {"data-id" : item.id, style : "padding-left: "+row.indent*20+"px" },  [
                                m("span.tdFirst", { onclick: function() { row.status = !row.status; }}, ctrl.subFix(row)),
                                m("span", row.id+" "),
                                m("span", row.title+" ")
                            ]),
                            m("td", row.name + " "),
                            m("td", { width : "150"}, [
                                m("button.btn.btn-danger.btn-sm", {"data-id" : row.id, onclick: function(){ ctrl.delete(index) }},  " X "),
                                m("button.btn.btn-success.btn-sm", {"data-id" : row.id, onclick: m.withAttr("data-id", ctrl.add)},  " Add ")
                            ])
                        ])
                    } else {
                        return "";
                    }
                })
            ])
            ])
        ])
    ]

}

m.module(document.getElementById("grid"), grid);


