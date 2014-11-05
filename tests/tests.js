QUnit.config.setTimeout = 30000;
QUnit.config.reorder = false;

//**************************//
QUnit.module( "Load Related Tests" );

    QUnit.test('Treebeard is loaded', function(assert) {
        assert.ok(typeof tb === 'object', 'Treebeard is loaded as an object');
    });

    QUnit.test('Treebeard has options', function(assert) {
        var result = $.isPlainObject(tb.options);
        assert.ok(result, 'Treebeard has default options');
    });



QUnit.module( "Build Related Tests" );

    QUnit.test('flatData is array', function(assert) {
        var result = $.isArray(tb.flatData);
        assert.ok(result, 'Treebeard flatData is an Array');
    });

    QUnit.test('TreeData is object', function(assert) {
        var result = $.type(tb.treeData);
        assert.equal(result, 'object', 'Treebeard treeData is an Object');
    });

    QUnit.test('BuildTree works with array data', function(assert) {
        var parent = tb.createItem({'kind': 'folder', 'name': "Testing BuildTree"}, 1),
        data = [
            { kind : 'folder', name : "Child1", children : []  },
            { kind : 'item', name : "Child2", children : []  },
            { kind : 'folder', name : "Child3", children : []  },
            { kind : 'folder', name : "Child4", children : []  }
        ],
        treeData = tb.buildTree(data, parent),
        children = treeData.children.length;
        assert.equal(children, 4, 'Buildtree correctly created tree structure from array data.');
    });

    QUnit.test('BuildTree works with object data', function(assert) {
        var parent = tb.createItem({'kind': 'folder', 'name': "Testing BuildTree"}, 1),
        data = { kind : 'folder', name : 'data root', children :  [
            { kind : 'folder', name : "Child1", children : []  },
            { kind : 'item', name : "Child2", children : []  },
            { kind : 'folder', name : "Child3", children : []  },
            { kind : 'folder', name : "Child4", children : []  }
        ] },
        treeData = tb.buildTree(data, parent),
        children = treeData.children.length;
        assert.equal(children, 4, 'Buildtree correctly created tree structure from object data.');
    });

    QUnit.test('Flatten returns flat array', function(assert) {
        var parent = tb.createItem({'kind': 'folder', 'name': "Testing Flatten"}, 1);
        var parent = tb.createItem({'kind': 'folder', 'name': "Testing BuildTree"}, 1),
            data = { kind : 'folder', title : 'data root', children :  [
                { kind : 'folder', title : "Child1", children : []  },
                { kind : 'item', title : "Child2", children : []  },
                { kind : 'folder', title : "Child3", children : []  },
                { kind : 'folder', title : "Child4", children : []  }
            ] },
            treeData = tb.buildTree(data, parent);
        tb.flatten(treeData.children, 0);
        var flatcount = tb.flatData.length;
        assert.equal(flatcount, 4, 'Flatten returns flat array.');
    });

//**************************//
QUnit.module( "Treebeard API tests" );

    QUnit.test('createItem() works', function (assert) {
        var expected = 'Test',
            item = tb.createItem({'kind': 'folder', 'name': expected}, 1);
        assert.equal(item.data.name, expected, 'Looked for : "' + expected + '" found: "' + item.data.name + '"');
    });

    QUnit.test('find() works', function (assert) {
        var expected = 'Testing find',
            item = tb.createItem({'kind': 'folder', 'name': expected}, 1),
            foundItem = tb.find(item.id);
        assert.equal(foundItem.data.name, expected, 'Looked for : "' + expected + '" found: "' + foundItem.data.name + '"');
    });

    QUnit.test('deleteNode() works', function (assert) {
        var item = tb.createItem({'kind': 'folder', 'name': 'Delete Test Parent'}, 1),
            parentID = item.id,
            childItem =  tb.createItem({'kind': 'item', 'name': 'Delete Test Child'}, parentID);
        tb.deleteNode(parentID, childItem.id);
        assert.equal(item.children.length, 0, 'Child item deleted.');
    });

    QUnit.test('canMove() works', function (assert) {
        var item = tb.createItem({'kind': 'folder', 'name': 'Move Test Parent'}, 1),
            parentID = item.id,
            childItem =  tb.createItem({'kind': 'item', 'name': 'Move Test Child'}, parentID),
            outcome1 = tb.canMove(childItem, item),
            item2 =  tb.createItem({'kind': 'item', 'name': 'Move Sibling 2'}, 1),
            outcome2 = tb.canMove(item, item2);
        assert.ok(!outcome1, 'Can\'t move parent folder to child folder');
        assert.ok(outcome2, 'Can move sibling folder into sibling');
    });

    QUnit.test('returnIndex() works', function (assert) {
        var item = tb.createItem({'kind': 'folder', 'name': 'ReturnIndex Check'}, 1);
        var expected = 1;
        var returned = tb.returnIndex(item.id)
        assert.equal(returned, expected, 'returnIndex returns correct index number');
    });


