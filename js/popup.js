window.main = new Main({});
/*window.fbAsyncInit = function () {
 FB.init({
 appId: '1932380990318210',
 autoLogAppEvents: true,
 xfbml: true,
 version: 'v2.9'
 });
 FB.AppEvents.logPageView();
 };
 (function (d, s, id) {
 var js, fjs = d.getElementsByTagName(s)[0];
 if (d.getElementById(id)) {
 return;
 }
 js = d.createElement(s);
 js.id = id;
 js.src = "https://connect.facebook.net/zh_TW/sdk.js";
 fjs.parentNode.insertBefore(js, fjs);
 }(document, 'script', 'facebook-jssdk'));*/



/*(function (d, s, id) {
 var js, fjs = d.getElementsByTagName(s)[0];
 if (d.getElementById(id)) return;
 js = d.createElement(s);
 js.id = id;
 js.src = "https://connect.facebook.net/zh_TW/sdk.js#xfbml=1&version=v2.9&appId=1932380990318210";
 fjs.parentNode.insertBefore(js, fjs);
 }(document, 'script', 'facebook-jssdk'));*/

// 判斷FB登入狀態及取得登入資訊
if (localStorage.accessToken) {
	var d = new Date();
	var timestampForToken = d.getTime();
	//console.log(timestampForToken);
	if (timestampForToken < localStorage.expire) {
		var graphUrl = "https://graph.facebook.com/me?" + localStorage.accessToken + "&fields=id,name";
		//console.log(graphUrl);
		var x = new XMLHttpRequest();
		x.open('GET', graphUrl);
		// The Google image search API responds with JSON, so let Chrome parse it.
		x.responseType = 'json';
		x.onload = function () {
			// Parse and process the response from Google Image Search.
			var response = x.response;
			//console.log('name: '+ response.name);
			if (!response) {
				console.log('No response from facebook graph api!');
				return;
			} else {
				var id = response.id;
				var name = response.name;

				// 判斷是否已登入來決定區塊的顯示及隱藏
				$(document).ready(function () {
					$('#oauth_block').hide();
					$('#user_block').show();
					$('#opinion_block').show();
					$('#user_name').html(name);
				});
			}
		};
		x.onerror = function () {
			console.log('Network error.');
		};
		x.send();
	} else {
		localStorage.removeItem('accessToken');
		localStorage.removeItem('expire');
		main.onFacebookLogin();
	}
}

