const fs = require('fs');
const _ = require('lodash');
const traverse = require('traverse');
const metaFile = __dirname + '/../../jsonData/client-template.json';
const githubRepoFile = __dirname + '/../../jsonData/pkg_github.json';
const rawPkgs = traverse(require('../npm-all-1108.json'));
const userInfoFile = __dirname + '/../../jsonData/user_github.json';

var metadata, githubRepos, userInfo;

function getSearchMetadata() {
  if (!metadata) {
    updateMetadata();
  }
  return metadata;
}

function getAuthorByPackage(pkgName) {
  var pkgTr = traverse(getPackageInfo(pkgName));
  var author = pkgTr.get([ 'authors', 0 ]);
  if (!author) {
    var metadataTr = traverse(getSearchMetadata());
    author = metadataTr.get([ pkgName, 'author']);
  }
  return author;

}

function getSupportiveData(pkgName) {
  var pkgTr = traverse(getPackageInfo(pkgName));
  var author = getAuthorByPackage(pkgName);
  var stars = pkgTr.get(['stars']);
  var authorInfo = getPersonInfo(author);
  var followers = (authorInfo && authorInfo.followers);

  return {
    stars: stars,
    author: author,
    followers: followers
  };
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

function updateUserInfo() {
  userInfo = JSON.parse(fs.readFileSync(userInfoFile));
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
  if (!githubRepos) {
    updateGithubReposInfo();
  }
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
  if (!userInfo) {
    updateUserInfo();
  }
  return userInfo[id];
}

function getAllUserInfo() {
  if (!userInfo) {
    updateUserInfo();
  }
  return userInfo;
}

function getAllPkgInfos() {
  if (!githubRepos) {
    updateGithubReposInfo();
  }
  return githubRepos;
}

module.exports.getSearchMetadata = getSearchMetadata;
module.exports.getPackageInfo = getPackageInfo;
module.exports.getPersonInfo = getPersonInfo;
module.exports.updateMetadata = updateMetadata;
module.exports.updateGithubReposInfo = updateGithubReposInfo;
module.exports.updateUserInfo = updateUserInfo;
module.exports.getGitHubUrl = getGitHubUrl;
module.exports.getAllGithubUsers = getAllGithubUsers;
module.exports.getSupportiveData = getSupportiveData;
module.exports.getAuthorByPackage = getAuthorByPackage;
module.exports.getAllUserInfo = getAllUserInfo;
module.exports.getAllPkgInfos = getAllPkgInfos;
