var mongo = require('mongoskin');
var encode = encodeURIComponent;

var db = mongo.db('mongodb://127.0.0.1:27017/npf');
var dbPackages = db.collection('packages');

exports.search = function (req, res) {
    var query = req.params.query;
    var safeQuery = encode(query);

    dbPackages.
        find({
            $or: [
                { name: { $regex: safeQuery } },
                { keywords: { $in: [safeQuery] } }
            ]
        }, {
            'name': 1,
            'github.profile.login': 1,
            'github.profile.followers': 1,
            'github.repo.stargazers_count': 1,
        }).
        sort({
            'github.repo.stargazers_count': -1
        }).
        limit(10).
        toArray(function (e, results) {
            res.setHeader('Content-Type', 'application/json');
            res.end('searchResultCb(' + JSON.stringify(results) + ')');
        });
};
