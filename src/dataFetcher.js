const fs = require('fs');
const _ = require('lodash');
const q = require('q');
const traverse = require('traverse');
const githubHelper = require('./helper/githubHelper');
const dataHelper = require('./helper/dataHelper');

const OUTPUT_DIR = __dirname + '/../output/';

var pkgs;
var index;
var lastPromise;
var allPromises;
var scheduleId;

function canFirePkgReq() {
  if (!lastPromise) {
    return true;
  }
  if (lastPromise && (lastPromise.isFulfilled() || lastPromise.isRejected())) {
    return true;
  }
  return false;
}

function firePkgRequest() {
  if (canFirePkgReq()) {
    var name = pkgs[index++];
    var url = dataHelper.getGitHubUrl(name);
    console.log('getting pkg', name);
    var repoInfo = githubHelper.getRepoInfo(name, url);
    if (repoInfo != null) {
      allPromises.push(repoInfo);
    }
    lastPromise = repoInfo;
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


module.exports.updatePackageInfoFromGitHub = updatePackageInfoFromGitHub;
