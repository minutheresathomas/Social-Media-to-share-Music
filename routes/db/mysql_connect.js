var mysql = require('mysql');
var async = require('async');
var redis = require('redis');
var client = redis.createClient(6379, "localhost");

var underscore = require('underscore');
//var esIndex = require("./elasticSearchIndex");
//var elasticsearch = require('elasticsearch')
var pool = mysql.createPool({
	host     : 'localhost',
	user     : 'root',
	password : 'sample123',
	port: '3306',
	database: 'musik4u'
});


/*var elasticClient = new elasticsearch.Client({
	host: 'localhost:9200',
	log: 'trace'
});*/



function insertUser(callback,firstname,lastname,email,confirm_password){

	var pic = "/static/images/defaultavatar.png";
	var sql = "INSERT INTO user (password, firstname, lastname, email,picture) VALUES('"+ confirm_password + "','" + firstname + "','" + lastname + "','" + email + "','"+ pic+ "')";
	console.log(sql);
	pool.getConnection(function(err, connection){
		connection.query(sql, function(err, results) {
			if (err) {
				throw err;
			}
			else
			{
				callback(err, results);
			}
			console.log(results);
		});
		connection.release();
	});
}

function validateUser(callback,email,password){
	console.log("Email: " + email + "Password: " + password);
	var sql = "SELECT * FROM user where email = '" + email + "'" + " and password = '" + password + "'";
	//console.log(sql);
	pool.getConnection(function(err, connection){
		connection.query( sql,  function(err, rows){
			if(err)	{
				throw err;
			}else{
				//console.log("DATA : "+JSON.stringify(rows));
				callback(err, rows);
			}
		});
		connection.release();
	});
}

function getMyProfile(callback,userId,profileId){
	//console.log("Email: " + email + "Password: " + password);
	var sql = "SELECT * from user where userId = ?";
	//var sql1 = "select * from follower"
	//console.log(sql);
	pool.getConnection(function(err, connection){
		connection.query( sql,[profileId],  function(err, rows){
			if(err)	{
				throw err;
			}
		});
		connection.release();
	});
}

function updateProfile(data){
	var sql = "update user SET firstname='"+data.firstname+"', lastname='"+data.lastname+"',picture='"+data.picture+"' where userId= "+data.userId;
	console.log(sql);
	pool.getConnection(function(err,connection){
		connection.query(sql,function(err,rows){
			if(err){
				throw err;
			}else{
				console.log(rows);
			}
		});
		connection.release();
	});
}

function getAudio(callback,userId){
	//console.log(userId);
	//var sql = "SELECT a.*, u.* , case when l.like_value = '1' then 'active' else '' end as my_like from audio as a join user as u on u.userId = a.userId left join likes_table as l on l.audio_id = a.audio_id where a.userId = "+userId+" or a.userId in (select f.followerId from followerList as f where f.userId = "+userId+") order by a.created_at DESC";
	//var sql = "SELECT * from audio as a join user as u on u.userId = a.userId where a.userId ="+userId+" or a.userId in (select f.followerId from followerList as f where f.userId = "+userId+") order by a.created_at DESC";
	var sql = "select s.*, count(l.like_id) as likeCount from (select a.*, u.firstname,u.lastname,u.picture from audio as a join user as u on a.userId = u.userId where a.userId = "+userId+" or a.userId IN (select f.userId from followerlist as f where f.followerId = "+userId+")) as s left outer join likes_table as l on s.audio_id = l.audio_id group by s.audio_id order by created_at DESC";
	//console.log(sql);
	pool.getConnection(function(err,connection){
		connection.query(sql,function(err,rows){
			if(err){
				throw err;
			}else{
				//console.log(JSON.stingify(rows));
				var audio = rows;				
				getUserDetails(function (err,results) {
					if(err){
						throw err;
					}else{
						var userData = results;
						if(audio.length == 0){
							var jsonObj = {
								'audio' : audio,
								'userData': userData,
								'sessionId' : userId,
								'no_audio' : true
							};
							callback(err,jsonObj);
						}else{
							var jsonObj = {
								'audio' : audio,
								'userData': userData,
								'sessionId' : userId,
								'no_audio' : false
							};
							callback(err,jsonObj);
						}
						
					}
				},userId);
			}
		});
		connection.release;
	});
}

