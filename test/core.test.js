var core = require ('../core.js');
var util = require('util');
exports.testRollBack1 = function(test) {
	core.setData({
		frame: 8,
		state: 10,
		storedState: 0,
		storedFrame: 3,
		theirFrame: 8,
		localInput: [0, 1, 2, 3, 4],
		remoteInput: [5, 4, 3, 2 ,1],
		delay: 0
	});

	var expected = {
		frame: 8,
		state: 25,
		storedState: 25,
		storedFrame: 8,
		theirFrame: 8,
		localInput: [0, 1, 2, 3, 4],
		remoteInput: [5, 4, 3, 2 ,1],
		delay: 0
	};


	core.rollBack();
	var result = core.getData();

	test.expect(1);
	test.deepEqual(result, expected, "Clients on Same Frame");


	test.done();
};

exports.testRollBack1Delay = function(test) {
	core.setData({
		frame: 8,
		state: 10,
		storedState: 0,
		storedFrame: 3,
		theirFrame: 8,
		localInput: [0, 1, 0, 1, 2, 3, 4],
		remoteInput: [1, 0, 5, 4, 3, 2 ,1],
		delay: 2
	});

	var expected = {
		frame: 8,
		state: 17,
		storedState: 17,
		storedFrame: 8,
		theirFrame: 8,
		localInput: [0, 1, 0, 1, 2, 3, 4],
		remoteInput: [1, 0, 5, 4, 3, 2 ,1],
		delay: 2
	};


	core.rollBack();
	var result = core.getData();

	test.expect(1);
	test.deepEqual(result, expected, "Clients on Same Frame with Delay");


	test.done();
};

exports.testRollBack2 = function(test) {
	core.setData({
		frame: 5,
		state: 0,
		storedState: 0,
		storedFrame: 0,
		theirFrame: 5,
		localInput: [0, 1, 2, 3, 4],
		remoteInput: [5, 4, 3, 2 ,1],
		delay: 0
	});

	var expected = {
		frame: 5,
		state: 25,
		storedState: 25,
		storedFrame: 5,
		theirFrame: 5,
		localInput: [0, 1, 2, 3, 4],
		remoteInput: [5, 4, 3, 2 ,1],
		delay: 0
	};


	core.rollBack();
	var result = core.getData();

	test.expect(1);
	test.deepEqual(result, expected, "Clients on same frame, max diff from game frame 0");
	test.done();
};

exports.testRollBack2Delay = function(test) {
	core.setData({
		frame: 5,
		state: 0,
		storedState: 0,
		storedFrame: 0,
		theirFrame: 5,
		localInput: [1, 0, 0, 1, 2, 3, 4],
		remoteInput: [0, 1, 5, 4, 3, 2 ,1],
		delay: 2
	});

	var expected = {
		frame: 5,
		state: 17,
		storedState: 17,
		storedFrame: 5,
		theirFrame: 5,
		localInput: [1, 0, 0, 1, 2, 3, 4],
		remoteInput: [0, 1, 5, 4, 3, 2 ,1],
		delay: 2
	};


	core.rollBack();
	var result = core.getData();

	test.expect(1);
	test.deepEqual(result, expected, "Clients on same frame, max diff from game frame 0 with delay");
	test.done();
};

exports.testRollBack3 = function(test) {
	core.setData({
		frame: 5,
		state: 0,
		storedState: 0,
		storedFrame: 3,
		theirFrame: 8,
		localInput: [0, 1, 2, 3, 4],
		remoteInput: [5, 4, 3, 2 ,1],
		delay: 0
	});

	var expected = {
		frame: 5,
		state: 16,
		storedState: 16,
		storedFrame: 5,
		theirFrame: 8,
		localInput: [0, 1, 2, 3, 4],
		remoteInput: [5, 4, 3, 2 ,1],
		delay: 0
	};


	core.rollBack();
	var result = core.getData();

	test.expect(1);
	test.deepEqual(result, expected, "Remote Ahead of Local");
	test.done();
};

exports.testRollBack3Delay = function(test) {
	core.setData({
		frame: 5,
		state: 0,
		storedState: 0,
		storedFrame: 3,
		theirFrame: 8,
		localInput: [0, 1, 2, 3, 4, 1, 0],
		remoteInput: [5, 4, 3, 2 ,1, 0, 1],
		delay: 2
	});

	var expected = {
		frame: 5,
		state: 16,
		storedState: 16,
		storedFrame: 5,
		theirFrame: 8,
		localInput: [0, 1, 2, 3, 4, 1, 0],
		remoteInput: [5, 4, 3, 2 ,1, 0, 1],
		delay: 2
	};


	core.rollBack();
	var result = core.getData();

	test.expect(1);
	test.deepEqual(result, expected, "Remote Ahead of Local");
	test.done();
};

exports.testRollBack4 = function(test) {
	core.setData({
		frame: 8,
		state: 0,
		storedState: 0,
		storedFrame: 3,
		theirFrame: 5,
		localInput: [0, 1, 2, 3, 4],
		remoteInput: [5, 4, 3, 2 ,1],
		delay: 0
	});

	var expected = {
		frame: 8,
		state: 16,
		storedState: 4,
		storedFrame: 5,
		theirFrame: 5,
		localInput: [0, 1, 2, 3, 4],
		remoteInput: [5, 4, 3, 2 ,1],
		delay: 0
	};


	core.rollBack();
	var result = core.getData();

	test.expect(1);
	test.deepEqual(result, expected, "Local Ahead of Remote");
	test.done();
};


exports.testRollBack4Delay = function(test) {
	core.setData({
		frame: 8,
		state: 0,
		storedState: 0,
		storedFrame: 3,
		theirFrame: 5,
		localInput: [0, 1, 2, 3, 4, 1, 0],
		remoteInput: [5, 4, 3, 2 ,1, 0, 1],
		delay: 2
	});

	var expected = {
		frame: 8,
		state: 10,
		storedState: 4,
		storedFrame: 5,
		theirFrame: 5,
		localInput: [0, 1, 2, 3, 4, 1, 0],
		remoteInput: [5, 4, 3, 2 ,1, 0, 1],
		delay: 2
	};


	core.rollBack();
	var result = core.getData();

	test.expect(1);
	test.deepEqual(result, expected, "Local Ahead of Remote");
	test.done();
};
