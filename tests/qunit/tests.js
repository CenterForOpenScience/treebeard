var mockData = {
    'short': '[{"person": "Madihah Negassi","title": "Iaculis  Neque  Vehicula    Sit  ","age": 17,"children": [],"kind": "folder"},{"person": "Alacoque Bisson","title": "Neque  Etiam  Dapibus  Vel  Undefined  ","age": 7, "children": [], "kind": "item"},{"person": "Tomi Saariaho", "title": "Et  Pharetra  Eu  Lorem  Elit  ", "age": 46, "children": [], "kind": "item"},{"person": "Hamid Idris", "title": "Nam  Ac  Fermentum  Sagittis  Velit  ", "age": 54, "children": [], "kind": "item"}]',
    'long': '[{"id":1,"person":"MadihahNegassi","desc":"Erossitacultricessedfacilisisipsumsedleoblanditnuncaliquet.","title":"IaculisNequeVehiculaSit","age":17,"skills":"css","open":true,"date":"2014-10-28T16:17:19.710Z","icon":"fa-file-code-o","children":[{"id":2,"person":"ÁkosSándor","desc":"Antenibhaliquamiaculisnonarcusitgravidadolortellusnullaelit.","title":"EuElitPorttitorOdioNon","age":42,"skills":"js","open":false,"date":"2014-10-28T16:17:19.710Z","icon":"fa-file-sound-o","children":[],"kind":"folder"},{"id":92,"person":"KennethCraig","desc":"Hendreritidloremameterosodioenimidblanditsedsitsemposuere.","title":"VolutpatLacusNequeQuis","age":3,"skills":"html","open":true,"date":"2014-10-28T16:17:19.712Z","icon":"fa-file-picture-o","children":[],"kind":"item"},{"id":93,"person":"BeataLund","desc":"Scelerisqueetiamsuspendissesitsitduisedelementum.","title":"EuAcConsectetur","age":10,"skills":"html","open":true,"date":"2014-10-28T16:17:19.712Z","icon":"fa-file-movie-o","children":[],"kind":"item"},{"id":94,"person":"JónBergsveinsson","desc":"Lobortismetuseuismodjustoquisfeugiatauctorsedviverraposuere.","title":"UtConsecteturTemporEuismodEget","age":47,"skills":"js","open":true,"date":"2014-10-28T16:17:19.712Z","icon":"fa-file-powerpoint-o","children":[],"kind":"item"},{"id":95,"person":"UrszulaWoźniak","desc":"Veltinciduntsemurnaidsitlorempharetrasemsemligulaaliquam.","title":"QuisSagittisOrnareNibhEu","age":15,"skills":"js","open":false,"date":"2014-10-28T16:17:19.712Z","icon":"fa-file-audio-o","children":[],"kind":"item"},{"id":96,"person":"RankoĆosić","desc":"tortorpulvinarenimplacerategetnuncnonidloremturpisut.","title":"NequeVehiculaTempor","age":15,"skills":"css","open":false,"date":"2014-10-28T16:17:19.712Z","children":[],"kind":"item"},{"id":97,"person":"DrewReid","desc":"Rutrumeunecmalesuadavelitfacilisisdiamsedpellentesquesed.","title":"FermentumTempusVitaeMauris","age":52,"skills":"python","open":true,"date":"2014-10-28T16:17:19.712Z","icon":"fa-file-movie-o","children":[],"kind":"item"},{"id":98,"person":"JosíasFrías","desc":"Velconsequateleifenderategetmimaurisprimisatenimtortorlobortiscraset.","title":"EuVestibulumMagnaBibendum","age":41,"skills":"js","open":false,"date":"2014-10-28T16:17:19.712Z","icon":"fa-file-word-o","children":[],"kind":"item"},{"id":99,"person":"JaroslavaBalounová","desc":"erataccumsanjustoleoegetsapiencursussapiensitloremidnislpellentesque.","title":"EtEgetUltricesSitNeque","age":34,"skills":"python","open":true,"date":"2014-10-28T16:17:19.712Z","icon":"fa-file-photo-o","children":[],"kind":"item"},{"id":100,"person":"NicholasCooper","desc":"Pulvinarquamidfringillamisedsapienelitconvallislorem.","title":"NullamEtVelitIdUltrices","age":17,"open":false,"date":"2014-10-28T16:17:19.712Z","icon":"fa-file-sound-o","children":[],"kind":"item"},{"id":101,"person":"RenanCorreia","desc":"arcuconvallisaliquamnibhelementumrutrumvelnondapibusdonecvestibulum.","title":"ElitPlaceratTinciduntLoremCondimentum","age":14,"skills":"python","open":true,"date":"2014-10-28T16:17:19.712Z","icon":"fa-file-video-o","children":[],"kind":"item"},{"id":102,"person":"MarcellaLi","desc":"ullamcorpersuscipitactinciduntodioleolectuspellentesquevitaevenenatisdolor.","title":"LoremUltricesNuncSed","age":14,"skills":"js","open":true,"date":"2014-10-28T16:17:19.712Z","icon":"fa-file-text","children":[],"kind":"item"}],"kind":"folder"},{"id":103,"person":"AlacoqueBisson","desc":"Magnadonecnibhphasellusnullaegestasliberoegetvitaealiquamturpisametmassaauctor.","title":"NequeEtiamDapibusVelUndefined","age":7,"skills":"css","open":true,"date":"2014-10-28T16:17:19.712Z","icon":"fa-file-code-o","children":[],"kind":"item"},{"id":104,"person":"TomiSaariaho","desc":"Laciniamassarhoncusegestasrisusloremsitrutrumnuncsollicitudinpellentesque.","title":"EtPharetraEuLoremElit","age":46,"skills":"html","open":true,"date":"2014-10-28T16:17:19.712Z","icon":"fa-file-o","children":[],"kind":"item"},{"id":105,"person":"HamidIdris","desc":"Consequategetatnibharcupellentesquecongueorcitortorsitenim.","title":"NamAcFermentumSagittisVelit","age":54,"skills":"python","open":false,"date":"2014-10-28T16:17:19.712Z","icon":"fa-file-picture-o","children":[],"kind":"item"}]'
};