function getUserDetails(callback,userId) {
	var sql = "select firstname,lastname,picture from user where userId = "+userId;
	pool.getConnection(function (err,connection) {
		connection.query(sql,function(err,results){
			if(err){
			throw err;
			}else{
				callback(err,results);
			}
		});
		connection.release;
	});
}

function getAudioById(callback,audioId,userId){
	//console.log(userId);
	//var sql = "SELECT a.*, u.* , case when l.like_value = '1' then 'active' else '' end as my_like from audio as a join user as u on u.userId = a.userId left join likes_table as l on l.audio_id = a.audio_id where a.userId = "+userId+" or a.userId in (select f.followerId from followerList as f where f.userId = "+userId+") order by a.created_at DESC";
	//var sql = "SELECT * from audio as a join user as u on u.userId = a.userId where a.userId ="+userId+" or a.userId in (select f.followerId from followerList as f where f.userId = "+userId+") order by a.created_at DESC";
	var sql = "select s.*, count(l.like_id) as likeCount from (select a.*, u.firstname,u.lastname,u.picture from audio as a join user as u on a.userId = u.userId where a.audio_id = "+audioId+" ) as s left outer join likes_table as l on s.audio_id = l.audio_id group by s.audio_id order by created_at DESC";
	//console.log(sql);
	pool.getConnection(function(err,connection){
		connection.query(sql,function(err,rows){
			if(err){
				throw err;
			}else{
				//console.log(JSON.stingify(rows));
				//callback(err,rows);
				var audios = rows;
				var sql_like = "select * from likes_table where audio_id= "+audioId+" and user_id = "+userId;
				connection.query(sql_like,function (err,results) {
					if(err){
						throw err;
					}else{
						var audLike = false;
						if(results.length != 0){
							audLike = true;
						}else{
							audLike = false;
						}
						getUserDetails(function (err,result) {
							if(err){
								throw err;
							}else{
								var jsonData = {
									'sessionId' : userId,
									'audio' : audios,
									'audLike' : audLike,
									'userData': result,
									'no_audio': false
								};
						callback(err,jsonData);
							}
						},userId);
						
					}
				});
			}
		});
		connection.release;
	});
}
function getHomeAudioLatest(callback, slimit, elimit){
	var sql = "SELECT * FROM Audio JOIN Likes JOIN Comments ORDER BY creationDate DESC LIMIT "+slimit+", "+elimit;
	pool.getConnection(function(err, connection){
		connection.query( sql,  function(err, rows){
			if(err)	{
				throw err;
			}else{
				if(rows.length!==0){
					//console.log("DATA : "+JSON.stringify(rows));
					callback(err, JSON.stringify(rows));
				}
			}
		});
		connection.release();
	});
}

function getCommentsByAudio(callback,audioId){
	var sql = "select c.*, u.firstname,u.lastname, u.picture from comments as c join user as u on c.follower_id = u.userId where c.audio_id = " + audioId + " order by c.created_at";
	//console.log(sql);
	pool.getConnection(function (err,connection) {
		connection.query(sql, function(err,rows){
			if(err){
				throw err;
			}else{
				console.log(rows);
				callback(err,rows);
			}
		});
		connection.release();
	});
	
}

function postCommentsByAudio(callback,data){
	var audio_id = data.audio_id;
	var user_id = data.user_id;
	var comment = data.comment;
	var created_at = data.created_id;
	var sql = "insert into comments (audio_id,follower_id,created_at,comment) values(?,?,?,?)";
	//console.log(created_at);
	pool.getConnection(function (err,connection) {
		connection.query(sql,[audio_id,user_id,created_at,comment], function(err,rows){
			if(err){
				throw err;
			}else{
				console.log(rows);
				var comment_id = rows.insertId;
				var sql_a = "select c.*, u.firstname,u.lastname, u.picture from comments as c join user as u on c.follower_id = u.userId where c.comment_id = " + comment_id + " order by c.created_at ASC";
				connection.query(sql_a,function (err,result) {
					if(err){
						throw err;
					}else{
						console.log(result);
						callback(err,result);	
					}
				});
			}
		});
		connection.release();
	});
	
}

