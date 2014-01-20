import src.Box as Box;
import src.Mine as Mine;
import src.MouseTrap as MouseTrap;
import src.Puddle as Puddle;

exports.make = function(className, opts) {
	if(className == 'Box') return new Box(opts);
	if(className == 'Mine') return new Mine(opts);
	if(className == 'MouseTrap') return new MouseTrap(opts);
	if(className == 'Puddle') return new Puddle(opts);
};
