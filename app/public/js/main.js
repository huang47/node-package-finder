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
            node.classList.add(true === data.success ? 'fa-check' : 'fa-times');
            node.textContent = data.time ? new Date(data.time).toLocaleDateString() : '';
        }
    };

    global.searchResultCb = function(results) {
        results.forEach(function (result, index) {
            template.one('img').setAttribute('src', result.author.avatar);

            template.one('img').setAttribute('alt', result.author.id);

            template.one('a.author').setAttribute('href', 'https://github.com/' + result.author.id);

            template.one('a.author').setAttribute('title', result.author.id);

            template.one('a.sr').setAttribute('href', 'https://npmjs.org/package/' + result.name);

            template.one('a.sr').setAttribute('title', result.description);

            template.one('h2').textContent = result.name;

            template.one('.fa-star').textContent = result.repo.stars;

            template.one('.fa-github').textContent = result.author.id;

            template.one('.fa-wrench').textContent = result.dependedUpon;

            template.one('.fa-users').textContent = result.author.followers;

            template.one('.fa-cloud-download').textContent = result.downloads;

            template.appendTo(list);

            (function (i) {
                injectScript(['', 'package', result.name, result.author.id, 'ci', i].join('/'));
            }(index));
        });
    }

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
