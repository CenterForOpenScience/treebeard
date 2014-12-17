/**
 * Treebeard : hierarchical grid built with Mithril
 * https://github.com/caneruguz/treebeard
 * Built by Center for Open Science -> http://www.cos.io
 */
;
(function (global, factory) {
    "use strict";
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jQuery', 'mithril'], factory);
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        var m = require('mithril');
        module.exports = factory(jQuery, m);
    } else {
        // Browser globals (root is window)
        var m = global.m;
        global.Treebeard = factory(jQuery, m);
    }
}(this, function (jQuery, m) {
    "use strict";

    // Indexes by id, shortcuts to the tree objects. Use example: var item = Indexes[23];
    var Indexes = {},
    // Item constructor
        Item,
    // Notifications constructor
        Notify,
    // Modal for box-wide errors
        Modal,
    // Initialize and namespace Treebeard module
        Treebeard = {};
    // Create unique ids, we are now using our own ids. Data ids are availbe to user through tree.data
    // we are using globals here because of mithril views with unique keys for rows in case we have multiple
    // instances of treebeard on the same page.
    if (!window.treebeardCounter) {
        window.treebeardCounter = -1;
    }

    /**
     * Gets the incremented idCounter as a unique id
     * @returns {Number} idCounter The state of id counter after incementing
     */
    function getUID() {
        window.treebeardCounter = window.treebeardCounter  + 1;
        return window.treebeardCounter ;
    }

    /**
     * Checks whether the argument passed is a string or function, useful for allowing different types of options to be set
     * @param {Mixed} x Argument passed, can be anything
     * @returns {Mixed} x If x is a function returns the execution, otherwise returns x as it is, expecting it to be a string.
     */
    function functionOrString(x) {
        if (!x) {
            return "";
        }
        if ($.isFunction(x)) {
            return x();
        }
        return x;
    }

    /**
     * Sorts ascending based on any attribute on data
     * @param {String} data The property of the object to be checked for comparison
     * @param {String} sortType Whether sort is pure numbers of alphanumerical,
     * @returns {Number} result The result of the comparison function, 0 for equal, -1 or 1 for one is bigger than other.
     */
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

    /**
     * Sorts descending based on any attribute on data
     * @param {String} data The property of the object to be checked for comparison
     * @param {String} sortType Whether sort is pure numbers of alphanumerical,
     * @returns {Number} result The result of the comparison function, 0 for equal, -1 or 1 for one is bigger than other.
     */
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

    /**
     * Helper function that removes an item from an array of items based on the value of an attribute of that item
     * @param {Array} arr The array that item needs to be removed from
     * @param {String} attr The property based on which the removal should happen
     * @param {String} value The value that needs to match the property for removal to happen
     * @returns {Boolean} done Whether the remove was successful.
     */
    function removeByProperty(arr, attr, value) {
        var i,
            done = false;
        for (i = 0; i < arr.length; i++) {
            if (arr[i] && arr[i].hasOwnProperty(attr) && (arguments.length > 2 && arr[i][attr] === value)) {
                arr.splice(i, 1);
                done = true;
                return done;
            }
        }
        return done;
    }

    /**
     * Implementation of a notification system, added to each row
     * @param {String} [message] Notification message
     * @param {String} [tpe] One of the bootstrap alert types (info, danger, warning, success, primary, default)
     * @param {Number} [column] Which column the message should replace, if empty the entire row will be used
     * @param {Number} [timeout] Milliseconds that takes for message to be removed.
     * @constructor
     */
    Notify = function _notify(message, type, column, timeout) {
        this.column = column || null;
        this.type = type || "info";
        this.message =  message || 'Hello';
        this.on = false;
        this.timeout = timeout || 3000;
        this.css = '';
        this.toggle = function () {
            this.on = !this.on;
        };
        this.show = function () {
            this.on = true;
            var self = this;
            if (self.timeout) {
                setTimeout(function () { self.hide(); }, self.timeout);
            }
            m.redraw(true);
        };
        this.hide = function () {
            this.on = false;
            m.redraw(true);
        };
        this.update = function(message, type, column, timeout, css) {
            this.type = type || this.type;
            this.column = column || this.column;
            this.timeout = timeout || this.timeout;
            this.message = message;
            this.css = css || '';
            this.show(true);
        };
        this.selfDestruct = function (treebeard, item, timeout) {
            this.on = false;
            this.on = true;
            var self = this,
                out = timeout || 3000;
            setTimeout(function () { self.hide(); item.removeSelf(); treebeard.redraw(); }, out);
        };
    };

    /**
     * Implementation of a modal system, currently used once sitewide
     * @constructor
     */

    Modal = function _modal() {
        var el = $('#tb-tbody'),
            self = this;
        this.on = false;
        this.timeout = false;
        this.css = '';
        this.content = null;
        this.actions = null;
        this.height = el.height();
        this.width = el.width();
        this.dismiss = function () {
            this.on = false;
            m.redraw(true);
        };
        this.show = function () {
            this.on = true;
            if (self.timeout) {
                setTimeout(function () { self.dismiss(); }, self.timeout);
            }
            m.redraw(true);
        };
        this.toggle = function () {
            this.on = !this.on;
            m.redraw(true);
        };
        this.update = function (contentMithril, actions) {
            self.updateSize();
            if (contentMithril) {
                this.content = contentMithril;
            }
            if (actions) {
                this.actions = actions;
            }
            this.on = true;
            m.redraw(true);
        };
        this.updateSize = function () {
            this.height = el.height();
            this.width = el.width();
            m.redraw(true);
        };
        $(window).resize(function () {
            self.updateSize();
        });
    };

    /**
     * Builds an _item that uses item related api calls, what we mean when we say "constructed by _item"
     * @param {Object} data Raw data to be converted into an item
     * @returns {Object} this Returns itself with the new properties.
     * @constructor
     */
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
        if (this.kind === 'folder') {
            this.load = false;
        }
        this.id = getUID();
        this.depth = 0;
        this.children =  [];
        this.parentID = null;
        this.notify = new Notify();
    };

    /**
     * Add a child item into the item and correctly assign depth and other properties
     * @param {Object} component Item created with cosntructor _item, missing depth information
     * @param {Boolean} [toTop] Whether the item should be added to the top or bottom of children array
     * @returns {Object} this The current item.
     */
    Item.prototype.add = function _itemAdd(component, toTop) {
        component.parentID = this.id;
        component.depth = this.depth + 1;
        component.open = false;
        component.load = false;
        if (component.depth > 1 && component.children.length === 0) {
            component.open = false;
        }
        if (toTop) {
            this.children.unshift(component);
        } else {
            this.children.push(component);
        }
        return this;
    };

    /**
     * Move item from one place to another within the tree
     * @param {Number} toID Unique id of the container item to move to
     * @returns {Object} this The current item.
     */
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

    /**
     * Reassigns depth information when tree manipulations happen so depth remains accurate within object descendants
     */
    Item.prototype.redoDepth = function _itemRedoDepth() {
        function recursive(items, depth) {
            var i;
            for (i = 0; i < items.length; i++) {
                items[i].depth = depth;
                if (items[i].children.length > 0) {
                    recursive(items[i].children, depth + 1);
                }
            }
        }
        recursive(this.children, this.depth + 1);
    };

    /**
     * Deletes itself
     * @param {Number} childID Id of the child inside this item
     * @returns {Object} parent The parent of the removed item
     */
    Item.prototype.removeSelf = function _itemRemoveSelf() {
        var parent = this.parent();
        parent.removeChild(this.id);
        return parent;
    };

    /**
     * Deletes child from item by unique id
     * @param {Number} childID Id of the child inside this item
     * @returns {Object} this The item containing the child
     */
    Item.prototype.removeChild = function _itemRemoveChild(childID) {
        removeByProperty(this.children, 'id', childID);
        return this;
    };

    /**
     * Returns next sibling based on position in the parent list
     * @returns {Object} next The next object constructed by _item
     */
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

    /**
     * Returns previous sibling based on position in the parent list
     * @returns {Object} prev The previous object constructed by _item
     */
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

    /**
     * Returns single child based on id
     * @param {Number} childID Id of the child inside this item
     * @returns {Object} child The child object constructed by _item
     */
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

    /**
     * Returns parent of the item one level above
     * @returns {Object} parent The parent object constructed by _item
     */
    Item.prototype.parent = function _itemParent() {
        if (Indexes[this.parentID]) {
            return Indexes[this.parentID];
        }
        return undefined;
    };

    /**
     * Sorts children of the item by direction and selected field.
     * @param {Object} treebeard The instance of the treebeard controller being used
     * @param {String} direction Sort direction, can be 'asc' or 'desc'
     * @param {String} sortType Whether the sort type is number or alphanumeric
     * @param {Number} index The index of the column, needed to find out which field to be sorted
     */
    Item.prototype.sortChildren = function _itemSort(treebeard, direction, sortType, index) {
        var columns = treebeard.options.resolveRows.call(treebeard, this),
            field = columns[index].data;
        if (!direction || (direction !== 'asc' && direction !== 'desc')) {
            throw new Error("Treebeard Error: To sort children you need to pass direction as asc or desc to Item.sortChildren");
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

    /**
     * Checks if item is ancestor (contains) of another item passed as argument
     * @param {Object} item An item constructed by _item
     * @returns {Boolean} result Whether the item is ancestor of item passed as argument
     */
    Item.prototype.isAncestor = function _isAncestor(item) {
        function _checkAncestor(a, b) {
            console.log("is ancestor", a, b);
            if (a.id === b.id) {
                return true;
            }
            if (a.parent()) {
                return _checkAncestor(a.parent(), b);
            }
            return false;
        }
        if(item.parent()){
            return _checkAncestor(item.parent(), this);
        }
        return false;
    };

    /**
     * Checks if item is descendant (a child) of another item passed as argument
     * @param {Object} item An item constructed by _item
     * @returns {Boolean} result Whether the item is descendant of item passed as argument
     */
    Item.prototype.isDescendant = function (item) {
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
    Treebeard.controller = function _treebeardController(opts) {
        // private variables
        var self = this,                                        // Treebard.controller
            _isSorted = { asc : false, desc : false, column : "" },  // Temporary variables for sorting
            _lastLocation = 0,                                  // The last scrollTop location, updates on every scroll.
            _lastNonFilterLocation = 0;                         // The last scrolltop location before filter was used.


        m.redraw.strategy("all");
        // public variables
        this.modal = new Modal();                                     // Box wide modal
        this.flatData = [];                                     // Flat data, gets regenerated often
        this.treeData = {};                                     // The data in hierarchical form
        this.filterText = m.prop("");                           // value of the filtertext input
        this.showRange = [];                                    // Array of indexes that the range shows
        this.options = opts;                       // User defined options
        this.selected = undefined;                              // The row selected on click.
        this.mouseon = undefined;                              // The row the mouse is on for mouseover events.
        this.rangeMargin = 0;                                   // Top margin, required for proper scrolling
        this.visibleIndexes = [];                               // List of items viewable as a result of an operation like filter.
        this.visibleTop = undefined;                            // The first visible item.
        this.currentPage = m.prop(1);                           // for pagination
        this.dropzone = null;                                   // Treebeard's own dropzone object
        this.dropzoneItemCache = undefined;                      // Cache of the dropped item
        this.filterOn = false;                                  // Filter state for use across the app
        this.multiselected = [];
        this.pressedKey = undefined;
        this.dragOngoing = false;
        this.draggedCache = null;                               // Caching the dragged ui helper when going beyond view scroll
        this.initialized = false;                               // Treebeard's own initialization check, turns to true after page loads.
        this.colsizes = {};                                     // Storing column sizes across the app.

        /**
         * Helper function to redraw if user makes changes to the item (like deleting through a hook)
         */
        this.redraw = function _redraw() {
            self.flatten(self.treeData.children, self.visibleTop);
        };

        /**
         * Helper function to reset unique id to a reset number or -1
         * @param {Number} resetNum Number to reset counter to
         */
        this.resetCounter = function _resetCounter(resetNum) {
            if (resetNum !== 0) {
                window.treebeardCounter  = resetNum || -1;
            } else {
                window.treebeardCounter  = 0;
            }
        };

        /**
         * Instantiates draggable and droppable on DOM elements with options passed from self.options
         */
        this.initializeMove = function () {
            var draggableOptions,
                droppableOptions;

            draggableOptions = {
                helper: "clone",
                cursor : 'move',
                containment : '.tb-tbody-inner',
                delay : 100,
                drag : function (event, ui) {
                    if (self.pressedKey === 27) {
                        return false;
                    }
                    if (self.options.dragEvents.drag) {
                        self.options.dragEvents.drag.call(self, event, ui);
                    } else {
                        if (self.dragText === "") {
                            if (self.multiselected.length > 1) {
                                var newHTML = $(ui.helper).text() + ' <b> + ' + (self.multiselected.length - 1) + ' more </b>';
                                self.dragText = newHTML;
                                $('.tb-drag-ghost').html(newHTML);
                            }
                        }
                        $(ui.helper).css({ 'display' : 'none'}); //, 'width' : '400px', 'background' : 'white', 'padding' : '0px 10px', 'box-shadow' : '0 0 4px #ccc'});
                    }
                    // keep copy of the element and attach it to the mouse location
                    var x = event.clientX > 50 ? event.clientX - 50 : 50;
                    var y = event.clientY - 10;
                    $('.tb-drag-ghost').css({ 'position' : 'absolute', top : y, left : x, 'height' : '25px', 'width' : '400px', 'background' : 'white', 'padding' : '0px 10px', 'box-shadow' : '0 0 4px #ccc'});
                },
                create : function (event, ui) {
                    if (self.options.dragEvents.create) {
                        self.options.dragEvents.create.call(self, event, ui);
                    }
                },
                start : function (event, ui) {
                    self.dragText = "";
                    var ghost = $(ui.helper).clone();
                    ghost.addClass('tb-drag-ghost');

                    $('body').append(ghost)
                    if (self.options.dragEvents.start) {
                        self.options.dragEvents.start.call(self, event, ui);
                    }
                    self.dragOngoing = true;
                    $('.tb-row').removeClass(self.options.hoverClass + ' tb-h-error tb-h-success');
                },
                stop : function (event, ui) {
                    $('.tb-drag-ghost').remove();

                    if (self.options.dragEvents.stop) {
                        self.options.dragEvents.stop.call(self, event, ui);
                    }
                    self.dragOngoing = false;
                    $('.tb-row').removeClass(self.options.hoverClass + ' tb-h-error tb-h-success');

                }
            };

            droppableOptions = {
                tolerance : 'pointer',
                activate : function (event, ui) {
                    if (self.options.dropEvents.activate) {
                        self.options.dropEvents.activate.call(self, event, ui);
                    }
                },
                create : function (event, ui) {
                    if (self.options.dropEvents.create) {
                        self.options.dropEvents.create.call(self, event, ui);
                    }
                },
                deactivate : function (event, ui) {
                    if (self.options.dropEvents.deactivate) {
                        self.options.dropEvents.deactivate.call(self, event, ui);
                    }
                },
                drop : function (event, ui) {
                    if (self.options.dropEvents.drop) {
                        self.options.dropEvents.drop.call(self, event, ui);
                    }
                },
                out : function (event, ui) {
                    if (self.options.dropEvents.out) {
                        self.options.dropEvents.out.call(self, event, ui);
                    }
                },
                over : function (event, ui) {
                    var id = parseInt($(event.target).closest('.tb-row').attr('data-id'), 10),
                        last = self.flatData[self.showRange[self.showRange.length - 1]].id,
                        first = self.flatData[self.showRange[0]].id,
                        currentScroll;
                    console.log(id, last, first, event, ui);
                    if (id === last) {
                        currentScroll = $('#tb-tbody').scrollTop();
                        $('#tb-tbody').scrollTop(currentScroll + 35);
                    }
                    if (id === first) {
                        currentScroll = $('#tb-tbody').scrollTop();
                        $('#tb-tbody').scrollTop(currentScroll - 35);
                    }
                    if (self.options.dropEvents.over) {
                        self.options.dropEvents.over.call(self, event, ui);
                    }
                }
            };

            self.options.finalDragOptions = $.extend(draggableOptions, self.options.dragOptions);
            self.options.finalDropOptions = $.extend(droppableOptions, self.options.dropOptions);
            self.options.dragSelector = self.options.moveClass ||  'td-title';
            self.moveOn(); // first time;

        };

        this.moveOn = function _moveOn(parent) {
            if (!parent) {
                $('.' + self.options.dragSelector).draggable(self.options.finalDragOptions);
                $('.tb-row').droppable(self.options.finalDropOptions);
            } else {
                $(parent).find('.' + self.options.dragSelector).draggable(self.options.finalDragOptions);
                $(parent).droppable(self.options.finalDropOptions);
            }
        };

        /**
         * Removes move related instances by destroying draggable and droppable.
         */
        this.moveOff = function _moveOff() {
            $(".td-title").draggable("destroy");
            $(".tb-row").droppable("destroy");
        }

        /**
         * Deletes item from tree and refreshes view
         * @param {Number} parentID Unique id of the parent
         * @param {Number} itemID Unique id of the item
         * @returns {Object} A shallow copy of the item that was just deleted.
         */
        this.deleteNode = function _deleteNode(parentID, itemID) { // TODO : May be redundant to include parentID
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
            return itemcopy;
        };

        /**
         * Checks if a move between items can be done based on logic of which contains the other
         * @param {Object} toItem Receiving item data constructed by _item
         * @param {Object} parentID Item to be moved as constructed by _item
         * @returns {Boolean} Whether the move can be done or not
         */
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

        /**
         * Adds an item to the list with proper tree and flat data and view updates
         * @param {Object} item the raw data of the item
         * @param {Number} parentID the unique id of the parent object the item should be added to
         * @returns {Object} newItem the created item as constructed by _item with correct parent information.
         */
        this.createItem = function _createItem(item, parentID) {
            var parent = Indexes[parentID],
                newItem;
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

        /**
         * Finds the entire item object through the id only
         * @param {Number} id Unique id of the item acted on
         * @returns {Number} _item The full item object constructed by _item.
         */
        this.find = function _find(id) {
            if (Indexes[id]) {
                return Indexes[id];
            }
            return undefined;
        };

        /**
         * Returns the index of an item in the flat row list (self.flatData)
         * @param {Number} id Unique id of the item acted on (usually item.id) .
         * @returns {Number} i The index at which the item is found or undefined if nothing is found.
         */
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

        /**
         * Returns the index of an item in the showRange list (self.showRange)
         * @param {Number} id Unique id of the item acted on (usually item.id) .
         * @returns {Number} i The index at which the item is found or undefined if nothing is found.
         */
        this.returnRangeIndex = function _returnRangeIndex(id) {
            var len = self.showRange.length, i, o;
            for (i = 0; i < len; i++) {
                o = self.flatData[self.showRange[i]];
                if (o.id === id) {
                    return i;
                }
            }
            return undefined;
        };

        /**
         * Returns whether a single row contains the filtered items, checking if columns can be filtered
         * @param {Object} item Item constructed with _item which the filtering is acting on.
         * @returns {Boolean} titleResult Whether text is found within the item, default is false;
         */
        this.rowFilterResult = function _rowFilterResult(item) {
            $('#tb-tbody').scrollTop(0);
            self.currentPage(1);
            var cols = self.options.resolveRows.call(self, item),
                filter = self.filterText().toLowerCase(),
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

        /**
         * Runs filter functions and resets depending on whether there is a filter word
         * @param {Event} e Event object fired by the browser
         * @config {Object} currentTarget Event object needs to have a e.currentTarget element object for mithril.
         */
        this.filter = function _filter(e) {
            m.withAttr("value", self.filterText)(e);
            var filter = self.filterText().toLowerCase(),
                index = self.visibleTop;
            if (filter.length === 0) {
                self.filterOn = false;
                self.calculateVisible(0);
                self.calculateHeight();
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
                self.calculateVisible(index);
                self.calculateHeight();
                m.redraw(true);
                if (self.options.onfilter) {
                    self.options.onfilter.call(self, filter);
                }
            }
        };

        /**
         * Updates content of the folder with new data or refreshes from lazyload
         * @param {Array} data New raw items, may be returned from ajax call
         * @param {Object} parent Item built with the _item constructor
         */
        this.updateFolder = function (data, parent) {
            if (data) {
                parent.children = [];
                var child, i;
                for (i = 0; i < data.length; i++) {
                    child = self.buildTree(data[i], parent);
                    parent.add(child);
                }
                parent.open = true;
                //return;
            }
            var index = self.returnIndex(parent.id);
            parent.open = false;
            parent.load = false;
            self.toggleFolder(index, null);
        };

        /**
         * Toggles folder, refreshing the view or reloading in event of lazyload
         * @param {Number} index The index of the item in the flatdata.
         * @param {Event} [event] Toggle click event if this function is triggered by an event.
         */
        this.toggleFolder = function _toggleFolder(index, event) {
            if (index === undefined || index === null) {
                self.redraw();
                return;
            }
            console.log("Toggled");
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
                lazyLoad,
                icon = $('.tb-row[data-id="' + item.id + '"]').find('.tb-toggle-icon');
            if(icon.get(0)) {
                m.render(icon.get(0), m('i.icon-refresh.icon-spin'))
            };
            $.when(self.options.resolveLazyloadUrl(self, tree)).done(function _resolveLazyloadDone(url) {
                lazyLoad = url;
                if (lazyLoad && item.row.kind === "folder" && tree.open === false && tree.load === false) {
                    tree.children = [];
                    m.request({method: "GET", url: lazyLoad})
                        .then(function _getUrlBuildtree(value) {
                            if (!value) {
                                self.options.lazyLoadError.call(self, tree);
                            } else {
                                if (!$.isArray(value)) {
                                    value = value.data;
                                }
                                for (i = 0; i < value.length; i++) {
                                    child = self.buildTree(value[i], tree);
                                    tree.add(child);
                                }

                                tree.open = true;
                                tree.load = true;
                                var iconTemplate = self.options.resolveToggle.call(self, tree);
                                if(icon.get(0)) {
                                    m.render(icon.get(0), iconTemplate);
                                }
                            }
                        }, function (info) {
                            self.options.lazyLoadError.call(self, tree);
                        })
                        .then(function _getUrlFlatten() {
                            self.flatten(self.treeData.children, self.visibleTop);
                            if (self.options.lazyLoadOnLoad) {
                                self.options.lazyLoadOnLoad.call(self, tree);
                            }
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
                    self.calculateVisible(self.visibleTop);
                    self.calculateHeight();
                    m.redraw(true);
                    var iconTemplate = self.options.resolveToggle.call(self, tree);
                    if(icon.get(0)) {
                        m.render(icon.get(0), iconTemplate);
                    }
                }
                if (self.options.allowMove) {
                    self.moveOn();
                }
                if (self.options.ontogglefolder) {
                    self.options.ontogglefolder.call(self, tree, event);
                }
            });
        };

        /**
         * Toggles the sorting when clicked on sort icons.
         * @param {Event} [event] Toggle click event if this function is triggered by an event.
         */
        this.sortToggle = function _isSortedToggle(ev) {
            var element = $(ev.target),
                type = element.attr('data-direction'),
                index = this,
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


        /**
         * Calculate how tall the wrapping div should be so that scrollbars appear properly
         * @returns {Number} itemsHeight Number of pixels calculated in the function for height
         */
        this.calculateHeight = function _calculateHeight() {
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

        /**
         * Calculates total number of visible items to return a row height
         * @param {Number} rangeIndex The index to start refreshing range
         * @returns {Number} total Number of items visible (not in showrange but total).
         */
        this.calculateVisible = function _calculateVisible(rangeIndex) {
            rangeIndex = rangeIndex || 0;
            var len = self.flatData.length,
                total = 0,
                i,
                item;
            self.visibleIndexes = [];
            for (i = 0; i < len; i++) {
                item = Indexes[self.flatData[i].id];
                if (self.filterOn) {
                    if (self.rowFilterResult(item)) {
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

        /**
         * Refreshes the view to start the the location where begin is the starting index
         * @param {Number} begin The index location of visible indexes to start at.
         */
        this.refreshRange = function _refreshRange(begin) {
            var len = self.visibleIndexes.length,
                range = [],
                counter = 0,
                i,
                index;
            if(!begin || begin > self.flatData.length) {
                begin =  0;
            }
            self.visibleTop = begin;
            for (i = begin; i < len; i++) {
                if (range.length === self.options.showTotal) {break; }
                index = self.visibleIndexes[i];
                range.push(index);
                counter = counter + 1;
            }
            self.showRange = range;
            m.redraw(true);
        };

        /**
         * Changes view to continous scroll when clicked on the scroll button
         */
        this.toggleScroll = function _toggleScroll() {
            self.options.paginate = false;
            $('.tb-paginate').removeClass('active');
            $('.tb-scroll').addClass('active');
            $("#tb-tbody").scrollTop((self.currentPage() - 1) * self.options.showTotal * self.options.rowHeight);
            self.calculateHeight();
        };

        /**
         * Changes view to pagination when clicked on the paginate button
         */
        this.togglePaginate = function _togglePaginate() {
            var firstIndex = self.showRange[0],
                first = self.visibleIndexes.indexOf(firstIndex),
                pagesBehind = Math.floor(first / self.options.showTotal),
                firstItem = (pagesBehind * self.options.showTotal);
            self.options.paginate = true;
            $('.tb-scroll').removeClass('active');
            $('.tb-paginate').addClass('active');
            self.currentPage(pagesBehind + 1);
            self.calculateHeight();
            self.refreshRange(firstItem);
        };

        /**
         * During pagination goes UP one page
         */
        this.pageUp = function _pageUp() {
            // get last shown item index and refresh view from that item onwards
            var lastIndex = self.showRange[self.options.showTotal - 1],
                last = self.visibleIndexes.indexOf(lastIndex);
            if (last > -1 && last + 1 < self.visibleIndexes.length) {
                self.refreshRange(last + 1);
                self.currentPage(self.currentPage() + 1);
                return true;
            }
            return false;
        };

        /**
         * During pagination goes DOWN one page
         */
        this.pageDown = function _pageDown() {
            var firstIndex = self.showRange[0],
                first = self.visibleIndexes.indexOf(firstIndex);
            if (first && first > 0) {
                self.refreshRange(first - self.options.showTotal);
                self.currentPage(self.currentPage() - 1);
                return true;
            }
            return false;
        };

        /**
         * During pagination jumps to specific page
         * @param {Number} value the page number to jump to
         */
        this.goToPage = function _goToPage(value) {
            if (value && value > 0 && value <= (Math.ceil(self.visibleIndexes.length / self.options.showTotal))) {
                var index = (self.options.showTotal * (value - 1));
                self.currentPage(value);
                self.refreshRange(index);
                return true;
            }
            return false;
        };

        /**
         * Check if item is part of the multiselected array
         * @param {Number} id The unique id of the item.
         * @returns {Boolean} outcome Whether the item is part of multiselected
         */
        this.isMultiselected = function (id) {
            var outcome = false;
            self.multiselected.map(function (item) {
                if (item.id === id) {
                    outcome = true;
                }
            });
            return outcome;
        };

        /**
         * Removes single item from the multiselected array
         * @param {Number} id The unique id of the item.
         * @returns {Boolean} result Whether the item removal was successful
         */
        this.removeMultiselected = function (id) {
            self.multiselected.map(function (item, index, arr) {
                if (item.id === id) {
                    arr.splice(index, 1);
                }
            });
            return false;
        };

        /**
         * Adds highlight to the multiselected items using jquery.
         */
        this.highlightMultiselect = function () {
            $('.' + self.options.hoverClassMultiselect).removeClass(self.options.hoverClassMultiselect);
            this.multiselected.map(function (item) {
                $('.tb-row[data-id="' + item.id + '"]').addClass(self.options.hoverClassMultiselect);
            });
        };

        /**
         * Handles multiselect by adding items through shift or control key presses
         * @param {Number} id The unique id of the item.
         * @param {Number} [index] The showRange index of the item
         * @param {Event} [event] Click event on the item
         */
        this.handleMultiselect = function (id, index, event) {
            var tree = Indexes[id],
                originalIndex,
                finalIndex,
                begin,
                end,
                i;
            // if key is shift
            if (self.pressedKey === 16) {
                // get the index of this and add all visible indexes between this one and last selected
                // If there is no multiselect yet
                if (self.multiselected.length === 0 && !self.selected) {
                    self.selected = tree.id;
                    self.multiselected.push(tree);
                } else {
                    originalIndex = self.returnRangeIndex(self.selected);
                    finalIndex = self.returnRangeIndex(id);
                    if (originalIndex > finalIndex) {
                        // going up
                        begin = finalIndex;
                        end = originalIndex;
                    } else {
                        begin = originalIndex;
                        end = finalIndex;
                    }
                    if (originalIndex !== finalIndex) {
                        self.multiselected = [];
                        for (i = begin; i < end + 1; i++) {
                            self.multiselected.push(Indexes[self.flatData[self.showRange[i]].id]);
                        }
                    }
                }
            }
            // if key is cmd
            if (self.pressedKey === 91) {
                if (!self.isMultiselected(tree.id)) {
                    self.multiselected.push(tree);
                } else {
                    self.removeMultiselected(tree.id);
                }
            }

            // if there is no key add the one.
            if (!self.pressedKey){
                self.clearMultiselect();
                self.multiselected.push(tree);
            }

            if (self.options.onmultiselect) {
                self.options.onmultiselect.call(self, event, tree);
            }
            self.highlightMultiselect.call(this);
        };

        this.clearMultiselect = function () {
            $('.' + self.options.hoverClassMultiselect).removeClass(self.options.hoverClassMultiselect);
            self.multiselected = [];
        };

        // Remove dropzone from grid
        function _destroyDropzone() {
            self.dropzone.destroy();
        }

        // Apply dropzone to grid
        function _applyDropzone() {
            if (self.dropzone) { _destroyDropzone(); }               // Destroy existing dropzone setup
            var options = $.extend({
                clickable : false,
                counter : 0,
                accept : function _dropzoneAccept(file, done) {
                    if (self.options.addcheck.call(this, self, self.dropzoneItemCache, file)) {
                        $.when(self.options.resolveUploadUrl.call(self, self.dropzoneItemCache, file))
                            .then(function _resolveUploadUrlThen(newUrl) {
                                if (newUrl) {
                                    self.dropzone.options.url = newUrl;
                                    self.dropzone.options.counter++;
                                    if(self.dropzone.options.counter < 2 ) {
                                        console.log('counter', self.dropzone.options.counter);
                                        var index = self.returnIndex(self.dropzoneItemCache.id);
                                        if (!self.dropzoneItemCache.open) {
                                            self.toggleFolder(index, null);
                                        }
                                    }
                                }
                                return newUrl;
                            })
                            .then(function _resolveUploadMethodThen() {
                                if ($.isFunction(self.options.resolveUploadMethod)) {
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
                }
            }, self.options.dropzone);           // Extend default options
            var Dropzone;
            if (typeof module === 'object') {
                Dropzone = require('dropzone');
            } else {
                Dropzone = window.Dropzone;
            }
            if (typeof Dropzone === 'undefined') {
                throw new Error('To enable uploads Treebeard needs "Dropzone" to be installed.');
            }
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
                    self.calculateVisible();
                    self.calculateHeight();
                    self.initialized = true;
                });
            } else {
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
                        self.calculateVisible();
                        self.calculateHeight();
                        self.initialized = true;
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
                            self.calculateVisible(visibleTop);
                            self.calculateHeight();
                            m.redraw(true);
                            if(self.options.redrawComplete){
                                self.options.redrawComplete.call(self);
                            }
                        }
                    }
                };
            recursive(value, true, true);
            return value;
        };


        // Initializes after the view
        this.init = function _init(el, isInit) {
            var containerHeight = $('#tb-tbody').height();
            self.options.showTotal = Math.floor(containerHeight / self.options.rowHeight);
            if (self.options.allowMove) {
                self.moveOn();
            }
            if (isInit) { return; }
            self.initializeMove();
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
                    itemsHeight = self.calculateHeight();
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
            $('.tb-th.tb-resizable').resizable({
                containment : 'parent',
                delay : 200,
                handles : 'e',
                minWidth : 60,
                create : function(event, ui) {
                    // change cursor
                    $('.ui-resizable-e').css({ "cursor" : "col-resize"} );

                    // update beginning sizes
                    var parentWidth = $('.tb-row-titles').width();
                    $('.tb-th').each(function(){
                        $(this).attr('data-tb-size', $(this).outerWidth());
                        self.colsizes[$(this).attr('data-tb-th-col')] = $(this).outerWidth()/parentWidth*100;
                    })
                },
                resize : function(event, ui) {
                    var thisCol = $(ui.element).attr('data-tb-th-col');
                    var diff = ui.originalSize.width - ui.size.width;
                    var sibling = $(ui.element).next();
                    var siblingOriginalWidth = parseInt(sibling.attr('data-tb-size'));
                    var siblingCurrentWidth = sibling.outerWidth();
                    if(siblingCurrentWidth > 40) {
                        $(ui.element).next().css({ width : (siblingOriginalWidth + diff) + 'px'});
                        var siblingIndex = $(ui.element).next().attr('data-tb-th-col');
                        $('.tb-col-'+siblingIndex).css({width : (siblingOriginalWidth + diff) + 'px'});
                    }
                    // if the overall size is getting bigger than home size, make other items smaller
                    var parentWidth = $('.tb-row-titles').width();
                    var childrenWidth = 0;
                    $('.tb-th').each(function(){
                        childrenWidth = childrenWidth + $(this).outerWidth();
                        $(this).css({ height : '35px'});
                    })
                    if(childrenWidth > parentWidth){
                        var diff2 = childrenWidth - parentWidth;
                        var nextBigThing = $('.tb-th').not(ui.element).filter(function () {
                            var colElement = parseInt($(ui.element).attr('data-tb-th-col'));
                            var colThis = parseInt($(this).attr('data-tb-th-col'));
                            if(colThis > colElement) {
                                return $(this).outerWidth() > 40;
                            }
                            return false;
                        }).first();
                        console.log("nextbigthing", nextBigThing);
                        if(nextBigThing.length > 0){
                            var w2 = nextBigThing.outerWidth();
                            nextBigThing.css({ width : (w2 - diff2) + 'px' })
                            var nextBigThingIndex = nextBigThing.attr('data-tb-th-col');
                            $('.tb-col-'+nextBigThingIndex).css({width : (w2 - diff2) + 'px'});
                        } else {
                            $(ui.element).css({ width : $(ui.element).attr('data-tb-currentSize') + 'px'});
                            return;
                        }
                    }
                    if(childrenWidth < parentWidth) {
                        var diff3 = parentWidth - childrenWidth;
                        // number of children other than the current element with widths bigger than 40
                        var lastBigThing = $('.tb-th').not(ui.element).filter(function () {
                            return $(this).outerWidth() < parseInt($(this).attr('data-tb-size')); }).last();
                        console.log("nextbigthing", lastBigThing.length);
                        if(lastBigThing.length > 0){
                            var w3 = lastBigThing.outerWidth();
                            lastBigThing.css({ width : (w3 + diff3) + 'px' });
                            var lastBigThingIndex = lastBigThing.attr('data-tb-th-col');
                            $('.tb-col-'+lastBigThingIndex).css({width : (w3 + diff3) + 'px'});
                        }
                    }
                    $(ui.element).attr('data-tb-currentSize', $(ui.element).outerWidth());
                    // change corresponding columns in the table
                    var index = $(this).attr('data-tb-th-col');
                    var colWidth = $(this).outerWidth();
                    $('.tb-col-'+index).css({width : colWidth + 'px'});

                },
                stop : function(event, ui){
                    var parentWidth = $('.tb-row-titles').width();
                    $('.tb-th').each(function(){
                        $(this).attr('data-tb-size', $(this).outerWidth());
                        self.colsizes[$(this).attr('data-tb-th-col')] = $(this).outerWidth()/parentWidth*100;
                    })
                }
            })
            if (self.options.uploads) { _applyDropzone(); }
            if ($.isFunction(self.options.onload)) {
                self.options.onload.call(self);
            }
            if (self.options.multiselect) {
                $(window).keydown(function (event) {
                    self.pressedKey = event.keyCode;
                    // $('.tb-row').addClass('tb-unselectable');
                });
                $(window).keyup(function (event) {
                    self.pressedKey = undefined;
                    // $('.tb-row').removeClass('tb-unselectable');
                });
            }

        };

        this.destroy = function _destroy () {
            $('#' + self.options.divID).html(''); // Empty HTML
            if (self.dropzone) { _destroyDropzone(); }               // Destroy existing dropzone setup
        };

        // Check if options inclide filesData, this is required to run so throw error if not.
        //this.resetCounter();
        if (self.options.filesData) {
            _loadData(self.options.filesData);
        } else {
            throw new Error("Treebeard Error: You need to define a data source through 'options.filesData'");
        }
    };

    Treebeard.view = function treebeardView(ctrl) {
        return [
            m('.gridWrapper', [
                m(".tb-table", [
                    (function showHeadA() {
                        if (ctrl.options.showFilter || ctrl.options.title) {
                            return m('.tb-head.clearfix', [
                                m(".tb-head-filter", {
                                    style: "width:" + ctrl.options.filterStyle.width + "; float:" + ctrl.options.filterStyle.float
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
                        ctrl.options.columnTitles.call(ctrl).map(function _mapColumnTitles(col, index, arr) {
                            var sortView = "",
                                up,
                                down,
                                resizable = '.tb-resizable';
                            var width = ctrl.colsizes[index] ? ctrl.colsizes[index] + '%' :  col.width;
                            if(!ctrl.options.resizeColumns){
                                resizable = '';
                            }
                            if(index === arr.length-1){
                                resizable = '';
                            }
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
                                        "data-sortType" : col.sortType
                                    }),
                                    m(down + '.tb-sort-inactive.desc-btn', {
                                        onclick: ctrl.sortToggle.bind(index),
                                        "data-direction": "desc",
                                        "data-sortType" : col.sortType
                                    })
                                ];
                            }
                            return m('.tb-th'+resizable, { style : "width: " +width, 'data-tb-th-col' : index }, [
                                m('span.m-r-sm', col.title),
                                sortView
                            ]);
                        })
                    ]),
                    m("#tb-tbody", { config : ctrl.init },  [
                        (function showModal() {

                            if (ctrl.modal.on) {
                                return m('.tb-modal-shade', { style : 'width:' + ctrl.modal.width + 'px; position : absolute; height:' + ctrl.modal.height + 'px;'}, [
                                    m('.tb-modal-inner', { 'class' : ctrl.modal.css }, [
                                        m('.tb-modal-dismiss', { 'onclick' : function () { ctrl.modal.dismiss(); } }, [m('i.icon-remove-sign')]),
                                        m('.tb-modal-content', ctrl.modal.content),
                                        m('.tb-modal-footer', ctrl.modal.actions)])
                                ]);
                            }
                        }()),
                        m('.tb-tbody-inner', [
                            m('', { style : "margin-top:" + ctrl.rangeMargin + "px" }, [
                                ctrl.showRange.map(function _mapRangeView(item, index) {
                                    var oddEvenClass = ctrl.options.oddEvenClass.odd,
                                        indent = ctrl.flatData[item].depth,
                                        id = ctrl.flatData[item].id,
                                        tree = Indexes[id],
                                        row = ctrl.flatData[item].row,
                                        padding,
                                        css = tree.css || "",
                                        rowCols = ctrl.options.resolveRows.call(ctrl, tree);
                                    if (index % 2 === 0) {
                                        oddEvenClass = ctrl.options.oddEvenClass.even;
                                    }
                                    if (ctrl.filterOn) {
                                        padding = 20;
                                    } else {
                                        padding = (indent-1) * 20;
                                    }
                                    if (tree.notify.on && !tree.notify.column) {
                                        return m(".tb-row", [
                                            m('.tb-notify.alert-' + tree.notify.type, { 'class' : tree.notify.css }, [
                                                m('span', tree.notify.message)
                                            ])
                                        ]);
                                    } else {
                                        return m(".tb-row",  {
                                            "key" : id,
                                            "class" : css + " " + oddEvenClass,
                                            "data-id" : id,
                                            "data-level": indent,
                                            "data-index": item,
                                            "data-rIndex": index,
                                            style : "height: " + ctrl.options.rowHeight + "px;",
                                            onclick : function _rowClick(event) {
                                                if (ctrl.options.multiselect) {
                                                    ctrl.handleMultiselect(id, index, event);
                                                }
                                                ctrl.selected = id;
                                                if (ctrl.options.onselectrow) {
                                                    ctrl.options.onselectrow.call(ctrl, tree, event);
                                                }
                                            },
                                            onmouseover : function _rowMouseover(event) {
                                                ctrl.mouseon = id;
                                                if (ctrl.options.hoverClass && !ctrl.dragOngoing) {
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
                                                    colcss = col.css || '';
                                                var width = ctrl.colsizes[index] ? ctrl.colsizes[index] + '%' :  colInfo.width;
                                                cell = m('.tb-td.tb-col-' + index, { 'class' : colcss, style : "width:" + width }, [
                                                    m('span', row[col.data])
                                                ]);
                                                if (tree.notify.on && tree.notify.column === index) {
                                                    return m('.tb-td.tb-col-' + index, { style : "width:" + width },  [
                                                        m('.tb-notify.alert-' + tree.notify.type, { 'class' : tree.notify.css }, [
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
                                                    cell = m('.tb-td.td-title.tb-col-' + index, {
                                                        "data-id" : id,
                                                        'class' : colcss,
                                                        style : "padding-left: " + padding + "px; width:" + width
                                                    }, [
                                                        m("span.tb-td-first",
                                                            (function _toggleView() {
                                                                var set = [{
                                                                    'id' : 1,
                                                                    'css' : 'tb-expand-icon-holder',
                                                                    'resolve' : ctrl.options.resolveIcon.call(ctrl, tree)
                                                                }, {
                                                                    'id' : 2,
                                                                    'css' : 'tb-toggle-icon',
                                                                    'resolve' : ctrl.options.resolveToggle.call(ctrl, tree)
                                                                }];
                                                                if (ctrl.filterOn) {
                                                                    return m('span.' + set[0].css, { key : set[0].id }, set[0].resolve);
                                                                }
                                                                return [m('span.' + set[1].css, { key : set[1].id,
                                                                    onclick: function _folderToggleClick(event) {
                                                                        if (ctrl.options.togglecheck.call(ctrl, tree)) {
                                                                            ctrl.toggleFolder(item, event);
                                                                        }
                                                                    }
                                                                }, set[1].resolve), m('span.' + set[0].css, { key : set[0].id }, set[0].resolve)];
                                                            }())
                                                        ),
                                                        title
                                                    ]);
                                                }
                                                if (!col.folderIcons && col.custom) {
                                                    cell = m('.tb-td.tb-col-' + index, { 'class' : colcss, style : "width:" + width }, [
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

    var Options = function() {
        this.divID = "myGrid";
        this.filesData = "small.json";
        this.rowHeight = undefined;     // user can override or get from .tb-row height
        this.paginate = false;          // Whether the applet starts with pagination or not.
        this.paginateToggle = false;    // Show the buttons that allow users to switch between scroll and paginate.
        this.uploads = false;           // Turns dropzone on/off.
        this.multiselect = false;
        this.filterStyle = { float : 'right', width : '50%'};
        this.columnTitles = function () {
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
            ]};
        this.resolveRows = function (item) {
            return [   // Defines columns based on data
                {
                    data : "title",  // Data field name
                    folderIcons : true,
                    filter : true
                }
            ];
        };
        this.resizeColumns = true;
        this.hoverClass = undefined;
        this.hoverClassMultiselect = 'tb-multiselect';
        this.showFilter = true;     // Gives the option to filter by showing the filter box.
        this.title = "Grid Title";          // Title of the grid, boolean, string OR function that returns a string.
        this.allowMove = true;      // Turn moving on or off.
        this.moveClass = undefined;
        this.sortButtonSelector = {}; // custom buttons for sort
        this.dragOptions = {};
        this.dropOptions = {};
        this.dragEvents = {}; // users can override draggable options and events
        this.dropEvents = {};// users can override droppable options and events
        this.oddEvenClass = {
            odd : 'tb-odd',
            even : 'tb-even'
        };
        this.onload = function () {
            // this = treebeard object;
        };
        this.togglecheck = function (item) {
            // this = treebeard object;
            // item = folder to toggle
            return true;
        };
        this.onfilter = function (filterText) {   // Fires on keyup when filter text is changed.
            // this = treebeard object;
            // filterText = the value of the filtertext input box.
        };
        this.onfilterreset = function (filterText) {   // Fires when filter text is cleared.
            // this = treebeard object;
            // filterText = the value of the filtertext input box.
        };
        this.createcheck = function (item, parent) {
            // this = treebeard object;
            // item = Item to be added.  raw item, not _item object
            // parent = parent to be added to = _item object
            return true;
        };
        this.oncreate = function (item, parent) {  // When row is deleted successfully
            // this = treebeard object;
            // item = Item to be added.  = _item object
            // parent = parent to be added to = _item object
        };
        this.deletecheck = function (item) {  // When user attempts to delete a row, allows for checking permissions etc.
            // this = treebeard object;
            // item = Item to be deleted.
            return true;
        };
        this.ondelete = function () {  // When row is deleted successfully
            // this = treebeard object;
            // item = a shallow copy of the item deleted, not a reference to the actual item
        };
        this.movecheck = function (to, from) { //This method gives the users an option to do checks and define their return
            // this = treebeard object;
            // from = item that is being moved
            // to = the target location
            return true;
        };
        this.onmove = function (to, from) {  // After move happens
            // this = treebeard object;
            // to = actual tree object we are moving to
            // from = actual tree object we are moving
        };
        this.movefail = function (to, from) { //This method gives the users an option to do checks and define their return
            // this = treebeard object;
            // from = item that is being moved
            // to = the target location
            return true;
        };
        this.addcheck = function (treebeard, item, file) {
            // this = dropzone object
            // treebeard = treebeard object
            // item = item to be added to
            // file = info about the file being added
            return true;
        };
        this.onadd = function (treebeard, item, file, response) {
            // this = dropzone object;
            // item = item the file was added to
            // file = file that was added
            // response = what's returned from the server
        };
        this.onselectrow = function (row, event) {
            // this = treebeard object
            // row = item selected
            // event = mouse click event object
        };
        this.onmultiselect = function (event, tree) {
            // this = treebeard object
            // tree = item currently clicked on
            // event = mouse click event object
        };
        this.onmouseoverrow = function (row, event) {
            // this = treebeard object
            // row = item selected
            // event = mouse click event object
            //window.console.log("onmouseoverrow", this, row, event);
        };
        this.ontogglefolder = function (item) {
            // this = treebeard object
            // item = toggled folder item
        };
        this.dropzone = {                                           // All dropzone options.
            url: "http://www.torrentplease.com/dropzone.php"  // When users provide single URL for all uploads
        };
        this.dropzoneEvents = {};
        this.resolveIcon = function (item) {     // Here the user can interject and add their own icons, uses m()
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
        };
        this.resolveToggle = function (item) {
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
        };
        this.resolvePagination = function (totalPages, currentPage) {
            // this = treebeard object
            return m("span", [
                m('span', 'Page: '),
                m('span.tb-pageCount', currentPage),
                m('span', ' / ' + totalPages)
            ]);
        };
        this.resolveUploadUrl = function (item) {  // Allows the user to calculate the url of each individual row
            // this = treebeard object;
            // Item = item acted on return item.data.ursl.upload
            return "/upload";
        };
        this.resolveLazyloadUrl = function (item) {
            // this = treebeard object;
            // Item = item acted on
            return false;
        };
        this.lazyLoadError = function (item) {
            // this = treebeard object;
            // Item = item acted on
        };
        this.lazyLoadOnLoad = function (item) {
            // this = treebeard object;
            // Item = item acted on
        };
    }

    // Starts treebard with user options;
    var runTB = function _treebeardRun(options) {
        var defaults = new Options();
        var finalOptions = $.extend(defaults, options);
        var tb = {};
        tb.controller = function() {
            this.tbController = new Treebeard.controller(finalOptions);
        };
        tb.view = function(ctrl) {
            return Treebeard.view(ctrl.tbController);
        }
        return m.module(document.getElementById(finalOptions.divID), tb );
    };

    return runTB;
}));