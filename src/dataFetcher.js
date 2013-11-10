const _ = require('lodash');
const q = require('q');
const traverse = require('traverse');
const githubHelper = require('./helper/githubHelper');
var npmPackages = require('./npm-all-1108.json');

function getPackageInfoFromGitHub() {
  var ind = 0;
  var promises = [];
  var pkgs = traverse(npmPackages);
  for(var key in npmPackages) {
    var url = pkgs.get([key, 'repository', 'url']);
    // repoInfo is a promise
    var repoInfo = githubHelper.getRepoInfo(key, url);
    if (repoInfo !== null) {
      promises.push(repoInfo);
    }
    ind++;
    if (ind > 5) {
      break;
    }
  }
  return q.all(promises).then(function(array) {
    var ret = {};
    _.each(array, function(d) {
      ret = _.merge(ret, d);
    });
    return ret;
  }, function(err) {
  });
}


module.exports.getPackageInfoFromGitHub = getPackageInfoFromGitHub;
