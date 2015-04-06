define(function (require, exports, module) {

    "use strict";

    var $ = require('zepto');
    var Backbone = require("gallery/backbone/1.1.0/backbone");
    var _ = require("gallery/underscore/1.6.0/underscore");
    var Handlebars = require('gallery/handlebars/1.3.0/handlebars');

    var addressListViewTemplate = Handlebars.compile($("#addressListView-template").html())

    var utils = require('./utils');

    var AddressListView = Backbone.View.extend({
        events: utils.evnetCheck({
            'tap .j_select': 'checkAddressEvent'
        }),
        initialize: function () {
            var self = this;

            self.model.on('change', function () {
                self.render();
            });

            self.render();

        },
        render: function () {
            var self = this;
            var model = self.model;
            var addressList = model.get('address_list');
            var selectedId = model.get('address_id');

            _.each(addressList, function (item) {
                item.selected = item.ua_id === selectedId;
            });

            self.$el.html(addressListViewTemplate({
                list: addressList,
                isEmpty: addressList.length === 0,
                selectedIds:model.selectedItemIds.join(',')
            }));

        },
        checkAddressEvent: function (event) {
            var self = this;
            var addressId = $(event.currentTarget).data("id");

            utils.loading(self.model.save({}, {
                "action": self.model.ACTION.SET_ADDRESS_ID,
                "id": addressId,
                "success": function () {
                    self.trigger('selected', addressId);
                }
            }));
        }
    });

    module.exports = AddressListView;

});