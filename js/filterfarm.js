/**
 * Created by andrew on 2017/7/3.
 */

var Filterfarm = function (config) {
	var _selfFilterfarm = this;
	this.firebaseWrapper = {
		_database: null,
		init: function () {
			this._run();
			// 初始化 Firebase 參數
			var config = {
				apiKey: "AIzaSyBWx8ieQHdXKXVMT9BSPhgl7rWWexEDxPo",
				authDomain: "filterfarm-a7a93.firebaseapp.com",
				databaseURL: "https://filterfarm-a7a93.firebaseio.com",
				storageBucket: "filterfarm-a7a93.appspot.com",
				messagingSenderId: "817781349645"
			};
			window.firebase.initializeApp(config);
			this.registerConnectStateEvent();
		}, getDatabase: function (enforceReload) {
			if (this._database == null || enforceReload) {
				this._database = window.firebase.database();
			}
			return this._database;
		}, disConnect: function () {
			this.getDatabase().goOffline();
		}, connect: function () {
			this.getDatabase().goOnline();
		}, registerConnectStateEvent: function () {
			var listRef = this.getDatabase().ref("/connectPool");
			// Create a new post reference with an auto-generated id
			var userRef = listRef.push(); //the auto-generated id is {userRef.key}
			var connectedRef = this.getDatabase().ref(".info/connected");
			connectedRef.on("value", function (snap) {
				if (snap.val() === true) {
					chokali.log.show("connected", arguments);
					// Remove ourselves when we disconnect.
					userRef.onDisconnect().remove();
					//userRef.set(true);
					let time = chokali.dateTime.getDateTimeText(new Date(), "yyyy/mm/dd hh:min:ss");
					chokali.findIP(
						function (ip) {
							userRef.set({
								ip: ip,
								datetime: time
							});
						}, function (e) {
							console.error(e);
							userRef.set({
								ip: "undefined",
								datetime: time
							});
						}
					);
					/*Usage example*/
					//findIP.then(ip => document.write('your ip: ', ip)).catch(e => console.error(e))
				} else {
					chokali.log.show("not connected", arguments);
				}
			});
			// Number of online users is the number of objects in the presence list.
			listRef.on("value", function (snap) {
				chokali.log.show("Online Users", snap.numChildren());
			});
			if (true) {// prepare destrooy
				this.getDatabase().ref("/presence").on("value", function (snap) {
					chokali.log.show("Presence", snap.numChildren());
				});
			}

		},
		excuseAsyncForOnceValue: function (method, ref, callback) {
			this._excuseOnceValue(ref, function (...arg) {
				callback(...arg); //obj is callback
			});
		},
		excuseAsyncForSet: function (method, ref, dataObj, callback) {//todo 2222
			this._excuseSet(ref, function (...arg) {
				callback(...arg); //obj is callback
			});
		},
		excuseAsyncForDelete: function (method, ref, callback) {

		},
		excuseLikeSync: function () {
			var firebaseWrapper = this;
			this._cacheQueue.push(arguments);
			return;
		},
		_excuseOnceValue: function (ref, callback) {
			ref.once('value').then(callback);
		},
		_excuseSet: function (ref, dataObj, callback) {
			ref.set(dataObj).then(callback);//還好有then callback,官網似乎沒提到這個api
			//ref.set(dataObj);
		},
		_excuseDelete: function (ref, dataObj, callback) {
		},
		_cacheQueue: [],
		_lock: false,
		_lockTimeoutSeed: 6000, //lock timeout is relock
		_runThreadSeed: 500,
		_run: function () {
			var firebaseWrapper = this;
			setInterval(function () {
				//chokali.log.show(`prepare run thread `, firebaseWrapper._cacheQueue);
				var threads = firebaseWrapper._cacheQueue;
				if (threads.length > 0) {
					if (!firebaseWrapper._lock) {
						chokali.log.show(`before run thread `, firebaseWrapper._cacheQueue);
						var thread = threads[0];
						var method = thread[0];
						switch (method) {
							case "onceValue":
								var ref = thread[1];
								var callback = thread[2];
								firebaseWrapper.connect();//=======connect=======
								firebaseWrapper._lock = true;
								firebaseWrapper._lockTimeout = setTimeout(function () {
									chokali.log.show(`lock time out `, firebaseWrapper._cacheQueue);
									firebaseWrapper._lock = false;
								}, firebaseWrapper._lockTimeoutSeed);
								firebaseWrapper._excuseOnceValue(ref, function (...arg) {
									callback(...arg);
									firebaseWrapper._lock = false;
									clearTimeout(firebaseWrapper._lockTimeout);
									firebaseWrapper.disConnect();//=======disconnect=======
								});
								break;
							case "set":
								var ref = thread[1];
								var dataObj = thread[2];
								var callback = thread[3];
								firebaseWrapper.connect();//=======connect=======
								firebaseWrapper._lock = true;
								firebaseWrapper._lockTimeout = setTimeout(function () {
									chokali.log.show(`lock time out `, firebaseWrapper._cacheQueue);
									firebaseWrapper._lock = false;
								}, firebaseWrapper._lockTimeoutSeed);
								firebaseWrapper._excuseSet(ref, dataObj, function (...arg) {
									chokali.log.show(`_excuseSet`, firebaseWrapper._cacheQueue);
									callback(...arg);
									firebaseWrapper._lock = false;
									clearTimeout(firebaseWrapper._lockTimeout);
									firebaseWrapper.disConnect();//=======disconnect=======
								});
								break;
							case "delete":
								break;
						}
						firebaseWrapper._cacheQueue = threads.slice(1, threads.length);
						chokali.log.show(`after run thread `, firebaseWrapper._cacheQueue);
					} else {
						chokali.log.showRed(`thread is lock`, firebaseWrapper._cacheQueue);
					}
				} else {
					//chokali.log.show(`thread is zero`, firebaseWrapper._cacheQueue);
				}
				//chokali.log.show(`===================== `, firebaseWrapper._cacheQueue);
			}, firebaseWrapper._runThreadSeed);
		}
	};
	this.localDB = {
		timeoutSeed: 1000 * 60 * 60 * 12,//one hour*12
		table: {
			blackTitles: "blackTitles",
			comment: "comment",
			sites: "sites",
			users: "users",
		},
		_empty: JSON.stringify([]),
		_getNowTime: function () {
			return (new Date()).getTime();
		},
		_getLastUpdateLocalDbTime: function () {
			var time = localStorage.getItem("lastUpdateLocalDbTime");
			if (time == null || time.length == 0) {
				return -1;
			} else {
				return time;
			}
		},
		_setLastUpdateLocalDbTime: function (time) {
			localStorage.setItem("lastUpdateLocalDbTime", time);
		},
		_node: function (obj) {
			$.extend(true, this, obj);
		},
		_getStorageItem: function (tableName) {
			return localStorage.getItem(tableName);
		},
		_setStorageItem: function (tableName, s) {
			return localStorage.setItem(tableName, s);
		},
		_initialEmpty: function (tableName) {
			this._setStorageItem(tableName, this._empty);
		},
		_addNode: function (tableName, data) {
			var ary = this._getStorageItemObj(tableName);
			if (Array.isArray(ary)) {
				ary.push(new this._node(data));
			} else {
				console.error("tableName " + tableName + "is not initialize");
			}
			this._setStorageItem(tableName, JSON.stringify(ary));
		},
		_getStorageItemObj: function (tableName) {
			if (this._getStorageItem(tableName) == null) {
				this._initialEmpty(tableName);
			}
			return JSON.parse(this._getStorageItem(tableName));
		},
		_reloadTable: function (tableName) {
			let localDB = this;
			let ref = _selfFilterfarm.getFireDatabase().ref(tableName);
			_selfFilterfarm.firebaseWrapper.excuseLikeSync("onceValue", ref, function (snapshot) {
				localDB._initialEmpty(tableName);
				chokali.log.show(`${tableName} clear and rest`, arguments);
				snapshot.forEach(function (childSnapshot) {
					localDB._addNode(tableName, {key: childSnapshot.key, val: childSnapshot.val()});
				});
			});
		},
		_reloadSites: function () {
			this._reloadTable(this.table.sites);
		},
		_reloadBlackTitles: function () {
			this._reloadTable(this.table.blackTitles);
		},
		isEmptyLocalSites: function () {
			return this.getSites().length == 0;
		},
		getSites: function () {
			return this._getStorageItemObj(this.table.sites);
		},
		getBlackTitles: function () {
			return this._getStorageItemObj(this.table.blackTitles);
		},
		reloadSitesAndBlackTitles: function (enforce) {
			var load = function () {
				this._reloadSites();
				this._reloadBlackTitles();
				this._setLastUpdateLocalDbTime(this._getNowTime());
				chokali.log.show("update sites...ok");
			}
			if (enforce || this.isEmptyLocalSites()) {
				load.call(this);
			} else {
				if (this.isTimeOut()) {
					load.call(this);
				} else {
					chokali.log.show("not timeout");
				}
			}
		},
		isTimeOut: function () {
			var lastTime = this._getLastUpdateLocalDbTime();
			if (lastTime == -1) {
				return true;
			}
			var nowTime = this._getNowTime();
			if ((nowTime - lastTime) >= this.timeoutSeed) {
				return true;
			}
			return false
		},
		clearAll: function () {
			this._initialEmpty(this.table.sites);
			this._initialEmpty(this.table.blackTitles);
		}
	};
	$.extend(this, config);
	this.firebaseWrapper.init();
};
window.filterfarm = new Filterfarm({
	src1: 'http://114.35.251.18:7070/facebook/index.html?path=',
	src2: 'http://willowbrookmontessori.com/system_images/filterfarm/demo?path=',
	getFirebaseWrapper: function () {
		return this.firebaseWrapper;
	},
	getFireDatabase: function (enforce) {
		var db = this.getFirebaseWrapper().getDatabase(enforce);
		return db;
	}
});
chokali.log.setVisible(!true);