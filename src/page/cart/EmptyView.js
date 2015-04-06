define(function (require, exports, module) {

    "use strict";

    var Backbone   = require('gallery/backbone/1.1.0/backbone');
	var Handlebars = require('gallery/handlebars/1.3.0/handlebars');
	
    var $ = require('zepto');

    var template = Handlebars.compile($("#cartEmptyView-template").html());
	
    var EmptyView = Backbone.View.extend({
        initialize: function () {
            this.render();
        },
        render: function () {
            this.$el.html(template({}));
        }
    });

    module.exports = EmptyView;

});