(function () {
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
                ci: {
                    success: true,
                    time: '2013 11 01'
                }
            }
        ]);
    }

    function render(query) {
        getSearchResults(query, function (results) {
            results.forEach(function (result) {
                template.one('h2').textContent = result.name;
                template.one('i.fa-star').textContent = result.stars;
                template.one('i.fa-github').textContent = 'visionmedia';
                template.one('i.fa-users').textContent = '30';
                template.one('i.test-result').classList.add(result.ci.success ? 'fa-check' : 'fa-times');
                template.one('i.test-result').textContent = result.ci.time;
                template.prependTo(list);
            });
        });
    }

    input.getKeys().subscribe(render);
}());
