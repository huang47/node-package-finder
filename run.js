#!/usr/bin/env node

process.setMaxListeners(0);
var Package = require('./lib/package').Package;
var source = require('./lib/source');
var testPackages = source.packagesList;
var SIZE = source.packagesList.length;
var fs = require('fs');
var BATCH_NUMBER = 100;
var INTERVAL = 3000;
var batchRun = 1;

var timeoutId = setTimeout(function batch() {
    runner(batchRun);
    batchRun++;
    setTimeout(batch, INTERVAL);
}, INTERVAL);

function runner(index) {
    results = {};

    if (index * BATCH_NUMBER > SIZE) {
        clearTimeout(timeoutId);
        return;
    }

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
                        if (i === context.length-1) {
                            console.log('finished batch %d', batch);
                            fs.writeFileSync('./output/' + batch + '.json', JSON.stringify(results));
                        }
                    });
                }
            });
    }(index));
}
