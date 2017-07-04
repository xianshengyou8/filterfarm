var Filter = {

  //_Blacklist: [],
  _Whitelist: [],
  //_BlacklistRx: [],
  _WhitelistRx: [],

  /*appendBlacklist: function(list) {
    for (var i in list) {
      var item = list[i];
      var rx = this.createRegExp(item);
      this._Blacklist.push(item);
      this._BlacklistRx.push(rx);
    }
  },*/

  appendWhitelist: function(list) {
    for (var i in list) {
      var item = list[i];
      var rx = this.createRegExp(item);
      this._Whitelist.push(item);
      this._WhitelistRx.push(rx);
    }
  },

  /*match: function(hostname) {
    var ret = false;
    hostname = hostname.toLowerCase();
    for (var i in this._BlacklistRx) {
      var pattern = this._BlacklistRx[i];
      if (hostname.match(pattern)) {

        ret = true;

        for (var j in this._WhitelistRx) {
          if (hostname.match(this._WhitelistRx[j])) {
            ret = false;
            break;
          }
        }
        break;
      }
    }
    return ret;
  },*/

	match_v2: function(hostname) {
		var ret = false;
		hostname = hostname.toLowerCase();
		var siteList = filterfarm.localDB.getSites();
		for (var i in siteList) {
			var site = siteList[i];
			if(site!=null){
				var pattern = this.createRegExp(site["val"]);
				if (hostname.match(pattern)) {
					ret = true;
					for (var j in this._WhitelistRx) {
						if (hostname.match(this._WhitelistRx[j])) {
							ret = false;
							break;
						}
					}
					break;
				}
            }
		}
		return ret;
	},

  createRegExp: function(pattern) {
    var replaced;

    // Take out http[s]:// prefix
    replaced = (pattern+"").replace(/^http[s]*:*\/*/, "");

    replaced = replaced.replace(/\./g, "\\.").replace(/\*/g, ".*");
    var rx = new RegExp("^[a-z0-9-\.]*\\.+" + replaced + "$|^" + replaced + "$");

    return rx;
  }

}