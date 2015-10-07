'use strict';

var Weather = (function () {

    var module = {};
    var hourlyHtml = ''; 
    var currentHtml = ''; 
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
        } else if (i == 12) {
            meridian = 'pm';
        }

        return i + meridian;
    }

    var generateIcon = function (data) {

        // icon: A machine-readable text summary of this data point, suitable for selecting an icon for display. If defined, this property will have one of the following values: clear-day, clear-night, rain, snow, sleet, wind, fog, cloudy, partly-cloudy-day, or partly-cloudy-night. (Developers should ensure that a sensible default is defined, as additional values, such as hail, thunderstorm, or tornado, may be defined in the future.)

        var cloud = '<div class="cloud"><div class="cloud__inner"></div></div>';
        var sun = '<div class="sun"><div class="sun__inner"></div></div>';
        var partlyCloudy = '<div class="partly-cloudy"><div class="partly-cloudy__inner"></div>' + cloud + sun + '</div>';

        console.log(data.icon.indexOf('partly-cloudy'));
        var text, icon;
        
        var clear = '<div class="clear"></div>';

        if (data.icon.indexOf('clear') > -1) {
            text = 'Clear';
            icon = clear;
        }

        if (data.icon.indexOf('cloudy') > -1) {
            text = 'Cloudy';
            icon = clear;
        }

        if (data.icon.indexOf('partly-cloudy') > -1) {
            text = 'Partly';
            icon = partlyCloudy;
        }

        if (data.icon.indexOf('snow') > -1) {
            text = 'Snow';
            icon = clear;
        }

        if (data.icon.indexOf('sleet') > -1) {
            text = 'Sleet';
            icon = clear;
        }

        if (data.icon.indexOf('rain') > -1) {
            text = 'Rain';
            icon = clear;
        }

        if (data.icon.indexOf('wind') > -1) {
            text = 'Wind';
            icon = clear;
        }

        if (data.icon.indexOf('fog') > -1) {
            text = 'Fog';
            icon = clear;
        }

        $('.weather__icon').html(icon);
        $('.weather__label').text(text);

        return false;

    }

    module.init = function () {

        var setWeather = function () {
            $.getJSON(url, function(callback) {

                var now = Date.now() / 1000;
                var temp, text, icon;

                if (now < callback.daily.data[0].temperatureMaxTime) { // If before max temp is reached
                    temp = callback.daily.data[0].temperatureMax;          
                    text = 'High';  
                    icon = generateIcon(callback.daily.data[0]);
                } else if (now < callback.daily.data[0].temperatureMinTime) { // If after max temp is reached but before min temp is reached
                    temp = callback.daily.data[0].temperatureMin;
                    text = 'Low';
                    icon = generateIcon(callback.daily.data[0]);
                } else { // Else get next max temp
                    temp = callback.daily.data[1].temperatureMax;
                    text = 'High';
                    icon = generateIcon(callback.daily.data[1]);
                }

                $('.temperature__number').text(Math.round(temp));
                $('.temperature__label').text(text);

                // var currentHtml = '<div class="weather__point"><div class="weather__hour">Now</div><div class="weather__temperature">' + Math.round(callback.currently.temperature) + '</div></div>'

                // var hours = callback.hourly.data
                // for (var i = 0; i < 24; i++) {

                //     var hour = hours[i];
                //     var t = new Date(hour.time * 1000);
                //     var h = t.getHours();

                //     if (h == 9 || h == 12 || h == 21 || h == 0) {
                //         var timeString = twelveHours(h);
                //         hourlyHtml += '<div class="weather__point"><div class="weather__hour">' + timeString + '</div><div class="weather__temperature">' + Math.round(hour.temperature) + '</div></div>';
                //     }
                // }

                // $element.html('<div class="weather__center">' + currentHtml + hourlyHtml + '</div>');

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

    var formatDate = function (date) {

        var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
        var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];

        var day = days[ date.getDay() ];
        var month = months[ date.getMonth() ];

        return day + ', ' + month + ' ' + date.getDate();

    }

    var setClock = function () {
        var now = new Date();
        var h = now.getHours();
        var m = now.getMinutes();
        var s = now.getSeconds();

        h = twelveHours(h);
        m = formatTime(m);
        s = formatTime(s);

        var html = '<span class="clock__display">' + h + ':' + m + '</span><span class="clock__date">';
        
        $('.clock .center').html(html);
    }

    module.init = function () {

        setClock();

        interval = setInterval(function () {

            setClock();

        }, 1000);

    }

    return module;

})();

$(function () {
    Clock.init();
    Weather.init();
});