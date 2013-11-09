var FREEZE_EMPTY_ARRAY = Object.freeze([]);
var request = require('request');
var search = require('../../src/helper/searchHelper');

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

exports.dependentsCount = require('./package/dependents-count.js').dependentsCount;
exports.travisCi = require('./package/travis-ci.js').travisCi;
