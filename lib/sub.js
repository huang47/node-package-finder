var SUB_REGEX = /\{\s*([^|}]+?)\s*(?:\|([^}]*))?\s*\}/g;

function sub(tp, data) {
    return tp.replace(SUB_REGEX, function (match, key) {
        return (undefined === data[key]) ? '{' + key + '}' : data[key];
    });
}

exports.sub = sub;