var server;
function reload(type, options) {
    stop();
    var passOpts = options || {};
    var finalOptions = $.extend({}, passOpts, {filesData : 'small.json', redrawComplete : function () {
        if (!this.initialized) {
            start();
        }
    }
        });
    var _treebeard = new Treebeard(finalOptions);
    var TB = _treebeard.tbController;
    server.requests[0].respond(200, { "Content-Type": "application/json" }, mockData[type]);
    return TB;
}

QUnit.module("Load Tests", {
    setup : function () {
        server = sinon.fakeServer.create();
    },
    teardown : function () {
        server.restore();
    }
});

test('Treebeard is loaded with options and destroyed properly', function (assert) {
    var tb = reload.call(this, 'long');
    assert.ok(typeof tb === 'object', 'Treebeard is loaded as an object');
    assert.ok(typeof tb.options === 'object', 'Treebeard has default options');
    tb.destroy();
    assert.equal(window.treebeardCounter, -1, 'Destroy resets treebeard counter');
    assert.equal($('#' + tb.options.divID).html(), '', 'Destroy empties the container div');
    assert.equal(tb.dropzone, undefined, 'Destroy clears dropzone');
});

test('Buildtree function converts to item data', function (assert) {
    var tb = reload.call(this, 'short');
    assert.equal(tb.treeData.children.length, 4, 'Buildtree built data with children.');
    assert.equal(tb.treeData.parentID, null, 'treeData top item does not have parent.');
    assert.equal(tb.treeData.id, 0, 'treeData top item id is 0.');
    tb.destroy();
});

test('Flatten function gives flat data', function (assert) {
    var tb = reload.call(this, 'short');
    assert.equal(tb.flatData.length, 4, 'Flatten built flat array.');
    assert.ok($.isArray(tb.flatData), 'Flatten built an array.');
    tb.destroy();
});

QUnit.module("ITEM API Tests", {
    setup : function () {
        server = sinon.fakeServer.create();
    },
    teardown : function () {
        server.restore();
    }
});

test('ITEM Constructor ', function (assert) {
    var tb = reload.call(this, 'short'),
        item = tb.createItem({'kind': 'folder', 'name': 'Item API test folder'}, 1);
    assert.equal(item.kind, 'folder', 'Item constructor built the correct kind information and Added to parent');
    tb.destroy();
});

test('ITEM Move ', function (assert) {
    var tb = reload.call(this, 'short'),
        item = tb.createItem({ 'kind': 'folder', 'name': 'Item API test folder'}, 1),
        childItem =  tb.createItem({'kind': 'item', 'name': 'Item API test child'}, item.id),
        topLevel,
        movedItem;
    childItem.move(1);
    topLevel = tb.find(1);
    movedItem = topLevel.child(childItem.id);
    assert.equal(movedItem.data.name, 'Item API test child', 'Moved item moved to the correct place');
    tb.destroy();
});

test('ITEM Find ', function (assert) {
    var tb = reload.call(this, 'short'),
        item = tb.createItem({'kind': 'folder', 'name': 'Item API test folder'}, 1),
        foundItem = tb.find(item.id);
    assert.equal(foundItem.data.name, 'Item API test folder', 'Finding item by id works');
    tb.destroy();
});

test('ITEM find child by ID', function (assert) {
    var tb = reload.call(this, 'short'),
        item = tb.createItem({'kind': 'folder', 'name': 'Item API test folder'}, 1),
        childItem =  tb.createItem({'kind': 'item', 'name': 'Item API test child'}, item.id),
        foundItem = item.child(childItem.id);
    assert.equal(foundItem.data.name, 'Item API test child', 'Item child found with child()');
    tb.destroy();
});

test('ITEM Prev, next, parent find ', function (assert) {
    var tb = reload.call(this, 'short'),
        item = tb.createItem({'kind': 'folder', 'name': 'Item API test folder'}, 1),
        child1 =  tb.createItem({'kind': 'item', 'name': 'Child1'}, item.id),
        child2 =  tb.createItem({'kind': 'item', 'name': 'Child2'}, item.id),
        next = child1.prev(),
        prev = child2.next(),
        parent = child1.parent();
    assert.equal(next.data.name, 'Child2', 'Finds next() item correctly.');
    assert.equal(prev.data.name, 'Child1', 'Finds prev() item correctly.');
    assert.equal(parent.data.name, 'Item API test folder', 'Finds parent() item correctly.');
    tb.destroy();
});

test('ITEM is ancestor', function (assert) {
    var tb = reload.call(this, 'short'),
        item = tb.createItem({'kind': 'folder', 'name': 'Item API test folder'}, 1),
        child =  tb.createItem({'kind': 'item', 'name': 'Child1'}, item.id),
        isAncestor = item.isAncestor(child);
    assert.ok(isAncestor, 'Check for isAncestor returns correctly');
    tb.destroy();
});

