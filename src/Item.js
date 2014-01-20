import math.geom.Rect as Rect;

import ui.resource.Image as Image;
import ui.ImageView as ImageView;
import ui.SpriteView as SpriteView;
import ui.View as View;

import animate;
import AudioManager;
import src.Tile as Tile;

exports = Class(View, function(supr) {
	
	this.init = function(opts) {
		supr(this, 'init', [opts]);
		
		this._costPts = opts.costPts;
		this._damagePts = opts.damagePts;

		// keep track of number of hits trap can take
		this._hitCount = opts.maxHits;
		this._hitMarks = [];
		this._maxHits = opts.maxHits;

		this._isObstacle = opts.isObstacle;
		this._isSet = false;

		this._soundFile = opts.soundFile;
                this._audioManager = undefined; 

		this._trapView = new ImageView({
			superview: this,
			image: opts.image,
			width: this.style.width,
			height: this.style.height,
		});


		this.on('InputStart', this.handleInputStart.bind(this));
		this.on('InputMove', this.handleInputMove.bind(this));
		this.initAudio();
		this.initHitMarks();
	};

	this.initAudio = function() {
                this._audioManager = new AudioManager({
                        path: 'resources/audio',
                });
		this._audioManager.addSound(this._soundFile, {
			background: false,
			volume: 0.5
		});
	};

	this.initHitMarks = function() {
		// spacing between marks
		var space = 2;
		var height = 10;
		var width = 4;
		var offsetX = 12;
		var offsetY = 10;

		for(var m = 0; m < this._maxHits; ++m) {
			var mark = new View({
				superview: this,
				width: width,
				height: height,
				y: offsetY, 
				x: width * m * space + offsetX,
				backgroundColor: '#118811'
			});
			this._hitMarks.push(mark);
		}
	};


	// STATUS CHECKERS 
	this.isSet = function() {
		return this._isSet;
	};

	// GETTERS
	this.getBoundingShape = function() {
		var rect = supr(this, 'getBoundingShape');
		
		if(!this._tile) return rect;
 
		var pt = this._tile.getCoordinates();

		return new Rect(pt.x, pt.y, rect.width, rect.height);
	};

	this.getCostPts = function() {
		return this._costPts;
	};

	this.getDamagePts = function() {
		return this._damagePts;
	};

	// SETTERS
	this.setTile = function(tile) {
		this._tile = tile;
		tile.setObject(this);
		tile.setOccupied(this._isObstacle);

		this._isSet = true;
		//this.style.x = tile.style.x;
		//this.style.y = tile.style.y;

		this._trapView.show();
		this.show();
	};

	// STATE CHANGERS
	this.hit = function(enemy) {
		enemy.hit(this._damagePts);

		--this._hitCount;
		if(this._hitCount < 0) {
			this.hide();
			this.reset();
			this.emit('Destroyed');
		} else {
			this._hitMarks[this._hitCount].hide();
		}

		this._audioManager.play(this._soundFile);
	};


	this.reset = function() {
		if(this._tile) { 
			this._tile.removeObject();
			this._tile.setOccupied(false);
			this._tile = undefined;
			this.hide();
		}
		
		this._isSet = false;
		this._hitCount = this._maxHits;
		this._hitMarks.forEach( function(mark) {mark.show();});
	};

	// EVENT HANDLERS
	this.handleInputStart = function(event, point) {	
		this._inputStartY = point.y;
	};

	this.handleInputMove = function(event, point) {
		if(Math.abs(point.y - this._inputStartY) > 20)
			this.reset();
	};
});
