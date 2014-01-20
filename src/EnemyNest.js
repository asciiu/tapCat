import ui.ImageView as ImageView;
import ui.TextView as TextView;
import ui.View as View;
import math.util as Util;

import animate;

exports = Class(ImageView, function(supr) {
	this.init = function(opts) {

		supr(this, 'init', [opts]);

		// used to determine and display nest health
		this._health = opts.healthPts;
		this._startingHealth = opts.healthPts;
		this._healthBarBG = undefined;
		this._healthBarFG = undefined;
		this._healthUnit = 10;
		this._isDead = false;

		this._tile = opts.tile;

		// enemies spawned from this nest
		this._enemies = [];
		this._enemiesActive = 0;

		// what the user sees 
		this._nestImage = undefined; 

		// timing control 
		this._countDownText = undefined;  // what user sees
		this._timer = animate(this);
		this._timerCount = 5;

		this.setTile(opts.tile);
		this.initImages(opts.image);
		this.initHealthBar();
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
	
	this.initImages = function(image) {
		var padding = 2;
		var size = 25;

		this._nestImage = new ImageView ({
			superview: this,
			image: image,
			width: this.style.width,
			height: this.style.height,
		});

		// countdown timer appears in lower right
		this._countDownText = new TextView({
			backgroundColor: 'white',
			superview: this._nestImage,
			width: size,
			height: size,
			x: this.style.width - size - padding,
			y: this.style.width - size - padding,
			size: 100,
			text: this._timerCount,
			color: 'red',
		});
	}		
	
	// STATUS 
	this.isDead = function() {
		return this._isDead;
	};

	// GETTERS
	this.getEnemies = function() {
		return this._enemies;
	};

	this.getTile = function() {
		return this._tile;
	};
	
	// SETTERS
	this.setTile = function(tile) {
		if(this._tile)
			this._tile.removeObject();

		tile.setObject(this);
		this._tile = tile;
	};

	// STATE CHANGERS 
	this.hit = function(damage) {
		this._health -= damage;
		this._healthBarFG.style.width -= damage * this._healthUnit;

		if(this._health <= 0) {
			this._isDead = true;
			this._timer.clear();
			this._countDownText.hide();

			this.hide();
			this.emit('Destroyed', this);
		}
	};

	this.reset = function() {
		this._healthBarFG.style.width = this._startingHealth * this._healthUnit;
		this._health = this._startingHealth;
		this._isDead = false;
		this._timer.clear();

		this._enemies.forEach( function(enemy) {
			enemy.hide();
			enemy.reset();
		});
	};


	// ENEMY CONTROL	
	this.addEnemy = function(enemy) {
		enemy.on('Success', this.handleEnemyExpire.bind(this));
		enemy.on('Death', this.handleEnemyExpire.bind(this));
		this._enemies.push(enemy);
	};
	
	this.countDown = function() {
		this._timerCount--;
		this._countDownText.setText(this._timerCount);

		// 3 seconds left change background to red
		if(this._timerCount == 3)  {
			this._countDownText.updateOpts({
				color: 'white',
				backgroundColor: 'red'
			});
		}

		if(this._timerCount > 0) {
			var self = this;
			this._timer.wait(1000).then(function() {
				self.countDown();
			});
		} else {
			this._countDownText.hide();
			this.releaseEnemies();
		}
	};

	this.releaseEnemies = function() {
		var firstEnemy = this._enemies[0];
		var randWait = 0;
		var self = this;

		this._enemies.forEach( function(enemy) {	
			if(enemy == firstEnemy) {
				// first enemy should release immediately
				enemy.show();
				enemy.startWalk();
			} else {
				// all other enemies should release randomly
				randWait = Util.random(0, 2000) + 500;
			
				self._timer.wait(randWait).then( function() { 	
					enemy.show();
					enemy.startWalk();
				});
			}
		});
	};

	// enemies will be released in countdown seconds
	this.startCountDown = function(seconds) {
		// do not start nest when dead
		if(this._isDead) return;

		this._enemiesActive = this._enemies.length;

		// return countdown text to white background
		this._countDownText.updateOpts({
			text: this._timerCount,
			color: 'red',
			backgroundColor: 'white'
		});

		this._timerCount = seconds;
		this._countDownText.show();
		this.countDown();
	};

	// PAUSE & RESUME 
	this.pause = function() {
		// pause  
		this._timer.pause();

		// pause moving enemies
		this._enemies.forEach( function(enemy) {
			if(enemy.isMoving())
				enemy.pause();
		});
	};

	this.resume = function() {
		if(this._isDead) return;

		this._timer.resume();
		this._enemies.forEach( function(enemy) {
			if(enemy.isMoving())
				enemy.resume();
		});
	};

	// EVENTS
	this.handleEnemyExpire = function(enemy) {
		this._enemiesActive--;
		if(this._enemiesActive == 0) {
			this.emit('Empty', this); 
		}
	};
});
