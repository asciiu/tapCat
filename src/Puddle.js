import src.Item as Item;

exports = Class(Item, function(supr) {
	
	this.init = function(opts) {
		supr(this, 'init', [opts]);

		this._speedImpact = opts.speedImpact;
	};

	this.hit = function(enemy) {
		// can't affect enemies already impedded 
		if(enemy.isSpeedDecreased()) return;

		enemy.decreaseSpeed(this._speedImpact);

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

});
