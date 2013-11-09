/**
 * A helper to check if given object is valid.
 *
 * @module utils
 */
var is = {

    /**
     * return true if given `o` is a boolean or string
     * which equals to 'true' or 'false'
     *
     * @method boolean
     * @param {Object} o
     * @return {Boolean}
     */
    "boolean": function isBoolean(o) {
        return 'boolean' === typeof o
            || 'true' === o
            || 'false' === o;
    },

    /**
     * return true if given `o` is a function
     *
     * @method function
     * @param {Object} o
     * @return {Boolean}
     */
    "function": function isFunction(o) {
        return 'function' === typeof o;
    },

    /**
     * return true if given `o` is undefined
     *
     * @method undefined
     * @param {Object} o
     * @return {Boolean}
     */
    "undefined": function isUndefined(o) {
        return undefined === o;
    },

    /**
     * return true if given `o` is NOT undefined
     *
     * @method notUndefined
     * @param {Object} o
     * @return {Boolean}
     */
    notUndefined: function isNotUndefined(o) {
        return ! is.undefined(o);
    },

    /**
     * return true if given `o` is a string
     *
     * @method string
     * @param {Object} o
     * @return {Boolean}
     */
    string: function isString(o) {
        return 'string' === typeof o;
    },

    /**
     * return true if given `o` is a non-empty string
     *
     * @method nonEmptyString
     * @param {Object} o
     * @return {Boolean}
     */
    nonEmptyString: function isNonEmptyString(o) {
        return is.string(o) && o.length > 0;
    },

    /**
     * return true if given `o` is a number or
     * string which can be coerced to a number.
     *
     * @method numeric
     * @param {Object} o
     * @return {Boolean}
     */
    numeric: function isNumeric(o) {
        return !isNaN(parseFloat(o)) && isFinite(o);
    }
};

module.exports = is;
