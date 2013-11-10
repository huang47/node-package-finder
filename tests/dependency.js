var deps = {
    a: {
        keywords: ['b', 'c']
    },
    b: {
        keywords: ['c']
    },
    c: {
        keywords: ['d']
    },
    d: {
        keywords: ['d']
    },
    e: {
    },
    
    f: {
        keywords: ['e']
    }
}

function de(keywords) {
    var list = keywords.slice();

    for (var i = 0; i < list.length; i++) {
        var k = list[i],
            ks = deps[k] && Array.isArray(deps[k].keywords) ? deps[k].keywords : [];

        ks.forEach(function (k) {
            if (-1 === list.indexOf(k)) list.push(k);
        });
        console.log(list, 'list');
    }

    return list;
}

console.log(de(['a', 'f']));
