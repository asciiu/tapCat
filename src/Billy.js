import math.geom.Rect as Rect;

import ui.ImageView as ImageView;
import ui.SpriteView as SpriteView;
import ui.View as View;

import animate;
import AudioManager;

exports = Class(View, function(supr) {

	this.init = function (opts) {
		supr(this, 'init', [opts]);

		this._health = opts.health;
		this._startingHealth = opts.health;

		// image used for hit from kitty 
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

		// spriteview used for rat animation
		this._animation = new SpriteView({
			loop: true,
			superview: this,
			framerate: 15,
			width: this.style.width,
			height: this.style.height,
			sheetData: {
				url: 'resources/images/signDude.png',
				anims: {
					frontWalk: [[0,0],[1,0],[2,0]],
				}
			}
		});

		this._healthBG = new View({
			superview: this._animation,
			width: this._health,
			height: 5, 
			backgroundColor: '#FFFFFF',
		});
		this._healthFG = new View({
			superview: this._animation,
			width: this._health,
			height: 5, 
			backgroundColor: '#00AA00',
		});

		this._type = opts.type;
		this._isMoving = false;
		this._isSuccessful = false;
		this._hit = false;
		this._spawnY = opts.y;
		this._animation.startAnimation('frontWalk');
	};

	this.boundingRect = function() {
		var x = this.style.x + 7;
		var y = this._animation.style.y + this.style.y;	
		var ratWidth = this._animation.style.width - 5;
		var ratHeight = this._animation.style.height - 5;

		return new Rect(x, y, ratWidth, ratHeight);
	};

	this.getType = function() {
		return this._type;
	};

	this.isDead = function() {
		return this._health <= 0;
	};

	this.hit = function(damage) {
		this._health -= damage;
		this._healthFG.style.width -= damage;

		if(this._health <= 0) {
			this._isMoving = false;
			this._animation.hide();
			this._moveTween.clear();
			this._hitView.style.opacity = 1;

			var self = this;
			animate(this._hitView).now({opacity: 0}, 400).then( function() {
				//self.reset();
			});;
		}
	};

	this.isMoving = function() {
		return this._isMoving;
	};

	this.isSuccessful = function() {
		return this._isSuccessful;
	};

	this.reset = function() {
		var parentView = this.getSuperview();

		this._health = this._startingHealth;
		this._healthFG.style.width = this._healthBG.style.width;

		this.style.x = Math.floor((parentView.style.width-this.style.width) * Math.random());
		this.style.y = this._spawnY;

		this._animation.show();
		this._isMoving = false;
		this._isSuccessful = false;
		//this.walk();
	};

	this.walk = function() {
		var walkTime = Math.floor(Math.random() * 5000) + 3000;
		var parentView = this.getSuperview();
		this._isMoving = true;
		var self = this;

		this._moveTween = animate(this).now({y: parentView.style.height + self.style.height}, walkTime, animate.linear).then( function () {
			self._isSuccessful = true;
			self._isMoving = false;
			//self.reset();
			self.emit('EnemySuccess', self);
		});
	};

	this.pause = function() {
		this._moveTween.pause();
		this._animation.pause();
	};
	this.resume = function() {
		this._moveTween.resume();
		this._animation.resume();
	};
});
