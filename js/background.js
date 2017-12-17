window.main = new Main({});

window.threshold = 10 * 60 * 1000;//ten minutes


// 網址過濾攔截
function block(url) {
	var ret = false,
		domain = main.getHostname(url),
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
			if (timestamp - Whitelist[domain] > window.threshold) {
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


function logTabInfo(title, tab) {
	console.log(title);
	console.log("tab id = " + tab.id);
	console.log("tab title = " + tab.title);
	console.log("tab url= " + tab.url);
}

// 網址過濾處理
function handle(tab) {
	if (tab.url != null) {
		var ary = ["chrome-extension://", "chrome://"];
		for (var i = 0; i < ary.length; i++) {
			if (tab.url.startsWith(ary[i])) {
				return;
			}
		}
	}
	if (false) {
		//checkBlackUrl(tab);
	}
	if (block(tab.url)) {
		//logTabInfo("block:",tab);
		var tabUrl = encodeURIComponent(tab.url);
		var tabTitle = encodeURIComponent(tab.title);
		chrome.tabs.update(tab.id, {url: "popup.html?to=" + tabUrl + "&myTitle=" + tabTitle});
	} else {
		//logTabInfo("not block:",tab);
	}
}

//chrome.i18n.getMessage("")
//\u即時監測請求網址  =======用途不明
chrome.webRequest.onBeforeRequest.addListener(function (info) {
	//chokali.log.show("chrome.webRequest.onBeforeRequest.addListener", arguments);
	var cancel = false;
	if (false) {
		if (info.title !== undefined) {
			//checkBlackUrl(info);
		}
	}

	if (!main.isWebRequestFilterBlocked) {  //怪怪的
		cancel = block(info.url);
	}

	return {cancel: cancel};

}, {
	urls: ["*://*/*"]
}, ["blocking"]);

// 即時監測新開browser分頁
chrome.tabs.onCreated.addListener(function (tab) {
	chokali.log.show("chrome.tabs.onCreated.addListener", arguments);
	handle(tab);
});

// 即時分頁即時更新監聽
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
	chokali.log.show("chrome.tabs.onUpdated.addListener", arguments);
	handle(tab);
});


// 分頁即時更新監聽
chrome.tabs.onUpdated.addListener(main.onFacebookLogin);


$(document).ready(function () {
	chokali.log.show("document ready.......for background");
	main.start();

	// 取得黑名單網址
	//getSites();
	//getBlackTitle();

	//更新黑名單存在本機
	main.reloadAll(false);
	setInterval(function () {
		//filterfarm.connectFireDatabase(true);
		main.reloadAll(false);
	}, filterfarm.localDB.timeoutSeed + 1000);

});

// Firebase 初始化
function initApp() {
	firebase.auth().onAuthStateChanged(function (user) {
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
				$(document).ready(function () {
					$('#oauth_block').hide();
					$('#user_block').show();
					$('#opinion_block').show();
					$('#user_name').html(displayName);
				});
			}
		}
		if (document.getElementById('quickstart-button') != null) {
			document.getElementById('quickstart-button').disabled = false;
		}
	});
	if (document.getElementById('quickstart-button') != null) {
		document.getElementById('quickstart-button').addEventListener('click', startSignIn, false);
	}
}

// google 登入驗證
function startAuth(interactive) {
	// Request an OAuth token from the Chrome Identity API.
	chrome.identity.getAuthToken({interactive: !!interactive}, function (token) {
		if (chrome.runtime.lastError && !interactive) {
			console.log('It was not possible to get a token programmatically.');
		} else if (chrome.runtime.lastError) {
			console.error(chrome.runtime.lastError);
		} else if (token) {
			// Authrorize Firebase with the OAuth Access Token.
			var credential = firebase.auth.GoogleAuthProvider.credential(null, token);
			firebase.auth().signInWithCredential(credential).catch(function (error) {
				// The OAuth token might have been invalidated. Lets' remove it from cache.
				if (error.code === 'auth/invalid-credential') {
					chrome.identity.removeCachedAuthToken({token: token}, function () {
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

window.onload = function () {
	console.log("window  onload.......");
	initApp();
};