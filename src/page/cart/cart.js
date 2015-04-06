/*
 *  购物车主程序
 */

define(function (require, exports, module) {

    'use strict';

    var WIN = window;
    var $ = require('zepto');
    var Backbone = require('gallery/backbone/1.1.0/backbone');
    var _ = require('gallery/underscore/1.6.0/underscore');
	var Cookie = require('gallery/cookie/1.0.2/cookie')
	
    var CartModel = require('./CartModel');

    var EmptyView = require('./EmptyView');
    var SheetView = require('./SheetView');
    var CheckoutView = require('./CheckoutView');
    var AddressListView = require('./AddressListView');
    var AddressEditView = require('./AddressEditView');
    var CouponListView = require('./CouponListView');
    var InvoiceListView = require('./InvoiceListView');

    var utils = require('./utils');

    var cartModel = new CartModel();

    var CartAppRouter = Backbone.Router.extend({
        routes: {
            '': 'index',
            'index': 'index',
            'sheet(/:ids)': 'sheet',
            'checkout(/:ids)': 'checkout',
            'address/list(/:ids)': 'addressList',
            'address/edit/:ids/:id': 'editAddress',
            'address/new(/:ids)': 'editAddress',
            'coupon/:sheetId(/:ids)': 'couponList',
            'invoice(/:ids)': 'editInvoice'
        },
        initialize: function () {
            var self = this;
        },
        index: function () {
            var self = this;

            cartModel.setMode('mini');

            if (cartModel.isDataComplete) {
                needShowEmpty();
            } else {
                cartModel.fetch({
                    trigger: true
                }).done(function () {
                    $('#container').removeClass('loading-bg');
                    needShowEmpty();
                });
            }

            function needShowEmpty() {
                if (cartModel.get('sheets').length) {
                    self.navigate('sheet', {
                        trigger: true,
                        replace: true
                    });
                } else {
                    var emptyView = new EmptyView();
                    $('#J-shopping-cart').empty().append(emptyView.el);
                }
            }

            cartModel.isDataComplete = false;

        },
        sheet: function (ids) {
            var self = this;

            var _ids = cartModel.parseIds(ids);

            cartModel.setMode('list');
            cartModel.setSelectedIds(_ids);

            var sheetView = new SheetView({
                model: cartModel
            });

            $('#J-shopping-cart').empty().append(sheetView.el);

            cartModel.on('changeGoodsSelect', function (ids) {
                self.navigate('sheet' + (_ids.length ? '/' + _ids.join(',') : ''), {
                    trigger: false,
                    replace: true
                });
            })

            !cartModel.isDataComplete && cartModel.fetch({
                trigger: true
            }).done(function () {
                $('#container').removeClass('loading-bg');
            });

            cartModel.isDataComplete = false;

        },
        checkout: function (ids) {
            var self = this;
			
			
			var loginUserId = Cookie.get('login_userid');
			var loginOnlineType = Cookie.get('online_type');
			
			var isLogin = function(){//判断登录
				
				return loginUserId > 0 && loginOnlineType == 2;
				
			}
			
			if (!isLogin()) {
				WIN.location.href = 'user/login?referer_url=' + encodeURIComponent(WIN.location.href);
                return;
            }
			
            var _ids = cartModel.parseIds(ids);

            cartModel.setMode('checkout');
            cartModel.setSelectedIds(_ids)

            var checkoutView = new CheckoutView({
                model: cartModel
            });

            $('#J-shopping-cart').empty().append(checkoutView.el);


            !cartModel.isDataComplete && cartModel.fetch({
                trigger: true
            }).done(function () {
                $('#container').removeClass('loading-bg');
            });

        },
        addressList: function (ids) {
            var self = this;

            var _ids = cartModel.parseIds(ids);

            cartModel.setMode('checkout');
            cartModel.setSelectedIds(_ids)

            var addressListView = new AddressListView({
                model: cartModel
            });

            addressListView.on('selected', function () {
                self.navigate('checkout' + (_ids.length ? '/' + _ids.join(',') : ''), {
                    trigger: true,
                    replace: true
                });
            });

            $('#J-shopping-cart').empty().append(addressListView.el);

            !cartModel.isDataComplete && cartModel.fetch({
                trigger: true
            }).done(function () {
                $('#container').removeClass('loading-bg');
            });
        },
        //地址编辑
        editAddress: function (ids, id) {
            var self = this;
            var _ids = cartModel.parseIds(ids);

            cartModel.setMode('checkout');
            cartModel.setSelectedIds(_ids)

            var addressEditView = new AddressEditView({
                model: cartModel,
                id: id
            });

            addressEditView.on('selected', function () {
                self.navigate('checkout' + (_ids.length ? '/' + _ids.join(',') : ''), {
                    trigger: true,
                    replace: true
                });
            });

            $('#J-shopping-cart').empty().append(addressEditView.el);

            !cartModel.isDataComplete && cartModel.fetch({
                trigger: true
            }).done(function () {
                $('#container').removeClass('loading-bg');
            });

        },
        //优惠券
        couponList: function (sheetId, ids) {
            var self = this;

            var _ids = cartModel.parseIds(ids);

            cartModel.setMode('checkout');
            cartModel.setSelectedIds(_ids)

            var couponListView = new CouponListView({
                model: cartModel,
                selectedSheetId: sheetId
            });

            couponListView.on('selected', function () {
                self.navigate('checkout' + (_ids.length ? '/' + _ids.join(',') : ''), {
                    trigger: true,
                    replace: true
                });
            });

            $('#J-shopping-cart').empty().append(couponListView.el);

            !cartModel.isDataComplete && cartModel.fetch({
                trigger: true
            }).done(function () {
                $('#container').removeClass('loading-bg');
            });


        },

        //发票
        editInvoice: function (ids) {
            var self = this;

            var _ids = cartModel.parseIds(ids);

            cartModel.setMode('checkout');
            cartModel.setSelectedIds(_ids)

            var invoiceListView = new InvoiceListView({
                model: cartModel
            });

            invoiceListView.on('selected', function () {
                self.navigate('checkout' + (_ids.length ? '/' + _ids.join(',') : ''), {
                    trigger: true,
                    replace: true
                });
            });
            $('#J-shopping-cart').empty().append(invoiceListView.el);

            !cartModel.isDataComplete && cartModel.fetch({
                trigger: true
            }).done(function () {
                $('#container').removeClass('loading-bg');
            });

        }

    });


    var cartAppRouter = new CartAppRouter();

    cartModel.on('change', function () {
        if (!cartModel.get('sheets').length) {
            cartAppRouter.navigate('index', {
                trigger: true,
                replace: true
            });
        }
    });

    Backbone.history.start();

    cartAppRouter.on('route', function () {
        console.log('onRoute');
        $("body").scrollTop(0);
    });


});