test('ITEM is descendant', function (assert) {
    var tb = reload.call(this, 'short'),
        item = tb.createItem({'kind': 'folder', 'name': 'Item API test folder'}, 1),
        child =  tb.createItem({'kind': 'item', 'name': 'Child1'}, item.id),
        idDescendant = child.isDescendant(item);
    assert.ok(idDescendant, 'Check for isDescendant returns correctly');
    tb.destroy();
});

QUnit.module("Treebeard API tests", {
    setup : function () {
        server = sinon.fakeServer.create();
    },
    teardown : function () {
        server.restore();
    }
});

test('createItem()', function (assert) {
    var tb = reload.call(this, 'short'),
        oldflatLength = tb.flatData.length,
        expected = 'Test',
        item = tb.createItem({'kind': 'folder', 'name': expected}, 1),
        newflatLength = tb.flatData.length;
    assert.equal(item.data.name, expected, 'Looked for : "' + expected + '" found: "' + item.data.name + '"');
    assert.equal(oldflatLength, newflatLength - 1, 'Flatdata length is updated.');
    tb.destroy();
});

test('find()', function (assert) {
    var tb = reload.call(this, 'short'),
        expected = 'Testing find',
        item = tb.createItem({'kind': 'folder', 'name': expected}, 1),
        foundItem = tb.find(item.id);
    assert.equal(foundItem.data.name, expected, 'Looked for : "' + expected + '" found: "' + foundItem.data.name + '"');
    tb.destroy();
});

test('deleteNode()', function (assert) {
    var tb = reload.call(this, 'short'),
        item = tb.createItem({'kind': 'folder', 'name': 'Delete Test Parent'}, 1),
        parentID = item.id,
        childItem =  tb.createItem({'kind': 'item', 'name': 'Delete Test Child'}, parentID);
    tb.deleteNode(parentID, childItem.id);
    assert.equal(item.children.length, 0, 'Child item deleted.');
    tb.destroy();
});

test('canMove()', function (assert) {
    var tb = reload.call(this, 'short'),
        item = tb.createItem({'kind': 'folder', 'name': 'Move Test Parent'}, 1),
        parentID = item.id,
        childItem =  tb.createItem({'kind': 'item', 'name': 'Move Test Child'}, parentID),
        outcome1 = tb.canMove(childItem, item),
        item2 =  tb.createItem({'kind': 'item', 'name': 'Move Sibling 2'}, 1),
        outcome2 = tb.canMove(item, item2);
    assert.ok(!outcome1, 'Can\'t move parent folder to child folder');
    assert.ok(outcome2, 'Can move sibling folder into sibling');
    tb.destroy();
});

test('return index of item in the flatData, returnIndex()', function (assert) {
    var tb = reload.call(this, 'long'),
        existingIndex = tb.returnIndex(2),
        existingOutsideView = tb.returnIndex(14),
        nonexistingIndex =  tb.returnIndex(200);
    assert.equal(existingIndex, 1, 'An existing item within view is returned correctly.');
    assert.equal(existingOutsideView, 13, 'An existing item outside view is returned correctly.');
    assert.equal(nonexistingIndex, undefined, 'A non existing item returned correctly as undefined.');
    tb.destroy();
});

test('return index of item in the showRange, returnRangeIndex()', function (assert) {
    var tb = reload.call(this, 'long'),
        existingIndex = tb.returnRangeIndex(15),
        existingOutsideView = tb.returnRangeIndex(3),
        nonexistingIndex =  tb.returnRangeIndex(200);
    assert.equal(existingIndex, 2, 'An existing item within view is returned correctly.');
    assert.equal(existingOutsideView, undefined, 'An existing item outside view is returned correctly as undefined.');
    assert.equal(nonexistingIndex, undefined, 'A non existing item returned correctly as undefined.');
    tb.destroy();
});

test('checks if rowfilterresult correctly shows whether row includes term', function (assert) {
    var tb,
        item,
        upper,
        lower,
        mixed,
        number,
        something;
    tb = reload.call(this, 'short');
    item = tb.createItem({'kind': 'folder', name: 'rowfilterresult', 'title': 'UPPERCASE, lowercase, MIxeD, numb3r', person : 'Caner Uguz'}, 1);
    // uppercase match should be found
    tb.filterText('UPPERCASE');
    upper = tb.rowFilterResult(item);
    assert.ok(upper, 'Uppercase match is found.');
    // Lowercase match should be found
    tb.filterText('lowercase');
    lower = tb.rowFilterResult(item);
    assert.ok(lower, 'Lowercase match is found.');
    // Mixed match should be found
    tb.filterText('MIxeD');
    mixed = tb.rowFilterResult(item);
    assert.ok(mixed, 'Mixed case match is found.');
    // number match should be found
    tb.filterText('numb3r');
    number = tb.rowFilterResult(item);
    assert.ok(number, 'Number match is found.');
    // Filter text that does not exist should not be found
    tb.filterText('something');
    something = tb.rowFilterResult(item);
    assert.ok(!something, 'Filter text not in item is not found as expected.');
    tb.filterText('');
    tb.destroy();
});

test('checks if filter event runs and clears', function (assert) {
    var tb,
        event,
        visible,
        cleared;
    tb = reload.call(this, 'long');
    event = jQuery.Event("keyup");
    event.currentTarget = $('.tb-head-filter input').get(0);
    $('.tb-head-filter input').trigger('focus').val('vehicula').trigger(event);
    visible = $('.tb-row:contains("Vehicula")').length;
    assert.equal(visible, 2, "Filtering correctly shows filtered items.");
    $('.tb-head-filter input').trigger('focus').val('').trigger(event);
    cleared = $('.tb-row:contains("Vehicula")').length;
    assert.equal(cleared, 1, "Clearing filter restores list");
    tb.destroy();
});

