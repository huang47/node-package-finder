
/*
 * GET home page.
 */

exports.index = function(req, res){
  // http://blog.nodeknockout.com/post/35364532732/protip-add-the-vote-ko-badge-to-your-app
  var voteko = '<iframe src="http://nodeknockout.com/iframe/go-taiwanese" frameborder=0 scrolling=no allowtransparency=true width=115 height=25></iframe>';
  res.render('index', { title: 'npm smart searc', voteko: voteko });
};
