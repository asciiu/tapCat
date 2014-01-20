import src.Item as Item;

exports = Class(Item, function(supr) {
	
	this.init = function(opts) {
		supr(this, 'init', [opts]);
	};
});