test('checks update folder ', function (assert) {
    var tb,
        item,
        data;
    tb = reload.call(this, 'short');
    item = tb.createItem({'kind': 'folder', name: 'Parent for update folder', 'title': 'title', person : 'Caner Uguz'}, 0);
    data = {'kind': 'folder', name: 'child for update folder', 'title': 'title', person : 'Caner Uguz'};
    tb.updateFolder([data], item);
    assert.equal(item.children.length, 1, 'Parent folder item added with update folder');
    tb.destroy();
});

test('checks folder Toggle actually toggles view and data ', function (assert) {
    var tb,
        openCount,
        item,
        closedCount,
        shouldShowOpen = 15,
        shouldShowClosed = 4;
    tb = reload.call(this, 'long');
    tb.toggleFolder(0, null);
    openCount = $('.tb-row').length;
    assert.equal(openCount, shouldShowOpen, 'The view refreshes to show ' + shouldShowOpen +  '  open items. ');
    assert.equal(tb.showRange.length, shouldShowOpen, 'The showRange data refreshes to show ' + shouldShowOpen +  '  open items. ');
    item = tb.find(1);
    assert.ok(item.open, 'The item open property accurately shows true');
    tb.toggleFolder(0, null);
    closedCount = $('.tb-row').length;
    assert.equal(closedCount, shouldShowClosed, 'The view refreshes to show ' + shouldShowClosed +  '  open items. ');
    assert.equal(tb.showRange.length, shouldShowClosed, 'The showRange data refreshes to show ' + shouldShowClosed +  ' open items. ');
    assert.ok(!item.open, 'The item open property accurately shows false after closing');
    tb.destroy();
});

test('checks if toggle sorting works', function (assert) {
    var tb,
        eventAsc,
        firstItem,
        eventDesc,
        firstItem2;
    tb = reload.call(this, 'long');
    eventAsc = jQuery.Event("click");
    eventAsc.currentTarget = $('.fa-sort-asc').get(0);
    $('.fa-sort-asc').trigger(eventAsc);
    firstItem = $('.tb-row').first().attr('data-id');
    assert.equal(firstItem, "15", " Ascending order changed view correctly. ");
    eventDesc = jQuery.Event("click");
    eventDesc.currentTarget = $('.fa-sort-desc').get(0);
    $('.fa-sort-desc').trigger(eventDesc);
    firstItem2 = $('.tb-row').first().attr('data-id');
    assert.equal(firstItem2, "14", " Descending order changed view correctly. ");
    tb.destroy();
});

test('checks calculateHeight works', function (assert) {
    var tb,
        height1,
        height2,
        height3,
        height4,
        shouldBeHeight1 = 140,
        shouldBeHeight2 = 525,
        shouldBeHeight3 = 525,
        shouldBeHeight4 = 560;
    tb = reload.call(this, 'long');
    // pagination off, fodler  closed
    tb.options.paginate = false;
    height1 = tb.calculateHeight();
    assert.equal(height1, shouldBeHeight1, "Pagination OFF, folder CLOSED calculate height accurate. ");
    // pagination on, folder closed
    tb.options.paginate = true;
    height2 = tb.calculateHeight();
    assert.equal(height2, shouldBeHeight2, "Pagination ON, folder CLOSED calculate height accurate. ");
    // pagination on, folder open
    tb.toggleFolder(0, null);
    tb.redraw();
    height3 = tb.calculateHeight();
    assert.equal(height3, shouldBeHeight3, "Pagination ON, folder OPEN calculate height accurate. ");
    // pagination off, folder open
    tb.options.paginate = false;
    tb.redraw();
    height4 = tb.calculateHeight();
    assert.equal(height4, shouldBeHeight4, "Pagination OFF, folder OPEN calculate height accurate. ");
    // reset
    tb.toggleFolder(0, null);
    tb.destroy();
});

test('checks calculateVisible works', function (assert) {
    var tb,
        total1,
        total2,
        event,
        visible,
        total3;
    tb = reload.call(this, 'long');
    // Load Test
    total1 = tb.calculateVisible();
    assert.equal(total1, 4, "Initial calculate visible correctly counts 4 items");
    // Toggle Test
    tb.toggleFolder(0, null);
    total2 = tb.calculateVisible();
    assert.equal(total2, 16, "Toggled folder calculate visible correctly counts 16 items");
    tb.toggleFolder(0, null);   // clear toggle
    // Filter Test
    event = jQuery.Event("keyup");
    event.currentTarget = $('.tb-head-filter input').get(0);
    $('.tb-head-filter input').trigger('focus').val('vehicula').trigger(event);
    visible = $('.tb-row:contains("Vehicula")').length;
    total3 = tb.calculateVisible();
    assert.equal(total3, visible, "Filter correctly calculates visible");
    // Clear filter
    $('.tb-head-filter input').trigger('focus').val('').trigger(event);
    tb.destroy();
});

test('checks refreshRange works', function (assert) {
    var tb,
        firstItem1,
        firstItem2,
        firstItem3;
    tb = reload.call(this, 'long');
    tb.refreshRange(1); // push the view to start from index 1
    firstItem1 = $('.tb-row').first().attr('data-id');
    assert.equal(firstItem1, "14", "Refreshing range to begin from index 1 works. ");
    tb.refreshRange(); // check if default refreshes to 0
    firstItem2 = $('.tb-row').first().attr('data-id');
    assert.equal(firstItem2, "1", "Refreshing range when no arguments passed correctly refreshes from index 0. ");
    tb.refreshRange(333); // check what happens when refresh range is an index that doesn't exist.
    firstItem3 = $('.tb-row').first().attr('data-id');
    assert.equal(firstItem3, "1", "Refreshing range index passed is not part of data refreshes from index 0. ");
    tb.destroy();
});

