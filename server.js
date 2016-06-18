var express = require("express");
	app = express();

app.use("/", express.static(__dirname+"/public/globalFiles"));

app.get("/", function(req, res){
	res.sendFile(__dirname+"/public/compressed.html");
});

app.listen(process.env.PORT || 3000);