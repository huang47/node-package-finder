var packages = require('../src/npm-all-1108.json');

exports.packagesMap = packages;
exports.packagesList = Object.keys(packages).
    map(function (name) {
        return packages[name];
    });
