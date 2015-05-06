var express = require('express');
var redis = require('redis');
var session = require('express-session');
var redisStore = require('connect-redis')(session);
elasticsearch = require('elasticsearch');
var http = require('http');
var mysql = require('./routes/db/mysql_connect');
var crypto = require('crypto');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

elasticClient = new elasticsearch.Client({
	host: 'http://52.8.81.235:9200',
	log: 'trace'
});

var routes = require('./routes/index');
var users = require('./routes/users');
var wall = require('./routes/wall');

var client = redis.createClient(6379, "music4u.q4vpog.ng.0001.usw1.cache.amazonaws.com");
var app = express();

//view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hjs');

//set the limit of input http request
//var app = express();
app.use(bodyParser.json({limit: '100mb'}));
app.use(bodyParser.urlencoded({ limit: '100mb', extended: false }));

app.use(logger('dev'));
//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(__dirname + '/public'));
app.use('/static', express.static(__dirname + '/public'));
app.use(session({
	store: new redisStore({ host: 'music4u.q4vpog.ng.0001.usw1.cache.amazonaws.com', port: 6379, client: client }),
	secret: 'musicforu',
	saveUninitialized: true, // don't create session until something stored,
	resave: true // don't save session if unmodified
}));

app.use('/', routes);
app.use('/wall', wall);
app.use('/users', users);

//catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

//error handlers

//development error handler
//will print stacktrace
if (app.get('env') === 'development') {
	app.use(function(err, req, res, next) {
		res.status(err.status || 500);
		res.render('error', {
			message: err.message,
			error: err
		});
	});
}

//production error handler
//no stacktraces leaked to user
app.use(function(err, req, res, next) {
	res.status(err.status || 500);
	res.render('error', {
		message: err.message,
		error: {}
	});
});

module.exports = app;
