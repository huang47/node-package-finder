#!/usr/bin/env node

var Rx = require('rx');
var config = require('../config');

function hasGitRepo(p) {
    return p.repository
        && ('git' === p.repository.type)
        && p.repository.url;
}

var npmPackages = Rx.Observable.create(function (o) {

    config.NPM_PACKAGES.
        filter(hasGitRepo).
        forEach(function (p) {
            o.onNext({
                name: p.name,
                description: p.description,
                repoUrl: p.repository.url,
                keywords: p.keywords,
                timestamp: Date.now()
            });
        });

    o.onCompleted();

    return function disposeFunction() {};
});

module.exports = npmPackages;
