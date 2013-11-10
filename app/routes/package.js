var FREEZE_EMPTY_ARRAY = Object.freeze([]);
var request = require('request');
var search = require('../../src/helper/searchHelper');
var TRAVIS_CI_API = 'https://api.travis-ci.org/repos/{author}';

function getDeps(p, cb) {
    request({
        url: 'http://isaacs.iriscouch.com/registry/_design/app/_view/dependedUpon?startkey=["' + p + '"]&endkey=["' + p + '",{}]&group_level=2',
        timeout: 5000
    }, function (e, result) {
        var body = JSON.parse(result.body) || {},
            deps = [];

        if (Array.isArray(body.rows)) {
            deps = body.rows.
                filter(function (row) {
                    return row.key.length > 1;
                }).
                map(function (row) {
                    return row.key.slice(1);
                }).
                reduce(function (acc, curr) {
                    return Array.prototype.concat(acc, curr);
                }, []);
        }

        cb(deps);
    });
}

exports.search = function (req, res) {
    var p = req.params.package,
        result;

    result = search.queryPackages(p) || FREEZE_EMPTY_ARRAY;
    res.json(result);
};

exports.top = function (req, res) {
    var p = req.params.package,
        results;

    res.setHeader('Content-Type', 'application/json');
    results = search.queryPackages(p).
        sort(function(p1, p2) {
            return p2.score - p1.score;
        }).
        slice(0, 10);

    res.end(JSON.stringify(results));
};

exports.dependents = function (req, res) {
    var p = req.params.package,
        index = req.params.index;

    getDeps(p, function (deps) {
        res.setHeader('Content-Type', 'application/json');
        res.end('dependentsCb' + index + '(' +JSON.stringify(deps) + ')');
        res.end(JSON.stringify(deps));
    });
};

exports.depscount = function (req, res) {
    var p = req.params.package,
        index = req.params.index;

    getDeps(p, function (deps) {
        res.setHeader('Content-Type', 'application/json');
        res.end('dependentsCb(' + JSON.stringify({ number: deps.length, index: index }) + ')');
    });
};

exports.ci = function (req, res) {
    var author = req.params.author;
    var package = req.params.package;
    var index = req.params.index;

    request({
        url: TRAVIS_CI_API.replace(/{author}/, author),
        timeout: 3000
    }, function (e, data) {
        var results = []

        res.setHeader('Content-Type', 'application/json');

        if (e || !data || !data.body) {
            res.end('');
        }

        results = JSON.parse(data.body).
            filter(function (repo) {
                var str = author + '/' + package;
                return (repo.slug === str) ||
                    (repo.slug === str + '.js') ||
                    (repo.slug === 'node-' + str);
            }).
            map(function (repo) {
                return {
                    success: repo.last_build_status === 0,
                    time: repo.last_build_finished_at,
                    index: index
                };
            });
            
        if (results.length > 0) {
            res.end('ciCb(' + JSON.stringify(results[0]) + ')');
        } else {
            res.end('');
        }
    });
}
