#!/usr/bin/env node

process.setMaxListeners(0);
var Package = require('./lib/package').Package;
var source = require('./lib/source');
var testPackages = source.packagesList.slice(0, 100);
var SIZE = source.packagesList.length;
var fs = require('fs');
var BATCH_NUMBER = 10;
var INTERVAL = 3000;
var batchRun = 1;
var results = {};

var timeoutId = setTimeout(function batch() {
    runner(batchRun);
    batchRun++;
    setTimeout(batch, INTERVAL);
}, INTERVAL);

function runner(index) {
    (function (batch) {
        console.log('batch %d', batch);
        testPackages.slice((index-1) * BATCH_NUMBER, index * BATCH_NUMBER).
            filter(function (package) {
                return package && package.name;
            }).
            forEach(function (package, i, context) {
                if (package && package.name) {
                    var p = new Package(package);
                    p.getData(function (e, data) {
                        results[data.name] = data;
                        if (i === context.length-1 && batch === 10) {
                            console.log('finished batch %d', batch);
                            clearTimeout(timeoutId);
                            fs.writeFileSync('./output/' + batch + '.json', JSON.stringify(results));
                            console.log('we can closed process now, process.exit?');
                        }
                    });
                }
            });
    }(index));
}
