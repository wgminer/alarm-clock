'use strict';

$(function () {

	var ref = new Firebase('https://alarm-clock.firebaseio.com');
	var alarm, config, playlist;

	// Snoozes alarm for n miniutes
	var snooze = function (n) {

		console.log('snooze hit', alarm.snoozed);

		if (!alarm.snoozed) {

			console.log('snoozed for ' + n + 'm');
			alarm.next = moment().add(n, 'm').unix() * 1000;
			alarm.snoozed = true;

			ref.child('alarm/next').set(alarm.next);
			ref.child('alarm/snoozed').set(true);
		};
	};

	// Resets the alarm for the next day
	var reset = function () {
		console.log('reset to tomorrow at: ' + alarm.time);
		arm(alarm.time);
	};

	// Sets the alarm 
	var arm = function (newTime) {

		var now = parseInt(moment().get('hour').toString() + moment().get('minute').toString());
		var m = newTime % 100;
		var h = parseInt(newTime.toString().slice(0, -2));

		if (isNaN(h)) {
			h = 0;
		}

		// Set time
		alarm.time = newTime;
		ref.child('alarm/time').set(alarm.time);

		// Is it happening later tody?
		if (newTime > now) {

			// Start of today
			var today = moment().startOf('day');

			// Add h hours and m mins to it
			today.add(h, 'h').add(m, 'm');

			// Set alarm obj
			alarm.next = today.unix() * 1000;
			
		} else {

			// Start of tomorrow
			var tomorrow = moment().add(1, 'd').startOf('day');

			// Add h hours and m mins to it
			tomorrow = tomorrow.add(h, 'h').add(m, 'm');
			
			// Update alarm obj
			alarm.next = tomorrow.unix() * 1000;

		};

		ref.child('alarm/next').set(alarm.next);
	}

	var addSong = function (songUrl) {

		console.log(songUrl);

		var playlist = [
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
        ];

        ref.child('playlist').set(playlist);

	}

	ref.on('value', function(snapshot) {

		alarm = snapshot.val().alarm;
		config = snapshot.val().config;
		playlist = snapshot.val().playlist;

	}, function (errorObject) {
		console.log('The read failed: ' + errorObject.code);
	});

	$('#reset').click(function () {
		reset();
	});

	$('#snooze').click(function () {
		snooze(config.snoozeDuration);
	});

	$('#set').click(function () {
		var val = $('#time').val();

		var newTime = val.split(':');
		newTime = parseInt(newTime[0] + newTime[1]);

		arm(newTime);
	});

	$('#add').click(function () {
		var url = $('#song').val();
		addSong(url);
	});

});