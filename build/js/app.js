var SoundCloud = (function() {

    var module = {}

    module.getSong = function(url) {

        SC.initialize({
            client_id: 'e58c01b67bbc39c365f87269b927a868'
        });

        var deferred = $.Deferred();

        SC.get('/resolve', { url: url }, function(data) {

            console.log(data);

            if (data.embeddable_by != 'me') {

                var newSong = {
                    title: data.title,
                    source: 'soundcloud',
                    source_id: data.id,
                    source_url: data.permalink_url,
                }

                deferred.resolve(newSong);

            } else {
                deferred.reject(false);
            }

        });

        return deferred.promise();

    }

    return module;

})();
var YouTube = (function() {

    var ytAPIKey = 'AIzaSyCkoszshUaUgV-2CrviQI0I4pTkd8j61gc';
    var module = {};

    module.getSong = function(url) {

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

        var deferred = $.Deferred();

        $.get(url)
            .done(function (data) {
              
                var newSong = {
                    title: data.items[0].snippet.title,
                    source: 'youtube',
                    source_id: data.items[0].id,
                    source_url: 'https://www.youtube.com/watch?v='+data.items[0].id,
                }

                deferred.resolve(newSong);

            })
            .fail(function(){
                deferred.reject();
            });

        return deferred.promise();

    }

    return module;

});

var App = (function () {

	var url = 'https://alarm-clock.firebaseio.com/.json';
	var data;
	var module = {};
	var url = 'http://williamminer.com/williamminer.com/labs/alarm-clock/api.php';
	if (window.location.hostname == 'localhost') {
		url = 'http://localhost:8888/alarm-clock/build/api.php'
	}

	var update = function () {
		console.log(data);
		$.post(url, data);
	}

	// Snoozes alarm for n miniutes
	module.snooze = function (n) {

		console.log(data);

		if (typeof n == 'undefined') {
			n = data.config.snoozeDuration;
		}

		if (!data.alarm.snoozed || data.alarm.snoozed == 'false') {
			console.log('snoozed for ' + n + 'm');
			data.alarm.next = moment().add(n, 'm').unix() * 1000;
			data.alarm.snoozed = true;
			update();
		};
	};

	// Resets the alarm for the next day
	module.reset = function () {
		console.log('reset to tomorrow at: ' + data.alarm.time);
		data.alarm.snoozed = false;
		module.arm(data.alarm.time);
	};

	// Sets the alarm 
	module.arm = function (newTime) {

		var now = parseInt(moment().get('hour').toString() + moment().get('minute').toString());
		var m = newTime % 100;
		var h = parseInt(newTime.toString().slice(0, -2));

		if (isNaN(h)) {
			h = 0;
		}

		console.log(newTime);

		// Set time
		data.alarm.time = newTime;

		// Is it happening later today?
		if (newTime > now) {

			// Start of today
			var today = moment().startOf('day');

			// Add h hours and m mins to it
			today.add(h, 'h').add(m, 'm');

			// Set alarm obj
			data.alarm.next = today.unix() * 1000;
			
		} else {

			// Start of tomorrow
			var tomorrow = moment().add(1, 'd').startOf('day');

			// Add h hours and m mins to it
			tomorrow = tomorrow.add(h, 'h').add(m, 'm');
			
			// Update alarm obj
			data.alarm.next = tomorrow.unix() * 1000;

		};

		update();
	}

	module.addSong = function (songUrl, callback) {

		var pushSong = function (songData) {
			data.playlist.push(songData);
			update();
			callback(data.playlist);
		}

		if (songUrl.indexOf('soundcloud') > -1) {
			SoundCloud.getSong(songUrl)
				.then(function (callback) {
					pushSong(callback);
				});
		} else if (songUrl.indexOf('youtu') > -1) {
			YouTube.getSong(songUrl)
				.then(function (callback) {
					pushSong(callback);
				});
		}
	}

	module.init = function () {

		$.getJSON(url)
			.done(function (callback) {
				console.log(callback);
				data = callback;

				for (var i = 0; i < data.playlist.length; i++) {
					$('#playlist').append('<li><p>' + data.playlist[i].title + '</p></li>');
				}

				var h = data.alarm.time.substring(0, data.alarm.time.length - 2);
				var m = data.alarm.time.substring(data.alarm.time.length - 2);

				if (h < 10) {
					h = '0' + h;
				}

				document.getElementById('time').value = h + ':' + m;
			});
	}

	return module;

})();



$(function () {

	App.init();

	$('#reset').click(function () {
		App.reset();
	});

	$('#snooze').click(function () {
		App.snooze();
	});

	$('#set').click(function () {
		var val = $('#time').val();
		var newTime = val.split(':');

		console.log(newTime);

		newTime = parseInt(newTime[0] + newTime[1]);
		App.arm(newTime);
	});

	$('#add').click(function () {
		var url = $('#song').val();
		App.addSong(url, function (playlist) {
			$('#song').val('');
			$('#playlist').html('');
			for (var i = 0; i < playlist.length; i++) {
				$('#playlist').append('<li><p>' + playlist[i].title + '</p></li>');
			}
		});
	});

});