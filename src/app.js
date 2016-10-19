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
