const q = require('q');
const _ = require('lodash');
const request = require('request');
const traverse = require('traverse');

const GITHUB_PREFIX = 'https://api.github.com/';
const WEEK_IN_MILLIS =604800000;
const MONTH_IN_MILLIS = 2592000000;
const YEAR_IN_MILLIS = 31556952000;

const SECRETE= { 'client_id' : '82581723afe862fece26', 'client_secret' : '921e094906792d2120f47ebd7228dfd5a8afe43f' };

function defaultTo(value) {
  return function(err) {
    console.error('ERROR', err);
    return value;
  };
}

function getRequest() {
  return q.nbind(request, request);
}

function printLimits(res) {
  console.log('req remaining', traverse(res).get([ '0', 'headers', 'x-ratelimit-remaining' ]));
}

/**
 * Get Repo Info
 *
 * @param url {string} e.g. 'https://github.com/huang47/tasq.git'
 * @return {object} { pkgName: {
 *   downloads: { day: <number>, week: <number>, month: <number> }, --> npm
 *   author: [ 'github id', ... ],
 *   contributors: [ 'github id', ... ],
 *   maintainers: [ 'github id', ... ],
 *   stars: <number of stars>,
 *   watches: <number of watches>,
 *   commitTs: <string last commit ts>,
 *   issues: { open: <number>, close: <number>, lastUpdated: <string ts> },
 *   commits: { week: <number>, month: <number>, year: <number> }
 * } }
 */
var repoUrlRegExp = /github.com.(.+)/i;
var authorRegExp = /(.+)\/.*/i;
function getRepoInfo(name, url) {
  var m = repoUrlRegExp.exec(url);
  var fullName = m === null ? null : m[1].replace('.git', '');
  m = authorRegExp.exec(fullName);
  var author = m === null ? null : m[1];
  if (fullName === null) {
    console.error('can not update pkg', name, url);
    return null;
  }
  return getRepoInfoFromFullName(fullName, author)
    .then(function(data) {
      var ret = {};
      ret[name] = data;
      return ret;
    });
}

/**
 * Get User Info
 *
 * @param githubId
 * @return { githubId : {
 *   followers: {number} the number of followers,
 *   contributions: { year: <contributions in one year>, month: <contributions in one month> },
 *   repos: [ { name: <repo name>, stars: <number of stars> }, ... ]
 * } }
 */
function getUserInfo(githubId) {
  var followerCounts = getFollowerCount(githubId);
  var contributions = getContributions(githubId);
  var repos = getRepos(githubId);
  return q.all([followerCounts, contributions, repos])
    .spread(function(f, c, r) {
      var ret = {};
      ret[githubId] = {
        followers: f,
        contributions: c,
        repos: r
      };
      return ret;
    });
}

// return a promise which will have repo info
function getRepoInfoFromFullName(fullName, author) {
  var url = GITHUB_PREFIX + 'repos/' + fullName;
  var options = {
    url: url,
    method: 'GET',
    qs: SECRETE
  };
  return getRequest()(options)
    .then(function(res) {
      var statusCode = res[0].statusCode;
      printLimits(res);
      if (statusCode >= 200 && statusCode < 400) {
        return JSON.parse(res[0].body);
      }
      throw new Error('Get url ' + url + ' failed: ' + statusCode + ' ' + res[0].body);
    })
    .fail(defaultTo({}))
    .then(function (repoData) {
      if (_.isEmpty(repoData)) {
        return {};
      }
      var contributors = getContributors(repoData.contributors_url);
      var issues = repoData.has_issues ? getIssues(repoData.issues_url.replace('{/number}', '')) : { open: 0, close: 0 };
      var commits = getCommits(repoData.commits_url.replace('{/sha}', ''));
      return q.all([ contributors, issues, commits ])
        .spread(function(contributors, issues, commits) {
          issues.lastUpdated = repoData.updated_at;
          return {
            authors: [ author ],
            contributors: contributors,
            maintainers: [],
            stars: repoData.stargazers_count,
            watches: repoData.subscribers_count,
            commitTs: repoData.pushed_at,
            issues: issues,
            commits: commits
          };
        });
    });
}

function getCount(res) {
  var statusCode = res[0].statusCode;
  printLimits(res);
  if (statusCode >= 200 && statusCode < 400) {
    return JSON.parse(res[0].body).length;
  }
  throw new Error('failed: ' + statusCode + ' ' + res[0].body);
}

