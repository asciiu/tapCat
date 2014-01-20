import math.geom.Rect as Rect;
import math.util as Util;

import ui.resource.Image as Image;
import ui.ImageView as ImageView;
import ui.SpriteView as SpriteView;
import ui.View as View;
import ui.TextView as TextView;

import animate;
import AudioManager;

exports = Class(View, function(supr) {

	this.init = function (opts) {
		supr(this, 'init', [opts]);

		this._health = opts.healthPts;
		this._startingHealth = opts.healthPts;
		this._healthBarBG = undefined;
		this._healthBarFG = undefined;
		this._healthUnit = 10;
		this._isDead = false;

		this._damagePts = opts.damagePts;

		this._isSuccessful = false;
		this._isDeployed = false;
		this._isMoving = false;
		this._hit = false;

		this._tileMap = opts.tileMap;
		this._spawnTile = opts.tile;
		this._tile = opts.tile;
		
		var pt = opts.tile.getCoordinates(); 
		this.style.x = pt.x;
		this.style.y = pt.y;

		this.initAudio();
		this.initHealthBar();
		this.initImages();
	};

	this.initAudio = function() {
		this._audioManager = new AudioManager({
			path: 'resources/audio/kitty',
			files: {
				meow: {
					background: true,
					loop: false,
					volume: 0.1
				},
				punchL: {
					background: false
				},
				punchR: {
					background: false
				}
			}
		});
	};

	this.initHealthBar = function() {
		var height = 5;
		var width = this._health * this._healthUnit;
		var offsetX = 12;
		var offsetY = 10;

		this._healthBarBG = new View({
			backgroundColor: '#FFFFFF',
			superview: this,
			width: width,
			height: height, 
			x: offsetX,
			y: offsetY,
		});

		this._healthBarFG = new View({
			backgroundColor: '#0077FF',
			superview: this,
			width: width,
			height: height, 
			x: offsetX,
			y: offsetY,
		});
	};

	this.initImages = function() {
		var hitImage = new Image({
			 url: 'resources/images/hitEffect.png'
		});
		this._hitView = new ImageView({
			superview: this,
			image: 'resources/images/hitEffect.png',
			width: this.style.width,
			height: this.style.height
		});
		this._hitView.style.opacity = 0;

		var sittingImage = new Image({
			url: 'resources/images/kittenFrames.png',
			sourceW: this.style.width,
			sourceH: this.style.height,
			sourceX: this.style.width*3,
			sourceY: 0,
		});
			
		this._sittingKitten = new ImageView({
			superview: this,
			image: sittingImage,
			width: this.style.width, 
			height: this.style.height
		});
		this._sittingKitten.hide();

		// spriteview used for rat animation
		this._animation = new SpriteView({
			loop: true,
			superview: this,
			frameRate: 5,
			height: this.style.height,	
			width: this.style.width,
			//width: this.style.width,
			//height: this.style.height,
			sheetData: {
				url: 'resources/images/kittenFrames.png',
				width: 64,
				height: 64,
				anims: {
					down:  [[0,0], [1,0], [2,0], [1,0]],
					left:  [[0,1], [1,1], [2,1], [1,1]],
					right: [[0,2], [1,2], [2,2], [1,2]],
					up:    [[0,3], [1,3], [2,3], [1,3]],
					attack:  [[0,0], [1,0], [2,0], [1,0]],
				}
			}
		});
	};

	// STATUS CHECKERS
	this.isDead = function() {
		return this._isDead;
	};

	this.isDeployed = function() {
		return this._isDeployed;
	};

	this.isSuccessful = function() {
		return this._isSuccessful;
	};

	this.isMoving = function() {
		return this._isMoving;
	};

	// GETTERS
	this.getDamagePts = function() {
		return this._damagePts;
	};

	this.getDot = function() {
		return this._dot;
	};

	this.getTile = function() {
		return this._tile;
	};

	// SETTERS
	this.reset = function() {
		//this.style.x = Math.floor((this.getSuperview().style.width-this.style.width) * Math.random());
		this._tile = this._spawnTile;
		this.style.x = this._tile.style.x;
		this.style.y = this._tile.style.y;
		this._isDeployed = false;
		this._isDead = false;
		this._isMoving = false;
		this._isSuccessful = false;

		this._healthPts = this._startingHealth;
		this._healthPtsFG.style.width = this._healthPts * 10;
		this._animation.show();
	};

	this.setDot = function(dot) {
		this._dot = dot;	
	};

	this.setAnimation = function(direction) {
		this._animation.startAnimation(direction, {loop: true});
	};

	// STATE CHANGERS
	this.hit = function(damage) {
		this._healthPts -= damage;
		this._healthPtsFG.style.width -= damage * 10;

		if(this._healthPts <= 0) {
			this._isDead = true;
			this._isMoving = false;
			this._animation.hide();
			this._moveTween.clear();
			this._hitView.style.opacity = 1;

			var self = this;
			animate(this._hitView).now({opacity: 0}, 400).then( function() {
				self.reset();
				self.emit('Death', self);
			});
		}
	};

	// MOVEMENT CONTROL
	this.action = function() {
		this._audioManager.play('punchL');
	};

	this.findPath = function(startTile, destTile) {
		var path = this._tileMap.getPath(startTile, destTile, true, true);
		return path;
	};

	this.pace = function() {
		this._pacing = true;
		var tilePos = this._tile.getPosition();
		var tileX = tilePos.xPos;
		var rand = Util.random(0,3) % 2;
		
		if(tileX == 0 || rand == 0 && tileX < this._tileMap.getNumberOfColumns()-1) {
			tileX++;
		} else {
			tileX--;
		} 
		
		var newTile = this._tileMap.getTile(tileX, tilePos.yPos);
		var x = newTile.style.x + (newTile.style.width/2) - this.style.width/2;
		var y = newTile.style.y + (newTile.style.height/2) - this.style.height/2;	
		
		if(x < this.style.x) this.setAnimation('left');
		else if(x > this.style.x) this.setAnimation('right');

		var self = this;
		var walkTime = Util.random(0,500) + 1000;
		this._moveTween = animate(this).now({x:x, y:y}, walkTime, animate.linear).then( function () {
			self._pacing = false;
			self._tile = newTile;

			if(!self._isDeployed) 
				self.pace();
			else 
				self.send(self._newDest.dest, self._newDest.isBox);
		});
	};

	this.send = function(destTile, isBox) {
		var path = this.findPath(this._tile, destTile);
		
		if(path.length > 0) {
			this._isDeployed = true;

			if(this._pacing) 
				this._newDest = {dest:destTile, isBox:isBox};
			else { 
				this._isMoving = true;
				this.walkPath(path);
			}
		}
	};

	this.walkPath = function(path) {
		var nextX = path[path.length-1][0];
		var nextY = path[path.length-1][1];
		var destX = path[0][0];
		var destY = path[0][1];

		var tile = this._tiles[nextX][nextY];
		var dTile = this._tiles[destX][destY];
		var x = tile.style.x + (tile.style.width/2) - this.style.width/2;
		var y = tile.style.y + (tile.style.height/2) - this.style.height/2;	
	
		var self = this;
		var walkTime = 2000;

		if(x < this.style.x) this.setAnimation('left');
		else if(x > this.style.x) this.setAnimation('right');

		if(y < this.style.y) this.setAnimation('up');
		else if(y > this.style.y) this.setAnimation('down');

		this._moveTween = animate(this).now({x:x, y:y}, walkTime, animate.linear).then( function () {
			self._tile = dTile;

			if(path.length > 1) {
				var path2 = self.findPath(tile, dTile); 
				self.walkPath(path2);
			} else {
				self._animation.hide();
				self._sittingKitten.show();
				self._isMoving = false;
				self._isSuccessful = true;
				self.emit('Success', self);
			}
		});
	};

	// PAUSE & RESUME
	this.pause = function() {
		this._moveTween.pause();
		this._animation.pause();
	};

	this.resume = function() {
		this._moveTween.resume();
		this._animation.resume();
	};
});