function getHomeAudioTrendy(callback){
	var sql = "SELECT DISTINCT audioLiked, COUNT(audioLiked) AS CountOfLikes FROM Likes GROUP BY audioLiked;";
	pool.getConnection(function(err, connection){
		connection.query( sql,  function(err, rows){

			if(rows.length!==0){
				var audios = [];
				//async
				async.forEach(rows, getSpecificAudio, afterAllTasks);
				function getSpecificAudio(row, callback)
				{
					//console.log('JSON row : '+JSON.stringify(row));
					var audioRow = JSON.stringify(row);
					var audioId = row.audioLiked;
					var numLikes = row.CountOfLikes;
					var audioList = row;
					//console.log("num of likes : "+numLikes);
					var sqlCom = "SELECT COUNT(audioId) AS CountOfComments FROM Comments WHERE audioId = "+ audioId +" GROUP BY audioId";
					connection.query( sqlCom,  function(err, row){
						if(err)	{
							//console.log(err);
							throw err;
						}else{
							if(row.length!=0) {
								var numComments = row[0].CountOfComments;
								//console.log("num of comments : "+numComments);
							}
							else {
								var numComments = 0;
							}
							var sql = "SELECT * FROM Audio WHERE audioId = "+audioId;
							connection.query( sql,  function(err, row){
								if(err)	{
									throw err;
								}else{
									if(row.length!==0){
										audios.push("{\"audio\":"+JSON.stringify(row)+",\"comments\":"+numComments+",\"likes\":"+numLikes);
										callback(err);
									}
								}
							});
						}
					});
				}
				function afterAllTasks(err) {
					//console.log("DATA : "+audios);
					callback(err, audios);
				}
			}
		});
		connection.release();
	});
}

exports.retrieveAudio=function(callback, userId, audioId){
	//console.log(userId+":"+audioId);
	var selectSql="select * from audio where audioId= ? and owner= ?";
	pool.getConnection(function(err, connection){
		connection.query(selectSql, [audioId,userId], function (err,results){
			if (err) {
				//console.log("ERROR: " + err.message);
				//res.send(err.message);
				throw err;
			}else{
				//console.log("second query");
				var audios = JSON.stringify(results);
				var commentSql="select * from comments where audioId= ? and userId= ?";
				connection.query(commentSql, [audioId,userId], function (err,comments){
					if (err) {
						//console.log(err);
						throw err;

					}else{
						//console.log("third query");
						var comment=JSON.stringify(comments);
						var likeSql="select count(*) as numberOfLikes from Likes where audioLiked= ? and whoLikes= ? and likeStatus=1";
						connection.query(likeSql, [audioId,userId], function (err,numberOfLikes){
							if (err) {
								//console.log(err);
								throw err;

							}else{
								//console.log(numberOfLikes[0].numberOfLikes);
								//res.json({"audio":results,"comments":comment,"likes":numberOfLikes});
								callback("{\"audio\":"+audios+",\"comments\":"+comment+",\"likes\":"+JSON.stringify(numberOfLikes)+"}");
							}
						});
					};
				});
			};
		});
		connection.release();
	});
};

/*function audioUpload1(callback, userId, author, language, genre, producer, director, description, releaseDate, audioName, owner, audioFileLoc, creationDate, lastModified, audioId){
	var sql="insert into Audio(audioId,author,language, genre,producer,director, description,releaseDate,audioName,owner,audioFileLoc,lastModified) values (?,?,?,?,?,?,?,?,?,?,?,?)";

	pool.getConnection(function(err, connection){
		connection.query(sql, [audioId,author,language, genre,producer,director, description,releaseDate,audioName,owner,audioFileLoc,creationDate,lastModified],
				function (err,rows,fields){
			if (err) {
				//console.log("ERROR: " + err.message);
				callback(err.message);
			}else{

				if(rows.length!=0)
				{
					var getsql = "select * from audio where audioId= "+audioId;
					connection.query( getsql,  function(err, row){
						if(err) {
							throw err;
						}
						else
						{
							if(row.length!=0){
								//console.log('Row : '+JSON.stringify(row));
								//index into the elastic search
								var rowId = row[0].audioId;
								//console.log('rowId : '+rowId);
								var jsonrow = JSON.stringify(row);
								var rowId1 = jsonrow.audioId;
								//console.log('json rowId : '+rowId1);

								elasticClient.create({
									index: 'music4u',
									type: 'musictype',
									id: rowId,
									body: {
										audioName: row[0].audioName,
										owner: row[0].owner,
										author: row[0].author,
										language: row[0].language,
										genre: row[0].genre,
										producer: row[0].producer,
										director: row[0].director,
										description: row[0].description
									}
								}, function (err, results){
									if(err)
										throw err;
									else
									{
										//console.log(results);
									}
								});
							}
						}
					});
				}
			}
		});
		connection.release();
	});
}*/

