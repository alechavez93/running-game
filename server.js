var express = require("express"),
	app = express(),
	server = require("http").createServer(app),
	io = require("socket.io").listen(server),
	port = process.env.PORT || 3000;

//Sections modules for app
score = require("./scoresHandler");

//Server listening to standard port or 3000
server.listen(port);


app.use("/", express.static(__dirname+"/public/globalFiles"));
app.get("/", function(req, res){
	res.sendFile(__dirname+"/public/compressed.html");
});


//Start the scores handler
score.startScoresHandler(io);