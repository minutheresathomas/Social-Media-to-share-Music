var express = require('express');
var router = express.Router();
var mysql = require('./db/mysql_connect');
var fs = require('fs');
var crypto = require('crypto');
var redis = require('redis');
var session = require('express-session');
var redisStore = require('connect-redis')(session);
var client = redis.createClient(6379, "localhost");
var multer = require('multer');
var done = false;
var usrID = "";
var moment = require('moment');
var moment = require('moment-timezone');
moment().tz("America/Los_Angeles").format();

/* GET home page. */
router.get('/', function(req, res) {
	res.render('index', {
		title : 'Express'
	});
});

router.get('/signin', function(req, res) {
	res.render('signin');
});

router.get('/explore', function(req, res) {
	res.render('explore');
});

router.get('/trends', function(req, res) {
	res.render('trends');
});

router.get('/wall/:sessionId/getAudio',function(req,res){
	var sessionId = req.params.sessionId;
	console.log("userid: " + sessionId);
	mysql.getAudio(function(err,results){
		if(err){
			throw err;
			console.log(err);
		}else{
			if(results.length == 0)
			{
				var msg = "Not able to get data";
				res.end({Error : msg});
			}
			else
			{
				res.status(200).send(JSON.stringify(results));
			}
		}
	},sessionId);
});
router.get('/wall/:sessionId/user',function(req,res){
	var sessionId = req.params.sessionId;
	console.log("userid: " + sessionId);
	mysql.getMyProfile(function(err,results){
		if(err){
			throw err;
			console.log(err);
		}else{
			if(results.length == 0)
			{
				var msg = "Not able to get data";
				res.status(200).send({
					Error : msg,
					sessionId : req.params.sessionId,
					no_audio:true
					});
			}
			else
			{

				res.status(200).send({
					user:results
					});
			}
		}
	},sessionId);
});

router.get('/wall/:sessionId', function(req, res) {
	var sessionId = req.params.sessionId;
	console.log("userid: " + sessionId);
	mysql.getAudio(function(err,results){
		if(err){
			throw err;
			console.log(err);
		}else{
			if(results.length == 0)
			{
				var msg = "Not able to get data";
				res.status(200).render('wall',{
					Error : msg,
					sessionId : req.params.sessionId,
					no_audio:true
					});
			}
			else
			{
				res.status(200).render('wall',{
					audio:results,
					no_audio:false,
					sessionId:req.params.sessionId
					});
			}
		}
	},sessionId);
	
});

router.get('/search', function(req, res) {
	var keyword = req.query.keyword;
	mysql.getSearchedAudios(function(err,results){
		if(err){
			console.log("ERROR:"+err);
			console.log("ERROR Message:"+err.message);
			throw err;
			
		}else{
			if(results.length == 0)
			{
				var msg = "Not able to retrieve the audio.";
				res.end(err, msg);
			}
			else
			{
				console.log("Result to be forwarded *********** : "+results);
				res.status(200).render('search',{
					audio:results,
					no_audio:false
				});
			}
		}
	}, keyword);
});

router.get('/wall/:sessionId/upload', function(req, res) {
	res.render('upload', {
		sessionId : req.params.sessionId,
	});
	/*getValueOfSessionId(function(userId) {
		console.log(userId);

	}, req.params.sessionId);*/
});

router.get('/signup', function(req, res) {
	res.render('signup');
});

function generate_sessionId(callback) {
	var current_date = (new Date()).valueOf().toString();
	var random = Math.random().toString();
	callback(crypto.createHash('sha1').update(current_date + random).digest(
			'hex'));
}

router.get("/wall/:sessionId/profile",function(req,res){
	var userId = req.params.sessionId;
	mysql.retrieveUserFollowers(function(err,results){
		if(err){
			console.log(err);
			throw err;
			
		}else{
			if(results.length == 0)
			{
				var msg = "Not able to retrieve the audio.";
				res.end(msg);
			}
			else
			{
				res.render('profile',{
					userDetails : results,
					sessionId:userId
				})
			}
		}
	}, userId);
	
});

router.post("/wall/:sessionId/audio/:audioId/like",function(req,res){
	var userId = req.params.sessionId;
	var audioId = req.params.audioId;
	mysql.update_like(function(err,results){
		if(err){
			throw err;
			console.log(err);
		}else{
			if(results.length == 0)
			{
				var msg = "Not able to get data";
				res.end({Error : msg});
			}
			else
			{
				//var data = {audio:results};
				/*res.status(200).send({
					audio:JSON.stringify(results)
				});*/
				console.log(results);
				res.status(200).send(JSON.stringify(results));
			}
		}
	},audioId);
});

