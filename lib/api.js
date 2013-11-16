#!/usr/bin/env node

var url = require('url');
var SECRET = require(__dirname + '/../.secret.json');

const PROTOCOL = 'https';
const HOST = 'api.github.com';
const USERS_PATHNAME = 'users';
const REPOS_PATHNAME = 'repos';

exports.GITHUB_USER_API = 
    url.format({ protocol: PROTOCOL, host: HOST, pathname: [USERS_PATHNAME, '{id}'].join('/'), query: SECRET });

exports.GITHUB_USER_REPOS_API =
    url.format({ protocol: PROTOCOL, host: HOST, pathname: [USERS_PATHNAME, '{id}', 'repos'].join('/'), query: SECRET });

exports.GITHUB_REPO_API =
    url.format({ protocol: PROTOCOL, host: HOST, pathname: [REPOS_PATHNAME, '{id}', '{repo}'].join('/'), query: SECRET });

exports.MONGO_CONNECT_STRING = 'mongodb://127.0.0.1:27017/npf';
