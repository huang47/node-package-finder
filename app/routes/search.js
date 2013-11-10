const searchHelper = require('../../src/helper/searchHelper');

/*
 * GET search result
 */
exports.search = function(req, res) {
  var query = req.params.query;
  res.json(searchHelper.searchPackage(query));
};
