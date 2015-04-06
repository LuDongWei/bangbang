define(function (require, exports, module) {

    'use strict';

    var $ = require('zepto');
    
    var Handlebars = require('gallery/handlebars/1.3.0/handlebars');

    var Global = require('global/global');

    var utils = exports;

    var errorTimer;

    utils.error = function (message) {

        clearTimeout(errorTimer);
        var handMessage = $('body').find('.hand-message');

        if (handMessage.length) {
            handMessage.show().css({
                top: "-60px"
            });
        } else {
            handMessage = $(document.createElement('div')).addClass('hand-message').html('<div class="message-close"></div><div class="message-content"></div>');
            handMessage.find('.message-close').on('click', function () {
                handMessage.css({
                    top: "-60px"
                });
                errorTimer = setTimeout(function () {
                    handMessage.hide();
                }, 3000)
            });
            handMessage.appendTo('body');
        }

        setTimeout(function () {
            handMessage.css({
                top: "0px"
            });

            handMessage.find('.message-content').html(message);
        }, 5);

    };

    utils.loading = function (ajax) {
		var timer = setTimeout(function () {
			$('.loading-box').css({
				"height": $(window).height(),
				"top": $(window).scrollTop()
			}).show();
		}, 800)
        
        if (ajax && ajax.always) {
            ajax.always(function () {
                $('.loading-box').hide();
				clearTimeout(timer)
            });
        } else {
            $('.loading-box').hide();
			clearTimeout(timer)
        }

        return ajax;
    };


    utils.iframeLink = function (path) {
        var ifm = document.createElement('iframe');
        var body = document.body || document.getElementsByTagName('body')[0];
        ifm.width = 0;
        ifm.height = 0;
        ifm.style.visibility = 'hidden';
        ifm.src = path;

        body.appendChild(ifm);

        setTimeout(function () {
            ifm.remove();
        }, 1000);
    };

    utils.evnetCheck = function (eventsMap) {

        var isMobile = Global.device.iphone || Global.device.android || Global.device.wphone;

        if (isMobile) {
            return eventsMap;
        }

        var newEventsMap = {};

        for (var eventName in eventsMap) {
            newEventsMap[eventName.replace(/^(tap|touchend)\s/, 'click ')] = eventsMap[eventName];
        }

        return newEventsMap;

    }

    Handlebars.registerHelper('priceFormat', function (price) {
        var p = parseFloat(price, 10);
        return new Handlebars.SafeString(isNaN(p) ? price : p.toFixed(2));
    });


});