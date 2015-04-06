define(function (require, exports, module) {

    "use strict";

    var WIN = window;

    var $ = require('jquery');
    var Backbone = require("gallery/backbone/1.1.0/backbone");
    var _ = require("gallery/underscore/1.6.0/underscore");
    var Handlebars = require('gallery/handlebars/1.3.0/handlebars');

    var Region = require("gallery/region/1.0.0/region");

    var addressViewTemplate = Handlebars.compile($("#addressView-template").html())

    var utils = require('./utils');

    var AddressListView = Backbone.View.extend({
        events: utils.evnetCheck({
            'click .addr': 'checkAddressEvent',
            'click .j_add_new': 'addAddressEvent',
            'click .j_edit_btn': 'editAddressEvent',
            'click .j_save_btn': 'saveAddressEvent',
            'click .j_cancel_btn': 'cancelAddressEvent'

        }),
        initialize: function () {
            var self = this;

            self.model.on('change', function () {
                self.render();
            });

        },
        render: function (editAddress) {
            var self = this;
            var model = self.model;
            var addressList = model.get('address_list');
            var selectedId = model.get('address_id');

            _.each(addressList, function (item) {
                item.checked = item.ua_id === selectedId;
            });

            var showEdit = editAddress || false;
            var editAddress = editAddress || {};

            var region = new Region({
                target: "#span_region_linkage",
                inputId: ["#j_stateid", "#j_cityid", "#j_districtid"]
            });

            region.on("selected", function (data) {
                if (!data) {
                    return;
                } else if (data.type === "province") {
                    $("#j_stateid").val(data.id);
                    $("#j_state").val(data.name)
                } else if (data.type === "city") {
                    $("#j_cityid").val(data.id);
                    $("#j_city").val(data.name)
                } else if (data.type === 'district') {
                    $("#j_districtid").val(data.id);
                    $("#j_district").val(data.name)
                }
            });

            self.$el.html(addressViewTemplate({
                adressList: addressList,
                isEmpty: addressList.length === 0,
                selectedIds: model.selectedItemIds.join(','),
                editAddress: editAddress,
                showEdit: showEdit
            }));

            setTimeout(function () {
                region.init([$("#j_stateid").val(), $("#j_cityid").val(), $("#j_districtid").val()]);
            }, 10);

        },
        checkAddressEvent: function (event) {
            var self = this;
            var addressId = $(event.currentTarget).val();
            self.checkSetAddressEvent(addressId);
        },
        checkSetAddressEvent: function (addressId) {
            var self = this;
            utils.loading(self.model.save({}, {
                "action": self.model.ACTION.SET_ADDRESS_ID,
                "id": addressId
            })).done(function () {
                self.trigger('selected', addressId);
            });
        },
        addAddressEvent: function (event) {
            var self = this;
            var addressData = {}
            self.render(addressData);
            return false;
        },
        editAddressEvent: function (event) {
            var self = this;
            var addressId = $(event.currentTarget).data('id');
            var addressData = self.model.getCurAddress(parseInt(addressId, 10)) || {};
            self.render(addressData);
            return false;
        },
        saveAddressEvent: function (event) {
            var self = this;
            var model = self.model;

            var addressId = $(event.currentTarget).data('uaid');

            var realname = $('#j_name', self.el).val(),
                mobile = $('#j_mobile', self.el).val(),
                phone = $('#j_phone', self.el).val(),
                provinceId = $('#j_stateid', self.el).val(),
                province = $('#j_state', self.el).val(),
                cityId = $('#j_cityid', self.el).val(),
                city = $('#j_city', self.el).val(),
                districtId = $('#j_districtid', self.el).val(),
                district = $('#j_district', self.el).val(),
                //postcode = $('#j_postcode', self.el).val(),
                address = $('#j_address', self.el).val();


            var api = addressId ? '/mapi/address/set?id=' + addressId : '/mapi/address/add';

            $.ajax({
                type: "POST",
                dataType: 'json',
                url: api,
                data: {
                    "receiver_name": realname,
                    "receiver_mobile": mobile,
                    "receiver_phone": phone,
                    "state_id": provinceId,
                    "state": province,
                    "city_id": cityId,
                    "city": city,
                    "district_id": districtId,
                    "district": district,
                    "address": address
                },
                success: function (json) {
                    if (json.err_code === 0) {
                        self.checkSetAddressEvent(json.data);
                    } else {
                        WIN.alert(json.err_msg);
                    }
                }
            })

            return false;
        },
        cancelAddressEvent: function (event) {
            var self = this;
            self.render();
        }

    });

    module.exports = AddressListView;

});