var gameRunning = false;
var canvas = document.getElementById("gameCanvas")
var ctx = canvas.getContext("2d");
var ground = document.getElementById("ground");
var background = document.getElementById("background");
var userName;
var scoresTable = document.getElementsByClassName("score");
var socket = new io.connect();



//Variables
var reachedTop = false;
var score = 0;
var smallSeparation = 10;
var distance = 140;
var change = 80;
var deltaX = 0;
var deltaB = 0;
var globalTime = 0;
var globalSpeed = 4;
var p = new person(20, 120);
var topScores;

//Objects
var o1 = new obstacle(2 , 1); //Single
var o2 = new obstacle(1 , 1); //Single small
var o3 = new obstacle(2 , 2); //Double
var b = new bird();


//EventListeners
var start = document.getElementById("start");
var submit = document.getElementById("submit");
start.addEventListener("click", initializeGame);
submit.addEventListener("click", pushList);



//Gets input
$(document).ready(function(){
	$('html').on('touchstart', function(){
		if(p.running)
			initializeJump();
	});

	$(document).keydown(function(e){
		if(e.keyCode == 38){	
			initializeJump();
		}
	});
});


//Hides the inputs until needed
$(document).ready(function(){
	$('#submit').slideUp(0);
	$('#name').slideUp(0);
	updateTopScores();
});


//Prevents whitespace on the input name
$("input#name").on({
  keydown: function(e) {
    if (e.which === 32)
      return false;
  },
  change: function() {
    this.value = this.value.replace(/\s/g, "");
  }
});




//Main
//-------------------------------------------------------------------------



var s = setInterval(game, 15);
// var u = setInterval(updateTopScores, 2000);



//Main functions------------------------------------------------------------
function loadScores(data){
	topScores = data.split(" ");
	//Load our table in the html document
	for(var i=0; i<scoresTable.length; i++){
		scoresTable[i].innerHTML = topScores[i];
	}
}


//Updates the topScores table
function updateTopScores(){
 	socket.on("scores-update", loadScores);
 	socket.on("initial-load", loadScores);	
}


//Save new values in text
function saveNewScores(screen){
	var myData = "";
	for(var i=0; i<topScores.length; i++){
		myData += topScores[i] + " ";
	}
	socket.emit("new-score", myData);
}



//Puts new username on the top10 list
function pushList(){

	//get name
	name = $('#name').val();

	if(name == ""){
		console.log("This noob did't put his/her name, lol!");
	}
	else{
		//Update and check again
		updateTopScores();
		var place = checkScore();
		console.log(place);

		//Update the Scores array
		score--;
		modifyScores(place, name, score);

		//Save the new scores on the file
		saveNewScores(clearScreen());
	}
	
	//Restore the input tag
	$('#name').val('');
	//Restore reachedTop
	reachedTop = true;
	hideInput();
}


//NEEDS MORE DOCUMENTATION!
//Modifies the scores
function modifyScores(place, name, score){

	for(var i=29; i>=0; i--){
		if(i>=(place+1)*3 && i%3 != 0){
			topScores[i] = topScores[i-3];
		}
	}

	topScores[(place-1)*3] = place;
	topScores[(place-1)*3+1] = name;
	topScores[(place-1)*3+2] = score;
}


//NEEDS MORE DOCUMENTATION!
//Returns the place of the player after a succesfull score
function checkScore(){
	if(topScores != null){
		for(var i=2; i<topScores.length; i += 3){
			if(score >= topScores[i])
				return topScores[i-2];
		}
	}
	return 20;
}



//Runs all parts of the game
function game(){
	if(gameRunning){
		updateCanvas();
		drawCanvas();
		drawScore();
		checkCollision(o1);
		checkCollision(o2);
		checkCollision(o3);
		checkCollision(b);
	}
	else if(!reachedTop && score!=0){
		if(checkScore() != 20){
			if(checkScore() != ''){
				showInput();
			}	
		}
	}	
}

