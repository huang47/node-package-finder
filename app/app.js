
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
//var search = require('./routes/search');
var search = require('./routes/mongo-search');
var package = require('./routes/package');
var http = require('http');
var path = require('path');

var app = express();
var port = 3000;

function configure(config) {
  port = (config && config.port) || 3000;
}

function start() {
  // all environments
  app.set('port', port);
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'jade');
  app.use(express.favicon(__dirname + '/public/images/favicon.ico'));
  app.use(express.logger('dev'));
  app.use(express.json());
  app.use(express.urlencoded());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));

  // development only
  if ('development' === app.get('env')) {
    app.use(express.errorHandler());
  }
  http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
  });
}


app.get('/', routes.index);
app.get('/search/:query', search.search);
app.get('/users', user.list);
app.get('/package/:package', package.search);
app.get('/package/:package/top', package.top);
app.get('/package/:package/depscount/:index', package.dependentsCount);
app.get('/package/:package/:author/ci/:index', package.travisCi);

module.exports.configure = configure;
module.exports.start = start;
