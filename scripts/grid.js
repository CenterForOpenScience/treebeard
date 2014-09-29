
    // Initialize the module
    var grid = {};

    // Set property for data and get the data
    grid.data = m.prop({});
    m.request({method: "GET", url: "sample.json"}).then(grid.data);

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
        this.data = grid.data;
        this.temp = {}; // temporary object
        this.filterText = m.prop("");
        this.flatData = m.prop([]);
        this.totalItems = m.prop(0);
        this.viewcounter = m.prop(0); 

        this.add = function(addid){ self.traverse("add", addid)};
        this.delete = function(deleteid){ self.traverse("delete", deleteid)};
        this.toggle = function(toggleid){ self.traverse("toggle", toggleid)};
        this.expand = function(){ self.traverse("expand")};
        this.collapse = function(){ self.traverse("collapse")};

        // One traverse function to rule them all
        this.traverse = function (action, id, id2){
            var recursive = function redo(data){
                var data = data || self.data();
                data.map( function(item, index, array){
                    if (item.id == id){
                        // if item is found do things
                        switch(action){
                            case "pull":
                                array.splice(index, 1);
                                self.temp = item;
                                self.traverse("push",id2);
                                m.redraw();
                                break;
                            case "push":
                                self.temp.level = item.level+1;
                                item.children.push(self.temp);
                                break;
                            case "delete":
                                array.splice(index, 1);
                                break;
                            case "add" :
                                var level = item.level+1;
                                var newItem = new grid.model(level);
                                item.children.push(newItem);
                                self.traverse("load", newItem.id);
                                break;
                            case "toggle":
                                // if item.load is true
                                item.status = !item.status;
                                break;
                            case "load":
                                // if item load is true
                                if (item.load){
                                    var children = m.prop([]);
                                    m.request({method: "GET", url: item.loadUrl}).then(children).then(function(){
                                        children().map(function(child){
                                              item.children.push(child);
                                            });
                                        console.log(item);
                                        self.adjustLevels(item, self.totalItems());
                                        m.redraw();
                                        })
                                }
                                break;
                            case "levels":
                                self.adjustLevels(item);
                                break;
                        }
                    } else {
                        // if item isn't found keep looking
                        if(item.children.length > 0){
                            redo(item.children);
                        }
                    }
                    if(action == "collapse"){
                        item.status = false;
                    }
                    if(action == "expand"){
                        item.status = true;
                    }
                })

            }
            recursive(self.data());
        }

        this.adjustLevels = function redo (container, baseID){
            var topLevel = container.level;
            var iterid = 0;
            container.children.map(function(item, index, array){
                item.level = topLevel + 1;
                item.id = baseID+1+iterid;
                redo(item, item.id);
                iterid++;
            })
        }

        this.order = function (type){
            var titleASC = function (a, b) {
                var titleA = a.title.toLowerCase().replace(/\s+/g, " ");
                var titleB = b.title.toLowerCase().replace(/\s+/g, " ");
                if (titleA < titleB){
                    return -1;
                }
                if (titleA > titleB){
                    return 1;
                }
                return 0;
            };
            var titleDESC = function (a, b) {
                var titleA = a.title.toLowerCase().replace(/\s/g, '');
                var titleB = b.title.toLowerCase().replace(/\s/g, '');
                if (titleA > titleB){
                    return -1;
                }
                if (titleA < titleB){
                    return 1;
                }
                return 0;
            };
            var recursive = function redo(data){
                data.map( function(item, index, array){
                    if(type === "asc"){
                        item.children.sort(titleASC);
                    } else {
                        item.children.sort(titleDESC);
                    }
                    if(item.children.length > 0 ){ redo(item.children) } ;
                });
            }
            // First reorder the top data
            if(type === "asc"){
               self.data().sort(titleASC);
            } else {
                self.data().sort(titleDESC);
            }
            // Then start recursive loop
            recursive(self.data());
        }
        this.ui = function (){
            $(".tdTitle").draggable({ helper: "clone" });
            $("tr").droppable({
                tolerance : "pointer",
                hoverClass : "highlight",
                drop: function( event, ui ) {
                    var to = $(this).attr("data-id");
                    var from = ui.draggable.attr("data-id");
                    if (to != from ){
                        self.traverse("pull", from, to);
                    }
                }
            });
            //self.count(self.data());
        }

        this.filterRun = function (){
            self.flatData([]);
            var titleResult = -1;
            var authorResult = -1;
            var filter = self.filterText().toLowerCase();
            var recursive = function redo(data){
                data.map( function(item, index, array){
                    if(self.filterText()){
                        titleResult = item.title.toLowerCase().indexOf(filter);
                        authorResult = item.title.toLowerCase().indexOf(filter);
                        if (titleResult > -1 || authorResult > -1){
                            item.show = true;
                            item.flat = true;
                        } else {
                            item.show = false;
                        }
                    } else {
                        item.show = true;
                        item.flat = false;
                    }
                    redo(item.children);
                });
            }
            recursive(self.data());
        }

        this.filter = function(e){
            m.withAttr("value", self.filterText)(e);
            self.filterRun();
        }