//Initializes the jump sequence
function initializeJump(){
	if(p.running && gameRunning){
		p.running = false;
		p.jumping = true;
	}
}


//Starts game
function initializeGame(){
	hideInput();
	reachedTop = false;
	gameRunning = true;
	globalSpeed = 0;
	score = 0;
	var smallSeparation = 10;
	distance = 140;
	change = 80;
	deltaX = 0;
	deltaB = 0;
	globalTime = 0;
	globalSpeed = 4;
	p = new person(20, 120);
	o1 = new obstacle(2 , 1); //Single
	o2 = new obstacle(1 , 1); //Single small
	o3 = new obstacle(2 , 2); //Double
	b = new bird();
}


//Erases canvas for new Frame
function clearCanvas(){
	ctx.clearRect(0,0, canvas.width, canvas.height);
}


//Update all elements in the canvas
function updateCanvas(){
	UPdifficulty();
	if(p.jumping){
		p.updateJumpY();
	}
	if(o1.x > -200){
		o1.updateX();
	}
	if(o2.x > -200){
		o2.updateX();
	}
	if(o3.x > -200){
		o3.updateX();
	}
	if(b.x > -200){
		b.updateX();
	}
}


//Controls the difficulty depending on score
function UPdifficulty(){
	if(0 <= score && score < 1250){
		globalSpeed = 4;
	}
	else if(1250 <= score && score < 2500){
		globalSpeed = 5;
	}
	else if(2500 <= score && score < 4000){
		globalSpeed = 6;
	}
	else if(4000 <= score && score < 6000){
		globalSpeed = 7;
	}
	else{
		distance = 135;
		smallSeparation = 13;
		globalSpeed = 8;
	}
}


//Draws all elements of the canvas
function drawCanvas(){
	clearCanvas();
	drawBackground();
	drawGround();
	p.drawE();
	drawObstacles();
	globalTime += 15;
}



//Draws the score based on distance
function drawScore(){
	ctx.font="12px Orbitron";
	ctx.fillText("Score: "+score,500,20);
	score = globalTime/15;
}


//Draws and updates the ground
function drawGround(){
	if(deltaX >= 595)
		deltaX = 0;
	ctx.drawImage(ground, deltaX, 0, 600, 40, 0, 170, 600, 40);
	deltaX += globalSpeed;
}


//Draws and updates the background
function drawBackground(){
	if(deltaB == 2399)
		deltaB = 0;
	ctx.drawImage(background, deltaB, 0, 1200, 400, 0, 0, 600, 200);
	deltaB += 1;
}


//Draws obstacles at random
//(0.5)x(0.09)=0.045 change of block and (0.5)x(0.03)=0.02 chance of bird every 15ms
var kind;
function drawObstacles(){
	kind = parseInt(Math.random()*10)%2;
	if(kind==0){ 	//Throw an obstacle
		kind = parseInt(Math.random()*100);
		if((kind == 10 || kind == 47 || kind == 31 || kind == 94) && o1.x < -150 && check(o1)){
			o1.x = canvas.width;
		}
		if((kind == 3 || kind == 54 || kind == 82) && o2.x < -150 && check(o2)){
			o2.x = canvas.width;
		}
		if((kind == 19  || kind == 61) && o3.x < -150 && check(o3)){
			o3.x = canvas.width;
		}
	}
	if(kind==1 && b.x < -150){		//Throw a bird
		kind = parseInt(Math.random()*100);
		if((kind == 6 || kind == 73 || kind == 39) && check(b)){
			b.x = canvas.width;
		}	
	}
	o1.drawO();
	o2.drawO();
	o3.drawO();
	b.drawB();
}



//Checks if the element is at a safe distance from last element placed
var c;
function check(object){
	c = true;
	if(!Object.is(object, o1)){
		if(!checkDistance(object, o1)){
			c = false;
		}
	}
	if(!Object.is(object, o2)){
		if(!checkDistance(object, o2)){
			c = false;
		}
	}
	if(!Object.is(object, o3)){
		if(!checkDistance(object, o3)){
			c = false;
		}
	}
	if(!Object.is(object, b)){
		if(!checkDistance(object, b)){
			c = false;
		}
	}
	return c;
}



