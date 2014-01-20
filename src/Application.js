import device;

import ui.TextView as TextView;
import ui.resource.Image as Image;
import ui.ImageView as ImageView;
import ui.View as View;

import src.Config as Config;
import src.Game as Game;
//import src.ClefMenu as ClefMenu;
//import src.LevelMenu as LevelMenu;

exports = Class(GC.Application, function () {

	this.initUI = function () {
		this.scaleUI();

		var offsetX = (this.baseWidth - Config.boundsWidth) / 2;
		var self = this;

		new Game({
			superview: this,
			width: Config.boundsWidth,
			height: Config.boundsHeight,
			x: offsetX
		});

		// black strip top 
		new View({
			superview: this,
			height: Config.boundsHeight,
			width: offsetX,
			backgroundColor: '#000000'
		});
		// black strip bottom 
		new View({
			superview: this,
			height: Config.boundsHeight,
			width: offsetX,
			x: Config.boundsWidth + offsetX,
			backgroundColor: '#000000'
		});
	};
	
	this.launchUI = function () {};

	this.scaleUI = function() {
		// ensures that vertical height always fits within device height
		this.baseHeight = Config.boundsHeight;
		this.baseWidth = device.screen.width * (this.baseHeight / device.screen.height);
		this.scale = device.screen.height / this.baseHeight;

		this.view.updateOpts( {
			scale: this.scale,
			width: this.baseWidth,
			height: this.baseHeight
		});
	};
});
