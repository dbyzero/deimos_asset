//node modules
var express			= require('express');
var path			= require('path');

var config			= require('./config');

var app = express();
var appRoute			= require('./routes/app');
var spritesheetRoute	= require('./routes/spritesheet');

//vars
app.set('port', config.port);
app.set('title','Webcraft');
app.set("env","development");

//setting
app.enable("strict routing");
app.enable("case sensitive routing");

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', appRoute);
app.use('/spritesheet', spritesheetRoute);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

/// error handlers
//log error
app.use(function(err, req, res, next) {
	console.error(err.stack);
	next(err);
});

// no stacktraces leaked to user if not in development
app.use(function(err, req, res, next) {
	res.status(err.status || 500);
	res.render('error', {
		message: err.message,
		error: (app.get('env') === 'development') ? err : {}
	});
});

/**
 * Start application
 */
app.listen(app.get('port'), function() {
	console.log('Express server listening on port ' + app.get('port'));
});