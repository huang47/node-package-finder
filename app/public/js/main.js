(function () {
    'use strict';

    var d = document,
        el = d.querySelector('input[type="search"]'),
        input = new Input(el, { duration: 200 }),
        list = d.querySelector('ol[name="results"]'),
        template = new Template('#template-search-result');

    function render(query) {
        template.one('.l-box').innerHTML = query;
        template.prependTo(list);
    }

    input.getKeys().subscribe(render);
}());
