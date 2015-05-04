var path = require('path'),
	http = require('http'),
	https = require('https'),
	fs = require('fs'),
	connect = require('connect'),
	serveStatic = require('serve-static'),
	serveIndex = require('serve-index'),
	liveReload = require('connect-livereload'),
	tiny_lr = require('tiny-lr'),
	opt = {},
	ConnectApp,
	server,
	lr;

ConnectApp = (function() {
	function ConnectApp(options) {
		opt = options;
		opt.port = opt.port || '8080';
		opt.root = opt.root || path.dirname(module.parent.id);
		opt.host = opt.host || 'localhost';

		this.server();
	}

	ConnectApp.prototype.server = function() {
		var app = connect();
		this.middleware().forEach(function(middleware) {
			return app.use(middleware);
		});
		if (opt.https != null) {
			server = https.createServer(app);
		} else {
			server = http.createServer(app);
		}
		app.use(serveIndex(typeof opt.root === 'object' ? opt.root[0] : opt.root));
		return server.listen(opt.port, (function(_this) {
			return function(err) {
				var sockets, stopServer, stoped;
				if (err) {
					return _this.log('Error on starting server: ' + err);
				} else {
					_this.log('Server started http://' + opt.host + ':' + opt.port);
					stoped = false;
					sockets = [];
					server.on('close', function() {
						if (!stoped) {
							stoped = true;
							return _this.log('Server stopped');
						}
					});
					server.on('connection', function(socket) {
						sockets.push(socket);
						return socket.on('close', function() {
							return sockets.splice(sockets.indexOf(socket), 1);
						});
					});
					stopServer = function() {
						if (!stoped) {
							sockets.forEach(function(socket) {
								return socket.destroy();
							});
							server.close();
							return process.nextTick(function() {
								return process.exit(0);
							});
						}
					};
					process.on('SIGINT', stopServer);
					process.on('exit', stopServer);
					if (opt.livereload) {
						tiny_lr.Server.prototype.error = function() {};
						lr = tiny_lr();
						lr.listen(opt.livereload.port);
						return _this.log('LiveReload started on port ' + opt.livereload.port);
					}
				}
			};
		})(this));
	};

	ConnectApp.prototype.middleware = function() {
		var middleware;
		middleware = opt.middleware ? opt.middleware.call(this, connect, opt) : [];
		if (opt.livereload) {
			if (typeof opt.livereload === 'boolean') {
				opt.livereload = {};
			}
			if (!opt.livereload.port) {
				opt.livereload.port = 35729;
			}
			middleware.push(liveReload({
				port: opt.livereload.port
			}));
		}
		if (typeof opt.root === 'object') {
			opt.root.forEach(function(path) {
				return middleware.push(serveStatic(path));
			});
		} else {
			middleware.push(serveStatic(opt.root));
		}
		if (opt.fallback) {
			middleware.push(function(req, res) {
				return require('fs').createReadStream(opt.fallback).pipe(res);
			});
		}
		return middleware;
	};

	ConnectApp.prototype.log = function(text) {
		this.text = text;
		if (!opt.silent) {
			return console.log(this.text);
		}
	};

	ConnectApp.prototype.logWarning = function(text) {
		this.text = text;
		if (!opt.silent) {
			return console.log(this.text);
		}
	};

	return ConnectApp;

})();

module.exports = {
	server: function(options) {
		options = options || {};

		return new ConnectApp(options);
	},
	serverClose: function() {
		return server.close();
	}
};