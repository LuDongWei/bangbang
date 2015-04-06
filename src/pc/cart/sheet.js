define(function (require, exports, module) {

    'use strict';

    var $ = require('jquery');

    var CartModel = require('./CartModel');
    var SheetView = require('./SheetView');

    var utils = require('./utils');

    var cartModel = new CartModel({
        mode: "list"
    });

    var sheetView = new SheetView({
        model: cartModel
    });


    $('#j-container').empty().append(sheetView.el);

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