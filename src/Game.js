import ui.View as View;
import ui.ImageView as ImageView;
import ui.TextView as TextView;
import ui.resource.Image as Image;
import ui.SpriteView as SpriteView;
import ui.widget.SliderView as SliderView;

//Import classes and Configuration
import device
import animate
import math.geom.intersect as Intersect;
import math.geom.Rect as Rect;
import math.util as Util;
import AudioManager;

//import constants.menuConstants as menuConstants;
import menus.views.MenuView as MenuView;
import menus.views.components.ButtonView as MenuButtonView;

import src.Config as Config;
import src.Cat as Cat;
import src.HUD as HUD;
import src.Rat as Rat;
import src.EnemyNest as EnemyNest;
import src.Kitten as Kitten;
import src.Item as Item;
import src.ItemFactory as ItemFactory;
import src.Tile as Tile;
import src.TileMap as TileMap;

import src.box2d.collision.b2AABB as b2AABB;
import src.box2d.common.math.b2Vec2 as b2Vec2;
import src.box2d.common.math.b2Mat22 as b2Mat22;
import src.box2d.common.math.b2Math as b2Math;
//import src.box2d.collision.shapes.b2Shape as b2Shape;
//import src.box2d.common.b2Settings as b2Settings;

//## Class: Game 
exports = Class(View, function (supr) {

	this.init = function (opts) {
		supr(this, 'init', [opts]);	

		this._activeNests = 3;
		this._enemiesPerNest = 8;
		this._enemyNests = [];

		this._dots = [];
		this._kittens = [];
		this._deployedKittens = 0;
		this._cat = undefined;
		this._pause = false;
		this._gameOver = false;
		this._lastCatAudioTime = undefined;
		this._lives = 9;
		this._credits = 10;

		var width = this.style.width;
		var height = this.style.height;

		this._bgView = new ImageView({ 
 			image: 'resources/images/background.png', 
			superview: this,
			width: width,
			height: height 
		});

		this._cat = new Cat({
			damagePts: 20,
		 	superview: this,
			width: width,
			height: height,
			zIndex: 7 
		});
		this._cat.on('CatTap', this.handleCatTap.bind(this));

		//this._ratAudioManager = new AudioManager({
                //      path: 'resources/audio',
		//	files: {
		//		ratSqueak2: {
		//			background: true,
		//			volume: 0.05
		//		},
		//		ratSqueak3: {
		//			background: false,
		//			volume: 0.05
		//		}
		//	}
		//});

		this.initHUD();
		this.initGameOverMenu();
		this.initItems();
		this.initTileMap();
		this.initEnemyNests();
		this.initKittens();
		this.initPhysics();

		this.start();
	};

	this.initEnemyNests = function() {
		for(var i = 0; i < this._activeNests; ++i) {
			// choose random tile
			var tile = this._tileMap.getRandomVisibleTile(true);
		 
			var nest = new EnemyNest({
				healthPts: 4,
				image: 'resources/images/farm.png',
				width: tile.getWidth(),
				height: tile.getHeight(),
				tile: tile,
				zIndex: 5
			});
			nest.on('Empty', this.handleEmptyNest.bind(this));
			nest.on('Destroyed', this.handleDestroyedNest.bind(this));
		
			var ignoresTraps = false;
			var ratSize = 48;

			for(var e = 0; e < this._enemiesPerNest; ++e) {
				ignoresTraps = (e < 3)? true: false;

				var rat = new Rat({ 
					damagePts: 1,
					healthPts: 1,
					rewardPts: 1,
					ignoreTraps: ignoresTraps,
					nest: nest,
					height: ratSize,
					width: ratSize,
					zIndex: 5,
					superview: this,
					tileMap: this._tileMap 
				});

				rat.on('Success', this.handleEnemySuccess.bind(this));
				rat.on('Death', this.handleEnemyDeath.bind(this));
				nest.addEnemy(rat);
			}

		 	this._enemyNests.push(nest);
		}
	};

	this.initGameOverMenu = function() {
		this._gameOverView = new View({
			superview: this,
			width: this.style.width,
			height: this.style.height,
			zIndex: 15,
		});

		// transparency
		new View({
			superview: this._gameOverView,
			width: this.style.width,
			height: this.style.height,
			backgroundColor: '#000000',
			opacity: 0.5
		});
		
		this._gameOverView.hide();
		new TextView({
			superview: this._gameOverView,
			x: this.style.width/2 -100,
			y: this.style.height/2 -150,
			width: 200,
			height: 200,
			size: 100,
			text: "Game Over",
			color: 'white',
		});

		var self = this;
		var offset = (this.style.width-500)/2;
		new MenuButtonView({
			superview: this._gameOverView,
			width: 200, 
			height: 80,
			title: 'Play Again',
			style: 'GREEN',
			x: this.style.width/2 -100,
			y: this.style.height/2 -20,
			on: {
				down: function() { 
					self.reset(); 
					self._gameOverView.hide();
					self.start();
				}
			}
		});

		new MenuButtonView({
			superview: this._gameOverView,
			width: 200, 
			height: 80,
			title: 'Quit',
			style: 'RED',
			x: this.style.width/2 -100,
			y: this.style.height/2 +85,
			on: {
				down: this.quit.bind(this) 
			}
		});
	};

	this.initHUD = function() {
		this._hud = new HUD({
			superview: this,
			lives: this._lives,
			zIndex: 10 
		});
		this._hud.on('Pause', this.handlePause.bind(this));
		this._hud.on('Quit', this.handleQuit.bind(this));
		this._hud.on('Resume', this.handleResume.bind(this));
		this._hud.setCredits(this._credits);
	};

	this.initItems = function() {
		this._items = [];
		
		for(var i = 0; i < Config.items.length; ++i) {
			var itm = Config.items[i];
			for(var q = 0; q < itm.qty; ++q) {
				var item = ItemFactory.make(itm.className, itm.opts);
				item.hide();
				this._items.push(item);
			}
		}

		//this._boxes = []
		//for(var b = 0; b < 6; ++b) {
		//	var box = new Item({
		//		image: prefix + 'tile/box.png',
		//		isObstacle: true,
		//		maxHits: 5,
		//		superview: this,
		//		width: 64,
		//		height: 64,
		//		zIndex: 5 
		//	});
		//	this._boxes.push(box);
		//}
	};

	this.initKittens = function() {
		var yPos = this._tileMap.getNumberOfRows() - 1;
		var tileSize = this._tileMap.getTileSize();

		for(var k = 0; k < Config.kittens.length; ++k) {
			var kitten = new Kitten({
				damagePts: 2,
				healthPts: 4,
				superview: this,
				width: tileSize,
				height: tileSize,
				tile: this._tileMap.getTile(k, yPos),
				tileMap: this._tileMap,
				zIndex: 6
			});

			kitten.on('Success', this.handleKittenSuccess.bind(this));
			kitten.on('Death', this.handleKittenDeath.bind(this));

			var kit = Config.kittens[k];
			var color = kit.name;
			var dotColor = kit.tileImage;
			var dotImg  = new ImageView({
				superview: this,
				image: Config.kittenFolder + dotColor,
				width:64,
				height: 64,
				zIndex: 15
			});
			dotImg.color = color;
			dotImg.hide();
			kitten.setDot(dotImg);
			this._dots.push(dotImg);
			this._kittens.push(kitten);
		}
	};

	this.initPhysics = function() {
		var worldAABB = new b2AABB();
		worldAABB.minVertex.Set(-1000, -1000);
		worldAABB.maxVertex.Set(1000, 1000);
		var gravity = new b2Vec2(0, 300);
		var doSleep = true;
		
		var vec = new b2Vec2();
		
		var mat = new b2Mat22();
		//var world = new b2World(worldAABB, gravity, doSleep); 
		//var mat = new b2Mat22();
		console.log(gravity.Negative());
	};

	this.initTileMap = function() {
		var tileSize = 64;
		var numCols = Math.floor(this.style.width / tileSize); 
		// subtract 2 rows because that is where the HUD lives
		var numRows = Math.floor(this.style.height/ tileSize) - 2;   

		this._tileMap = new TileMap({
			numCols: numCols,
			numRows: numRows,
			superview: this,
			tileSize: tileSize, 
			visibleBound: numRows-4,
			x: 0,
			y: tileSize, 
			zIndex: 4
		});
		this._tileMap.on('TileInput', this.handleTileInput.bind(this));
	};


	// SETTERS


	// GAME STATE
	this.gameOver = function() {
		this._gameOver = true;
		this._gameOverView.style.opacity = 0;
		this._gameOverView.show();
		animate(this._gameOverView).now({opacity:1}, 1000);
	};

	this.reset = function() {
		this._activeNests = 3;

		for(var n = 0; n < this._activeNests; ++n) {
			var nest = this._enemyNests[n];
			var tile = this._tileMap.getRandomVisibleTile(true);
			nest.setTile(tile);
			nest.reset();
		}
		
		this._items.forEach (function(item) { item.reset(); });

		//this._traps.forEach (function (trap) {
		//	trap.reset();
		//});
		//this._mines.forEach (function (trap) {
		//	trap.reset();
		//});
		//this._glue.forEach (function (trap) {
		//	trap.reset();
		//});
		//this._kittens.forEach (function (kitten) {
		//	kitten.reset();
		//});
		this._pause = false;
		this._gameOver = false;
		this._lives = 9;
		this._credits = 10;
		this._hud.setLives(this._lives);
		this._hud.setCredits(this._credits);
	};

	this.start = function() {
		this._lastCatAudioTime = new Date().getTime();
		this._cat.meow();

		this._kittens.forEach( function(kitten) {
			kitten.pace();
		});
		this._enemyNests.forEach( function(nest) {
			//nest.reset();
			nest.startCountDown(8);
		});
	};
	
	this.tick = function() {
		if(this._pause || this._gameOver) return;

		var now = new Date().getTime();
		if(now - this._lastCatAudioTime > 9000) {
			this._lastCatAudioTime = now;
			this._cat.meow();
		}

		this.checkItemCollision();
		//this.checkKittenCollision();
	};

	this.quit = function() {
	};

	// CHECK STATE
	this.checkItemCollision = function() {
	
		for(var i = 0; i < this._items.length; ++i) {
			var item = this._items[i];
			
			if(!item.isSet()) continue;

			for(var n = 0; n < this._enemyNests.length; ++n) {
				var nest = this._enemyNests[n];
				var itemRect = item.getBoundingShape();

				if(nest.isDead()) continue;

				var nestEnemies = nest.getEnemies();

				for(var e = 0; e < nestEnemies.length; ++e) {
					var enemy = nestEnemies[e];
					var eRect = enemy.getBoundingShape();

					if(enemy.isMoving() && Intersect.rectAndRect(itemRect, eRect)) {
						item.hit(enemy);	
					}
				}		
			}
		}
	};

	this.checkKittenCollision = function() {

		for(var k = 0; k < this._kittens.length; ++k) {
			var kitten = this._kittens[k];
			var kittenRect = kitten.getBoundingShape();
			var hit = false;

			if(kitten.isDead() || !kitten.isDeployed()) continue;

			for(var n = 0; n < this._enemyNests.length; ++n) {
				var nest = this._enemyNests[n];
				var nestEnemies = nest.enemies();

				for(var e = 0; e < nestEnemies.length; ++e) {
					var enemy = nestEnemies[e];
					var eRect = enemy.boundingRect();

					if(enemy.isMoving() && Intersect.rectAndRect(kittenRect, eRect)) {
						if(enemy.isAggressive()) {
							//enemy.setAggressive(false);
							//kitten.hit(enemy.getDamagePts());
							enemy.hit(kitten.getDamagePts());
							kitten.hit(enemy.getDamagePts());
							hit = true;
						}
					}
				}		
			}
			
			if(hit) { 
				kitten.action();
			}
		}
			
	};

	// todo remove
	//this.changeKitty = function(kitty) {
	//	this._cat.setCombatMode(kitty);
	//};

	// EVENT handlers
	this.handleCatTap = function () {

		this._lastCatAudioTime = new Date().getTime();
		var catRect = this._cat.getRect();
		var hit = false;
		
		for(var n = 0; n < this._enemyNests.length; ++n) {
			var nest = this._enemyNests[n];
			var enemies = nest.getEnemies();
	
			for(var e = 0; e < enemies.length; ++e) { 
				var enemy = enemies[e];

				if(enemy.isMoving() && Intersect.rectAndRect(catRect, enemy.getBoundingShape())) {
					enemy.hit(this._cat.getDamagePts());	
					hit = true;
				}
			}
		}

		if(hit) this._cat.action();
	};

	this.handleDestroyedNest = function(nest) {
		this._activeNests--;
		if(this._activeNests == 0) {
			this.gameOver();
		}
	};

	this.handleEmptyNest = function(nest) {
		var countDown = Util.random(0,10) + 10;
		nest.reset();
		nest.startCountDown(countDown);
	};

	this.handleEnemyDeath = function(enemy) {
		this._credits += enemy.getRewardPts();
		this._hud.setCredits(this._credits);
	};

	this.handleEnemySuccess = function(enemy) {

		if(this._lives <= 0) return;

		this._lives--;
		this._hud.setLives(this._lives);

		if(this._lives == 0)  
			this.gameOver();
	};

	this.handleKittenSuccess = function(kitten) {
		kitten.getDot().hide();
		var tile = kitten.getTile();
		var object = tile.getObject();

		if(object instanceof EnemyNest) 
			kitten.attack(object);
	};

	this.handleKittenDeath = function(kitten) {
		kitten.getDot().hide();
		kitten.reset();
		kitten.pace();
		//this._redDot.hide();
	};

	this.handleTileInput = function(tile) {
		var activeItem = this._hud.getActiveItem();
		
		for(var i = 0; i < this._items.length; ++i) {
			var item = this._items[i];
			var className =  item.toString().replace(/[0-9]/g, '');

			if(className == activeItem && !item.isSet()) {
				var costPts = item.getCostPts(); 

				if(this._credits >= costPts) {
					this._credits -= costPts; 
					this._hud.setCredits(this._credits);
					item.setTile(tile);
					break;
				}
			}
		}

//		if(activeItem == 'mine') {
//			var cost = 10;
//			if(this._credits >= cost) {
//				for(var i = 0; i < this._mines.length; ++i) {
//					var mine = this._mines[i];	
//
//					if(!mine.isSet()) {
//						this._credits -= cost;
//						this._hud.setCredits(this._credits);
//						//this._hud.addHP(-cost);
//						mine.set(tile);
//						break;
//					}
//				}
//			}
//		} else if(activeItem == 'Puddle') {
//			var cost = 5;
//			if(this._credits >= cost) {
//				for(var i = 0; i < this._glue.length; ++i) {
//					var glue = this._glue[i];	
//
//					if(!glue.isSet()) {
//						this._credits -= cost;
//						this._hud.setCredits(this._credits);
//						//this._hud.addHP(-cost);
//						glue.set(tile);
//						break;
//					}
//				}
//			}
//		} else if(activeItem == 'MouseTrap') {
//			var cost = 2
//			if(this._credits >= cost) {
//				for(var i = 0; i < this._traps.length; ++i) {
//					var trap = this._traps[i];	
//
//					if(!trap.isSet()) {
//						this._credits -= cost;
//						this._hud.setCredits(this._credits);
//						//this._hud.addHP(-cost);
//						trap.set(tile);
//						break;
//					}
//				}
//			}
//		} else if(activeItem == 'catnip') {
//			this._catnip.style.x = tile.style.x;
//			this._catnip.style.y = tile.style.y;
//			this._catnip.show();
//			//this._kitten.send(tile);
//			
//		} else if(activeItem == 'box') {
//			for(var i = 0; i < this._boxes.length; ++i) {
//				var box = this._boxes[i];	
//
//				if(!box.isUsed()) {
//					tile.setObject(box);
//					tile.setBlocked(true);
//					box.show();
//					break;
//				}
//			}
//		} else {
//			// must be a kitten dot
//			for(var k = 0; k < this._dots.length; ++k) { 
//				var color= this._dots[k].color;
//				if(activeItem == color) {
//			
//					this._dots[k].style.x = tile.style.x;
//					this._dots[k].style.y = tile.style.y;
//					this._dots[k].show();
//					this._kittens[k].send(tile, true);
//					break;
//				}
//			}
//		}
	};

	this.handlePause = function() {
		this._pause = true;

		this._kittens.forEach(function(kitten) {
			kitten.pause();
		});

		this._enemyNests.forEach( function(nest) {
			nest.pause();

			//var enemyNest = nest.enemies();

			//enemyNest.forEach( function(enemy) {
			//	if(enemy.isMoving())
			//		enemy.pause();
			//});
		});
	};

	this.handleResume = function() {
		this._pause = false;

		this._kittens.forEach(function(kitten) {
			kitten.resume();
		});
		this._enemyNests.forEach( function(nest) {
			nest.resume();
			//var enemyNest = nest.enemies();

			//enemyNest.forEach( function(enemy) {
			//	if(enemy.isMoving())
			//		enemy.resume();
			//});
		});
	};

	this.handleQuit = function() {
		// implement quit and remove resume call
		this.handleResume();
	};
});
