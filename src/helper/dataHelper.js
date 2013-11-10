const fs = require('fs');
const _ = require('lodash');
const traverse = require('traverse');
const metaFile = __dirname + '/../../jsonData/client-template.json';
const githubRepoFile = __dirname + '/../../jsonData/pkg_github.json';
const rawPkgs = traverse(require('../npm-all-1108.json'));

var metadata, githubRepos;

function getSearchMetadata() {
  if (!metadata) {
    updateMetadata();
  }
  return metadata;
}


function getGitHubUrl(key) {
  return rawPkgs.get([ key, 'repository', 'url' ]);
}

function updateMetadata() {
  metadata = JSON.parse(fs.readFileSync(metaFile));
}

function updateGithubReposInfo() {
  githubRepos = JSON.parse(fs.readFileSync(githubRepoFile));
}

function getAllGithubUsers() {
  if (!githubRepos) {
    updateGithubReposInfo();
  }
  var users = _.reduce(githubRepos, function(ret, repo) {
    _.each(repo.authors, function(id) { ret[id] = true; });
    _.each(repo.contributors, function(id) { ret[id] = true; });
    _.each(repo.maintainers, function(id) { ret[id] = true; });
    return ret;
  }, {});
  return Object.keys(users);
}

/**
 * @param packageName {string} npm package name
 * @return {
 *   downloads: { day:<number>, week: <number>, month: <number> }
 *   author: [ 'github_id', ... ],
 *   contributors: [ 'github_id' ... ],
 *   maintainers: [ 'github_id' ... ],
 *   stars: <number of starts>,
 *   watches: <number of watches>,
 *   commitTs: <last commit time>,
 *   issues: { open: <number>, close: <number>, lastUpdated: <ts> }
 *   commits: { week: <number>, month: <number>, year: <number> }
 * }
 */
function getPackageInfo(packageName) {
  return githubRepos[packageName];
}

/**
 * @param id {string} github id
 * @return {
 *   followers: {number} number of followers,
 *   contributions: {
 *     year: <number of contributions last year>,
 *     month: <number of contributions last month>
 *   },
 *   repos: [ // public repos
 *     { <repo name>: <starts> }, ...
 *   ]
 * }
 */
function getPersonInfo(id) {
  return {
    followers: 100,
    contributions: { year: 300, month: 20 },
    repos: [ { name: 'a', stars: 3 } ]
  };
}



module.exports.getSearchMetadata = getSearchMetadata;
module.exports.getPackageInfo = getPackageInfo;
module.exports.getPersonInfo = getPersonInfo;
module.exports.updateMetadata = updateMetadata;
module.exports.updateGithubReposInfo = updateGithubReposInfo;
module.exports.getGitHubUrl = getGitHubUrl;
module.exports.getAllGithubUsers = getAllGithubUsers;
