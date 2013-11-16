var packages = 'sub namespace';

packages.split(' ').forEach(function (package) {
    exports[package] = require(__dirname + '/util/' + package)[package];
});
