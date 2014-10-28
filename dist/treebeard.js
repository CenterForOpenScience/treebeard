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
        console.log(sortType);
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
     //
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
     //
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

     // Item constructor
     //
    Item = function _item(data) {
        if (data === undefined) {
            this.data = {};
            this.kind = "folder";
        } else {
            this.data = data;
            this.kind = data.kind || "item";
        }
        this.id = getUID();
        this.depth = 0;
        this.children =  [];
        this.parentID = null;
    };

     // Adds child item into the item
     //
    Item.prototype.add = function _itemAdd(component) {
        component.parentID = this.id;
        component.depth = this.depth + 1;
        this.children.push(component);
        this.open = true;
        return this;
    };

     // Move item from one place to another
     //
    Item.prototype.move = function _itemMove(toID) {
        var toItem = Indexes[toID],
            parentID = this.parentID,
            parent = Indexes[parentID];
        toItem.add(this);
        toItem.redoDepth();
        if (parentID > -1) {
            parent.removeChild(parseInt(this.id, 10));
        }
    };

    Item.prototype.redoDepth = function _itemRedoDepth() {
        var i;
        function recursive(items, depth) {
            for (i = 0; i < items.length; i++) {
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
     //
    Item.prototype.removeChild = function _itemRemoveChild(childID) {
        removeByProperty(this.children, 'id', childID);
        return this;
    };

     // Returns next sibling
     //
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
    Item.prototype.sortChildren = function _itemSort(direction, field, sortType) {
        if (!direction || !field) {
            throw new Error("Treebeard Error: To sort children you need to pass both direction and field to Item.sortChildren");
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

        // public variables
        this.flatData = [];                                     // Flat data, gets regenerated often
        this.treeData = {};                                     // The data in hierarchical form
        this.filterText = m.prop("");                           // value of the filtertext input
        this.showRange = [];                                    // Array of indexes that the range shows
        this.options = Treebeard.options;                       // User defined options
        this.selected = undefined;                              // The row selected on click.  
        this.rangeMargin = 0;                                   // Top margin, required for proper scrolling
        this.visibleIndexes = [];                               // List of items viewable as a result of an operation like filter.
        this.visibleTop = undefined;                            // The first visible item. 
        this.currentPage = m.prop(1);                           // for pagination
        this.dropzone = null;                                   // Treebeard's own dropzone object
        this.droppedItemCache = undefined;                      // Cache of the dropped item
        this.filterOn = false;                                  // Filter state for use across the app

        // Helper function to redraw if user makes changes to the item (like deleting through a hook)
        this.redraw = function _redraw() {
            self.flatten(self.treeData.children, self.visibleTop);
        };

        function moveOn() {
            $(".td-title").draggable({
                helper: "clone",
                drag : function (event, ui) {
                    $(ui.helper).css({ 'background' : 'white', 'padding' : '5px 10px', 'box-shadow' : '0 0 4px #ccc'});
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
                        $(this).addClass('tb-h-success');  // A TODO: style dictionary so people can override.
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
        // A TODO On resize of the main container rerun showtotal; .

        // Adds a new node;
        this.createItem = function _createItem(item, parentID) {
            var parent = Indexes[parentID];
            $.when(self.options.createcheck.call(self, item, parent)).done(function _resolveCreateCheck(check) {
                if (check) {
                    var newItem = new Item(item);
                    parent.add(newItem);
                    self.flatten(self.treeData.children, self.visibleTop);
                    if (self.options.oncreate) {
                        self.options.oncreate.call(self, newItem, parent);
                    }
                } else {
                    throw new Error("Treebeard Error: createcheck function returned false, item not created.");
                }
            });

        };

         // Returns the object from the tree
         //
        this.find = function _find(id) {
            return Indexes[id];
        };

         // Returns the index of an item in the flat row list
         //
        function _returnIndex(id) {
            var len = self.flatData.length, i, o;
            for (i = 0; i < len; i++) {
                o = self.flatData[i];
                if (o.row.id === id) {
                    return i;
                }
            }
        }
        /*
        var firstIndex = self.showRange[0],
                first = self.visibleIndexes.indexOf(firstIndex),
                pagesBehind = Math.floor(first / self.options.showTotal),
                firstItem = (pagesBehind * self.options.showTotal);
            self.options.paginate = true;
            $('.tb-scroll').removeClass('active');
            $('.tb-paginate').addClass('active');
            self.currentPage(pagesBehind + 1);
            self.refreshRange(firstItem);
        */

         // Returns whether a single row contains the filtered items
        function _rowFilterResult(row) {
            $('#tb-tbody').scrollTop(0);
            self.currentPage(1);
            var filter = self.filterText().toLowerCase(),
                titleResult = row.title.toLowerCase().indexOf(filter); // A TODO: filter options; filterable option for columns, then row_filter checks for wht is filterable. Title sholdn't be hardcoded.
            if (titleResult > -1) {
                return true;
            }
            return false;
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
                //console.log(_lastNonFilterLocation);
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

         // Toggles whether a folder is collapes or open
        this.toggleFolder = function _toggleFolder(topIndex, index, event) {
            var len = self.flatData.length,
                tree = Indexes[self.flatData[index].id],
                item = self.flatData[index],
                child,
                skip = false,
                skipLevel = item.depth,
                level = item.depth,
                i,
                j,
                o;
            //moveOff();
            if (self.options.resolveLazyloadUrl && item.row.kind === "folder" && item.row.children.length === 0) {
                $.when(self.options.resolveLazyloadUrl(self, tree)).done(function _resolveLazyloadDone(url) {
                    m.request({method: "GET", url: url})
                        .then(function _getUrlBuildtree(value) {
                            for (i = 0; i < value.length; i++) {
                                child = self.buildTree(value[i], tree);
                                tree.add(child);
                            }
                            tree.data.open = true;
                        })
                        .then(function _getUrlFlatten() {
                            self.flatten(self.treeData.children, topIndex);
                        });
                });
            } else {
                for (j = index + 1; j < len; j++) {
                    o = self.flatData[j];
                    if (o.depth <= level) {break; }
                    if (skip && o.depth > skipLevel) {continue; }
                    if (o.depth === skipLevel) { skip = false; }
                    if (item.row.open) {                    // closing
                        o.show = false;
                    } else {                                 // opening
                        o.show = true;
                        if (!o.row.open) {
                            skipLevel = o.depth;
                            skip = true;
                        }
                    }
                }
                item.row.open = !item.row.open;
                _calculateVisible(topIndex);
                _calculateHeight();
                m.redraw(true);
            }
            moveOn();
            if (self.options.ontogglefolder) {
                self.options.ontogglefolder.call(self, tree, event);
            }
        };

         // Sorting toggles, incomplete (why incomplete?) 
         //
        this.sortToggle = function _isSortedToggle() {
            var type = $(this).attr('data-direction'),
                field = $(this).attr('data-field'),
                sortType = $(this).attr('data-sortType'),
                parent = $(this).parent(),
                counter = 0,
                redo;
            $('.asc-btn, .desc-btn').addClass('tb-sort-inactive');  // turn all styles off
            _isSorted.asc = false;
            _isSorted.desc = false;
            if (!_isSorted[type]) {
                redo = function _redo(data) {
                    data.map(function _mapToggle(item) {
                        item.sortChildren(type, field, sortType);
                        if (item.children.length > 0) { redo(item.children); }
                        counter = counter + 1;
                    });
                };
                self.treeData.sortChildren(type, field, sortType);           // Then start recursive loop
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
                o;
            self.visibleIndexes = [];
            for (i = 0; i < len; i++) {
                o = self.flatData[i].row;
                if (self.filterOn) {
                    if (_rowFilterResult(o)) {
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
            m.redraw.strategy('none');
            m.redraw(true);
        };

         // Changes view to continous scroll
        this.toggleScroll = function _toggleScroll() {
            self.options.paginate = false;
            $('.tb-paginate').removeClass('active');
            $('.tb-scroll').addClass('active');
            //console.log(_lastLocation);
            $("#tb-tbody").scrollTop((self.currentPage() - 1) * self.options.showTotal * self.options.rowHeight);
            _calculateHeight();
        };

         // Changes view to paginate
        this.togglePaginate = function _togglePaginate() {  // A TODO Check view reg pagination vs scroll, default behavior
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
         //
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
        //
        function _destroyDropzone() {
            self.dropzone.destroy();
        }

        // Apply dropzone to grid
        function _applyDropzone() {
            if (self.dropzone) { _destroyDropzone(); }               // Destroy existing dropzone setup
            var eventList = ["drop", "dragstart", "dragend", "dragenter", "dragover", "dragleave", "addedfile", "removedfile", "thumbnail", "error", "processing", "uploadprogress", "sending", "success", "complete", "canceled", "maxfilesreached", "maxfilesexceeded"],
                options = $.extend({
                    init: function _dropzoneInit() {
                        var ev,
                            dropzone,
                            i;
                        for (i = 0; i < eventList.length; i++) {
                            ev = eventList[i];
                            if (self.options.dropzone[ev]) {
                                dropzone = this;
                                this.on(ev, function (arg) { self.options.dropzone[ev].call(dropzone, self, arg); });
                            }
                        }
                    },
                    clickable : false,
                    accept : function _dropzoneAccept(file, done) {
                        if (self.options.addcheck.call(this, self, self.droppedItemCache, file)) {
                            $.when(self.options.resolveUploadUrl.call(self, self.droppedItemCache))
                                .then(function _resolveUploadUrlThen(newUrl) {
                                    if (newUrl) {
                                        self.dropzone.url = newUrl;
                                    }
                                    return newUrl;
                                })
                                .done(function _resolveUploadUrlDone() {
                                    done();
                                });
                        } else {
                            window.alert("This isn't allowed");
                        }
                    },
                    drop : function _dropzoneDrop(event) {
                        var rowID =  $(event.target).closest('.tb-row').attr('data-id'),
                            item  = Indexes[rowID];
                        self.droppedItemCache = item;
                    },
                    success : function _dropzoneSuccess(file, response) {
                        var mockTree = new Item();
                        self.droppedItemCache.add(mockTree);
                        self.flatten(self.treeData.children, self.visibleTop);
                        if (self.options.onadd) {
                            self.options.onadd.call(this, self, self.droppedItemCache, file, response);
                        }
                    }
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
            } else { // A TODO: check if proper url:
                // Test that it is a url
                var urlPattern = new RegExp("(http|ftp|https)://[\w-]+(\.[\w-]*)+([\w.,@?^=%&amp;:/~+#-]*[\w@?^=%&amp;/~+#-])?");
                if (!urlPattern.test('http://www.google.com')) {
                    throw new Error("Treebeard Error: Your URL is not valid. Include full path. You provided: " + self.options.filesData);
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
                        window.console.log("FlatData", self.flatData);
                        window.console.log("treeData", self.treeData);
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
            var openLevel = 1,
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
                        if (data[i].children.length > 0 && !data[i].data.open) {
                            show = false;
                            if (openLevel > data[i].depth) { openLevel = data[i].depth; }
                        }
                        self.flatData.push(flat); // add to flatlist
                        if (children.length > 0) {
                            redo(children, show, false);
                        }
                        Indexes[data[i].id] = data[i];
                        if (topLevel && i === length - 1) {
                            _calculateVisible(visibleTop);
                            _calculateHeight();
                            m.redraw();
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
                if (!self.paginate) {
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
        };

        _loadData(Treebeard.options.filesData);
    };

    Treebeard.view = function treebeardView(ctrl) {
        window.window.console.log(ctrl.showRange);
        return [
            m('.gridWrapper', {config : ctrl.init},  [
                m(".tb-table", [
                    (function showHeadA() {
                        if (ctrl.options.showFilter || ctrl.options.title) {
                            return m('.tb-head', [
                                m(".tb-head-title", [
                                    m("h3", functionOrString(ctrl.options.title))
                                ]),
                                m(".tb-head-filter", [
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
                        ctrl.options.columns.map(function _mapColumnTitles(col) {
                            var sortView = "";
                            if (col.sort) {
                                sortView =  [
                                    m('i.fa.fa-sort-asc.tb-sort-inactive.asc-btn.m-r-xs', {
                                        onclick: ctrl.sortToggle,
                                        "data-direction": "asc",
                                        "data-field" : col.data,
                                        "data-sortType" : col.sortType
                                    }),
                                    m('i.fa.fa-sort-desc.tb-sort-inactive.desc-btn', {
                                        onclick: ctrl.sortToggle,
                                        "data-direction": "desc",
                                        "data-field" : col.data,
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
                                        css;
                                    if (index % 2 === 0) {
                                        oddEvenClass = "tb-even";
                                    }
                                    if (ctrl.filterOn) {
                                        padding = 0;
                                    } else {
                                        padding = indent * 20;
                                    }
                                    if (id === ctrl.selected) { css = "tb-row-active"; } else { css = ""; }
                                    return m(".tb-row", {
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
                                        }
                                    }, [
                                        ctrl.options.columns.map(function _mapColumnsContent(col) {
                                            var cell;
                                            cell = m(".tb-td", { style : "width:" + col.width }, [
                                                m('span', row[col.data])
                                            ]);
                                            if (col.folderIcons === true) {
                                                cell = m(".tb-td.td-title", {
                                                    "data-id" : id,
                                                    style : "padding-left: " + padding + "px; width:" + col.width
                                                }, [
                                                    m("span.tdFirst", {
                                                        onclick: function _folderToggleClick(event) {
                                                            ctrl.toggleFolder(ctrl.visibleTop, item, event);
                                                        }
                                                    },
                                                        (function _toggleView() {
                                                            var toggleMinus = m("span.tb-expand-icon-holder",
                                                                    m("i.fa.fa-minus-square-o", " ")
                                                                    ),
                                                                togglePlus = m("span.tb-expand-icon-holder",
                                                                    m("i.fa.fa-plus-square-o", " ")
                                                                    ),
                                                                resolveIcon = m("span.tb-expand-icon-holder",
                                                                    ctrl.options.resolve_icon.call(ctrl, tree)
                                                                    );
                                                            if (ctrl.filterOn) {
                                                                return resolveIcon;
                                                            }
                                                            if (row.kind === "folder") {
                                                                if (row.children.length > 0) {
                                                                    if (row.open) {
                                                                        return [toggleMinus, resolveIcon];
                                                                    }
                                                                    return [togglePlus, resolveIcon];
                                                                }
                                                            }
                                                            return [m("span.tb-expand-icon-holder"), resolveIcon];
                                                        }())
                                                        ),
                                                    m("span.title-text", row[col.data] + " ")
                                                ]);
                                            }
                                            if (col.custom) {
                                                cell = m(".tb-td", { style : "width:" + col.width }, [
                                                    col.custom.call(ctrl, tree, col)
                                                ]);
                                            }
                                            return cell;
                                        })

                                    ]);
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
                                                return m('.btn-group.padder-10', [
                                                    m("button.btn.btn-default.btn-sm.active.tb-scroll",
                                                        { onclick : ctrl.toggleScroll },
                                                        "Scroll"),
                                                    m("button.btn.btn-default.btn-sm.tb-paginate",
                                                        { onclick : ctrl.togglePaginate },
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
                                                return m('.pull-right', [
                                                    m('button.btn.btn-default.btn-sm',
                                                        { onclick : ctrl.pageDown},
                                                        [ m('i.fa.fa-chevron-left')]),
                                                    m('input.h-mar-10',
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
                                                    m('span', "/ " + total + " "),
                                                    m('button.btn.btn-default.btn-sm',
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
     //
    Treebeard.run = function _treebeardRun(options) {
        Treebeard.options = $.extend({
            divID : "myGrid",
            filesData : "small.json",
            rowHeight : undefined,         // user can override or get from .tb-row height
            showTotal : 15,         // Actually this is calculated with div height, not needed. NEEDS CHECKING
            paginate : false,       // Whether the applet starts with pagination or not.
            paginateToggle : false, // Show the buttons that allow users to switch between scroll and paginate.
            uploads : true,         // Turns dropzone on/off.
            columns : [           // Defines columns based on data
                {
                    title: "Title",
                    width : "50%",
                    data : "title",  // Data field name
                    sort : true,
                    sortType : "text",
                    folderIcons : true
                }
            ],
            showFilter : true,     // Gives the option to filter by showing the filter box.
            title : "Grid Title",          // Title of the grid, boolean, string OR function that returns a string.
            allowMove : true,       // Turn moving on or off.
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
            ontogglefolder : function (item, event) {
                // this = treebeard object
                // item = toggled folder item
                // event = mouse click event object
                window.console.log("ontogglefolder", this, item, event);
            },
            dropzone : {                                           // All dropzone options.
                url: "http://www.torrentplease.com/dropzone.php",  // When users provide single URL for all uploads
                dragstart : function (treebeard, event) {     // An example dropzone event to override.
                    // this = dropzone object
                    // treebeard = treebeard object
                    // event = event passed in
                    window.console.log("dragstart", this, treebeard, event);
                }
            },
            resolve_icon : function (item) {     // Here the user can interject and add their own icons, uses m()
                // this = treebeard object;
                // Item = item acted on
                try {
                    if (item.kind === "folder") {
                        return m("i.fa.fa-folder-o", " ");
                    }
                } catch (e) {
                    window.console.log("Item", item, "e", e);
                }

                if (item.data.icon) {
                    return m("i.fa." + item.data.icon, " ");
                }
                return m("i.fa.fa-file ");
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
                return "small.json";
            }

        }, options);
        m.module(document.getElementById(Treebeard.options.divID), Treebeard);
    };

    return Treebeard;
}));
