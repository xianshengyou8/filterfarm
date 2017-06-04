//var sites = [];
//var blackTitleList = [];

//test test test11111111

// 初始化 Firebase 參數
var config = {
  apiKey: "AIzaSyBWx8ieQHdXKXVMT9BSPhgl7rWWexEDxPo",
  authDomain: "filterfarm-a7a93.firebaseapp.com",
  databaseURL: "https://filterfarm-a7a93.firebaseio.com",
  storageBucket: "filterfarm-a7a93.appspot.com",
  messagingSenderId: "817781349645"
};
firebase.initializeApp(config);

// Get a reference to the database service
var database = firebase.database();

/*
// 取出黑名單domain
function getSites() {
  var ref2 = firebase.database().ref("sites");
  ref2.once('value', function(snapshot) {
    snapshot.forEach(function(childSnapshot) {
      var childKey = childSnapshot.key;
      var childData = childSnapshot.val();
      // ...
      //console.log('Key:' + childKey + '... Val:' + childData);
      sites.push(childData);
    });
  });
}

// 紀錄黑名單文章標題
function getBlackTitle() {
  var myTitle = decodeQueryForTitle();
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

var threshold = 10 * 60 * 1000;//ten minutes

// 取得localStorage儲存值
function _getArray(key) {
  var ret = [];
  try {
    ret = JSON.parse(localStorage.getItem(key));
  } catch (e) {
    ret = [];
  }

  if (!Array.isArray(ret)) {
    ret = [];
  }

  return ret;
}

// 取得domain
function hostname(url) {
  var parser = document.createElement("a");
  parser.href = url;
  return parser.hostname;
}

// 網址過濾攔截
function block(url) {
  var ret = false,
    domain = hostname(url),
    key = "tmpWhitelist";

  //Filter.appendBlacklist(sites);
  //Filter.appendBlacklist(ListFormatter.parse(LocalStorageStore.get_userBlacklist()));
  //Filter.appendWhitelist(ListFormatter.parse(LocalStorageStore.get_userWhitelist()));

  if (Filter.match_v2(domain)) {
    var Whitelist;
    try {
      Whitelist = JSON.parse(localStorage.getItem(key) || "");
    } catch (e) {
      Whitelist = {};
    }

    if (Whitelist.hasOwnProperty(domain)) {
      var timestamp = (new Date()).getTime();
      var threshold = 10 * 60 * 1000; // Ten minutes
      if (timestamp - Whitelist[domain] > threshold) {
        delete Whitelist[domain];

        try {
          localStorage.setItem(key, JSON.stringify(Whitelist));
        } catch (err) {
          console.error(err);
        }
      }
    }

    if (!Whitelist.hasOwnProperty(domain)) {
      ret = true;
    }
  }

  return ret;
}

// 過濾特殊符號
function htmlSpecialChars(text) {
  var text = text.replace(/\./g, "").replace(/\#/g, "").replace(/\$/g, "").replace(/\[/g, "").replace(/\]/g, "").replace(/\//g,"");
  return text;
}

// 紀錄文章所在url
/*
function checkBlackUrl(tab) {
  //console.log(blackTitleList.indexOf(htmlSpecialChars(myTitle)));
  if (blackTitleList.indexOf(htmlSpecialChars(tab.title)) >= 0) {
    if (sites.indexOf(hostname(tab.url)) < 0) {
      sites.push(hostname(tab.url));
      firebase.database().ref('sites/').set(sites);
      //getSites();
    }
  }
}*/

function logTabInfo(title,tab){
	console.log(title);
	console.log("tab id = " + tab.id );
	console.log("tab title = " + tab.title );
	console.log("tab url= " + tab.url );
}

// 網址過濾處理
function handle(tab) {
	if(tab.url!=null){
		var ary = ["chrome-extension://","chrome://"];
		for(var i = 0 ; i < ary.length ; i++){
			if(tab.url.startsWith(ary[i])){
				return;
			}
		}
	}
	if(false){
		//checkBlackUrl(tab);
    }
	if (block(tab.url)) {
		//logTabInfo("block:",tab);
		chrome.tabs.update(tab.id, { url: "popup.html?to=" + encodeURIComponent(tab.url) + "&myTitle=" + encodeURIComponent(tab.title) });
	}else{
		//logTabInfo("not block:",tab);
	}
}

