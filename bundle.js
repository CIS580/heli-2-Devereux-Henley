(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

/* Classes */
const Game = require('./game');
const Vector = require('./vector');
const BulletPool = require('./bullet_pool');

/* Global variables */
var canvas = document.getElementById('screen');
var game = new Game(canvas, update, render);
var player = {
	angle: 0,
	position: {x: 200, y: 200},
	velocity: {x: 0, y: 0},
	img: new Image()
}
player.img.src = 'assets/helicopter.png';
var backgrounds = [
	new Image(),
	new Image(),
	new Image()
];
backgrounds[0].src = 'assets/foreground.png';
backgrounds[1].src = 'assets/midground.png';
backgrounds[2].src = 'assets/background.png';
var input = {
	up: false,
	down: false,
	left: false,
	right: false
}
var camera = {
	xMin: 100,
	xMax: 500,
	xOff: 100,
	x: 0,
	y: 0
}
var reticule = {
	x: 0,
	y: 0
}
var bullets = new BulletPool(10);

	/**
	 * @function onmousemove
	 * Handles mouse move events
	 */
window.onmousemove = function(event) {
	event.preventDefault();
	reticule.x = event.offsetX;
	reticule.y = event.offsetY;
}

	/**
	 * @function onmousedown
	 * Handles mouse left-click events
	 */
window.onmousedown = function(event) {
	event.preventDefault();
	reticule.x = event.offsetX;
	reticule.y = event.offsetY;
	// TODO: Fire bullet in direction of the retciule

	bullets.add(player.position, {x: 1, y: 0});
}

	/**
	 * @function oncontextmenu
	 * Handles mouse right-click events
	 */
window.oncontextmenu = function(event) {
	event.preventDefault();
	reticule.x = event.offsetX;
	reticule.y = event.offsetY;
	// TODO: Fire missile
}

	/**
	 * @function onkeydown
	 * Handles keydown events
	 */
window.onkeydown = function(event) {
	switch(event.key) {
		case "ArrowUp":
		case "w":
			input.up = true;
			event.preventDefault();
			break;
		case "ArrowDown":
		case "s":
			input.down = true;
			event.preventDefault();
			break;
		case "ArrowLeft":
		case "a":
			input.left = true;
			event.preventDefault();
			break;
		case "ArrowRight":
		case "d":
			input.right = true;
			event.preventDefault();
			break;
	}
}

	/**
	 * @function onkeyup
	 * Handles keydown events
	 */
window.onkeyup = function(event) {
	switch(event.key) {
		case "ArrowUp":
		case "w":
			input.up = false;
			event.preventDefault();
			break;
		case "ArrowDown":
		case "s":
			input.down = false;
			event.preventDefault();
			break;
		case "ArrowLeft":
		case "a":
			input.left = false;
			event.preventDefault();
			break;
		case "ArrowRight":
		case "d":
			input.right = false;
			event.preventDefault();
			break;
	}
}

	/**
	 * @function masterLoop
	 * Advances the game in sync with the refresh rate of the screen
	 * @param {DOMHighResTimeStamp} timestamp the current time
	 */
var masterLoop = function(timestamp) {
	game.loop(timestamp);
	window.requestAnimationFrame(masterLoop);
}
masterLoop(performance.now());


	/**
	 * @function update
	 * Updates the game state, moving
	 * game objects and handling interactions
	 * between them.
	 * @param {DOMHighResTimeStamp} elapsedTime indicates
	 * the number of milliseconds passed since the last frame.
	 */
function update(elapsedTime) {
	var speed = 5;

	// set the velocity
	player.velocity.x = 0;
	if(input.left) player.velocity.x -= speed;
	if(input.right) player.velocity.x += speed;
	player.velocity.y = 0;
	if(input.up) player.velocity.y -= speed / 2;
	if(input.down) player.velocity.y += speed * 2;

	// determine player angle
	player.angle = 0;
	if(player.velocity.x < 0) player.angle = -Math.PI/8;
	if(player.velocity.x > 0) player.angle = Math.PI/8;

	// move the player
	player.position.x += player.velocity.x;
	player.position.y += player.velocity.y;

	// update the camera
	camera.xOff += player.velocity.x;
	console.log(camera.xOff, camera.xMax, camera.xOff > camera.xMax)
	if(camera.xOff > camera.xMax) {
		camera.x += camera.xOff - camera.xMax;
		camera.xOff = camera.xMax;
	}
	if(camera.xOff < camera.xMin) {
		camera.x -= camera.xMin - camera.xOff;
		camera.xOff = camera.xMin;
	}

	if(camera.x < 0) camera.x = 0;


	//Update bullets
	bullets.update(elapsedTime, function(bullet) {
		if(bullet.x > 500) return true;
		return false;
	});
}

	/**
	 * @function render
	 * Renders the current game state into a back buffer.
	 * @param {DOMHighResTimeStamp} elapsedTime indicates
	 * the number of milliseconds passed since the last frame.
	 * @param {CanvasRenderingContext2D} ctx the context to render to
	 */
function render(elapsedTime, ctx) {
	// Render the backgrounds
	ctx.save();
	ctx.translate(-camera.x * 0.2, 0);
	ctx.drawImage(backgrounds[2], 0, 0);
	ctx.restore();

	ctx.save();
	ctx.translate(-camera.x * 0.6, 0);
	ctx.drawImage(backgrounds[1], 0, 0);
	ctx.restore();

	ctx.save();
	ctx.translate(-camera.x, 0);
	ctx.drawImage(backgrounds[0], 0, 0);
	ctx.restore();

	bullets.render(elapsedTime, ctx);

	// Render the player
	ctx.save();
	ctx.translate(player.position.x - camera.x, player.position.y);
	ctx.rotate(player.angle);
	ctx.drawImage(player.img, 0, 0, 131, 53, -60, 0, 131, 53);
	ctx.restore();

	// Render the reticule
	ctx.save();
	ctx.translate(reticule.x, reticule.y);
	ctx.beginPath();
	ctx.arc(0, 0, 10, 0, 2*Math.PI);
	ctx.moveTo(0, 15);
	ctx.lineTo(0, -15);
	ctx.moveTo(15, 0);
	ctx.lineTo(-15, 0);
	ctx.strokeStyle = '#00ff00';
	ctx.stroke();
	ctx.restore();
}

},{"./bullet_pool":2,"./game":3,"./vector":4}],2:[function(require,module,exports){
module.exports = exports = BulletPool;

function BulletPool(maxSize) {
	this.pool = new Float32Array(4 * maxSize);
	this.end = 0;
	this.max = maxSize;
}

BulletPool.prototype.add = function(position, velocity) {
	if(this.end < this.max) {
		var endmarker = 4 * this.end;
		this.pool[endmarker] = position.x;
		this.pool[endmarker+1] = position.y;
		this.pool[endmarker+2] = velocity.x;
		this.pool[endmarker+3] = velocity.y;
		this.end++;
	}	
}

BulletPool.prototype.update = function(elapsedTime, callback) {
	for(var i = 0; i < this.end; i++) {
		var marker = 4 * i;
		this.pool[marker] += this.pool[marker + 2];
		this.pool[marker + 1] += this.pool[marker + 3];
		if(callback({
			x: this.pool[marker],
			y: this.pool[marker + 1]
		})) {
			var endpoint = 4*(this.end - 1);
			this.pool[marker] = this.pool[endpoint];
			this.pool[marker + 1] = this.pool[endpoint + 1];
			this.pool[marker + 2] = this.pool[endpoint + 2];
			this.pool[marker + 3] = this.pool[endpoint + 3];
			this.end--;
			i--;
		}		
	}	
}

BulletPool.prototype.render = function(elapsedTime, ctx) {
	ctx.save();
	ctx.beginPath();
	ctx.fillStyle = "black";
	for(var i = 0; i < this.end; i++) {
		var marker = 4 * i;
		ctx.moveTo(this.pool[marker], this.pool[marker + 1]);
		ctx.arc(this.pool[marker], this.pool[marker + 1], 2, 0, 2*Math.PI);
	}
	ctx.fill();
	ctx.restore();
}

},{}],3:[function(require,module,exports){
"use strict";

/**
 * @module exports the Game class
 */
module.exports = exports = Game;

/**
 * @constructor Game
 * Creates a new game object
 * @param {canvasDOMElement} screen canvas object to draw into
 * @param {function} updateFunction function to update the game
 * @param {function} renderFunction function to render the game
 */
function Game(screen, updateFunction, renderFunction) {
  this.update = updateFunction;
  this.render = renderFunction;

  // Set up buffers
  this.frontBuffer = screen;
  this.frontCtx = screen.getContext('2d');
  this.backBuffer = document.createElement('canvas');
  this.backBuffer.width = screen.width;
  this.backBuffer.height = screen.height;
  this.backCtx = this.backBuffer.getContext('2d');

  // Start the game loop
  this.oldTime = performance.now();
  this.paused = false;
}

/**
 * @function pause
 * Pause or unpause the game
 * @param {bool} pause true to pause, false to start
 */
Game.prototype.pause = function(flag) {
  this.paused = (flag == true);
}

/**
 * @function loop
 * The main game loop.
 * @param{time} the current time as a DOMHighResTimeStamp
 */
Game.prototype.loop = function(newTime) {
  var game = this;
  var elapsedTime = newTime - this.oldTime;
  this.oldTime = newTime;

  if(!this.paused) this.update(elapsedTime);
  this.render(elapsedTime, this.frontCtx);

  // Flip the back buffer
  this.frontCtx.drawImage(this.backBuffer, 0, 0);
}

},{}],4:[function(require,module,exports){
/**
 * @module Vector
 * A library of vector functions.
 */
module.exports = exports = {
  rotate: rotate,
  dotProduct: dotProduct,
  magnitude: magnitude,
  normalize: normalize
}

/**
 * @function rotate
 * Rotates a vector about the Z-axis
 * @param {Vector} a - the vector to rotate
 * @param {float} angle - the angle to roatate by (in radians)
 * @returns a new vector representing the rotated original
 */
function rotate(a, angle) {
  return {
    x: a.x * Math.cos(angle) - a.y * Math.sin(angle),
    y: a.x * Math.sin(angle) + a.y * Math.cos(angle)
  }
}

/**
 * @function dotProduct
 * Computes the dot product of two vectors
 * @param {Vector} a the first vector
 * @param {Vector} b the second vector
 * @return the computed dot product
 */
function dotProduct(a, b) {
  return a.x * b.x + a.y * b.y
}

/**
 * @function magnitude
 * Computes the magnitude of a vector
 * @param {Vector} a the vector
 * @returns the calculated magnitude
 */
function magnitude(a) {
  return Math.sqrt(a.x * a.x + a.y * a.y);
}

/**
 * @function normalize
 * Normalizes the vector
 * @param {Vector} a the vector to normalize
 * @returns a new vector that is the normalized original
 */
function normalize(a) {
  var mag = magnitude(a);
  return {x: a.x / mag, y: a.y / mag};
}

},{}]},{},[1]);
