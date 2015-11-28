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

    module.play = function (index) {

        ref.once('value', function(snapshot) {

            var player = snapshot.val();
            if (typeof index === 'undefined') {
                var index = _.random(0, player.playlist.length - 1);
            }

            var song = player.playlist[index];

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
                            console.log(player.status);
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

                    player.source = song.source;
                    player.source_id = song.source_id;
                    player.source_url = song.source_url;

                    player.status = 0;

                    player.bind(SC.Widget.Events.READY, function(eventData) {
                        setTimeout(function(){
                            if (seekTo > 0) {
                                player.seekTo(seekTo);
                            }
                        }, 1000);
                    });

                    player.bind(SC.Widget.Events.PLAY, function(eventData) {
                        player.status = 1;
                        console.log(player.status);
                    });

                    player.bind(SC.Widget.Events.PAUSE, function(eventData) {
                        player.status = 2;
                        console.log(player.status);
                    });

                });
            }
        });
    }
    
    module.init = function (playerDatabase) {
        ref = playerDatabase;
    }

    return module;

}();

var Alarm = (function () {

    var module = {};
    var sound;
    var database;
    var checkAlarmInterval;

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

        var time = alarm.time.hour * 100 + alarm.time.minute;

        if (currently > time  && alarm.days[getDayStr()]) {
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

            var alarm = snapshot.val();

            // If we're taking a nap 
            // and it's time to wake up
            // OR
            // and it's a day and time when the alarm should be on
            // and the alarm hasn't already sounded that day
            if (alarm.napping && Date.now() > alarm.nap_end) {
                console.log('playing nap', Date.now(), alarm.nap_end);
                ref.update({
                    sounding: true,
                    napping: false
                });
                Player.play();
                return false;
            }

            if (hasAlarmSounded(alarm) == false && hasAlarmPast(alarm)) {
                console.log('playing regular');
                ref.update({
                    sounding: true,
                    last_sound: dateStr()
                });
                Player.play();
                return false;
            }

            
            // and the alarm is on 
            
            // and the alarm isn't currently sounding
            // console.log('is not napping?: ' + (alarm.napping === false));
            // console.log('armed?: ' + alarm.armed);
            // console.log('past alarm time?: ' + hasAlarmPast(alarm));
            // console.log('has not sounded?: ' + (hasAlarmSounded(alarm) == false));
            // console.log('is not currently sounding?: ' + (alarm.sounding == false));

                    

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

        // When loading page for the first time
        ref.once('value', function(snapshot) {
            var alarm = snapshot.val();
            if (hasAlarmPast(alarm)) {
                ref.update({
                    last_sound: dateStr()
                });
            }
        });

        // Do stuff on change
        ref.on('value', function(snapshot) {
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

var alarmRef = ref.child('alarm');
var playerRef = ref.child('player');
var database = {
    alarm: {
        armed: true, // Is alarm ON or OFF
        last_sound: false,
        sounding: false, // Is alarm CURRENTLY sounding
        napping: false, // Is alarm CURRENTLY in napping mode
        nap_end: "", // Timestamp for when nap will end
        time: {
            hour: 8,
            minute: 30
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
// ref.set(database);

$(function () {

    Player.init(playerRef);
    Alarm.init(alarmRef);
    

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
