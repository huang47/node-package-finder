/*global document*/
/*jslint nomen:true*/

(function (exports) {
    'use strict';

    var d = document;

    function Template(selector) {
        this._template = d.querySelector(selector);
    }

    Template.prototype = {
    
        get content() {
            return this._template.content;
        },

        one: function one(selector) {
            return this.content.querySelector(selector);
        },

        all: function all(selector) {
            return this.content.querySelectorAll(selector);
        },

        get clone() {
            return this.content.cloneNode(true);
        },

        appendTo: function (parent) {
            parent.appendChild(this.clone);
        },

        prependTo: function (parent) {
            parent.insertBefore(this.clone, parent.firstChild);
        }
    };

    exports.Template = Template;

}(this));
