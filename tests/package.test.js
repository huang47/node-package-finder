var A = require('assert');
var source = require('../lib/source');
var Package = require('../lib/package').Package;
var Rx = require('rx');

describe('Package', function () {
    describe('author', function () {
        it('should return undefined if no author is found', function () {
            var package = new Package({ name: 'test' });

            A.strictEqual('', package.author);
        });

        it('should return github id if repository url exists', function () {
            var package;
            
            package = new Package({
                name: 'npm',
                repository: { url: 'https://github.com/isaacs/npm' }
            });

            A.strictEqual('isaacs', package.author);

            package = new Package({
                name: 'rxjs-tap',
                repository: { url: 'https://github.com/huang47/rxjs-tap' }
            });

            A.strictEqual('huang47', package.author);
        });
    });

    describe('keywords', function () {
        it('should return empty string if there are no keywords', function () {
            var package;
            
            package = new Package({ name: 'test' });

            A.strictEqual('', package.keyword);
        });

        it('should return comma separated string if keywords exists', function () {
            var package;
            
            package = new Package({
                name: 'test',
                keywords: ['hello', 'world']
            });

            A.strictEqual('hello,world', package.keyword);

            package = new Package({
                name: 'test',
                keywords: ['a', 'b', 'c', 'd']
            });

            A.strictEqual('a,b,c,d', package.keyword);
        });
    });

    describe('derivedKeywords', function () {
        it('should return a set of derived keywords', function () {
            var package;
            
            package = new Package({
                name: 'html-truncate',
                keywords: ['html-truncate']
            });

            A.strictEqual('html-truncate', package.derivedKeywords);

            package = new Package({
                name: 'express',
                keywords: ['express']
            });

            A.strictEqual('express,framework,sinatra,web,rest,restful,router,app,api,http,client,rest-template,spring,cujojs,connect,middleware,route,micro,rack,ender,routes,routing,cluster,modules,builder,packager,server,spark,fugue,tcp,workers,module,require,commonjs,amd,dependency,package installer,installer,package,bundle,bundler,httpd,worker,queue,requirejs,wizard,package.json', package.derivedKeywords);
        });
    });

    describe('getData', function () {
        it('should update readme and return an object', function (done) {
            this.timeout(10000);
            var package;
            
            package = new Package(source.packagesMap['html-truncate']);

            package.getData(function (err, data) {
                ['name', 'keyword', 'derivedKeywords', 'author', 'desc', 'readme'].forEach(function (k) {
                    console.log(data[k], k);
                    A.strictEqual('string', typeof data[k]);
                });
                done();
            });
        });
    });
});
