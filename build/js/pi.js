'use strict';

(function () {

	var ref = new Firebase('https://alarm-clock.firebaseio.com');
	var loop, isAlarmSounding;

	var player = function (playlist, shuffle, index) {

		console.log('play');

	    $('iframe').remove();
	    var $player = $('#player');

	    if (shuffle) {
	    	playlist = _.shuffle(playlist);
	    }

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
	                            create(playlist, shuffle, index);
	                        } else {
	                            create(playlist, shuffle, 0);
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
	                    create(playlist, shuffle, index);
	                } else {
	                    create(playlist, shuffle, 0);
	                }
	            });

	        });
	    }
	}

	ref.on('value', function(snapshot) {

		var alarm = snapshot.val().alarm;
		var playlist = snapshot.val().playlist;
		var config = snapshot.val().config;

		clearInterval(loop);
		loop = setInterval(function () {

			if (Date.now() > alarm.next) {
				console.log('alarm!', alarm);

				if (!isAlarmSounding) {
					isAlarmSounding = true;
					player(playlist, config.shuffle, 0);
				}

				if (alarm.snoozed) {
					$('iframe').remove();
					alarm.snoozed = false;
					ref.child('alarm/snoozed').set(alarm.snoozed);
				}

			} else {
				$('iframe').remove();
				isAlarmSounding = false;
				alarm.snoozed = false;
				console.log(Math.round((alarm.next - Date.now()) / 1000) + 's until next alarm');
			}

		}, 1000);

	}, function (errorObject) {
		console.log('The read failed: ' + errorObject.code);
	});

})();
