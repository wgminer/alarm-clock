'use strict';

var Alarm = (function () {

	var loop, isAlarmSounding;

	var module = {};

	var player = function (playlist, shuffle, index) {

	    if (shuffle) {
	    	playlist = _.shuffle(playlist);
	    }

	    console.log(playlist);

	    var song = playlist[index];

		SC.stream('/tracks/' + song.source_id).then(function(sound){
			SC.sound = sound;
        	SC.sound.play();
        });

	}

	module.init = function () {

        SC.initialize({
		    client_id: 'e58c01b67bbc39c365f87269b927a868'
		});

		clearInterval(loop);
		loop = setInterval(function () {

			var url = 'api.php';
			if (window.location.hostname == 'localhost') {
				url = 'http://localhost:8888/alarm-clock/build/api.php'
			}

			$.getJSON(url)
				.done(function (callback) {

					if (Date.now() > callback.alarm.next) {
						console.log('alarm!', callback.alarm);

						if (!isAlarmSounding) {
							isAlarmSounding = true;
							player(callback.playlist, callback.config.shuffle, 0);
						}

						if (callback.alarm.snoozed) {
							callback.alarm.snoozed = false;
							$.post(url, callback);						
						}

					} else {
						SC.sound.stop();
						isAlarmSounding = false;
						console.log(Math.round((callback.alarm.next - Date.now()) / 1000) + ' seconds until next alarm');
					}

				});

		}, 20000);
	}

	return module;

})();

Alarm.init();
