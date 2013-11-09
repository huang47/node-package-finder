var url = require('url');
var Rx = require('rx');
var request = require('request');
var config = require('../config');
var GITHUB_HOST_REGEX = /.*github.com[:\/](.*)\/(.*)/;
var CREDENTIAL = require('../.credential.json');

var EMPTY$ = Rx.Observable.empty();
var HTTP_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.57 Safari/537.36'
};

function NOOP() {}

var package$ = Rx.Observable.create(function (o) {
    config.mongos.forEach(function (db) {
        dbPackages = db.collection('packages');
        dbPackages.
            find().
            sort({ timestamp: 1 }).
            each(function (err, p) {
                if (err) {
                    o.onError(err);
                } else if (null === p) {
                    o.onCompleted();
                } else {
                    o.onNext(p);
                }
            });
    });
    return NOOP;
});

var subject = new Rx.Subject();
var buffers = subject.asObservable();

// 5000 requests per hour
var REQUEST_PER_HOUR = 60 * 60 * 1000 / 5000;

var githubRepo$ = package$.
    zip(Rx.Observable.interval(REQUEST_PER_HOUR), function (p) {
        return p;
    }).
    flatMap(function (p) {

        var matched = p.repoUrl.match(GITHUB_HOST_REGEX);

        if (null === matched) { return EMPTY$; }

        var user = matched[1];
        var repo = matched[2];
        // github doesn't like .git extension in v3 API
        // repo.git -> repo
        if ('.git' === repo.substr(-4)) { repo = repo.substring(0, repo.length - 4); }

        var requestUrl = url.format({
            protocol: 'https',
            host: 'api.github.com',
            pathname: ['repos', user, repo].join('/'),
            query: CREDENTIAL.GITHUB
        });

        var buf = '';

        Rx.Node.fromReadableStream(request({
            url: requestUrl,
            headers: HTTP_HEADERS,
            timeout: 5000
        })).forEach(
            function (chunk) { buf += chunk.toString(); },
            NOOP,
            function () {
                subject.onNext(buf);
            }
        );

        return buffers.take(1);
    }).
    map(function (buffer) {
        return JSON.parse(buffer);
    });
    

module.exports = githubRepo$;
