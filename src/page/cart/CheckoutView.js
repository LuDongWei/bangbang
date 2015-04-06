define(function (require, exports, module) {

    'use strict';

    var WIN = window;

    var $ = require('zepto');
    var Backbone = require('gallery/backbone/1.1.0/backbone');
    var Handlebars = require('gallery/handlebars/1.3.0/handlebars');
    var _ = require('gallery/underscore/1.6.0/underscore');

    var utils = require('./utils');

    var MESSAGE_MAX_LEN = 100;

    var templateCheckoutView = Handlebars.compile($("#cartCheckoutView-template").html());

    var CheckoutView = Backbone.View.extend({
        events: utils.evnetCheck({
            'tap .j_address_link': 'addressLinkEvent',
            'tap #j_post_cart': 'postCartEvent',
            'change .j_post_message': 'postMessageEvent',
            // 'click .j_gold_btn': 'useGoldEvent',
            'tap .j_coupon_link': 'couponLinkEvent',
            'tap .j_invoice_link': 'invoiceLinkEvent'
        }),
        initialize: function (options) {
            var self = this;

            self.model.on('change', function () {
                self.render();
            });

            self.messageSaveRun = false;

            self.render();
        },
        render: function () {
            var self = this;

            var cart = self.model.toJSON();

            self.$el.html(templateCheckoutView({
                cart: cart,
                shops: cart.sheets,
                curAddress: self.model.getCurAddress(),
                haveAddress: self.model.get('address_list').length > 0,
                selectIds: self.model.selectedItemIds.join(',')
            }));
        },
        addressLinkEvent: function (event) {
            var link = $(event.currentTarget).data('link');
            if (link !== '') {
                window.location.href = link;
            }
            event.preventDefault();
            return false;
        },
        couponLinkEvent: function (event) {

            var link = $(event.currentTarget).data('link');
            if (link !== '') {
                window.location.href = link;
            }
            event.preventDefault();
            return false;

        },
        invoiceLinkEvent: function (event) {

            var link = $(event.currentTarget).data('link');
            if (link !== '') {
                window.location.href = link;
            }
            event.preventDefault();
            return false;

        },
        postCartEvent: function () {
            var self = this;
            var model = self.model;
            var addressId = model.get('address_id');
            var hash = model.get('hash');
            var exchange_amount = model.get('exchange_amount');
            var pay_amount = model.get('pay_amount');

            var api = '/cart/api/submit?itemIds=' + model.selectedItemIds.join(',') + '&hash=' + hash;

            if (!addressId) {
                utils.error('请填写一个收货人信息');
                return false;
            }

            if (self.messageSaveRun) {
                return false;
            }

            $.ajax({
                type: "POST",
                dataType: 'json',
                url: api,
                success: function (response) {
                    if (response.err_code && response.err_code > 0) {
                        utils.error('下单出现问题，请重试。\n错误: ' + response.err_msg);
                    } else {
                        if (response && response.payment_type && response.trade_id) {
                            window.location.href = "/cart/success?exchange_amount=" + exchange_amount + "&pay_amount=" + pay_amount + "&type=" + response.payment_type + '&id=' + response.trade_id;
                        } else {
                            utils.error('下单出现问题，缺少关键参数。');
                        }
                    }
                },
                error: function () {
                    utils.error('下单出现问题，请联系客服！')
                }
            })
            return false;
        },
        postMessageEvent: function (event) {
            var self = this;
            var input = $(event.target);
            var msg = input.val();
            var sheetId = input.data('id');

            if (msg.length > MESSAGE_MAX_LEN) {
                msg = msg.substr(0, MESSAGE_MAX_LEN);
                input.val(msg);
                utils.error('留言字数过长(不能大于100字)');
            }

            self.messageSaveRun = true;

            self.model.save({}, {
                'action': self.model.ACTION.MODIFY_MESSAGE,
                'sheetId': sheetId,
                'message': msg
            }).done(function () {
                self.messageSaveRun = false;
            });
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

    module.exports = CheckoutView;
});