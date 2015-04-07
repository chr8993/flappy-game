var FlappyGame = function() {

	//game
	var GAME = this;
	//paths
	var imgPath = "src/img/";
	//assets
	var assets = {
		'bird1'     : { src: 'birdy1.png' },
		'bird2'     : { src: 'birdy2.png' },
		'bird3'     : { src: 'birdy3.png' },
		'ready'     : { src: 'get_ready.png'},
		'tap'       : { src: 'tap_me.png'},
		'pipe_up'   : { src: 'pipe_up.png'},
		'pipe_down' : { src: 'pipe_down.png'}
	};
	//presets
	var window_height   = window.innerHeight;
	var window_width    = window.innerWidth;
	var container 	    = document.createElement("div");
	var gameStart 		= document.createElement("div");
	var gameStartReady  = document.createElement("div");
	var getReady 		= document.createElement("div");
	var getReadyImg 	= document.createElement("img");
	var tapReady 		= document.createElement("div");
	var tapReadyImg 	= document.createElement("img");
	var footer 			= document.createElement("div");
	var grass 			= document.createElement("div");
	var darkSide		= document.createElement("div");
	var scoreEl 		= document.createElement("h1");

	getReadyImg.src 	= imgPath + assets.ready.src; 
	gameStart.className = "game_start"; 
	container.className = "flappyGame";
	gameStartReady.className = "game_start_ready";
	tapReady.className  = "tap";
	tapReadyImg.src 	= imgPath + assets.tap.src;
	footer.className	= "footer"; 
	grass.className		= "grass_is_green";
	darkSide.className	= "dark_side";
	scoreEl.className	= "score";
	scoreEl.innerHTML   = "0";

	document.body.appendChild(container);
	container.appendChild(scoreEl);
	container.appendChild(gameStart);
	gameStart.appendChild(gameStartReady);
	gameStartReady.appendChild(getReadyImg);
	gameStart.appendChild(tapReady);
	tapReady.appendChild(tapReadyImg);
	container.appendChild(footer);
	footer.appendChild(grass);
	grass.appendChild(darkSide);

	//canvas 
	var canvas    = document.createElement("canvas");
	canvas.width  = window_width;
	canvas.height = window_height - (window_height * .20);
	container.appendChild(canvas);
	var context   = canvas.getContext('2d');

	var _animationFrame = window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame    ||
    window.oRequestAnimationFrame      ||
    window.msRequestAnimationFrame     ||
    null ;

	var _game = {
		state: 0,
		loops: 0,
		score: 0,
		frames: 0,
		pipeOffset: 70, //pipes every # frames
		pipeSpeed: 5,
		bird: {
			x: Math.round(canvas.width * .08),
			y: 0,
			gravity: 0.35,
			velocity: 0,
			frame: 0,
			animation: 1, 
			rotation: 0,
			radius: 20,
			w: 64,
			h: 64,
			_jump: 7,
			update: function() {
				//increment frame every # frames 
				var frames = _game.frames;
				var a = (frames % 9 === 0) ? 1 : 0;
				this.frame += a;

				//width + height of bird
				//fixed for now
				var bw = _game.bird.w;
				var bh = _game.bird.h;
				if(_game.state == 0) {
					//flap wings
					this.animation = (this.frame % 3) + 1;
					//update position
					//subtract fixed height
					// this.rotation = 0;
					var fixed = Math.floor(canvas.height * .6) - bh;
					var cos = (10 * (Math.cos(frames/10)));
					// console.log(cos);
					this.y = (canvas.height - fixed) + cos;
				} 
				else if (_game.state == 1) {
					//flap wings
					this.animation = (this.frame % 3) + 1;

					this.velocity += this.gravity;
					this.y += this.velocity;

					if(this.y >= (canvas.height - bh/2)) {
						//birdy falls
						this.y = (canvas.height - bh/2);
						_game.state = 2;
						this.velocity = this._jump;
					}

					if(this.velocity >= this._jump){
						this.frame = 1;
						this.rotation = Math.min(Math.PI/2, this.rotation + 0.3);
					} else {
						this.rotation = -0.3;
					}
					
				} 
				else if (_game.state == 2) 
				{
					this.velocity += this.gravity;
					this.y += this.velocity;

					if(this.y >= (canvas.height - bh/2)) 
					{
						//birdy falls
						this.y = (canvas.height - bh/2);
						_game.state = 2;
						this.velocity = this._jump;
					}

					if(this.velocity >= this._jump){
						this.frame = 1;
						this.rotation = Math.min(Math.PI/2, this.rotation + 0.3);
					} else {
						this.rotation = -0.3;
					}
				}
				

			},
			jump: function() {
				this.velocity = -(this._jump);
			},
			draw: function(ctx) {
				var a 	 = this.animation;
				var bird = assets['bird' + a].source;
				var bh = _game.bird.h;
				var bw = _game.bird.w;
				var posx = this.x;
				var posy = this.y;
				ctx.save();
				ctx.translate(posx, posy);
				ctx.rotate(this.rotation);
				ctx.drawImage(bird, -bw/2, -bh/2, bw, bh);
				ctx.restore();
			}
		},
		pipes: {
			_pipes: [],
			width: 90,
			height: 500,
			offset: 150,
			reset: function() {
				this._pipes = [];
			}, 
			update: function() {
				if(_game.state == 1) {
					if(_game.frames % _game.pipeOffset == 0) {
						//680
						var top = canvas.height - ((_game.pipes.height + _game.pipes.offset) + 120 + (200 * Math.random()));
						this._pipes.push({
							x: canvas.width,
							y: top,
							width: 0,
							height: 0
						})
					}
					var len = this._pipes.length;
					for(var i = 0; i < len; i++) {
						var pipe = this._pipes[i];

						if(i === 0) {

							if(_game.bird.x === pipe.x){
								_game.score++;
								updateCount();
							}
							// console.log("("  + _game.bird.x + ":" + pipe.x  + ")" + Math.max(_game.bird.x, pipe.x));
							// console.log("("  + _game.bird.y + ":" + pipe.y  + ")" + Math.max(_game.bird.y, pipe.y));

							var cx  = Math.min(Math.max(_game.bird.x, pipe.x), pipe.x + _game.pipes.width);
							var cy1 = Math.min(Math.max(_game.bird.y, pipe.y), pipe.y + _game.pipes.height);
							var cy2 = Math.min(Math.max(_game.bird.y, pipe.y + _game.pipes.height + _game.pipes.offset), pipe.y + (2 * _game.pipes.height) + _game.pipes.offset) 
							
							var dx = _game.bird.x - cx;
							var dy1 = _game.bird.y - cy1;
							var dy2 = _game.bird.y - cy2;

							var dt = (dx * dx) + (dy1 * dy1);
							var dt2 = (dx * dx) + (dy2 * dy2);

							var r = _game.bird.radius * _game.bird.radius;

							if(r > dt || r > dt2) {
								_game.state = 2;
							}
						}
						pipe.x -= _game.pipeSpeed;
						if(pipe.x < -50){
							this._pipes.splice(i, 1);
							i--;
							len--;
						}
					}
				}  
				
			},
			draw: 	function(ctx) {
				var len    = this._pipes.length;
				var p_up   = assets['pipe_up'].source;
				var p_down = assets['pipe_down'].source;
				for(var i = 0; i < len; i++) {
					var pipe = this._pipes[i];
					ctx.drawImage(p_down, pipe.x, pipe.y, this.width, this.height);
					ctx.drawImage(p_up, pipe.x, pipe.y + (_game.pipes.height + _game.pipes.offset), this.width, this.height);
				}
			}
		},
		update: function() {
			//update all elements
			_game.bird.update();
			_game.pipes.update();

			if(_game.state == 2) {
				//if game over
				grass.style.WebkitAnimation = "none";
				grass.style.animation = "none";
			}
		},	
		draw: function() {
			//draw all elements on canvas
			_game.clear();
			_game.pipes.draw(context);
			_game.bird.draw(context); 
		},
		clear: function() {
			//clear the canvas
			context.clearRect(0, 0, 
				canvas.width, 
				canvas.height);
		},
		loop: function() {	
			//game loop
			_game.update();
			_game.draw();
			_game.frames++;
			_animationFrame(_game.loop);
		},
		init: function() {
			_animationFrame(_game.loop);
		}
	};


	function onpress(e) {
		
		e.preventDefault();
		e.stopPropagation();

		//hide on tap
		if(_game.state === 0) {
			tapReadyImg.style.opacity = "0";
			getReadyImg.style.opacity = "0";
			//load assets
			_game.state = 1;
			_game.bird.jump();
		}
		else if(_game.state == 1) {
			_game.bird.jump();
		}
	}
	function updateCount() {
		var score = _game.score;
		scoreEl.innerHTML = score;
	}
	function loadAssets(callback) {
		for(var key in assets){
			console.log(key);
			var img = new Image();
			img.src = imgPath + assets[key].src;
			assets[key].source = img;
		}
		callback();
		//callback();
	}
	function mobileCheck()
	{
		if(window_width < 480) {
			//set dimensions 48x48
			_game.bird.w = 48;
			_game.bird.h = 48;
			_game.bird.x = Math.floor(window_width * .20);
			_game.bird._jump = 6;

			_game.pipes.width = 65;
			_game.pipes.height = 300;
			_game.pipes.offset = 120;

			_game.pipeOffset = 70;
			_game.pipeSpeed = 3;
		}
	}
	loadAssets(function(){
		_game.init();
	});

	//click listener
	container.addEventListener('mousedown', onpress);
	//for mobile
	window.addEventListener('touchstart', onpress);
	window.addEventListener('load', mobileCheck);
};