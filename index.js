var connect = require('./lib/connect.js'),
	commander = require('commander'),
	exec = require('child_process').exec,
	config;

config = {
	port: 2345
};

commander
	.option('-d, --dictionary [dir]', 'Server Dictionary [./]', './')
	.parse(process.argv);

connect.server({
	root: commander.dictionary,
	livereload: true,
	port: config.port
});

exec('start ' + 'http://localhost:' + config.port + '/index.js');


// console.log(process.platform);
console.log(commander.dictionary);