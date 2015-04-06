define(function (require, exports, module) {

    "use strict";

    var WIN = window;
    var $ = require('jquery');
    var Backbone = require("gallery/backbone/1.1.0/backbone");
    var _ = require("gallery/underscore/1.6.0/underscore");
    var Handlebars = require('gallery/handlebars/1.3.0/handlebars');

    var goldViewTemplate = Handlebars.compile($("#goldView-template").html())

    var utils = require('./utils');

    var GoldView = Backbone.View.extend({
        events: {
            'click .j_gold_btn': 'useGoldEvent'
        },
        initialize: function () {
            var self = this;

            self.model.on('change', function () {
                self.render();
            });

        },
        render: function () {
            var self = this;
            var model = self.model.toJSON();

            self.$el.html(goldViewTemplate({
                cart: model,
                canUse: model.exchange_amount > 0
            }));
        },
        useGoldEvent: function () {
            var self = this;
            var model = self.model;
            var used = model.get('wallet_used');

            utils.loading(model.save({}, {
                'action': self.model.ACTION.MODIFY_GOLD,
                'used': !used
            }));
        }
    });

    module.exports = GoldView;

});