//Checks individual distance (see check function)
function checkDistance(inserted,object){
	if(Object.is(object, b) && (600 - object.x > (distance + change))){
		return true;
	}
	if(Object.is(object, o2) && !(Object.is(inserted, b)) && (600 - object.x > (distance - smallSeparation))){
		// if(Object.is(inserted, b)){
		// 	if((600 - object.x) > (distance - (smallSeparation-5)))
		// 		return true;
		// }
		// else
			return true;
	}
	else if(600 - object.x > (distance + change)){
		return true;
	}
	else return false;
}



//Checks collision between person and all obstacles dependig on the frame
var x,y,height,width;
function checkCollision(obs){
	if(p.currFrame == 0 || p.currFrame == 1 || p.currFrame == 6){
		x = p.x; width = p.width - 4; y = p.y + 10; height = p.height;
		return checkSingleCollision(x,y,height,width,obs);
	}

	//JUMPING DOWN FRAME
	else if(p.currFrame == 2){
		if(p.running){
			x = p.x; width = p.width - 4; y = p.y; height = p.height;
			return checkSingleCollision(x,y,height,width,obs);
		}
		else{
			if(Object.is(b, obs)){
				x = p.x + 4; width = p.width - 8; y = p.y + 10; height = p.height;
				return checkSingleCollision(x,y,height,width,obs);
			}
			else{
				x = p.x + 16; width = p.width - 24; y = p.y; height = p.height - 4;
				return checkSingleCollision(x,y,height,width,obs);
			}
		}
	}
	
	else if(p.currFrame == 3){
		x = p.x; width = p.width - 4; y = p.y + 10; height = p.height;
		return checkSingleCollision(x,y,height,width,obs);
	}

	//JUMPING UP FRAME
	else if(p.currFrame == 4){
		if(p.running){
			x = p.x; width = p.width - 10; y = p.y; height = p.height;
			return checkSingleCollision(x,y,height,width,obs);
		}
		else{
			if(Object.is(b, obs)){
				x = p.x + 25; width = p.width - 25; y = p.y + 10; height = p.height + 20;
				return checkSingleCollision(x,y,height,width,obs);
			}
			else{
				if(p.y < 65 && !Object.is(obs, o2)){
					return true;
				}
				else if(p.y < 95 && Object.is(obs, o2)){
					return true;
				}
				else{
					x = p.x; width = p.width - 14; y = p.y; height = p.height;
					return checkSingleCollision(x,y,height,width,obs);
				}
			}
		}
	}

	else if(p.currFrame == 5){
		x = p.x; width = p.width - 4; y = p.y + 10; height = p.height;
		return checkSingleCollision(x,y,height,width,obs);
	}
}



//Checks collision by coordinate
function checkSingleCollision(x,y,height,width,obs){
	if(Object.is(obs, b)){
		if(/*Horizontal collision*/(x <= (obs.x + 15) + (obs.width-20) && x + width >= (obs.x + 15))
		&& /*Vertical collision*/(y <= (obs.y - 7) + obs.height && y + height >= (obs.y-7))){
			gameRunning = false;
		}
		else return true;
	}
	else{
		if(/*Horizontal collision*/(x <= obs.x + obs.width && x + width >= obs.x)
		&& /*Vertical collision*/(y <= obs.y + obs.height && y + height >= obs.y)){
		gameRunning = false;
	}
	else return true;
	}
	
}


//Hides input field and submit button
function hideInput(){
	$('#submit').slideUp();
	$('#name').slideUp();
}


//Shows input field and submit button
function showInput(){
	$('#submit').slideDown();
	$('#name').slideDown();
	reachedTop = true;
}

function clearScreen(){
	var screen = "";
	for(var i=0; i<topScores.length; i++){
		screen += topScores[i] + " ";
	}
	return (screen.length * 12.5);
}





