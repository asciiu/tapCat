import math.geom.Rect as Rect;

import ui.ImageView as ImageView;
import ui.SpriteView as SpriteView;
import ui.View as View;
import ui.TextView as TextView;

import animate;
import AudioManager;

exports = Class(View, function(supr) {

	this.init = function (opts) {
		supr(this, 'init', [opts]);

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

		this._yarnImage = new ImageView({
			superview: this,
			image: 'resources/images/pogo.png',
			width: this.style.width,
			height: this.style.height
		});

		// spriteview used for rat animation
		//this._animation = new SpriteView({
		//	loop: true,
		//	superview: this,
		//	framerate: 30,
		//	width: this.style.width,
		//	height: this.style.height,
		//	sheetData: {
		//		url: 'resources/images/rats.png',
		//		anims: {
		//			frontWalk: [[0,0], [1,0], [2,0]],
		//		}
		//	}
		//});

		//new TextView({
		//	superview: this,
		//	width: 20,
		//	height: 20,
		//	size: 24,
		//	text: opts.id,
		//	x: 30 
		//});	

		this._type = opts.type;
		this._isSuccessful = false;
		this._isDead = false;
		this._isMoving = false;
		this._spawnY = opts.y;
		this._moveX = opts.cWidth;
		this._moveY = opts.cHeight;
		this._gridW = opts.gWidth;
		this.style.x = Math.floor(Math.random()*4) * this._moveX * 2;

		//this._spawnY = opts.y;
		this._hit = false;
		//this._animation.startAnimation('frontWalk');
	};

	this.getType = function() {
		return this._type;
	};

	this.boundingRect = function() {
		return this.getBoundingShape();
	};

	this.hit = function(hit) {
		this._isDead = true;		
		this._isMoving = false;

		//this._animation.hide();
		this._yarnImage.hide();
		this._moveTween.clear();
		this._hitView.style.opacity = 1;
		var self = this;
		//this.reverse();
		animate(this._hitView).now({opacity: 0}, 400);
	};

	this.isDead = function() {
		return this._isDead;
	};
	this.isSuccessful = function() {
		return this._isSuccessful;
	};

	this.isMoving = function() {
		return this._isMoving;
	};
	
	this.reverse = function() {
		//this.reset();
		var walkTime = 500;
		var parentView = this.getSuperview();
		this._isMoving = true;
		var self = this;

		this._moveTween = animate(this).now({y: self._spawnY}, walkTime, animate.easeOut).then( function () {
			self._isMoving = false;
		});
	};

	this.jump = function() {
		var walkTime = Math.floor(Math.random() * 1000) + 500;
		var parentView = this.getSuperview();
		var newY = this.style.y + this._moveY;
		var self = this;
			
		var newX;
		var dx1 = this.style.x + this._moveX;
		var dx2 = this.style.x - this._moveX;

		if(Math.floor((Math.random() * 3)) % 2 == 0)	
			newX = dx1;
		else
			newX = dx2;

		if(newX >= parentView.style.width)
			newX = dx2;
		else if(newX < 0)
			newX = dx1;

		this._moveTween = animate(this).now({x:newX, y: newY}, walkTime, animate.easeIn).then( function () {
			if(this.style.y >= this._moveY * 10) {
				self.finish();
			} else {
				self.jump();
			}
		});
	};
	
	this.finish = function() {
		var parentView = this.getSuperview();
		var newY = parentView.style.height-this._moveY;
		var walkTime = Math.floor(Math.random() * 2000) + 500;
		var self = this;

		this._moveTween = animate(this).now({y: newY}, walkTime, animate.easeIn).then( function () {
			self._isMoving = false;
			self._isSuccessful = true;
			self.emit('EnemySuccess', self);
		});
	
	};	

	this.walk = function() {
		//this.reset();
		var walkTime = Math.floor(Math.random() * 1000) + 500;
		var parentView = this.getSuperview();
		var newY = this.style.y + this._moveY;
		this._isMoving = true;
		var self = this;

		this._moveTween = animate(this).now({y: newY}, walkTime, animate.easeIn).then( function () {
			self.jump();
		});
	};

	this.pause = function() {
		this._moveTween.pause();
		//this._animation.pause();
	};
	this.resume = function() {
		this._moveTween.resume();
		//this._animation.resume();
	};
	
	this.reset = function() {
		this.style.x = (Math.floor(Math.random()*4) * this._moveX * 2) + this._moveX;
		this.style.y = this._spawnY;
		this._isDead = false;
		this._isMoving = false;
		this._isSuccessful = false;
		this._yarnImage.show();
		//this._animation.show();
	};
});
