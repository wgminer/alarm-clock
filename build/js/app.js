'use strict';

var app = angular.module('alarmClock', ['firebase', 'ngRoute'])

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

        checkNapLeft();
        setNapLeft = $interval(function () {
            checkNapLeft();
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

    var checkNapLeft = function () {
        var t = $scope.alarm.nap_end - Date.now();
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

            if ($scope.localAlarm > 11) {
                $scope.localAlarm.meridian = 'pm';
            } else {
                $scope.localAlarm.meridian = 'am';
            }
        });
    }

    $scope.setAlarm = function () {
        
        if ($scope.localAlarm.meridian == 'pm') {
            $scope.localAlarm.time.hour += 12;
        }

        $scope.alarm.time.hour = $scope.localAlarm.time.hour;
        $scope.alarm.time.minute = $scope.localAlarm.time.minute;

        $location.path('#/');

    }

    init();

});

app.controller('SetPlaylistCtrl', function ($scope, $firebaseObject, $location) {

    var init = function () {
        var ref = new Firebase('https://alarm-clock.firebaseio.com/player/playlist');
        var syncObject = $firebaseObject(ref);
        syncObject.$bindTo($scope, 'playlist');
    }

    init();

});

app.factory('Local', function ($http, $q) {


});