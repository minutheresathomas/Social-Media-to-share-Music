Music4u = {
	"user" : null,
	"general" : null
};

Music4u.user = function(window, document, undefined) {
	'use strict';
	var user_param = {
		"sessionId" : '',
		"status" : false

	},
	socket = '',
	 check_login = function() {
		user_param.sessionId = getCookie('sessionId');
		if (user_param.sessionId != "") {
			user_param.status = true;
		} else {
			user_param.status = false;
		}
	}, getCookie = function(cName) {
		var name = cName + '=';
		var ca = document.cookie.split(';');
		for (var i = 0; i < ca.length; i++) {
			var c = ca[i];
			while (c.charAt(0) == ' ')
				c = c.substring(1);
			if (c.indexOf(name) == 0)
				return c.substring(name.length, c.length);
		}
		return "";
	}, unsetkCookie = function(cname) {

	}, setCookie = function(cname, cvalue) {
		document.cookie = cname + "=" + cvalue;
	}, login = function() {
		var email = $("#email").val();
		var password = $("#password").val();
		//alert(email);
		if (email != '' && password != '') {
			var data = {
				"email" : email,
				"password" : password
			}
			$.ajax({
				type : "POST",
				url : "/login",
				data : data,
				dataType : 'JSON',
				success : function(data) {
					//set cookie after login
					console.log(data);
					user_param.sessionId = data.sessionId;
					setCookie("sessionId", user_param.sessionId);
					//alert("Success:" + user_param.sessionId);

					window.location.href = "/wall/" + data.sessionId;
				},
				cache : false,
				error : function(error) {
					unsetkCookie("sessionId");
					console.log("login failed");
				}
			});
		} else {

		}
	}, logout = function() {
		var data = {
			"email" : "jibin"
		}
		$.ajax({
			type : "GET",
			url : "/logout",
			data : data,
			dataType : 'JSON',
			success : function(data) {
				//set cookie after login
				unsetkCookie("sessionId");

			},
			cache : false,
			error : function(error) {
				console.log("Ajax request has failed. logout failed");
			}
		});
	}, logout = function() {
		var data = {
			"email" : "jibin"
		}
		$.ajax({
			type : "GET",
			url : "/logout",
			data : data,
			dataType : 'JSON',
			success : function(data) {
				//set cookie after login
				unsetkCookie("sessionId");

			},
			cache : false,
			error : function(error) {
				console.log("Ajax request has failed. logout failed");
			}
		});
	}, audioUpload = function() {
		var session_id = getCookie("sessionId");
		var title = $("#title").val();
		var artist = $("#artist").val();
		var genre = $("#genre").val();
		var description = $("#description").val();
		var session_id = getCookie("sessionId");

		var data = {
				"title": title,
				"artist": artist,
				"genre": genre,
				"description": description,
				"session_id" : session_id
		}

		  $('#uploadForm').ajaxSubmit({
			  	type : "POST",
				url : "/wall/"+session_id+"/audio",
				//data: data,

	            error: function(xhr) {
	                    status('Error: ' + xhr.status);
	            },

	            success: function(response) {
	                     //console.log(response);
	                     $('#uploadMsg').modal('toggle');
	            }
	    });



	}, updateProfile = function() {
		var session_id = getCookie("sessionId");
		var profile_id = $("#ProfileId").val();
		console.log("profileid: "+profile_id);
		  $('#updateProfileForm').ajaxSubmit({
			  	type : "POST",
					url : "/wall/"+session_id+"/profile/"+profile_id,
          error: function(xhr) {
                  status('Error: ' + xhr.status);
          },

          success: function(response) {
                   //console.log(response);
									//console.log("jibin");
                   $('#uploadMsg').modal('toggle');
          }
	    });



	}, getProfile = function() {
		var session_id = getCookie("sessionId");


		$.ajax({
		type : "GET",
		url : "/wall/"+session_id+"/user",
		data : session_id,
		dataType : 'JSON',
		success : function(data) {
			//set cookie after login // <i class="fa fa-map-marker"></i> London, UK
			console.log(data);
			$("#user_name").html(data.userDetails.user_details[0].firstname+" "+data.userDetails.user_details[0].lastname);
			$("#user_name_2").html(data.userDetails.user_details[0].firstname+" "+data.userDetails.user_details[0].lastname);
			$("#user_name_3").html(data.userDetails.user_details[0].firstname+" "+data.userDetails.user_details[0].lastname);
			$("#profile_pic_1").attr("src",data.userDetails.user_details[0].picture);
			$("#profile_pic_2").attr("src",data.userDetails.user_details[0].picture);
			$("#profile_pic_3").attr("src",data.userDetails.user_details[0].picture);
			$("#followers").html(data.userDetails.num_followers[0].numberOfFollowers);
			$("#following").html(data.userDetails.num_following[0].numberOfFollowing);
			for(var i=0; i<data.userDetails.audio.length; i++){
				var html = "<div class='col-lg-12'><div class='col-lg-10'><section class='panel panel-default'><div class='panel-body'> <div class='row'><div class='col-lg-2'><span class='thumb-sm avatar'><img src='"+data.userDetails.user_details[0].picture+"' alt='...'> </span></div><div class='col-lg-10'><label class='control-label'>"+data.userDetails.user_details[0].firstname+" "+data.userDetails.user_details[0].lastname+"</label></div> </div> <div class='padder-v row'><div class='col-sm-11'> <span class='thumb-lg'><img src='"+data.userDetails.audio[i].albumArt+"' alt='...'></span><!--<a href='#'><img src='"+data.userDetails.audio[i].albumArt+"' alt='' style=''></a>--></div></div><div class='row'> <div class='col-lg-12'><label class='col-lg-10 control-label'><b>"+data.userDetails.audio[i].title+"</b></label><br> <small class='text-muted'>"+data.userDetails.audio[i].artist+"</small><audio controls> <source src='"+data.userDetails.audio[i].audioFile+"' type='audio/mpeg'> Your browser does not support the audio element.</audio></div></div><div class='row' style='display:none;'><div class='col-sm-12'><a href='#'  class='active "+data.userDetails.audio[i].audio_id+"_like'  like-count='"+data.userDetails.audio[i].like_count+"' onclick='unlike("+data.userDetails.audio[i].audio_id+");' style='display:"+data.userDetails.audio[i].audiolike+"'>"+data.userDetails.audio[i].like_count+"<i class='fa fa-heart-o text'></i> <i class='fa fa-heart text-active text-danger'></i></a><a href='#'  class=' "+data.userDetails.audio[i].audio_id+"_unlike'  like-count='"+data.userDetails.audio[i].like_count+"' onclick='like("+data.userDetails.audio[i].audio_id+"); ' style='display:"+data.userDetails.audio[i].unlike+"'>"+data.userDetails.audio[i].like_count+" <i class='fa fa-heart-o text'></i><i class='fa fa-heart text-active text-danger'></i></a></div></div>  </div></section></div> <div class='clearfix visible-xs'></div></div>";

								$("#my_post").append(html);
			}

		},
		cache : false,
		error : function(error) {
			console.log("Ajax request has failed. logout failed");
		}
	});


	},likeAudio = function(audio_id,status){
		var sessionId = getCookie("sessionId");
		var jsonObject={
									"sessionId":sessionId,
									//"audioId":audio_id,
									"audioId":19,
									"likeStatus":status};
		if(status == 1){
			Music4u.user.socket.emit('likes', jsonObject);
		}else{
			Music4u.user.socket.emit('unlikes', jsonObject);
		}


	},buildWall = function(){
		var session_id = getCookie("sessionId");
		$.ajax({
			type : "GET",
			url : "/wall/"+session_id+"/getAudio",
			data : session_id,
			dataType : 'JSON',
			success : function(data) {
				//set cookie after login
				//email = "jibin";
				//setCookie("sessionId", data.sessionId);
				//alert("Success : " +data.sessionId);
				//window.location.href = "/wall/" + data.sessionId;
				console.log(data);
			},
			cache : false,
			error : function(error) {
				console.log(Error
						+ "\nAjax request has failed. Registration Failed ");
			}
		});

	}, register = function() {
		var email = $("#email").val();
		var firstname = $("#firstname").val();
		var lastname = $("#lastname").val();
		var password = $("#confirm_password").val();
		//alert(name);
		//alert(email);
		var data = {
			"firstname" : firstname,
			"lastname" : lastname,
			"password" : password,
			"email" : email
		}
		$.ajax({
			type : "POST",
			url : "/register",
			data : data,
			dataType : 'JSON',
			success : function(data) {
				//set cookie after login
				//email = "jibin";
				setCookie("sessionId", data.sessionId);
				//alert("Success : " +data.sessionId);
				console.log(data);
				window.location.href = "/wall/" + data.sessionId;
			},
			cache : false,
			error : function(error) {
				console.log(Error
						+ "\nAjax request has failed. Registration Failed ");
			}
		});
	};

	return {
		check_login : check_login,
		user_param : user_param,
		register : register,
		audioUpload: audioUpload,
		login : login,
		getProfile:getProfile,
		likeAudio : likeAudio,
		updateProfile:updateProfile,
		buildWall:buildWall,
		socket: socket,
		logout : logout
	};
}(this, document);

