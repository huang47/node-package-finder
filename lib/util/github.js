// https://api.github.com/users/huang47
// followers: followers count
// https://api.github.com/users/huang47/repos
// each repo has stargazers_count
var request = require('request');
var url = require('url');
var Class = require('./lib/class');
var Rx = require('rx');

const PROTOCOL = 'https';
const HOST = 'api.github.com';
const USER_API_PATH = 'users';
const USER_REPOS_API_PATH = 'repos';
const GITHUB_USER_API = 'https://api.github.com/users/{id}';
// sort by updated time
const GITHUB_USER_REPOS_API = 'https://api.github.com/users/{id}/repos?sort=created';

var GithubUser = Class.extend({

    init: function (id) {
        var self = this;

        this.id = id;
        this._getObservable(GITHUB_USER_API).
            flatMap(function (profile) {
                return self._getObservable(GITHUB_USER_REPOS_API).
                    maxBy(function (repo) {
                        return repo.stargazers_count;
                    });
            }).
            take(1).
            subscribe(function () {
            });
    },

    _getObservable: function _getObservable(api) {
        var id = this.id;

        return Rx.Observable.create(function (o) {
            request(api.replace(/{id}/, id), function (e, res) {
                if (e) {
                    o.onError(e);
                    return;
                }
                o.onNext(res);
            });

            return function () {};
        });
    },

    toString: function () {
        return JSON.stringify({
            id: this.id,
            followers: this.followers,
            mostPopularRepo: {
                stars: 
            }
        });
    }
});
