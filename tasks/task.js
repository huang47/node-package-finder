#!/usr/bin/env node

var request = require('request')
var Rx = require('rx');

const NPM_RESOURCE = 'https://registry.npmjs.org/-/all';

exports = Rx.Observable.create(function (o) {

    request(NPM_RESOURCE, function (err, res) {
        if (err) {
            o.onError(err);
            return;
        }

        var path = __dirname + '/../output/all.json';

        fs.writeFileSync(path, res.body);

        o.onNext(path);
    });

    return function () {};

});
