const fs = require('fs');
const _ = require('lodash');
const q = require('q');
const traverse = require('traverse');
const githubHelper = require('./helper/githubHelper');
const dataHelper = require('./helper/dataHelper');

const OUTPUT_DIR = __dirname + '/../output/';

var pkgs, users;
var index;
var lastPromise;
var allPromises;
var scheduleId;

function canFireReq() {
  if (!lastPromise) {
    return true;
  }
  if (lastPromise && (lastPromise.isFulfilled() || lastPromise.isRejected())) {
    return true;
  }
  return false;
}

function fireUserRequest() {
  if (canFireReq()) {
    var id = users[index++];
    console.log('getting user', id, 'current index', index);
    var userInfo = githubHelper.getUserInfo(id);
    if (userInfo != null) {
      allPromises.push(userInfo);
    }
    lastPromise = userInfo;
    // consider to write partial data
    if (index === users.length) {
      q.all(allPromises).done(function (array) {
        var fileName = OUTPUT_DIR + 'user_github.json';
        var ret = {};
        _.each(array, function(d) {
          ret = _.merge(ret, d);
        });
        console.log('User Info Size', Object.keys(ret).length);
        fs.writeFileSync(fileName, JSON.stringify(ret));
        console.log('Update User Info is done');
      });
      // unschedule
      clearInterval(scheduleId);
      scheduleId = null;
    }
  }
}

function firePkgRequest() {
  if (canFireReq()) {
    var name = pkgs[index++];
    var url = dataHelper.getGitHubUrl(name);
    console.log('getting pkg', name, 'current index', index);
    var repoInfo = githubHelper.getRepoInfo(name, url);
    if (repoInfo != null) {
      allPromises.push(repoInfo);
    }
    lastPromise = repoInfo;
    // consider to write partial data
    if (index === pkgs.length) {
      q.all(allPromises).done(function (array) {
        var fileName = OUTPUT_DIR + 'pkg_github.json';
        var ret = {};
        _.each(array, function(d) {
          ret = _.merge(ret, d);
        });
        console.log('Pkg Size', Object.keys(ret).length);
        fs.writeFileSync(fileName, JSON.stringify(ret));
        console.log('Update Pkg Info is done');
      });
      // unschedule
      clearInterval(scheduleId);
    }
  }
}

function updateGithubUsers() {
  if (scheduleId) {
    console.log('previous job is still running');
    return;
  }

  users = dataHelper.getAllGithubUsers().slice(2000);
  index = 0;
  allPromises = [];
  scheduleId = setInterval(fireUserRequest, 500); // fire every 200ms
}

function updatePackageInfoFromGitHub() {
  if (scheduleId) {
    console.log('previous job is still running');
    return;
  }
  pkgs = Object.keys(dataHelper.getSearchMetadata());
  index = 0;
  allPromises = [];
  scheduleId = setInterval(firePkgRequest, 500); // fire every 200ms
}

const githubRepoFile = __dirname + '/../jsonData/pkg_github.json';
const batchSize = 100;

function batchGetPackage() {
  var repos = dataHelper.getAllPkgInfos();
  dataHelper.getSearchMetadata();
  var ind = 0;
  var allPromises = [];
  var pkgs = Object.keys(dataHelper.getSearchMetadata());
  for (var i = 0; i < pkgs.length && ind < batchSize; i++) {
    var name = pkgs[i];
    if(!repos[name]) {
      var url = dataHelper.getGitHubUrl(name);
      console.log('getting pkg', name, 'current index', index);
      var repoInfo = githubHelper.getRepoInfo(name, url);
      if (repoInfo != null) {
        allPromises.push(repoInfo);
        ind++;
      }
    }
  }
  return q.all(allPromises).then(function (data) {
    _.each(data, function (r) {
      repos = _.merge(repos, r);
      fs.writeFileSync(githubRepoFile, JSON.stringify(repos));
      dataHelper.updateGithubReposInfo();
    });
  });
}

module.exports.updatePackageInfoFromGitHub = updatePackageInfoFromGitHub;
module.exports.updateGithubUsers = updateGithubUsers;
module.exports.batchGetPackage = batchGetPackage;
