define(function (require, exports, module) {

    'use strict';
	
	var WIN = window;
	
    var $ = require('zepto');
    var Backbone = require('gallery/backbone/1.1.0/backbone');
    var Handlebars = require('gallery/handlebars/1.3.0/handlebars');
    var _ = require('gallery/underscore/1.6.0/underscore');

    var utils = require('./utils');

	var invoiceListViewTemplate = Handlebars.compile($("#invoiceListView-template").html());


    var invoiceListView = Backbone.View.extend({
        events: utils.evnetCheck({
            'tap .j_invoice_cancel' : 'invoiceCancelEvent',
            'tap .j_invoice_save'   : 'invoiceSaveEvent'
        }),
        initialize: function (options) {
            var self = this;
            self.model.on('change', function () {
                self.render();
            });
            self.render();
        },
        render: function () {
            var self = this;
            var model = self.model;

			var isInvoice = model.get('invoice_type') === 'Items';
			var invoiceTitle = model.get('invoice_title');

			
			self.$el.html(invoiceListViewTemplate({
                selectedIds:model.selectedItemIds.join(','),
				isInvoice:isInvoice,
				invoiceTitle:invoiceTitle
            }));
        },
		invoiceCancelEvent: function(){
			var self = this;
            var model = self.model;
			utils.loading(self.model.save({}, {
                "action": self.model.ACTION.SET_INVOICE,
                "invoiceType": 'Unknow',
                "invoiceTitle": '',
                "success": function () {
                    self.trigger('selected');
                }
            }));
			
			return false;
		},
		invoiceSaveEvent: function(event){

			var self = this;
            var model = self.model;
			var invoiceTitle = $('#j_invoice_title', self.el).val();

			if(invoiceTitle === ''){
				utils.error('请填写发票抬头');
				return false;
			}
			utils.loading(self.model.save({}, {
                "action": self.model.ACTION.SET_INVOICE,
                "invoiceType": 'Items',
                "invoiceTitle": invoiceTitle,
                "success": function () {
                    self.trigger('selected');
                }
            }));
			
			return false;
		}
    });

    module.exports = invoiceListView;
});