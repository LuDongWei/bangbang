define(function (require, exports, module) {

    'use strict';

    var WIN = window;
    var $ = require('jquery');
    var Backbone = require('gallery/backbone/1.1.0/backbone');
    var Handlebars = require('gallery/handlebars/1.3.0/handlebars');
    var _ = require('gallery/underscore/1.6.0/underscore');

    var utils = require('./utils');

    var MESSAGE_MAX_LEN = 100;

    var templateGoodsView = Handlebars.compile($("#goodsView-template").html());

    var GoodsView = Backbone.View.extend({
        events: utils.evnetCheck({
            'change .j_post_message': 'postMessageEvent',
            'click .j_cancel_coupon': 'cancelCouponEvent',
            'click .j_coupon_select': 'couponSelectEvent',
            'mouseenter .coupon-box': 'couponShow',
            'mouseleave .coupon-box': 'couponHide'
        }),
        initialize: function () {
            var self = this;
            var cartModel = self.model;

            cartModel.on('change', function () {
                self.render();
            });
        },
        render: function () {
            var self = this;
            var model = self.model;
            var shopList = model.get('sheets');

            self.$el.html(templateGoodsView({
                shops: shopList
            }));
        },
        postMessageEvent: function () {
            var self = this;
            var model = self.model;
            var input = $(event.target);
            var msg = input.val();
            var sheetId = input.data('id');

            if (msg.length > MESSAGE_MAX_LEN) {
                msg = msg.substr(0, MESSAGE_MAX_LEN);
                input.val(msg);
                utils.error('留言字数过长(不能大于100字)');
            }

            utils.loading(model.save({}, {
                'action': model.ACTION.MODIFY_MESSAGE,
                'sheetId': sheetId,
                'message': msg
            }));
        },
        cancelCouponEvent: function (event) {
            var self = this;
            var model = self.model;
            var shopId = $(event.currentTarget).data("shopid");

            utils.loading(model.save({}, {
                "action": model.ACTION.SET_COUPON_ID,
                "shopId": shopId,
                "couponId": 0
            }));
        },
        couponSelectEvent: function (event) {

            var self = this;

            var model = self.model;
            var shopId = $(event.currentTarget).data("shopid");
            var couponId = $(event.currentTarget).data("id");

            utils.loading(model.save({}, {
                "action": model.ACTION.SET_COUPON_ID,
                "shopId": shopId,
                "couponId": couponId
            }));

        },
        couponShow: function(event){
            $(event.currentTarget).addClass("couponListShow");
        },
        couponHide: function(event){
            $(event.currentTarget).removeClass("couponListShow"); 
        }

    });

    module.exports = GoodsView;
});