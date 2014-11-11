//
//    Treebeard : hierarchical grid built with Mithril
//    https://github.com/caneruguz/treebeard
//
;
(function (global, factory) {
    "use strict";
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
    "use strict";

    // Indexes by id, shortcuts to the tree objects. Use example: var item = Indexes[23];
    var Indexes = {},
    // Item constructor
        Item,
    // Notifications constructor
        Notify,
    // Initialize and namespace Treebeard module
        Treebeard = {},

    // Create unique ids, we are now using our own ids. Data ids are availbe to user through tree.data
        idCounter = -1;
    function getUID() {
        idCounter = idCounter + 1;
        return idCounter;
    }

    // Check if variable is function
    function isfunction(x) {
        return Object.prototype.toString.call(x) === '[object Function]';
    }

    // Return string if variable is truthy whether its a function or string
    function functionOrString(x) {
        if (!x) {
            return "";
        }
        if (isfunction(x)) {
            return x();
        }
        return x;
    }

    // Sorts ascending based on any attribute on data
    function ascByAttr(data, sortType) {
        if (sortType === "number") {
            return function _numcompare(a, b) {
                return a - b;
            };
        }
        return function _compare(a, b) {
            var titleA = a.data[data].toLowerCase().replace(/\s+/g, " "),
                titleB = b.data[data].toLowerCase().replace(/\s+/g, " ");
            if (titleA < titleB) {
                return -1;
            }
            if (titleA > titleB) {
                return 1;
            }
            return 0;
        };
    }

    // Sorts descending based on any attribute on data
    function descByAttr(data, sortType) {
        if (sortType === "number") {
            return function _numcompare(a, b) {
                return b - a;
            };
        }
        return function _compare(a, b) {
            var titleA = a.data[data].toLowerCase().replace(/\s/g, ''),
                titleB = b.data[data].toLowerCase().replace(/\s/g, '');
            if (titleA > titleB) {
                return -1;
            }
            if (titleA < titleB) {
                return 1;
            }
            return 0;
        };
    }

    // Helper function that removes an item from an array of items based on the value of an attribute of that item
    function removeByProperty(arr, attr, value) {
        var i;
        for (i = 0; i < arr.length; i++) {
            if (arr[i] && arr[i].hasOwnProperty(attr) && (arguments.length > 2 && arr[i][attr] === value)) {
                arr.splice(i, 1);
                return true;
            }
        }
        return false;
    }


    Notify = function _notify(message, type, column, timeout){
        this.column = null ||  column;
        this.type = "info" || type;
        this.message = 'Hello' || message;
        this.on = false;
        this.timeout = 3000 || timeout;
        this.toggle = function(){
            this.on = !this.on;
        };
        this.show = function(){
            this.on = true;
            var self = this;
            if(self.timeout){
                setTimeout(function(){ self.hide(); }, self.timeout);
            }
            m.redraw(true);
        };
        this.hide = function(){
            this.on = false;
            m.redraw(true);
        };
        this.update = function(message, type, column, timeout) {
            this.type = type || this.type;
            this.column = column || this.column;
            this.timeout = timeout || this.timeout;
            this.message = message;
            this.show(true);
        };
        this.selfDestruct = function(treebeard, item, timeout){
            this.on = false;
            this.on = true;
            var self = this;
            var out = timeout || 3000;
            setTimeout(function(){ self.hide(); item.removeSelf(); treebeard.redraw(); }, out);
        }
    };

    // Item constructor
    Item = function _item(data) {
        if (data === undefined) {
            this.data = {};
            this.kind = "folder";
            this.open = true;
        } else {
            this.data = data;
            this.kind = data.kind || "item";
            this.open = data.open;
        }
        this.id = getUID();
        this.depth = 0;
        this.children =  [];
        this.parentID = null;
        this.notify = new Notify();
    };

    // Adds child item into the item
    Item.prototype.add = function _itemAdd(component, toTop) {
        component.parentID = this.id;
        component.depth = this.depth + 1;
        if(component.depth > 1 && component.children.length === 0) {
            component.open = false;
        }
        if (toTop) {
            this.children.unshift(component);
        } else {
            this.children.push(component);
        }
        return this;
    };

    // Move item from one place to another
    Item.prototype.move = function _itemMove(toID) {
        var toItem = Indexes[toID],
            parentID = this.parentID,
            parent = Indexes[parentID];
        toItem.add(this);
        toItem.redoDepth();
        if (parentID > -1) {
            parent.removeChild(parseInt(this.id, 10));
        }
        return this;
    };

    Item.prototype.redoDepth = function _itemRedoDepth() {
        function recursive(items, depth) {
            var i;
            for (i = 0; i < items.length; i++) {
                console.log("i", i, "items[i].id", items[i].id);
                items[i].depth = depth;
                if (items[i].children.length > 0) {
                    recursive(items[i].children, depth + 1);
                }
            }
        }
        recursive(this.children, this.depth + 1);
    };
    // Deletes itself
    Item.prototype.removeSelf = function _itemRemoveSelf() {
        var parent = this.parent();
        parent.removeChild(this.id);
        return this;
    };

    // Deletes child, currently used for delete operations
    Item.prototype.removeChild = function _itemRemoveChild(childID) {
        removeByProperty(this.children, 'id', childID);
        return this;
    };

    // Returns next sibling
    Item.prototype.next = function _itemNext() {
        var next, parent, i;
        parent = Indexes[this.parentID];
        for (i = 0; i < parent.children.length; i++) {
            if (parent.children[i].id === this.id) {
                next = parent.children[i + 1];
                return next;
            }
        }
        if (!next) {
            throw new Error("Treebeard Error: Item with ID '" + this.id + "' has no next sibling");
        }
    };

    // Returns previous sibling
    Item.prototype.prev = function _itemPrev() {
        var prev, parent, i;
        parent = Indexes[this.parentID];
        for (i = 0; i < parent.children.length; i++) {
            if (parent.children[i].id === this.id) {
                prev = parent.children[i - 1];
                return prev;
            }
        }
        if (!prev) {
            throw new Error("Treebeard Error: Item with ID '" + this.id + "' has no previous sibling");
        }
    };

    // Returns single child based on id
    Item.prototype.child = function _itemChild(childID) {
        var child, i;
        for (i = 0; i < this.children.length; i++) {
            if (this.children[i].id === childID) {
                child = this.children[i];
                return child;
            }
        }
        if (!child) {
            throw new Error("Treebeard Error: Parent with ID '" + this.id + "' has no child with ID: " + childID);
        }
    };

    // Returns parent directly above
    Item.prototype.parent = function _itemParent() {
        if (Indexes[this.parentID]) {
            return Indexes[this.parentID];
        }
        return undefined;
    };

    // Sorts children of the item by direction and selected field.
    Item.prototype.sortChildren = function _itemSort(treebeard, direction, sortType, index) {
        var columns = treebeard.options.resolveRows.call(treebeard, this),
            field = columns[index].data;
        if (!direction) {
            throw new Error("Treebeard Error: To sort children you need to pass direction to Item.sortChildren");
        }

        if (this.children.length > 0) {
            if (direction === "asc") {
                this.children.sort(ascByAttr(field, sortType));
            }
            if (direction === "desc") {
                this.children.sort(descByAttr(field, sortType));
            }
        }
    };

    Item.prototype.isAncestor = function _isAncestor(item) {  // Is this item an ancestor of the passed in item?
        function _checkAncestor(a, b) {
            if (a.id === b.id) {
                return true;
            }
            if (a.parent()) {
                return _checkAncestor(a.parent(), b);
            }
            return false;
        }
        return _checkAncestor(item.parent(), this);
    };

    Item.prototype.isDescendant = function (item) {    // Is this item a descendant of the passed in item?
        var i,
            result = false;
        function _checkDescendant(children, b) {
            for (i = 0; i < children.length; i++) {
                if (children[i].id === b.id) {
                    result = true;
                    break;
                }
                if (children[i].children.length > 0) {
                    return _checkDescendant(children[i].children, b);
                }
            }
            return result;
        }
        return _checkDescendant(item.children, this);
    };

    // Treebeard methods
    Treebeard.controller = function _treebeardController() {
        // private variables
        var self = this,                                        // Treebard.controller
            _isSorted = { asc : false, desc : false, column : "" },  // Temporary variables for sorting
            _lastLocation = 0,                                  // The last scrollTop location, updates on every scroll.
            _lastNonFilterLocation = 0;                         // The last scrolltop location before filter was used.

        m.redraw.strategy("all");
        // public variables
        this.flatData = [];                                     // Flat data, gets regenerated often
        this.treeData = {};                                     // The data in hierarchical form
        this.filterText = m.prop("");                           // value of the filtertext input
        this.showRange = [];                                    // Array of indexes that the range shows
        this.options = Treebeard.options;                       // User defined options
        this.selected = undefined;                              // The row selected on click.
        this.mouseon = undefined;                              // The row the mouse is on for mouseover events.
        this.rangeMargin = 0;                                   // Top margin, required for proper scrolling
        this.visibleIndexes = [];                               // List of items viewable as a result of an operation like filter.
        this.visibleTop = undefined;                            // The first visible item.
        this.currentPage = m.prop(1);                           // for pagination
        this.dropzone = null;                                   // Treebeard's own dropzone object
        this.dropzoneItemCache = undefined;                      // Cache of the dropped item
        this.filterOn = false;                                  // Filter state for use across the app

        // Helper function to redraw if user makes changes to the item (like deleting through a hook)
        this.redraw = function _redraw() {
            self.flatten(self.treeData.children, self.visibleTop);
        };

        function moveOn() {
            $(".td-title").draggable({
                helper: "clone",
                delay : 300,
                drag : function (event, ui) {
                    $(ui.helper).css({ 'height' : '25px', 'width' : '400px', 'background' : 'white', 'padding' : '0px 10px', 'box-shadow' : '0 0 4px #ccc'});
                }
            });
            $(".tb-row").droppable({
                tolerance : "fit",
                cursor : "move",
                out: function uiOut() {
                    $('.tb-row.tb-h-success').removeClass('tb-h-success');
                    $('.tb-row.tb-h-error').removeClass('tb-h-error');
                },
                over: function _uiOver(event, ui) {

                    var to, from, toItem, item;
                    to = $(this).attr("data-id");
                    from = ui.draggable.attr("data-id");
                    toItem = Indexes[to];
                    item = Indexes[from];
                    if (to !== from && self.options.movecheck(toItem, item) && self.canMove(toItem, item)) {
                        $(this).addClass('tb-h-success');
                    } else {
                        $(this).addClass('tb-h-error');
                    }
                },
                drop: function _uiDrop(event, ui) {

                    var to, from, toItem, item;
                    to = $(this).attr("data-id");
                    from = ui.draggable.attr("data-id");

                    toItem = Indexes[to];
                    item = Indexes[from];
                    if (to !== from) {
                        if (self.options.movecheck.call(self, toItem, item) && self.canMove(toItem, item)) {
                            item.move(to);
                            self.flatten(self.treeData.children, self.visibleTop);
                            if (self.options.onmove) {
                                self.options.onmove(toItem, item);
                            }
                        } else {
                            if (self.options.movefail) {
                                self.options.movefail.call(self, toItem, item);
                            } else {
                                window.alert("You can't move your item here.");
                            }
                        }
                    }
                    $('.tb-row.tb-h-success').removeClass('tb-h-success');
                    $('.tb-row.tb-h-error').removeClass('tb-h-error');
                }
            });
        }
        // Removes move related instances.
        function moveOff() {
            $(".td-title").draggable("destroy");
            $(".tb-row").droppable("destroy");
        }
        // Deletes item from tree and refreshes view
        this.deleteNode = function _deleteNode(parentID, itemID) {
            var item = Indexes[itemID],
                itemcopy = $.extend({}, item);
            $.when(self.options.deletecheck.call(self, item)).done(function _resolveDeleteCheck(check) {
                if (check) {
                    var parent = Indexes[parentID];
                    parent.removeChild(itemID);
                    self.flatten(self.treeData.children, self.visibleTop);
                    if (self.options.ondelete) {
                        self.options.ondelete.call(self, itemcopy);
                    }
                }
            });
        };

        this.canMove = function _canMove(toItem, fromItem) {
            // is toItem a folder?
            if (toItem.kind !== "folder") {
                return false;
            }
            // is toItem a descendant of fromItem?
            if (toItem.isDescendant(fromItem)) {
                return false;
            }
            return true;
        };

        // Adds a new node;
        this.createItem = function _createItem(item, parentID) {
            var parent = Indexes[parentID];
            var newItem;
            $.when(self.options.createcheck.call(self, item, parent)).done(function _resolveCreateCheck(check) {
                if (check) {
                    newItem = new Item(item);
                    parent.add(newItem, true);
                    self.flatten(self.treeData.children, self.visibleTop);
                    if (self.options.oncreate) {
                        self.options.oncreate.call(self, newItem, parent);
                    }
                } else {
                    throw new Error('Treebeard Error: createcheck function returned false, item not created.');
                }
            });
            return newItem;
        };

        // Returns the object from the tree
        this.find = function _find(id) {
            if (Indexes[id]) {
                return Indexes[id];
            }
            return undefined;
        };

        // Returns the index of an item in the flat row list
        this.returnIndex = function _returnIndex(id) {
            var len = self.flatData.length, i, o;
            for (i = 0; i < len; i++) {
                o = self.flatData[i];
                if (o.id === id) {
                    return i;
                }
            }
            return undefined;
        };

        // Returns whether a single row contains the filtered items, checking if columns can be filtered
        function _rowFilterResult(item) {
            $('#tb-tbody').scrollTop(0);
            self.currentPage(1);
            var cols = self.options.resolveRows.call(self, item);
            var filter = self.filterText().toLowerCase(),
                titleResult = false,
                i,
                o;
            for (i = 0; i < cols.length; i++) {
                o = cols[i];
                if (o.filter && item.data[o.data].toLowerCase().indexOf(filter) !== -1) {
                    titleResult = true;
                }
            }
            return titleResult;
        }

        // runs filter functions and resets depending on whether there is a filter word
        this.filter = function _filter(e) {
            m.withAttr("value", self.filterText)(e);
            var filter = self.filterText().toLowerCase(),
                index = self.visibleTop;
            if (filter.length === 0) {
                self.filterOn = false;
                _calculateVisible(0);
                _calculateHeight();
                m.redraw(true);
                $('#tb-tbody').scrollTop(_lastNonFilterLocation); // restore location of scroll
                if (self.options.onfilterreset) {
                    self.options.onfilterreset.call(self, filter);
                }
            } else {
                if (!self.filterOn) {
                    self.filterOn = true;
                    _lastNonFilterLocation = _lastLocation;
                }
                if (!self.visibleTop) {
                    index = 0;
                }
                _calculateVisible(index);
                _calculateHeight();
                m.redraw(true);
                if (self.options.onfilter) {
                    self.options.onfilter.call(self, filter);
                }
            }
        };

        this.updateFolder = function(data, parent){
            // check state of current children, delete all? empty...
            // check if data is in fact array?
            parent.children = [];
            var child, i;
            for (i = 0; i < data.length; i++) {
                child = self.buildTree(data[i], parent);
                parent.add(child);
            }
            parent.open = true;

        };

        // Toggles whether a folder is collapes or open
        this.toggleFolder = function _toggleFolder(index, event) {
            var len = self.flatData.length,
                tree = Indexes[self.flatData[index].id],
                item = self.flatData[index],
                child,
                skip = false,
                skipLevel = item.depth,
                level = item.depth,
                i,
                j,
                o,
                t,
                lazyLoad;
            //moveOff();
            var icon = $('.tb-row[data-id="'+item.id+'"]').find('.tb-toggle-icon');
            m.render(icon.get(0), m('i.icon-refresh.fangorn-spin'));
            $.when(self.options.resolveLazyloadUrl(self, tree)).done(function _resolveLazyloadDone(url){
                lazyLoad = url;

                if (lazyLoad && item.row.kind === "folder" && tree.open === false) {
                    tree.children = [];
                    m.request({method: "GET", url: lazyLoad})
                        .then(function _getUrlBuildtree(value) {
                            if(!value){
                                self.options.lazyLoadError.call(self, tree);
                            } else {
                                if(!$.isArray(value)){
                                    value = value.data;
                                }
                                for (i = 0; i < value.length; i++) {
                                    child = self.buildTree(value[i], tree);
                                    tree.add(child);
                                }

                                tree.open = true;
                                var iconTemplate = self.options.resolveToggle.call(self, tree);
                                m.render(icon.get(0), iconTemplate);

                            }
                        }, function (info){
                            self.options.lazyLoadError.call(self, tree);
                        })
                        .then(function _getUrlFlatten() {
                            self.flatten(self.treeData.children, self.visibleTop);
                        });

                } else {
                    for (j = index + 1; j < len; j++) {
                        o = self.flatData[j];
                        t = Indexes[self.flatData[j].id];
                        if (o.depth <= level) {break; }
                        if (skip && o.depth > skipLevel) {continue; }
                        if (o.depth === skipLevel) { skip = false; }
                        if (tree.open) {                    // closing
                            o.show = false;
                        } else {                                 // opening
                            o.show = true;
                            if (!t.open) {
                                skipLevel = o.depth;
                                skip = true;
                            }
                        }
                    }
                    tree.open = !tree.open;
                    _calculateVisible(self.visibleTop);
                    _calculateHeight();
                    m.redraw(true);
                    var iconTemplate = self.options.resolveToggle.call(self, tree);
                    m.render(icon.get(0), iconTemplate);
                }
                moveOn();
                if (self.options.ontogglefolder) {
                    self.options.ontogglefolder.call(self, tree);
                }
            });


        };

        // Sorting toggles, incomplete (why incomplete?)
        //
        this.sortToggle = function _isSortedToggle(ev) {
            var element = $(ev.target);
            var type = element.attr('data-direction'),
                index = this,
            //field = $(this).attr('data-field'),
                sortType = element.attr('data-sortType'),
                parent = element.parent(),
                counter = 0,
                redo;
            $('.asc-btn, .desc-btn').addClass('tb-sort-inactive');  // turn all styles off
            _isSorted.asc = false;
            _isSorted.desc = false;
            if (!_isSorted[type]) {
                redo = function _redo(data) {
                    data.map(function _mapToggle(item) {
                        item.sortChildren(self, type, sortType, index);
                        if (item.children.length > 0) { redo(item.children); }
                        counter = counter + 1;
                    });
                };
                self.treeData.sortChildren(self, type, sortType, index);           // Then start recursive loop
                redo(self.treeData.children);
                parent.children('.' + type + '-btn').removeClass('tb-sort-inactive');
                _isSorted[type] = true;
                self.flatten(self.treeData.children, 0);
            }
        };

        // Calculate how tall the wrapping div should be so that scrollbars appear properly
        function _calculateHeight() {
            var itemsHeight;
            if (!self.options.paginate) {
                itemsHeight = self.visibleIndexes.length * self.options.rowHeight;
            } else {
                itemsHeight = self.options.showTotal * self.options.rowHeight;
                self.rangeMargin = 0;
            }
            $('.tb-tbody-inner').height(itemsHeight);
            return itemsHeight;
        }

        // Calculates total number of visible items to return a row height
        function _calculateVisible(rangeIndex) {
            rangeIndex = rangeIndex || 0;
            var len = self.flatData.length,
                total = 0,
                i,
                item;
            self.visibleIndexes = [];
            for (i = 0; i < len; i++) {
                item = Indexes[self.flatData[i].id];
                if (self.filterOn) {
                    if (_rowFilterResult(item)) {
                        total++;
                        self.visibleIndexes.push(i);
                    }
                } else {
                    if (self.flatData[i].show) {
                        self.visibleIndexes.push(i);
                        total = total + 1;
                    }
                }

            }
            self.refreshRange(rangeIndex);
            return total;
        }

        // Refreshes the view to start the the location where begin is the starting index
        this.refreshRange = function _refreshRange(begin) {
            var len = self.visibleIndexes.length,
                range = [],
                counter = 0,
                i,
                index;
            self.visibleTop = begin;
            for (i = begin; i < len; i++) {
                if (range.length === self.options.showTotal) {break; }
                index = self.visibleIndexes[i];
                range.push(index);
                counter = counter + 1;
            }
            self.showRange = range;
            //m.redraw.strategy('none');
            m.redraw(true);
        };

        // Changes view to continous scroll
        this.toggleScroll = function _toggleScroll() {
            self.options.paginate = false;
            $('.tb-paginate').removeClass('active');
            $('.tb-scroll').addClass('active');
            $("#tb-tbody").scrollTop((self.currentPage() - 1) * self.options.showTotal * self.options.rowHeight);
            _calculateHeight();
        };

        // Changes view to paginate
        this.togglePaginate = function _togglePaginate() {
            var firstIndex = self.showRange[0],
                first = self.visibleIndexes.indexOf(firstIndex),
                pagesBehind = Math.floor(first / self.options.showTotal),
                firstItem = (pagesBehind * self.options.showTotal);
            self.options.paginate = true;
            $('.tb-scroll').removeClass('active');
            $('.tb-paginate').addClass('active');
            self.currentPage(pagesBehind + 1);
            _calculateHeight();
            self.refreshRange(firstItem);
        };

        // During pagination goes up one page
        this.pageUp = function _pageUp() {
            // get last shown item index and refresh view from that item onwards
            var lastIndex = self.showRange[self.options.showTotal - 1],
                last = self.visibleIndexes.indexOf(lastIndex);
            if (last > -1 && last + 1 < self.visibleIndexes.length) {
                self.refreshRange(last + 1);
                self.currentPage(self.currentPage() + 1);
            }
        };

        // During pagination goes down one page
        this.pageDown = function _pageDown() {
            var firstIndex = self.showRange[0],
                first = self.visibleIndexes.indexOf(firstIndex);
            if (first && first > 0) {
                self.refreshRange(first - self.options.showTotal);
                self.currentPage(self.currentPage() - 1);
            }
        };

        // During pagination jumps to specific page
        this.goToPage = function _goToPage(value) {
            if (value && value > 0 && value <= (Math.ceil(self.visibleIndexes.length / self.options.showTotal))) {
                var index = (self.options.showTotal * (value - 1));
                self.currentPage(value);
                self.refreshRange(index);
            }
        };

        // Remove dropzone from grid
        function _destroyDropzone() {
            self.dropzone.destroy();
        }

        // Apply dropzone to grid
        function _applyDropzone() {
            if (self.dropzone) { _destroyDropzone(); }               // Destroy existing dropzone setup
            //var eventList = ["drop", "dragstart", "dragend", "dragenter", "dragover", "dragleave", "addedfile", "removedfile", "thumbnail", "error", "processing", "uploadprogress", "sending", "success", "complete", "canceled", "maxfilesreached", "maxfilesexceeded"],
            var options = $.extend({
                clickable : false,
                accept : function _dropzoneAccept(file, done) {
                    if (self.options.addcheck.call(this, self, self.dropzoneItemCache, file)) {
                        $.when(self.options.resolveUploadUrl.call(self, self.dropzoneItemCache))
                            .then(function _resolveUploadUrlThen(newUrl) {
                                if (newUrl) {
                                    self.dropzone.options.url = newUrl;
                                    // self.dropzoneItemCache.open = true;
                                    var index = self.returnIndex(self.dropzoneItemCache.id);
                                    if(!self.dropzoneItemCache.open) {
                                        self.toggleFolder(index, null);
                                    }
                                }
                                return newUrl;
                            })
                            .then(function _resolveUploadMethodThen() {
                                if($.isFunction(self.options.resolveUploadMethod)){
                                    self.dropzone.options.method  = self.options.resolveUploadMethod.call(self, self.dropzoneItemCache);
                                }
                            })
                            .done(function _resolveUploadUrlDone() {
                                done();
                            });
                    }
                },
                drop : function _dropzoneDrop(event) {
                    var rowID =  $(event.target).closest('.tb-row').attr('data-id'),
                        item  = Indexes[rowID];
                    self.dropzoneItemCache = item;
                    if ($.isFunction(self.options.dropzoneEvents.drop)) {
                        self.options.dropzoneEvents.drop.call(this, self, event);
                    }
                },
                dragstart : function _dropzoneDragStart(event) {
                    if ($.isFunction(self.options.dropzoneEvents.dragstart)) {
                        self.options.dropzoneEvents.dragstart.call(this, self, event);
                    }
                },
                dragend : function _dropzoneDragEnd(event) {
                    if ($.isFunction(self.options.dropzoneEvents.dragend)) {
                        self.options.dropzoneEvents.dragend.call(this, self, event);
                    }
                },
                dragenter : function _dropzoneDragEnter(event) {
                    if ($.isFunction(self.options.dropzoneEvents.dragenter)) {
                        self.options.dropzoneEvents.dragenter.call(this, self, event);
                    }
                },
                dragover : function _dropzoneDragOver(event) {
                    if ($.isFunction(self.options.dropzoneEvents.dragover)) {
                        self.options.dropzoneEvents.dragover.call(this, self, event);
                    }
                },
                dragleave : function _dropzoneDragLeave(event) {
                    if ($.isFunction(self.options.dropzoneEvents.dragleave)) {
                        self.options.dropzoneEvents.dragleave.call(this, self, event);
                    }
                },
                success : function _dropzoneSuccess(file, response) {
                    if ($.isFunction(self.options.dropzoneEvents.success)) {
                        self.options.dropzoneEvents.success.call(this, self, file, response);
                    }
                    if ($.isFunction(self.options.onadd)) {
                        self.options.onadd.call(this, self, self.dropzoneItemCache, file, response);
                    }
                },
                error : function _dropzoneError(file, message, xhr) {
                    if ($.isFunction(self.options.dropzoneEvents.error)) {
                        self.options.dropzoneEvents.error.call(this, self, file, message, xhr);
                    }
                },
                uploadprogress : function _dropzoneUploadProgress(file, progress, bytesSent) {
                    if ($.isFunction(self.options.dropzoneEvents.uploadprogress)) {
                        self.options.dropzoneEvents.uploadprogress.call(this, self, file, progress, bytesSent);
                    }
                },
                sending : function _dropzoneSending(file, xhr, formData) {
                    if ($.isFunction(self.options.dropzoneEvents.sending)) {
                        self.options.dropzoneEvents.sending.call(this, self, file, xhr, formData);
                    }
                },
                complete : function _dropzoneComplete(file) {
                    if ($.isFunction(self.options.dropzoneEvents.complete)) {
                        self.options.dropzoneEvents.complete.call(this, self, file);
                    }
                },
                addedfile : function _dropzoneAddedFile(file) {
                    if ($.isFunction(self.options.dropzoneEvents.addedfile)) {
                        self.options.dropzoneEvents.addedfile.call(this, self, file);
                    }
                },


            }, self.options.dropzone);           // Extend default options
            self.dropzone = new Dropzone('#' + self.options.divID, options);            // Initialize dropzone
        }

        function _loadData(data) {
            if ($.isArray(data)) {
                $.when(self.buildTree(data)).then(function _buildTreeThen(value) {
                    self.treeData = value;
                    Indexes[0] = value;
                    self.flatten(self.treeData.children);
                    return value;
                }).done(function _buildTreeDone() {
                    _calculateVisible();
                    _calculateHeight();
                });
            } else {
                // Test that it is a url
                var urlPattern = new RegExp("(http|ftp|https)://[\w-]+(\.[\w-]*)+([\w.,@?^=%&amp;:/~+#-]*[\w@?^=%&amp;/~+#-])?");
                if (self.options.filesData.indexOf('localhost') === -1) {
                    if (!urlPattern.test(self.options.filesData)) {
                        throw new Error("Treebeard Error: Your URL is not valid. Include full path. You provided: " + self.options.filesData);
                    }
                }
                m.request({method: "GET", url: data})
                    .then(function _requestBuildtree(value) {
                        self.treeData = self.buildTree(value);
                    })
                    .then(function _requestFlatten() {
                        Indexes[0] = self.treeData;
                        self.flatten(self.treeData.children);
                    })
                    .then(function _requestCalculate() {
                        //window.console.log("FlatData", self.flatData);
                        //window.console.log("treeData", self.treeData);
                        _calculateVisible();
                        _calculateHeight();

                    });
            }
        }
        // Rebuilds the tree data with an API
        this.buildTree = function _buildTree(data, parent) {
            var tree, children, len, child, i;
            if (Array.isArray(data)) {
                tree = new Item();
                children = data;
            } else {
                tree = new Item(data);
                children = data.children;
                tree.depth = parent.depth + 1;   // Going down the list the parent doesn't yet have depth information
                if (!data.open) {
                    if (parent.depth === 0) {
                        tree.open = true;
                    }
                }
            }
            if (children) {
                len = children.length;
                for (i = 0; i < len; i++) {
                    child = self.buildTree(children[i], tree);
                    tree.add(child);
                }
            }
            return tree;
        };

        // Turns the tree structure into a flat index of nodes
        this.flatten = function _flatten(value, visibleTop) {
            self.flatData = [];
            var openLevel,
                recursive = function redo(data, show, topLevel) {
                    var length = data.length, i, children, flat;
                    for (i = 0; i < length; i++) {
                        if (openLevel && data[i].depth <= openLevel) {
                            show = true;
                        }
                        children = data[i].children;
                        flat = {
                            id: data[i].id,
                            depth : data[i].depth,
                            row: data[i].data
                        };
                        flat.show = show;
                        if (data[i].children.length > 0 && !data[i].open) {
                            show = false;
                            if (!openLevel || openLevel > data[i].depth) { openLevel = data[i].depth; }
                        }
                        self.flatData.push(flat); // add to flatlist
                        if (children.length > 0) {
                            redo(children, show, false);
                        }
                        Indexes[data[i].id] = data[i];
                        if (topLevel && i === length - 1) {
                            _calculateVisible(visibleTop);
                            _calculateHeight();
                            m.redraw(true);
                        }
                    }
                };
            recursive(value, true, true);
            return value;
        };

        // Initializes after the view
        this.init = function _init(el, isInit) {
            if (isInit) { return; }
            var containerHeight = $('#tb-tbody').height();
            self.options.showTotal = Math.floor(containerHeight / self.options.rowHeight);
            if (!self.options.rowHeight) {
                self.options.rowHeight = $('.tb-row').height();
            }
            $('#tb-tbody').scroll(function _scrollHook() {
                if (!self.options.paginate) {
                    var scrollTop, diff, itemsHeight, innerHeight, location, index;
                    scrollTop = $(this).scrollTop();                    // get current scroll top
                    diff = scrollTop - _lastLocation;                    //Compare to last scroll location
                    if (diff > 0 && diff < self.options.rowHeight) {         // going down, increase index
                        $(this).scrollTop(_lastLocation + self.options.rowHeight);
                    }
                    if (diff < 0 && diff > -self.options.rowHeight) {       // going up, decrease index
                        $(this).scrollTop(_lastLocation - self.options.rowHeight);
                    }
                    itemsHeight = _calculateHeight();
                    innerHeight = $(this).children('.tb-tbody-inner').outerHeight();
                    scrollTop = $(this).scrollTop();
                    location = scrollTop / innerHeight * 100;
                    index = Math.round(location / 100 * self.visibleIndexes.length);
                    self.rangeMargin = Math.round(itemsHeight * (scrollTop / innerHeight));
                    self.refreshRange(index);
                    m.redraw(true);
                    _lastLocation = scrollTop;
                }
            });
            if (self.options.allowMove) {
                moveOn();
            }
            if (self.options.uploads) { _applyDropzone(); }
            if($.isFunction(self.options.onload)){
                self.options.onload.call(self);
            }
        };

        // Check if options inclide filesData, this is required to run so throw error if not.
        if (self.options.filesData) {
            _loadData(self.options.filesData);
        } else {
            throw new Error("Treebeard Error: You need to define a data source through 'options.filesData'");
        }
    };

    Treebeard.view = function treebeardView(ctrl) {
        return [
            m('.gridWrapper', {config : ctrl.init},  [
                m(".tb-table", [
                    (function showHeadA() {
                        if (ctrl.options.showFilter || ctrl.options.title) {
                            return m('.tb-head.clearfix', [
                                m(".tb-head-filter", {
                                    style: "width:"+ctrl.options.filterStyle.width+"; float:"+ctrl.options.filterStyle.float
                                }, [
                                    (function showFilterA() {
                                        if (ctrl.options.showFilter) {
                                            return m("input.form-control[placeholder='filter'][type='text']", {
                                                    style: "width:100%;display:inline;",
                                                    onkeyup: ctrl.filter,
                                                    value : ctrl.filterText()
                                                }
                                            );
                                        }
                                    }())
                                ])
                            ]);
                        }
                    }()),
                    m(".tb-row-titles", [
                        ctrl.options.columnTitles.call(ctrl).map(function _mapColumnTitles(col, index) {
                            var sortView = "",
                                up,
                                down;
                            if (col.sort) {
                                if (ctrl.options.sortButtonSelector.up) {
                                    up = ctrl.options.sortButtonSelector.up;
                                } else {
                                    up = 'i.fa.fa-sort-asc';
                                }

                                if (ctrl.options.sortButtonSelector.down) {
                                    down = ctrl.options.sortButtonSelector.down;
                                } else {
                                    down = 'i.fa.fa-sort-desc';
                                }
                                sortView =  [
                                    m(up + '.tb-sort-inactive.asc-btn.m-r-xs', {
                                        onclick: ctrl.sortToggle.bind(index),
                                        "data-direction": "asc",
                                        //"data-field" : col.data,
                                        "data-sortType" : col.sortType
                                    }),
                                    m(down + '.tb-sort-inactive.desc-btn', {
                                        onclick: ctrl.sortToggle.bind(index),
                                        "data-direction": "desc",
                                        //"data-field" : col.data,
                                        "data-sortType" : col.sortType
                                    })
                                ];
                            }
                            return m('.tb-th', { style : "width: " + col.width }, [
                                m('span.padder-10.m-r-sm', col.title),
                                sortView
                            ]);
                        })
                    ]),
                    m("#tb-tbody", [
                        m('.tb-tbody-inner', [
                            m('', { style : "margin-top:" + ctrl.rangeMargin + "px" }, [
                                ctrl.showRange.map(function _mapRangeView(item, index) {
                                    var oddEvenClass = "tb-odd",
                                        indent = ctrl.flatData[item].depth,
                                        id = ctrl.flatData[item].id,
                                        tree = Indexes[id],
                                        row = ctrl.flatData[item].row,
                                        padding,
                                        css = "",
                                        rowCols = ctrl.options.resolveRows.call(ctrl, tree);
                                    if (index % 2 === 0) {
                                        oddEvenClass = "tb-even";
                                    }
                                    if (ctrl.filterOn) {
                                        padding = 20;
                                    } else {
                                        padding = indent * 20;
                                    }
                                    if(tree.notify.on && !tree.notify.column){
                                        return m(".tb-row", [
                                            m('.tb-notify.alert-'+tree.notify.type, [
                                                m('span', tree.notify.message)
                                            ])
                                        ]);
                                    } else {
                                        return m(".tb-row", {
                                            "key" : id,
                                            "class" : css + " " + oddEvenClass,
                                            "data-id" : id,
                                            "data-level": indent,
                                            "data-index": item,
                                            "data-rIndex": index,
                                            style : "height: " + ctrl.options.rowHeight + "px;",
                                            onclick : function _rowClick(event) {
                                                ctrl.selected = id;
                                                if (ctrl.options.onselectrow) {
                                                    ctrl.options.onselectrow.call(ctrl, tree, event);
                                                }
                                            },
                                            onmouseover : function _rowMouseover(event) {
                                                ctrl.mouseon = id;
                                                if (ctrl.options.hoverClass) {
                                                    $('.tb-row').removeClass(ctrl.options.hoverClass);
                                                    $(this).addClass(ctrl.options.hoverClass);
                                                }
                                                if (ctrl.options.onmouseoverrow) {
                                                    ctrl.options.onmouseoverrow.call(ctrl, tree, event);
                                                }
                                            }
                                        }, [
                                            rowCols.map(function _mapColumnsContent(col, index) {
                                                var cell,
                                                    title,
                                                    colInfo = ctrl.options.columnTitles.call(ctrl)[index],
                                                    colcss = col.css ? col.css : '';
                                                cell = m('.tb-td.tb-col-'+index, { 'class' : col.css, style : "width:" + colInfo.width }, [
                                                    m('span', row[col.data])
                                                ]);
                                                if(tree.notify.on && tree.notify.column === index){
                                                    return m('.tb-td.tb-col-'+index, { style : "width:" + colInfo.width },  [
                                                        m('.tb-notify.alert-'+tree.notify.type, [
                                                            m('span', tree.notify.message)
                                                        ])
                                                    ]);
                                                }
                                                if (col.folderIcons) {
                                                    if (col.custom) {
                                                        title = m("span.title-text", col.custom.call(ctrl, tree, col));
                                                    } else {
                                                        title = m("span.title-text", row[col.data] + " ");
                                                    }
                                                    cell = m('.tb-td.td-title.tb-col-'+index, {
                                                        "data-id" : id,
                                                        'class' : colcss,
                                                        style : "padding-left: " + padding + "px; width:" + colInfo.width
                                                    }, [
                                                        m("span.tdFirst", {
                                                                onclick: function _folderToggleClick(event) {
                                                                    if (ctrl.options.togglecheck.call(ctrl, tree)) {
                                                                        ctrl.toggleFolder(item, event);
                                                                    }
                                                                }
                                                            },
                                                            (function _toggleView() {
                                                                var set = [{
                                                                    'id' : 1,
                                                                    'css' : 'tb-expand-icon-holder',
                                                                    'resolve' : ctrl.options.resolveIcon.call(ctrl, tree)
                                                                },{
                                                                    'id' : 2,
                                                                    'css' : 'tb-toggle-icon',
                                                                    'resolve' : ctrl.options.resolveToggle.call(ctrl, tree)
                                                                }]

                                                                if (ctrl.filterOn) {
                                                                    return m('span.'+set[0].css, { key : set[0].id }, set[0].resolve);
                                                                }
                                                                return [m('span.'+set[1].css, { key : set[1].id }, set[1].resolve), m('span.'+set[0].css, { key : set[0].id }, set[0].resolve)];
                                                            }())
                                                        ),
                                                        title
                                                    ]);
                                                }
                                                if (!col.folderIcons && col.custom) {
                                                    cell = m('.tb-td.tb-col-'+index, { 'class' : colcss, style : "width:" + colInfo.width }, [
                                                        col.custom.call(ctrl, tree, col)
                                                    ]);
                                                }
                                                return cell;
                                            })
                                        ]);
                                    }

                                })
                            ])

                        ])
                    ]),
                    (function _footer() {
                        if (ctrl.options.paginate || ctrl.options.paginateToggle) {
                            return m('.tb-footer', [
                                m(".row", [
                                    m(".col-xs-4",
                                        (function _showPaginateToggle() {
                                            if (ctrl.options.paginateToggle) {
                                                var activeScroll = "",
                                                    activePaginate = "";
                                                if (ctrl.options.paginate) {
                                                    activePaginate = "active";
                                                } else {
                                                    activeScroll = "active";
                                                }
                                                return m('.btn-group.padder-10', [
                                                    m("button.btn.btn-default.btn-sm.tb-scroll",
                                                        { onclick : ctrl.toggleScroll, "class" : activeScroll},
                                                        "Scroll"),
                                                    m("button.btn.btn-default.btn-sm.tb-paginate",
                                                        { onclick : ctrl.togglePaginate, "class" : activePaginate },
                                                        "Paginate")
                                                ]);
                                            }
                                        }())
                                    ),
                                    m('.col-xs-8', [ m('.padder-10', [
                                        (function _showPaginate() {
                                            if (ctrl.options.paginate) {
                                                var total_visible = ctrl.visibleIndexes.length,
                                                    total = Math.ceil(total_visible / ctrl.options.showTotal);
                                                if (ctrl.options.resolvePagination) {
                                                    return ctrl.options.resolvePagination.call(ctrl, total, ctrl.currentPage());
                                                }
                                                return m('.tb-pagination.pull-right', [
                                                    m('button.tb-pagination-prev.btn.btn-default.btn-sm.m-r-sm',
                                                        { onclick : ctrl.pageDown},
                                                        [ m('i.fa.fa-chevron-left')]),
                                                    m('input.tb-pagination-input.m-r-sm',
                                                        {
                                                            type : "text",
                                                            style : "width: 30px;",
                                                            onkeyup: function (e) {
                                                                var page = parseInt(e.target.value, 10);
                                                                ctrl.goToPage(page);
                                                            },
                                                            value : ctrl.currentPage()
                                                        }
                                                    ),
                                                    m('span.tb-pagination-span', "/ " + total + " "),
                                                    m('button.tb-pagination-next.btn.btn-default.btn-sm',
                                                        { onclick : ctrl.pageUp},
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
        ];
    };

    // Starts treebard with user options;
    Treebeard.run = function _treebeardRun(options) {
        Treebeard.options = $.extend({
            placement : '',
            divID : "myGrid",
            filesData : "http://localhost:63342/mGrid/demo/small.json",
            rowHeight : undefined,         // user can override or get from .tb-row height
            showTotal : 15,         // Actually this is calculated with div height, not needed. NEEDS CHECKING
            paginate : false,       // Whether the applet starts with pagination or not.
            paginateToggle : false, // Show the buttons that allow users to switch between scroll and paginate.
            uploads : true,         // Turns dropzone on/off.
            filterStyle : { float : 'right', width : '50%'},
            columnTitles : function() {
                return [
                    {
                        title: "Title",
                        width: "50%",
                        sortType : "text",
                        sort : true
                    },
                    {
                        title: "Author",
                        width : "25%",
                        sortType : "text"
                    },
                    {
                        title: "Age",
                        width : "10%",
                        sortType : "number"
                    },
                    {
                        title: "Actions",
                        width : "15%"
                    }
                ]},
            resolveRows : function (item) {
                return [            // Defines columns based on data
                    {
                        data : "title",  // Data field name
                        folderIcons : true,
                        filter : true
                    },
                    {
                        data : "person",
                        filter : true
                    },
                    {
                        data : "age",
                        filter : false
                    },
                    {
                        data : "action",
                        sortInclude : false,
                        custom : function (row, col) {
                            var that = this;
                            return m("button.btn.btn-danger.btn-xs", {
                                onclick: function _deleteClick(e) {
                                    e.stopPropagation();
                                    that.deleteNode(row.parentID, row.id);
                                }
                            }, " X ");
                        }
                    }
                ];
            },
            hoverClass : undefined,
            showFilter : true,     // Gives the option to filter by showing the filter box.
            title : "Grid Title",          // Title of the grid, boolean, string OR function that returns a string.
            allowMove : true,       // Turn moving on or off.
            sortButtonSelector : {}, // custom buttons for sort
            onload : function () {
                // this = treebeard object;
                console.log("onload this", this);
            },
            togglecheck : function (item) {
                // this = treebeard object;
                // item = folder to toggle
                return true;

            },
            onfilter : function (filterText) {   // Fires on keyup when filter text is changed.
                // this = treebeard object;
                // filterText = the value of the filtertext input box.
                window.console.log("on filter: this", this, 'filterText', filterText);
            },
            onfilterreset : function (filterText) {   // Fires when filter text is cleared.
                // this = treebeard object;
                // filterText = the value of the filtertext input box.
                window.console.log("on filter reset: this", this, 'filterText', filterText);
            },
            createcheck : function (item, parent) {
                // this = treebeard object;
                // item = Item to be added.  raw item, not _item object
                // parent = parent to be added to = _item object
                window.console.log("createcheck", this, item, parent);
                return true;
            },
            oncreate : function (item, parent) {  // When row is deleted successfully
                // this = treebeard object;
                // item = Item to be added.  = _item object
                // parent = parent to be added to = _item object
                window.console.log("oncreate", this, item, parent);
            },
            deletecheck : function (item) {  // When user attempts to delete a row, allows for checking permissions etc.
                // this = treebeard object;
                // item = Item to be deleted.
                window.console.log("deletecheck", this, item);
                return true;
            },
            ondelete : function () {  // When row is deleted successfully
                // this = treebeard object;
                // item = a shallow copy of the item deleted, not a reference to the actual item
                window.console.log("ondelete", this);
            },
            movecheck : function (to, from) { //This method gives the users an option to do checks and define their return
                // this = treebeard object;
                // from = item that is being moved
                // to = the target location
                window.console.log("movecheck: to", to, "from", from);
                return true;
            },
            onmove : function (to, from) {  // After move happens
                // this = treebeard object;
                // to = actual tree object we are moving to
                // from = actual tree object we are moving
                window.console.log("onmove: to", to, "from", from);
            },
            movefail : function (to, from) { //This method gives the users an option to do checks and define their return
                // this = treebeard object;
                // from = item that is being moved
                // to = the target location
                window.console.log("moovefail: to", to, "from", from);
                return true;
            },
            addcheck : function (treebeard, item, file) {
                // this = dropzone object
                // treebeard = treebeard object
                // item = item to be added to
                // file = info about the file being added
                window.console.log("Add check", this, treebeard, item, file);
                return true;
            },
            onadd : function (treebeard, item, file, response) {
                // this = dropzone object;
                // item = item the file was added to
                // file = file that was added
                // response = what's returned from the server
                window.console.log("On add", this, treebeard, item, file, response);
            },
            onselectrow : function (row, event) {
                // this = treebeard object
                // row = item selected
                // event = mouse click event object
                window.console.log("onselectrow", this, row, event);
            },
            onmouseoverrow : function (row, event) {
                // this = treebeard object
                // row = item selected
                // event = mouse click event object
                window.console.log("onmouseoverrow", this, row, event);
            },
            ontogglefolder : function (item) {
                // this = treebeard object
                // item = toggled folder item
                window.console.log("ontogglefolder", this, item);
            },
            dropzone : {                                           // All dropzone options.
                url: "http://www.torrentplease.com/dropzone.php",  // When users provide single URL for all uploads
            },
            dropzoneEvents : {},
            resolveIcon : function (item) {     // Here the user can interject and add their own icons, uses m()
                // this = treebeard object;
                // Item = item acted on
                if (item.kind === "folder") {
                    if (item.open) {

                        return m("i.fa.fa-folder-open-o", " ");
                    }
                    return m("i.fa.fa-folder-o", " ");
                }
                if (item.data.icon) {
                    return m("i.fa." + item.data.icon, " ");
                }
                return m("i.fa.fa-file ");
            },
            resolveToggle : function (item) {
                var toggleMinus = m("i.fa.fa-minus-square-o", " "),
                    togglePlus = m("i.fa.fa-plus-square-o", " ");
                if (item.kind === "folder") {
                    if (item.children.length > 0) {
                        if (item.open) {
                            return toggleMinus;
                        }
                        return togglePlus;
                    }
                }
                return "";
            },
            resolvePagination : function (totalPages, currentPage) {
                // this = treebeard object
                window.console.log("resolvePAgination: totalPages: ", totalPages, " currentPage: ", currentPage);
                return m("span", "totalPages: " + totalPages + " currentPage: " + currentPage);
            },
            resolveUploadUrl : function (item) {  // Allows the user to calculate the url of each individual row
                // this = treebeard object;
                // Item = item acted on return item.data.ursl.upload
                window.console.log("resolveUploadUrl", this, item);
                return "/upload";
            },
            resolveLazyloadUrl : function (item) {
                // this = treebeard object;
                // Item = item acted on
                window.console.log("resolveLazyloadUrl", this, item);
                return false;
            },
            lazyLoadError : function (item){
                // this = treebeard object;
                // Item = item acted on
            }

        }, options);
        return m.module(document.getElementById(Treebeard.options.divID), Treebeard);
    };

    return Treebeard;
}));