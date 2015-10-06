'use strict';

var clock = (function () {
    var module = {};
    var interval;

    var formatHours = function (hours) { 
    	return (hours + 24) % 12 || 12; 
    }

    var formatMinutes = function (minutes) {
        if (minutes < 0) {
            return '0' + minutes;
        } else {
        	return minutes;
        }
    }

    module.init = function ($clock) {

        interval = setInterval(function () {
        	
            var now = new Date();
            var h = formatHours(now.getHours());
            var m = formatMinutes(now.getMinutes());
            var s = now.getSeconds();

            var time = h + ':' + m + ':' + s;

            $clock.html(time);

        }, 500);

    }

    return module;

}());



$(function () {

	clock.init($('.clock'));

});