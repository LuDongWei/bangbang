define(function (require, exports, module) {

    'use strict';

    var $ = require('jquery');

    var CartModel = require('./CartModel');

    var GoodsListView = require('./GoodsListView');
    var TotalView = require('./TotalView');
    var GoldView = require('./GoldView');
    var AddressView = require('./AddressView');
    var InvoiceView = require('./InvoiceView');

    var utils = require('./utils');
    var selectedIds = null;

    try {
        selectedIds = location.search.match(/\?itemIds=([0-9\,]+)/i)[1].split(',');
    } catch (e) {}

    if (selectedIds.length == 0) {
        alert('没有选择商品，请返回购物车选择需要下单的商品。');
        location.href = '/cart';
        return false;
    }

    var cartModel = new CartModel({
        mode: "checkout",
        selectedIds: selectedIds
    });

    var addressView = new AddressView({
        model: cartModel
    });

    var goodsListView = new GoodsListView({
        model: cartModel
    });

    var totalView = new TotalView({
        model: cartModel
    });


    var goldView = new GoldView({
        model: cartModel
    });

    // var invoiceView = new InvoiceView({
    //     model: cartModel
    // });


    $('#j-goods-view').empty().append(goodsListView.el);
    $('#j-total-view').empty().append(totalView.el);
    $('#j-gold-view').empty().append(goldView.el);
    // $('#j-invoice-view').empty().append(invoiceView.el);
    $('#j-address-view').empty().append(addressView.el);

    cartModel.on('change', function () {
        if (!cartModel.get("sheets").length) {
            location.href = '/cart/empty';
        }
    });

    cartModel.fetch({
        trigger: true
    }).done(function () {
        $('.loading-box').hide();
    });

});