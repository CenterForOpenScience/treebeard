var mockData = {
    'short': '[{"person": "Madihah Negassi","title": "Iaculis  Neque  Vehicula    Sit  ","age": 17,"children": [],"kind": "folder"},{"person": "Alacoque Bisson","title": "Neque  Etiam  Dapibus  Vel  Undefined  ","age": 7, "children": [], "kind": "item"},{"person": "Tomi Saariaho", "title": "Et  Pharetra  Eu  Lorem  Elit  ", "age": 46, "children": [], "kind": "item"},{"person": "Hamid Idris", "title": "Nam  Ac  Fermentum  Sagittis  Velit  ", "age": 54, "children": [], "kind": "item"}]',
    'long': '[{"id":1,"person":"MadihahNegassi","desc":"Erossitacultricessedfacilisisipsumsedleoblanditnuncaliquet.","title":"IaculisNequeVehiculaSit","age":17,"skills":"css","open":true,"date":"2014-10-28T16:17:19.710Z","icon":"fa-file-code-o","children":[{"id":2,"person":"ÁkosSándor","desc":"Antenibhaliquamiaculisnonarcusitgravidadolortellusnullaelit.","title":"EuElitPorttitorOdioNon","age":42,"skills":"js","open":false,"date":"2014-10-28T16:17:19.710Z","icon":"fa-file-sound-o","children":[],"kind":"folder"},{"id":92,"person":"KennethCraig","desc":"Hendreritidloremameterosodioenimidblanditsedsitsemposuere.","title":"VolutpatLacusNequeQuis","age":3,"skills":"html","open":true,"date":"2014-10-28T16:17:19.712Z","icon":"fa-file-picture-o","children":[],"kind":"item"},{"id":93,"person":"BeataLund","desc":"Scelerisqueetiamsuspendissesitsitduisedelementum.","title":"EuAcConsectetur","age":10,"skills":"html","open":true,"date":"2014-10-28T16:17:19.712Z","icon":"fa-file-movie-o","children":[],"kind":"item"},{"id":94,"person":"JónBergsveinsson","desc":"Lobortismetuseuismodjustoquisfeugiatauctorsedviverraposuere.","title":"UtConsecteturTemporEuismodEget","age":47,"skills":"js","open":true,"date":"2014-10-28T16:17:19.712Z","icon":"fa-file-powerpoint-o","children":[],"kind":"item"},{"id":95,"person":"UrszulaWoźniak","desc":"Veltinciduntsemurnaidsitlorempharetrasemsemligulaaliquam.","title":"QuisSagittisOrnareNibhEu","age":15,"skills":"js","open":false,"date":"2014-10-28T16:17:19.712Z","icon":"fa-file-audio-o","children":[],"kind":"item"},{"id":96,"person":"RankoĆosić","desc":"tortorpulvinarenimplacerategetnuncnonidloremturpisut.","title":"NequeVehiculaTempor","age":15,"skills":"css","open":false,"date":"2014-10-28T16:17:19.712Z","children":[],"kind":"item"},{"id":97,"person":"DrewReid","desc":"Rutrumeunecmalesuadavelitfacilisisdiamsedpellentesquesed.","title":"FermentumTempusVitaeMauris","age":52,"skills":"python","open":true,"date":"2014-10-28T16:17:19.712Z","icon":"fa-file-movie-o","children":[],"kind":"item"},{"id":98,"person":"JosíasFrías","desc":"Velconsequateleifenderategetmimaurisprimisatenimtortorlobortiscraset.","title":"EuVestibulumMagnaBibendum","age":41,"skills":"js","open":false,"date":"2014-10-28T16:17:19.712Z","icon":"fa-file-word-o","children":[],"kind":"item"},{"id":99,"person":"JaroslavaBalounová","desc":"erataccumsanjustoleoegetsapiencursussapiensitloremidnislpellentesque.","title":"EtEgetUltricesSitNeque","age":34,"skills":"python","open":true,"date":"2014-10-28T16:17:19.712Z","icon":"fa-file-photo-o","children":[],"kind":"item"},{"id":100,"person":"NicholasCooper","desc":"Pulvinarquamidfringillamisedsapienelitconvallislorem.","title":"NullamEtVelitIdUltrices","age":17,"open":false,"date":"2014-10-28T16:17:19.712Z","icon":"fa-file-sound-o","children":[],"kind":"item"},{"id":101,"person":"RenanCorreia","desc":"arcuconvallisaliquamnibhelementumrutrumvelnondapibusdonecvestibulum.","title":"ElitPlaceratTinciduntLoremCondimentum","age":14,"skills":"python","open":true,"date":"2014-10-28T16:17:19.712Z","icon":"fa-file-video-o","children":[],"kind":"item"},{"id":102,"person":"MarcellaLi","desc":"ullamcorpersuscipitactinciduntodioleolectuspellentesquevitaevenenatisdolor.","title":"LoremUltricesNuncSed","age":14,"skills":"js","open":true,"date":"2014-10-28T16:17:19.712Z","icon":"fa-file-text","children":[],"kind":"item"}],"kind":"folder"},{"id":103,"person":"AlacoqueBisson","desc":"Magnadonecnibhphasellusnullaegestasliberoegetvitaealiquamturpisametmassaauctor.","title":"NequeEtiamDapibusVelUndefined","age":7,"skills":"css","open":true,"date":"2014-10-28T16:17:19.712Z","icon":"fa-file-code-o","children":[],"kind":"item"},{"id":104,"person":"TomiSaariaho","desc":"Laciniamassarhoncusegestasrisusloremsitrutrumnuncsollicitudinpellentesque.","title":"EtPharetraEuLoremElit","age":46,"skills":"html","open":true,"date":"2014-10-28T16:17:19.712Z","icon":"fa-file-o","children":[],"kind":"item"},{"id":105,"person":"HamidIdris","desc":"Consequategetatnibharcupellentesquecongueorcitortorsitenim.","title":"NamAcFermentumSagittisVelit","age":54,"skills":"python","open":false,"date":"2014-10-28T16:17:19.712Z","icon":"fa-file-picture-o","children":[],"kind":"item"}]'
};

