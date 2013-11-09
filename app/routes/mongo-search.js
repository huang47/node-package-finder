var mongo = require('mongoskin');
var db = mongo.db('mongodb://127.0.0.1:27017/npf');
var encode = encodeURIComponent;
var scores = db.collection('scores');
var cache = {};

exports.search = function (req, res) {
    var query = req.params.query;
    var safeQuery = encode(query);

    res.setHeader('Content-Type', 'application/json');

    if (cache[safeQuery]) {
        res.end('searchResultCb(' + JSON.stringify(cache[safeQuery]) + ')');
        return;
    }

    scores.
        find({
            $or: [
                { name: { $regex: safeQuery } },
                { keywords: { $in: [safeQuery] } },
                { description: { $regex: safeQuery } }
            ],
            author: { $exists: true },
            repo: { $exists: true }
        }).
        sort({ score: -1 }).
        limit(10).
        toArray(function (e, pkgs) {
            cache[safeQuery] = pkgs;
            res.end('searchResultCb(' + JSON.stringify(pkgs) + ')');
        });
};
