// From John Resig blog post: http://ejohn.org/blog/simple-javascript-inheritance/
var _initializing = false,
    _fnTest = /\b_super\b/,
    _createSuper = function(value, superValue) {
        return function(){
            var tmp = this._super,
            ret;

            // Add a new ._super() method that is the same method
            // but on the super-class
            this._super = superValue;

            // The method only need to be bound temporarily, so we
            // remove it when we're done executing
            ret = value.apply(this, arguments);
            this._super = tmp;

            return ret;
        };
    };

var Class = function () {};

Class.extend = function(prop) {
    var _super = this.prototype,
        fnTest = _fnTest,
        createSuper = _createSuper,
        prototype, name, getter, setter,
        value, superValue, Class;

    // Instantiate a base class (but only create the instance,
    // don't run the init constructor)
    _initializing = true;
    prototype = new this();
    _initializing = false;

    // Copy the properties over onto the new prototype
    for (name in prop) {

        // handle getter and setters properly
        getter = prop.__lookupGetter__(name),
        setter = prop.__lookupSetter__(name);

        if (getter || setter) {
            getter && prototype.__defineGetter__(name, getter);
            setter && prototype.__defineSetter__(name, setter);
            continue;
        }

        // Check if we're overwriting an existing function
        value = prop[name];
        prototype[name] = typeof value === "function" &&
        typeof (superValue = _super[name]) === "function" && fnTest.test(value) ?
        createSuper(value, superValue) : value;
    }

    // The dummy class constructor
    Class = function() {
        // All construction is actually done in the init method
        if ( !_initializing && this.init ) {
            this.init.apply(this, arguments);
        }
    };

    // Populate our constructed prototype object
    Class.prototype = prototype;

    // Enforce the constructor to be what we expect
    Class.prototype.constructor = Class;

    return Class;
};

exports.extend = Class.extend.bind(Class);