$(document).ready(function () {
	chokali.log.show("document ready.......for popup");
	main.start();

	// 本地化語系讀取
	$("#warningText").text(chrome.i18n.getMessage("header"));
	$("#p2").text(chrome.i18n.getMessage("p2"));
	$("#remind").text(chrome.i18n.getMessage("remind"));
	$("#back").text(chrome.i18n.getMessage("backBtn"));
	$("#continue").text(chrome.i18n.getMessage("contBtn"));
	$("#prePage").text(chrome.i18n.getMessage("prePageBtn"));
	$("#nextPage").text(chrome.i18n.getMessage("nextPageBtn"));
	$("#average").text(chrome.i18n.getMessage("average"));
	$("#evaluation").text(chrome.i18n.getMessage("evaluation"));

	// 未登入評論區塊隱藏
	$('#user_block').hide();
	$('#opinion_block').hide();

	var to = main.decodeQuery();
	var myTitle = main.decodeQueryForTitle();
	var white_hostname = main.getHostname(to);

	var trTable = {
		"#detailsLink": "details",
		"title": "title",
		"#messageText": "body",
		"#back": "backBtn",
		"#continue": "contBtn",
		"#continueNoAds": "contNoAdsBtn"
	}

	$("#title_block").html(myTitle);

	// 繼續前往鍵
	$("#continue").click(function () {
		unblockTemp(white_hostname);
		window.open(to);
	});

	// fb login
	$("#fbLogin").click(function () {
		var fbUrl = 'https://www.facebook.com/v2.8/dialog/oauth?client_id=396008250732554&response_type=token&scope=email&redirect_uri=https://www.facebook.com/connect/login_success.html';
		window.open(fbUrl);
	});

	// 返回鍵
	$("#back").click(function () {

		if (history.length <= 2) {
			if (window.opener || window.parent) {
				window.close();
			} else {
				window.history.go(-1);
			}
		} else {
			window.history.go(-2);
		}
	});

	var starNum;
	// 計算評價星數
	function calculateStar() {
		starNum = 0;
		for (var i = 1; i < 6; i += 1) {
			if ($('#star' + i).attr('src') === 'image/star_y.png') {
				starNum += 1;
			}
		}
		;
		return starNum;
	}

	// 取消評價星
	function setStarToW(nowStar) {
		var nowStar = nowStar;
		for (var i = nowStar; i < 6; i += 1) {
			$('#star' + i).attr('src', 'image/star_w.png');
		}
		;
		return true;
	}

	// 給予評價星
	function setStarToY(nowStar) {
		var nowStar = nowStar;
		for (var i = 1; i < nowStar; i += 1) {
			$('#star' + i).attr('src', 'image/star_y.png');
		}
		;
		return true;
	}

	// 評價星點擊
	$('#star1').on({
		'click': function () {
			var src = ($(this).attr('src') === 'image/star_w.png') ? 'image/star_y.png' : 'image/star_w.png';
			$(this).attr('src', src);
			//$('#star2').attr('disabled',false);
			if (src === 'image/star_w.png') {
				setStarToW(1);
			}
			calculateStar();
		}
	});

	// 評價星點擊
	$('#star2').on({
		'click': function () {
			var src = ($(this).attr('src') === 'image/star_w.png') ? 'image/star_y.png' : 'image/star_w.png';
			$(this).attr('src', src);
			setStarToY(2);
			if (src === 'image/star_w.png') {
				setStarToW(2);
			}
			calculateStar();
			//console.log(starNum);
		}
	});

	// 評價星點擊
	$('#star3').on({
		'click': function () {
			var src = ($(this).attr('src') === 'image/star_w.png') ? 'image/star_y.png' : 'image/star_w.png';
			$(this).attr('src', src);
			setStarToY(3);
			if (src === 'image/star_w.png') {
				setStarToW(3);
			}
			calculateStar();
			//console.log(starNum);
		}
	});

	// 評價星點擊
	$('#star4').on({
		'click': function () {
			var src = ($(this).attr('src') === 'image/star_w.png') ? 'image/star_y.png' : 'image/star_w.png';
			$(this).attr('src', src);
			setStarToY(4);
			if (src === 'image/star_w.png') {
				setStarToW(4);
			}
			calculateStar();
			//console.log(starNum);
		}
	});

	// 評價星點擊
	$('#star5').on({
		'click': function () {
			var src = ($(this).attr('src') === 'image/star_w.png') ? 'image/star_y.png' : 'image/star_w.png';
			$(this).attr('src', src);
			setStarToY(5);
			calculateStar();
			//console.log(starNum);
		}
	});

	// 評論送出寫入firebase
	$('#button01').on({
		'click': function () {
			var opinion_content = $('#opinion_content').val();
			var user_name = $('#user_name').text();
			var d = new Date();
			var timestampNow = d.getTime();
			writeUserData(myTitle, user_name, opinion_content, starNum, timestampNow);
		}
	});

	// 分頁所需參數
	var nowPage = 1;
	var startLimit = 1;
	var limit = 5;
	loadCommentList(startLimit, limit, myTitle, nowPage);

	// 上一頁
	$('#prePage').on({
		'click': function () {
			startLimit -= limit;
			nowPage -= 1;
			loadCommentList(startLimit, limit, myTitle, nowPage);
		}
	});

	// 下一頁
	$('#nextPage').on({
		'click': function () {
			startLimit += limit;
			nowPage += 1;
			loadCommentList(startLimit, limit, myTitle, nowPage);
		}
	});


	//console.log("document ready for popup.......");
	//window.fbCommentDoc = document.getElementById('fbCommentFrame').contentWindow.document;
	//var h = fbCommentDoc.body.clientHeight;
	//https://stackoverflow.com/questions/16018598/how-to-get-a-reference-to-an-iframes-window-object-inside-iframes-onload-handl //may try
	if (true) {//create iframe
		//console.log(`tabTitle=${tabTitle}`);
		switch (1) {
			case 1:
				//var tabTitle = main.decodeQueryForTitle();
				var tabTitle = main.decodeQuery();
				let run =(src)=>{
					let wrapper = $("#iframeWrapper");
					window.iframe = $(`<iframe
						id="fbCommentFrame"
						src=${src}
					    width="100%"
					    scrolling="yes"
					></iframe>`);
					wrapper.append(iframe);
				};

				let src = filterfarm.src1+tabTitle;
				chokali.checkUrl(true, src)
					.then(val => {
						run(src);
					}).catch(e => {
					src = filterfarm.src2+tabTitle;
					chokali.checkUrl(true, src)
						.then(val => {
							run(src);
						}).catch(e => {
					})
				});
				break;
			case 2:

				break;
			default:
				break;
		}
	}
});


// like紀錄寫入firebase
function writeLikeRecord(userName, timeId, callback) {

	main.connect();
	setTimeout(function () {
	}, main.connectSeed);

	var ref = filterfarm.getFireDatabase().ref("comment/" + timeId);
	ref.once('value', function (snapshot) {
		if (snapshot.val() !== null) {
			var userList = snapshot.val();
			userList.push(userName);
		} else {
			var userList = [];
			userList.push(userName);
		}
		//console.log(userList);
		filterfarm.getFireDatabase().ref('comment/' + timeId).set(userList);
		callback(null, true);
	}, function (error) {
		// error wil be an Object
		callback(error);
	});
}