QUnit.module('Async tests', {
    setup : function () {
        server = sinon.fakeServer.create();
    },
    teardown : function () {
        server.restore();
    }
});

test('checks ', function (assert) {
    var tb = reload.call(this, 'short'),
        item = $('.tb-row').first().attr('data-id');
    assert.equal(item, "1", "Reloaded correctly ");
    tb.destroy();
});

test('checks toggling view to scroll and paginate ', function (assert) {
    var tb,
        scroll,
        paginate;
    tb = reload.call(this, 'short', {paginateToggle : true, paginate: false});
    scroll = jQuery.Event("click");
    scroll.currentTarget = $('.tb-scroll').get(0);
    $('.tb-scroll').trigger(scroll);
    assert.ok($('.tb-scroll').hasClass('active'), 'Scroll button is active.');
    assert.ok(!tb.options.paginate, 'Paginate state is false.');
    paginate = jQuery.Event("click");
    paginate.currentTarget = $('.tb-paginate').get(0);
    $('.tb-paginate').trigger(paginate);
    assert.ok($('.tb-paginate').hasClass('active'), 'Paginate button is active.');
    assert.ok(tb.options.paginate, 'Paginate state is true.');
    tb.destroy();
});

test('checks paginate up and down and gotopage', function (assert) {
    var tb,
        page1,
        pageUp1,
        page2,
        pageDown1,
        page3,
        toPage1,
        page4,
        toPage2,
        page5,
        toPage3,
        page6,
        pageUp2,
        page7,
        pageDown2,
        page8;
    tb = reload.call(this, 'long', {paginateToggle : true, paginate: true});
    tb.toggleFolder(0, null);
    page1 = tb.currentPage();
    assert.equal(page1, '1', 'Page number loads with 1.');
    pageUp1 = tb.pageUp();
    // We are using tb.currentPage() here for view, because if this value changes then view update is left to mithril
    page2 = tb.currentPage(); //$('.tb-pageCount').text();
    assert.ok(pageUp1, 'Page up returnes true when page exists');
    assert.equal(page2, '2', 'Page up goes to next page in view');
    pageDown1 = tb.pageDown();
    page3 = tb.currentPage();
    assert.ok(pageDown1, 'Page down returnes true when page exists');
    assert.equal(page3, '1', 'Page down goes to previous page in view');
    toPage1 = tb.goToPage(2);
    page4 = tb.currentPage();
    assert.ok(toPage1, 'gotoPage returns true when page found');
    assert.equal(page4, '2', 'Go to page goes to page that exists in view');
    toPage2 = tb.goToPage(3);
    page5 = tb.currentPage();
    assert.ok(!toPage2, 'gotoPage returns false when page one more than existing pages. ');
    assert.equal(page5, '2', 'Go to page to non existing page (1 more than existing) did not change view.');
    toPage3 = tb.goToPage(12);
    page6 = tb.currentPage();
    assert.ok(!toPage3, 'gotoPage returns false when page does not exist. ');
    assert.equal(page6, '2', 'Go to page to non existing page (1 more than existing) did not change view.');
    pageUp2 = tb.pageUp();
    page7 = tb.currentPage();
    assert.ok(!pageUp2, 'Page up returnes false when on last page');
    assert.equal(page7, '2', 'Page up doesn\'t change view when on last page');
    tb.pageDown();
    pageDown2 = tb.pageDown();
    page8 = tb.currentPage();
    assert.ok(!pageDown2, 'Page down returnes false when on first page');
    assert.equal(page8, '1', 'Page down doesn\'t change view when on first page');
    tb.destroy();
});

QUnit.module('Multiselect', {
    setup : function () {
        server = sinon.fakeServer.create();
    },
    teardown : function () {
        server.restore();
    }
});

test(' multiselect handler function with single item ', function (assert) {
    var tb,
        msHighlight,
        length,
        hasClass,
        isMultiselected;
    tb = reload.call(this, 'short');
    msHighlight = tb.options.hoverClassMultiselect;
    // add single item to multiselect,
    tb.handleMultiselect(2, 1, null);
    // check multiselect length
    length = tb.multiselected.length;
    // check highlight class exists
    hasClass = $('.tb-row[data-id=2]').hasClass(msHighlight);
    // item is in multiselect
    isMultiselected = tb.isMultiselected(2);
    assert.equal(length, 1, 'Single item added with 1 total multiselected');
    assert.ok(hasClass, 'Single item multiselect has the highlight class');
    assert.ok(isMultiselected, 'Single item is among multiselected list.');
    tb.destroy();
});

