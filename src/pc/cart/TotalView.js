define(function (require, exports, module) {

    "use strict";

    var WIN = window;
    var $ = require('jquery');
    var Backbone = require("gallery/backbone/1.1.0/backbone");
    var _ = require("gallery/underscore/1.6.0/underscore");
    var Handlebars = require('gallery/handlebars/1.3.0/handlebars');

    var totalViewTemplate = Handlebars.compile($("#totalView-template").html())

    var utils = require('./utils');

    var TotalView = Backbone.View.extend({
        events: {
            'click #j_post_cart': 'postCartEvent'
        },
        initialize: function () {
            var self = this;

            self.model.on('change', function () {
                self.render();
            });

        },
        render: function () {
            var self = this;
            var model = self.model;

            var curAddress = model.getCurAddress(model.get('address_id'));
            var pay_amount = model.get('pay_amount');
            var exchange_useful = model.get('exchange_useful');

            self.$el.html(totalViewTemplate({
                curAddress: curAddress,
                pay_amount: pay_amount,
                exchange_useful: exchange_useful,
                selectIds: model.selectedItemIds.join(','),
                hash: model.get('hash')
            }));

        },
        postCartEvent: function () {
            var self = this;
            var model = self.model;
            var addressId = model.get('address_id');
            var hash = model.get('hash');

            if (!addressId) {
                WIN.alert('请填写一个收货人信息');
                return false;
            }

            self.$el.find("#post-cart-form").submit();

            return false;
        }
    });

    module.exports = TotalView;

});