// 取得評論列表
function loadCommentList(startNum, endNum, myTitle, nowPage) {
	// 取出評價列表
	var tpl = '';
	var averageTpl = '';
	var totalNum = 0;
	var totalStar = 0;

	var ref = filterfarm.getFireDatabase().ref("users/" + main.htmlSpecialChars(myTitle));
	var timeArray = [];
	var likeArray = [];
	var commentList = [];

	// 取得單一黑名單文章所有評論
	//ref.orderByChild("like").once('value', function (snapshot) {});
	main.getFirebaseWrapper().excuseLikeSync("onceValue", ref.orderByChild("like"), function (snapshot) {

		snapshot.forEach(function (childSnapshot) {
			var childKey = childSnapshot.key;
			var childData = childSnapshot.val();
			var commentArray = [];
			commentArray['user_name'] = childData.user_name;
			commentArray['starNum'] = childData.starNum;
			commentArray['createTime'] = childData.createTime;
			commentArray['like'] = childData.like;
			commentArray['opinion_content'] = childData.opinion_content;
			commentList.push(commentArray);

			totalStar += childData.starNum;
			totalNum += 1;
		});

		// 計算評論星號平均值
		var averageStar = totalStar / totalNum;
		if (averageStar > 0) {
			var starInt = parseInt(averageStar);
		} else {
			var starInt = '';
		}
		var remainder = totalStar % totalNum;
		for (var j = 0; j < starInt; j += 1) {
			averageTpl += '<img src="image/star_y.png" style="width:15px;height:15px;margin-right:5px;" />';
		}
		if (remainder > 0) {
			averageTpl += '<img src="image/star_half.png" style="width:7px;height:15px;" />';
			starInt += 0.5;
		}
		$('#avergeStarBlock').html(averageTpl);
		$('#average').html('整體評價 ' + starInt + ' :');

		// 反向排序評論
		var m = 0;
		for (var i = commentList.length - 1; i >= 0; i--) {
			if (i > commentList.length - startNum) {
				continue;
			}
			if (m < endNum) {
				if (commentList[i]['like'] === commentList[commentList.length - 1]['like']) {
					tpl += '<div style="margin-top:12px;padding:1px 5px 5px 5px;border: 1px solid red;border-radius: 5px;width:475px;">';
					tpl += '<img src="image/text01.png" style="width:90px;height:18px;z-index:1;position:relative;top:-10px;left:20px;" />'
				} else {
					tpl += '<div style="margin-top:5px;padding:5px;width:475px;">';
				}
				if (commentList[i]['like'] === commentList[commentList.length - 1]['like']) {
					tpl += '<div style="padding:5px;z-index:2;position:relative;top:-10px;width:465px;height:auto;border-top: 1px solid #99ccff;">';
				} else {
					tpl += '<div style="padding:5px;margin-top:5px;width:465px;height:auto;border-top: 1px solid #99ccff;">';
				}
				tpl += '<div>';
				tpl += '<span style="font-size:15px;font-weight: bold;margin-right:20px;">' + commentList[i]['user_name'] + '</span>';
				for (var k = 0; k < commentList[i]['starNum']; k += 1) {
					tpl += '<img src="image/star_y.png" style="width:15px;height:15px;margin-right:5px;" />';
				}
				tpl += '<button class="likeButton" id="likeBtn' + commentList[i]['createTime'] + '" style="background-color: #ccffff;border-width:0px;background-image:url(image/like.png);width:23px;height:20px;border-radius:5px;vertical-align:bottom;"></button>';
				if (commentList[i]['like'] > 0) {
					tpl += '<span id="likeNum" style="font-size:10px;vertical-align:bottom;">' + commentList[i]['like'] + '</span>';
				} else {
					tpl += '<span id="likeNum' + commentList[i]['createTime'] + '" style="font-size:10px;vertical-align:bottom;"></span>';
				}
				tpl += '</div>';
				tpl += '<div style="margin-top:5px;font-size:14px;">' + commentList[i]['opinion_content'] + '</div>';
				tpl += '</div></div>';
				m += 1;
				timeArray.push(commentList[i]['createTime']);
				likeArray.push(commentList[i]['like']);
			}
		}
		$('#content_block').html(tpl);

		// 針對他人評論，點擊like
		var clean_myTitle = main.htmlSpecialChars(myTitle);
		$.each(timeArray, function (index, value) {
			$('#likeBtn' + value).on({
				'click': function () {
					var user_name = $('#user_name').text();
					if (user_name === '') {
						alert(chrome.i18n.getMessage("likeError"));
						return false;
					}

					// 確認是否評論過
					checkLike(user_name, value, function (err, result) {
						if (result < 0) {

							main.connect();
							setTimeout(function () {
							}, main.connectSeed);

							var adaNameRef = filterfarm.getFireDatabase().ref('users/' + clean_myTitle + '/' + value);
							adaNameRef.update({like: likeArray[index] + 1});
							writeLikeRecord(user_name, value, function (err, res) {
								if (res === true) {
									chrome.tabs.query({
										active: true
									}, function (tabs) {
										var tab = tabs[0];
										console.log(tab.id);
										chrome.tabs.reload(tab.id);
									});
								}
							});
						} else {
							alert(chrome.i18n.getMessage("likeAlert"));
						}
					});
				}
			});
		});

		// 分頁計算
		var totalPage = parseInt(commentList.length / endNum);
		if (commentList.length % endNum !== 0) {
			totalPage += 1;
		}
		if (nowPage === 1) {
			$('#prePage').css('visibility', 'hidden');
		} else {
			$('#prePage').css('visibility', 'visible');
		}
		if (nowPage < totalPage) {
			$('#nextPage').css('visibility', 'visible');
		} else {
			$('#nextPage').css('visibility', 'hidden');
		}

	});
}


