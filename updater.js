#!/usr/bin/env node

var API = require('./lib/api');

var mongo = require('mongoskin');
var request = require('request');
var fs = require('fs');
var EMPTY_OPTIONS = {};

function NOOP () {}

function errorHandler(e, package) {
    console.error(e, package);
    fs.appendFileSync('./errors.log', JSON.stringify(e));
}

var db = mongo.db(API.MONGO_CONNECT_STRING);

var packages = db.collection('packages');

exports.update = function () {

    packages.
        // only process //.*github.com/{id}/{repo}
        find({ 'repo.url': /github.com/ }).
        // sort by created/updated time in descendent
        sort({ _id: 1 }).
        each(function (error, package) {

            var url = package.repo && package.repo.url || '';
            var matched = url.match(/.*github.com[:\/](.*)\/(.*)/);
            var id = matched[1];
            var repoName = matched[2];

            if (id) {

                if (-1 !== repoName.indexOf('.git')) {
                    repoName = repoName.slice(0, repoName.indexOf('.git'));
                }

                request(API.GITHUB_REPO_API.replace(/{id}/, id).replace(/{repo}/, repoName), function (e, r) {

                    if (!r || !r.body) {
                        console.error("no body response");
                        return;
                    }

                    var repo = JSON.parse(r.body);

                    if (repo && repo.message && (null !== repo.message.match(/API/))) {
                        console.log('HIT API LIMIT: %s %s %s', package.name, repoName, repo.message);
                        return;
                    }

                    console.log('update %s repo %s', id, repoName);

                    packages.update(
                        { name: package.name },
                        {
                            $set: {
                                'github.repo': repo
                            }
                        },
                        EMPTY_OPTIONS,
                        NOOP
                    )
                });

              if (!package.github || !package.github.profile) {
                  request(API.GITHUB_USER_API.replace(/{id}/, id), function (e, r) {

                      if (!r || !r.body) {
                          console.error("no body response");
                          return;
                      }

                      var profile = JSON.parse(r.body);

                      if (profile && profile.message && (null !== profile.message.match(/API/))) {
                          console.log('HIT API LIMIT: %s %s', package.name, profile.message);
                          return;
                      }

                      console.log('update %s profile', id);

                      packages.update(
                          { name: package.name },
                          {
                              $set: {
                                  'github.profile': profile
                              }
                          },
                          EMPTY_OPTIONS,
                          NOOP
                      )
                  });
              }

              if (!package.github || !package.github.repo) {
                  request(API.GITHUB_USER_REPOS_API.replace(/{id}/, id), function (e, r) {

                      var repo;

                      if (!r || !r.body) {
                          console.error("no body response");
                          return;
                      }

                      var repos = JSON.parse(r.body),
                          mostPopularRepo;

                      if (repos && repos.message && (null !== repos.message.match(/API/))) {
                          throw new Error('HIT API LIMIT: ');
                          return;
                      }

                      console.log('update %s package %s', id, package.name);

                      if (!Array.isArray(repos)) {
                          console.log('%s not found', package.name);
                          return;
                      } else if (0 === repos.length) {
                          console.log('%s no repos', package.name);
                          return;
                      } else {
                          mostPopularRepo = repos.reduce(function (acc, curr) {
                              if (repoName === curr.name) { repo = curr; }
                              return (acc.stargazers_count > curr.stargazers_count) ? acc : curr;
                          });
                      }

                      packages.update(
                          { name: package.name },
                          {
                              $set: {
                                  'github.repo': repo,
                                  'github.topRepo': mostPopularRepo,
                                  'github.topStars': mostPopularRepo.stargazers_count
                              }
                          },
                          EMPTY_OPTIONS,
                          NOOP
                      )
                  });
              }
          } else {
              console.error('package without id, WTF ' + JSON.stringify(p));
          }
      });
};
