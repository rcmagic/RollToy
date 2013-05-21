var dgram = require("dgram");
var server = dgram.createSocket("udp4");


var frame = 0;

// The only state for now that will test is a simple integer
var state = 0;
var storedState = 0;

var theirFrame = 0;
var storedFrame = 0;
var canAdvance = true;
var port = 8080;
var remoteClient;
var delay = 0;


// The number of frames we can advance before we wait for the remote client's state
var maxDiff = 5;

// Keep track of the local client and remote client's input.  
// We send a buffer of inputs, so each client can play catchup if either gets more than 1 frame behind the other.
var remoteInput = new Array(maxDiff+delay); //new Buffer(maxDiff);
var localInput = new Array(maxDiff+delay); //new Buffer(maxDiff);
for(var i=0; i<maxDiff+delay; i++) localInput[i] = 0;

// Transition into the next state
function advance(p1Input, p2Input) {
	// console.log(p1Input + ', ' + p2Input);
	frame += 1;

	// Simple deterministic state transition
	state += p1Input + p2Input;


}

function updateInput() {
	localInput.shift();
	// Inputs are a random number in the range [0,255]
	localInput.push(Math.floor(Math.random()*256));
}

function storeState() {
	storedFrame = frame;
    storedState = state;
}

function restoreState() {
	frame = storedFrame;
    state = storedState;
}

function sendState() {
	if(!remoteClient) return;
	var buf = new Buffer(5+maxDiff+delay);
	buf[0] = 0x72; // r

	buf.writeUInt32BE(frame, 1);
	for(var i=0; i<maxDiff+delay; i++) {
		buf.writeUInt8(localInput[i],5+i);
	}
	server.send(buf, 0, buf.length, remoteClient.port, remoteClient.address, function(err, bytes) {
		if(err) { 
			"An error occured: " + err; 
			server.close(); 
		}
	});
}

// Rerun inputs from the remote client and local client since the last synced state
// Note: This function is only defined for frame-storedFrame <= maxDiff and theirFrame-storedFrame <= maxDiff
function rollBack() {
	// Determine the number of frames we can advance forward and maintain a synced state
	var frameCount = Math.min(frame, theirFrame)-storedFrame;
	var rollbackFrame = frame;

	// return to previous synced state
	restoreState();

	// Advance forward using the remote and local input, resulting in a synced state
	for(var i = 0; i < frameCount; i++) {
		var offset = maxDiff-(rollbackFrame-storedFrame)+i;
		var theirOffset = maxDiff-(theirFrame-storedFrame)+i;
		advance(localInput[offset], remoteInput[theirOffset]);
	}

	// Store the last synced state
	storeState();

	var leftFrames = rollbackFrame - frame;
	// advance back to the future
	for(var i = 0; i < leftFrames; i++) {
		// Holding the last input from the remote client.
		advance(localInput[maxDiff-leftFrames+i-delay], remoteInput[maxDiff-1]);
	}

	// console.log("Sending State: " + frame);
	sendState();
}
exports.rollBack = rollBack;

console.log("Starting timer");


// Begin calling the game's advance() method to update state on a fixed interval
function beginUpdates() {
	// Set callback for every 2 seconds
	setInterval(function() {
		// Do not want to move too far forward, or roll backs will become very sudden.
		if(canAdvance) {
			updateInput();
			// TODO: repeat the last from of remote input, or use remote input if available
			advance(localInput[maxDiff-1-delay], 0);
			console.log("Frame Advance: " + frame);
			sendState();
		}

		if(frame - storedFrame >= maxDiff) {
			canAdvance = false;
		}
	}, 2000);	
}

// Server stuff
exports.createServer = function () {

	server.on("message", function(msg, rinfo) {
		//console.log("server got:" + msg + " from " + rinfo.address + ":" + rinfo.port);
		if(msg == "connect") {
			console.log("A remote client connected.");
			remoteClient = rinfo;

			var message = new Buffer("confirmed");
			server.send(message, 0, message.length, remoteClient.port, remoteClient.address, function(err, bytes) {
				if(err) { 
					"An error occured: " + err; 
					server.close(); 
				}
			});
			beginUpdates();

		} else {
			handleMessage(msg);
		}
	});

	server.on("listening", function() {
		var address = server.address();
		console.log("server listening" + address.address + ":" + address.port);
	});

	server.bind(port);
}

// Client stuff
exports.createClient = function () {
	var message = new Buffer("connect");
	server.send(message, 0, message.length, port, "localhost", function(err, bytes){
		if(err) {
			console.log("An error occured: " + err);
			server.close();
		}
	});

	server.on("message", function(msg, rinfo) {
		//console.log("client got " + msg + " from " + rinfo.address + ":" + rinfo.port);
		if(msg == "confirmed") {
			console.log("Server confirmed connection");
			remoteClient = rinfo;
			beginUpdates();
		} else {
			handleMessage(msg);
		}
	});
}

function handleMessage(msg) {
	if(msg.length == 5+maxDiff && msg[0] == 0x72) {
		theirFrame = msg.readUInt32BE(1);
		var bufString = "Received: " + theirFrame + ': [';
		for(var i = 0; i < maxDiff; i++) {
			bufString += msg.readUInt8(5+i) + ' ';
			remoteInput[i] = msg.readUInt8(5+i);
		}
		bufString += ']';
		console.log(bufString);
		if(theirFrame > storedFrame) {
			console.log("Rollback! to " + storedFrame);
			rollBack();
		}
	}
}

exports.setFrame = function(pFrame) {
	frame = pFrame;
}

// Function for setting up private state for testing
exports.setData = function(stateInfo) {
	frame = stateInfo.frame;
	state = stateInfo.state;
	storedState = stateInfo.storedState;
	theirFrame = stateInfo.theirFrame;
	storedFrame = stateInfo.storedFrame;
	localInput = stateInfo.localInput;
	remoteInput = stateInfo.remoteInput;
	delay = stateInfo.delay;
}

exports.getData = function() {
	return {
		frame: frame,
		state: state,
		storedState: storedState,
		storedFrame: storedFrame,
		theirFrame: theirFrame,
		localInput: localInput,
		remoteInput: remoteInput,
		delay: delay
	};
}
