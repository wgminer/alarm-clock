var App = (function () {

	var url = 'https://alarm-clock.firebaseio.com/.json';
	var data;
	var module = {};

	var update = function () {
		$.ajax({
			url: url, 
			type: 'PUT',
			data: JSON.stringify(data)
		}).done(function (callback) {
			data = callback;
			console.log(data);
		});
	}

	// Snoozes alarm for n miniutes
	module.snooze = function (n) {

		if (typeof n == 'undefined') {
			n = data.config.snoozeDuration;
		}

		console.log('snooze hit', data.alarm.snoozed);

		$.get(url).done(function (callback) {
			data = callback;

			if (!data.alarm.snoozed) {

				console.log('snoozed for ' + n + 'm');
				data.alarm.next = moment().add(n, 'm').unix() * 1000;
				data.alarm.snoozed = true;

				update();
			};
		});	
	};

	// Resets the alarm for the next day
	module.reset = function () {
		console.log('reset to tomorrow at: ' + data.alarm.time);
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

		// Set time
		data.alarm.time = newTime;

		// Is it happening later tody?
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

	module.addSong = function (songUrl) {

		// console.log(songUrl);

		// var playlist = [
  //           {
  //               source: "youtube",
  //               source_id: "ESkdOYhPTS0",
  //               source_url: "https://www.youtube.com/watch?v=ESkdOYhPTS0",
  //               title: "AMTRAC - Darkest Sound"
  //           },
  //           {
  //               source: "youtube",
  //               source_id: "_7fxoWOFCa4",
  //               source_url: "https://www.youtube.com/watch?v=_7fxoWOFCa4",
  //               title: "Darius - Pyor"
  //           },
  //           {
  //               source: "youtube",
  //               source_id: "-DDKjewZRmM",
  //               source_url: "https://www.youtube.com/watch?v=-DDKjewZRmM",
  //               title: "Makoto - Bubbles"
  //           }
  //       ];

  //       ref.child('playlist').set(playlist);

	}

	module.init = function () {
		$.get(url).done(function (callback) {
			data = callback;
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
		newTime = parseInt(newTime[0] + newTime[1]);
		App.arm(newTime);
	});

	$('#add').click(function () {
		var url = $('#song').val();
		App.addSong(url);
	});

});