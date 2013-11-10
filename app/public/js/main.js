(function (global) {
    'use strict';

    var d = document,
        el = d.querySelector('input[type="search"]'),
        input = new Input(el, { duration: 500 }),
        list = d.querySelector('ol[name="results"]'),
        template = new Template('#template-search-result');

    global.ciCb = function (data) {
        var node = list.querySelector('li:nth-child(' + (parseInt(data.index, 10) + 1) + ') .test-result');
        if (node) {
            node.classList.add('true' === data.success ? 'fa-check' : 'fa-times');
            node.textContent = data.time;
        }
    };

    global.searchResultCb = function(results) {
        results.forEach(function (result, index) {
            template.one('h2').textContent = result.name;
            if (result.stars) {
                template.one('.fa-star').textContent = result.stars;
            } else {
                template.one('.fa-star').classList.add('hide');
            }

            template.one('.fa-github').textContent = result.author;

            if (result.followers) {
                template.one('.fa-users').textContent = result.followers;
            } else {
                template.one('.fa-users').classList.add('hide');
            }

            if (result.score) {
                template.one('.fa-certificate').textContent = result.score;
            } else {
                template.one('.fa-certificate').classList.add('hide');
            }

            template.appendTo(list);

            (function updateCi(i) {
                injectScript(['', 'package', result.name, result.author, 'ci', i].join('/'));
            }(index));

            (function updateDeps(i) {
                injectScript(['', 'package', result.name, 'depscount', i].join('/'));
            }(index));
        });
    }

    global.dependentsCb = function (data) {
        var node = list.querySelector('li:nth-child(' + (parseInt(data.index, 10) + 1) + ') .fa-heart');
        if (node) {
            node.textContent = data.number;
        }
    };

    function injectScript(src) {
        var s = d.createElement('script');
        s.src = src;
        d.body.appendChild(s);
    }

    function render(query) {
        while(list.firstChild) { list.removeChild(list.firstChild); }

        injectScript(['', 'search', query].join('/'));
    }

    input.getKeys().subscribe(render);
}(this));
