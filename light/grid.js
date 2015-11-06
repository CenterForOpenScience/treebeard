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
    this.options = $.extend({}, defaults, options);
    this.states = {
        isFiltered : false,
        isSorted : false
    };
    this.init();
};

Treebeard.prototype.init = function () {
    var tb = this;
    console.log(this.options);
    console.log(this.data);
    tb.totalItems = Math.ceil(tb.options.height / (tb.options.rowHeight)) + 2; // +1 for bottom border +2 for additional 2

    var totalHeight = tb.data.length * (tb.options.rowHeight);
    $(tb.options.container).append('<div class="tb-inner" style="height:' + totalHeight + 'px"></div>');

    tb.range = {begin : 0, end: tb.totalItems};
    tb.marginTop = 0;
    tb.view();

    $(tb.options.container).scroll(function(){
        var $this = $(this);
        var scrollTop = $this.scrollTop();
        console.log(scrollTop);
        var lastHidden = Math.floor(scrollTop / tb.options.rowHeight);
        tb.range = { begin: lastHidden, end : lastHidden + tb.totalItems};
        tb.marginTop = lastHidden * tb.options.rowHeight;
        tb.view();
    });
};

Treebeard.prototype.view = function() {
    var tb = this;
    var i;

    for (i = tb.range.begin; i < tb.range.end; i++) {
        console.log(tb.range.begin, tb.range.end, tb.data[i].title);
        tb.buildRow(tb.data[i]);
    }
};

Treebeard.prototype.buildRow = function(row) {
    var tb = this;
    var toggleIcon;
    var innerTemplate = [];
    tb.options.columns.map(function(col, index){
        //if(index === 0 && row.children.length > 0) {
        //    toggleIcon = '<i class="fa fa-plus tb-toggle-icon"></i>';
        //} else {
        //    toggleIcon = '<i class="tb-toggle-icon">&nbsp;</i>';
        //}
        innerTemplate.push('<div class="tb-col" style="width:' + col.width + '">'  + row[col.data] + '</div>');
    });
    $(tb.options.container + '> .tb-inner')
        .css('margin-top', tb.marginTop + 'px')
        .append('<div class="tb-row" style="height:' + tb.options.rowHeight + 'px">' + innerTemplate.join('') + '</div>');
};

