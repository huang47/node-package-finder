const fs = require('fs');
const traverse = require('traverse');
const metaFile = __dirname + '/../../jsonData/client-template.json';
const rawPkgs = traverse(require('../npm-all-1108.json'));

var metadata;
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
  console.log(packageName);
  return {
    downloads: { lastDay: 10, lastWeek: 20, lastMonth: 30 },
    authors: [ 'a', 'b', 'c' ],
    contributors: ['d', 'e', 'f'],
    maintainers: [ 'g', 'h', 'i'],
    stars: 10,
    watches: 20,
    commitTs: Date.now(),
    issues: { open: 2, close: 20, lastUpdated: Date.now() },
    commits: { lastWeek: 20, lastMonth: 10, lastYear: 100 }
  };
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
module.exports.getGitHubUrl = getGitHubUrl;
