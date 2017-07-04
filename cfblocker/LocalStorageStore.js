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
	}


}