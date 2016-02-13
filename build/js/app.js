'use strict';

$(function () {

	var ref = new Firebase('https://alarm-clock.firebaseio.com/alarm');
	var alarm;

	// Snoozes alarm for n miniutes
	var snooze = function (n) {
		if (!alarm.snoozed) {

			console.log('snoozed for ' + n + 'm');
			alarm.next = moment().add(n, 'm').unix() * 1000;

			ref.child('next').set(alarm.next);
			ref.child('snoozed').set(true);
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
		ref.child('time').set(alarm.time);

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

		ref.child('next').set(alarm.next);
	}

	ref.on('value', function(snapshot) {

		alarm = snapshot.val();

	}, function (errorObject) {
		console.log('The read failed: ' + errorObject.code);
	});

	$('#reset').click(function () {
		reset();
	});

	$('#snooze').click(function () {
		snooze(1);
	});

	$('#set').click(function () {
		var val = $('#time').val();

		var newTime = val.split(':');
		newTime = parseInt(newTime[0] + newTime[1]);

		arm(newTime);
	});

});