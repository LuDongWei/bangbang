// module name

define(function (require, exports, module) {

    'use strict';

    var $ = require('zepto/zepto/1.1.2/zepto');
    var Cookie = require('gallery/cookie/1.0.2/cookie')


    var global = exports;

    var MIN_CART_API = '/cart/api/mini'

    //获取cookie
    function getCookie(name) {
        var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
        if (arr = document.cookie.match(reg)) {
            if (name == "login_username") return arr[2];
            return unescape(arr[2]);
    
        }
        else
            return null;
    }
    
    //获取cookie参数值
    function getCookieParam(name1, name2) {
        var attrs = getCookie(name1);
        if (attrs) {
            attrs=attrs.split("&");
            for (var i = 0; i < attrs.length; i++) {
                var attr = attrs[i].split("=")
                if (name2 == attr[0]) {
                    return attr[1];
                }
            }    
        }
    
        return null;
    }
    
    global.updateMinCart = function () {
        var mCount = getCookieParam("cart", "count");
        mCount || (mCount = 0);
        $("#J-cart-num").html(mCount);
    }


    var utils = global.utils = {};

    var errorTimer;

    utils.error = function (message) {

        message = message.substr(message.indexOf(":") + 1);

        clearTimeout(errorTimer);
        var handMessage = $('body').find('.hand-message');

        if (handMessage.length) {
            handMessage.show().css({
                top: "-0.6rem"
            });
        } else {
            handMessage = $(document.createElement('div')).addClass('hand-message').html('<div class="message-close"></div><div class="message-content"></div>');
            handMessage.find('.message-close').on('click', function () {
                handMessage.css({
                    top: "-0.6rem"
                });
                errorTimer = setTimeout(function () {
                    handMessage.hide();
                }, 3000)
            });
            handMessage.appendTo('body');
        }

        setTimeout(function () {
            handMessage.css({
                top: "0rem"
            });

            handMessage.find('.message-content').html(message);
        }, 5);


    };

    utils.loading = function (ajax) {
        $('.loading-box').css({
            "height": $(window).height(),
            "top": $(window).scrollTop()
        }).show();

        if (ajax && ajax.always) {
            ajax.always(function () {
                $('.loading-box').hide();
            });
        } else {
            $('.loading-box').hide();
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

    (function (g) {

        var device = g.device = {};
        var ua = navigator.userAgent.toLowerCase();

        // Useragent RegExp
        var riphone = /iphone/gi;
        var randroid = /android/gi;
        var rucweb = /ucbrowser/gi;
        var ripad = /ipad/gi;
        var rweixin = /micromessenger/gi;
        var rwphone = /iemobile/gi;


        device.iphone = riphone.test(ua);
        device.android = randroid.test(ua);
        device.ucweb = rucweb.test(ua);
        device.ipad = ripad.test(ua);
        device.weixin = rweixin.test(ua);
        device.wphone = rwphone.test(ua);

    })(global);



    /*   通用行为   */
    $(function () {

        // 删除提示
        $('body').on('click', '.delete-confirm', function () {
            var url = $(this).attr('href');
            if (window.confirm('您是否确定删除？')) {
                window.location.href = url;
            }
            return false;
        });

        // 迷你购物车
        global.updateMinCart();

        //搜索
        $(".search-logo").click(function () {
            $("#search-form").submit();
        })
    });



});