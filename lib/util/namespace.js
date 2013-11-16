function namespace(ns) {
    var spaces = ns.split('.'),
        context = this;

    spaces.forEach(function (s) {
        if (!context[s]) {
            context[s] = {};
        }
        context = context[s];
    });

    return context;
};

exports.namespace = namespace;
