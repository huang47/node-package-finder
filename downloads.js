// default to isaacs.iriscouch.com
var registry = require('npm-stats')();
var API = require('./lib/api');
var mongo = require('mongoskin');

var db = mongo.db(API.MONGO_CONNECT_STRING);
var packages = db.collection('packages');
var downloads = db.collection('downloads');

packages.
    find({ name: { $exists: true } }).
    each(function (e, package) {

        if (!package || !package.name) { return; }

        registry.module(package.name).downloads(function (err, res) {
            downloads.insert({
                name: package.name,
                downloads: res
            });
        });
    });
