/*global window, Rx*/
/*jslint nomen:true*/

(function (global, undefined) {
    'use strict';

    function isBoolean(o) {
        return 'boolean' === typeof o;
    }

    /**
     * @class Input
     * @constructor
     * @param {HTMLElement} element input box.
     * @param {Object} config configuration.
     * @param {Number} duration throttling duration.
     * @chainable
     */
    function Input(element, config) {
        var conf = config || {},
            focuses,
            blurs;

        this._el = element;
        this._duration = conf.duration || this._DURATION;

        focuses = this._fromEvent('focus');
        blurs = this._fromEvent('blur');

        this._xor(focuses, blurs).subscribe(this._handleFocusChanged.bind(this));

        return this;
    }

    Input.prototype = {
        /**
         * throttle duration, default to 200(ms).
         *
         * @property
         * @readOnly
         * @type Number
         * @default 200
         */
        _DURATION: 200,

        /**
         * A flag to indicate to remove empty string
         * from observable. default to true
         *
         * @property
         * @readOnly
         * @type Boolean
         * @default true
         */
        _IGNORE_EMPTY_STRING: true,

        _handleFocusChanged: function _handleFocusChanged(isFocus) {
            if (isFocus) {
                this._handleFocus();
            } else {
                this._handleBlur();
            }
        },

        /**
         * handle input box focus.
         *
         * @protected
         * @method _handleFocus
         * @param {Event} e event context.
         * @chainable
         */
        _handleFocus: function (e) {
            // nada
        },

        /**
         * handle input box blur.
         *
         * @protected
         * @method _handleBlur
         * @param {Event} e event context.
         * @chainable
         */
        _handleBlur: function (e) {
            return this.clear();
        },

        /**
         * XOR given 2 observables.
         *
         * @private
         * @method _xor
         * @param {Observable} first first observable.
         * @param {Observable} second second observable.
         */
        _xor: function (first, second) {
            var a = first.map(function () { return true; }),
                b = second.map(function () { return true; });

            return Rx.Observable.merge(a, b).distinctUntilChanged();
        },

        /**
         * A helper to wrap DOM and event handler to an observable.
         * TODO(hhuang)
         * This should be using Rx.DOM.fromEvent
         *
         * @private
         * @method _fromEvent
         * @param {String} eventName observed event name.
         * @return {Observable}
         * */
        _fromEvent: function (eventName) {
            var el = this._el;

            return Rx.Observable.create(function (o) {
                function handle(e) {
                    o.onNext(e);
                }

                el.addEventListener(eventName, handle);

                return function () {
                    el.removeEventListener(eventName, handle);
                };
            });
        },

        /**
         * remove references.
         *
         * @method destroy
         */
        destroy: function destroy() {
            delete this._el;
            delete this._duration;
        },

        /**
         * reset/clear input box value.
         *
         * @method clear
         * @chainable
         */
        clear: function clear() {
            this._el.value = '';
            return this;
        },

        /**
         * return an observable with collection of keyup events.
         *
         * @method getKeys
         * @return {Observable}
         */
        getKeys: function getKeys() {
            var keyups = this._fromEvent('keyup'),
                _EMPTY_KEY = '',
                keys,
                stream;

            keys = keyups
                .map(function (e) {
                    return e.srcElement.value.trim();
                })
                .distinctUntilChanged()
                .filter(function (v) {
                    return v !== _EMPTY_KEY;
                });

            stream = keyups.
                skip(1).
                throttle(200).
                map(function (e) {
                    return e.srcElement.value.trim();
                }).
                distinctUntilChanged().
                filter(function (v) {
                    return v !== _EMPTY_KEY;
                });

            return Rx.Observable.merge(keys.take(1), stream);
        }
    };

    global.Input = Input;

}(window));
