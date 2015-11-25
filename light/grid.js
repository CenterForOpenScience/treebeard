var defaults = {
    rowHeight : 25,
    height: 500,
    columns : [
        {
            data : 'title',
            width : '60%'
        },
        {
            data: 'author',
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
    tb.flatten(this.data);
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
};

Treebeard.prototype.view = function() {
    var tb = this;
    var i;
    $(tb.options.container + '> .tb-inner > .tb-row-container').html('');
    for (i = tb.range.begin; i < tb.range.end; i++) {
        tb.buildRow(tb.returnVisibleItem(i));
    }
};

Treebeard.prototype.buildRow = function(row) {
    var tb = this;
    var toggleIcon;
    var innerTemplate = [];
    var data = row.item; // only the data pertinent to the item information without tb specific helpers
    tb.options.columns.map(function(col, index){
        //if(index === 0 && row.children.length > 0) {
        //    toggleIcon = '<i class="fa fa-plus tb-toggle-icon"></i>';
        //} else {
        //    toggleIcon = '<i class="tb-toggle-icon">&nbsp;</i>';
        //}
        innerTemplate.push('<div class="tb-col" style="width:' + col.width + '">'  + data[col.data] + '</div>');
    });
    $(tb.options.container + '> .tb-inner > .tb-row-container')
        .css('top', tb.marginTop + 'px')
        .append('<div class="tb-row" style="height:' + tb.options.rowHeight + 'px">' + innerTemplate.join('') + '</div>');
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
    })(value, true);
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
}
