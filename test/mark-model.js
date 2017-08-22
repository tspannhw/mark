const test = require('tape');
const Mark = require('./../mark.js');

function allInKeys(obj) {
	var keys = [];  for (let p in obj) { keys.push(p); }  // console.log('all in keys', obj, keys);
	return keys;
}
function allOfItems(obj) {
	var keys = [];  for (let p of obj) { keys.push(p); }  // console.log('all of items', obj, keys);
	return keys;
}
// taps deepEqual uses for..in, which does not work for Mark contents
function arrayEqual(array1, array2) {
	return (array1.length == array2.length) && array1.every(function(element, index) {
		return element === array2[index]; 
	});
}

test('Mark Model', function(assert) {
	// properties API
	assert.deepEqual(Object.keys(Mark.parse('{div}')), [], "Mark object {div} keys should be empty");
	assert.deepEqual(Object.keys(Mark.parse('{div class:"test"}')), ['class'], "Mark object {div class:'test'} keys should be ['class']");
	var div = Mark.parse('{div length:12, width:20 "text"}');
	assert.equal(div.length, 12, "length of Mark object should be 12");
	assert.equal(div.properties.length, 12, "length of Mark object properties should be 12");
	assert.equal(div.contents.length, 1, "length of Mark object contents should be 1");
	assert.deepEqual('length' in div.properties, true, "'length' in div.properties");
	assert.looseEqual(Object.keys(div), ['length', 'width'], "Mark object properties keys() should be ['length', 'width']");
	assert.looseEqual(Object.keys(div.properties), ['length', 'width'], "Mark object properties keys() should be ['length', 'width']");
	
	// contents API
	div = Mark.parse('{div class:"test" "text"}');
	assert.deepEqual(Object.keys(div), ['class'], "Mark object {div class:'test' 'text'} keys should be ['class']");
	assert.equal(div.contents[0], "text", "Mark object div contents should be ['text']");
	assert.equal(div.contents.length, 1, "Mark object div contents length should be 1");
	assert.looseEqual(Object.getOwnPropertyNames(div.contents), ["0", "length"], "Mark object div contents properties should be ['0', 'length']");
	div.push(Mark('br'));
	var contents = [];  for (let n of div) { contents.push(n); }  // test for-of loop
	assert.looseEqual(contents, ['text', Mark('br')], "Mark object div contents should be ['text', Mark('br')]");
	var div = Mark.parse('{div length:4 "text"}');
	contents = [];  for (let n of div) { contents.push(n); }  // test for-of loop with overridden length
	assert.looseEqual(contents, ['text'], "Mark object div contents should be ['text']");
	assert.equal(div.contents.length == 1 && div.contents[0] == 'text', true, "Mark object div contents should be ['text']");
	assert.equal(div.contents instanceof Array, true, "Mark object div contents instanceof Array should be true");
	assert.equal(Array.isArray(div.contents), true, "Mark object div contents isArray() should be true");
	assert.equal(JSON.stringify(div.contents), '["text"]', "Mark object div contents should be ['text']");
	allInKeys(div.contents);  allOfItems(div.contents);
	assert.equal(arrayEqual(div.contents, ["text"]), true, "Mark object div contents should be ['text']");
	assert.comment("Object.keys(div.contents): "+ JSON.stringify(Object.keys(div.contents)) +" is empty");

	// push API
	assert.equal(Mark.parse('{div}').push("text"), 1, "push text into Mark object");
	var div = Mark.parse('{div}');  
	assert.equal(div.length, 0, "length should be 0 before push");
	div.push(Mark.parse('{br}'));
	assert.equal(Mark.stringify(div), "{div {br}}", "push {br} into Mark object {div}");
	assert.equal(div.length, 1, "length should be 1 after push");
	assert.deepEqual(Object.keys(div), [], "length should not be enumerable after push");
	div.push(Mark('p'), Mark('hr'));
	assert.equal(Mark.stringify(div), "{div {br} {p} {hr}}", "push {p} {hr} into Mark object {div}");
	div.push(); // empty push 
	assert.equal(Mark.stringify(div), "{div {br} {p} {hr}}", "push {p} {hr} into Mark object {div}");
	
	// pop API
	div = Mark.parse('{div "text" {br}}');  var item = div.pop();
	assert.equal(Mark.stringify(item), '{br}', "popped item from Mark object should be {br}");
	assert.equal(Mark.stringify(div), '{div "text"}', "pop from Mark object");
	assert.equal(div.length, 1, "length should be 1 after pop");
	assert.deepEqual(Object.keys(div), [], "length should not be enumerable after pop");
	div.pop();  item = div.pop();
	assert.equal(item, undefined, "undefiend after pop");
	
	assert.end();	
});

test('Mark shift() API', function(assert) {
	var div = Mark.parse('{div "text" {br}}');  var item = div.shift();
	assert.equal(item, 'text', "shift from Mark object");
	assert.equal(div.length, 1, "length should be 1 after shift");
	assert.equal(Mark.stringify(div), '{div {br}}', "shift from Mark object");
	assert.deepEqual(Object.keys(div), [], "length should not be enumerable after shift");
	div.shift();  item = div.shift();
	assert.equal(item, undefined, "undefiend after shift");	
	assert.end();
});

test('Mark unshift() API', function(assert) {
	var div = Mark.parse('{div "text"}');  var len = div.unshift(Mark('br'), Mark('p'));
	assert.equal(len, 3, "length after unshift should be 3");
	assert.equal(Mark.stringify(div), '{div {br} {p} "text"}', "unshift to Mark object");
	assert.deepEqual(Object.keys(div), [], "length should not be enumerable after unshift");
	div.unshift();  // unshift push 
	assert.equal(Mark.stringify(div), '{div {br} {p} "text"}', "unshift to Mark object");
	assert.end();	
});

test('Mark operation', function(assert) {
	var div = Mark.parse('{div "text"}');
	div[0] = Mark('br');
	assert.equal(Mark.stringify(div), '{div {br}}', "Set Mark content");
	assert.looseEqual(allInKeys(div), [], "Set Mark content");
	assert.end();	
});