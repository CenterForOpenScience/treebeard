var mockData = '[{"person": "Madihah Negassi","title": "Iaculis  Neque  Vehicula    Sit  ","age": 17,"children": [],"kind": "folder"},{"person": "Alacoque Bisson","title": "Neque  Etiam  Dapibus  Vel  Undefined  ","age": 7, "children": [], "kind": "item"},{"person": "Tomi Saariaho", "title": "Et  Pharetra  Eu  Lorem  Elit  ", "age": 46, "children": [], "kind": "item"},{"person": "Hamid Idris", "title": "Nam  Ac  Fermentum  Sagittis  Velit  ", "age": 54, "children": [], "kind": "item"}]';

function reload (callback) {
    $.ajax({
        url: "small.json"
    })
    .done(function( data ) {
        var parent = tb.find(0);
        tb.resetCounter();
        tb.updateFolder(data, parent);
        if(callback) { callback() };
    });
}

QUnit.module( "Load Tests");

test('Treebeard is loaded', function(assert) {
    assert.ok(typeof tb === 'object', 'Treebeard is loaded as an object');
});

test('Treebeard has options', function(assert) {
    assert.ok(typeof tb.options === 'object', 'Treebeard has default options');
});

QUnit.module( "ITEM API Tests")
test('ITEM Constructor ', function (assert) {
    var item = tb.createItem({'kind': 'folder', 'name': 'Item API test folder'}, 1);
    assert.equal(item.kind, 'folder', 'Item constructor built the correct kind information and Added to parent');
    tb.deleteNode(item.parentID, item.id);
});

test('ITEM Move ', function (assert) {
    var item = tb.createItem({ 'kind': 'folder', 'name': 'Item API test folder'}, 1);
    var childItem =  tb.createItem({'kind': 'item', 'name': 'Item API test child'}, item.id);
    childItem.move(1);
    var topLevel = tb.find(1);
    var movedItem = topLevel.child(childItem.id);
    assert.equal(movedItem.data.name,'Item API test child', 'Moved item moved to the correct place');
    tb.deleteNode(item.parentID, item.id);
    tb.deleteNode(movedItem.parentID, movedItem.id);
});

test('ITEM Find ', function (assert) {
    var item = tb.createItem({'kind': 'folder', 'name': 'Item API test folder'}, 1);
    var foundItem = tb.find(item.id);
    assert.equal(foundItem.data.name, 'Item API test folder', 'Finding item by id works');
    tb.deleteNode(item.parentID, item.id);
});

test('ITEM find child by ID', function (assert) {
    var item = tb.createItem({'kind': 'folder', 'name': 'Item API test folder'}, 1);
    var childItem =  tb.createItem({'kind': 'item', 'name': 'Item API test child'}, item.id);
    var foundItem = item.child(childItem.id);
    assert.equal(foundItem.data.name, 'Item API test child', 'Item child found with child()');
    tb.deleteNode(item.parentID, item.id);
});

test('ITEM Prev, next, parent find ', function (assert) {
    var item = tb.createItem({'kind': 'folder', 'name': 'Item API test folder'}, 1);
    var child1 =  tb.createItem({'kind': 'item', 'name': 'Child1'}, item.id),
        child2 =  tb.createItem({'kind': 'item', 'name': 'Child2'}, item.id),
        next = child1.prev(),
        prev = child2.next(),
        parent = child1.parent();
    assert.equal(next.data.name, 'Child2', 'Finds next() item correctly.');
    assert.equal(prev.data.name, 'Child1', 'Finds prev() item correctly.');
    assert.equal(parent.data.name, 'Item API test folder', 'Finds parent() item correctly.');
    tb.deleteNode(item.parentID, item.id);

});

test('ITEM is ancestor', function (assert) {
    var item = tb.createItem({'kind': 'folder', 'name': 'Item API test folder'}, 1),
        child =  tb.createItem({'kind': 'item', 'name': 'Child1'}, item.id),
        isAncestor = item.isAncestor(child);
    assert.ok(isAncestor, 'Check for isAncestor returns correctly')
    tb.deleteNode(item.parentID, item.id);

});

test('ITEM is descendant', function (assert) {
    var item = tb.createItem({'kind': 'folder', 'name': 'Item API test folder'}, 1),
        child =  tb.createItem({'kind': 'item', 'name': 'Child1'}, item.id),
        idDescendant = child.isDescendant(item);
    assert.ok(idDescendant, 'Check for isDescendant returns correctly');
    tb.deleteNode(item.parentID, item.id);
});

QUnit.module( "Treebeard API tests" )

test('createItem()', function (assert) {
    var oldflatLength = tb.flatData.length;
    var expected = 'Test',
        item = tb.createItem({'kind': 'folder', 'name': expected}, 1);
    var newflatLength = tb.flatData.length;
    assert.equal(item.data.name, expected, 'Looked for : "' + expected + '" found: "' + item.data.name + '"');
    assert.equal(oldflatLength, newflatLength-1, 'Flatdata length is updated.');
    tb.deleteNode(item.parentID, item.id);

});

