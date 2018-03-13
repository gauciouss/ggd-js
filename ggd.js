;

ggd = {};

(function(m) {
    
    m.message = {
			
    		displayModel: "dialog",	//dialog or window
    		
    		_Poster: undefined,
    		
    		/**
    		 * post message物件，一個dom tree裡面只可以有一個(物件內部有實作 singleton pattern)，new的時候可以不傳參數，預設是把new的頁面(window)註冊message listener
    		 */
    		Poster: function(settings) {
    			var _settings = {
        			target: undefined
        		};
    			
    			var _p = m.message._Poster;
    			var _event = undefined;
    			if(!m.message._Poster) {
    				//實作 singleton pattern
					m.message._Poster = this;
					var target = _settings.target || window;
					//new的時候就會把該視窗註冊上 message listener
					target.addEventListener("message", function(event) {
	    				console.log(event);
	    				_event = event;
	    			}, false);
				}
    			else {
    				console.log("Poster must be singleton");
    			}
    			
    			/**
    			 * 發送訊息給指定的視窗物件
    			 */
    			this.sendMessage = function(settings) {
    				var _settings = {
    					target: undefined,
    	    			msg: "",
    	    			domain: "",
    	    			beforeCB: undefined,
    	    			afterCB: undefined
    				};
    				$.extend(_settings, settings);
        			
        			if(typeof _settings.beforeCB == "function") _settings.beforeCB();
        			if(typeof _settings.target !== undefined) {
        				console.log("send msg: " + _settings.msg);
        				_settings.target.postMessage(_settings.msg, _settings.domain);
        				if(typeof _settings.afterCB == "function") _settings.afterCB();
        			}
        			else {
        				alert("post message target is not defined");
        			}
    			};
    			
    			/**
    			 * 取得message listener收到的訊息
    			 */
    			this.getMessage = function() {
    				return _event;
    			};
    			
    			return _p;
    		},
    		
    		/**
    		 * 註冊post message listener
    		 */
    		registerPostMsgListener: function(opts) {
    			var _opts = {
    				target: undefined,
    				cb: undefined
    			};
    			$.extend(_opts, opts);
    			
    			var t = _opts.target || window;
    			
    			t.addEventListener("message", function(event) {
    				console.log(event);
    				if(typeof _opts.cb == "function") _opts.cb(event);				
    			}, false);
    		},
    		
    		/**
    		 * 發送訊息到指定的 window (window open, tab, iframe ...)物件
    		 */
    		postMsgToDomain: function(settings) {
    			var _settings = {
    				target: undefined,
    				msg: "",
    				domain: "",
    				beforeCB: undefined,
    				afterCB: undefined
    			};
    			
    			$.extend(_settings, settings);
    			
    			if(typeof _settings.beforeCB == "function") _settings.beforeCB();
    			if(typeof _settings.target !== undefined) {
    				console.log("send msg: " + _settings.msg);
    				_settings.target.postMessage(_settings.msg, _settings.domain);
    				if(typeof _settings.afterCB == "function") _settings.afterCB();
    			}
    			else {
    				alert("post message target is not defined");
    			}
    		},
    		
    		
			showModal: function(settings) {
				var _settings = {
					type: undefined,  //undefined, alert or confirm
					msgContent: "",
					msgTitle: "",
					msgFooter: "",				
					closeCallback: undefined,
					showCallback: undefined
				};
				$.extend(_settings, settings);
				
				if(_settings.type === undefined || _settings.type == "alert") {
					
					if(m.message.displayModel !== "dialog") {
						alert(_settings.msgContent);
						if(_settings.closeCallback !== undefined) {
							console.log("do close call back");
							_settings.closeCallback();
						}
					}
					else {
						$("#msgModal").remove();
						var res = '<div id="msgModal" tabindex="-1" class="modal" role="dialog" data-backdrop="static"><div class="vertical-alignment-helper"><div class="modal-dialog vertical-align-center"><div class="modal-content"><div class="modal-header" data-dismiss="modal"><h4 class="modal-title">$MSG_TITLE</h4></div><div class="modal-body"><p>$MSG_CONTENT</p></div><div class="modal-footer"><button type="button" class="btn btn-default" data-dismiss="modal">關閉</button></div></div></div></div></div>';
						res = res.replace("$MSG_TITLE", _settings.msgTitle);
						res = res.replace("$MSG_CONTENT", _settings.msgContent);
						$("body").append(res);
						
						$("#msgModal").modal({show: true});
						$("#msgModal").on("shown.bs.modal", function() {						
							if(_settings.showCallback !== undefined) {
								_settings.showCallback();
							}
						});
						
						$("#msgModal").on("hidden.bs.modal", function() {
							if(_settings.closeCallback !== undefined) {
								console.log("do close call back");
								_settings.closeCallback();
							}
							console.log("remove msg modal");
							$("#msgModal").remove();
						});
					}							
				}
				else if(_settings.type == "confirm") {
					
					if(m.message.displayModel !== "dialog") {
						
						if(confir$(_settings.msgContent)) {
							if(_settings.showCallback !== undefined) {
								_settings.showCallback();
							}
						}
						else {
							if(_settings.closeCallback !== undefined) {
								_settings.closeCallback();
							}
						}										
					}
					else {
						var res = '<div class="modal" tabindex="-1" role="dialog" id="confirmModal" data-backdrop="static"><div class="vertical-alignment-helper"><div class="modal-dialog vertical-align-center"><div class="modal-content"><div class="modal-header" data-dismiss="modal"><h4 class="modal-title">$MSG_TITLE</h4></div><div class="modal-body"><p>$MSG_CONTENT</p></div><div class="modal-footer"><button type="button" class="btn btn-default" id="close" data-dismiss="modal">取消</button><button type="button" class="btn btn-primary" id="ok">確定</button></div></div></div></div></div>';
						$("#confirmModal").remove();				
						res = res.replace("$MSG_TITLE", _settings.msgTitle);
						res = res.replace("$MSG_CONTENT", _settings.msgContent);
						$("body").append(res);
						
						$("#confirmModal").modal({show: true});
						$("#confirmModal #ok").on("click", function() {
							$("#confirmModal").modal("hide");
							if(_settings.showCallback !== undefined) {
								_settings.showCallback();
							}
						});
						
						$("#confirmModal button[data-dismiss='modal']").on("click", function() {
							$("#confirmModal").modal("hide");
							if(_settings.closeCallback !== undefined) {
								console.log("do close call back");
								_settings.closeCallback();
							}
						});
					}
				}			
			}
		
	};

    m.util = {    		
    	
        /**
         * 取得行動裝置的OS
         */
        getMobileOS: function(k) {
            var os = "0";
            if (this.isMobileDevice()) {
                var ua = k || navigator.userAgent;
                ua = ua.toLowerCase();
                if (ua.match(/(iphone|ipod|ipad)/)) os = "s";
                else if (ua.match(/android/)) os = "g";
                else os = "j";
            }
            return os;
        },

        /**
         * 判斷是否為IE瀏覽器
         */
        isIE: function() {
            return navigator.userAgent.search("MSIE") > -1;
        },
        
        isIE89: function() {
        	if(navigator.userAgent.search("MSIE 8") > -1) return true;
        	if(navigator.userAgent.search("MSIE 9") > -1) return true;
        	return false;
        },
        
        /**
         * 判斷是否為行動裝置
         * @param os
         */
        isMobileDevice: function(os) {
            var ua = os || navigator.userAgent;
            ua = ua.toLowerCase();
            var checker = {
                iphone: ua.match(/(iphone|ipod|ipad)/),
                blackberry: ua.match(/blackberry/),
                android: ua.match(/android/)
            };
            return checker.android || checker.iphone || checker.blackberry;
        },

        /**
         * 計算兩個日期共差幾天
         *
         * @param d1
         * @param d2
         */
        betweenTwoDate: function(d1, d2) {
            var timeDiff = Math.abs(d2.getTime() - d1.getTime());
            var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
            return diffDays;
        },
        StringBuilder: function() {
            this.buffer = [];
            this.length = function() {
            	return this.buffer.join('').length;
            };
            this.append = function(val) {
                this.buffer.push(val);
                return this;
            };
            this.appendWhiteSpace = function() {
                this.buffer.push(" ");
                return this;
            };
            this.appendAttr = function(key, val) {
                this.buffer.push(key);
                this.buffer.push("='");
                this.buffer.push(val);
                this.buffer.push("'");
                return this;
            };
            this.toString = function() {
                return this.buffer.join('');
            };
            this.release = function() {
                while (this.buffer.length > 0) {
                    this.buffer.pop();
                }
            };
        },
        /**
         * 判斷是否為空
         *
         * @param str
         * @returns {Boolean}
         */
        isEmpty: function(obj) {
            var f = false;
            var type = typeof(obj);
            if (type == "string" && obj.length == 0) {
                f = true;
            } else if (type == "number") {
                f = false;
            } else {
                f = true;
                for (var i in obj) {
                    f = false;
                    break;
                }
            }

            return f;
        },
        
        /**
         * 檢查是否為正確的身份證字號
         *
         * @param idStr
         *            中華民國身份證字號
         * @returns {Boolean}
         */
        checkROCID: function(idStr) {
            if (this.isEmpty(idStr)) {
                return false;
            }
            // 依照字母的編號排列，存入陣列備用。
            var letters = new Array('A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'X', 'Y', 'W', 'Z', 'I', 'O');
            // 儲存各個乘數
            var multiply = new Array(1, 9, 8, 7, 6, 5, 4, 3, 2, 1);
            var nums = new Array(2);
            var firstChar;
            var firstNum;
            var lastNum;
            var total = 0;
            // 撰寫「正規表達式」。第一個字為英文字母，
            // 第二個字為1或2，後面跟著8個數字，不分大小寫。
            var regExpID = /^[a-z](1|2)\d{8}$/i;
            // 使用「正規表達式」檢驗格式
            if (idStr.search(regExpID) == -1) {
                // 基本格式錯誤
                alert("請仔細填寫身份證號碼");
                return false;
            } else {
                // 取出第一個字元和最後一個數字。
                firstChar = idStr.charAt(0).toUpperCase();
                lastNum = idStr.charAt(9);
            }
            // 找出第一個字母對應的數字，並轉換成兩位數數字。
            for (var i = 0; i < 26; i++) {
                if (firstChar == letters[i]) {
                    firstNum = i + 10;
                    nums[0] = Math.floor(firstNum / 10);
                    nums[1] = firstNum - (nums[0] * 10);
                    break;
                }
            }
            // 執行加總計算
            for (var i = 0; i < multiply.length; i++) {
                if (i < 2) {
                    total += nums[i] * multiply[i];
                } else {
                    total += parseInt(idStr.charAt(i - 1)) * multiply[i];
                }
            }
            // 和最後一個數字比對
            // 規則一餘數為零，且檢查碼需為零
            if (lastNum == 0 && (total % 10) != lastNum) {
                alert("身份證號碼寫錯了");
                return false;
            }
            // 規則二餘數與檢查碼需相符
            if (lastNum != 0 && (10 - (total % 10)) != lastNum) {
                alert("身份證號碼寫錯了");
                return false;
            }
            return true;
        },

        /**
         * 取得client端日期(西元年) chrome, firefox的year取出來要加1900才會是現在的西元
         * ie的year取出來就是現在的西元年
         *
         * @returns {String}
         */
        getADDate: function(time) {
            var date = time ? new Date(time) : new Date();
            if (this.isIE) {
                var year = date.getYear();
                year = year < 2000 ? year + 1900 : year;
                return year + "/" + (date.getMonth() + 1) + "/" + date.getDate();
            } else {
                return (date.getYear() + 1900) + "/" + (date.getMonth() + 1) + "/" + date.getDate();
            }
        },

        /**
         * 日期時間自訂格式化
         * @param time 日期
         * @param format (ex:yyyy-MM-dd HH:mm:ss)
         */
        getCustomFormatDate: function(time, format) {
            if (this.isEmpty(format)) {
                format = time;
                time = new Date();
            }
            var formatDate = this.isEmpty(format) ? "yyyy-MM-dd" : format;
            var date = new Date(time);
            var year = date.getFullYear();
            var month = date.getMonth() + 1;
            month = this.padLeft(month.toString(), 2);
            var day = this.padLeft(date.getDate().toString(), 2);
            var hour = this.padLeft(date.getHours().toString(), 2);
            var min = this.padLeft(date.getMinutes().toString(), 2);
            var sec = this.padLeft(date.getSeconds().toString(), 2);
            formatDate = formatDate.replace("yyyy", year);
            formatDate = formatDate.replace("MM", month);
            formatDate = formatDate.replace("dd", day);
            formatDate = formatDate.replace("HH", hour);
            formatDate = formatDate.replace("mm", min);
            formatDate = formatDate.replace("ss", sec);
            return formatDate;
        },

        /**
         * 字串補零
         * */
        padLeft: function(str, lenght) {
            if (str.length >= lenght) return str;
            else return this.padLeft("0" + str, lenght);
        },

        /**
         * 取得url後面的parameter
         *
         * @param param
         * @returns
         */
        getURLParam: function(param) {
            var results = new RegExp('[\?&]' + param + '=([^&#]*)').exec(window.location.href);
            if (results == null) {
                return null;
            } else {
                return results[1] || 0;
            }
        },

        /**
         * 檢核email的格式
         *
         * @param email
         * @returns
         */
        checkEmail: function(email) {
            var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
            return re.test(email);
        },

        /**
         * 檢查是否為數字
         *
         * @param tel
         */
        checkNumber: function(tel) {
            var reg = /^\d+[.]?\d*$/;
            return reg.test(tel);
        },
        /**
         * 檢查是否為整數
         *
         * @param tel
         */
        checkIntegerNumber: function(tel) {
            var reg = /^\d+$/;
            return reg.test(tel);
        },
        
        /**
         * 預覽上傳圖檔
         */
        previewFileUploadIMG: function(settings) {
        	var _settings = {
        		targetFile: undefined,
        		targetImg: undefined,
        		imgSrc: undefined,
        		callback: undefined
        	};
        	$.extend(_settings, settings);
        	if(_settings.targetFile !== undefined) {
        		$(_settings.targetFile).on("change", function() {
            		var file = this.files[0];
            		if (!/\/(?:jpeg|jpg|png)/i.test(file.type)) {
            			alert("上傳檔案類型有誤");
            		}
            		else {
            			var reader = new FileReader();            			
            			reader.onload = function() {
            				var result = this.result;            				
            				$(_settings.targetImg).attr("src", result);
            				$(_settings.targetFile).val("");
            				if(typeof(_settings.callback) == "function") _settings.callback(result);
            			};
            			reader.readAsDataURL(file);            			
            		}
            	});
        	}
        	
        	if(_settings.targetImg !== undefined && !ggd.util.isEmpty(_settings.imgSrc)) {
        		$(_settings.targetImg).attr("src", _settings.imgSrc);
        	}
        }
    };
})(ggd);