//**************************//
QUnit.module( "ITEM API Tests" );

    QUnit.test('ITEM Constructor ', function (assert) {
        var item = tb.createItem({'kind': 'folder', 'name': 'Item API test folder'}, 1);
        assert.equal(item.kind, 'folder', 'Item constructor built the correct kind information and Added to parent');
    });

    QUnit.test('ITEM Move ', function (assert) {
        var item = tb.createItem({ 'kind': 'folder', 'name': 'Item API test folder'}, 1);
        var childItem =  tb.createItem({'kind': 'item', 'name': 'Item API test child'}, item.id);
        childItem.move(1);
        var topLevel = tb.find(1);
        var movedItem = topLevel.child(childItem.id);
        assert.equal(movedItem.data.name,'Item API test child', 'Moved item moved to the correct place');
    });

    QUnit.test('ITEM Find ', function (assert) {
        var item = tb.createItem({'kind': 'folder', 'name': 'Item API test folder'}, 1);
        var foundItem = tb.find(item.id);
        assert.equal(foundItem.data.name, 'Item API test folder', 'Finding item by id works');

    });

    QUnit.test('ITEM find child by ID', function (assert) {
        var item = tb.createItem({'kind': 'folder', 'name': 'Item API test folder'}, 1);
        var childItem =  tb.createItem({'kind': 'item', 'name': 'Item API test child'}, item.id);
        var foundItem = item.child(childItem.id);
        assert.equal(foundItem.data.name,'Item API test child', 'Item child found with child()');
    });

    QUnit.test('ITEM Prev, next, parent find ', function (assert) {
        var item = tb.createItem({'kind': 'folder', 'name': 'Item API test folder'}, 1);
        var child1 =  tb.createItem({'kind': 'item', 'name': 'Child1'}, item.id),
            child2 =  tb.createItem({'kind': 'item', 'name': 'Child2'}, item.id),
            next = child1.prev(),
            prev = child2.next(),
            parent = child1.parent();
        assert.equal(next.data.name, 'Child2', 'Finds next() item correctly.');
        assert.equal(prev.data.name, 'Child1', 'Finds prev() item correctly.');
        assert.equal(parent.data.name, 'Item API test folder', 'Finds parent() item correctly.');
    });

    QUnit.test('ITEM is ancestor', function (assert) {
        var item = tb.createItem({'kind': 'folder', 'name': 'Item API test folder'}, 1),
            child =  tb.createItem({'kind': 'item', 'name': 'Child1'}, item.id),
            isAncestor = item.isAncestor(child);
        assert.ok(isAncestor, 'Check for isAncestor returns correctly')
    });

    QUnit.test('ITEM is descendant', function (assert) {
        var item = tb.createItem({'kind': 'folder', 'name': 'Item API test folder'}, 1),
            child =  tb.createItem({'kind': 'item', 'name': 'Child1'}, item.id),
            idDescendant = child.isDescendant(item);
        assert.ok(idDescendant, 'Check for isDescendant returns correctly');
    });

//**************************//
QUnit.module( "Filter testing" );