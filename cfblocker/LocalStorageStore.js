var LocalStorageStore = {

	isWebRequestFilterBlocked: function () {
		var ret = false,
			value = -1,
			timestamp = (new Date()).getTime();

		value = parseInt(localStorage.getItem("blockWebRequestFilter"));
		if (value === NaN || value <= 0)
			return false;

		return (timestamp - value) < threshold;
	},

	blockWebRequestFilter: function () {
		var timestamp = (new Date()).getTime();

		localStorage.setItem("blockWebRequestFilter", timestamp);
	},

	get_userBlacklist: function () {
		return _getArray("userBlacklist");
	},

	set_userBlacklist: function (val) {
		localStorage.setItem("userBlacklist", JSON.stringify(val));
	},

	get_userWhitelist: function () {
		return _getArray("userWhitelist");
	},

	set_userWhitelist: function (val) {
		localStorage.setItem("userWhitelist", JSON.stringify(val));
	},

	db: {
		timeoutSeed: 1000 * 60 * 60 * 24 * 3,//three day
		table: {
			sites: "sites",
			blackTitles: "blackTitles"
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
			var me = this;
			var ref2 = firebase.database().ref(tableName);
			me._initialEmpty(tableName);
			ref2.once('value', function (snapshot) {
				snapshot.forEach(function (childSnapshot) {
					me._addNode(tableName, {key: childSnapshot.key, val: childSnapshot.val()});
				});
			});
		},
		_reloadSites: function () {
			this._reloadTable(this.table.sites);
		},
		_reloadBlackTitles: function () {
			this._reloadTable(this.table.blackTitles);
		},
		isEmptyLocalSites:function(){
			return LocalStorageStore.db.getSites().length==0;
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
			}
			if (enforce || this.isEmptyLocalSites()) {
				load.call(this);
			} else {
				if(this.isTimeOut()){
					load.call(this);
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
		debug: function () {

		}
	}


}