'use strict'

var app = angular.module('dashboard', []);

app.directive('forcastNow', function (Weather) {
    return {
        restrict: 'E',
        scope: {},
        templateUrl: 'widgets/forcast.html',
        link: function (scope, element, attrs) {

            scope.title = 'Now';

            Weather.get()
                .then(function (callback) {
                    scope.forcast = callback.minutely.summary
                });


        }
    };
});

app.directive('forcastLater', function (Weather) {
    return {
        restrict: 'E',
        scope: {},
        templateUrl: 'widgets/forcast.html',
        link: function (scope, element, attrs) {

            scope.title = 'Later';

            Weather.get()
                .then(function (callback) {
                    scope.forcast = callback.hourly.summary;
                });


        }
    };
});

app.directive('currentTemperature', function (Weather) {
    return {
        restrict: 'E',
        scope: {},
        templateUrl: 'widgets/temperature.html',
        link: function (scope, element, attrs) {

            scope.title = 'Current';

            Weather.get()
                .then(function (callback) {
                    scope.temperature = Math.round(callback.currently.temperature);
                });

        }
    };
});

app.directive('feelsLike', function (Weather) {
    return {
        restrict: 'E',
        scope: {},
        templateUrl: 'widgets/temperature.html',
        link: function (scope, element, attrs) {

            scope.title = 'Feels';

            Weather.get()
                .then(function (callback) {
                    console.log(callback);
                    scope.temperature = Math.round(callback.currently.apparentTemperature);
                });

        }
    };
});

app.directive('temperatureRange', function (Weather) {
    return {
        restrict: 'E',
        scope: {},
        templateUrl: 'widgets/temperature.html',
        link: function (scope, element, attrs) {

            var time = Date.now() / 1000;

            Weather.get()
                .then(function (callback) {

                    var max = callback.daily.data[0].temperatureMaxTime;
                    var min = callback.daily.data[0].temperatureMinTime;

                    console.log(time, max, min);

                    if (time < max) {

                        scope.title = 'Max';
                        scope.temperature = Math.round(callback.daily.data[0].temperatureMax);

                    } else if (time > max && time < min) { // if past max go to min
                        
                        scope.title = 'Min';
                        scope.temperature = Math.round(callback.daily.data[0].temperatureMin);
 
                    } else { // If past min time go to next day
                        
                        scope.title = 'Max';
                        scope.temperature = Math.round(callback.daily.data[1].temperatureMin);

                    }


                    scope.temperature = Math.round(callback.currently.apparentTemperature);
                });

        }
    };
});

app.factory('Weather', function ($http, $q, Api) {

    var longitude = '-73.957';
    var latitude = '40.718';
    var key = 'a5964c3f0e816b98160841c59bed9521';
    var url = 'http://api.forecast.io/forecast/' + key + '/' + latitude + ',' + longitude + '?callback=JSON_CALLBACK';

    var cache = false;

    var get = function () {

        var deferred = $q.defer();

        if (cache) {

            deferred.resolve(cache);
            
        } else {

            $http.jsonp(url)
                .success(function(data){
                    cache = data;
                    deferred.resolve(data);
                })
                .error(function(error){
                    deferred.reject(error);
                });

        }

        return deferred.promise;

    };

    return {
        get: get
    }

});

app.factory('Api', function ($http, $q) {

    var url = function() {
        
        if (location.hostname == '127.0.0.1' || location.hostname == 'localhost') {
            var url = 'http://localhost:8888/channel-599/api';
        } else {
            var url = 'http://channel599.com/';
        }
        
        return url;

    }

    var get = function (route) {

        var deferred = $q.defer();

        $http.get(url() + route)
            .success(function(data){
                deferred.resolve(data);
            })
            .error(function(error){
                deferred.reject(error);
            });

        return deferred.promise;

    }

    var post = function (route, data) {

        var deferred = $q.defer();

        $http.post(url() + route, data)
            .success(function(data){
                deferred.resolve(data);
            })
            .error(function(error){
                deferred.reject(error);
            });

        return deferred.promise;

    }

    // Public API

    return {
        get: get,
        post: post
    }

});
