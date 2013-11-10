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

    res.setHeader('Content-Type', 'application/json');
    result = search.queryPackages(p) || FREEZE_EMPTY_ARRAY;
    res.end(JSON.stringify(search.queryPackages(p)));
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
        res.end('searchResultCb' + index + '(' +JSON.stringify(deps) + ')');
        res.end(JSON.stringify(deps));
    });
};

exports.depscount = function (req, res) {
    var p = req.params.package,
        index = req.params.index;

    getDeps(p, function (deps) {
        res.setHeader('Content-Type', 'application/json');
        res.end('searchResultCb(' + JSON.stringify({ number: deps.length, index: index }) + ')');
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
        var result;

        res.setHeader('Content-Type', 'application/json');

        if (e) {
            res.json([]);
        }

        result = JSON.parse(data.body).
            filter(function (repo) {
                console.log(repo, author + '/' + package);
                return repo.slug === (author + '/' + package);
            }).
            map(function (repo) {
                return {
                    success: repo.last_build_status === 0,
                    time: repo.last_build_finished_at
                };
            });
            
        res.json(result[0]);
    });
}
