'use strict';

var Weather = (function () {

    var module = {};
    var html = ''; 
    var interval;

    var longitude = '-73.957';
    var latitude = '40.718';
    var key = 'a5964c3f0e816b98160841c59bed9521';
    var url = 'http://api.forecast.io/forecast/' + key + '/' + latitude + ',' + longitude + '?callback=?';

    var twelveHours = function (i) {

        var meridian = 'am';
        
        if (i > 12) {
            i = i - 12;
            meridian = 'pm'
        } else if (i == 0) {
            i += 12;
        };

        return i + meridian;
    }

    module.init = function ($element) {

        var setWeather = function () {
            $.getJSON(url, function(callback) {

                var hours = callback.hourly.data
                for (var i = 0; i < 12; i++) {
                    var hour = hours[i];
                    var time = new Date(hour.time * 1000);
                    var timeString = twelveHours(time.getHours());
                    html += '<div class="weather__point"><div class="weather__hour">' + timeString + '</div><div class="weather__temperature">' + Math.round(hour.temperature) + '</div></div>'
                
                    console.log(hour, timeString);
                }

                $element.html('<div class="weather__center">' + html + '</div>');

            }, function (error) {
                console.log(error);
            });
        }

        setWeather();

        interval = setInterval(function () {
            setWeather();
        }, 1000 * 60 * 30);
         
    }

    return module;

})();

var Clock = (function () {

    var module = {};
    var interval;

    var formatTime = function (i) {
        if (i < 10) {
            i = '0' + i;
        };
        return i;
    }

    var twelveHours = function (i) {
        
        if (i > 12) {
            i = i - 12;
        }  else if (i == 0) {
            i += 12;
        };

        return i;
    }

    module.init = function ($element) {

        interval = setInterval(function () {

            var now = new Date();
            var h = now.getHours();
            var m = now.getMinutes();
            var s = now.getSeconds();

            h = twelveHours(h);
            m = formatTime(m);
            s = formatTime(s);

            var html = '<div class="clock__display">' + h + ':' + m + '</div><div style="width: ' + s / 60 * 100 + '%;" class="clock__seconds"></div>';
            
            $element.html(html);

        }, 1000);
    }

    return module;

})();

$(function () {

    Clock.init($('.clock'));
    Weather.init($('.weather'));

});