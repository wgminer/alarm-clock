var SoundCloud = (function() {

    var module = {}

    module.getSong = function(url) {

        SC.initialize({
            client_id: 'e58c01b67bbc39c365f87269b927a868'
        });

        var deferred = $.Deferred();

        SC.get('/resolve', { url: url }, function(data) {

            if (data.embeddable_by != 'me') {

                var newSong = {
                    title: data.title,
                    source: 'soundcloud',
                    source_id: data.id,
                    source_url: data.permalink_url,
                }

                deferred.resolve(newSong);

            } else {
                deferred.resolve(false);
            }

        });

        return deferred.promise;

    }

    return module;

})();