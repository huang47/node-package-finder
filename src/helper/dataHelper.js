
function getSearchMetadata() {
  return {
    q: {
      keywords: 'q,promises,promises,flow control',
      desc: 'A library for promises (CommonJS/Promises/A,B,D)',
      readme: '',
      derivedKeywords: '',
      deps: 123
    },
    express: {
      keywords: 'express,framework,sinatra,web,rest,restful,router,app,api',
      desc: 'Sinatra inspired web development framework',
      readme: '',
      derivedKeywords: '',
      deps: 123
    },
    lodash: {
      keywords: 'amd,browser,client,customize,functional,server,util',
      desc: 'A utility library delivering consistency, customization, performance, & extras.',
      readme: '',
      derivedKeywords: '',
      deps: 123
    },
  };
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
