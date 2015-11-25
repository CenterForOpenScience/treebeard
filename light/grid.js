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
};

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


var defaults = {
    rowHeight : 25,
    height: 500,
    columns : [
        {
            data : 'title',
            width : '60%'
        },
        {
            data: 'person',
            width: '40%'
        }
    ]
};


var Treebeard = function (data, options) {
    this.version = "0.0.1";
    this.data = data;
    this.flatData = [];
    this.visibleIndexes = [];
    this.IndexMaptoID = {};
    this.options = $.extend({}, defaults, options);
    this.states = {
        isFiltered : false,
        isSorted : false
    };
    this.init();
};

Treebeard.prototype.init = function () {
    var tb = this;
    console.log(this.data);
    tb.treeData = tb.buildTree(this.data);
    tb.flatten(tb.treeData);
    tb.totalItems = Math.ceil(tb.options.height / (tb.options.rowHeight)) + 3; // +1 for bottom border +2 for additional 2

    var totalHeight = tb.data.length * (tb.options.rowHeight);
    $(tb.options.container)
        .append('<div class="tb-inner" style="height:' + totalHeight + 'px"><div class="tb-row-container"></div></div>');

    tb.range = {begin : 0, end: tb.totalItems};
    tb.marginTop = 0;
    tb.view();

    $(tb.options.container)
        .scroll(function(){
            var $this = $(this);
            var scrollTop = $this.scrollTop();
            var lastHidden = Math.floor(scrollTop / tb.options.rowHeight);
            tb.range = { begin: lastHidden, end : lastHidden + tb.totalItems};
            tb.marginTop = lastHidden * tb.options.rowHeight;
            tb.view();
        });
    $(tb.options.container).find('.tb-toggle-icon')
        .click(function(event){
            var id = parseInt($(this).parents('.tb-row').attr('data-id'));
            tb.toggleFolder(id);
        });

};

Treebeard.prototype.view = function() {
    var tb = this;
    var i;
    $(tb.options.container + '> .tb-inner > .tb-row-container').html('');
    for (i = tb.range.begin; i < tb.range.end; i++) {
        var item = tb.returnVisibleItem(i);
        if(item){
            tb.buildRow(tb.returnVisibleItem(i));
        } else {
            break;
        }
    }
};

Treebeard.prototype.buildRow = function(row) {
    var tb = this;
    var toggleIcon;
    var innerTemplate = [];
    var data = row.item.data; // only the data pertinent to the item information without tb specific helpers
    tb.options.columns.map(function(col, index){
        if(index === 0 && data.children.length > 0) {
            toggleIcon = '<i class="fa fa-plus tb-toggle-icon"></i>';
        } else {
            toggleIcon = '<i class="tb-toggle-icon">&nbsp;</i>';
        }
        innerTemplate.push('<div class="tb-col" style="width:' + col.width + '">'  + toggleIcon + data[col.data] + '</div>');
    });
    $(tb.options.container + '> .tb-inner > .tb-row-container')
        .css('top', tb.marginTop + 'px')
        .append('<div class="tb-row" data-id="' + row.item.id + '" style="height:' + tb.options.rowHeight + 'px">' + innerTemplate.join('') + '</div>');
};

Treebeard.prototype.flatten = function _flatten(value, visibleTop) {
    var tb = this;
    (function doFlatten(data, parentIsOpen) {
        $.each(data, function(index, item) {
            tb.IndexMaptoID[item.id] = item;
            tb.flatData.push({
                show: parentIsOpen,
                item : item
            });
            if (item.children && item.children.length > 0) {
                doFlatten(item.children, parentIsOpen && item.open);
            }
        });
    })(value.children, true);
    tb.refreshVisible();
    return value;
};

Treebeard.prototype.refreshVisible = function _refreshVisible (){
    var tb = this;
    var len = tb.flatData.length;
    var total = 0;
    var i;
    var item;
    tb.visibleIndexes = [];
    for (i = 0; i < len; i++) {
        item = tb.IndexMaptoID[tb.flatData[i].id];
        if (tb.filterOn) {
            if (tb.rowFilterResult(item)) {
                total++;
                tb.visibleIndexes.push(i);
            }
        } else {
            if (tb.flatData[i].show) {
                tb.visibleIndexes.push(i);
                total = total + 1;
            }
        }
    }
    return total;
};

 // Returns the item from visible index
Treebeard.prototype.returnVisibleItem = function (visibleIndex) {
    var tb = this;
    return tb.flatData[tb.visibleIndexes[visibleIndex]];
};

Treebeard.prototype.addData = function (id, data) {
    var tb = this;
    var item = tb.IndexMaptoID[id];


};

Treebeard.prototype.buildTree = function _buildTree (data, parent) {
    var tb = this;
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
            child = tb.buildTree(children[i], tree);
            tree.add(child);
        }
    }
    return tree;
};

Treebeard.prototype.getFlatIndexFromID = function (id) {
    var tb = this;
    var len = tb.flatData.length,
        i, o;
    for (i = 0; i < len; i++) {
        o = tb.flatData[i].item;
        if (o.id === id) {
            return i;
        }
    }
    return undefined;
};

Treebeard.prototype.toggleFolder = function _toggleFolder(id) {
    var tb = this;
    var tree = tb.IndexMaptoID[id];
    var index = tb.getFlatIndexFromID(id);
    var i;
    var o;
    var level = tree.depth;
    var skip;
    var skipLevel = tree.depth;
    for (i = index + 1; i < tb.flatData.length; i++) {
        o = tb.flatData[i];
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
            if (!tree.open) {
                skipLevel = o.depth;
                skip = true;
            }
        }
    }
    tree.open = !tree.open;
    tb.refreshVisible();
    tb.view();
};