function reload (type, options) {
    stop();
    this.server.respondWith("GET", "small.json", [200, { "Content-Type": "application/json" }, mockData[type]]);
    var finalOptions = $.extend({}, {filesData : 'small.json', redrawComplete : function () {
        console.log(this.initialized);
        if (!this.initialized) { start();} }
    }, options);
    var _treebeard = Treebeard(finalOptions);
    var TB = _treebeard.tbController;
    this.server.respond();
    return TB;
}

QUnit.module("Load Tests", {
    setup : function () {
        this.server = sinon.fakeServer.create();
    },
    teardown : function ( ){
        this.server.restore();
    }
});

test('Treebeard is loaded with options', function(assert) {
    var tb = reload.call(this, 'long');
    assert.ok(typeof tb === 'object', 'Treebeard is loaded as an object');
    assert.ok(typeof tb.options === 'object', 'Treebeard has default options');
});

QUnit.module("ITEM API Tests", {
    setup : function () {
        this.server = sinon.fakeServer.create();
    },
    teardown : function () {
        this.server.restore();
    }
});

test('ITEM Constructor ', function (assert) {
    var tb = reload.call(this, 'short');
    var item = tb.createItem({'kind': 'folder', 'name': 'Item API test folder'}, 1);
    assert.equal(item.kind, 'folder', 'Item constructor built the correct kind information and Added to parent');
    tb.deleteNode(item.parentID, item.id);
});

test('ITEM Move ', function (assert) {
    var tb = reload.call(this, 'short');
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
    var tb = reload.call(this, 'short');
    var item = tb.createItem({'kind': 'folder', 'name': 'Item API test folder'}, 1);
    var foundItem = tb.find(item.id);
    console.log(item, foundItem);
    assert.equal(foundItem.data.name, 'Item API test folder', 'Finding item by id works');
    tb.deleteNode(item.parentID, item.id);
});

test('ITEM find child by ID', function (assert) {
    var tb = reload.call(this, 'short');
    var item = tb.createItem({'kind': 'folder', 'name': 'Item API test folder'}, 1);
    var childItem =  tb.createItem({'kind': 'item', 'name': 'Item API test child'}, item.id);
    var foundItem = item.child(childItem.id);
    assert.equal(foundItem.data.name, 'Item API test child', 'Item child found with child()');
    tb.deleteNode(item.parentID, item.id);
});

test('ITEM Prev, next, parent find ', function (assert) {
    var tb = reload.call(this, 'short');

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
    var tb = reload.call(this, 'short');

    var item = tb.createItem({'kind': 'folder', 'name': 'Item API test folder'}, 1),
        child =  tb.createItem({'kind': 'item', 'name': 'Child1'}, item.id),
        isAncestor = item.isAncestor(child);
    assert.ok(isAncestor, 'Check for isAncestor returns correctly')
    tb.deleteNode(item.parentID, item.id);

});