function insertAudio(data){
	var userId = data.userId;
	var sql = "insert into audio(albumArt,audioFile, userId,artist,title, genre_id,description,name,created_at) values('"+data.albumArt+"','"+data.audioFile+"','"+data.userId+"','"+data.artist+"','"+data.title+"','"+data.genre+"','"+data.description+"','"+data.name+"','"+data.created+"')";
	pool.getConnection(function(err, connection){
		connection.query(sql, function(err, results) {
			if (err) {
				throw err;
			}
			else {
				var audioId = results.insertId;
				// ES insert
				var selectUserSql = "Select * from user where userId = ?";
				connection.query(selectUserSql, [userId], function (err,users){
					if (err) {
						throw err;

					}else{
						var user = users;
						var lastName = users[0].lastname;
						var firstName = users[0].firstname;
						var picture = users[0].picture;
						var numLikes =0;
						elasticClient.create({
							index: 'music4u',
							type: 'musictype',
							id: audioId,
							body: {
								artist: data.artist,
								title: data.title,
								genre: data.genre,
								description: data.description,
								albumart: data.albumArt,
								audioFile: data.audioFile,
								userId: data.userId,
								userLastName: lastName,
								userFirstName: firstName,
								picture: picture,
								numOfLikes: numLikes,
								createdAt: data.created
							}
						}, function (err, results){
							if(err)
								throw err;
							else
							{
								console.log(results);
								var getsql = "select * from audio where audio_id= ?";
								connection.query( getsql,[audioId],  function(err, audios){
									if(err) {
										throw err;
									}
									else
									{
										if(audios.length!=0){
											getAllFollowers(function(err,audio){
												console.log("got back");
												if(err)throw err;
												else{
												}
											},userId,audios[0]);
										}
									}
								});
							}
						}); // inserted into elastic search
//							var getsql = "select * from audio where audio_id= ?";
//							connection.query( getsql,[audioId],  function(err, audios){
//								if(err) {
//									throw err;
//								}
//								else
//								{
//									if(audios.length!=0){
//										getAllFollowers(function(err,audio){
//											console.log("got back");
//											if(err)throw err;
//											else{
//											}
//										},userId,audios[0]);
//									}
//								}
//							});
					}
				});
			}
		});
		connection.release();

	});
}

function getAllFollowers(callback,userId,audio){
	console.log("inside followers he he ");
	var followerSql="select followerId from followerlist where userId= ?";
	pool.getConnection(function(err, connection){
		connection.query( followerSql,[userId],  function(err, followers){

			if(followers.length!=0){
				console.log(followers);
				async.forEach(followers,function(followeMe, index, arr){
					client.get(followeMe.followerId, function(err, socketId) {
						console.log(socketId);
						if (err) throw err;
						if(socketId != null){
							console.log("emit");
							io.sockets.connected[socketId].emit("newsfeeds",audio);
						}
					});

				});
			}
			//callback(audio);

		});
		connection.release();
	});

}

function update_like(callback, data){
	var sql_select = "SELECT count(audio_id) as count FROM likes_table WHERE audio_id = '4' AND user_id = '40'";
	var sql_insert = "INSERT INTO likes_table (audio_id, user_id,like_value) values ('4','40','0')";
	var sql_update = "UPDATE likes_table SET like_value = '1' WHERE audio_id = '4' AND user_id = '40'";
	console.log(sql_select);
	pool.getConnection(function(err, connection){
		connection.query(sql_select, function(err, results) {
			if (err) {
				throw err;
			}
			if(results.count == 0){
				pool.getConnection(function(err, connection){
				connection.query(sql_insert, function(err, results) {
					if (err) {
						throw err;
					}
					else {
						// elasticClient.search({
						// 	  index: 'music4u',
						// 	  q: '_id:'+data
						// 	}, function (error, response) {
						// 		var hits = response.hits.hits;
						// 		console.log('Hits(Minu)******** : '+JSON.stringify(hits));
						// 		// parse the existing fields increment or decrement the like and re insert
						// 	});
					}
				});
				connection.release();
				});
			}else{
				pool.getConnection(function(err, connection){
				connection.query(sql_update, function(err, results) {
					if (err) {
						throw err;
					}
				});
				connection.release();
				});
			}
		});
		connection.release();
	});
}

