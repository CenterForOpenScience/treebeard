/**
 * Treebeard : hierarchical grid built with Mithril
 * https://github.com/caneruguz/treebeard
 * Built by Center for Open Science -> http://www.cos.io
 */
;  // jshint ignore:line
(function (global, factory) {
    "use strict";
    var m;
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jQuery', 'mithril'], factory);
    } else if (typeof exports === 'object') {
        // If using webpack, load CSS with it
        if (typeof webpackJsonp !== 'undefined') {
            // NOTE: Assumes that the style-loader and css-loader are used for .css files
            require('./treebeard.css');
        }
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        m = require('mithril');
        module.exports = factory(jQuery, m);
    } else {
        // Browser globals (root is window)
        m = global.m;
        global.Treebeard = factory(jQuery, m);
    }
}(this, function(jQuery, m) {
    "use strict";

    //Force cache busting in IE
    var oldmrequest = m.request;
    m.request = function () {
        var buster;
        var requestArgs = arguments[0];
        if (requestArgs.url.indexOf('?') !== -1) {
            buster = '&_=';
        } else {
            buster = '?_=';
        }
        requestArgs.url += (buster + (new Date().getTime()));
        return oldmrequest.apply(this, arguments);
    };

    // From Underscore.js, MIT License
    //
    // Returns a function, that, as long as it continues to be invoked, will not
    // be triggered. The function will be called after it stops being called for
    // N milliseconds. If `immediate` is passed, trigger the function on the
    // leading edge, instead of the trailing.
    var debounce = function(func, wait, immediate) {
        var timeout, args, context, timestamp, result;

        var later = function() {
            var last = new Date().getTime() - timestamp;

            if (last < wait && last >= 0) {
                timeout = setTimeout(later, wait - last);
            } else {
                timeout = null;
                if (!immediate) {
                    result = func.apply(context, args);
                    if (!timeout) {
                        context = args = null;
                    }
                }
            }
        };

        return function() {
            context = this;
            args = arguments;
            timestamp = new Date().getTime();
            var callNow = immediate && !timeout;
            if (!timeout) {
                timeout = setTimeout(later, wait);
            }
            if (callNow) {
                result = func.apply(context, args);
                context = args = null;
            }

            return result;
        };
    };

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
        window.treebeardCounter = window.treebeardCounter + 1;
        return window.treebeardCounter;
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
            return function _numCompare(a, b) {
                var num1 = a.data[data] ? a.data[data] : 0;
                var num2 = b.data[data] ? b.data[data] : 0;
                var compareNum = num1 - num2;
                if(compareNum === 0) return a.id - b.id;
                return compareNum;
            };
        }
        if (sortType === 'date') {
            return function _dateCompare(a, b) {
                var date1 = a.data[data] ? new Date(a.data[data]) : new Date(0);
                var date2 = b.data[data] ? new Date(b.data[data]) : new Date(0);
                var compareDates = date1 - date2;
                if(compareDates === 0) return a.id - b.id;
                return compareDates;
            };
        }
        return function _compare(a, b) {
            var textA = a.data[data] ? a.data[data].toString().toLowerCase().replace(/\s/g, '').trim() : '',
                textB = b.data[data] ? b.data[data].toString().toLowerCase().replace(/\s/g, '').trim() : '';
            if (textA < textB) {
                return -1;
            }
            if (textA > textB) {
                return 1;
            }
            return a.id < b.id ? -1 : +1;
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
            return function _numCompare(a, b) {
                var num1 = a.data[data] ? a.data[data] : 0;
                var num2 = b.data[data] ? b.data[data] : 0;
                var compareNum = num2 - num1;
                if(compareNum === 0) return b.id - a.id;
                return compareNum;
            };
        }
        if (sortType === 'date') {
            return function _dateCompare(a, b) {
                var date1 = a.data[data] ? new Date(a.data[data]) : new Date(0);
                var date2 = b.data[data] ? new Date(b.data[data]) : new Date(0);
                var compareDates = date2 - date1;
                if(compareDates === 0) return b.id - a.id;
                return compareDates;
            };
        }
        return function _compare(a, b) {
            var textA = a.data[data] ? a.data[data].toString().toLowerCase().replace(/\s/g, '') : '',
                textB = b.data[data] ? b.data[data].toString().toLowerCase().replace(/\s/g, '') : '';
            if (textA > textB) {
                return -1;
            }
            if (textA < textB) {
                return 1;
            }
            return a.id > b.id ? -1 : +1;
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

    var DEFAULT_NOTIFY_TIMEOUT = 3000;
    /**
     * Implementation of a notification system, added to each row
     * @param {String} [message] Notification message
     * @param {String} [type] One of the bootstrap alert types (info, danger, warning, success, primary, default)
     * @param {Number} [column] Which column the message should replace, if empty the entire row will be used
     * @param {Number} [timeout] Milliseconds that takes for message to be removed.
     * @constructor
     */
    Notify = function _notify(message, type, column, timeout) {
        this.column = column || null;
        this.type = type || "info";
        this.message = message || 'Hello';
        this.on = false;
        this.timeout = timeout === undefined ? DEFAULT_NOTIFY_TIMEOUT : timeout;
        this.css = '';
        this.toggle = function () {
            this.on = !this.on;
        };
        this.show = function () {
            this.on = true;
            var self = this;
            if (self.timeout && self.timeout > 1) { // set timeout to 1 to stay forever
                setTimeout(function () {
                    self.hide();
                }, self.timeout);
            }
            m.redraw(true);
        };
        this.hide = function () {
            this.on = false;
            m.redraw(true);
        };
        this.update = function (message, type, column, timeout, css) {
            this.type = type || this.type;
            this.column = column || this.column;
            this.timeout = timeout === undefined ? DEFAULT_NOTIFY_TIMEOUT : timeout;
            this.message = message;
            this.css = css || '';
            this.show(true);
        };
        this.selfDestruct = function (treebeard, item, timeout) {
            this.on = false;
            this.on = true;
            var self = this,
                out = timeout || 3000;
            setTimeout(function () {
                self.hide();
                item.removeSelf();
                treebeard.redraw();
            }, out);
        };
    };

    /**
     * Implementation of a modal system, currently used once sitewide
     * @constructor
     */
    Modal = function _modal(ctrl) {
        var el = ctrl.select('#tb-tbody'),
            self = this;
        this.on = false;
        this.timeout = false;
        this.css = '';
        this.padding = '50px 100px;';
        this.header = null;
        this.content = null;
        this.actions = null;
        this.height = el.height();
        this.width = el.width();
        this.dismiss = function () {
            this.on = false;
            m.redraw(true);
            ctrl.select('#tb-tbody').css('overflow', 'auto');
        };
        this.show = function () {
            this.on = true;
            if (self.timeout) {
                setTimeout(function () {
                    self.dismiss();
                }, self.timeout);
            }
            m.redraw(true);
        };
        this.toggle = function () {
            this.on = !this.on;
            m.redraw(true);
        };
        this.update = function (contentMithril, actions, header) {
            self.updateSize();
            if (header) {
                this.header = header;
            }
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
            this.height = ctrl.select('#tb-tbody').height();
            this.width = ctrl.select('#tb-tbody').width();
            if (this.width < 500) {
                this.padding = '40px';
            } else {
                this.padding = '50px 100px';
            }
            m.redraw(true);
        };
        this.onmodalshow = function () {
            var margin = ctrl.select('#tb-tbody').scrollTop();
            ctrl.select('.tb-modal-shade').css('margin-top', margin);
            ctrl.select('#tb-tbody').css('overflow', 'hidden');
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
            this.kind = data.kind || "file";
            this.open = data.open;
        }
        if (this.kind === 'folder') {
            this.load = false;
        }
        this.id = getUID();
        this.depth = 0;
        this.children = [];
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
    Item.prototype.move = function _itemMove(toID, toTop) {
        var toItem = Indexes[toID],
            parentID = this.parentID,
            parent = Indexes[parentID];
        toItem.add(this, toTop);
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
    Item.prototype.sortChildren = function _itemSort(treebeard, direction, sortType, index, sortDepth) {
        var columns = treebeard.options.resolveRows.call(treebeard, this),
            field = columns[index].data;
        if (!direction || (direction !== 'asc' && direction !== 'desc')) {
            throw new Error("Treebeard Error: To sort children you need to pass direction as asc or desc to Item.sortChildren");
        }
        if (this.depth >= sortDepth && this.children.length > 0) {
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
            if (a.id === b.id) {
                return true;
            }
            if (a.parent()) {
                return _checkAncestor(a.parent(), b);
            }
            return false;
        }
        if (item.parent()) {
            return _checkAncestor(item.parent(), this);
        }
        return false;
    };

    /**
     * Checks if item is descendant (a child) of another item passed as argument
     * @param {Object} item An item constructed by _item
     * @returns {Boolean} result Whether the item is descendant of item passed as argument
     */
    Item.prototype.isDescendant = function(item) {
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
        var self = this; // Treebard.controller
        var lastLocation = 0; // The last scrollTop location, updates on every scroll.
        var lastNonFilterLocation = 0; // The last scrolltop location before filter was used.
        this.isSorted = {}; // Temporary variables for sorting
        m.redraw.strategy("all");
        // public variables
        this.flatData = []; // Flat data, gets regenerated often
        this.treeData = {}; // The data in hierarchical form
        this.filterText = m.prop(""); // value of the filtertext input
        this.showRange = []; // Array of indexes that the range shows
        this.options = opts; // User defined options
        this.selected = undefined; // The row selected on click.
        this.rangeMargin = 0; // Top margin, required for proper scrolling
        this.visibleIndexes = []; // List of items viewable as a result of an operation like filter.
        this.visibleTop = undefined; // The first visible item.
        this.currentPage = m.prop(1); // for pagination
        this.dropzone = null; // Treebeard's own dropzone object
        this.dropzoneItemCache = undefined; // Cache of the dropped item
        this.filterOn = false; // Filter state for use across the app
        this.multiselected = m.prop([]);
        this.pressedKey = undefined;
        this.dragOngoing = false;
        this.initialized = false; // Treebeard's own initialization check, turns to true after page loads.
        this.colsizes = {}; // Storing column sizes across the app.
        this.tableWidth = m.prop('auto;'); // Whether there should be horizontal scrolling
        this.isUploading = m.prop(false); // Whether an upload is taking place.

        /**
         * Helper function to redraw if user makes changes to the item (like deleting through a hook)
         */
        this.redraw = function _redraw() {
            self.flatten(self.treeData.children, self.visibleTop);
        };

        this.mredraw = function _mredraw() {
            m.redraw();
        }
        /**
         * Prepend selector with ID of root DOM node
         * @param {String} selector CSS selector
         */
        this.select = function (selector) {
            return $('#' + self.options.divID + ' ' + selector);
        };

        // Note: `Modal` constructor dependes on `controller#select`
        this.modal = new Modal(this);

        /**
         * Helper function to reset unique id to a reset number or -1
         * @param {Number} resetNum Number to reset counter to
         */
        this.resetCounter = function _resetCounter(resetNum) {
            if (resetNum !== 0) {
                window.treebeardCounter = resetNum || -1;
            } else {
                window.treebeardCounter = 0;
            }
        };

        /**
         * Instantiates draggable and droppable on DOM elements with options passed from self.options
         */
        this.initializeMove = function () {
            var self = this;
            var draggableOptions,
                droppableOptions,
                x,
                y;
            draggableOptions = {
                helper: 'clone',
                cursor: 'move',
                containment: '#' + self.options.divID,
                delay: 100,
                drag: function (event, ui) {
                    if (self.pressedKey === 27) {
                        return false;
                    }
                    if (self.options.dragEvents.drag) {
                        self.options.dragEvents.drag.call(self, event, ui);
                    } else {
                        if (self.dragText === "") {
                            if (self.multiselected().length > 1) {
                                var newHTML = $(ui.helper).text() + ' <b> + ' + (self.multiselected().length - 1) + ' more </b>';
                                self.dragText = newHTML;
                                $('.tb-drag-ghost').html(newHTML);
                            }
                        }
                        $(ui.helper).css({
                            display: 'none'
                        });
                    }
                    // keep copy of the element and attach it to the mouse location
                    x = event.pageX > 50 ? event.pageX - 50 : 50;
                    y = event.pageY - 10;
                    $('.tb-drag-ghost').css({
                        'position': 'absolute',
                        top: y,
                        left: x,
                        'height': '25px',
                        'width': '400px',
                        'background': 'white',
                        'padding': '0px 10px',
                        'box-shadow': '0 0 4px #ccc'
                    });
                },
                create: function (event, ui) {
                    if (self.options.dragEvents.create) {
                        self.options.dragEvents.create.call(self, event, ui);
                    }
                },
                start: function (event, ui) {
                    var thisID,
                        item,
                        ghost;
                    // if the item being dragged is not in multiselect clear multiselect
                    thisID = parseInt($(ui.helper).closest('.tb-row').attr('data-id'), 10);
                    item = self.find(thisID);
                    if (!self.isMultiselected(thisID)) {
                        self.clearMultiselect();
                        self.multiselected().push(item);
                    }
                    self.dragText = '';
                    ghost = $(ui.helper).clone();
                    ghost.addClass('tb-drag-ghost');
                    $('body').append(ghost);
                    if (self.options.dragEvents.start) {
                        self.options.dragEvents.start.call(self, event, ui);
                    }
                    self.dragOngoing = true;
                    self.select('.tb-row').removeClass(self.options.hoverClass + ' tb-h-error tb-h-success');
                },
                stop: function (event, ui) {
                    $('.tb-drag-ghost').remove();
                    if (self.options.dragEvents.stop) {
                        self.options.dragEvents.stop.call(self, event, ui);
                    }
                    self.dragOngoing = false;
                    self.select('.tb-row').removeClass(self.options.hoverClass + ' tb-h-error tb-h-success');
                }
            };

            droppableOptions = {
                tolerance: 'pointer',
                activate: function (event, ui) {
                    if (self.options.dropEvents.activate) {
                        self.options.dropEvents.activate.call(self, event, ui);
                    }
                },
                create: function (event, ui) {
                    if (self.options.dropEvents.create) {
                        self.options.dropEvents.create.call(self, event, ui);
                    }
                },
                deactivate: function (event, ui) {
                    if (self.options.dropEvents.deactivate) {
                        self.options.dropEvents.deactivate.call(self, event, ui);
                    }
                },
                drop: function (event, ui) {
                    if (self.options.dropEvents.drop) {
                        self.options.dropEvents.drop.call(self, event, ui);
                    }
                },
                out: function (event, ui) {
                    if (self.options.dropEvents.out) {
                        self.options.dropEvents.out.call(self, event, ui);
                    }
                },
                over: function (event, ui) {
                    var id = parseInt($(event.target).closest('.tb-row').attr('data-id'), 10);
                    self.scrollEdges(id);
                    if (self.options.dropEvents.over) {
                        self.options.dropEvents.over.call(self, event, ui);
                    }
                }
            };
            self.options.finalDragOptions = $.extend(draggableOptions, self.options.dragOptions);
            self.options.finalDropOptions = $.extend(droppableOptions, self.options.dropOptions);
            self.options.dragSelector = self.options.moveClass || 'td-title';
            self.moveOn();
        };

        // Handles scrolling when items are at the beginning or end of visible items.
        this.scrollEdges = function (id, buffer) {
            var buffer = buffer || 1,
                last = self.flatData[self.showRange[self.showRange.length - 1 - buffer]].id,
                first = self.flatData[self.showRange[0 + buffer]].id,
                currentScroll = self.select('#tb-tbody').scrollTop();
            if (id === last) {
                self.select('#tb-tbody').scrollTop(currentScroll + self.options.rowHeight + 1);
            }
            if (id === first) {
                self.select('#tb-tbody').scrollTop(currentScroll - self.options.rowHeight - 1);
            }
        }

        /**
         * Turns move on for all elements or elements within a parent container
         * @param parent DOM element for parent
         */
        this.moveOn = function _moveOn(parent) {
            if (!parent) {
                self.select('.' + self.options.dragSelector).draggable(self.options.finalDragOptions);
                self.select('.tb-row').droppable(self.options.finalDropOptions);
            } else {
                $(parent).find('.' + self.options.dragSelector).draggable(self.options.finalDragOptions);
                $(parent).droppable(self.options.finalDropOptions);
            }
        };

        /**
         * Removes move related instances by destroying draggable and droppable.
         */
        this.moveOff = function _moveOff() {
            self.select('.td-title').draggable('destroy');
            self.select('.tb-row').droppable('destroy');
        };

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
            var len = self.flatData.length,
                i, o;
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
            var len = self.showRange.length,
                i, o;
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
                j,
                o;
            for (i = 0; i < cols.length; i++) {
                o = cols[i];
                if (o.filter && item.data[o.data].toString().toLowerCase().indexOf(filter) !== -1) {
                    titleResult = true;
                }
            }
            var hiddenRows = self.options.hiddenFilterRows;
            if (hiddenRows && hiddenRows.length > 0){
                for (j = 0; j < hiddenRows.length; j++) {
                    if (item.data[hiddenRows[j]].toString().toLowerCase().indexOf(filter) !== -1) {
                        titleResult = true;
                    }
                }
            }
            return titleResult;
        };

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
                self.resetFilter();
            } else {
                if (!self.filterOn) {
                    self.filterOn = true;
                    self.lastNonFilterLocation = self.lastLocation;
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
         * Programatically cancels filtering
         */
        this.resetFilter = function _resetFilter(location) {
            var tb = this;
            var lastNonFilterLocation = location || self.lastNonFilterLocation;
            var filter = self.filterText().toLowerCase();
            tb.filterOn = false;
            tb.calculateVisible(0);
            tb.calculateHeight();
            m.redraw(true);
            self.select('#tb-tbody').scrollTop(lastNonFilterLocation); // restore location of scroll
            if (tb.options.onfilterreset) {
                tb.options.onfilterreset.call(tb, filter);
            }
        }


        /**
         * Updates content of the folder with new data or refreshes from lazyload
         * @param {Array} data New raw items, may be returned from ajax call
         * @param {Object} parent Item built with the _item constructor
         * @param {Function} callback A function to be called after loading all data
         */
        this.updateFolder = function (data, parent, callback, flatten) {
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
            if(flatten){
                self.flatten(self.treeData.children, self.visibleTop);
            }
            self.toggleFolder(index, null, callback);
        };

        /**
         * Toggles folder, refreshing the view or reloading in event of lazyload
         * @param {Number} index The index of the item in the flatdata.
         * @param {Event} [event] Toggle click event if this function is triggered by an event.
         * @param {Function} callback A function to be called after loading all data
         */
        this.toggleFolder = function _toggleFolder(index, event, callback) {
            if (index === undefined || index === null) {
                self.redraw();
                return;
            }
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
                icon = $('.tb-row[data-id="' + item.id + '"]').find('.tb-toggle-icon'),
                iconTemplate;
            if (icon.get(0)) {
                m.render(icon.get(0), self.options.resolveRefreshIcon());
            }
            $.when(self.options.resolveLazyloadUrl.call(self, tree)).done(function _resolveLazyloadDone(url) {
                lazyLoad = url;
                if (lazyLoad && item.row.kind === "folder" && tree.open === false && tree.load === false) {
                    tree.children = [];
                    m.request({
                        method: "GET",
                        url: lazyLoad,
                        config: self.options.xhrconfig
                    })
                        .then(function _getUrlBuildtree(value) {
                            if (!value) {
                                self.options.lazyLoadError.call(self, tree);
                                iconTemplate = self.options.resolveToggle.call(self, tree);
                                if (icon.get(0)) {
                                    m.render(icon.get(0), iconTemplate);
                                }
                            } else {
                                if (self.options.lazyLoadPreprocess) {
                                    value = self.options.lazyLoadPreprocess.call(self, value);
                                }
                                if (!$.isArray(value)) {
                                    value = value.data;
                                }
                                var isUploadItem = function(element) {
                                    return element.data.tmpID;
                                };
                                tree.children = tree.children.filter(isUploadItem);
                                for (i = 0; i < value.length; i++) {
                                    child = self.buildTree(value[i], tree);
                                    tree.add(child);
                                }
                                tree.open = true;
                                tree.load = true;
                                // this redundancy is important to get the proper state
                                iconTemplate = self.options.resolveToggle.call(self, tree);
                                if (icon.get(0)) {
                                    m.render(icon.get(0), iconTemplate);
                                }
                            }
                        }, function (info) {
                            self.options.lazyLoadError.call(self, tree);
                            iconTemplate = self.options.resolveToggle.call(self, tree);
                            if (icon.get(0)) {
                                    m.render(icon.get(0), iconTemplate);
                                }
                        })
                        .then(function _getUrlFlatten() {
                            self.flatten(self.treeData.children, self.visibleTop);
                            if (self.options.lazyLoadOnLoad) {
                                self.options.lazyLoadOnLoad.call(self, tree, event);
                            }
                            if (self.options.ontogglefolder) {
                                self.options.ontogglefolder.call(self, tree, event);
                            }
                            if (callback) {
                                callback.call(self, tree, event);
                            }
                        });

                } else {
                    for (j = index + 1; j < len; j++) {
                        o = self.flatData[j];
                        t = Indexes[self.flatData[j].id];
                        if (o.depth <= level) {
                            break;
                        }
                        if (skip && o.depth > skipLevel) {
                            continue;
                        }
                        if (o.depth === skipLevel) {
                            skip = false;
                        }
                        if (tree.open) { // closing
                            o.show = false;
                        } else { // opening
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
                    if (icon.get(0)) {
                        m.render(icon.get(0), iconTemplate);
                    }
                    if (self.options.ontogglefolder) {
                        self.options.ontogglefolder.call(self, tree, event);
                    }
                }
                if (self.options.allowMove) {
                    self.moveOn();
                }
            });
        };

        /**
         * Toggles the sorting when clicked on sort icons.
         * @param {Event} [event] Toggle click event if this function is triggered by an event.
         */
        this.sortToggle = function _isSortedToggle(ev, col, type, sortType) {
            var counter = 0;
            var redo;
            var element;
            if(ev){ // If a button is clicked, use the element attributes
                element = $(ev.target);
                type = element.attr('data-direction');
                col = parseInt(element.parent('.tb-th').attr('data-tb-th-col'));
                sortType = element.attr('data-sortType');
            }
            self.select('.asc-btn, .desc-btn').addClass('tb-sort-inactive'); // turn all styles off
            self.isSorted[col].asc = false;
            self.isSorted[col].desc = false;
            if (!self.isSorted[col][type]) {
                redo = function _redo(data) {
                    data.map(function _mapToggle(item) {
                        item.sortChildren(self, type, sortType, col, self.options.sortDepth);
                        if (item.children.length > 0) {
                            redo(item.children);
                        }
                        counter = counter + 1;
                    });
                };
                self.treeData.sortChildren(self, type, sortType, col, self.options.sortDepth); // Then start recursive loop
                redo(self.treeData.children);
                self.select('div[data-tb-th-col=' + col + ']').children('.' + type + '-btn').removeClass('tb-sort-inactive');
                self.isSorted[col][type] = true;
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
            self.innerHeight = itemsHeight + self.remainder;
            return itemsHeight;
        };

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
        };

        /**
         * Refreshes the view to start the the location where begin is the starting index
         * @param {Number} begin The index location of visible indexes to start at.
         */
        this.refreshRange = function _refreshRange(begin, redraw) {
            redraw = redraw !== undefined ? redraw : true; // redraw by default
            var len = self.visibleIndexes.length,
                range = [],
                counter = 0,
                i,
                index;
            if (!begin || begin < 0 || begin > self.flatData.length) {
                begin = 0;
            }
            self.visibleTop = begin;
            for (i = begin; i < len; i++) {
                if (range.length === self.options.showTotal) {
                    break;
                }
                index = self.visibleIndexes[i];
                range.push(index);
                counter = counter + 1;
            }
            self.showRange = range;
            // TODO: Not sure if the redraw param is necessary. We can probably
            // Use m.start/endComputtion to avoid successive redraws
            if (redraw) {
                m.redraw(true);
            }
        };

        /**
         * Changes view to continous scroll when clicked on the scroll button
         */
        this.toggleScroll = function _toggleScroll() {
            self.options.paginate = false;
            self.select('.tb-paginate').removeClass('active');
            self.select('.tb-scroll').addClass('active');
            self.select('#tb-tbody').scrollTop((self.currentPage() - 1) * self.options.showTotal * self.options.rowHeight);
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
            self.select('.tb-scroll').removeClass('active');
            self.select('.tb-paginate').addClass('active');
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
            self.multiselected().map(function (item) {
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
            self.multiselected().map(function (item, index, arr) {
                if (item.id === id) {
                    arr.splice(index, 1);
                    // remove highlight
                    $('.tb-row[data-id="' + item.id + '"]').removeClass(self.options.hoverClassMultiselect);
                }
            });
            return false;
        };

        /**
         * Adds highlight to the multiselected items using jquery.
         */
        this.highlightMultiselect = function () {
            $('.' + self.options.hoverClassMultiselect).removeClass(self.options.hoverClassMultiselect);
            self.multiselected().map(function (item) {
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
                begin,
                end,
                i,
                cmdkey,
                direction;
            if (self.options.onbeforemultiselect) {
                self.options.onbeforemultiselect.call(self, event, tree);
            }
            // if key is shift
            if (self.pressedKey === 16) {
                // get the index of this and add all visible indexes between this one and last selected
                // If there is no multiselect yet
                if (self.multiselected().length === 0) {
                    self.multiselected().push(tree);
                } else {
                    begin = self.returnRangeIndex(self.multiselected()[0].id);
                    end = self.returnRangeIndex(id);
                    if (begin > end) {
                        direction = 'up';
                    } else {
                        direction = 'down';
                    }
                    if (begin !== end) {
                        self.multiselected([]);
                        if (direction === 'down') {
                            for (i = begin; i < end + 1; i++) {
                                self.multiselected().push(Indexes[self.flatData[self.showRange[i]].id]);
                            }
                        }
                        if (direction === 'up') {
                            for (i = begin; i > end - 1; i--) {
                                self.multiselected().push(Indexes[self.flatData[self.showRange[i]].id]);
                            }
                        }
                    }
                }
            }
            // if key is cmd
            cmdkey = 91; // works with mac
            if (window.navigator.userAgent.indexOf('MSIE') > -1 || window.navigator.userAgent.indexOf('Windows') > -1) {
                cmdkey = 17; // works with windows
            }
            if (window.navigator.userAgent.indexOf('Firefox') > -1) {
                cmdkey = 224; // works with Firefox
            }
            if (self.pressedKey === cmdkey) {
                if (!self.isMultiselected(tree.id)) {
                    self.multiselected().push(tree);
                } else {
                    self.removeMultiselected(tree.id);
                }
            }
            // if there is no key add the one.
            if (!self.pressedKey) {
                self.clearMultiselect();
                self.multiselected().push(tree);
            }

            if (self.options.onmultiselect) {
                self.options.onmultiselect.call(self, event, tree);
            }
            self.highlightMultiselect.call(this);
        };

        this.clearMultiselect = function () {
            $('.' + self.options.hoverClassMultiselect).removeClass(self.options.hoverClassMultiselect);
            self.multiselected([]);
        };

        // Handles the up and down arrow keys since they do almost identical work
        this.multiSelectArrows = function (direction){
            if ($.isFunction(self.options.onbeforeselectwitharrow)) {
                self.options.onbeforeselectwitharrow.call(this, self.multiselected()[0], direction);
            }
            var val = direction === 'down' ? 1 : -1;
            var selectedIndex = self.returnIndex(self.multiselected()[0].id);
            var visibleIndex = self.visibleIndexes.indexOf(selectedIndex);
            var newIndex = visibleIndex + val;
            var row = self.flatData[self.visibleIndexes[newIndex]];
            if(!row){
                return;
            }
            var treeItem = self.find(row.id);
            self.multiselected([treeItem]);
            self.scrollEdges(treeItem.id, 0);
            self.highlightMultiselect.call(self);
            if ($.isFunction(self.options.onafterselectwitharrow)) {
                self.options.onafterselectwitharrow.call(this, row, direction);
            }

        }

        // Handles the toggling of folders with the right and left arrow keypress
        this.keyboardFolderToggle = function (action) {
            var item = self.multiselected()[0];
            if(item.kind === 'folder') {
                if((item.open === true && action === 'close') || (item.open === false && action === 'open'))  {
                    var index = self.returnIndex(item.id);
                    self.toggleFolder(index, null);
                }
            }
        }

        // Handles what the up, down, left, right arrow keys do.
        this.handleArrowKeys = function (e) {
            if([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
                e.preventDefault();
            }
            var key = e.keyCode;
            // if pressed key is up arrow
            if(key === 38) {
                self.multiSelectArrows('up');
            }
            // if pressed key is down arrow
            if(key === 40) {
                self.multiSelectArrows('down');
            }
            // if pressed key is left arrow
            if(key === 37) {
                self.keyboardFolderToggle('close');
            }
            // if pressed key is right arrow
            if(key === 39) {
                self.keyboardFolderToggle('open');
            }
        }



        /**
         * Remove dropzone from grid
         */
        function _destroyDropzone() {
            self.dropzone.destroy();
        }

        /**
         * Apply dropzone to grid with the optional hooks
         */
        function _applyDropzone() {
            if (self.dropzone) {
                _destroyDropzone();
            } // Destroy existing dropzone setup
            var options = $.extend({
                clickable: false,
                counter: 0,
                accept: function _dropzoneAccept(file, done) {
                    var parent = file.treebeardParent;
                    if (self.options.addcheck.call(this, self, parent, file)) {
                        $.when(self.options.resolveUploadUrl.call(self, parent, file))
                            .then(function _resolveUploadUrlThen(newUrl) {
                                if (newUrl) {
                                    self.dropzone.options.url = newUrl;
                                    self.dropzone.options.counter++;
                                    if (self.dropzone.options.counter < 2) {
                                        var index = self.returnIndex(parent.id);
                                        if (!parent.open) {
                                            self.toggleFolder(index, null);
                                        }
                                    }
                                }
                                return newUrl;
                            })
                            .then(function _resolveUploadMethodThen() {
                                if ($.isFunction(self.options.resolveUploadMethod)) {
                                    self.dropzone.options.method = self.options.resolveUploadMethod.call(self, parent);
                                }
                            })
                            .done(function _resolveUploadUrlDone() {
                                done();
                            });
                    }
                },
                drop: function _dropzoneDrop(event) {
                    var rowID = $(event.target).closest('.tb-row').attr('data-id');
                    var item = Indexes[rowID];
                    if (item.kind === 'file') {
                        item = item.parent();
                    }
                    self.dropzoneItemCache = item;
                    if (!item.open) {
                        var index = self.returnIndex(item.id);
                        self.toggleFolder(index, null);
                    }
                    if ($.isFunction(self.options.dropzoneEvents.drop)) {
                        self.options.dropzoneEvents.drop.call(this, self, event);
                    }
                },
                dragstart: function _dropzoneDragStart(event) {
                    if ($.isFunction(self.options.dropzoneEvents.dragstart)) {
                        self.options.dropzoneEvents.dragstart.call(this, self, event);
                    }
                },
                dragend: function _dropzoneDragEnd(event) {
                    if ($.isFunction(self.options.dropzoneEvents.dragend)) {
                        self.options.dropzoneEvents.dragend.call(this, self, event);
                    }
                },
                dragenter: function _dropzoneDragEnter(event) {
                    if ($.isFunction(self.options.dropzoneEvents.dragenter)) {
                        self.options.dropzoneEvents.dragenter.call(this, self, event);
                    }
                },
                dragover: function _dropzoneDragOver(event) {
                    if ($.isFunction(self.options.dropzoneEvents.dragover)) {
                        self.options.dropzoneEvents.dragover.call(this, self, event);
                    }
                },
                dragleave: function _dropzoneDragLeave(event) {
                    if ($.isFunction(self.options.dropzoneEvents.dragleave)) {
                        self.options.dropzoneEvents.dragleave.call(this, self, event);
                    }
                },
                success: function _dropzoneSuccess(file, response) {
                    if ($.isFunction(self.options.dropzoneEvents.success)) {
                        self.options.dropzoneEvents.success.call(this, self, file, response);
                    }
                    if ($.isFunction(self.options.onadd)) {
                        self.options.onadd.call(this, self, file.treebeardParent, file, response);
                    }
                },
                error: function _dropzoneError(file, message, xhr) {
                    if ($.isFunction(self.options.dropzoneEvents.error)) {
                        self.options.dropzoneEvents.error.call(this, self, file, message, xhr);
                    }
                },
                uploadprogress: function _dropzoneUploadProgress(file, progress, bytesSent) {
                    if ($.isFunction(self.options.dropzoneEvents.uploadprogress)) {
                        self.options.dropzoneEvents.uploadprogress.call(this, self, file, progress, bytesSent);
                    }
                },
                sending: function _dropzoneSending(file, xhr, formData) {
                    var filesArr = this.getQueuedFiles();
                    if (filesArr.length  > 0) {
                        self.isUploading(true);
                    } else {
                        self.isUploading(false);
                    }
                    if ($.isFunction(self.options.dropzoneEvents.sending)) {
                        self.options.dropzoneEvents.sending.call(this, self, file, xhr, formData);
                    }
                },
                complete: function _dropzoneComplete(file) {
                    if ($.isFunction(self.options.dropzoneEvents.complete)) {
                        self.options.dropzoneEvents.complete.call(this, self, file);
                    }
                },
                queuecomplete: function _dropzoneComplete(file) {
                    self.isUploading(false);
                    if ($.isFunction(self.options.dropzoneEvents.queuecomplete)) {
                        self.options.dropzoneEvents.queuecomplete.call(this, self, file);
                    }
                },
                addedfile: function _dropzoneAddedFile(file) {
                    file.treebeardParent = self.dropzoneItemCache;
                    if ($.isFunction(self.options.dropzoneEvents.addedfile)) {
                        self.options.dropzoneEvents.addedfile.call(this, self, file);
                    }
                },
                removedfile: function _dropzoneRemovedFile(file) {
                    file.treebeardParent = self.dropzoneItemCache;
                    if ($.isFunction(self.options.dropzoneEvents.removedfile)) {
                        self.options.dropzoneEvents.removedfile.call(this, self, file);
                    }
                }
            }, self.options.dropzone); // Extend default options
            // Add Dropzone with different scenarios of library inclusion, should work for most installations
            var Dropzone;
            if (typeof module === 'object') {
                Dropzone = require('dropzone');
            } else {
                Dropzone = window.Dropzone;
            }
            if (typeof Dropzone === 'undefined') {
                throw new Error('To enable uploads Treebeard needs "Dropzone" to be installed.');
            }
            // apply dropzone to the Treebeard object
            self.dropzone = new Dropzone('#' + self.options.divID, options); // Initialize dropzone
        }

        /**
         * Loads the data pushed in to Treebeard and handles it to comply with treebeard data structure.
         * @param {Array, String} data Data sent in as an array of objects or a url in string form
         */
        function _loadData(data) {
                // Order of operations: Gewt data -> build tree -> flatten for view -> calculations for view: visible, height
            if ($.isArray(data)) {
                $.when(self.buildTree(data)).then(function _buildTreeThen(value) {
                    self.treeData = value;
                    Indexes[self.treeData.id] = value;
                    self.flatten(self.treeData.children);
                    return value;
                }).done(function _buildTreeDone() {
                    self.calculateVisible();
                    self.calculateHeight();
                    self.initialized = true;
                    if ($.isFunction(self.options.ondataload)) {
                        self.options.ondataload.call(self);
                    }
                });
            } else {
                // then we assume it's a sring with a valiud url
                // I took out url validation because it does more harm than good here.
                m.request({
                    method: 'GET',
                    url: data,
                    config: self.options.xhrconfig,
                    extract: function (xhr, xhrOpts) {
                        if (xhr.status !== 200) {
                            return self.options.ondataloaderror(xhr);
                        }
                        return xhr.responseText;
                    }
                })
                    .then(function _requestBuildtree(value) {
                        if (self.options.lazyLoadPreprocess) {
                            value = self.options.lazyLoadPreprocess.call(self, value);
                        }
                        self.treeData = self.buildTree(value);
                    })
                    .then(function _requestFlatten() {
                        Indexes[self.treeData.id] = self.treeData;
                        self.flatten(self.treeData.children);
                    })
                    .then(function _requestCalculate() {
                        self.calculateVisible();
                        self.calculateHeight();
                        self.initialized = true;
                        if ($.isFunction(self.options.ondataload)) {
                            self.options.ondataload.call(self);
                        }
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
                tree.depth = parent.depth + 1; // Going down the list the parent doesn't yet have depth information
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

        /**
         * Turns the tree structure into a flat index of nodes
         * @param {Array} value Array of hierarchical objects
         * @param {Number} visibleTop Passes through the beginning point so that refreshes can work, default is 0.
         * @return {Array} value Returns a flat version of the hierarchical objects in an array.
         */
        this.flatten = function _flatten(value, visibleTop) {
            self.flatData = [];

            (function doFlatten(data, parentIsOpen) {
                $.each(data, function(index, item) {
                    Indexes[item.id] = item;

                    self.flatData.push({
                        show: parentIsOpen,

                        id: item.id,
                        row: item.data,
                        depth: item.depth,
                    });

                    if (item.children.length > 0) {
                        doFlatten(item.children, parentIsOpen && item.open);
                    }
                });
            })(value, true);

            self.calculateVisible(visibleTop);
            self.calculateHeight();
            m.redraw(true);
            if (self.options.redrawComplete) {
                self.options.redrawComplete.call(self);
            }

            return value;
        };

        /**
         * Update view on scrolling the table
         */
        this.onScroll = debounce(function _scrollHook() {
            var totalVisibleItems = self.visibleIndexes.length;
            if (!self.options.paginate) {
                if (totalVisibleItems > self.options.naturalScrollLimit) {
                    m.startComputation();
                    var $this = $(this);
                    var scrollTop, itemsHeight, innerHeight, location, index;
                    itemsHeight = self.calculateHeight();
                    innerHeight = $this.children('.tb-tbody-inner').outerHeight();
                    scrollTop = $this.scrollTop();
                    location = scrollTop / innerHeight * 100;
                    index = Math.floor(location / 100 * totalVisibleItems);
                    self.rangeMargin = index * self.options.rowHeight; // space the rows will have from the top.
                    self.refreshRange(index, false); // which actual rows to show
                    self.lastLocation = scrollTop;
                    self.highlightMultiselect();
                    m.endComputation();
                }
                if (self.options.onscrollcomplete) {
                    self.options.onscrollcomplete.call(self);
                }
            }
        }, this.options.scrollDebounce);

        /**
         * Initialization functions after the main body of the table is loaded
         * @param {Object} el The DOM element that config is run on
         * @param {Boolean} isInit Whether this function ran once after page load.
         */
        this.init = function _init(el, isInit) {
            var containerHeight = self.select('#tb-tbody').height(),
                titles = self.select('.tb-row-titles'),
                columns = self.select('.tb-th');
            if(self.options.naturalScrollLimit){
                self.options.showTotal = self.options.naturalScrollLimit;
            } else {
                self.options.showTotal = Math.floor(containerHeight / self.options.rowHeight) + 1;
            }

            self.remainder = (containerHeight / self.options.rowHeight) + self.options.rowHeight;
            // reapply move on view change.
            if (self.options.allowMove) {
                self.moveOn();
            }
            if (isInit) {
                return;
            }
            if (self.options.allowMove) {
                self.initializeMove(); // Needed to run once to establish drag and drop options
            }
            if (!self.options.rowHeight) { // If row height is not set get it from CSS
                self.options.rowHeight = self.select('.tb-row').height();
            }
            self.select('.gridWrapper').mouseleave(function() {
                self.select('.tb-row').removeClass(self.options.hoverClass);
            });
            // Main scrolling functionality
            self.select('#tb-tbody').scroll(self.onScroll);

            function _resizeCols() {
                var parentWidth = titles.width(),
                    percentageTotal = 0,
                    p;
                columns.each(function(index) { // calculate percentages for each column
                    var col = $(this),
                        lastWidth;
                    col.attr('data-tb-size', col.outerWidth());
                    if (index === self.select('.tb-th').length - 1) { // last column gets the remainder
                        lastWidth = 100 - percentageTotal;
                        self.colsizes[col.attr('data-tb-th-col')] = lastWidth;
                        col.css('width', lastWidth + '%');
                    } else {
                        p = col.outerWidth() / parentWidth * 100;
                        self.colsizes[col.attr('data-tb-th-col')] = p;
                        col.css('width', p + '%');
                    }
                    percentageTotal += p;
                });
            }

            function convertToPixels() {
                var parentWidth = titles.width(),
                    totalPixels = 0;
                columns.each(function (index) {
                    var col = $(this),
                        colWidth = parentWidth - totalPixels - 1,
                        width;
                    if (index === self.select('.tb-th').length - 1) { // last column gets the remainder
                        col.css('width', colWidth + 'px'); // -1 for the border
                    } else {
                        width = col.outerWidth();
                        col.css('width', width);
                        totalPixels += width;
                    }
                });
            }
            self.select('.tb-th.tb-resizable').resizable({
                containment: 'parent',
                delay: 200,
                handles: 'e',
                minWidth: 60,
                start: function (event, ui) {
                    convertToPixels();
                },
                create: function (event, ui) {
                    // change cursor
                    self.select('.ui-resizable-e').css({
                        "cursor": "col-resize"
                    });
                },
                resize: function (event, ui) {
                    var thisCol = $(this),
                        index = $(this).attr('data-tb-th-col'),
                        totalColumns = columns.length,
                        // if the overall size is getting bigger than home size, make other items smaller
                        parentWidth = titles.width() - 1,
                        childrenWidth = 0,
                        diff,
                        nextBigThing,
                        nextBigThingIndex,
                        lastBigThing,
                        lastBigThingIndex,
                        diff2,
                        diff3,
                        w2,
                        w3,
                        lastWidth,
                        colWidth;
                    columns.each(function() {
                        childrenWidth = childrenWidth + $(this).outerWidth();
                    });
                    if (childrenWidth > parentWidth) {
                        diff2 = childrenWidth - parentWidth;
                        nextBigThing = columns.not(ui.element).filter(function() {
                            var colElement = parseInt($(ui.element).attr('data-tb-th-col')),
                                colThis = parseInt($(this).attr('data-tb-th-col'));
                            if (colThis > colElement) {
                                return $(this).outerWidth() > 40;
                            }
                            return false;
                        }).first();
                        if (nextBigThing.length > 0) {
                            w2 = nextBigThing.outerWidth();
                            nextBigThing.css({
                                width: (w2 - diff2) + 'px'
                            });
                            nextBigThingIndex = nextBigThing.attr('data-tb-th-col');
                            self.select('.tb-col-' + nextBigThingIndex).css({
                                width: (w2 - diff2) + 'px'
                            });
                        } else {
                            $(ui.element).css({
                                width: $(ui.element).attr('data-tb-currentSize') + 'px'
                            });
                            return;
                        }
                    }
                    if (childrenWidth < parentWidth) {
                        diff3 = parentWidth - childrenWidth;
                        // number of children other than the current element with widths bigger than 40
                        lastBigThing = columns.not(ui.element).filter(function() {
                            var $this = $(this);
                            return $this.outerWidth() < parseInt($this.attr('data-tb-size'));
                        }).last();
                        if (lastBigThing.length > 0) {
                            w3 = lastBigThing.outerWidth();
                            lastBigThing.css({
                                width: (w3 + diff3) + 'px'
                            });
                            lastBigThingIndex = lastBigThing.attr('data-tb-th-col');
                            self.select('.tb-col-' + lastBigThingIndex).css({
                                width: (w3 + diff3) + 'px'
                            });
                        } else {
                            w3 = columns.last().outerWidth();
                            columns.last().css({
                                width: (w3 + diff3) + 'px'
                            }).attr('data-tb-size', w3 + diff3);
                        }
                    }
                    // make the last column rows be same size as last column header
                    lastWidth = columns.last().width();
                    self.select('.tb-col-' + (totalColumns - 1)).css('width', lastWidth + 'px');

                    $(ui.element).attr('data-tb-currentSize', $(ui.element).outerWidth());
                    // change corresponding columns in the table
                    colWidth = thisCol.outerWidth();
                    self.select('.tb-col-' + index).css({
                        width: colWidth + 'px'
                    });
                },
                stop: function (event, ui) {
                    _resizeCols();
                    m.redraw(true);
                }
            });
            if (self.options.uploads) {
                _applyDropzone();
            }
            if ($.isFunction(self.options.onload)) {
                self.options.onload.call(self);
            }
            $(window).on('keydown', function(event){
                if(self.options.allowArrows && self.multiselected().length === 1) {
                    self.handleArrowKeys(event);
                }
            });
            if (self.options.multiselect) {
                $(window).keydown(function (event) {
                    self.pressedKey = event.keyCode;
                });
                $(window).keyup(function (event) {
                    self.pressedKey = undefined;
                });
            }
            $(window).keydown(function (event) {
                // if escape cancel modal - 27
                if (self.modal.on && event.keyCode === 27) {
                    self.modal.dismiss();
                }
                // if enter then run the modal - 13
                if (self.modal.on && event.keyCode === 13) {
                    self.select('.tb-modal-footer .btn-success').trigger('click');
                }
            });
            window.onblur = self.resetKeyPress;

            $(window).resize(function () {
                self.setScrollMode();
            });
            self.setScrollMode();
        };

        this.setScrollMode = function _setScrollMode() {
            if(self.options.hScroll && $('#' + self.options.divID).width() < self.options.hScroll){
                self.tableWidth(self.options.hScroll + 'px;');
            } else {
                self.tableWidth('auto;');
            }
        }
        /**
         * Resets keys that are hung up. Other window onblur event actions can be added in here.
         */
        this.resetKeyPress = function() {
                self.pressedKey = undefined;
            };
            /**
             * Destroys Treebeard by emptying the DOM object and removing dropzone
             * Because DOM objects are removed their events are going to be cleaned up.
             */
        this.destroy = function _destroy() {
            var el = document.getElementById(self.options.divID);
            var parent = el.parentNode;
            var clone = el.cloneNode(true);
            while (clone.firstChild) {
                clone.removeChild(clone.firstChild);
            }
            parent.removeChild(el);
            parent.appendChild(clone);
            if (self.dropzone) {
                _destroyDropzone();
            } // Destroy existing dropzone setup
        };

        /**
         * Checks if there is filesData option, fails if there isn't, initiates the entire app if it does.
         */
        if (self.options.filesData) {
            _loadData(self.options.filesData);
        } else {
            throw new Error("Treebeard Error: You need to define a data source through 'options.filesData'");
        }
    };

    /**
     * Mithril View. Documentation is here: (http://lhorie.github.io/mithril/mithril.html) Use m() for templating.
     * @param {Object} ctrl The entire Treebeard.controller object with its values and methods. Refer to as ctrl.
     */
    Treebeard.view = function treebeardView(ctrl) {
        return m('.gridWrapper', { style : 'overflow-x: auto' }, [
                m(".tb-table", { style : 'width:' + ctrl.tableWidth() }, [
                    /**
                     * Template for the head row, includes whether filter or title should be shown.
                     */
                    (function showHeadA() {
                        if(ctrl.options.toolbarComponent) {
                            return m.component(ctrl.options.toolbarComponent, {treebeard : ctrl, mode : null });
                        }
                        return ctrl.options.headerTemplate.call(ctrl);
                    }()), (function () {
                        if (!ctrl.options.hideColumnTitles) {
                            return m(".tb-row-titles", [
                                /**
                                 * Render column titles based on the columnTitles option.
                                 */

                                ctrl.options.columnTitles.call(ctrl).map(function _mapColumnTitles(col, index, arr) {
                                    var sortView = "",
                                        up,
                                        down,
                                        resizable = '.tb-resizable';
                                    var width = ctrl.colsizes[index] ? ctrl.colsizes[index] + '%' : col.width;
                                    if (!ctrl.options.resizeColumns) { // Check if columns can be resized.
                                        resizable = '';
                                    }
                                    if (index === arr.length - 1) { // Last column itself is not resizable because you don't need to
                                        resizable = '';
                                    }
                                    if (col.sort) { // Add sort buttons with their onclick functions
                                        if(!ctrl.isSorted[index]) {
                                            ctrl.isSorted[index] = {
                                                asc: false,
                                                desc: false
                                            }
                                        };
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
                                        sortView = [
                                            m(up + '.tb-sort-inactive.asc-btn.m-r-xs', {
                                                onclick: ctrl.sortToggle.bind(index),
                                                "data-direction": "asc",
                                                "data-sortType": col.sortType
                                            }),
                                            m(down + '.tb-sort-inactive.desc-btn', {
                                                onclick: ctrl.sortToggle.bind(index),
                                                "data-direction": "desc",
                                                "data-sortType": col.sortType
                                            })
                                        ];
                                    }
                                    return m('.tb-th' + resizable, {
                                        style: "width: " + width,
                                        'data-tb-th-col': index
                                    }, [
                                        m('span.m-r-sm', col.title),
                                        sortView
                                    ]);
                                })

                            ]);
                        }
                    }()),
                    m("#tb-tbody", {
                        config: ctrl.init
                    }, [
                        /**
                         * In case a modal needs to be shown, check Modal object
                         */
                        (function showModal() {
                            var dissmissTemplate = m('button.close', {
                                            'onclick': function() {
                                                ctrl.modal.dismiss();
                                            }
                                        }, [ctrl.options.removeIcon()]);
                            if (ctrl.modal.on) {
                                return m('.tb-modal-shade', {
                                    config: ctrl.modal.onmodalshow,
                                    style: 'width:' + ctrl.modal.width + 'px; height:' + ctrl.modal.height + 'px;padding:' + ctrl.modal.padding,
                                    onclick : function(event) {
                                        ctrl.modal.dismiss();
                                    }
                                }, [
                                    m('.modal-content', {
                                        'class': ctrl.modal.css,
                                        onclick : function() {
                                            event.stopPropagation();
                                            return true;
                                        }
                                    }, [
                                        (function checkHeader(){
                                            if(ctrl.modal.header){
                                                return [ m('.modal-header', [
                                                    dissmissTemplate,
                                                    ctrl.modal.header
                                                    ]),
                                                 m('.modal-body', ctrl.modal.content)
                                                ];
                                            } else {
                                                return [
                                                m('.modal-body', [
                                                    dissmissTemplate,
                                                    ctrl.modal.content
                                                    ])
                                                ];
                                            }
                                        }()),
                                        m('.modal-footer', ctrl.modal.actions)
                                    ])
                                ]);
                            }
                        }()),
                        m('.tb-tbody-inner', {
                            style: 'height: ' + ctrl.innerHeight + 'px;'

                        }, [
                            m('', {
                                style: "margin-top:" + ctrl.rangeMargin + 'px;'
                            }, [
                                /**
                                 * showRange has the several items that get shown at a time. It's key to view optimization
                                 * showRange values change with scroll, filter, folder toggling etc.
                                 */
                                ctrl.showRange.length === 0 && ctrl.filterOn ?
                                    m('.tb-no-results', 'No results found for this search term.')
                                    : ctrl.showRange.map(function _mapRangeView(item, index) {
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
                                        padding = (indent - 1) * 20;
                                    }
                                    if (tree.notify.on && !tree.notify.column) { // In case a notification is taking up the column space
                                        return m('.tb-row',{'style': "height: " + ctrl.options.rowHeight + "px;"}, [
                                            m('.tb-notify.alert-' + tree.notify.type, {
                                                'class': tree.notify.css
                                            }, [
                                                m('span', tree.notify.message)
                                            ])
                                        ]);
                                    } else {
                                        return m(".tb-row", { // Events and attribtues for entire row
                                            "key": id,
                                            "class": css + " " + oddEvenClass,
                                            "data-id": id,
                                            "data-level": indent,
                                            "data-index": item,
                                            "data-rIndex": index,
                                            style: "height: " + ctrl.options.rowHeight + "px;",
                                            onclick: function _rowClick(event) {
                                                var el = $(event.target);
                                                if(el.hasClass('tb-toggle-icon') || el.hasClass('fa-plus') || el.hasClass('fa-minus')) {
                                                    return;
                                                }
                                                if (ctrl.options.multiselect) {
                                                    ctrl.handleMultiselect(id, index, event);
                                                }
                                                ctrl.selected = id;
                                                if (ctrl.options.onselectrow) {
                                                    ctrl.options.onselectrow.call(ctrl, tree, event);
                                                }
                                            },
                                            ondblclick : function _ondblclick(event){
                                                var self = this;
                                                if ($.isFunction(ctrl.options.ondblclickrow)) {
                                                    ctrl.options.ondblclickrow.call(ctrl, tree, event);
                                                }
                                            },
                                            onmouseover: function _rowMouseover(event) {
                                                ctrl.mouseon = id;
                                                if (ctrl.options.hoverClass && !ctrl.dragOngoing) {
                                                    ctrl.select('.tb-row').removeClass(ctrl.options.hoverClass);
                                                    $(this).addClass(ctrl.options.hoverClass);
                                                }
                                                if (ctrl.options.onmouseoverrow) {
                                                    ctrl.options.onmouseoverrow.call(ctrl, tree, event);
                                                }
                                            }
                                        }, [
                                            /**
                                             * Build individual columns depending on the resolveRows
                                             */
                                            rowCols.map(function _mapColumnsContent(col, index) {
                                                var cell,
                                                    title,
                                                    colInfo = ctrl.options.columnTitles.call(ctrl)[index],
                                                    colcss = col.css || '';
                                                var width = ctrl.colsizes[index] ? ctrl.colsizes[index] + '%' : colInfo.width;
                                                cell = m('.tb-td.tb-col-' + index, {
                                                    'class': colcss,
                                                    style: "width:" + width
                                                }, [
                                                    m('span', row[col.data])
                                                ]);
                                                if (tree.notify.on && tree.notify.column === index) {
                                                    return m('.tb-td.tb-col-' + index, {
                                                        style: "width:" + width
                                                    }, [
                                                        m('.tb-notify.alert-' + tree.notify.type, {
                                                            'class': tree.notify.css
                                                        }, [
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
                                                        "data-id": id,
                                                        'class': colcss,
                                                        style: "padding-left: " + padding + "px; width:" + width
                                                    }, [
                                                        m("span.tb-td-first", // Where toggling and folder icons are
                                                            (function _toggleView() {
                                                                var resolveIcon = ctrl.options.resolveIcon.call(ctrl, tree); // Should return false if no icon is needed
                                                                var resolveToggle = ctrl.options.resolveToggle.call(ctrl, tree); // Should return false if no icon is needed
                                                                var set = [{
                                                                    'id': 1,
                                                                    'css': 'tb-expand-icon-holder',
                                                                    'resolve': resolveIcon
                                                                }, {
                                                                    'id': 2,
                                                                    'css': 'tb-toggle-icon',
                                                                    'resolve': resolveToggle
                                                                }];
                                                                var templateIcon = m('span.' + set[0].css, {
                                                                        key: set[0].id
                                                                    },
                                                                    set[0].resolve
                                                                );
                                                                var templateToggle = m('span.' + set[1].css, {
                                                                    key: set[1].id,
                                                                    onclick: function _folderToggleClick(event) {
                                                                        if (ctrl.options.togglecheck.call(ctrl, tree)) {
                                                                            ctrl.toggleFolder(item, event);
                                                                        }
                                                                    }
                                                                }, set[1].resolve);
                                                                if (ctrl.filterOn && resolveIcon) {
                                                                    return templateIcon;
                                                                }
                                                                return [
                                                                    templateToggle, // Don't make toggle optional
                                                                    resolveIcon ? templateIcon : ''
                                                                ];
                                                            }())
                                                        ),
                                                        title
                                                    ]);
                                                }
                                                if (!col.folderIcons && col.custom) { // If there is a custom call.
                                                    cell = m('.tb-td.tb-col-' + index, {
                                                        'class': colcss,
                                                        style: "width:" + width
                                                    }, [
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
                    /**
                     * Footer, scroll/paginate toggle, page numbers.
                     */
                    (function _footer() {
                        if (ctrl.options.paginate || ctrl.options.paginateToggle) {
                            return m('.tb-footer', [
                                m(".row", [
                                    m(".col-xs-4", (function _showPaginateToggle() {
                                        if (ctrl.options.paginateToggle) {
                                            var activeScroll = "",
                                                activePaginate = "";
                                            if (ctrl.options.paginate) {
                                                activePaginate = "active";
                                            } else {
                                                activeScroll = "active";
                                            }
                                            return m('.btn-group.padder-10', [
                                                m("button.tb-button.tb-scroll", {
                                                        onclick: ctrl.toggleScroll,
                                                        "class": activeScroll
                                                    },
                                                    "Scroll"),
                                                m("button.tb-button.tb-paginate", {
                                                        onclick: ctrl.togglePaginate,
                                                        "class": activePaginate
                                                    },
                                                    "Paginate")
                                            ]);
                                        }
                                    }())),
                                    m('.col-xs-8', [m('.padder-10', [
                                        (function _showPaginate() {
                                            if (ctrl.options.paginate) {
                                                var total_visible = ctrl.visibleIndexes.length,
                                                    total = Math.ceil(total_visible / ctrl.options.showTotal);
                                                if (ctrl.options.resolvePagination) {
                                                    return ctrl.options.resolvePagination.call(ctrl, total, ctrl.currentPage());
                                                }
                                                return m('.tb-pagination.pull-right', [
                                                    m('button.tb-pagination-prev.tb-button.m-r-sm', {
                                                        onclick: ctrl.pageDown
                                                    }, [m('i.fa.fa-chevron-left')]),
                                                    m('input.tb-pagination-input.m-r-sm', {
                                                        type: "text",
                                                        style: "width: 30px;",
                                                        onkeyup: function(e) {
                                                            var page = parseInt(e.target.value, 10);
                                                            ctrl.goToPage(page);
                                                        },
                                                        value: ctrl.currentPage()
                                                    }),
                                                    m('span.tb-pagination-span', "/ " + total + " "),
                                                    m('button.tb-pagination-next.tb-button', {
                                                        onclick: ctrl.pageUp
                                                    }, [m('i.fa.fa-chevron-right')])
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
    };

    /**
     * Treebeard default options as a constructor so multiple different types of options can be established.
     * Implementations have to declare their own "filesData", "columnTitles", "resolveRows", all others are optional
     */
    var Options = function() {
        this.divID = "myGrid"; // This div must be in the html already or added as an option
        this.filesData = "small.json"; // REQUIRED: Data in Array or string url
        this.rowHeight = undefined; // user can override or get from .tb-row height
        this.paginate = false; // Whether the applet starts with pagination or not.
        this.paginateToggle = false; // Show the buttons that allow users to switch between scroll and paginate.
        this.uploads = false; // Turns dropzone on/off.
        this.multiselect = false; // turns ability to multiselect with shift or command keys
        this.naturalScrollLimit = 50; // If items to show is below this number, onscroll should not be run.
        this.columnTitles = function() { // REQUIRED: Adjust this array based on data needs.
            return [{
                title: "Title",
                width: "50%",
                sortType: "text",
                sort: true
            }, {
                title: "Author",
                width: "25%",
                sortType: "text"
            }, {
                title: "Age",
                width: "10%",
                sortType: "number"
            }, {
                title: "Actions",
                width: "15%"
            }];
        };
        this.hideColumnTitles = false;
        this.resolveRows = function(item) { // REQUIRED: How rows should be displayed based on data.
            return [{
                data: "title", // Data field name
                folderIcons: true,
                filter: true
            }];
        };
        this.hScroll  = 400; // Number which is the cut off for horizontal scrolling, can also be null;
        this.filterPlaceholder = 'Search';
        this.resizeColumns = true; // whether the table columns can be resized.
        this.hoverClass = undefined; // Css class for hovering over rows
        this.hoverClassMultiselect = 'tb-multiselect'; // Css class for hover on multiselect
        this.showFilter = true; // Gives the option to filter by showing the filter box.
        this.title = null; // Title of the grid, boolean, string OR function that returns a string.
        this.allowMove = true; // Turn moving on or off.
        this.allowArrows = false;
        this.moveClass = undefined; // Css class for which elements can be moved. Your login needs to add these to appropriate elements.
        this.sortButtonSelector = {}; // custom buttons for sort, needed because not everyone uses FontAwesome
        this.dragOptions = {}; // jQuery UI draggable options without the methods
        this.dropOptions = {}; // jQuery UI droppable options without the methods
        this.dragEvents = {}; // users can override draggable options and events
        this.dropEvents = {}; // users can override droppable options and events
        this.dragContainment = '.tb-tbody-inner';
        this.sortDepth = 0;
        this.oddEvenClass = {
            odd: 'tb-odd',
            even: 'tb-even'
        };
        this.onload = function() {
            // this = treebeard object;
        };
        this.togglecheck = function(item) {
            // this = treebeard object;
            // item = folder to toggle
            return true;
        };
        this.filterTemplate = function () {
            var tb = this;
            return m("input.pull-right.form-control[placeholder='" + tb.options.filterPlaceholder + "'][type='text']", {
                style: "width:100%;display:inline;",
                onkeyup: tb.filter,
                value: tb.filterText()
            });
        };
        this.toolbarComponent = null;
        this.headerTemplate = function () {
            var ctrl = this;
            var titleContent = functionOrString(ctrl.options.title);
            if (ctrl.options.showFilter || titleContent) {
                var filterWidth;
                var title = m('.tb-head-title.col-xs-12.col-sm-6', {}, titleContent);
                if (ctrl.options.filterFullWidth) {
                    filterWidth = '';
                } else {
                    filterWidth = ctrl.options.title ? '.col-sm-6' : '.col-sm-6.col-sm-offset-6';
                }
                var filter = m(".tb-head-filter.col-xs-12" + filterWidth, {}, [
                    (function showFilterA() {
                        if (ctrl.options.showFilter) {
                            return ctrl.options.filterTemplate.call(ctrl);
                        }
                    }())
                ]);
                if (ctrl.options.title) {
                    return m('.tb-head', [
                        title,
                        filter
                    ]);
                } else {
                    return m('.tb-head', [
                        filter
                    ]);
                }

            }
        }
        this.onfilter = function(filterText) { // Fires on keyup when filter text is changed.
            // this = treebeard object;
            // filterText = the value of the filtertext input box.
        };
        this.onfilterreset = function(filterText) { // Fires when filter text is cleared.
            // this = treebeard object;
            // filterText = the value of the filtertext input box.
        };
        this.createcheck = function(item, parent) {
            // this = treebeard object;
            // item = Item to be added.  raw item, not _item object
            // parent = parent to be added to = _item object
            return true;
        };
        this.oncreate = function(item, parent) { // When new row is added
            // this = treebeard object;
            // item = Item to be added.  = _item object
            // parent = parent to be added to = _item object
        };
        this.deletecheck = function(item) { // When user attempts to delete a row, allows for checking permissions etc.
            // this = treebeard object;
            // item = Item to be deleted.
            return true;
        };
        this.ondelete = function() { // When row is deleted successfully
            // this = treebeard object;
            // item = a shallow copy of the item deleted, not a reference to the actual item
        };
        this.addcheck = function(treebeard, item, file) { // check is a file can be added to this item
            // this = dropzone object
            // treebeard = treebeard object
            // item = item to be added to
            // file = info about the file being added
            return true;
        };
        this.onadd = function(treebeard, item, file, response) {
            // this = dropzone object;
            // item = item the file was added to
            // file = file that was added
            // response = what's returned from the server
        };
        this.onselectrow = function(row, event) {
            // this = treebeard object
            // row = item selected
            // event = mouse click event object
        };
        this.ondblclickrow = function(row, event) {
            // this = treebeard object
            // row = item selected
            // event = mouse click event object
        };
        this.onbeforemultiselect = function(event, tree) {
            // this = treebeard object
            // tree = item currently clicked on
            // event = mouse click event object
        };
        this.onmultiselect = function(event, tree) {
            // this = treebeard object
            // tree = item currently clicked on
            // event = mouse click event object
        };
        this.onmouseoverrow = function(row, event) {
            // this = treebeard object
            // row = item selected
            // event = mouse click event object
        };
        this.ontogglefolder = function(item) {
            // this = treebeard object
            // item = toggled folder item
        };
        this.dropzone = { // All dropzone options.
            url: null // When users provide single URL for all uploads
        };
        this.dropzoneEvents = {};
        this.resolveIcon = function(item) { // Here the user can interject and add their own icons, uses m()
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
        this.removeIcon = function(){
            return m('i.fa.fa-remove');
        },
        this.resolveRefreshIcon = function() {
            return m('i.icon-refresh.icon-spin');
        };
        this.resolveToggle = function(item) {
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
        this.resolvePagination = function(totalPages, currentPage) {
            // this = treebeard object
            return m("span", [
                m('span', 'Page: '),
                m('span.tb-pageCount', currentPage),
                m('span', ' / ' + totalPages)
            ]);
        };
        this.resolveUploadUrl = function(item) { // Allows the user to calculate the url of each individual row
            // this = treebeard object;
            // Item = item acted on return item.data.ursl.upload
            return "/upload";
        };
        this.resolveLazyloadUrl = function(item) {
            // this = treebeard object;
            // Item = item acted on
            return false;
        };
        this.lazyLoadError = function(item) {
            // this = treebeard object;
            // Item = item acted on
        };
        this.lazyLoadOnLoad = function(item) {
            // this = treebeard object;
            // Item = item acted on
        };
        this.ondataload = function(item) {
            // this = treebeard object;
        };
        this.ondataloaderror = function(xhr){
            // xhr with non-200 status code
        };
        this.onbeforeselectwitharrow = function(item, direction){
            // this = treebeard object;
            // Item = item where selection is going to
            // direction =  the directino of the arrow key
        };
        this.onafterselectwitharrow = function(item, direction){
            // this = treebeard object;
            // Item = item where selection is coming from
            // direction = the directino of the arrow key
        };
        this.xhrconfig = function(xhr, options){
            // xhr = xml http request
            // options = xhr options
        };
        this.scrollDebounce = 15; // milliseconds
    };

    /**
     * Starts treebard with user options
     * This may seem convoluted but is useful to encapsulate Treebeard instances.
     * @param {Object} options The options user passes in; will be expanded with defaults.
     * @returns {*}
     */
    var runTB = function _treebeardRun(options, component) {
        var defaults = new Options();
        var finalOptions = $.extend(defaults, options);
        // Weird fix for IE 9, does not harm regular load
        if (window.navigator.userAgent.indexOf('MSIE') !== -1) {
            setTimeout(function() {
                m.redraw();
            }, 1000);
        }
        if(!component){ // If not added as component into mithril view then mount it
            return m.mount(document.getElementById(finalOptions.divID), m.component(Treebeard, finalOptions));
        }
        return m.component(Treebeard, finalOptions); // Return component instead
    };


    // Expose some internal classes to the public
    runTB.Notify = Notify;

    return runTB;
}));
