const q = require('q');
const _ = require('lodash');
const request = require('request');

const GITHUB_PREFIX = 'https://api.github.com/';
const MONTH_IN_MILLIS = 2592000000;
const YEAR_IN_MILLIS = 31556952000;

function defaultToZero(err) {
  console.error(err);
  return 0;
}

function defaultToZeroContributions(err) {
  console.error(err);
  return { year: 0, month: 0 };
}

function defaultToEmptyArray(err) {
  console.error(err);
  return [];
}

// return a promise which will get user data
//
// use like this
// var userData = getUserData('huang47');
// userData.done(function(data) {
//   console.log(data);
//   // save the data somewhere
// });
function getUserData(githubId) {
  var followerCounts = getFollowerCount(githubId);
  var contributions = getContributions(githubId);
  var repos = getRepos(githubId);
  return q.all([followerCounts, contributions, repos])
    .spread(function(f, c, r) {
      return {
        followers: f,
        contributions: c,
        repos: r
      };
    });
}

// return a promise which will have follower count
function getFollowerCount(githubId) {
  var url = GITHUB_PREFIX + 'users/' + githubId + '/followers';
  return q.nbind(request.get, request)(url)
    .then(function(resps) {
      if (resps[0].statusCode === 200) {
        return JSON.parse(resps[0].body).length;
      }
      throw new Error('Get url ' + url + ' failed: ' + resps[0].statusCode);
    })
    .fail(defaultToZero);
}

// return { year: <number of contributions>, month: <number of contributions> }
function getContributions(githubId) {
  var url = GITHUB_PREFIX + 'users/' + githubId + '/events';
  return q.nbind(request.get, request)(url)
    .then(function(resps) {
      if (resps[0].statusCode === 200) {
        var now = Date.now();
        var events = JSON.parse(resps[0].body);
        return _.reduce(events, function(ret, event) {
          if (event.type === 'PushEvent') {
            var gap = now - Date.parse(event.created_at);
            if (gap <= MONTH_IN_MILLIS) {
              ret.month += 1;
            } else if (gap < YEAR_IN_MILLIS) {
              ret.year +=1;
            }
          }
          return ret;
        }, { year: 0, month: 0});
      }
      throw new Error('Get url ' + url + ' failed: ' + resps[0].statusCode);
    })
    .fail(defaultToZeroContributions);
}

// return [ {name:<reponame>, starts:<number of stars>}, ... ]
function getRepos(githubId) {
  var url = GITHUB_PREFIX + 'users/' + githubId + '/repos';
  return q.nbind(request.get, request)(url)
    .then(function(resps) {
      if (resps[0].statusCode === 200) {
        var repos = JSON.parse(resps[0].body);
        return _.map(repos, function(repo) {
          return { name: repo.full_name, stars: repo.stargazers_count };
        });
      }
      throw new Error('Get url ' + url + ' failed: ' + resps[0].statusCode);
    })
    .fail(defaultToEmptyArray);
}

module.exports.getUserData = getUserData;

module.exports.internals = {
  getFollowerCount:  getFollowerCount,
  getContributions:  getContributions,
  getRepos: getRepos
}
