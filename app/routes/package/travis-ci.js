var request = require('request');
var util = require('../../../lib/util');
var TRAVIS_CI_API = 'https://api.travis-ci.org/repos?slug={author}/{repo}';

exports.travisCi = function (req, res) {
    var author = req.params.author;
    var package = req.params.package;
    var index = req.params.index;

    request({
        url: util.sub(TRAVIS_CI_API, { author: author, repo: package }),
        timeout: 3000
    }, function (e, data) {
        var repoStatus;
        var result;

        // if no such package {"file": "not found"} is returned
        if (e || !data || !data.body || data.body.file) {
            res.end('');
            return;
        }

        // TRAVIS_CI_API returns an empty array if nothing is found
        repoStatus = JSON.parse(data.body)[0] || {};

        result = {
            success: 0 === repoStatus.last_build_status,
            time: repoStatus.last_build_finished_at,
            index: index
        };
            
        res.setHeader('Content-Type', 'application/json');

        res.end('ciCb(' + JSON.stringify(result) + ')');
    });
}
