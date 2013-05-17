var dgram = require("dgram");
var server = dgram.createSocket("udp4");


var frame = 0;
var theirFrame = 0;
var storedFrame = 0;
var canAdvance = true;
var port = 8080;
var remoteClient;

// The number of frames we can advance before we wait for the remote client's state
var maxDiff = 5;
function advance(frameCount) {
	frame += frameCount;
}

function storeState() {
	storedFrame = frame;
}

function restoreState() {
	frame = storedFrame;
}

function sendState() {
	if(!remoteClient) return;
	var buf = new Buffer(5);
	buf[0] = 0x72; // r

	buf.writeUInt32BE(frame, 1);
	server.send(buf, 0, buf.length, remoteClient.port, remoteClient.address, function(err, bytes) {
		if(err) { 
			"An error occured: " + err; 
			server.close(); 
		}
	});
}

function rollBack() {
	// determine how many frames to advance forward
	var frameCount = Math.min(frame, theirFrame)-storedFrame;
	var rollbackFrame = frame;
	// return to previous state
	restoreState();
	// advance up to the remote client's frame or if great than our last frame to that.
	advance(frameCount);
	storeState();

	// advance back to where we were
	advance(rollbackFrame-frame);

	console.log("Sending State: " + frame);

	sendState();
}

console.log("Starting timer");

// Set callback for every 2 seconds
setInterval(function() {
	// Do not want to move too far forward, or roll backs will become very sudden.
	if(canAdvance) {
		frame += 1;
		console.log("Frame Advance: " + frame);
		sendState();
	}

	if(frame - storedFrame >= maxDiff) {
		canAdvance = false;
	}
}, 2000);

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

		} else if(msg.length == 5 && msg[0] == 0x72) {
			theirFrame = msg.readUInt32BE(1);
			console.log("Got frame: " + theirFrame);
			if(theirFrame > storedFrame) {
				console.log("Rollback! to " + storedFrame);
				rollBack();
			}
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
		} else if(msg.length == 5 && msg[0] == 0x72) {
			theirFrame = msg.readUInt32BE(1);
			console.log("Got frame: " + theirFrame);
			if(theirFrame > storedFrame) {
				console.log("Rollback! to " + storedFrame);
				rollBack();
			}
		}
	});
}


