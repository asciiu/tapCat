import ui.ImageView as ImageView;

exports = Class(ImageView, function(supr) {

	this.init = function(opts) {
		supr(this, 'init', [opts]);

		this._isBlocked = false;     // determines if tile can be passed
		this._isOccupied = false;    // does tile have object

		this._object = undefined;    // tile can have one object
		this._hasItems = false;
		this._images = [];
		this._position = {xPos:opts.xPos, yPos:opts.yPos};
	};

	// GETTERS 
	this.getHeight = function() {
		return this.style.height;
	};

	this.getObject = function() {
		return this._object;
	};

	this.getCoordinates = function() {
		return {x: this.style.x, y: this.style.y};
	};

	this.getPosition = function() {
		return this._position;
	};

	this.getWidth = function() {
		return this.style.width;
	};

	// SETTERS 
	this.clear = function() {
		this.removeObject();
		this._isOccupied = false;
		this._isBlocked = false;
	};

	this.removeObject = function() {
		if(this._object){
			this.removeSubview(this._object);
			this._object = undefined;
		}
	};

	this.setBlocked = function(b) {
		this._isBlocked = b;
	};

	this.setObject = function(obj) {
		if(this._object) this.removeObject();
	
		this._object = obj;
		this.addSubview(obj);
	};

	this.setOccupied = function(o) {
		this._isOccupied = o;
	};

	// CHECKERS 
	this.hasObject = function() {
		if(this._object) 
			return true;

		return false;
	};

	this.isBlocked = function() {
		return this._isBlocked;
	};

 	this.isOccupied = function() {
		return this._isOccupied;	
	};

	this.position = function() {
		return this._position;
	};
});
