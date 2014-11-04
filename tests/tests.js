QUnit.test('Treebeard is loaded', function(assert) {
    assert.ok(typeof tb === 'object', 'Treebeard is loaded as an object');
});

QUnit.test('Treebeard has options', function(assert) {
    assert.ok(typeof tb.options === 'object', 'Treebeard has default options');
});

QUnit.test('createItem() works', function (assert) {
    var expected = 'Test',
        item = tb.createItem({kind: 'folder', 'name': expected}, 1);
    assert.equal(item.data.name, expected, 'Looked for : "'+ expected +'" found: "' + item.data.name + '"');
});

QUnit.test('find() works', function (assert) {
    var expected = 'Testing find',
        item = tb.createItem({kind: 'folder', 'name': expected}, 1),
        foundItem = tb.find(item.id);
    assert.equal(foundItem.data.name, expected, 'Looked for : "' + expected + '" found: "' + foundItem.data.name + '"');
});

QUnit.test('deleteNode() works', function (assert) {
    var item = tb.createItem({kind: 'folder', 'name': 'Delete Test Parent'}, 1),
        parentID = item.id,
        childItem =  tb.createItem({kind: 'item', 'name': 'Delete Test Child'}, parentID);
    tb.deleteNode(parentID, childItem.id);
    assert.equal(item.children.length, 0, 'Child item deleted.');
});

QUnit.test('canMove() works', function (assert) {
    var item = tb.createItem({kind: 'folder', 'name': 'Move Test Parent'}, 1),
        parentID = item.id,
        childItem =  tb.createItem({kind: 'item', 'name': 'Move Test Child'}, parentID),
        outcome1 = tb.canMove(childItem, item),
        item2 =  tb.createItem({kind: 'item', 'name': 'Move Sibling 2'}, 1),
        outcome2 = tb.canMove(item, item2);
    assert.ok(!outcome1, 'Can\'t move parent folder to child folder');
    assert.ok(outcome2, 'Can move sibling folder into sibling');
});
