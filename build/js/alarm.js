'use strict';

var Alarm = (function () {

	var url = 'https://alarm-clock.firebaseio.com/.json';
	var loop, isAlarmSounding;

	var module = {};

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

	module.init = function () {

		clearInterval(loop);
		loop = setInterval(function () {

			$.get(url).done(function (data) {

				if (Date.now() > data.alarm.next) {
					console.log('alarm!', data.alarm);

					if (!isAlarmSounding) {
						isAlarmSounding = true;
						player(data.playlist, data.config.shuffle, 0);
					}

					if (data.alarm.snoozed) {
						data.alarm.snoozed = false;
						$.ajax({
							url: url, 
							type: 'PUT',
							data: JSON.stringify(data)
						});
					}

				} else {
					$('iframe').remove();
					isAlarmSounding = false;
					data.alarm.snoozed = false;
					console.log(Math.round((data.alarm.next - Date.now()) / 1000) + 's until next alarm');
				}
			});

		}, 1000);
	}

	return module;

})();

Alarm.init();