//chrome.i18n.getMessage("")
//\u即時監測請求網址  =======用途不明
chrome.webRequest.onBeforeRequest.addListener(function(info) {
  var cancel = false;
  if(false){
	  if (info.title !== undefined) {
		  //checkBlackUrl(info);
	  }
  }

  if (!LocalStorageStore.isWebRequestFilterBlocked) {  //怪怪的
    cancel = block(info.url);
  }

  return { cancel: cancel };

}, {
  urls: ["*://*/*"]
}, ["blocking"]);

// 即時監測新開browser分頁
chrome.tabs.onCreated.addListener(function(tab) {
  handle(tab);
});

// 即時分頁即時更新監聽
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  handle(tab);
});

var successURL = 'https://www.facebook.com/connect/login_success.html';

// FB login判斷
function onFacebookLogin() {
  if (!localStorage.accessToken) {
    chrome.tabs.getAllInWindow(null, function(tabs) {
      //console.log(tabs);
      for (var i = 0; i < tabs.length; i++) {
        if (tabs[i].url.indexOf(successURL) == 0) {
          var params = tabs[i].url.split('#')[1];
          var d = new Date();
          var timestampNow = d.getTime();
          timestampNow += 7200000;
          access = params.split('&')[0];
          localStorage.accessToken = access;
          localStorage.expire = timestampNow;
          chrome.tabs.onUpdated.removeListener(onFacebookLogin);
          chrome.tabs.remove(tabs[i].id);
          chrome.tabs.query({
            active: true
          }, function(tabs) {
            var tab = tabs[0];
            console.log(tab.id);
            chrome.tabs.reload(tab.id);
          });
          return;
        }
      }
    });
  }
}

// 分頁即時更新監聽
chrome.tabs.onUpdated.addListener(onFacebookLogin);

// url第一參數解碼
function decodeQuery() {
  var queryString = window.location.search.substring(1);
  var token = queryString.split("&");
  var to = "";
  for (var i = 0; i < token.length; i++) {
    var pair = token[i].split("=");
    if (decodeURIComponent(pair[0]) == "to") {
      to = decodeURIComponent(pair[1]);
      break;
    }
  }
  return to;
}

// url第二參數解碼
function decodeQueryForTitle() {
  var queryString = window.location.search.substring(1);
  var token = queryString.split("&");
  var myTitle = "";
  for (var i = 0; i < token.length; i++) {
    var pair = token[i].split("=");
    if (decodeURIComponent(pair[0]) == "myTitle") {
      myTitle = decodeURIComponent(pair[1]);
      break;
    }
  }
  if(myTitle.length<=0){myTitle="&nbsp;";}
  return myTitle;
}

// 加入暫時白名單
function unblockTemp(hostname) {
  var key = "tmpWhitelist";

  var Whitelist
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
  LocalStorageStore.blockWebRequestFilter();
}

// 評論寫入firebase
function writeUserData(myTitle, user_name, opinion_content, starNum, timestampNow) {
  if (opinion_content.length > 255) {
    alert(chrome.i18n.getMessage("warningText"));
    return false;
  }

  var clean_myTitle = htmlSpecialChars(myTitle);
  firebase.database().ref('users/' + clean_myTitle + '/' + timestampNow).set({
    user_name: user_name,
    opinion_content: opinion_content,
    starNum: starNum,
    myTitle: clean_myTitle,
    like: 0,
    createTime: timestampNow
  });

  chrome.tabs.query({
    active: true
  }, function(tabs) {
    var tab = tabs[0];
    console.log(tab.id);
    chrome.tabs.reload(tab.id);
  });
}