test(' multiselect handler function with shift key pressed item ', function (assert) {
    var tb,
        msHighlight,
        length,
        hasClass2,
        hasClass3,
        hasClass4,
        isMultiselected2,
        isMultiselected3,
        isMultiselected4;
    tb = reload.call(this, 'short');
    msHighlight = tb.options.hoverClassMultiselect;
    // add single item to multiselect,
    tb.handleMultiselect(2, 1, null);
    tb.pressedKey = 16;
    tb.selected = tb.find(2).id;
    tb.handleMultiselect(4, 3, null);
    // check multiselect length
    length = tb.multiselected.length;
    // check that middle column has highlight class
    hasClass2 = $('.tb-row[data-id=2]').hasClass(msHighlight);
    hasClass3 = $('.tb-row[data-id=3]').hasClass(msHighlight);
    hasClass4 = $('.tb-row[data-id=4]').hasClass(msHighlight);
    // item is in multiselect
    isMultiselected2 = tb.isMultiselected(2);
    isMultiselected3 = tb.isMultiselected(3);
    isMultiselected4 = tb.isMultiselected(4);
    assert.equal(length, 3, 'Shift key selects 3 items with 2 clicks');
    assert.ok(hasClass2, 'First item has the highlight class');
    assert.ok(hasClass3, 'Second item has the highlight class');
    assert.ok(hasClass4, 'Third item has the highlight class');
    assert.ok(isMultiselected2, 'First item is among multiselected list.');
    assert.ok(isMultiselected3, 'Second item is among multiselected list.');
    assert.ok(isMultiselected4, 'Third item is among multiselected list.');
    tb.destroy();
});

test(' multiselect handler function with Command key pressed item ', function (assert) {
    var tb,
        msHighlight,
        length,
        hasClass2,
        hasClass3,
        hasClass4,
        isMultiselected2,
        isMultiselected3,
        isMultiselected4;
    tb = reload.call(this, 'short');
    msHighlight = tb.options.hoverClassMultiselect;
    // add single item to multiselect,
    tb.handleMultiselect(2, 1, null);
    tb.pressedKey = 91;
    tb.handleMultiselect(4, 3, null);
    // check multiselect length
    length = tb.multiselected.length;
    // check that middle column has highlight class
    hasClass2 = $('.tb-row[data-id=2]').hasClass(msHighlight);
    hasClass3 = $('.tb-row[data-id=3]').hasClass(msHighlight);
    hasClass4 = $('.tb-row[data-id=4]').hasClass(msHighlight);
    // item is in multiselect
    isMultiselected2 = tb.isMultiselected(2);
    isMultiselected3 = tb.isMultiselected(3);
    isMultiselected4 = tb.isMultiselected(4);
    assert.equal(length, 2, 'Shift key selects 2 items with 2 clicks');
    assert.ok(hasClass2, 'First item has the highlight class');
    assert.ok(!hasClass3, 'Second item shouldnt have the highlight class');
    assert.ok(hasClass4, 'Third item has the highlight class');
    assert.ok(isMultiselected2, 'First item is among multiselected list.');
    assert.ok(!isMultiselected3, 'Second item should not be among multiselected list.');
    assert.ok(isMultiselected4, 'Third item is among multiselected list.');
    tb.destroy();
});


test(' remove multiselected function ', function (assert) {
    var tb,
        msHighlight,
        length,
        hasClass,
        isMultiselected;
    tb = reload.call(this, 'short');
    msHighlight = tb.options.hoverClassMultiselect;
    // add single item to multiselect,
    tb.handleMultiselect(2, 1, null);
    // remove single item from multiselect
    tb.removeMultiselected(2);
    length = tb.multiselected.length;
    hasClass = $('.tb-row[data-id=2]').hasClass(msHighlight);
    isMultiselected = tb.isMultiselected(2);
    assert.equal(length, 0, '0 left after removing first one');
    assert.ok(!hasClass, 'Removed item should not maintain highlight');
    assert.ok(!isMultiselected, 'Removed item should not be in in multiselected list.');
    tb.destroy();
});

test('checks clear multiselect ', function (assert) {
    var tb,
        msHighlight,
        length1,
        length2,
        hasClass1,
        isMultiselected1,
        isMultiselected2,
        isMultiselected3;
    tb = reload.call(this, 'short');
    msHighlight = tb.options.hoverClassMultiselect;
    // add single item to multiselect,
    tb.handleMultiselect(2, 1, null);
    tb.clearMultiselect();
    length1 = tb.multiselected.length;
    hasClass1 = $('.tb-row[data-id=2]').hasClass(msHighlight);
    isMultiselected1 = tb.isMultiselected(2);
    // clear single multiselect
    assert.equal(length1, 0, 'Clearing multiselect leaves 0');
    assert.ok(!hasClass1, 'Cleared item should not maintain highlight');
    assert.ok(!isMultiselected1, 'Cleared item should not be in in multiselected list.');
    // add two multiselect
    tb.handleMultiselect(2, 1, null);
    tb.pressedKey = 91;
    tb.handleMultiselect(4, 3, null);
    tb.clearMultiselect();
    length2 = tb.multiselected.length;
    isMultiselected2 = tb.isMultiselected(2);
    isMultiselected3 = tb.isMultiselected(4);
    // clear multiselect with two
    assert.equal(length2, 0, 'Clearing multiselect leaves 0');
    assert.ok(!isMultiselected2, 'Cleared multiple item should not be in in multiselected list.');
    assert.ok(!isMultiselected3, 'Cleared multiple item should not be in in multiselected list.');
    tb.destroy();
});

QUnit.module('Options HOOKS', {
    setup : function () {
        server = sinon.fakeServer.create();
    },
    teardown : function () {
        server.restore();
    }
});

test('checks onmultiselect hook', function (assert) {
    var tb = reload.call(this, 'short'),
        onmultiselect = sinon.spy();
    tb.options.onmultiselect = onmultiselect;
    tb.handleMultiselect(2, 1, null);
    assert.equal(onmultiselect.callCount, 1, "Onmultiselect callback called once .");
    tb.destroy();
});

