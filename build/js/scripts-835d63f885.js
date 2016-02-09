'use strict';

var app = angular.module('alarmClock', ['firebase', 'ngRoute', 'ngTouch'])

app.run(function ($rootScope, $firebaseObject) {


});

app.config(function ($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'views/status.html',
            controller: 'StatusCtrl',
        })
        .when('/set-playlist', {
            templateUrl: 'views/set-playlist.html',
            controller: 'SetPlaylistCtrl',
        })
        .when('/set-alarm', {
            templateUrl: 'views/set-alarm.html',
            controller: 'SetAlarmCtrl',
        })
        .otherwise({
            redirectTo: '/'
        });
});

app.controller('StatusCtrl', function ($scope, $firebaseObject, $interval) {

    var setNapLeft;
    
    var init = function () {
        var ref = new Firebase('https://alarm-clock.firebaseio.com/alarm');
        var syncObject = $firebaseObject(ref);
        syncObject.$bindTo($scope, 'alarm');

        ref.once('value', function(snapshot) {
            var alarm = snapshot.val();

            console.log(alarm);

            // resume nap...
            if (alarm.sounding == false && alarm.napping == true && Date.now() < alarm.nap_end) {
                checkNapLeft(alarm);
                setNapLeft = $interval(function () {
                    checkNapLeft(alarm);
                }, 333);
            }
        });
    }

    var dateStr = function () {
        var d = new Date();
        var str = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
        return str;
    }

    $scope.toggleDay = function (day) {
        console.log($scope.alarm)

        $scope.alarm.days[day] = !$scope.alarm.days[day];
    }

    $scope.startNap = function (napTime) {

        $interval.cancel(setNapLeft);
        $scope.alarm.napping = true;
        $scope.alarm.nap_end = Date.now() + napTime * 60 * 1000;
        $scope.alarm.sounding = false;
        $scope.alarm.last_sound = dateStr();

        checkNapLeft($scope.alarm);
        setNapLeft = $interval(function () {
            checkNapLeft($scope.alarm);
        }, 333);
    }

    $scope.amPm = function () {
        if ($scope.alarm.time.hour > 11) {
            return 'pm';
        } else {
            return 'am';
        }
    }

    $scope.resetAlarm = function () {
        $scope.alarm.napping = false;
        $scope.alarm.sounding = false;
        $scope.alarm.last_sound = dateStr();
    }

    var checkNapLeft = function (alarm) {
        var t = alarm.nap_end - Date.now();
        var m = Math.floor(t / 1000 / 60);
        var s = Math.floor(t / 1000 % 60);

        if (m > 0) {
            
            m += ':';

            if (s < 10) {
                if (s <= 0) {
                    s = 0;
                }

                s = '0' + s;
            }
        } else {
            m = '';
        }

        $scope.napTimeLeft = m + s;
    }

    init();

});

app.controller('SetAlarmCtrl', function ($scope, $firebaseObject, $location) {

    var init = function () {
        var ref = new Firebase('https://alarm-clock.firebaseio.com/alarm');
        var syncObject = $firebaseObject(ref);
        syncObject.$bindTo($scope, 'alarm');
        
        ref.once('value', function(snapshot) {
            $scope.localAlarm = snapshot.val();
        });
    }

    $scope.setAlarm = function () {

        console.log($scope.localAlarm.time.hour, $scope.localAlarm.time.minute, $scope.localAlarm.time.meridian);

        $scope.alarm.time.meridian = $scope.localAlarm.time.meridian;
        $scope.alarm.time.hour = $scope.localAlarm.time.hour;
        $scope.alarm.time.minute = $scope.localAlarm.time.minute;

        console.log($scope.alarm);

        $location.path('#/');

    }

    init();

});

app.controller('SetPlaylistCtrl', function ($scope, $firebaseArray, $location) {

    var init = function () {
        var ref = new Firebase('https://alarm-clock.firebaseio.com/player/playlist');
        $scope.playlist = $firebaseArray(ref);
    }

    init();

});



app.directive('playlistItem', function ($routeParams, $firebaseObject, $location, YouTube, SoundCloud) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {

            console.log(scope);
            var ref = new Firebase('https://alarm-clock.firebaseio.com/player/playlist/' + scope.song.$id);


            scope.remove = function () {
                ref.remove();
            }            

        }
    }
});


app.directive('playlistForm', function ($routeParams, $firebaseObject, $location, YouTube, SoundCloud) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {

            scope.url;
            var ref = new Firebase('https://alarm-clock.firebaseio.com/player/playlist');

            scope.submit = function (url) {
                console.log(url)
                if (url.indexOf('youtu') > -1 && url != '') {
                    YouTube.getSong(url)
                        .then(function (song) {
                            ref.push(song);
                            scope.url = '';
                        }, function (error) {
                            console.log(error);
                        });
                } else if (url.indexOf('soundcloud') > -1 && url != '') {
                    SoundCloud.getSong(url)
                        .then(function (song) {
                            ref.push(song);
                            scope.url = '';
                        }, function (error) {
                            console.log(error);
                        });
                } else {
                    alert('invalid URL');
                }
            }
        }
    }
});

app.factory('YouTube', function ($http, $q) {

    var ytAPIKey = 'AIzaSyCkoszshUaUgV-2CrviQI0I4pTkd8j61gc';

    var getSong = function(url) {

        if (url.lastIndexOf('?v=') > -1) {
            var start = url.lastIndexOf('?v=') + 3;
        } else if (url.lastIndexOf('.be/') > -1) {
            var start = url.lastIndexOf('.be/') + 4;
        } else {
            return 'error!';
        }

        var ytID = url.substring(start, start+11);
        var url = 'https://www.googleapis.com/youtube/v3/videos?part=snippet&id=' + ytID + '&key=' + ytAPIKey;
        var durationUrl = 'https://www.googleapis.com/youtube/v3/videos?id=' + ytID + '&part=contentDetails&key=' + ytAPIKey;

        var deferred = $q.defer();

        $http.get(url)
            .success(function (data) {
              
                var newSong = {
                    title: data.items[0].snippet.title,
                    source: 'youtube',
                    source_id: data.items[0].id,
                    source_url: 'https://www.youtube.com/watch?v='+data.items[0].id,
                }

                deferred.resolve(newSong);

            })
            .error(function(){
                deferred.reject();
            });

        return deferred.promise;

    }

    return {
        getSong: getSong
    }

});

app.factory('SoundCloud', function ($http, $q) {

    var getSong = function(url) {

        SC.initialize({
            client_id: 'e58c01b67bbc39c365f87269b927a868'
        });

        var deferred = $q.defer();

        SC.get('/resolve', { url: url }, function(data) {

            if (data.embeddable_by != 'me') {

                var newSong = {
                    title: data.title,
                    source: 'soundcloud',
                    source_id: data.id,
                    source_url: data.permalink_url,
                }

                deferred.resolve(newSong);

            } else {
                deferred.resolve(false);
            }

        });

        return deferred.promise;

    }

    return {
        getSong: getSong
    }

});