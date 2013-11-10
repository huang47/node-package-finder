/*jslint nomen:true*/
var Rx = require('rx');
var npm = require('npm');
var Class = require('./class');
var request = require('request');
var source = require('./source');
var util = require('./util');
var fs = require('fs');

var GITHUB_API = 'https://raw.github.com/{author}/{packageName}/master/README.md';
var FREEZE_EMPTY_OBJECT = Object.freeze({});
var FREEZE_EMPTY_ARRAY = Object.freeze([]);
var EMPTY_STRING = '';

function NOOP () {}

var Package = Class.extend({

    init: function (meta) {
        var self = this;

        if (!meta || !meta.name) { throw new Error("package name is required"); }

        if (meta.keywords !== '' && meta.keywords !== undefined && meta.keywords !== null) {
            this._keywords = Array.prototype.concat(meta.keywords);
        } else {
            this._keywords = FREEZE_EMPTY_ARRAY;
        }

        this._keyword = this._keywords.join(',');
        this._name = meta.name;
        this._desc = meta.description || '';
        this._author = meta.author;
        this._repo = meta.repository || FREEZE_EMPTY_OBJECT;
    },

    get name() {
        return this._name;
    },

    get keyword() {
        return this._keyword;
    },

    get author() {
        var url = this._repo.url || EMPTY_STRING,
            matched = url.match(/github.com\/(.+)\//);

        return null !== matched ? matched[1] : EMPTY_STRING;
    },

    get desc() {
        return this._desc;
    },

    get derivedKeywords() {
        var list = this._keywords.slice(),
            deps = source.packagesMap;

        for (var i = 0; i < list.length; i++) {
            var k = list[i],
                ks = deps[k] && Array.isArray(deps[k].keywords) ? deps[k].keywords : [];

            list.push.apply(list, ks.filter(function (k) {
                return -1 === list.indexOf(k);
            }));
        }

        return list.join(',');
    },

    get data() {
        return {
            name: this.name,
            keyword: this.keyword,
            derivedKeywords: this.derivedKeywords,
            author: this.author,
            desc: this.desc
        };
    }
});

Package.create = function (meta) {
    return new Package(meta);
};

exports.Package = Package;
