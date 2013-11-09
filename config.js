var path = require('path');
var url = require('url');
var Rx = require('rx');
var CREDENTIAL = require(path.resolve(__dirname, '.credential.json'));
var MongoClient = require('mongodb').MongoClient

const SRC_DIR = path.join(__dirname, 'src');
const NPM_FILE = path.join(SRC_DIR, 'all.json');
const PROTOCOL = 'https';
const HOST = 'api.github.com';
const USERS_PATHNAME = 'users';
const REPOS_PATHNAME = 'repos';
var packages = require(NPM_FILE);
var mongos = Rx.Observable.create(function (o) {
    var closeDatabase = function noop() {};
    MongoClient.connect(CREDENTIAL.MONGO_CONNECT_STRING, function (err, db) {
        closeDatabase = function () { db.close(); };
        if (err) {
            o.onError(err);
            return;
        }
        o.onNext(db);
        o.onCompleted();
    });
    return closeDatabase;
}).publishValue(null);

mongos.connect();

module.exports = {
    SRC_DIR: SRC_DIR,
    NPM_URL: 'https://registry.npmjs.org/-/all',
    NPM_FILE: NPM_FILE,
    GITHUB_USER_API: url.format({ protocol: PROTOCOL, host: HOST, pathname: [USERS_PATHNAME, '{id}'].join('/'), query: CREDENTIAL.GITHUB }),
    GITHUB_USER_REPOS_API: url.format({ protocol: PROTOCOL, host: HOST, pathname: [USERS_PATHNAME, '{id}', 'repos'].join('/'), query: CREDENTIAL.GITHUB }),
    GITHUB_REPO_API: url.format({ protocol: PROTOCOL, host: HOST, pathname: [REPOS_PATHNAME, '{id}', '{repo}'].join('/'), query: CREDENTIAL.GITHUB }),
    NPM_PACKAGES: Object.keys(packages).map(function (k) { return packages[k]; }),
    mongos: mongos.filter(function (db) { return null !== db; })
};
