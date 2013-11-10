var Package = require('./lib/package').Package;
var source = require('./lib/source');
var testPackages = source.packagesList.slice(100, 110);
var tasq = require('tasq');
var results = [];
var cbs = [];

testPackages.forEach(function (package) {
    var p = new Package(package);
    cbs.push(p.getData.bind(p, function (e, data) {
        console.log(data, 'data'); results.push[data];
    }));
});

tasq.async(cbs, function () {
    console.log(results);
})