test('ITEM is descendant', function (assert) {
    var tb = reload.call(this, 'short');

    var item = tb.createItem({'kind': 'folder', 'name': 'Item API test folder'}, 1),
        child =  tb.createItem({'kind': 'item', 'name': 'Child1'}, item.id),
        idDescendant = child.isDescendant(item);
    assert.ok(idDescendant, 'Check for isDescendant returns correctly');
    tb.deleteNode(item.parentID, item.id);
});

QUnit.module( "Treebeard API tests", {
    setup : function () {
        this.server = sinon.fakeServer.create();
    },
    teardown : function ( ){
        this.server.restore();
    }
});

test('createItem()', function (assert) {
    var tb = reload.call(this, 'short');

    var oldflatLength = tb.flatData.length;
    var expected = 'Test',
        item = tb.createItem({'kind': 'folder', 'name': expected}, 1);
    var newflatLength = tb.flatData.length;
    assert.equal(item.data.name, expected, 'Looked for : "' + expected + '" found: "' + item.data.name + '"');
    assert.equal(oldflatLength, newflatLength-1, 'Flatdata length is updated.');
});

test('find()', function (assert) {
    var tb = reload.call(this, 'short');

    var expected = 'Testing find',
        item = tb.createItem({'kind': 'folder', 'name': expected}, 1),
        foundItem = tb.find(item.id);
    assert.equal(foundItem.data.name, expected, 'Looked for : "' + expected + '" found: "' + foundItem.data.name + '"');
});

test('deleteNode()', function (assert) {
    var tb = reload.call(this, 'short');

    var item = tb.createItem({'kind': 'folder', 'name': 'Delete Test Parent'}, 1),
        parentID = item.id,
        childItem =  tb.createItem({'kind': 'item', 'name': 'Delete Test Child'}, parentID);
    tb.deleteNode(parentID, childItem.id);
    assert.equal(item.children.length, 0, 'Child item deleted.');
});

test('canMove()', function (assert) {
    var tb = reload.call(this, 'short');

    var item = tb.createItem({'kind': 'folder', 'name': 'Move Test Parent'}, 1),
        parentID = item.id,
        childItem =  tb.createItem({'kind': 'item', 'name': 'Move Test Child'}, parentID),
        outcome1 = tb.canMove(childItem, item),
        item2 =  tb.createItem({'kind': 'item', 'name': 'Move Sibling 2'}, 1),
        outcome2 = tb.canMove(item, item2);
    assert.ok(!outcome1, 'Can\'t move parent folder to child folder');
    assert.ok(outcome2, 'Can move sibling folder into sibling');
});

// QUnit.module
test('return index of item in the flatData, returnIndex()', function (assert) {
    var tb = reload.call(this, 'long');

    var existingIndex = tb.returnIndex(2);
    var existingOutsideView = tb.returnIndex(14);
    var nonexistingIndex =  tb.returnIndex(200);
    assert.equal(existingIndex, 1, 'An existing item within view is returned correctly.');
    assert.equal(existingOutsideView, 13, 'An existing item outside view is returned correctly.');
    assert.equal(nonexistingIndex, undefined, 'A non existing item returned correctly as undefined.');
});

test('return index of item in the showRange, returnRangeIndex()', function (assert) {
    var tb = reload.call(this, 'long');

    var existingIndex = tb.returnRangeIndex(15);
    var existingOutsideView = tb.returnRangeIndex(3);
    var nonexistingIndex =  tb.returnRangeIndex(200);
    assert.equal(existingIndex, 2, 'An existing item within view is returned correctly.');
    assert.equal(existingOutsideView, undefined, 'An existing item outside view is returned correctly as undefined.');
    assert.equal(nonexistingIndex, undefined, 'A non existing item returned correctly as undefined.');
});


// _rowfilterresult
test('checks if rowfilterresult correctly shows whether row includes term', function (assert) {
    var tb = reload.call(this, 'short');

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
});

test('checks if filter event runs and clears', function (assert) {
    var tb = reload.call(this, 'long');

    var event = jQuery.Event( "keyup" );
    event.currentTarget = $('.tb-head-filter input').get(0);

    $('.tb-head-filter input').trigger('focus').val('vehicula').trigger(event);
    var visible = $('.tb-row:contains("Vehicula")').length;
    assert.equal(visible, 2, "Filtering correctly shows filtered items.")

    $('.tb-head-filter input').trigger('focus').val('').trigger(event);
    var cleared = $('.tb-row:contains("Vehicula")').length;
    assert.equal(cleared, 1, "Clearing filter restores list");
});

