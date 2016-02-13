'use strict';

var ref = new Firebase('https://alarm-clock.firebaseio.com/alarm');
var loop;

ref.on('value', function(snapshot) {

	var farm = snapshot.val();

	clearInterval(loop);
	loop = setInterval(function () {

		if (Date.now() > farm.next) {
			console.log('alarm!');

			if (farm.snoozed) {
				farm.snoozed = false;
				ref.child('snoozed').set(farm.snoozed);
			}
		} else {
			// console.log(Math.round((farm.next - Date.now()) / 1000) + 's until next alarm');
		}

	}, 1000);

}, function (errorObject) {
	console.log('The read failed: ' + errorObject.code);
});
