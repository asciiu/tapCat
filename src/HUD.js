import ui.View as View;
import ui.ImageView as ImageView;
import ui.TextView as TextView;
import ui.resource.Image as Image;
import event.Emitter as Emitter;

//Import classes and Configuration
import device
import animate

import menus.views.components.ButtonView as MenuButtonView;
import menus.views.TextDialogView as TextDialogView;
import menus.views.MenuView as MenuView;

import src.Config as Config;

//## Class: HUD
exports = Class(Emitter, function (supr) {

	this.init = function (opts) {
		supr(this, 'init', [opts]);	

		this._activeItem = undefined;
		this._superview = opts.superview;
		this._zIndex = opts.zIndex;
		this._items = [];

		this.initStatusBarTop();
		this.initStatusBarBottom(opts.lives);
		this.initPauseMenu();
	};

	this.initPauseMenu = function() {
		var width = Config.boundsWidth;
		var height = Config.boundsHeight;

		this._pauseView = new View({
			superview: this._superview,
			width: Config.boundsWidth,
			height: Config.boundsHeight,
			zIndex:9,
		});

		this._pauseView.hide(); 

		// transparent background
		new View({
			superview: this._pauseView,
			width: this._pauseView.style.width,
			height: this._pauseView.style.height, 
			backgroundColor: '#000000',
			opacity: 0.3
		});

		var offset = (this._pauseView.style.width-500)/2;
		new MenuButtonView({
			superview: this._pauseView,
			width: 200, 
			height: 80,
			title: 'Resume',
			style: 'GREEN',
			x: offset,
			y: this._pauseView.style.height - 150,
			on: {
				down: this.handleResume.bind(this) 
			}
		});

		new MenuButtonView({
			superview: this._pauseView,
			width: 200, 
			height: 80,
			title: 'Quit',
			style: 'RED',
			x: this._pauseView.style.width-offset-200, 
			y: this._pauseView.style.height - 150,
			on: {
				down: this.handleQuit.bind(this) 
			}
		});
	};

	this.initStatusBarTop = function() {
		var width = this._superview.style.width;
		var height = 64;
 
		this._statusBar = new View({
			superview: this._superview,
			width: width,
			height: height,
			//y: this._superview.style.height-64,
			zIndex: this._zIndex
		}); 

		// transparent view
		new View({
			superview: this._statusBar,
			width: width,
			height: height,
			backgroundColor: '#000000',
			opacity: 0.2
		}); 

		this._creditsText = new TextView({
			superview: this._statusBar,
			x: 0,
			width: 100,
			height: height/2,
			horizontalAlign: 'left',
			size: 25,
			text: "Credits: ",
			color: 'white',
		});

		var prefix = Config.itemFolder;
		var self = this;
		for(var i = 0; i < Config.items.length; ++i) {
			var item = Config.items[i];
			var image = new Image({ url: prefix + item.statusImage });
			var imgWidth = image.getWidth() + 20;
			var startX = width/2 - (imgWidth*1.5);

			var itm = new ImageView({
				image: image,
				superview: this._statusBar,
				width: image.getWidth(),
				height: image.getHeight(),
				y: 2,
				x: startX + (i*imgWidth) 
			});
			itm.name = item.className;
			itm.on('InputStart', function() { self.setTopItem(this); });
			this._items.push(itm);
		}
		this._activeItem = this._items[0].name;
		
		// this is the border that will show the user that an item is selected
		var selectedImg = new Image({ url: prefix + 'status/selected.png' });
		this._selectedImageT = new ImageView({
			superview: this._statusBar,
			image: selectedImg,
			width: selectedImg.getWidth(),
			height: selectedImg.getHeight(),
			x: this._items[0].style.x,
			y: this._items[0].style.y
		});
	
	};

	this.initStatusBarBottom = function(lives) {
		var width = this._superview.style.width;
		var height = 64;
 
		this._statusBarBottom = new View({
			superview: this._superview,
			width: width,
			height: height,
			y: this._superview.style.height-height,
			zIndex: this._zIndex
		}); 

		// transparent view
		new View({
			superview: this._statusBarBottom,
			width: width,
			height: height,
			backgroundColor: '#000000',
			opacity: 0.2
		}); 

		this._lifeText = new TextView({
			superview: this._statusBarBottom,
			x: 0,
			width: 100,
			height: height/2,
			horizontalAlign: 'left',
			size: 25,
			text: "Lives: " + lives,
			color: 'white',
		});

		var prefix = Config.kittenFolder;
		var self = this;
		for(var i = 0; i < Config.kittens.length; ++i) {
			var kitten = Config.kittens[i];
			var image = new Image({ url: prefix + kitten.statusImage });
			var imgWidth = image.getWidth() + 8;
			var startX = width/2 - (imgWidth*1.5);

			var itm = new ImageView({
				image: image,
				superview: this._statusBarBottom,
				width: image.getWidth(),
				height: image.getHeight(),
				y: 2,
				x: startX + (i*imgWidth) 
			});
			itm.name = kitten.name;
			itm.on('InputStart', function() { self.setBottomItem(this); });
			this._items.push(itm);
		}

		var selectedImg = new Image({ url: Config.itemFolder + 'status/selected.png' });
		this._selectedImageB = new ImageView({
			superview: this._statusBarBottom,
			image: selectedImg,
			width: selectedImg.getWidth(),
			height: selectedImg.getHeight(),
		});
		this._selectedImageB.hide();

		this._pauseBtn = new ImageView({
			image: 'resources/images/pauseBtn.png',
			superview: this._statusBarBottom,
			width: 50,
			height: 50,
			y: 7,
			x: width - 40 
		});
		this._pauseBtn.on('InputStart', this.handlePause.bind(this));
	};

	// GETTERS
	this.getActiveItem = function() {
		return this._activeItem;
	};

	// SETTERS
	this.setBottomItem = function(item) {
		this._selectedImageT.hide();
		this._selectedImageB.show();
		// move selection border on the selected item
		this._selectedImageB.style.x = item.style.x;
		this._selectedImageB.style.y = item.style.y;
		this._activeItem = item.name;
	};

	this.setCredits = function(credits) {
		this._creditsText.setText('Credits: ' + credits);
	}

	this.setLives = function(lives) {
		this._lifeText.setText('Lives: ' + lives);
	};

	this.setTopItem = function(item) {
		this._selectedImageB.hide();
		this._selectedImageT.show();
		// move selection border on the selected item
		this._selectedImageT.style.x = item.style.x;
		this._selectedImageT.style.y = item.style.y;
		this._activeItem = item.name;
	};

	// EVENT HANDLERS 
	this.handlePause = function() {
		this._pauseView.show();
		this.emit('Pause');
	};

	this.handleResume = function() {
		this._pauseView.hide();
		this.emit('Resume');
	};

	this.handleQuit = function() {
		this._pauseView.hide();
		this.emit('Quit');
	};
});
	
