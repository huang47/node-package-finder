#!/usr/bin/env node

process.setMaxListeners(0);
var Package = require('./lib/package').Package;
var source = require('./lib/source');
var testPackages = source.packagesList;
var SIZE = testPackages.length;
var fs = require('fs');
var BATCH_NUMBER = 10;
var INTERVAL = 3000;
var batchRun = 1;
var results = {};
var BATCHRUN_UPPERBOUND = (SIZE / BATCH_NUMBER) >> 0;

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
                        if (i === context.length-1 && batch === BATCHRUN_UPPERBOUND) {
                            console.log('finished batch %d', batch);
                            clearTimeout(timeoutId);
                            fs.writeFileSync('./output/all.json', JSON.stringify(results));
                            process.exit(0);
                        }
                    });
                }
            });
    }(index));
}
