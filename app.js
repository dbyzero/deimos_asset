//node modules
var express 	= require('express');
var path 		= require('path');
var config 		= require('./config');
var restify 	= require('restify');

//Routing
var app = GLOBAL['app'] = express();
var appRoute			= require('./routes/app');
var spritesheetRoute	= require('./routes/spritesheet');

//vars
app.set('port', config.port);
app.set('title','Webcraft');
app.set("env","development");

//set api connection
app.set("apiConnection", restify.createJsonClient({
   url: config.apiStringServer,
   agent:false,
   headers: {
	  // connection:'close'
   }
}));

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
	res.status(500).send('Error');
});

/**
 * Start application
 */
app.listen(app.get('port'), function() {
	console.log('Express server listening on port ' + app.get('port'));
});