test('checks folder Toggle runs "lazyload", "ontoggle" and "togglecheck" callbacks ', function (assert) {
    var check,
        load,
        lazyload,
        ontoggle,
        togglecheck,
        lazyloadonload,
        tb;
    check = function (item) {
        return true;
    };
    load = function (item) {
        if (item.id === 1) {
            return 'small.json';
        }
        return false;
    };
    lazyload = sinon.spy(load);
    ontoggle = sinon.spy();
    togglecheck = sinon.spy(check);
    lazyloadonload = sinon.spy();
    tb = reload.call(this, 'long', {
        resolveRefreshIcon : function () {
            return m('i.fa.fa-refresh.fa-spin');
        },
        resolveLazyloadUrl : lazyload,
        ontogglefolder : ontoggle,
        togglecheck : togglecheck,
        lazyLoadOnLoad : lazyloadonload
    });
    tb.toggleFolder(0, null);
    assert.equal(lazyload.callCount, 1, "Lazyload callback called once .");
    assert.equal(ontoggle.callCount, 1, "Ontoggle callback called once .");
    //assert.equal(lazyloadonload.callCount, 1, "Lazyloadonload callback called once .");
    $('.tb-row[data-id="1"]').find('.tb-toggle-icon').trigger('click');
    assert.equal(togglecheck.callCount, 1, "Togglecheck callback called once .");
    tb.destroy();
});

test('toggleFolder callback gets called', function(assert) {
    assert.expect(1);
    var check,
        load,
        lazyload,
        ontoggle,
        togglecheck,
        lazyloadonload,
        tb;
    check = function (item) {
        return true;
    };
    load = function (item) {
        if (item.id === 1) {
            return 'small.json';
        }
        return false;
    };
    lazyload = sinon.spy(load);
    ontoggle = sinon.spy();
    callback = sinon.spy();
    togglecheck = sinon.spy(check);
    lazyloadonload = sinon.spy();
    tb = reload.call(this, 'long', {
        resolveRefreshIcon : function () {
            return m('i.fa.fa-refresh.fa-spin');
        },
        resolveLazyloadUrl : lazyload,
        ontogglefolder : ontoggle,
        togglecheck : togglecheck,
        lazyLoadOnLoad : lazyloadonload
    });
    tb.toggleFolder(0, null, callback);
    assert.equal(callback.callCount, 1, 'toggleFolder callback is called.');
    tb.destroy();
});

test('toggleFolder callback is not required', function(assert) {
    assert.expect(0);
    var check,
        load,
        lazyload,
        ontoggle,
        togglecheck,
        lazyloadonload,
        tb;
    check = function (item) {
        return true;
    };
    load = function (item) {
        if (item.id === 1) {
            return 'small.json';
        }
        return false;
    };
    lazyload = sinon.spy(load);
    ontoggle = sinon.spy();
    callback = sinon.spy();
    togglecheck = sinon.spy(check);
    lazyloadonload = sinon.spy();
    tb = reload.call(this, 'long', {
        resolveRefreshIcon : function () {
            return m('i.fa.fa-refresh.fa-spin');
        },
        resolveLazyloadUrl : lazyload,
        ontogglefolder : ontoggle,
        togglecheck : togglecheck,
        lazyLoadOnLoad : lazyloadonload
    });
    tb.toggleFolder(0, null);
    tb.destroy();
});


test('onload hook function runs', function (assert) {
    var onload = sinon.spy(),
        tb = reload.call(this, 'long', {onload : onload});
    assert.equal(onload.callCount, 1, "Onload callback called once.");
    tb.destroy();
});


test('onfilter and onfilterreset hooks run', function (assert) {
    var onfilter,
        onfilterreset,
        tb,
        event;
    onfilter = sinon.spy();
    onfilterreset = sinon.spy();
    tb = reload.call(this, 'long', {
        onfilter : onfilter,
        onfilterreset : onfilterreset
    });
    event = jQuery.Event("keyup");
    event.currentTarget = $('.tb-head-filter input').get(0);
    $('.tb-head-filter input').trigger('focus').val('vehicula').trigger(event);
    assert.equal(onfilter.callCount, 1, "Onfilter callback called once .");
    $('.tb-head-filter input').trigger('focus').val('').trigger(event);
    assert.equal(onfilterreset.callCount, 1, "Onfilterreset callback called once .");
    tb.destroy();
});

test('oncreate and oncreatecheck hooks ran', function (assert) {
    var check,
        oncreate,
        createcheck,
        tb;
    check = function () {
        return true;
    };
    oncreate = sinon.spy();
    createcheck = sinon.spy(check);
    tb = reload.call(this, 'short', {
        oncreate: oncreate,
        createcheck : createcheck
    });
    tb.createItem({'kind': 'folder', 'name': 'Item API test folder'}, 1);
    assert.equal(createcheck.callCount, 1, "createcheck callback called once .");
    assert.equal(oncreate.callCount, 1, "Oncreate callback called once .");
    tb.destroy();
});

test('deletecheck and ondelete hooks ran', function (assert) {
    var check,
        ondelete,
        deletecheck,
        tb;
    check = function () {
        return true;
    };
    ondelete = sinon.spy();
    deletecheck = sinon.spy(check);
    tb = reload.call(this, 'short', {
        ondelete: ondelete,
        deletecheck : deletecheck
    });
    tb.deleteNode(0, 2);
    assert.equal(deletecheck.callCount, 1, "deletecheck callback called once .");
    assert.equal(ondelete.callCount, 1, "ondelete callback called once .");
    tb.destroy();
});

