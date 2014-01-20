import animate as animate;

import ui.resource.Image as Image;
import ui.ImageView as ImageView;
import ui.SpriteView as SpriteView;
import ui.View as View;

import AudioManager;
import math.geom.Rect as Rect;

exports = Class(View, function(supr) {

	this.init = function(opts) {
		supr(this, 'init', [opts]);

		this._damagePts = opts.damagePts;
		this._isHandCombat = true;
		//this._isBatter = true;
		this._tapCB = opts.tapCB;

		// sitting kitty 
		var kitty = new Image({
			url: 'resources/images/kitty/kitty1.png'
		});

		var catW = kitty.getWidth();
		var catH = kitty.getHeight();

		this.style.y = this.getSuperview().style.height - catH;


		this._sittingKitty = new ImageView({
			superview: this,
			image: kitty,
			width: catW,
			height: catH,
			x: 100,
			//y: this.style.height-catH
		});

		// kitty with bat
		var kittyWithBat = new Image({
			url: 'resources/images/kitty/kittyBat.png'
		});

		var catWBatW = kittyWithBat.getWidth();
		var catWBatH = kittyWithBat.getHeight();

		this._kittyWBat = new ImageView({
			superview: this,
			image: kittyWithBat,
			width: catWBatW,
			height: catWBatH,
			x: 100,
			y: this.style.height-catWBatH
		});

		this._animation = new SpriteView({
                        loop: false,
                        superview: this,
			frameRate: 25,
                        width: catW,
                        height: catH+50,
                        sheetData: {
                                url: 'resources/images/kitty/anime.png',
                                anims: {
                                        tapLeft: [[0,0] , [3,0], [2,0], [1,0]],
                                        tapRight: [[0,1], [3,1], [2,1], [1,1]]
                                }
                        }
                });

		this._animationSwing = new SpriteView({
                        loop: false,
                        superview: this,
			frameRate: 25,
                        width: catWBatW,
                        height: catWBatH,
                        sheetData: {
                                url: 'resources/images/kitty/animeSwing.png',
                                anims: {
                                        swing: [[0,0], [3,0], [4,0], [5,0], [3,0], [2,0], [1,0]]
                                }
                        }
                });

		this._currentCatAudioIndex = 0;
		this._lastCatAudio = 'meow';
		this._catAudioFiles = [
			'kittyHiss', 'angryCat1', 'angryCat2', 'angryCat3', 'angryCat4', 'angryCat5' 
		];
		this._audioManager = new AudioManager({
			path: 'resources/audio/kitty',
			files: {
				angryCat1: {
					background: true,
					loop: false,
					volume: 0.1
				},
				angryCat2: {
					background: true,
					loop: false,
					volume: 0.1
				},
				angryCat3: {
					background: true,
					loop: false,
					volume: 0.1
				},
				angryCat4: {
					background: true,
					loop: false,
					volume: 0.1
				},
				angryCat5: {
					background: true,
					loop: false,
					volume: 0.1
				},
				angryCat6: {
					background: true,
					loop: false,
					volume: 0.1
				},
				kittyHiss: {
					background: true,
					loop: false,
					volume: 0.1
				},
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
				},
				woosh: {
					background: false
				}
			}
		});

		this.on('InputStart', this.handleInputStart.bind(this));
		this.on('InputOut', this.handleInputOut.bind(this));
		this.on('InputMove', this.handleInputMove.bind(this));

		this._sittingKitty.on('InputStart', this.handleTap.bind(this));
		this._kittyWBat.on('InputStart', this.swing.bind(this));

		this._catView = this._sittingKitty;
		this.setCombatMode(0);
	};

	this.getDamagePts = function() {
		return this._damagePts;
	};

	this.meow = function() {
		this._audioManager.play('meow');
		this._lastCatAudio = 'meow';
	};

	this.action = function(isRight) {
		this._audioManager.play('punchL');

		if(!this._audioManager.isPlaying(this._lastCatAudio)) {	
			// choose random cat sound that is not the last cat file that was played
			var rand = Math.floor(Math.random() * this._catAudioFiles.length);
			var file = this._catAudioFiles[rand];

			if(this._lastCatAudio != file) { 
				this._audioManager.play(file);
				this._lastCatAudio = file;
			}
		} 
	};

	this.setCombatMode = function(mode) {
		this._kittyWBat.hide();
		this._sittingKitty.hide();
		this._isHandCombat = false;
		this._isBatter = false;

		switch (mode) {
			case 0: 
				this._tapTimestamp = new Date().getTime();
				this._sittingKitty.style.x = this._catView.style.x;
				this._sittingKitty.style.y = this._catView.style.y;

				this._catView = this._sittingKitty;
				this._isHandCombat = true;
				break;
			case 1:
				this._kittyWBat.style.x = this._catView.style.x;
				this._kittyWBat.style.y = this._catView.style.y;

				this._catView = this._kittyWBat;
				this._isBatter = true;
				break;
			default:
				this._sittingKitty.style.x = this._catView.style.x;
				this._sittingKitty.style.y = this._catView.style.y;

				this._catView = this._sittingKitty;
		}
		this._catView.show();
	};

	this.swing = function() {
		var self = this;
		this._animationSwing.style.x = this._catView.style.x;
		this._animationSwing.style.y = this._catView.style.y;

		this._catView.hide();

		this._bat = true;
		this._tapRight = true;
		this._audioManager.play('woosh');
		this._animationSwing.startAnimation('swing', {callback: function() {
			//setTimeout(self.resetSwing.bind(self), 50);
			//self._catView.show();
			self._catView.show();
			self._bat = false;
			self._tapRight = false;
		}});
	
        };
	this.resetSwing = function() {
		console.log('reset');
		this._catView2.hide();
		this._catView.show();
	};

	this.handleTap = function() {

		if(this._tap) return;

		var self = this;
		this._animation.style.x = this._catView.style.x;
		this._animation.style.y = this._catView.style.y - 50;
		this._catView.hide();
		this._tap = true;

		var now = new Date().getTime(); 
		var elapsed = now - this._tapTimestamp;
		this._tapTimestamp = now;

		if(elapsed > 400) {
			this._tapRight = true;
			this._animation.startAnimation('tapRight', {callback: function() {
				self._catView.show();
				self._tap = false;
				self._tapRight = false;
			}});
		} else {
			this._tapLeft = true;
			this._animation.startAnimation('tapLeft', {callback: function() {
				self._catView.show();
				self._tap = false;
				self._tapLeft = false;
			}});
		} 
		this.emit('CatTap');
	};

	this.isTap = function() {
		return this._tap;
	};

	this.getRect = function() {
		if(this._isHandCombat) {
			var x = this._catView.style.x + 30;
			//var y = this._catView.style.y;
			var y = this.style.y - 50;
			var width = this._catView.style.width - 60;
			var height = 30;

			return new Rect(x, y, width, height);
		} else if(this._isBatter) {
			var x = this._catView.style.x + 30;
			var y = this._catView.style.y;
			var width = this._catView.style.width -30;
			var height = 60;

			return new Rect(x,y, width, height);
		}
	};

	this.isBatter = function() {
		return this._isBatter;
	};

	this.handleInputStart = function(event, point) {
		this._startX = point.x;
		var newX = point.x - this._catView.style.width/2;
		var moveX = newX - this._catView.style.x;
		
		animate(this._catView).now({x: newX}, 100, animate.linear);
		this._animation.style.x = this._catView.style.x;
		this._animation.style.y = this._catView.style.y - 50;
	};

	this.handleInputOut = function(over, overCount, atTarget) {
		this._yReturn = this._catView.style.y;
	};

	this.handleInputMove = function(event, point) {
		var dragY = point.x - this._startX;
		var newY = point.x - this._catView.style.width/2;
		
		animate(this._catView).now({x: newY}, 100, animate.linear);

		this._animation.style.x = this._catView.style.x;
		this._animation.style.y = this._catView.style.y - 50;
		this._startX = point.x;
	};
});
