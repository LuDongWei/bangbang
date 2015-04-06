define(function (require, exports, module) {

    'use strict';

    var WIN = window;
    var $ = require('jquery');
    var Backbone = require('gallery/backbone/1.1.0/backbone');
    var _ = require("gallery/underscore/1.6.0/underscore");

    Backbone.emulateHTTP = true;
    Backbone.emulateJSON = true;

    var utils = require('./utils');


    var CartModel = Backbone.Model.extend({
        defaults: {

            "cart_id": "", //购物车ID
            "su_id": 0, //用户ID
            "address_id": 0, //地址ID (具体的省市区还有地址这个需要讨论)
            "address_list": [],
            "payment_type": "", //支付方式：Unknow(未选择),Alipay(支付宝)
            "express_type": "", //配送方式：Unknow(未选择),Express(快递)
            "invoice_type": "", //发票：Unknow(未选择),Items(明细)
            "invoice_title": null, //发票抬头(个人或公司全称)
            "total_amount": 0, //订单总金额
            "promotion_amount": 0,
            "discount_amount": 0, //订单总优惠
            "wallet_balance": 0,
            "coupons": [], //可用的优惠券列表
            "item_count": 0, //商品数量(1个sku买2个，只算1个)
            "sheets": [],
            "exchange_amount": 0, //购物车中可以使用的所有元宝金额
            "wallet_used": true, //用户选择是否使用元宝抵扣


            // 自定义
            "goods": [],
            "selectAll": true
        },

        initialize: function (options) {
            var self = this;

            self.ACTION = {
                'MODIFY_QTY': 1,
                'REMOVE_GOODS': 2,
                'ADD_CHECKED_GOODS': 3,
                'REMOVE_CHECKED_GOODS': 4,
                'MODIFY_MESSAGE': 5,
                'MODIFY_GOLD': 6,
                'SET_ADDRESS_ID': 7,
                'MODIFY_PROMOTION': 8,
                'SET_COUPON_ID': 9,
                'SET_INVOICE': 10
            };

            options = options || {};

            self.dataMode = options.mode || 'mini';

            // 是否从服务器那里获取过checkout数据
            self.isDataComplete = false;

            // null表示还没有选择 []表示全部取消
            self.selectedItemIds = _.isArray(options.selectedIds) ? self.parseIds(options.selectedIds) : null;

            self.on('sync', function () {
                if (self.dataMode === 'checkout') {
                    self.isDataComplete = true;
                }
            })

        },

        sync: function (method, model, options) {

            var self = this;

            var params = {
                type: 'GET',
                dataType: 'json'
            };


            if (method === 'update') {

                // 选择商品不需要服务器交互
                if (options.action === self.ACTION.ADD_CHECKED_GOODS) {

                    var ids = _.isArray(options.id) ? options.id : [options.id];
                    self.setGoodsSelect(ids);
                    self.countShop();
                    self.trigger('select', ids);
                    self.trigger('changeGoodsSelect', self.selectedItemIds);
                    return false;

                } else if (options.action === self.ACTION.REMOVE_CHECKED_GOODS) {

                    var ids = _.isArray(options.id) ? options.id : [options.id];
                    self.setGoodsCancel(ids);
                    self.countShop();
                    self.trigger('cancel', ids);
                    self.trigger('changeGoodsSelect', self.selectedItemIds);
                    return false;

                } else if (options.action === self.ACTION.MODIFY_QTY) {

                    params.url = '/cart/api/set/' + options.id + '/' + options.qty;

                } else if (options.action === self.ACTION.REMOVE_GOODS) {

                    params.url = '/cart/api/remove/' + options.id;
                    // 去除删除商品的选择
                    self.setGoodsCancel([options.id]);

                } else if (options.action === self.ACTION.MODIFY_MESSAGE) {

                    params.url = '/cart/api/setBuyerMessage/' + options.sheetId
                    params.type = 'POST';
                    // 留言没有确认按钮 提交时不要让用户操作别的对象
                    params.async = false;
                    params.data = {
                        message: options.message
                    };

                } else if (options.action === self.ACTION.MODIFY_GOLD) {

                    params.url = '/cart/api/setWallet/' + (options.used ? 1 : 0);

                } else if (options.action === self.ACTION.SET_ADDRESS_ID) {

                    params.url = '/cart/api/setAddress/' + options.id;

                } else if (options.action === self.ACTION.MODIFY_PROMOTION) { //优惠

                    params.url = '/cart/api/setPromotion/' + options.typeOp + '/' + options.id + '/' + options.apid;

                } else if (options.action === self.ACTION.SET_COUPON_ID) { //优惠券

                    params.url = '/cart/api/setCoupon/' + options.shopId + '/' + options.couponId;

                } else if (options.action === self.ACTION.SET_INVOICE) { //发票

                    params.url = '/cart/api/setInvoice/' + options.invoiceType + '/' + options.invoiceTitle;
                }

                params.url = params.url + "?type=" + self.dataMode + '&itemIds=' + self.selectedItemIds.join(',');

            } else if (method === 'read') {
                params.url = '/cart/api/' + self.dataMode + '?itemIds=' + (self.selectedItemIds ? self.selectedItemIds.join(',') : '');
            }

            params.url = params.url + '&d=' + (new Date()).getTime();

            return $.ajax(_.extend(params, options));
        },
        setMode: function (mode) {
            this.dataMode = mode;
        },
        setSelectedIds: function (ids) {
            if (ids && ids.length) {
                this.selectedItemIds = this.parseIds(ids);
            }
        },
        setGoodsSelect: function (ids) {
            var self = this;
            var _ids = [];
            _.each(ids, function (id) {
                var goods = self.getGoods(id)
                if (goods && goods.item_type === 'Sku') {
                    goods.checked = true;
                    _ids.push(id);
                }
            });

            self.selectedItemIds = _.union(self.selectedItemIds, _ids);
        },
        setGoodsCancel: function (ids) {
            var self = this;
            var _ids = [];
            _.each(ids, function (id) {
                var goods = self.getGoods(id)
                if (goods && goods.item_type === 'Sku') {
                    goods.checked = false;
                    _ids.push(id);
                }
            });

            self.selectedItemIds = _.difference(self.selectedItemIds, _ids);
        },
        getGoods: function (id) {
            var self = this;
            var all = self.get('goods');
            var findOne = null;

            findOne = _.filter(all, function (goods) {
                return goods.id === id;
            });

            return findOne[0];
        },
        getShop: function (id) {
            var self = this;
            var all = self.get('sheets');
            var findOne = null;

            return _.find(all, function (shop) {
                return shop.id === id;
            });
        },
        getShopGoodsIds: function (shopId) {
            var self = this;
            var shops = self.get('sheets');

            var shop = _.find(shops, function (shop) {
                return shop.id === shopId;
            })

            return _.reduce(shop.items, function (memo, item) {
                memo.push(item.id);
                return memo;
            }, []);
        },
        getCheckedGoods: function (isSKU) {
            var all = this.get('goods');
            return _.filter(all, function (item) {
                return item.checked;
            })
        },
        getCurAddress: function (address_id) {
            var self = this;
            var addressId = address_id || self.get('address_id');
            var addressList = self.get('address_list');

            return _.find(addressList, function (item) {
                return item.ua_id === addressId;
            });

        },
        // 选择商品时会造成店铺及全选状态改变 (没有通过服务端数据)
        // **注意** 此处代码只用于sheet界面上用户选择商品。
        countShop: function () {
            var self = this;
            var shops = self.get('sheets');

            var selectAll = true;

            // 所有商品的优惠普通价小计
            var promotion_amount = 0;
            // 所有商品可使用兑换价小计
            var exchange_amount = 0;

            // **注意** 上面两项是重叠计算的，一个商品要么用元宝支付要么用现金支付

            // 订单优惠后的总金额（包含了运费）
            var total_amount = 0;
            // 用户实际能兑换的总数量（余额原因，只有checkout接口中才有意义）
            var exchange_useful = 0;
            // 最终用户需支付金额
            var pay_amount = 0;

            _.each(shops, function (shop) {

                shop.checked = true;
                shop.haveChecked = false;

                shop.promotion_amount = 0;
                shop.exchange_amount = 0;

                _.each(shop.items, function (item) {

                    shop.promotion_amount = shop.promotion_amount + item.promotion_amount;
                    shop.exchange_amount = shop.exchange_amount + item.exchange_amount;

                    shop.checked = (!item.isSku || item.checked) && shop.checked;
                    shop.haveChecked = (item.isSku && item.checked) || shop.haveChecked;
                    selectAll = selectAll && shop.checked;
                });

                // 因为只在list接口即购物车清单页使用，运费都是0，不在计算之列
                shop.pay_amount = shop.promotion_amount - shop.exchange_amount;

                promotion_amount = promotion_amount + shop.promotion_amount;
                exchange_amount = exchange_amount + shop.exchange_amount;
                total_amount = total_amount + promotion_amount + shop.freight;

            });

            self.set({
                'selectAll': selectAll,
                'promotion_amount': promotion_amount,
                'exchange_amount': exchange_amount,
                'total_amount': total_amount,
                'exchange_useful': exchange_useful,
                'pay_amount': promotion_amount - exchange_amount
            }, {
                silent: true
            });
        },
        parseIds: function (ids) {
            return ids ? _.uniq(_.map((_.isString(ids) ? ids.split(',') : ids), function (item) {
                return parseInt(item, 10)
            })) : [];
        },
        parse: function (response, options) {
            var self = this;

            if (response.err_code && response.err_code > 0) {
                utils.error(response.err_msg);
                return false;
            }

            var userNoSelect = self.selectedItemIds === null;

            if (userNoSelect) {
                self.selectedItemIds = [];
            }

            // 没有ID系统认为这个 model总是新的
            response.id = 1;

            var goodsAll = response.goods = [];
            response.selectAll = true;
            response.haveAddress = response.address_list.length > 0;
            _.each(response.sheets, function (shop) {
                // 是否全选
                shop.checked = true;
                // 是否有选择
                shop.haveChecked = false;
                //是否有店铺优惠
                shop.isPromotion = shop.promotion_list.length > 0;
                // 正在使用的优惠券
                shop.useCouponCode = '';


                shop.pay_amount = shop.promotion_amount - shop.exchange_amount + (shop.free_freight ? 0 : shop.freight);

                var count = 0;

                _.each(shop.items, function (item) {

                    goodsAll.push(item);

                    // 正常商品的判断
                    item.isSku = item.item_type === "Sku";
                    item.isPromotion = item.promotion_list.length > 0;
                    item.isQtyMin = item.qty === 1;
                    item.isQtyMax = item.qty === item.stock;

                    // 是否使用元宝价显示
                    item.isUseExchangePrice = item.exchange_price > 0;

                    item.checked = (userNoSelect ? true : _.indexOf(self.selectedItemIds, item.id) !== -1) || !item.isSku;

                    shop.checked = (!item.isSku || item.checked) && shop.checked;
                    shop.haveChecked = (item.isSku && item.checked) || shop.haveChecked;

                    response.selectAll = shop.checked && response.selectAll;

                    if (userNoSelect && item.isSku) {
                        self.selectedItemIds.push(item.id);
                    }

                    count = count + item.qty;
                });

                shop.count = count;

                var selectedCouponId = shop.coupon_id;
                _.each(shop.coupon_list, function (item) {
                    item.selected = item.coupon_id == selectedCouponId;
                    if (item.selected) {
                        shop.useCouponCode = item.show_code;
                    }
                });


            });

            return response;
        }

    });


    module.exports = CartModel;


});