test('checks update folder ', function (assert) {
    var tb = reload.call(this, 'short');

    var item = tb.createItem({'kind': 'folder', name: 'Parent for update folder', 'title': 'title', person : 'Caner Uguz'}, 0);
    var data = {'kind': 'folder', name: 'child for update folder', 'title': 'title', person : 'Caner Uguz'};
    tb.updateFolder([data], item);
    assert.equal(item.children.length, 1, 'Parent folder item added with update folder');
});

test('checks folder Toggle actually toggles view and data ', function (assert) {
    var tb = reload.call(this, 'long');

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

test('checks if toggle sorting works', function (assert) {
    var tb = reload.call(this, 'long');

    var eventAsc = jQuery.Event( "click" );
    eventAsc.currentTarget = $('.fa-sort-asc').get(0);
    $('.fa-sort-asc').trigger(eventAsc);
    var firstItem = $('.tb-row').first().attr('data-id');
    assert.equal(firstItem, "15", " Ascending order changed view correctly. ")

    var eventDesc = jQuery.Event( "click" );
    eventDesc.currentTarget = $('.fa-sort-desc').get(0);
    $('.fa-sort-desc').trigger(eventDesc);
    var firstItem2 = $('.tb-row').first().attr('data-id');
    assert.equal(firstItem2, "14", " Descending order changed view correctly. ")
});

test('checks folder Toggle runs "lazyload" and "ontoggle" callbacks ', function (assert) {
    var tb = reload.call(this, 'long');

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
    var tb = reload.call(this, 'long');

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
    var tb = reload.call(this, 'long');

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

test('checks refreshRange works', function (assert) {
    var tb = reload.call(this, 'long');

    tb.refreshRange(1); // push the view to start from index 1
    var firstItem1 = $('.tb-row').first().attr('data-id');
    assert.equal(firstItem1, "14", "Refreshing range to begin from index 1 works. ")

    tb.refreshRange(); // check if default refreshes to 0
    var firstItem2 = $('.tb-row').first().attr('data-id');
    assert.equal(firstItem2, "1", "Refreshing range when no arguments passed correctly refreshes from index 0. ")

    tb.refreshRange(333); // check what happens when refresh range is an index that doesn't exist.
    var firstItem3 = $('.tb-row').first().attr('data-id');
    assert.equal(firstItem3, "1", "Refreshing range index passed is not part of data refreshes from index 0. ")

});



// Paginate page up

// Paginate page down

// Paginate go to page

// Multiselect
// add to multiselect - handlemultiselect
// check if Id is multiselected
// Remove multiselected
// Clear Multiselect

// Apply dropzone
// destroy dropzone

// dropzone callbacks

// buildtree
// - data is array vs data is object

// flatten





QUnit.module('Async tests', {
    setup : function () {
        this.server = sinon.fakeServer.create();
    },
    teardown : function ( ){
        this.server.restore();
    }
})

test('checks ', function (assert) {
    var tb = reload.call(this, 'short');

    var item = $('.tb-row').first().attr('data-id');
    assert.equal(item, "1", "Reloaded correctly ")
    //tb.options.redrawComplete = null;
});

// Toggle Scroll
test('checks toggling view to scroll and paginate ', function (assert) {
    var tb = reload.call(this, 'short', {paginateToggle : true, paginate: false});

    var scroll = jQuery.Event( "click" );
    scroll.currentTarget = $('.tb-scroll').get(0);
    $('.tb-scroll').trigger(scroll);

    assert.ok($('.tb-scroll').hasClass('active'), 'Scroll button is active.');
    assert.ok(!tb.options.paginate, 'Paginate state is false.');

    var paginate = jQuery.Event( "click" );
    paginate.currentTarget = $('.tb-paginate').get(0);
    $('.tb-paginate').trigger(paginate);
    assert.ok($('.tb-paginate').hasClass('active'), 'Paginate button is active.');
    assert.ok(tb.options.paginate, 'Paginate state is true.');
});

//test('checks ', function (assert) {
//    var item = tb.createItem({'kind': 'folder', name: 'rowfilterresult', 'title': 'title', person : 'Caner Uguz'}, 1);
//
//    tb.deleteNode(item.parentID, item.id);
//});


