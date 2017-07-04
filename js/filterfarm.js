/**
 * Created by andrew on 2017/7/3.
 */

var Filterfarm = function (config) {
	var _self = this;
	this.firebaseWrapper = {
		_database: null,
		init: function () {
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
			if (this._database==null || enforceReload) {
				this._database = window.firebase.database();
			}
			return this._database;
		},connect:function(enable){
			if(enable){
				this.getDatabase().goOnline();
			}else{
				this.getDatabase().goOffline();
			}
		},registerConnectStateEvent:function(){
			var listRef = this.getDatabase().ref("/presence");
			var userRef = listRef.push();// Create a new post reference with an auto-generated id
			var connectedRef = this.getDatabase().ref(".info/connected");
			connectedRef.on("value", function(snap) {
				if (snap.val() === true) {
					_self.log.show("connected",arguments);
					// Remove ourselves when we disconnect.
					userRef.onDisconnect().remove();
					userRef.set(true);
				} else {
					_self.log.show("not connected",arguments);
				}
			});
			// Number of online users is the number of objects in the presence list.
			listRef.on("value", function(snap) {
				_self.log.show("Online Users:",snap.numChildren(),arguments);
			});
		}
	};
	this.localDB = {
		timeoutSeed: 1000 * 60 * 60,//one hour
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
			let ref = _self.getFireDatabase().ref(tableName);
			ref.once('value').then(function(snapshot){
				localDB._initialEmpty(tableName);
				_self.log.show(`${tableName} clear and rest` , arguments);
				snapshot.forEach(function (childSnapshot) {
					localDB._addNode(tableName, {key: childSnapshot.key, val: childSnapshot.val()});
				});
				//_self.connectFireDatabase(false);
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
				console.log("update sites...ok");
			}
			if (enforce || this.isEmptyLocalSites()) {
				load.call(this);
			} else {
				if (this.isTimeOut()) {
					load.call(this);
				} else {
					console.log("not timeout");
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
	this.log = new function (name, p1, p2) {
		this.isVisible = function () {
			return this.visible;
		};
		this.setVisible = function (val) {
			this.visible = val;
		};
		this.show = function (name, p1, p2) {
			if (this.isVisible()) {
				console.info('%c' + name + ':', 'background: #222; color: #bada55', p1, p2);
			}
		};
		this.visible = false;
	};
	$.extend(this, config);
	this.firebaseWrapper.init();
};
window.filterfarm = new Filterfarm({
	reloadAll:function(enforce){
		this.localDB.reloadSitesAndBlackTitles(enforce);
	},
	getFirebaseWrapper: function () {
		return this.firebaseWrapper;
	},
	getFireDatabase: function(){
		return this.getFirebaseWrapper().getDatabase();
	},
	connectFireDatabase:function(con){
		this.getFirebaseWrapper().connect(con);
	},
	getPathValue:function(path,callback){
		this.getFireDatabase().ref(path).once('value').then(callback);
	},isConnectAsync:function(callback){
		this.getPathValue('.info/connected',callback);
		//this.getPathValue('.info/serverTimeOffset',callback);
	},detectConnect:function () {
		this.isConnectAsync(function(snapshot){
			filterfarm.log.show("connect",snapshot.val(),arguments);
		});
	}

});
filterfarm.log.setVisible(!true);