// 評論寫入firebase
function writeUserData(myTitle, user_name, opinion_content, starNum, timestampNow) {
	if (opinion_content.length > 255) {
		alert(chrome.i18n.getMessage("warningText"));
		return false;
	}
	var clean_myTitle = main.htmlSpecialChars(myTitle);
	var ref = filterfarm.getFireDatabase().ref('users/' + clean_myTitle + '/' + timestampNow);
	//filterfarm.getFireDatabase().ref('users/' + clean_myTitle + '/' + timestampNow).set({});
	main.getFirebaseWrapper().excuseLikeSync("set", ref, {
		user_name: user_name,
		opinion_content: opinion_content,
		starNum: starNum != null ? starNum : 0,
		myTitle: clean_myTitle,
		like: 0,
		createTime: timestampNow
	}, function () {
		chokali.log.show("after set", arguments);
		chrome.tabs.query({
			active: true
		}, function (tabs) {
			var tab = tabs[0];
			console.log(tab.id);
			chrome.tabs.reload(tab.id);
		});
	});
}

// 檢查是否點擊過like
function checkLike(userName, timeId, callback) {

	main.connect();
	setTimeout(function () {
	}, main.connectSeed);

	var ref = filterfarm.getFireDatabase().ref("comment/" + timeId);
	ref.once('value', function (snapshot) {
		if (snapshot.val() !== null) {
			var checkNum = snapshot.val().indexOf(userName);
		} else {
			var checkNum = -1;
		}
		callback(null, checkNum);
	}, function (error) {
		// error wil be an Object
		callback(error);
	});
}

// 加入暫時白名單
function unblockTemp(hostname) {
	var key = "tmpWhitelist";
	var Whitelist;
	try {
		Whitelist = JSON.parse(localStorage.getItem(key) || "");
	} catch (e) {
		Whitelist = {};
	}
	var field = hostname;
	Whitelist[field] = new Date().getTime();
	try {
		localStorage.setItem(key, JSON.stringify(Whitelist));
	} catch (err) {
		// e.g. quote exceed. Just purge old data
		Whitelist = {};
		Whitelist[field] = true;
		localStorage.setItem(key, JSON.stringify(Whitelist));
	}
	// Disable web request filter
	main.blockWebRequestFilter();
}


//===========================destroy============
// 紀錄文章所在url
/*
 function checkBlackUrl(tab) {
 //console.log(blackTitleList.indexOf(htmlSpecialChars(myTitle)));
 if (blackTitleList.indexOf(htmlSpecialChars(tab.title)) >= 0) {
 if (sites.indexOf(main.getHostname(tab.url)) < 0) {
 sites.push(main.getHostname(tab.url));
 firebase.database().ref('sites/').set(sites);
 //getSites();
 }
 }
 }*/


/*
 // 紀錄黑名單文章標題
 function getBlackTitle() {
 var myTitle = main.decodeQueryForTitle();
 if (myTitle !== '') {
 var ref3 = firebase.database().ref("blackTitles");
 ref3.once('value', function(snapshot) {
 snapshot.forEach(function(childSnapshot) {
 var childKey = childSnapshot.key;
 var childData = childSnapshot.val();
 blackTitleList.push(childData);
 });
 //console.log(blackTitleList.indexOf(htmlSpecialChars(myTitle)));
 if (blackTitleList.indexOf(htmlSpecialChars(myTitle)) < 0) {
 blackTitleList.push(htmlSpecialChars(myTitle));
 firebase.database().ref('blackTitles/').set(blackTitleList);
 }
 });
 }
 }
 */