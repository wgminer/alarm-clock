'use strict'

var help = (function () {

    return {

        debounce: function (fn, delay) {
            var timer = null;
            return function () {
                var context = this, args = arguments;
                clearTimeout(timer);
                timer = setTimeout(function () {
                    fn.apply(context, args);
                }, delay);
            };
        },

        throttle: function(fn, threshhold, scope) {
            threshhold || (threshhold = 250);
            var last,
                deferTimer;
            return function () {
                var context = scope || this;
                var now = +new Date,
                    args = arguments;
                if (last && now < last + threshhold) {
                    clearTimeout(deferTimer);
                        deferTimer = setTimeout(function () {
                        last = now;
                        fn.apply(context, args);
                    }, threshhold);
                } else {
                    last = now;
                    fn.apply(context, args);
                }
            };
        },

        inlineStyle: function (element, styles) {

            console.log([styles].length);

            for (var i = 0; i < [styles].length; i++) {
                console.log(styles);
            }

        },

        ajax: function (url, callbackFunction) {
        
            this.bindFunction = function (caller, object) {
                return function() {
                    return caller.apply(object, [object]);
                };
            };

            this.stateChange = function (object) {
                if (this.request.readyState==4)
                    this.callbackFunction(this.request.responseText);
            };

            this.getRequest = function() {
                if (window.ActiveXObject)
                    return new ActiveXObject('Microsoft.XMLHTTP');
                else if (window.XMLHttpRequest)
                    return new XMLHttpRequest();
                return false;
            };

            this.postBody = (arguments[2] || "");

            this.callbackFunction=callbackFunction;
            this.url=url;
            this.request = this.getRequest();
            
            if(this.request) {
                var req = this.request;
                req.onreadystatechange = this.bindFunction(this.stateChange, this);

                if (this.postBody!=="") {
                    req.open("POST", url, true);
                    req.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
                    req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
                    req.setRequestHeader('Connection', 'close');
                } else {
                    req.open("GET", url, true);
                }

                req.send(this.postBody);
            }
        }

    };

})();