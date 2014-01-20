exports = Class(function() {
    this.init = function(sourceGrid) {
        var row;
        var x, z;
        
        this._sourceGrid = sourceGrid;
        this._width = sourceGrid.length;
        this._height = sourceGrid[0].length;
        this._limit = this._width * this._height;
        
        this._grid = [];
        for (z = 0; z < this._height; z++) {
            for (x = 0; x < this._width; x++) {
                this._grid.push({
                    parent: null,
                    value: z * this._width + x,
                    x: x,
                    z: z,
                    t: 0
                });
            }
        }

        this._neighbourList = [];
        for (x = 0; x < 8; x++) {
            this._neighbourList.push({x: 0, z: 0});
        }

        this._t = 1;
    };

    this._valid = function(x, z, ignoreOccupied) {
        if(ignoreOccupied)
        	return !this._sourceGrid[x][z].isBlocked();
        else 
        	return !this._sourceGrid[x][z].isOccupied() && !this._sourceGrid[x][z].isBlocked();
    };

    this._tile = function(index) {
        var tile = this._grid[index],
            t = this._t;

        if (tile.t < t) {
            tile.f = 0;
            tile.g = 0;
            tile.t = t;
        }

        return tile;
    };
    
    this._findPath = function(startX, startZ, endX, endZ, adjacentOnly, ignoreOccupied)  {
        var result = [],
            grid = this._grid,
            path = [],
            width = this._width,
            end = this._tile(endZ * width + endX),
            open = [startZ * width + startX],
            neighbourList = this._neighbourList,
            neighbour,
            node,
            currentNode,
            length,
            max, min,
            i;

        this._t++;

        while (length = open.length) {
            max = this._limit;
            min = -1;
            for (i = 0; i < length; i++) {
                if (grid[open[i]].f < max) {
                    max = grid[open[i]].f;
                    min = i;
                }
            };

            node = this._tile(open.splice(min, 1)[0]);
            if (node.value === end.value) {
                currentNode = node;
                while (!((currentNode.x === startX) && (currentNode.z === startZ))) {
                    result.push([currentNode.x, currentNode.z]);
                    currentNode = currentNode.parent;
                };
            } else {
                i = this._neighbours(node.x, node.z, adjacentOnly, ignoreOccupied);
                while (i) {
                    neighbour = neighbourList[--i];
                    currentNode = this._tile(neighbour.z * width + neighbour.x);
                    if (!path[currentNode.value]) {
                        path[currentNode.value] = true;
                        currentNode.parent = node;
                        currentNode.g = this._manhattan(neighbour, node) + node.g;
                        currentNode.f = this._manhattan(neighbour, end) + currentNode.g;
                        open.push(currentNode.value);
                    };
                };
            };
        };

        return result;
    };

    this.findPath = function(tile1, tile2, adjacentOnly, canOccupyStartAndEnd, ignoreOccupied) { 
	
	var tilePosA = tile1.getPosition();
	var tilePosB = tile2.getPosition();
	var startX = tilePosA.xPos;
	var startZ = tilePosA.yPos;
	var endX = tilePosB.xPos;
	var endZ = tilePosB.yPos;

        var canOccupyStart = this._sourceGrid[startX][startZ].isOccupied();
	var canOccupyEnd = this._sourceGrid[endX][endZ].isOccupied();	

	if(canOccupyStartAndEnd) {
        	//this._sourceGrid[startX][startZ].setOccupied(false);
		this._sourceGrid[endX][endZ].setOccupied(false);	

        	//this._sourceGrid[startX][startZ].setBlocked(false);
		this._sourceGrid[endX][endZ].setBlocked(false);	
	}
        var path = this._findPath(startX, startZ, endX, endZ, adjacentOnly, ignoreOccupied);
        
        this._sourceGrid[startX][startZ].setOccupied(canOccupyStart);
	this._sourceGrid[endX][endZ].setOccupied(canOccupyEnd);	

	return path;
        //var path1, path2;

        //this._wrap = false;
        //path1 = this._findPath(startX, startZ, endX, endZ);
        //this._wrap = true;
        //path2 = this._findPath(startX, startZ, endX, endZ);

        //return (path1.length < path2.length) ? path1 : path2;
    };

    //this.findRandomPath = function(tile1, tile2) {
    //    var path = [];
    //    var random = ~~(Math.random() * 5) + 1;
    //    var startX = tile1.xPos;
    //    var startZ = tile1.yPos;
    //    var t, endX, endZ;
    //    //console.log(random);
    //    //while(random) {

    //    	endX = startX;
    //    	endZ = startZ;
    //    	if(~~(Math.random() * 3) % 2 == 0) 
    //    		endX = ~~(Math.random() * this._width);
    //    	else
    //    		endZ = ~~(Math.random() * this._height);
 
    //    	path = path.concat(this.findPath(startX, startZ, endX, endZ, true, true));

    //    	startX = endX;
    //    	startZ = endZ;

    //    	if(startX == tile2.xPos && startZ == tile2.yPos) { 
    //    		return path;
    //    		//break;
    //    	}
    //    	--random;
    //    //}

    //    path = path.concat(this.findPath(startX, startZ, tile2.xPos, tile2.yPos, true, true));
    //    
    //    return path;
    //};

    this._neighbours = function(x, z, adjacentOnly, ignoreOccupied) {
        var neighbourList = this._neighbourList,
            neighbourCount = 0,
            neighbour,
            width = this._width,
            height = this._height,
            x1Valid, x2Valid, z1Valid, z2Valid,
            z1, z2, x1, x2;

        if (this._wrap) {
            x1 = (x + width - 1) % width;
            x2 = (x + width + 1) % width;
            z1 = (z + height - 1) % height;
            z2 = (z + height + 1) % height;
            x1Valid = this._valid(x1, z, ignoreOccupied),
            x2Valid = this._valid(x2, z, ignoreOccupied);
            z1Valid = this._valid(x, z1, ignoreOccupied);
            z2Valid = this._valid(x, z2, ignoreOccupied);
        } else {
            x1 = x - 1;
            x2 = x + 1;
            z1 = z - 1;
            z2 = z + 1;
		
	    x1Valid = (x1 > -1) && this._valid(x1, z, ignoreOccupied);
	    x2Valid = (x2 < width) && this._valid(x2, z, ignoreOccupied);
	    z1Valid = (z1 > -1) && this._valid(x, z1, ignoreOccupied);
	    z2Valid = (z2 < height) && this._valid(x, z2, ignoreOccupied);
        }
            
        if (x1Valid) {
            neighbour = neighbourList[neighbourCount];
            neighbour.x = x1;
            neighbour.z = z;
            neighbourCount++;
        }
        if (x2Valid) {
            neighbour = neighbourList[neighbourCount];
            neighbour.x = x2;
            neighbour.z = z;
            neighbourCount++;
        }

        if (z1Valid) {
            neighbour = neighbourList[neighbourCount];
            neighbour.x = x;
            neighbour.z = z1;
            neighbourCount++;

	    if(!adjacentOnly) {
		    if (x2Valid && this._valid(x2, z1, ignoreOccupied)) {
			neighbour = neighbourList[neighbourCount];
			neighbour.x = x2;
			neighbour.z = z1;
			neighbourCount++;
		    }
		    if (x1Valid && this._valid(x1, z1, ignoreOccupied)) {
			neighbour = neighbourList[neighbourCount];
			neighbour.x = x1;
			neighbour.z = z1;
			neighbourCount++;
		    }
	    }
        }
        if (z2Valid) {
            neighbour = neighbourList[neighbourCount];
            neighbour.x = x;
            neighbour.z = z2;
            neighbourCount++;

	    if(!adjacentOnly) {
		    if (x2Valid && this._valid(x2, z2, ignoreOccupied)) {
			neighbour = neighbourList[neighbourCount];
			neighbour.x = x2;
			neighbour.z = z2;
			neighbourCount++;
		    }
		    if (x1Valid && this._valid(x1, z2, ignoreOccupied)) {
			neighbour = neighbourList[neighbourCount];
			neighbour.x = x1;
			neighbour.z = z2;
			neighbourCount++;
		    }
	    }
        }

        return neighbourCount;
    };

    this._manhattan = function(point, end) {
        return Math.abs(point.x - end.x) + Math.abs(point.z - end.z);
    };
});