function getSearchedAudios(callback, keyword){
	// elastic search
	console.log("Keyword : "+keyword);
	elasticClient.search({
		index: 'music4u',
		q: '_all:'+keyword+"*"
	}, function (error, response) {
		var hits = response.hits.hits;
		console.log("Hits **** "+JSON.stringify(hits));
		if(response.hits.total == 0)
		{
			var msg = "No such audio";
			var errorMsg = {'Message': msg};
			callback(error, msg);
		}
		else {
			var jsontotal = { 'total' : hits.total,
				'message': "success",
				'no_audio':false};
			var audios = [];
			console.log("Hits multi-match : "+JSON.stringify(hits));

			//get the users and iterate through each of them
			async.forEach(hits, getEachAudio, afterAllTasks);
			function getEachAudio(row, callback)
			{
				var audioDetails = row._source;
				console.log("user Details : "+JSON.stringify(audioDetails));
				var aArtist = audioDetails.artist;
				var atitle = audioDetails.title;
				var agenre = audioDetails.genre;
				var adescription = audioDetails.description;
				var aalbumart = audioDetails.albumart;
				var aaudioFile = audioDetails.audioFile;
				var auserId = audioDetails.userId;
				var auserFirstName = audioDetails.userFirstName;
				var auserLastName = audioDetails.userLastName;
				var anum_likes = audioDetails.numOfLikes;
				var apicture = audioDetails.picture;

				var audioData = {
					'artist' : aArtist,
					'title' : atitle,
					'genre' : agenre,
					'description' :adescription,
					'albumArt' :aalbumart,
					'audioFile' :aaudioFile,
					'userId' : auserId,
					'userFirstName' :auserFirstName,
					'userLastName' :auserLastName,
					'numOfLikes' :anum_likes,
					'picture' : apicture
				};
				audios.push(audioData);
				callback(error);
			};
			function afterAllTasks(err) {
				var jsonAudios = underscore.extend(jsontotal, {'audio' : audios});
				callback(err, jsonAudios);
			}
			
		}
		//callback(error, hits);
	});
}

function getSearchedUsers(callback, keyword, myUserId){
	// elastic search
	var myId = myUserId;
	elasticClient.search({
		index: 'music4u',
		type: 'musictype',
		body: {
			query: {
				multi_match: {
					query: keyword,
					fields: ["userFirstName", "userLastName"],
				}
			}
		}
	}, function (error, response) {
		if(error)
		{
			throw error;
		}
		else {
			if(response.hits.total == 0)
			{
				var msg = "No such person to follow";
				var errorMsg = {'Message': msg};
				callback(error, msg);
			}
			else {
				var err = error;
				var hits = response.hits;
				var jsontotal = { 'total' : hits.total,
						'sessionId':myId,
						'message': "success",
						'no_users':false};
				var hithits = hits.hits;
				var users = [];
				console.log("Hits multi-match : "+JSON.stringify(hits));
				
				//get the users and iterate through each of them
				async.forEach(hithits, getEachUser, afterAllTasks);
				function getEachUser(row, callback)
				{
					var userDetails = row._source;
					console.log("user Details : "+JSON.stringify(userDetails));
					var firstName = userDetails.userFirstName;
					var lastName = userDetails.userLastName;
					var picture = userDetails.picture;
					var userId = userDetails.userId;
					
					var userData = {
						'firstName' : firstName,
						'lastName' : lastName,
						'picture' : picture,
						'userId' :userId
					};
					users.push(userData);
					callback(err);
				};
				function afterAllTasks(err) {
					console.log(JSON.stringify(users));
					var jsonUsers = underscore.extend(jsontotal, {'users' : users});
					callback(err, jsonUsers);
				}
			}
		}
	});
}

