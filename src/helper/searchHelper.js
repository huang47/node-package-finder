const _ = require('lodash');
const dataHelper = require('./dataHelper');

const KEYWORD_SCORE = 10;
const DESC_SCORE = 5;
const DERIVED_SCORE = 1;

/**
 * search package
 *
 * @param query
 * @return [{
 *   name: <string>,
 *   stars: <github repo stars>,
 *   author: <github author id>,
 *   followers: <repo follower>,
 *   score: <ranking score>
 * }]
 */
function searchPackage(query) {
  var rawResults = queryPackages(query);
  var ret = weightedByPackage(rawResults);
  _.each(ret, function(pkg) {
    var supportiveData = dataHelper.getSupportiveData(pkg.name);
    _.merge(pkg, supportiveData);
  });
  return _.sortBy(ret, 'score').reverse();
}

/**
 * query packages will return a set of matching packages
 *
 * @param query {string{}
 * @return [ { name: <package name>, score: <draft score> }, ... ]
 */
function queryPackages(query) {
  query = query || '';
  var words = query.split(' ');
  if (words.length === 0) {
    return [];
  }
  return _.reduce(dataHelper.getSearchMetadata(), function(result, pkg, name) {
    var score = _.reduce(words, function(s, word) {
      var regex = new RegExp(word, 'im');
      if (regex.exec(pkg.keywords)) {
        s += KEYWORD_SCORE;
      } else if (regex.exec(pkg.desc) || regex.exec(pkg.readme)) {
        s += DESC_SCORE;
      } else if (regex.exec(pkg.derivedKeywords)) {
        s += DERIVED_SCORE;
      }
      return s;
    }, 0);

    if (score > 0) {
      result.push({ name: name, score: score});
    }
    return result;
  }, []);
}

function weightedByPackage(queryResults) {
  return _.map(queryResults, function(pkg) {
    var weight = getPackageWeight(pkg.name);
    pkg.score *= 1 + Math.min(0.01, weight);
    return pkg;
  });
}

function getPackageWeight(packageName) {
  // score: people(10) stars (10) downloads(5) activities(5)
  // people: avg. score of author, contributors and maintainers
  // stars: 30 ~ 100 --> 6 --> 10
  // downloads: > 50 --> 5
  // activities: c = (weekC / 7) + (monthC / 30) / 2 + (year / 365) / 4
  //   if > 10 --> 5
  var pkg = dataHelper.getPackageInfo(packageName);
  if (!pkg) {
    return 0;
  }
  var authorScore = getPersonScore(pkg.authors);
  var contributorScore = getPersonScore(pkg.contributors);
  var maintainerScore = getPersonScore(pkg.maintainers);
  var people = (authorScore + contributorScore + maintainerScore) / 3;
  var stars = pkg.stars < 30 ? pkg.stars * (6 / 30) :
    6 + (Math.min(100, pkg.stars) * (4 / 70));
  var downloads = 0;
  if (pkg.downloads) {
    downloads = pkg.downloads.lastDay + pkg.downloads.lastWeek / 14 + pkg.downloads.lastMonth / 60;
    downloads = Math.min(50, downloads) * 0.1;
  }
  var activities = 0;
  if (pkg.commits) {
    activities = pkg.commits.week / 7 + pkg.commits.month / 60 + pkg.commits.year / 1460;
    activities = Math.min(10, activities) * 0.5;
  }
  return (people + stars + downloads + activities) / 20;
}

/**
 * @param persons {Array} an array of persons
 * @return
 */
function getPersonScore(persons) {
  if (!persons || persons.length === 0) {
    return 0;
  }
  // person
  // followers > 0 ~ 100 --> 1 ~ 10,
  // contributions --> > 10 month --> 5
  // pop repo (over 30 starts) > 3 --> 10
  // total score = (f + c + p) / 3
  var score = 0, f, c, r;
  persons.forEach(function (id) {
    var p = dataHelper.getPersonInfo(id);
    if (p) {
      f = (Math.min(100, p.followers) / 10) || 0;
      c = Math.min(10, (p.contributions.year / 24) + p.contributions.month);
      r = _.reduce(p.repos, function(s, repo) {
        return repo.starts > 30 ? s + 1 : s;
      }, 0);
      score += (f + c + r) / 3;
    }
  });
  return score / persons.length;
}

module.exports.queryPackages = queryPackages;
module.exports.searchPackage = searchPackage;
module.exports.internals = {
  getPackageWeight: getPackageWeight
};