test('find()', function (assert) {
    var expected = 'Testing find',
        item = tb.createItem({'kind': 'folder', 'name': expected}, 1),
        foundItem = tb.find(item.id);
    assert.equal(foundItem.data.name, expected, 'Looked for : "' + expected + '" found: "' + foundItem.data.name + '"');
    tb.deleteNode(item.parentID, item.id);

});

test('deleteNode()', function (assert) {
    var item = tb.createItem({'kind': 'folder', 'name': 'Delete Test Parent'}, 1),
        parentID = item.id,
        childItem =  tb.createItem({'kind': 'item', 'name': 'Delete Test Child'}, parentID);
    tb.deleteNode(parentID, childItem.id);
    assert.equal(item.children.length, 0, 'Child item deleted.');
    tb.deleteNode(item.parentID, item.id);

});

test('canMove()', function (assert) {
    var item = tb.createItem({'kind': 'folder', 'name': 'Move Test Parent'}, 1),
        parentID = item.id,
        childItem =  tb.createItem({'kind': 'item', 'name': 'Move Test Child'}, parentID),
        outcome1 = tb.canMove(childItem, item),
        item2 =  tb.createItem({'kind': 'item', 'name': 'Move Sibling 2'}, 1),
        outcome2 = tb.canMove(item, item2);
    assert.ok(!outcome1, 'Can\'t move parent folder to child folder');
    assert.ok(outcome2, 'Can move sibling folder into sibling');
    tb.deleteNode(item.parentID, item.id);
    tb.deleteNode(item2.parentID, item2.id);
});

// QUnit.module
test('return index of item in the flatData, returnIndex()', function (assert) {
    var existingIndex = tb.returnIndex(2);
    var existingOutsideView = tb.returnIndex(104);
    var nonexistingIndex =  tb.returnIndex(200);
    assert.equal(existingIndex, 1, 'An existing item within view is returned correctly.');
    assert.equal(existingOutsideView, 103, 'An existing item outside view is returned correctly.');
    assert.equal(nonexistingIndex, undefined, 'A non existing item returned correctly as undefined.');
});

test('return index of item in the showRange, returnRangeIndex()', function (assert) {
    var existingIndex = tb.returnRangeIndex(104);
    var existingOutsideView = tb.returnRangeIndex(3);
    var nonexistingIndex =  tb.returnRangeIndex(200);
    assert.equal(existingIndex, 2, 'An existing item within view is returned correctly.');
    assert.equal(existingOutsideView, undefined, 'An existing item outside view is returned correctly as undefined.');
    assert.equal(nonexistingIndex, undefined, 'A non existing item returned correctly as undefined.');
});



// _rowfilterresult
test('checks if rowfilterresult correctly shows whether row includes term', function (assert) {
    var item = tb.createItem({'kind': 'folder', name: 'rowfilterresult', 'title': 'UPPERCASE, lowercase, MIxeD, numb3r', person : 'Caner Uguz'}, 1);
    // uppercase match should be found
    tb.filterText('UPPERCASE');
    var upper = tb.rowFilterResult(item);
    assert.ok(upper, 'Uppercase match is found.')
    // Lowercase match should be found
    tb.filterText('lowercase');
    var lower = tb.rowFilterResult(item);
    assert.ok(lower, 'Lowercase match is found.')
    // Mixed match should be found
    tb.filterText('MIxeD');
    var mixed = tb.rowFilterResult(item);
    assert.ok(mixed, 'Mixed case match is found.')
    // number match should be found
    tb.filterText('numb3r');
    var number = tb.rowFilterResult(item);
    assert.ok(number, 'Number match is found.')
    // Filter text that does not exist should not be found
    tb.filterText('something');
    var something = tb.rowFilterResult(item);
    assert.ok(!something, 'Filter text not in item is not found as expected.')
    tb.filterText('');

    tb.deleteNode(item.parentID, item.id);
});

test('checks if filter event runs and clears', function (assert) {
    var event = jQuery.Event( "keyup" );
    event.currentTarget = $('.tb-head-filter input').get(0);

    $('.tb-head-filter input').trigger('focus').val('vehicula').trigger(event);
    var visible = $('.tb-row:contains("Vehicula")').length;
    assert.equal(visible, 4, "Filtering correctly shows filtered items.")

    $('.tb-head-filter input').trigger('focus').val('').trigger(event);
    var cleared = $('.tb-row:contains("Vehicula")').length;
    assert.equal(cleared, 1, "Clearing filter restores list");
});

test('checks update folder ', function (assert) {
    var item = tb.createItem({'kind': 'folder', name: 'Parent for update folder', 'title': 'title', person : 'Caner Uguz'}, 0);
    var data = {'kind': 'folder', name: 'child for update folder', 'title': 'title', person : 'Caner Uguz'};
    tb.updateFolder([data], item);
    assert.equal(item.children.length, 1, 'Parent folder item added with update folder');
    tb.deleteNode(item.parentID, item.id);
});

