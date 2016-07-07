var fs = require("fs");

function startScoresHandler(io){
	var fileDir = __dirname+"/scores/scores.txt";

	io.sockets.on("connection", function(socket){
		//Initial Load
		getScores(socket, fileDir, initialLoad);

		//If score is beaten write on file and do an update on all other sockets
		socket.on("new-score", function(data){
			//Save new scores
			saveNewScores(io, data, fileDir);	//<-----Update all other sockets inside saveNewScores function			
		});
	});
}

function saveNewScores(io, data, fileDir){
	//Save scores
	fs.writeFile(fileDir, data, function(err){
		if(err) throw err;
	});

	//Update all other sockets
	updateSockets(io, data);
}


function getScores(socket, fileDir, action){
	fs.readFile(fileDir, function(err, data){
		if(err) throw err;
		action(socket, data+"");
	});
}

function initialLoad(socket, data){
	socket.emit("initial-load", data);
}

function updateSockets(io, data){
	io.sockets.emit("scores-update", data);
}


exports.startScoresHandler = startScoresHandler;