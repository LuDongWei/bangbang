define(function (require, exports, module) {

    'use strict';

    var $ = require('zepto');
    var Backbone = require('gallery/backbone/1.1.0/backbone');
    var Handlebars = require('gallery/handlebars/1.3.0/handlebars');
    var _ = require('gallery/underscore/1.6.0/underscore');

    var utils = require('./utils');

    var SHEETS_CACHE = window.SHEET_CART;

    var templateSheetView = Handlebars.compile($("#cartSheetView-template").html());
    var templateSheetBar = Handlebars.compile($("#cartSheetBar-template").html());

    var templateSheetPromotion = Handlebars.compile($("#cartSheetPromotion-template").html());

    var SheetView = Backbone.View.extend({
        events: utils.evnetCheck({
            'tap .j_goods_increase': 'goodsIncreaseEvent', //增加商品数量
            'tap .j_goods_decrease': 'goodsDecreaseEvent', //减少商品数量
            'change .j_qty_nubmer': 'goodsQtyChangeEvent',
            'tap .j_goods_remove': 'goodsRemoveEvent', //删除商品

            'tap .j_shop_select': 'shopSelectEvent', //勾选店铺
            'tap .j_goods_select': 'goodsSelectEvent', //勾选商品

            'tap .j_show_promotion': 'promotionShowEvent',
            'tap .j_hide_promotion': 'promotionHideEvent',
            'tap .j_select_promotion': 'promotionSelectEvent',
            'tap .j_no_select_promotion': 'promotionNoSelectEvent',

            'tap #j_post_checkout': 'postCheckoutEvent'

        }),
        initialize: function () {
            var self = this;
            var cartModel = self.model;

            cartModel.on('change', function () {
                self.render();
            });

            cartModel.on('select', function () {
                self.render();
            });

            cartModel.on('cancel', function () {
                self.render();
            });

            self.render();

        },
        render: function () {
            this.renderingSheetList().renderingSheetBar();
        },

        renderingSheetList: function () {
            var self = this;
            var shopList = self.model.get('sheets');

            self.$el.html(templateSheetView({
                shops: shopList
            }));

            return self;
        },

        renderingSheetBar: function () {
            var self = this;
            var model = self.model;

            var checkedGoods = model.getCheckedGoods();

            var goodsCount = _.reduce(checkedGoods, function (memo, item) {
                return memo + (item.isSku ? item.qty : 0);
            }, 0);

            var payAmount = 0;
            var exchangeAmount = 0;

            _.each(checkedGoods, function (item) {
                if (item.exchange_amount == 0) {
                    payAmount = payAmount + item.promotion_amount;
                } else {
                    exchangeAmount = exchangeAmount + item.exchange_amount;
                }
            });

            self.$el.find('.pay-bar').html(templateSheetBar({
                payAmount: payAmount,
                exchangeAmount: exchangeAmount,
                itemCount: goodsCount
            }));

            return self;
        },

        promotionShowEvent: function (event) {

            var self = this;

            var promList = [];

            var id = $(event.currentTarget).data('id');
            var type = $(event.currentTarget).data('type');
            var isShopProm = false;

            var model = self.model;

            if (type == 1) {
                promList = model.getShop(id).promotion_list;
                isShopProm = true;
            }

            if (type == 0) {
                promList = model.getGoods(id).promotion_list;
                isShopProm = false;
            }

            self.$el.find('.popup-promotion').html(templateSheetPromotion({
                'promList': promList,
                'id': id,
                'type': type,
                'isShopProm': isShopProm
            }));

            return false;
        },

        promotionHideEvent: function (event) {
            var self = this;
            self.$el.find('.prom-in').removeClass('on-show');
            self.$el.find('.prom-mask').remove();

            return false;
        },

        promotionSelectEvent: function (event) {
            var self = this;
            var model = self.model;

            var id = $(event.currentTarget).data('id');
            var type = $(event.currentTarget).data('type');
            var ipid = $(event.currentTarget).data('apid');

            utils.loading(self.model.save({}, {
                'action': self.model.ACTION.MODIFY_PROMOTION,
                'id': id,
                'typeOp': type,
                'apid': ipid
            }));

            return false;

        },
        promotionNoSelectEvent: function (event) {
            return false;
        },


        goodsQtyChangeEvent: function (event) { //数量输入框
            var self = this;
            var inputQty = $(event.currentTarget)
            var itemId = parseInt(inputQty.data('id'), 10);

            var goods = self.model.getGoods(itemId);
            var max_qty = goods.stock;

            var new_qty = parseInt(inputQty.val(), 10);

            if (isNaN(new_qty)) {
                inputQty.val(goods.qty);
                return false;
            }

            if (new_qty > max_qty) {
                inputQty.val(goods.qty);
                alert("您设置的数量超过最大设置数！");
                return false;
            }

            utils.loading(self.model.save({}, {
                'action': self.model.ACTION.MODIFY_QTY,
                'qty': new_qty,
                'id': goods.id
            }));
        },

        goodsIncreaseEvent: function (event) { //增加数量
            var self = this;
            var itemId = parseInt($(event.currentTarget).data('id'), 10);
            var goods = self.model.getGoods(itemId);
            var max_qty = goods.stock;
            var old_qty = goods.qty;
            var new_qty = old_qty + 1;

            if (new_qty > max_qty) {
                return;
            }

            utils.loading(self.model.save({}, {
                'action': self.model.ACTION.MODIFY_QTY,
                'qty': new_qty,
                'id': goods.id
            }));

            return false;
        },

        goodsDecreaseEvent: function (event) { //减少数量
            var self = this;
            var itemId = parseInt($(event.currentTarget).data('id'), 10);
            var goods = self.model.getGoods(itemId);
            var max_qty = goods.stock;
            var old_qty = goods.qty;
            var new_qty = old_qty - 1;

            if (new_qty < 1) {
                return;
            }

            utils.loading(self.model.save({}, {
                'action': self.model.ACTION.MODIFY_QTY,
                'qty': new_qty,
                'id': goods.id
            }));

            return false;
        },

        goodsRemoveEvent: function (event) { //删除商品
            var self = this;
            var itemId = parseInt($(event.currentTarget).data('id'), 10);
            var goods = self.model.getGoods(itemId);

            utils.loading(self.model.save({}, {
                'action': self.model.ACTION.REMOVE_GOODS,
                'id': goods.id
            }));

            return false;
        },

        shopSelectEvent: function (event) { //店铺勾选

            var self = this;
            var checkbox = $(event.currentTarget);

            var shopId = parseInt($(event.currentTarget).data('shopid'), 10);

            var goodsIds = self.model.getShopGoodsIds(shopId);

            var checked = checkbox.data('checked');

            self.model.save({}, {
                'action': checked ? self.model.ACTION.REMOVE_CHECKED_GOODS : self.model.ACTION.ADD_CHECKED_GOODS,
                'id': goodsIds
            });

            return false;
        },

        goodsSelectEvent: function (event) { //商品勾选
            var self = this;
            var checkbox = $(event.currentTarget);
            var goodsId = parseInt(checkbox.data('id'), 10);
            var checked = checkbox.data('checked');

            self.model.save({}, {
                'action': checked ? self.model.ACTION.REMOVE_CHECKED_GOODS : self.model.ACTION.ADD_CHECKED_GOODS,
                'id': goodsId
            });
            return false;
        },

        postCheckoutEvent: function () {
            var self = this;
            var model = self.model;

            if (model.selectedItemIds.length) {
                location.href = '#checkout/' + model.selectedItemIds.join(',')
            } else {
                alert('请选择需要购买的商品')
            }
            return false;
        }

    });

    module.exports = SheetView;
});