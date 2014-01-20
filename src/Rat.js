import math.geom.Rect as Rect;
import math.util as Util;

import ui.ImageView as ImageView;
import ui.SpriteView as SpriteView;
import ui.View as View;
import ui.TextView as TextView;

import animate;
import AudioManager;
import src.AStar as AStar;

exports = Class(View, function(supr) {

	this.init = function (opts) {
		supr(this, 'init', [opts]);

		this._health = opts.healthPts;
		this._startingHealth = opts.healthPts;
		this._rewardPts = opts.rewardPts;

		this._damagePts = opts.damagePts;
		this._ignoreTraps = opts.ignoreTraps;

		this._isSuccessful = false;
		this._isDead = false;
		this._isMoving = false;

		this._nest = opts.nest;
		this._tileMap = opts.tileMap;
		this._spawnTile = opts.nest.getTile();
		this._sTile = undefined;
		this._dTile = undefined;
		this._walkSpeed = 0;

		this._moveTween = animate(this);

		var pt = this._spawnTile.getCoordinates();		
		var dimension = this._spawnTile.getWidth();
		
		this.style.offsetX = (dimension - this.style.height)/2; 
		this.style.offsetY = (dimension - this.style.width)/2; 
		
		this.initImages();
		this.reset();
	};

	this.initImages = function() {
		// image used for rat hit from kitty 
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
		this._hitAnimation = animate(this._hitView);

		// spriteview used for rat animation
		this._animation = new SpriteView({
			loop: true,
			superview: this,
			framerate: 30,
			width: this.style.width,
			height: this.style.height,
			sheetData: {
				url: 'resources/images/rats.png',
				anims: {
					down:  [[0,0], [1,0], [2,0]],
					left:  [[0,1], [1,1], [2,1]],
					right: [[0,2], [1,2], [2,2]],
					up:    [[0,3], [1,3], [2,3]]
				}
			}
		});
	};

	// STATUS
	this.isDead = function() {
		return this._isDead;
	};

	this.isSpeedDecreased = function() {
		return this._isSpeedDecreased;
	};

	this.isSuccessful = function() {
		return this._isSuccessful;
	};

	this.isMoving = function() {
		return this._isMoving;
	};

	// GETTERS
	this.getBoundingShape = function() {
		var rect = supr(this, 'getBoundingShape');
		var x = this.style.x + this.style.offsetX;
		var y = this.style.y + this.style.offsetY;
	
		return new Rect(x, y, rect.width, rect.height);
	};

	this.getDamagePts = function() {
		return this._damagePts;
	};
	
	this.getNest = function() {
		return this._nest;
	};

	this.getRewardPts = function() {
		return this._rewardPts;
	};

	// SETTERS
	this.setAnimation = function(direction) {
		this._animation.startAnimation(direction, {loop:true});
	};

	// STATE CHANGES
	this.hit = function(damage) {
		this._health -= damage;

		if(this._health <= 0) {
			this._isDead = true;		
			this._isMoving = false;

			this._animation.hide();
			this._moveTween.clear();

			// display death sequence
			this._hitView.style.opacity = 1;
			this._hitAnimation.now({opacity: 0}, 400);
			this.emit('Death', this);
		}
	};
	
	this.reset = function() {
		this._spawnTile = this._nest.getTile();
		var pt = this._spawnTile.getCoordinates();		
		
		// center the rat
		this.style.x = pt.x;
		this.style.y = pt.y;

		this._health = this._startingHealth;
		this._isDead = false;
		this._isMoving = false;
		this._isSuccessful = false;

		this._animation.hide();

		if(this._moveTween)
			this._moveTween.clear();
	};

	// MOVEMENT CONTROL
	this.decreaseSpeed = function(factor) {
		// cancel the current move
		this._moveTween.clear();
		this._isSpeedDecreased = true;

		var self = this;
		this._moveTween.now({x:this._x, y:this._y}, this._walkSpeed*factor, animate.linear).then( function () {
			self._isSpeedDecreased = false;
			var path = self.findPath(this._sTile, this._dTile); 
			self.walkPath(path);	
		});
	};

	this.findPath = function(startTile, destTile) {
		var path = this._tileMap.getPath(destTile, startTile, true, this._ignoreTraps, this._ignoreTraps);
		var dPos = destTile.getPosition();
	
		if(path.length > 0) {
			path.push([dPos.xPos, dPos.yPos]);
		} else {
			// we could not find a clear path so let's find a path with obstructions
			path = this._tileMap.getPath(destTile, startTile, true, true, true);	
			path.push([destTile.xPos, destTile.yPos]);
		}
		return path;
	};

	this.startWalk = function() {
		if(this._isMoving) return;

		this._isMoving = true;

		// choose random destination tile
		this._dTile = this._tileMap.getRandomBottomTile();
		this._walkSpeed = Math.floor(Math.random() * 400) + 300;

		var path = this.findPath(this._spawnTile, this._dTile);
		this.walkPath(path);
	};

	this.walkPath = function(path) {
		this._animation.show();

		// current start tile will always be first
		// therefore let's move to tile with index 1
		this._sTile = this._tileMap.getTile(path[1][0], path[1][1]);
		var point = this._sTile.getCoordinates();
		
		// we need to track these so we can slow the current move
		this._x = point.x;
		this._y = point.y;	

		if(this._x < this.style.x) this.setAnimation('left');
		else if(this._x > this.style.x) this.setAnimation('right');
		
		if(this._y < this.style.y) this.setAnimation('up');
		else if(this._y > this.style.y) this.setAnimation('down');
		
		var self = this;
		this._moveTween.now({x:this._x, y:this._y}, this._walkSpeed, animate.linear).then( function () {
			// still have tiles in path
			if(this._sTile != this._dTile) {
				// find new path to navigate new obstructions 
				var newPath = self.findPath(self._sTile, self._dTile); 
				self.walkPath(newPath);
			} else {
				// we have reached our destination
				self._animation.hide();
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
	this.stop = function() {
		this._moveTween.clear();
	};

	// EVENTS
});
