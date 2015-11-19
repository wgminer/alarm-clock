'use strict';

var Player = function () {

    var $player = $('#player');
    var database = false;
    var player = false;
    var module = {};

    var updateDatabase = function () {
        // if (player.status == 1) {
        //     $controls.addClass('playing');
        // } else if (player.status == 2) {
        //     $controls.addClass('paused');
        // } else {
        //     $controls.addClass('loading');
        // }
    }

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

        database.child('playlist').once('value', function(snapshot) {

            console.log('play!');

            var playlist = snapshot.val();
            if (typeof index === 'undefined') {
                var index = _.random(0, playlist.length - 1);
            }

            var song = playlist[index];
            
            if (song.source == 'youtube') {

                var $sacrifice = $('<div id="sacrifice"></div>');
                $player.prepend($sacrifice);
                
                player = new YT.Player('sacrifice', {
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
                            updateDatabase();
                            // if (event.data == 0) {
                            //     playNextSong();
                            // }
                        }
                    }
                });

                player.source = song.source;
                player.source_id = song.source_id;
                player.source_url = song.source_url;

                player.status = 0;
                updateDatabase();

                console.log(player);
                
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
                    updateDatabase();

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
                        updateDatabase();
                    });

                    player.bind(SC.Widget.Events.PAUSE, function(eventData) {
                        player.status = 2;
                        console.log(player.status);
                        updateDatabase();
                    });

                });
            }
        });
    }
    
    module.init = function (playerDatabase) {
        database = playerDatabase;
    }

    return module;

}();