test('onselectrow and mouseoverrow hooks ran ', function (assert) {
    var onselectrow,
        onmouseoverrow,
        tb;
    onselectrow = sinon.spy();
    onmouseoverrow = sinon.spy();
    tb = reload.call(this, 'long', {
        onselectrow : onselectrow,
        onmouseoverrow : onmouseoverrow
    });
    $('.tb-row[data-id="1"]').trigger('click');
    assert.equal(onselectrow.callCount, 1, "Onselectrow callback called once .");
    $('.tb-row[data-id="1"]').trigger('onmouseover');
    assert.ok(onmouseoverrow.called, "Onmouseoverrow callback called .");
    tb.destroy();
});

test(' onmultiselect hook ran', function (assert) {
    var onmultiselect = sinon.spy(),
        tb = reload.call(this, 'short', {
            onmultiselect : onmultiselect
        });
    // add single item to multiselect,
    tb.handleMultiselect(2, 1, null);
    assert.equal(onmultiselect.callCount, 1, "onmultiselect callback called once .");
    tb.destroy();
});

test('resolveicon hook ran', function (assert) {
    var func,
        resolveicon,
        tb;
    func = function () {
        return m("i.fa.fa-file ");
    };
    resolveicon = sinon.spy(func);
    tb = reload.call(this, 'short', {
        resolveIcon : resolveicon
    });
    assert.ok(resolveicon.called, "resolveicon callback called.");
    tb.destroy();
});

QUnit.module('Dropzone', {
    setup : function () {
        server = sinon.fakeServer.create();
    },
    teardown : function () {
        server.restore();
    }
});

test('Dropzone applied with default url', function (assert) {
    var tb = reload.call(this, 'short', {
        uploads : true
    });
    assert.ok(tb.dropzone, "Dropzone object exists");
    assert.equal(tb.dropzone.options.url, "http://www.torrentplease.com/dropzone.php", "Dropzone object hs the default url in its options");
    tb.destroy();
});

test('Dropzone drag event hooks', function (assert) {
    var dragstart = sinon.spy(),
        dragend = sinon.spy(),
        dragenter = sinon.spy(),
        dragover = sinon.spy(),
        dragleave = sinon.spy(),
        tb = reload.call(this, 'short', {
            uploads: true,
            dropzoneEvents : {
                dragstart : dragstart,
                dragend : dragend,
                dragenter : dragenter,
                dragover : dragover,
                dragleave : dragleave
            }
        });
    tb.dropzone.options.dragstart();
    assert.equal(dragstart.callCount, 1, "dragstart callback called once .");
    tb.dropzone.options.dragend();
    assert.equal(dragend.callCount, 1, "dragend callback called once .");
    tb.dropzone.options.dragenter();
    assert.ok(dragenter.called, "dragenter callback called.");
    tb.dropzone.options.dragover();
    assert.ok(dragover.called, "dragover callback called.");
    tb.dropzone.options.dragleave();
    assert.ok(dragleave.called, "dragleave callback called.");
    tb.destroy();
});

test('Dropzone file event hooks', function (assert) {
    var drop = sinon.spy(),
        success = sinon.spy(),
        error = sinon.spy(),
        uploadprogress = sinon.spy(),
        sending = sinon.spy(),
        complete = sinon.spy(),
        addedfile = sinon.spy(),
        tb = reload.call(this, 'short', {
            uploads: true,
            dropzoneEvents : {
                drop : drop,
                success : success,
                error : error,
                uploadprogress : uploadprogress,
                sending : sending,
                complete : complete,
                addedfile : addedfile
            }
        }),
        f = {},
        event = jQuery.Event("mouseover");
    event.target = $('.tb-row[data-id="1"]').get(0);
    tb.dropzone.options.drop(event);
    assert.equal(drop.callCount, 1, "drop callback called once .");
    tb.dropzone.options.success(f);
    assert.equal(success.callCount, 1, "success callback called once .");
    tb.dropzone.options.error();
    assert.ok(error.called, "error callback called.");
    tb.dropzone.options.uploadprogress();
    assert.ok(uploadprogress.called, "uploadprogress callback called.");
    tb.dropzone.options.sending();
    assert.ok(sending.called, "sending callback called.");
    tb.dropzone.options.complete(f);
    assert.ok(complete.called, "complete callback called.");
    tb.dropzone.options.addedfile(f);
    assert.ok(addedfile.called, "addedfile callback called.");
    tb.destroy();
});

test('Dropzone accept, and related event hooks', function (assert) {
    var check,
        method,
        addcheck,
        resolveuploadurl,
        resolveuploadmethod,
        tb,
        f;
    check = function () {
        return true;
    };
    method = function () {
        return "POST";
    };
    addcheck = sinon.spy(check);
    resolveuploadurl = sinon.spy();
    resolveuploadmethod = sinon.spy(method);
    tb = reload.call(this, 'short', {
        uploads: true,
        addcheck : addcheck,
        resolveUploadUrl : resolveuploadurl,
        resolveUploadMethod : resolveuploadmethod
    });
    tb.dropzoneItemCache = tb.find(1);
    f = {};
    tb.dropzone.options.accept(f, function () {});
    assert.equal(addcheck.callCount, 1, "addcheck callback called once .");
    assert.equal(resolveuploadurl.callCount, 1, "resolveuploadurl callback called once .");
    assert.equal(resolveuploadmethod.callCount, 1, "resolveuploadmethod callback called once .");
    tb.destroy();
});

QUnit.module('Notify test', {});

test('Notify timeout', function (assert) {
    var notify,
        notify2;
    notify = new Treebeard.Notify();
    assert.equal(notify.timeout, 3000, 'defaults to 3000');
    notify2 = new Treebeard.Notify('foo', 'info', 42, 0);
    assert.equal(notify2.timeout, 0, 'can be set to 0');
});