function searchedUserDetails(callback, userId, profileId){
	var myId = userId
	//same as retrieve user followers
	retrieveUserFollowers( function(err, results) {
		if(err)
		{
			console.log("ERROR : "+err);
			throw err;
		}
		else{
			var profileDetails = results;
			//get my details too
			var selectSql="select * from audio where userId= ?";
			pool.getConnection(function(err, connection){
				connection.query(selectSql, [myId], function (err,myDetails){
					if (err) {
						console.log("ERROR: " + err.message);
						throw err;
					}else{
						var json_myDet = {'my_details' : myDetails};
						var msg = "Success";
						var returnMessage = {'Message': msg};
						var details = underscore.extend(profileDetails, json_myDet);
						var complete_details = underscore.extend(details, returnMessage);
						callback(err, complete_details);
					}
				});
				connection.release();
			});
		}
	}, myId, profileId);
}

//exports.retrieveUserFollowers=function(callback, userId, profileId){
function retrieveUserFollowers(callback, userId, profileId){
	console.log("user id - " + userId + "profile id -" + profileId);
	var selectSql="select a.*, count(l.like_id) as likeCount from audio as a left outer join likes_table as l on a.audio_id = l.audio_id where a.userId= ? group by a.audio_id order by a.created_at DESC";
	pool.getConnection(function(err, connection){
		connection.query(selectSql, [profileId], function (err,results){
			if (err) {
				console.log("ERROR: " + err.message);
				//res.send(err.message);
				throw err;
			}else{
			//	console.log("second query");
				var audios = results;
				var no_audio = false;
				if(results.length == 0){
					no_audio = true;
				}
				var followerSql="select count(*) as numberOfFollowers from followerlist where userId= ?";
				connection.query(followerSql, [profileId], function (err,followers){
					if (err) {
						console.log(err);
						throw err;

					}else{
					//	console.log("third query");
						var follower=followers;
						var followingSql="select count(*) as numberOfFollowing from followerlist where followerId= ?";
						connection.query(followingSql, [profileId], function (err,numberOfFollowing){
							if (err) {
								//console.log(err);
								throw err;

							}else{
							//	console.log("fourth query");
								//console.log(numberOfLikes[0].numberOfLikes);
								//res.json({"audio":results,"comments":comment,"likes":numberOfLikes});
								var numFollowing = numberOfFollowing;
								var followSql = "select * from followerlist where followerId=? and userId = ?";
								connection.query(followSql,[userId,profileId],function(err,followChk){
									if(err){
										//console.log(err);
										throw err;

									}else{
										var follow = false;
										if(followChk.length != 0){
											follow = true;
										}
										//console.log(follow);
										//console.log("fifth query");
										var userDetSql = "select * from user where userId=?";
										connection.query(userDetSql, [profileId], function (err,users){
											if (err) {
												//console.log(err);
												throw err;

											}else{
												//console.log(numberOfLikes[0].numberOfLikes);
												//res.json({"audio":results,"comments":comment,"likes":numberOfLikes});
												var userDetails = users;
												var selfFollow = true;
												if(userId == profileId){
													selfFollow = false;
												}
												getUserDetails(function (err,result) {
													if(err){
														throw err;
													}else{
														var json_arr = {'sessionId':userId,
																		'audio':audios,
																		'num_followers':follower,
																		'num_following':numFollowing,
																		'user_details':userDetails,
																		'follow': follow,
																		'selfFollow': selfFollow,
																		'no_audio' : no_audio,
																		'profileId' : profileId,
																		'userData' : result
																		};
														callback(err,json_arr);
													}
												},userId);
												//console.log(audios);
													
											}

										});
									}
								});

							}
						});
					};
				});
			};
		});
		connection.release();
	});
};


exports.insertUser = insertUser;
exports.validateUser = validateUser;
exports.getAudio = getAudio;
exports.getAudioById = getAudioById;
exports.getHomeAudioLatest = getHomeAudioLatest;
exports.getHomeAudioTrendy = getHomeAudioTrendy;
exports.insertAudio = insertAudio;
exports.getSearchedAudios = getSearchedAudios;
exports.update_like = update_like;
exports.getMyProfile = getMyProfile;
exports.updateProfile = updateProfile;
exports.getCommentsByAudio = getCommentsByAudio;
exports.postCommentsByAudio = postCommentsByAudio;
exports.getUserDetails = getUserDetails;
exports.getSearchedUsers = getSearchedUsers;
exports.searchedUserDetails = searchedUserDetails;
exports.retrieveUserFollowers = retrieveUserFollowers;