// { open: <number>, close: <number> }
function getIssues(url) {
  var req = getRequest();
  var openOpts = {
    url: url,
    method: 'GET',
    qs: _.merge({ state: 'open' }, SECRETE)
  };
  var closedOpts = {
    url: url,
    method: 'GET',
    qs: _.merge({ state: 'closed' }, SECRETE)
  };
  var openIssues = req(openOpts).then(getCount).fail(defaultTo(0));
  var closedIssues = req(closedOpts).then(getCount).fail(defaultTo(0));
  return q.all([openIssues, closedIssues]).spread(function(open, close) {
    return { open: open, close: close };
  });
}

function getCommits(url) {
  var options = {
    url: url,
    method: 'GET',
    qs: SECRETE
  };
  var req = getRequest();
  return req(options).then(function(res) {
    var statusCode = res[0].statusCode;
    printLimits(res);
    if (statusCode >= 200 && statusCode < 400) {
      var commits = JSON.parse(res[0].body);
      var now = Date.now();
      return _.reduce(commits, function(ret, commit) {
        var ts = Date.parse(traverse(commit).get(['commit', 'author', 'date']));
        var d = now - ts;
        if (d < WEEK_IN_MILLIS) {
          ret.week += 1;
        } else if (d < MONTH_IN_MILLIS) {
          ret.month += 1;
        } else if (d < YEAR_IN_MILLIS) {
          ret.year += 1;
        }
        return ret;
      }, { week: 0, month: 0, year: 0 });
    }
    throw new Error('Get url ' + url + ' failed: ' + statusCode + ' ' + res[0].body);
  })
  .fail(defaultTo({ week: 0, month: 0, year: 0 }));
}

// contributors array
function getContributors(url) {
  var options = {
    url: url,
    method: 'GET',
    qs: SECRETE
  };
  return getRequest()(options)
    .then(function(res) {
      printLimits(res);
      var statusCode = res[0].statusCode;
      if (statusCode >= 200 && statusCode < 400) {
        var contributors = JSON.parse(res[0].body);
        return _.map(contributors, function(c) { return c && c.login; });
      }
      throw new Error('Get url ' + url + ' failed: ' + statusCode + ' ' + res[0].body);
    })
    .fail(defaultTo([]));
}

// return a promise which will have follower count
function getFollowerCount(githubId) {
  var url = GITHUB_PREFIX + 'users/' + githubId;
  var options = {
    url: url,
    method: 'GET',
    qs: SECRETE
  };
  return getRequest()(options)
    .then(function(res) {
      printLimits(res);
      var statusCode = res[0].statusCode;
      if (statusCode >= 200 && statusCode < 400) {
        var userInfo = JSON.parse(res[0].body);
        return userInfo.followers || 0;
      }
      throw new Error('Get url ' + url + ' failed: ' + statusCode + ' ' + res[0].body);
    })
    .fail(defaultTo(0));
}

// return { year: <number of contributions>, month: <number of contributions> }
function getContributions(githubId) {
  var url = GITHUB_PREFIX + 'users/' + githubId + '/events';
  var options = {
    url: url,
    method: 'GET',
    qs: SECRETE
  };
  return getRequest()(options)
    .then(function(res) {
      var statusCode = res[0].statusCode;
      if (statusCode >= 200 && statusCode < 400) {
        var now = Date.now();
        var events = JSON.parse(res[0].body);
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
      throw new Error('Get url ' + url + ' failed: ' + statusCode + ' ' + res[0].body);
    })
    .fail(defaultTo({ year: 0, month: 0 }));
}

// return [ {name:<reponame>, starts:<number of stars>}, ... ]
function getRepos(githubId) {
  var url = GITHUB_PREFIX + 'users/' + githubId + '/repos?per_page=50&type=owner&sort=updated';
  var options = {
    url: url,
    method: 'GET',
    qs: _.merge({ 'per_page': 50, type: 'owner', sort: 'updated' }, SECRETE)
  };
  return getRequest()(options)
    .then(function(res) {
      var statusCode = res[0].statusCode;
      printLimits(res);
      if (statusCode >= 200 && statusCode < 400) {
        var repos = JSON.parse(res[0].body);
        return _.map(repos, function(repo) {
          return { name: repo.full_name, stars: repo.stargazers_count };
        });
      }
      throw new Error('Get url ' + url + ' failed: ' + statusCode + ' ' + res[0].body);
    })
    .fail(defaultTo([]));
}


module.exports.getUserInfo = getUserInfo;
module.exports.getRepoInfo = getRepoInfo;

module.exports.internals = {
  getFollowerCount:  getFollowerCount,
  getContributions:  getContributions,
  getRepos: getRepos,
  getContributors: getContributors,
  getRepoInfoFromFullName: getRepoInfoFromFullName,
  getIssues: getIssues,
  getCommits : getCommits
};