//Class for person----------------------------------------------------------------------------------------
function person(x,y){
	//Private fields
	this.x = x;
	this.y = y;
	this.ground = y;
	this.t = 0;
	this.width = 43,
	this.height = 51;
	this.running = true;
	this.jumping = false;
	this.currFrame = 0;
	this.element = document.getElementsByClassName("runningAnimation");
	this.velocity = 25;
	this.gravity = 1.4;
	this.initialVelocity = this.velocity;


	//Updates the time from last time the function ran
	this.updateT = function(){
		if(this.running){
			this.gravity = 1.4+((globalSpeed-4)*0.05);
			this.velocity = 25 +((globalSpeed-4)*2);
		}
		this.t += 15; 		 
	}

	
	//Public jump function
	var wayUp = true;
	var first = true;
	this.updateJumpY = function(){
		if(this.t%30 == 0 || first){
			first =  false;
			//The person is jumping up
			if(this.jumping && (wayUp)){
				//If we get to the top update status
				if(this.velocity < 1){		
					wayUp = false;
				}
				else{
					//Decrease y position
					this.y -= this.velocity;
					this.velocity /= this.gravity;	
				}
					
			}//The person is on the way down
			else if(this.jumping && !wayUp){
				//Initial case velocity is less than 1
				if(this.velocity < 1 && y <= this.ground)
					this.velocity = 1;

				//Normal way down motion
				this.y += this.velocity;
				this.velocity *= this.gravity;
				//Checking for the ending of the jump
				if(this.y > this.ground){	
					//RESET EVERYTHING
					this.jumping = false;
					this.running = true;
					this.velocity = this.initialVelocity;
					wayUp = true;
					this.y = this.ground;
					first = true;
				}	
			}
	}
	}

	//Updates the frame number
	this.updateFrame = function(){
		if(this.running){
			if(this.currFrame == 6)
				this.currFrame = 0;
			else if(this.t%60 == 0)
				this.currFrame++;
		}
		else if(this.jumping){
			if(!wayUp)
				this.currFrame = 2;
			else 
				this.currFrame = 4;
		}
	}

	//Function to draw the elemet
	this.drawE = function(){
		if(globalSpeed > 5 && this.currFrame == 5){
			this.currFrame = 0;
		}
		ctx.drawImage(this.element[this.currFrame], this.x, this.y, this.width, this.height);
		this.updateFrame();
		this.updateT();
	}
}




//Class for obstacle----------------------------------------------------------------------------------------
function obstacle(h , n){
	this.height = 30*h;
	this.width = 30*n;
	this.x = -200;
	this.y = 110;
	this.element = document.getElementsByClassName("obstacle");
	this.index = h-1;

	if(h == 1){
		this.y+=30;
	}
	if(n == 2){
		this.index = 2;
	}

	//Updates coordinates
	this.updateX = function(){
		this.x -= globalSpeed;
	}

	//Draws the obstacle
	this.drawO = function(){
		ctx.drawImage(this.element[this.index],this.x, this.y, this.width, this.height);
	}
}


//Class for bird-------------------------------------------------------------------------------------------
function bird(){
	this.height = 47;
	this.width = 50;
	this.x = -200;
	this.y = 55;
	this.t = 0;
	this.currFrame = 0;
	this.element = document.getElementsByClassName("birdAnimation");

	//Updates the coordinates
	this.updateX = function(){
		this.x -= globalSpeed + 1;
	}

	//Update time
	this.updateT = function(){
		this.t += 15; 
	}

	//Update frame
	this.updateFrame = function(){
		if(this.currFrame == 3)
				this.currFrame = 0;
		else if(this.t%180 == 0)
			this.currFrame++;
	}

	//Draws the bird frame by frame
	this.drawB = function(){
		ctx.drawImage(this.element[this.currFrame], this.x, this.y, this.width, this.height);
		this.updateFrame();
		this.updateT();
	}
}