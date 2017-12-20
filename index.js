#!/usr/bin/env node

var connect = require('./lib/connect.js'),
	commander = require('commander'),
	exec = require('child_process').exec,
	config;

config = {
	serverPort: 2346
};

commander
	.option('-d, --directory [dir]', 'Server Directory [./]', './')
	.option('-p, --port <n>', 'Server Directory [./]', './')
	.parse(process.argv);

connect.server({
	root: commander.directory,
	livereload: true,
	port: commander.port || config.port
});

exec('start ' + 'https://localhost:' + config.serverPort + '/');

console.log(commander.directory);