Music4u.general = function(window, document, undefined) {
	'use strict';
	var user_param = {
		"sessionId" : '',
		"status" : false

	}, get_genere = function() {
		var data = {
			"session_id" : session_id,
			"audio_file" : audio_file
		}
		$.ajax({
			type : "GET",
			url : "/genere",
			data : data,
			dataType : 'JSON',
			success : function(data) {
				//set cookie after login
				unsetkCookie("email");
			},
			cache : false,
			error : function(error) {
				console.log("Ajax request has failed. logout failed");
			}
		});
	};

	return {
		get_genere : get_genere
	};
}(this, document);

function login_user() {

	var email = $('#email').val();
	var password = $('#password').val();

	if (password != '' && email != '') {
		Music4u.user.login();
	}
}

function signup_user() {
	Music4u.user.register();
}

function update_profile() {
	Music4u.user.updateProfile();
}

function upload_file(){
	Music4u.user.audioUpload();
	// $('#uploadForm').submit(function() {
	    // alert("jjjj");


	        //Very important line, it disable the page refresh.
	   // return false;
	   // });
}

function like(aid){
	console.log(aid);
//	var like_count = $(this).attr("like-count");
	//console.log(like_count);
	$("."+aid+"_like").show();
	$("."+aid+"_unlike").hide();
	Music4u.user.likeAudio(aid,1);
}

function unlike(aid){
	console.log(aid);
	$("."+aid+"_like").hide()
	$("."+aid+"_unlike").show();;
//	var like_count = $(this).attr("like-count");
	//console.log(like_count);
	Music4u.user.likeAudio(aid,0);
}

$(document).ready(function () {
	//var socket = io.connect('http://localhost:3000');
	//Music4u.user.socket = socket;
	//Music4u.user.getProfile();

});
