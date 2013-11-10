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
  //var ret = sumThemAll(rawResults);
  _.each(ret, function(pkg) {
    var supportiveData = dataHelper.getSupportiveData(pkg.name);
    _.merge(pkg, supportiveData);
  });
  return _.sortBy(ret, 'score').reverse().slice(0, 10);
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
      var regex = new RegExp(word, 'i');
      if (regex.exec(pkg.keyword)) {
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

function sumThemAll(queryResults) {
  return _.map(queryResults, function(pkg) {
    var score = getSumScoreByPackage(pkg.name);
    pkg.score += score;
    return pkg;
  });
}

function weightedByPackage(queryResults) {
  return _.map(queryResults, function(pkg) {
    var weight = getPackageWeight(pkg.name) + 1;
    pkg.score *= weight;
    return pkg;
  });
}

function getSumScoreByPackage(name) {
  var pkg = dataHelper.getPackageInfo(name);
  if (!pkg) {
    // try to use author score
    var author = dataHelper.getAuthorByPackage(name);
    var authorScore = getPersonScore([ author ]) || 0;
    return authorScore;
  }
  var authorScore = getPersonScore(pkg.authors);
  var contributorScore = getPersonScore(pkg.contributors);
  var peopleScore = authorScore + contributorScore;
  var stars = pkg.stars;
  var downloads = 0;
  if (pkg.downloads) {
    downloads = pkg.downloads.lastDay + pkg.downloads.lastWeek / 14 + pkg.downloads.lastMonth / 60;
  }
  var activities = 0;
  if (pkg.commits) {
    activities = pkg.commits.week / 7 + pkg.commits.month / 60 + pkg.commits.year / 1460;
  }
  return peopleScore + stars + downloads + activities;
}

function getPackageWeight(packageName) {
  // score: people(30) stars (30) downloads(0) activities(10)
  // people: author score(20) + contributor count > 5 (10) --> 30 in total
  // stars: 30 ~ 100 --> 6 --> 10 > 100 --> 20
  // downloads: > 50 --> 5
  // activities: c = (weekC / 7) + (monthC / 30) / 2 + (year / 365) / 4
  //   if > 10 --> 5
  var pkg = dataHelper.getPackageInfo(packageName);
  if (!pkg) {
    // try to use author score
    var author = dataHelper.getAuthorByPackage(packageName);
    var authorScore = getPersonScore([ author ]) || 0;
    return authorScore / 35;
  }
  var authorScore = getPersonScore(pkg.authors);
  var contributorCount = pkg.contributors && pkg.contributors.length || 0;
  var people = authorScore + Math.min(5, contributorCount) * 2;
  var stars = Math.min(200, pkg.stars) * 0.1;
  var downloads = 0;
  if (pkg.downloads) {
    downloads = pkg.downloads.lastDay + pkg.downloads.lastWeek / 14 + pkg.downloads.lastMonth / 60;
    downloads = Math.min(50, downloads) * 0.1;
  }
  var activities = 0;
  if (pkg.commits) {
    activities = pkg.commits.week + pkg.commits.month / 2 + pkg.commits.year / 4;
    activities = Math.min(20, activities);
  }
  return (people + stars + downloads + activities) / 40;
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
  // followers > 0 ~ 30 --> 1 ~ 10,
  // contributions --> > 10 month --> 5
  // pop repo (over 30 stars) > 3 --> 10
  // total score = (f + c + p) / 3
  var score = 0, f, c, r;
  persons.forEach(function (id) {
    var p = dataHelper.getPersonInfo(id);
    if (p) {
      f = (Math.min(100, p.followers) / 10) || 0;
      c = Math.min(10, (p.contributions.year / 24) + p.contributions.month);
      r = _.reduce(p.repos, function(s, repo) {
        return repo.stars > 30 ? s + 1 : s;
      }, 0);
      score += (f + c) / 2 + Math.min(10, r);
    }
  });
  return score / persons.length;
}

module.exports.queryPackages = queryPackages;
module.exports.searchPackage = searchPackage;
module.exports.internals = {
  getPackageWeight: getPackageWeight,
  sumThemAll: sumThemAll,
  getPersonScore: getPersonScore
};
