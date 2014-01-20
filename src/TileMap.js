import event.Emitter as Emitter;
import math.util as util;

import src.AStar as AStar;
import src.Tile as Tile;


exports = Class(Emitter, function(supr) {

	this.init = function(opts) {
		supr(this, 'init', [opts]);

		this._astar = undefined;
		this._numCols = opts.numCols;
		this._numRows = opts.numRows;
		this._superview = opts.superview;
		this._tileSize = opts.tileSize;
		this._tiles = [];
		this._visableBound = opts.visibleBound;
		this._x = opts.x;
		this._y = opts.y;
		this._zIndex = opts.zIndex;

		this.initTiles();
	}; 

	this.initTiles = function() {
		var self = this;

		for(var col = 0; col < this._numCols; ++col) {
			var columnTiles = [];
			var opacity = 1.0;

			for(var row = 0; row < this._numRows; ++row) {
				// we want the last for rows to look disabled
				//if(row >= this._numRows-4) opacity = 0.3;

				var tile = new Tile({
					superview: this._superview,
					width: this._tileSize,
					height: this._tileSize,
					x: this._tileSize * col + this._x,
					y: this._tileSize * row + this._y,
					xPos: col,
					yPos: row,
					image: 'resources/images/tile.png',
					zIndex: this._zIndex 
				});

				// the last 4 rows should be disabled
				if(row < this._visableBound) {
					tile.on('InputStart', function() {
						self.handleTileInput(this);
					});
				} else {
					tile.style.opacity = 0.0;
				}

				columnTiles.push(tile);
			}
			this._tiles.push(columnTiles);
		}
		this._astar = new AStar(this._tiles);
	};

	// GETTERS
	// return grid height in tiles
	this.getNumberOfColumns = function() {
		return this._numCols;
	};
	// returns grid width in tiles
	this.getNumberOfRows = function() {
		return this._numRows;
	};

	// get path from sTile to eTile
	this.getPath = function(tile1, tile2, adjOnly, canOccupyEndPts, ignoreOccupied) { 
		return this._astar.findPath(tile1, tile2, adjOnly, canOccupyEndPts, ignoreOccupied);
	};

	this.getRandomBottomTile = function() {
		var xPos = util.random(0, this._numCols);
		var yPos = this._numRows - 1;
		return this._tiles[xPos][yPos];
	};

	this.getRandomVisibleTile = function(notInUse) {
		var xPos = util.random(0, this._numCols);
		var yPos = util.random(0, this._visableBound);
		var tile = this._tiles[xPos][yPos];
		
		if(!notInUse) return tile;

		while(tile.hasObject() || tile.isOccupied()) {
			xPos = util.random(0, this._numCols);
			Pos = util.random(0, this._numRows);
			
			tile = this._tiles[xPos][yPos];
		}

		return tile;
	};

	this.getTile = function(xPos, yPos) {
		return this._tiles[xPos][yPos];
	};

	this.getTiles = function() {
		return this._tiles;
	};

	this.getTileSize = function() {
		return this._tileSize;
	};


	// EVENTS	
	this.handleTileInput = function(tile) {
		if(!tile.getObject())
			this.emit('TileInput', tile); 
	};
});