function getValueOfSessionId(callback, sessionId) {
	var ses = sessionId;
	client.lrange(ses, 0, -1, function(err, reply) {
		if (err) {
			console.log(err);
		} else {
			console.log('Redis val : ' + reply);
			callback(reply);
		}
	});
}

function getUserId(sessionId) {
	var ses = sessionId;
	var uid = "";
	uid : client.lrange(ses, 0, -1, function(err, reply) {
		if (err) {
			console.log(err);
			//return false;
		} else {
			console.log('Redis val : ' + reply);
			//usrID = reply;
			return reply;
		}
	});
	return uid;
};
router.post('/register', function(req, res) {
	console.log(req.body);
	if (!req.body.hasOwnProperty('firstname')
			|| !req.body.hasOwnProperty('lastname')
			|| !req.body.hasOwnProperty('email')
			|| !req.body.hasOwnProperty('password')) {
		res.statusCode = 500;
		return res.send('Error 500: Post syntax incorrect.');
	}

	mysql.insertUser(function(err, results) {
		if (err) {
			throw err;
			console.log(err);
		} else {
			if (results.length == 0) {
				var msg = "Not able to store the user";
				res.end({
					Error : msg
				});
			} else {
				// console.log(results);
				var usrId = results.insertId;
				generate_sessionId(function(result) {
					if (result.length != 0) {
						req.session.userId = usrId;
						//req.session.sessionId = result;
						req.session.sessionId = usrId;
						console.log(result);
						// res.render(200,'/wall/'+result,{sessionId :
						// req.session.sessionId,userId : req.session.userId})
						res.status(200).send({
							sessionId : req.session.sessionId,
							userId : req.session.userId
						});
						// res.send('{\"sessionId\" : \"'+ req.session.sessionId
						// + '\"}');
					}
				});
			}
		}
	}, req.param('firstname'), req.param('lastname'), req.param('email'), req
			.param('password'));
});

router.post('/login', function(req, res) {
	if (!req.body.hasOwnProperty('email')
			|| !req.body.hasOwnProperty('password')) {
		res.statusCode = 400;
		return res.send('Error 400: Post syntax incorrect.');
	}

	mysql.validateUser(function(err, results) {
		if (err) {
			throw err;
		} else {
			if (results.length == 0) {
				var msg = "Your credentials don't match. Please try again.";
				res.end({
					Error : msg
				});
			} else {
				console.log(results);
				var usrId = results[0].userId;
				console.log(usrId);
				res.status(200).send({
					//sessionId : req.session.sessionId,
					sessionId : usrId
					//userId : req.session.userId
				});
				generate_sessionId(function(result) {
					if (result.length != 0) {
						client.rpush([ result, usrId ], function(err, reply) {
							console.log(reply); // prints 2
						});
						req.session.sessionId = result;
						console.log("Result:" + result);

						/*
						 * res.render('wall', { sessionId :
						 * req.session.sessionId, userId : req.session.userId
						 * });
						 */
						// res.end('{\"sessionId\" : \"'+ req.session.sessionId
						// + '\"}');
					}
				});
			}
		}
	}, req.param('email'), req.param('password'));
});

router.post('/wall/:sessionId/audio', multer({
	dest : './public/music/',
	rename : function(fieldname, filename, req, res) {
		var userId = req.params.sessionId;
		console.log(req.params);
		return filename + "_" + userId;
	},
	/*changeDest: function(dest, req, res) {
		var usrId = "";
		getValueOfSessionId(function(userId){
			//console.log(userId);
			usrId = userId;
		},req.params.sessionId);
		//console.log(req.params);
		  return dest+"_"+usrId;
		},*/
	onFileUploadStart : function(file) {
		//console.log(file.originalname + ' is starting ...');
	},
	onFileUploadComplete : function(file,req, res) {
		//console.log(file.fieldname + ' uploaded to  ' + file.path)
		done = true;
	}
}),function(req, res) {

	if (done == true) {
		console.log(req.files);
		var artPath = "";
		if(req.files.hasOwnProperty('albumArt')){
			artPath = "/static/music/" + req.files.albumArt.name;
		}else{
			artPath = "/static/images/music_default.png";
		}

		var audioPath = "/static/music/" + req.files.audioFile.name;
		var now = moment().tz("America/Los_Angeles").toISOString();
		console.log(now);
		upload_data = {
				"albumArt":artPath,
				"audioFile":audioPath,
				"artist":req.body.artist,
				"title":req.body.title,
				"genre":req.body.genre,
				"description":req.body.description,
				"userId":req.params.sessionId,
				"name":req.files.audioFile.name,
				"created" : now,
		};
		console.log(upload_data);
		mysql.insertAudio(upload_data);
		/*res.status(200).send({
			data:"success"
		});*/
		res.status(200).send("file uploaded");
		//res.end("File uploaded.");
	}
});
module.exports = router;
