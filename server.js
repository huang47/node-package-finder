// https://github.com/nko4/website/blob/master/module/README.md#nodejs-knockout-deploy-check-ins
require('nko')('7O7XgsUUtAqcBI0P');
const app = require('./app/app');

var isProduction = (process.env.NODE_ENV === 'production');
var http = require('http');
var port = (isProduction ? 80 : 8000);

var options = {
  port: port
};

app.configure(options);

app.start();
