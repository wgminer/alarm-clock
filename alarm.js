'use strict';

var Alarm = (function () {

    var module = {};
    var sound;
    var database;

    var getDay = function () {

        var now = new Date();    
        var days = [
            'sunday',
            'monday',
            'tuesday',
            'wednesday',
            'thursday',
            'friday',
            'saturday'
        ];

        return days[now.getDay()];
    }

    var d = new Date();

        // console.log(d.getYear());

    // build the date string for today
    var dateStr = function () {
        var d = new Date();
        var str = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
        return str;
    }

    // Are we passed the alarm time?
    var pastAlarm = function (alarm) {
        var now = new Date(); 
        var hours = now.getHours() * 100;
        var minutes = now.getMinutes();
        var currently = hours + minutes;

        // If we're passed the alarm time 
        // and it's on an active day
        // ...then we're past the alarm
        if (currently > alarm.time && alarm.days[getDay()]) {
            return true;
        } else {
            return false;
        }
    }

    // Has the alarm already gone off today
    var alarmSounded = function (alarm) {

        if (alarm.last_sound == dateStr()) {
            return true;
        } else {
            return false;
        }
    }

    var toggleAlarm = function () {
        alarm.armed = !alarm.armed;
    }

    var soundAlarm = function () {

        database.update({
            sounding: true,
            last_sound: dateStr()
        });

        clearInterval(sound);
        sound = setInterval(function () {
            console.log('Wake Up!');
        }, 333);
    }

    var checkAlarm = function () {

        database.once('value', function(snapshot) {

            var alarm = snapshot.val();

            if (alarm.napping) {
                var until = (alarm.nap_end - Date.now()) / 1000 / 60;
                console.log(until + ' minutes until nap ends');
            }

            // If we're taking a nap 
            // and it's time to wake up
            if (alarm.napping && Date.now() > alarm.nap_end) {

                database.update({
                    napping: false
                });
                soundAlarm();
                return false;
            }

            // If we're not napping 
            // and the alarm is on 
            // and it's a day and time when the alarm should be on
            // and the alarm hasn't already sounded that day
            // and the alarm isn't currently sounding
            if (alarm.napping === false && alarm.armed && pastAlarm(alarm) && alarmSounded(alarm) == false && alarm.sounding == false) { 
                soundAlarm();
                return false;
            }

        });
    }

    module.silence = function () {

        console.log('silence!');

        database.update({
            passed: true,
            sounding: false,
            napping: false
        });

        clearInterval(sound);
    }

    module.set = function (timeInt) {

        var lastSound = false;

        if (pastAlarm(timeInt) == false) {
            lastSound = dateStr();
        }

        database.update({
            time: timeInt,
            last_sound: lastSound
        });
    }

    module.nap = function (minuteDuration) {

        console.log('nap time!');

        silenceAlarm();
        var end = Date.now() + minuteDuration * 60 * 1000;

        database.update({
            napping: true,
            nap_end: end
        });
    }

    module.init = function () {
        checkAlarm();
        setInterval(function () {
            checkAlarm();
        }, 333);
    }

    return module;

})();

$(function () {

    var Firebase = new Firebase('https://alarm-clock.firebaseio.com/');

    var alarmRef = Firebase.child('alarm');
    var playerRef = Firebase.child('player');

    Firebase.set({
        alarm: {
            armed: true, // Is alarm ON or OFF
            last_sound: "",
            sounding: false, // Is alarm CURRENTLY sounding
            napping: false, // Is alarm CURRENTLY in napping mode
            nap_end: "", // Timestamp for when nap will end
            time: 830, // When should the alarm sound
            days: {
                sunday: false,
                monday: true,
                tuesday: true,
                wednesday: true,
                thursday: true,
                friday: true,
                saturday: false
            }
        },
        player: {
            playing: false
            next: false,
            prev: false
        }
    });

    Alarm.init(alarmRef);
    Player.init(playerRef);

    $('#setTime').click(function () {
        Alarm.set(2300);
    });

    $('#snooze').click(function () {
        Alarm.nap(.25);
    });

    $('#silence').click(function () {
        Alarm.silence();
    });

});

