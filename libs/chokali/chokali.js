window.Chokali = window.chokali = (function () {
	var self = {
		hasJqueryLib: function () {
			if (jQuery == null) {
				throw new Error("need Jquery Library");
				return false;
			} else {
				return true;
			}
		},
		clone: function (obj) {
			if (this.hasJqueryLib()) {
				return jQuery.extend(true, {}, obj);
			}
		},
		//need animate.css
		animateCss: function ($select, animationName, callback) {
			if (this.hasJqueryLib()) {
				var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
				$select.addClass('animated ' + animationName).one(animationEnd, function () {
					$(this).removeClass('animated ' + animationName);
					if (typeof callback == "function") {
						callback.apply(this, arguments);
					}
				});
			}
		},
		findIP: function (find, notfind) {
			let p = new Promise(
				r => {
					var w = window,
						a = new (w.RTCPeerConnection || w.mozRTCPeerConnection || w.webkitRTCPeerConnection)({iceServers: []}),
						b = () => {
						};
					a.createDataChannel("");
					a.createOffer(c => a.setLocalDescription(c, b, b), b);
					a.onicecandidate = c => {
						try {
							c.candidate.candidate.match(/([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/g).forEach(r)
						} catch (e) {
						}
					}
				}
			);
			p.then(ip => {
				find(ip);
			}).catch(e => {
				notfind(e);
			});
		},
		ping: function (url, multiplier) {
			return new Promise(function (resolve, reject) {
				var start = (new Date()).getTime();
				var response = function () {
					var delta = ((new Date()).getTime() - start);
					delta *= (multiplier || 1);
					resolve(delta);
				};
				let request_image_promise = function (url) {
					return new Promise(function (resolve2, reject2) {
						var img = new Image();
						img.onload = function () {
							resolve2(img);
						};
						img.onerror = function () {
							reject2(url);
						};
						img.src = url + '?random-no-cache=' + Math.floor((1 + Math.random()) * 0x10000).toString(16);
					});
				};
				request_image_promise(url).then(response).catch(response);
				// Set a timeout for max-pings, 5s.
				setTimeout(function () {
					reject(Error('Timeout'));
				}, 5000);
			});
		},
		checkUrl: function (async, url, multiplier) {
			return new Promise(function (resolve, reject) {
				var start = (new Date()).getTime();
				// var response = function () {
				// 	var delta = ((new Date()).getTime() - start);
				// 	delta *= (multiplier || 1);
				// 	resolve(delta);
				// };
				let requestPromise = function (link) {
					return new Promise(function (resolve2, reject2) {
						let request;
						if (window.XMLHttpRequest) {
							request = new XMLHttpRequest();
						} else {
							request = new ActiveXObject("Microsoft.XMLHTTP");
						}
						request.open('GET', link, async);
						if (async) {
							request.onreadystatechange = function () {
								if (request.readyState === 4) {
									if (request.status === 404) {
									}
								}
								if(request.status==200){
									resolve2(request);
								}else{
									reject2(request);
								}
							};
							request.send();
						} else {
							request.send();
							if(request.status==200){
								resolve2(request);
							}else{
								reject2(request);
							}
						}
					});
				};
				requestPromise(url).then((req) => {
					var delta = ((new Date()).getTime() - start);
					delta *= (multiplier || 1);
					resolve({
						success:true,
						delta: delta,
						request: req
					});
				}).catch((e) => {
					var delta = ((new Date()).getTime() - start);
					delta *= (multiplier || 1);
					reject({
						success:false,
						delta: delta,
						e: e
					});
				});
				// Set a timeout for max-pings, 5s.
				setTimeout(function () {
					reject(Error('Timeout'));
				}, 5000);
			});
		},
		dateTime: {
			getDateText: function (date, format) {//format means yyyy/mm/dd or yyyy-mm-dd ....
				var yyyy = date.getFullYear().toString();
				var mm = (date.getMonth() + 1).toString(); // getMonth() is zero-based
				var dd = date.getDate().toString();
				//return yyyy +"/"+ (mm[1]?mm:"0"+mm[0]) +"/"+ (dd[1]?dd:"0"+dd[0]); // padding
				return format
					.replace("yyyy", yyyy)
					.replace("mm", mm[1] ? mm : "0" + mm[0])
					.replace("dd", dd[1] ? dd : "0" + dd[0])
					;
			}
			, getDateTimeText: function (date, format) {
				//yyyy/mm/dd hh:min:ss
				var yyyy = date.getFullYear().toString();
				var mm = (date.getMonth() + 1).toString(); // getMonth() is zero-based
				var dd = date.getDate().toString();

				var hh = date.getHours().toString();
				var min = date.getMinutes().toString();
				var ss = date.getSeconds().toString();

				return format
					.replace("yyyy", yyyy)
					.replace("mm", mm[1] ? mm : "0" + mm[0])
					.replace("dd", dd[1] ? dd : "0" + dd[0])
					.replace("hh", hh[1] ? hh : "0" + hh[0])
					.replace("min", min[1] ? min : "0" + min[0])
					.replace("ss", ss[1] ? ss : "0" + ss[0])
					;
			}
		},
		math: {
			decimal_to_hex: function (d) {
				return d.toString(16);
			},
			hex_to_decimal: function (h) {
				return parseInt(h, 16);
			},
			translatePoint: function (x1, y1, x2, y2, scale) {
				//result = point1 + (point2-point1)*scale
				var result = [x1 + (x2 - x1) * scale, y1 + (y2 - y1) * scale];
				return result;
			},
			slope_to_angle: function (slope) {
				return Math.atan(slope) / Math.PI * 180;
			}
		}
	};

	self.log = new function (name, p1, p2) {
		var me = this;
		this.isVisible = function () {
			return this.visible;
		};
		this.setVisible = function (val) {
			this.visible = val;
		};
		this.show = function (name, ...arg) {
			if (this.isVisible()) {
				console.info('%c' + name + ':', 'background: #222; color: #bada55', arg);
			}
		};
		this.showRed = function (name, ...arg) {
			if (this.isVisible()) {
				console.info('%c' + name + ':', 'background: #f22; color: #bada55', arg);
			}
		};
		this.visible = false;
		me = function () {
			me.show(arguments);
		};
	};

	self.emptyFn = function () {
	};

	return self;
})();
//console.log("chokali install ...");