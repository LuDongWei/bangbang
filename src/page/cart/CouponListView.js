define(function (require, exports, module) {

    'use strict';

    var $ = require('zepto');
    var Backbone = require('gallery/backbone/1.1.0/backbone');
    var Handlebars = require('gallery/handlebars/1.3.0/handlebars');
    var _ = require('gallery/underscore/1.6.0/underscore');

    var utils = require('./utils');

    var couponListViewTemplate = Handlebars.compile($("#couponListView-template").html());


    var CouponListView = Backbone.View.extend({
        events: utils.evnetCheck({
            'tap .j_coupon_cancel': 'couponCancelEvent',
            'tap .j_coupon_select': 'couponSelectEvent'
        }),
        initialize: function (options) {
            var self = this;

            self.selectedSheetId = parseInt(options.selectedSheetId, 10);

            self.model.on('change', function () {
                self.render();
            });
            
            self.render();
        },
        render: function () {

            var self = this;
            var model = self.model;
            var sheetId = self.selectedSheetId;

            var shop = model.getShop(sheetId);
            var couponList = shop.coupon_list;

            var shopId = self.shopId = shop.shop_id;

            self.$el.html(couponListViewTemplate({
                list: couponList,
                isEmpty: couponList.length === 0,
                selectedIds: model.selectedItemIds.join(','),
                selectedIdshop: shopId
            }));

        },
        couponCancelEvent: function (event) {
            var self = this;
            var model = self.model;
            var shopId = self.shopId;
            var couponId = $(event.currentTarget).data("id");

            utils.loading(self.model.save({}, {
                "action": self.model.ACTION.SET_COUPON_ID,
                "shopId": shopId,
                "couponId": 0,
                "success": function () {
                    self.trigger('selected', couponId);
                }
            }));
        },
        couponSelectEvent: function (event) {

            var self = this;

            var model = self.model;
            var shopId = self.shopId;
            var couponId = $(event.currentTarget).data("id");

            utils.loading(self.model.save({}, {
                "action": self.model.ACTION.SET_COUPON_ID,
                "shopId": shopId,
                "couponId": couponId,
                "success": function () {
                    self.trigger('selected', couponId);
                }
            }));

        }

    });

    module.exports = CouponListView;
});