// 檢查是否點擊過like
function checkLike(userName, timeId, callback) {
  var ref = firebase.database().ref("comment/" + timeId);
  ref.once('value', function(snapshot) {
    if (snapshot.val() !== null) {
      var checkNum = snapshot.val().indexOf(userName);
    } else {
      var checkNum = -1;
    }
    callback(null, checkNum);
  }, function(error) {
    // error wil be an Object
    callback(error);
  });
}

// like紀錄寫入firebase
function writeLikeRecord(userName, timeId, callback) {
  var ref = firebase.database().ref("comment/" + timeId);
  ref.once('value', function(snapshot) {
    if (snapshot.val() !== null) {
      var userList = snapshot.val();
      userList.push(userName);
    } else {
      var userList = [];
      userList.push(userName);
    }
    //console.log(userList);
    firebase.database().ref('comment/' + timeId).set(userList);
    callback(null, true);
  }, function(error) {
    // error wil be an Object
    callback(error);
  });
}

// 取得評論第一頁
function getCommentList(startNum, endNum, myTitle) {
  // 取出評價列表
  var tpl = '';
  var averageTpl = '';
  var totalNum = 0;
  var totalStar = 0;
  var ref = firebase.database().ref("users/" + htmlSpecialChars(myTitle));
  var timeArray = [];
  var likeArray = [];
  var commentList = [];

  // 取得單一黑名單文章所有評論
  ref.orderByChild("like").once('value', function(snapshot) {
    snapshot.forEach(function(childSnapshot) {
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
    };
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
    var clean_myTitle = htmlSpecialChars(myTitle);
    $.each(timeArray, function(index, value) {
      $('#likeBtn' + value).on( {
        'click': function() {
          var user_name = $('#user_name').text();
          if (user_name === '') {
            alert(chrome.i18n.getMessage("likeError"));
            return false;
          }

          // 確認是否評論過
          checkLike(user_name, value, function(err, result) {
            if (result < 0) {
              var adaNameRef = firebase.database().ref('users/' + clean_myTitle + '/' + value);
              adaNameRef.update({ like: likeArray[index] + 1 });
              writeLikeRecord(user_name, value, function(err, res) {
                if (res === true) {
                  chrome.tabs.query({
                    active: true
                  }, function(tabs) {
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
  });
}

// 切換評論新分頁
function setCommentList(startNum, endNum, myTitle, nowPage) {
  // 取出評價列表
  var tpl = '';
  var averageTpl = '';
  var totalNum = 0;
  var totalStar = 0;
  var ref = firebase.database().ref("users/" + htmlSpecialChars(myTitle));
  var timeArray = [];
  var likeArray = [];
  var commentList = [];

  // 取得單一黑名單文章所有評論
  ref.orderByChild("like").once('value', function(snapshot) {
    snapshot.forEach(function(childSnapshot) {
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
    };
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
    $('#content_block').html('');
    $('#content_block').html(tpl);

    // 針對他人評論，點擊like
    var clean_myTitle = htmlSpecialChars(myTitle);
    $.each(timeArray, function(index, value) {
      $('#likeBtn' + value).on({
        'click': function() {
          var user_name = $('#user_name').text();
          if (user_name === '') {
            alert(chrome.i18n.getMessage("likeError"));
            return false;
          }

          // 確認是否評論過
          checkLike(user_name, value, function(err, result) {
            if (result < 0) {
              var adaNameRef = firebase.database().ref('users/' + clean_myTitle + '/' + value);
              adaNameRef.update({ like: likeArray[index] + 1 });
              writeLikeRecord(user_name, value, function(err, res) {
                if (res === true) {
                  chrome.tabs.query({
                    active: true
                  }, function(tabs) {
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
      $('#prePage').attr('disabled', true);
    } else {
      $('#prePage').attr('disabled', false);
    }
    if (nowPage < totalPage) {
      $('#nextPage').attr('disabled', false);
    } else {
      $('#nextPage').attr('disabled', true);
    }

  });
}

$(document).ready(function() {

  // 取得黑名單網址
  //getSites();
  //getBlackTitle();

   //更新黑名單存在本機
    /*
          取得方式:
          LocalStorageStore.db.getSites();
          LocalStorageStore.db.getBlackTitles();
    *
    * */
    LocalStorageStore.db.reloadSitesAndBlackTitles(false);

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

  var to = decodeQuery();
  var myTitle = decodeQueryForTitle();
  var white_hostname = hostname(to);

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
  $("#continue").click(function() {
    unblockTemp(white_hostname);
    window.open(to);
  });

  // fb login
  $("#fbLogin").click(function() {
    var fbUrl = 'https://www.facebook.com/v2.8/dialog/oauth?client_id=396008250732554&response_type=token&scope=email&redirect_uri=https://www.facebook.com/connect/login_success.html';
    window.open(fbUrl);
  });

  // 返回鍵
  $("#back").click(function() {

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
    };
    return starNum;
  }

  // 取消評價星
  function setStarToW(nowStar) {
    var nowStar = nowStar;
    for (var i = nowStar; i < 6; i += 1) {
      $('#star' + i).attr('src', 'image/star_w.png');
    };
    return true;
  }

  // 給予評價星
  function setStarToY(nowStar) {
    var nowStar = nowStar;
    for (var i = 1; i < nowStar; i += 1) {
      $('#star' + i).attr('src', 'image/star_y.png');
    };
    return true;
  }

  // 評價星點擊
  $('#star1').on({
    'click': function() {
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
    'click': function() {
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
    'click': function() {
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
    'click': function() {
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
    'click': function() {
      var src = ($(this).attr('src') === 'image/star_w.png') ? 'image/star_y.png' : 'image/star_w.png';
      $(this).attr('src', src);
      setStarToY(5);
      calculateStar();
      //console.log(starNum);
    }
  });

  // 評論送出寫入firebase
  $('#button01').on({
    'click': function() {
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
  getCommentList(startLimit, limit, myTitle);

  // 上一頁
  $('#prePage').on({
    'click': function() {
      startLimit -= limit;
      nowPage -= 1;
      //alert(nowPage);
      setCommentList(startLimit, limit, myTitle, nowPage);
    }
  });

  // 下一頁
  $('#nextPage').on({
    'click': function() {
      startLimit += limit;
      nowPage += 1;
      //alert(nowPage);
      setCommentList(startLimit, limit, myTitle, nowPage);
    }
  });

});

// Firebase 初始化
function initApp() {
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      // User is signed in.
      var displayName = user.displayName;
      var email = user.email;
      var emailVerified = user.emailVerified;
      var photoURL = user.photoURL;
      var isAnonymous = user.isAnonymous;
      var uid = user.uid;
      var providerData = user.providerData;

      if (uid != null) {
        $(document).ready(function() {
          $('#oauth_block').hide();
          $('#user_block').show();
          $('#opinion_block').show();
          $('#user_name').html(displayName);
        });
      }

    }
    if(document.getElementById('quickstart-button')!=null){
	    document.getElementById('quickstart-button').disabled = false;
    }


  });

  if(document.getElementById('quickstart-button')!=null){
	  document.getElementById('quickstart-button').addEventListener('click', startSignIn, false);
  }

}

// google 登入驗證
function startAuth(interactive) {
  // Request an OAuth token from the Chrome Identity API.
  chrome.identity.getAuthToken({ interactive: !!interactive }, function(token) {
    if (chrome.runtime.lastError && !interactive) {
      console.log('It was not possible to get a token programmatically.');
    } else if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
    } else if (token) {
      // Authrorize Firebase with the OAuth Access Token.
      var credential = firebase.auth.GoogleAuthProvider.credential(null, token);
      firebase.auth().signInWithCredential(credential).catch(function(error) {
        // The OAuth token might have been invalidated. Lets' remove it from cache.
        if (error.code === 'auth/invalid-credential') {
          chrome.identity.removeCachedAuthToken({ token: token }, function() {
            startAuth(interactive);
          });
        }
      });
    } else {
      console.error('The OAuth Token was null');
    }
  });
}

// google login 觸發
function startSignIn() {
  if (firebase.auth().currentUser) {
    firebase.auth().signOut();
  } else {
    startAuth(true);
  }
}

window.onload = function() {
  initApp();
};