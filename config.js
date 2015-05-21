var config = {
	'localhost': {
		'apiStringServer' : 'http://localhost:1081',
		'port' : 1080
	},
	'docker': {
		'apiStringServer' : 'http://api:80',
		'port' : 80
	}
};

var args = {};
for (var idx = process.argv.length - 1; idx >= 0; idx--) {
	var argumentRaw = process.argv[idx];
	//not a valid arg
	if(argumentRaw.substr(0,2) !== '--') continue;
	var argument = argumentRaw.split('=');
	if(argument.length === 1) {
		args[argument] = null;
	} else {
		args[argument[0].substr(2)] = argument[1];
	}
};

if(args['env'] === undefined) throw new Error('No environemendt specified');
if(config[args['env']] === undefined) throw new Error('Unknow environnement');

module.exports = config[args['env']];