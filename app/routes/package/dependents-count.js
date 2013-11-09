var request = require('request');
var KEY = '{package}';
var API = ['http://isaacs.iriscouch.com/registry/_design/app/_view/dependedUpon?startkey=["', KEY, '"]&endkey=["', KEY, '",{}]&group_level=1'].join('');
var regexRule = new RegExp(KEY, 'g');

function getDepdentsCount(name, cb) {
    request({
        url: API.replace(regexRule, name),
        timeout: 5000
    }, function (e, result) {
        if (e) { cb(e, null); }

        if (!result || !result.body) {
            cb(new Error('response without body'), null);
            return;
        }

        var body = JSON.parse(result.body) || {};
        var count = (body.rows && body.rows[0] && body.rows[0].value) || 0;
        cb(null, count);
    });
}

exports.dependentsCount = function (req, res) {
    var index = req.params.index;

    getDepdentsCount(req.params.package, function (err, count) {
        if (err) {
            return;
        }

        res.setHeader('Content-Type', 'application/json');
        res.end('dependentsCb(' + JSON.stringify({ number: count, index: index }) + ')');
    });
}