test('checks folder Toggle actually toggles view and data ', function (assert) {
    tb.toggleFolder(0, null);
    var openCount = $('.tb-row').length;
    console.log("Opencount", openCount);
    assert.equal(openCount, 14, 'The view refreshes to show 16 open items. ');
    assert.equal(tb.showRange.length, 14, 'The showRange data refreshes to show 16 open items. ');
    var item = tb.find(1);
    assert.ok(item.open, 'The item open property accurately shows true');

    tb.toggleFolder(0, null);
    var closedCount = $('.tb-row').length;
    assert.equal(closedCount, 4, 'The view refreshes to show 4 open items. ');
    assert.equal(tb.showRange.length, 4, 'The showRange data refreshes to show 4 open items. ');
    assert.ok(!item.open, 'The item open property accurately shows false after closing');
});


test('checks folder Toggle runs "lazyload" and "ontoggle" callbacks ', function (assert) {
    var lazyload = sinon.spy();
    var ontoggle = sinon.spy();
    tb.options.resolveLazyloadUrl = lazyload;
    tb.options.ontogglefolder = ontoggle;
    tb.toggleFolder(0, null);
    assert.equal(lazyload.callCount, 1, "Lazyload callback called once .");
    assert.equal(ontoggle.callCount, 1, "Ontoggle callback called once .");

    tb.toggleFolder(0, null);
});

test('checks calculateHeight works', function (assert) {
    // pagination off, fodler  closed
    tb.options.paginate = false;
    var height1 = tb.calculateHeight();
    assert.equal(height1, 140, "Pagination OFF, folder CLOSED calculate height accurate. ")
    // pagination on, folder closed
    tb.options.paginate = true;
    var height2 = tb.calculateHeight();
    assert.equal(height2, 490, "Pagination ON, folder CLOSED calculate height accurate. ")

    // pagination on, folder open
    tb.toggleFolder(0, null);
    tb.redraw();
    var height3 = tb.calculateHeight();
    assert.equal(height3, 490, "Pagination ON, folder OPEN calculate height accurate. ")
    // pagination off, folder open
    tb.options.paginate = false;
    tb.redraw();
    var height4 = tb.calculateHeight();
    assert.equal(height4, 560, "Pagination OFF, folder OPEN calculate height accurate. ")

    // reset
    tb.toggleFolder(0, null);
});

test('checks calculateVisible works', function (assert) {
    // Load Test
    var total1 = tb.calculateVisible();
    assert.equal(total1, 4, "Initial calculate visible correctly counts 4 items")

    // Toggle Test
    tb.toggleFolder(0, null);
    var total2 = tb.calculateVisible();
    assert.equal(total2, 16, "Toggled folder calculate visible correctly counts 16 items")
    tb.toggleFolder(0, null);   // clear toggle

    // Filter Test
    var event = jQuery.Event( "keyup" );
    event.currentTarget = $('.tb-head-filter input').get(0);

    $('.tb-head-filter input').trigger('focus').val('vehicula').trigger(event);
    var visible = $('.tb-row:contains("Vehicula")').length;
    var total3 = tb.calculateVisible();
    assert.equal(total3, visible, "Filter correctly calculates visible")
    // Clear filter
    $('.tb-head-filter input').trigger('focus').val('').trigger(event);

});

QUnit.module('View change tests requiring reload', {
    setup : function () {
        //reload();
    },
    teardown : function ( ){
        //reload();
    }
})

test('checks if toggle sorting works', function (assert) {
    var eventAsc = jQuery.Event( "click" );
    eventAsc.currentTarget = $('.fa-sort-asc').get(0);
    $('.fa-sort-asc').trigger(eventAsc);
    var firstItem = $('.tb-row').first().attr('data-id');
    assert.equal(firstItem, "104", " Ascending order changed view correctly. ")

    var eventDesc = jQuery.Event( "click" );
    eventDesc.currentTarget = $('.fa-sort-desc').get(0);
    $('.fa-sort-desc').trigger(eventDesc);
    var firstItem2 = $('.tb-row').first().attr('data-id');
    assert.equal(firstItem2, "103", " Descending order changed view correctly. ")
});


QUnit.module('Async tests', {
    setup : function () {
        this.server = sinon.fakeServer.create();
    },
    teardown : function ( ){
        this.server.restore();
    }
})

asyncTest('checks ', function (assert) {
    this.server.respondWith("GET", "small.json", [200, { "Content-Type": "application/json" }, mockData]);
    tb.resetCounter();
    var _treebeard = Treebeard({filesData : 'small.json', redrawComplete : function(){ start(); } });
    var TB = _treebeard.tbController;

    //tb.options.redrawComplete = start;
    console.log(TB.options);
    //reload();
    this.server.respond();
    var item = $('.tb-row').first().attr('data-id');
    assert.equal(item, "1", "Reloaded correctly ")
    //tb.options.redrawComplete = null;
});

//test('checks ', function (assert) {
//    var item = tb.createItem({'kind': 'folder', name: 'rowfilterresult', 'title': 'title', person : 'Caner Uguz'}, 1);
//
//    tb.deleteNode(item.parentID, item.id);
//});


