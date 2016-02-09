'use strict';

var Player = function () {

    var $player = $('#player');
    var ref = false;
    var player = false;
    var module = {};

    module.next = function () {

        console.log($playing);

        if ($playing) {
            var $next = $playing.next('.song');

            if ($next) {
                console.log($next);
                this.create($next);
            }
        }
        
    }

    module.stop = function () {
        console.log($('player'));
        $('iframe').remove();
    }

    var create = function (playlist, index) {

        $('iframe').remove();
        var song = playlist[index];

        if (song.source == 'youtube') {

            var $sacrifice = $('<div id="sacrifice"></div>');
            $player.prepend($sacrifice);

            var player = new YT.Player('sacrifice', {
                videoId: song.source_id,
                playerVars: {
                    wmode: 'opaque',
                    showinfo: 0,
                    modestbranding: 1
                },
                events: {
                    onReady: function (event) {
                        event.target.playVideo();
                    },
                    onStateChange: function (event) {
                        player.status = event.data;
                        if (event.data == 0) {
                            index++;
                            if (playlist[index]) {
                                create(playlist, index);
                            } else {
                                create(playlist, 0);
                            }
                        }
                    }
                }
            });
            
        } else if (song.source == 'soundcloud') {

            var params = {
                show_comments: false,
                auto_play: true
            }

            SC.oEmbed(song.source_url, params, function(oembed){

                $player.prepend(oembed.html);

                player = SC.Widget($player.children()[0]);

                scope.player.bind(SC.Widget.Events.FINISH, function(eventData) {
                    index++;
                    if (playlist[index]) {
                        create(playlist, index);
                    } else {
                        create(playlist, 0);
                    }
                });

            });
        }
    }

    module.play = function (shuffle) {

        ref.once('value', function(snapshot) {

            var player = snapshot.val();

            if (shuffle === true) {
                var playlist = _.shuffle(player.playlist);
            } else {
                var playlist = player.playlist;
            }

            create(playlist, 0);

        });
    }
    
    module.init = function (playerDatabase) {
        ref = playerDatabase.child('player');
    }

    return module;

}();

var Alarm = (function () {

    var module = {};
    var sound;
    var database;
    var checkAlarmInterval;

    var alarmRef;
    var playerRef;

    var getDayStr = function () {

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

    // build the date string for today
    var dateStr = function () {
        var d = new Date();
        var str = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
        return str;
    }

    // Are we passed the alarm time?
    var hasAlarmPast = function (alarm) {

        var now = new Date(); 
        var hours = now.getHours() * 100;
        var minutes = now.getMinutes();
        var currently = hours + minutes;

        // If we're passed the alarm time 
        // and it's on an active day
        // ...then we're past the alarm

        if (alarm.time.meridian == 'pm') {
            alarm.time.hour += 12;
        }

        var time = alarm.time.hour * 100 + alarm.time.minute;

        if (currently >= time  && alarm.days[getDayStr()]) {
            return true;
        } else {
            return false;
        }
    }

    // Has the alarm already gone off today
    var hasAlarmSounded = function (alarm) {
        if (alarm.last_sound == dateStr()) {
            return true;
        } else {
            return false;
        }
    }

    var checkAlarm = function (ref) {

        ref.once('value', function(snapshot) {

            var alarm = snapshot.val().alarm;
            var player = snapshot.val().player;

            // If we're taking a nap 
            // and it's time to wake up
            if (alarm.napping && Date.now() > alarm.nap_end) {
                console.log('playing nap', Date.now(), alarm.nap_end);
                ref.child('alarm').update({
                    sounding: true,
                    napping: false
                });
                Player.play(player.shuffle);
                return false;
            }

            // It's a day and time when the alarm should be on
            // and the alarm hasn't already sounded that day
            if (hasAlarmPast(alarm) && hasAlarmSounded(alarm) == false) {
                ref.child('alarm').update({
                    sounding: true,
                    last_sound: dateStr()
                });
                Player.play(player.shuffle);
                return false;
            }

        });
    }

    module.silenceAlarm = function () {

        console.log('silence!');

        ref.update({
            passed: true,
            sounding: false,
            napping: false
        });

        Player.stop();
        clearInterval(sound);
    }

    module.init = function (ref) {

        alarmRef = ref.child('alarm');
        playerRef = ref.child('player');

        // When loading page for the first time
        alarmRef.once('value', function(snapshot) {
            var alarm = snapshot.val();
            if (hasAlarmPast(alarm)) {
                alarmRef.update({
                    last_sound: dateStr()
                });
            }
        });

        // Do stuff on change
        alarmRef.on('value', function(snapshot) {
            var alarm = snapshot.val();
            if (alarm.sounding == false) {
                Player.stop();
            }
        });

        checkAlarmInterval = setInterval(function () {
            checkAlarm(ref);
        }, 1000);
    }

    return module;

})();

var ref = new Firebase('https://alarm-clock.firebaseio.com/');

var database = {
    alarm: {
        armed: true, // Is alarm ON or OFF
        last_sound: false,
        sounding: false, // Is alarm CURRENTLY sounding
        napping: false, // Is alarm CURRENTLY in napping mode
        nap_end: "", // Timestamp for when nap will end
        time: {
            hour: 8,
            minute: 30,
            meridian: 'am'
        },
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
        shuffle: true,
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
// ref.set(database);

$(function () {

    Player.init(ref);
    Alarm.init(ref);
    

    $('#test').click(function () {
        console.log('test');
        Alarm.set(15);
    });

    $('#snooze').click(function () {
        Alarm.nap(.25);
    });

    $('#silence').click(function () {
        Player.stop();
    });

    $('#play').click(function () {
        Player.play(true);
    });

});
