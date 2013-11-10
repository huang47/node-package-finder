(function (global) {
    'use strict';

    var d = document,
        el = d.querySelector('input[type="search"]'),
        input = new Input(el, { duration: 200 }),
        list = d.querySelector('ol[name="results"]'),
        template = new Template('#template-search-result');

    function getSearchResults(query, cb) {
        cb([
            {
                name: 'express',
                stars: 1450,
                author: 'visionmedia',
                followers: 2000,
                deps: 300,
                ci: {
                    success: true,
                    time: '2013 11 08'
                }
            },
            {
                name: 'git-extras',
                stars: 100,
                author: 'visionmedia',
                followers: 2000,
                deps: 200,
                ci: {
                    success: true,
                    time: '2013 11 01'
                }
            }
        ]);
    }

    global.searchResultCb = function (data) {
        var node = list.querySelector('li:nth-child(' + (parseInt(data.index, 10) + 1) + ') .fa-heart');
        if (node) {
            node.textContent = data.number;
        }
    };

    function render(query) {
        while(list.firstChild) { list.removeChild(list.firstChild); }
        getSearchResults(query, function (results) {
            results.forEach(function (result, index) {
                template.one('h2').textContent = result.name;
                template.one('.fa-star').textContent = result.stars;
                template.one('.fa-github').textContent = result.author;
                template.one('.fa-users').textContent = result.followers;
                template.one('.test-result').classList.add(result.ci.success ? 'fa-check' : 'fa-times');
                template.one('.test-result').textContent = result.ci.time;
                template.appendTo(list);

                (function updateDeps(node, i) {
                    var s = d.createElement('script');
                    s.src = ['', 'package', result.name, 'depscount', i].join('/');
                    d.body.appendChild(s);
                }(template.one('.fa-heart'), index));
            });
        });
    }

    input.getKeys().subscribe(render);
}(this));