//
//        this.count = function (){
//            self.totalItems(0);
//            var recursive = function redo(data){
//                data.map( function(item, index, array){
//                    self.totalItems(self.totalItems()+1);
//                    redo(item.children);
//                })
//            }
//            recursive(self.data());
//        }


    }

var counter = 0; 
    // Table view
    grid.view = function(ctrl){
        
        var i = 0; var val;
        var resultingList = [];
        var padding = 0;
        var itemcount = 0;
   // Hierarchical
        var subFix = function(item){
            if(item.children.length > 0 ){
                if(item.status){
                    return "[-] ";
                } else {
                    return "[+] ";
                }
            } else {
                return m.trust("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;");
            }
        }
        var redo = function(data){
            if(data.length > 0){
                data.map(function(item, index){
                    i++;
                    padding = item.level*20;
                    padding = "padding-left: "+padding+"px";

                    if(item.show) {
                        if(item.flat){
                            padding  = 0;
                        }
                        itemcount++;
                        resultingList.push(
                            m("tr", { "data-id" : item.id, "data-level": item.level}, [
                                m("td.tdTitle", {"data-id" : item.id, style : padding},  [
                                    m("span", {"data-id" : item.id, "data-level": item.level, onclick: function() { item.status = !item.status; }}, subFix(item)),
                                    m("span", item.id+" "),
                                    m("span", item.title+" ")
                                ]),
                                m("td", item.name + " "),
                                m("td", item.date + " "),
                                m("td", { width : "150"}, [
                                    m("button.btn.btn-danger.btn-sm", {"data-id" : item.id, onclick: m.withAttr("data-id", ctrl.delete)},  " X "),
                                    m("button.btn.btn-success.btn-sm", {"data-id" : item.id, onclick: m.withAttr("data-id", ctrl.add)},  " Add ")
                                ])
                            ]))
                    }
                    //if(item.status){
                                counter++;
                                console.log(counter);
                        redo(item.children);
                    //}

                    });
            } else {
                return;
            }
        }
        redo(ctrl.data());
        return [ m(".row", [ m(".col-xs-12", [
                        m("input.form-control[placeholder='filter'][type='text']", { style:"width:300px", onkeyup: ctrl.filter, value : ctrl.filterText()} ),
                        m("button.btn.btn-default", { onclick: ctrl.expand}, "Expand All"),
                        m("button.btn.btn-default",{ onclick: ctrl.collapse}, "Collapse All")
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
                    m("tbody",
                        resultingList
                    )
                ])
               ]),
            m("div", [
                m("b", "Total Items Shown: "),
                m("span", itemcount)
            ])
        ]
    }

    m.module(document.getElementById("grid"), grid);


