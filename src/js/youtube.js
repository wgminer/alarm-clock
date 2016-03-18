var SoundCloud = (function() {

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

        return deferred.promise;

    }

    return module;

});
