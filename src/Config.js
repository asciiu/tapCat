
exports = {
        boundsWidth: 576,
	boundsHeight: 1024,
	itemFolder: 'resources/images/items/',
	kittenFolder: 'resources/images/kittens/',
	items: [
		{	
			className: 'MouseTrap',
			statusImage: 'status/trap.png',
			tileImage: 'tile/trap.png',
			qty: 40,
			opts: { 
				costPts: 2, 
				damagePts: 4,
				image: 'resources/images/items/tile/trap.png',
				isObstacle: true,
				maxHits: 4,
				soundFile: 'trapSnap',
				width: 64,
				height: 64,
				zIndex: 5 
			}
		},
		{	
			className: 'Puddle',
			statusImage: 'status/glue.png',
			tileImage: 'tile/glue.png',
			qty: 10,
			opts: {
				costPts: 5,
				damagePts: 1,
				image: 'resources/images/items/tile/glue.png',
				isObstacle: false,
				maxHits: 4,
				soundFile: 'squish',
				speedImpact: 2.0,
				width: 64,
				height: 64,
				zIndex: 5 
			}
		},
		{	
			className: 'Mine',
			statusImage: 'status/mine.png',
			tileImage: 'tile/trap.png',
			qty: 10,
			opts: {
				costPts: 10,
				damagePts: 20,
				image: 'resources/images/items/tile/mine.png',
				isObstacle: false,
				maxHits: 2,
				soundFile: 'explosion',
				width: 64,
				height: 64,
				zIndex: 5
			}
		},
		//{	
		//	className: 'Box',
		//	name: 'box',
		//	statusImage: 'status/box.png',
		//	tileImage: 'tile/box.png'
		//}
	],
	kittens: [
		{	
			name: 'red',
			statusImage: 'status/red.png',
			tileImage: 'tile/redDot.png'
		},
		{	
			name: 'green',
			statusImage: 'status/green.png',
			tileImage: 'tile/greenDot.png'
		},
		{	
			name: 'blue',
			statusImage: 'status/blue.png',
			tileImage: 'tile/blueDot.png'
		},
		{	
			name: 'gold',
			statusImage: 'status/gold.png',
			tileImage: 'tile/goldDot.png'
		},
	]
};
