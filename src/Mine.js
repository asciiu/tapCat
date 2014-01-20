import math.geom.Rect as Rect;
import ui.resource.Image as Image;
import ui.ImageView as ImageView;
import ui.SpriteView as SpriteView;
import ui.View as View;

import animate;
import AudioManager;
import src.Item as Item;

exports = Class(Item, function(supr) {
	
	this.init = function(opts) {
		supr(this, 'init', [opts]);

		this._isExloding = false;

		this._animation = new SpriteView({
                        loop: false,
                        superview: this,
			frameRate: 15,
                        width: 100,
                        height: 100,
			y: -30,
			x: -18,
                        sheetData: {
                                url: 'resources/images/explosion.png',
                                anims: {
                                        explosion: [[0,0] , [2,0], [3,0], [1,0]],
                                }
                        }
                });
	};

	this.getBoundingShape = function() {
		var rect = supr(this, 'getBoundingShape');
		
		if(!this._isExploding) return rect;

		var blastRect = this._animation.getBoundingShape();
		rect = new Rect(blastRect.x + rect.x,
				blastRect.y + rect.y,
				blastRect.width,
				blastRect.height);
		return rect;
	};

	this.hit = function(enemy) {
		enemy.hit(this._damagePts);

		if(this._isExploding) return;
		this._isExploding = true;

		--this._hitCount;
		if(this._hitCount < 0) this._trapView.hide();
		else this._hitMarks[this._hitCount].hide();

		this._audioManager.play(this._soundFile);

		var self = this;
		this._animation.startAnimation('explosion', {callback: function() {
			self._isExploding = false;

			if(self._hitCount < 0) {
				self.reset();
				self.emit('Destroyed', this);
			}
		}});
	};
});
