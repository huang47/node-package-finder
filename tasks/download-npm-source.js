var request = require('request')
var Rx = require('rx');
var config = require('../config');

/**
 * download npm source
 */
var downloadNpmSources = Rx.Observable.create(function (o) {
    request(config.NPM_URL, function (err, res) {

        if (err) {
            o.onError(err);
            return;
        }

        o.onNext({ data: res.body });
        o.onCompleted();

        return function disposeStream() {
        };
    });
});

module.exports = downloadNpmSources;
