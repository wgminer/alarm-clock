'use strict';

var Firebase = new Firebase('https://alarm-clock.firebaseio.com/');

var alarmRef = Firebase.child('alarm');
var playerRef = Firebase.child('player');
var database = {
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
        playing: false,
        next: false,
        prev: false,
        playlist: [
            {
                source: "youtube",
                source_id: "ESkdOYhPTS0",
                source_url: "https://www.youtube.com/watch?v=ESkdOYhPTS0",
                title: "AMTRAC - Darkest Sound"
            },
            {
                source: "youtube",
                source_id: "_7fxoWOFCa4",
                source_url: "https://www.youtube.com/watch?v=_7fxoWOFCa4",
                title: "Darius - Pyor"
            },
            {
                source: "youtube",
                source_id: "-DDKjewZRmM",
                source_url: "https://www.youtube.com/watch?v=-DDKjewZRmM",
                title: "Makoto - Bubbles"
            }
        ]
    }
};
Firebase.set(database);

$(function () {

    Alarm.init(alarmRef);
    Player.init(playerRef);

    $('#test').click(function () {
        console.log('test');
        Alarm.set(15);
    });

    $('#snooze').click(function () {
        Alarm.nap(.25);
    });

    $('#silence').click(function () {
        Alarm.silence();
    });

    $('#play').click(function () {
        Player.play();
    });

});