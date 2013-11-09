/*global window, Rx*/
/*jslint nomen:true*/

(function (exports, undefined) {
    'use strict';

    /**
     * @class Input
     * @constructor
     * @param {HTMLElement} element input box.
     * @param {Object} config configuration.
     * @param {Number} duration throttling duration.
     * @chainable
     */
    function Input(element, config) {
        var conf = config || {};

        this._el = element;
        this._duration = conf.duration || this._DURATION;

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
            var keyups = this._fromEvent('keypress'),
                _EMPTY_KEY = '',
                stream;

            return keyups.
                throttle(this._duration).
                map(function (e) {
                    return e.target.value.trim();
                }).
                filter(function (v) {
                    return v !== _EMPTY_KEY;
                }).
                distinctUntilChanged();
        }
    };

    exports.Input = Input;

}(this));
