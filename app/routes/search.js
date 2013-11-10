const searchHelper = require('../../src/helper/searchHelper');

/*
 * GET search result
 */
exports.search = function(req, res) {
  var query = req.params.query;
  res.setHeader('Content-Type', 'application/json');
  res.end('searchResultCb(' + JSON.stringify(searchHelper.searchPackage(query)) + ')');
};
