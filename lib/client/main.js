(function () {
    'use strict';

    var d = document,
        el = d.querySelector('input[type="search"]'),
        input = new Input(el, { duration: 200 }),
        list = d.querySelector('ol[name="results"]'),
        template = new Template('#template-search-result');

    function render(query) {
        var tokens = query.split(' ');
    }

    input.getKeys().subscribe(
        function (query) {
            template.one('.l-box').innerHTML = query;
            template.prependTo(list);
        }
    );
}());
