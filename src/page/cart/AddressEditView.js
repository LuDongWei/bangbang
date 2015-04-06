define(function (require, exports, module) {

    "use strict";

    var WIN = window;

    var $ = require('zepto');
    var Backbone = require("gallery/backbone/1.1.0/backbone");
    var _ = require("gallery/underscore/1.6.0/underscore");
    var Handlebars = require('gallery/handlebars/1.3.0/handlebars');

    var Region = require("gallery/region/1.0.0/region");

    var addressEditViewTemplate = Handlebars.compile($("#addressEditView-template").html());
    var utils = require('./utils');

    var AddressEditView = Backbone.View.extend({
        events: utils.evnetCheck({
            'tap .j-address-save': 'addressSaveEvent'
        }),
        initialize: function (options) {
            var self = this;

            self.addressId = options.id;

            self.model.on('change', function () {
                self.render();
            });

            self.render();
        },
        render: function () {

            var self = this;
            var model = self.model;

            var addressData = {};

            if (self.addressId) {
                var addressData = self.model.getCurAddress(parseInt(self.addressId, 10)) || {};
            }

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

            self.$el.html(addressEditViewTemplate({
                selectedIds: model.selectedItemIds.join(','),
                address: addressData
            }));

            setTimeout(function () {
                if ($('#span_region_linkage .rg-selects').length <= 0) {
                    region.init([$("#j_stateid").val(), $("#j_cityid").val(), $("#j_districtid").val()]);
                }
            }, 10);

        },

        addressSaveEvent: function (event) {

            var self = this;
            var model = self.model;

            var realname = $('#j_name', self.el).val(),
                mobile = $('#j_mobile', self.el).val(),
                phone = $('#j_phone', self.el).val(),
                provinceId = $('#j_stateid', self.el).val(),
                province = $('#j_state', self.el).val(),
                cityId = $('#j_cityid', self.el).val(),
                city = $('#j_city', self.el).val(),
                districtId = $('#j_districtid', self.el).val(),
                district = $('#j_district', self.el).val(),
                postcode = $('#j_postcode', self.el).val(),
                address = $('#j_address', self.el).val();


            var api = self.addressId ? '/mapi/address/set?id=' + self.addressId : '/mapi/address/add';

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
                    "address": address,
                    "postcode": postcode
                },
                success: function (json) {
                    if (json.err_code === 0) {
                        WIN.alert('添加成功!');
                        if (!self.addressId) {
                            utils.loading(model.save({}, {
                                "action": model.ACTION.SET_ADDRESS_ID,
                                "id": json.data
                            })).done(function () {
                                self.trigger('selected', json.data);
                            });
                        }

                    } else {
                        WIN.alert(json.err_msg);
                    }
                }
            })

            return false;
        }
    });

    module.exports = AddressEditView;

});