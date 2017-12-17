/**
 * Created by andrew on 2017/7/3.
 */


var Main = function (config) {
	return {
		connectSeed: 500,
		start: function () {

			//this.debugForIP("114.35.251.18");
			//chokali.log.visible = true;

		}, getFirebaseWrapper: function () {
			return filterfarm.firebaseWrapper;
		}, reloadAll: function (enforce) {
			filterfarm.localDB.reloadSitesAndBlackTitles(enforce);
		}, connect: function () {
			filterfarm.getFirebaseWrapper().connect();
		}, disConnect: function (con) {
			filterfarm.getFirebaseWrapper().disConnect();
		}, openLog: function () {
			chokali.log.setVisible(true);
		}, debugForIP: function (targetIP) {
			chokali.findIP(
				function (ip) {
					if (ip == targetIP) {
						if (false) {
							setInterval(function () {
								main.detectConnect(function (con) {
									if (!con) {
										chokali.log.show("connect again");
										main.connect();
									} else {
										//chokali.log.show("already connect ");
									}
								});
							}, 3000);
						}
					} else {
					}
				}, function (e) {
				}
			);
		},
		excuse: function (path, callback) {
			filterfarm.firebaseWrapper.excuseAsyncForOnceValue(
				"onceValue", filterfarm.getFireDatabase().ref(path), callback
			)
		},
		detectConnect: function (callback = chokali.emptyFn) {
			this.excuse('.info/connected', function (snapshot) {
				if (callback == chokali.emptyFn) {
					chokali.log.show("connect", snapshot.val());
				} else {
					callback(snapshot.val());
				}
			});
		},
		decodeQuery: function () {//url第一參數解碼
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
		},
		decodeQueryForTitle: function () {// url第二參數解碼
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
			if (myTitle.length <= 0) {
				myTitle = "&nbsp;";
			}
			//window.myTitle = myTitle;
			return myTitle;
		},
		getHostname: function (url) {// 取得domain
			var parser = document.createElement("a");
			parser.href = url;
			return parser.hostname;
		},
		htmlSpecialChars: function (text) {// 過濾特殊符號
			var text = text.replace(/\./g, "").replace(/\#/g, "").replace(/\$/g, "").replace(/\[/g, "").replace(/\]/g, "").replace(/\//g, "");
			return text;
		},// 取得localStorage儲存值
		_getArray:function (key) {
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
		},
		isWebRequestFilterBlocked: function () {
			var ret = false,
				value = -1,
				timestamp = (new Date()).getTime();

			value = parseInt(localStorage.getItem("blockWebRequestFilter"));
			if (value === NaN || value <= 0)
				return false;

			return (timestamp - value) < window.threshold;
		},
		blockWebRequestFilter: function () {
			var timestamp = (new Date()).getTime();
			localStorage.setItem("blockWebRequestFilter", timestamp);
		},
		get_userBlacklist: function () {
			return this._getArray("userBlacklist");
		},
		set_userBlacklist: function (val) {
			localStorage.setItem("userBlacklist", JSON.stringify(val));
		},
		get_userWhitelist: function () {
			return this._getArray("userWhitelist");
		},
		set_userWhitelist: function (val) {
			localStorage.setItem("userWhitelist", JSON.stringify(val));
		},
		successURL :'https://www.facebook.com/connect/login_success.html',
		onFacebookLogin:function(){// FB login判斷
			if (!localStorage.accessToken) {
				chrome.tabs.getAllInWindow(null, function (tabs) {
					//console.log(tabs);
					for (var i = 0; i < tabs.length; i++) {
						if (tabs[i].url.indexOf(main.successURL) == 0) {
							var params = tabs[i].url.split('#')[1];
							var d = new Date();
							var timestampNow = d.getTime();
							timestampNow += 7200000;
							access = params.split('&')[0];
							localStorage.accessToken = access;
							localStorage.expire = timestampNow;
							chrome.tabs.onUpdated.removeListener(main.onFacebookLogin);
							chrome.tabs.remove(tabs[i].id);
							chrome.tabs.query({
								active: true
							}, function (tabs) {
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
	};
};