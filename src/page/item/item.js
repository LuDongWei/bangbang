define(function (require, exports, module) {

    'use strict';

    var $ = require('zepto');
    var Swipe = require("gallery/swipejs/2.0.1/swipe");

    var Global = require('global/global');

    var WIN = window;
    var GOODS_ADD_FAV_API = '/api/index?method=skufavorite.add&skuid=';
    var GOODS_REMOVE_FAV_API = '/api/index?method=skufavorite.remove&skuid=';
    var SHOP_ADD_FAV_API = '/api/index?method=shopfavorite.add&shopid=';
    var SHOP_REMOVE_FAV_API = '/api/index?method=shopfavorite.remove&shopid='

    // 滚动
    var sliderNav = document.getElementById('slider-nav').getElementsByTagName('li');
    sliderNav[0].className = 'on';

    var swipe = Swipe.create(document.getElementById('slider'), {
        auto: 3000,
        speed: 500,
        continuous: true,
        callback: function (pos, slide) {
            var i = sliderNav.length;
            var index = pos;
            if (i === 2 && index >= 2) {
                index = pos - 2;
            }
            while (i--) {
                sliderNav[i].className = ' ';
            }
            sliderNav[index].className = 'on';
        }
    });
    
        //点击查看更多图片
        $("a.unLazy").click(function () {
			if($("img.lazy").length==0){
				$(".info-hide").show();
				$(".info-do-show").hide()
				return;
			}
            $("img.lazy").each(function () {
                $(this).attr("src", $(this).attr("data-original")).bind('load error', function () {
                    $(".info-hide").show();
                    $(".info-do-show").hide()
                })
            }),
            $(".info-do-show").html("<div class='loading'>&nbsp;&nbsp;&nbsp;正在加载中！</div>");
        });

        //是否已经滚动到底部
        function isFull() {
            var srollPos = $(window).scrollTop(); //滚动条距离顶部的高度
            var windowHeight = $(window).height(); //窗口的高度
            var dbHiht = $("body").height(); //整个页面文件的高度
            if (srollPos + windowHeight >= dbHiht) return true;
            return false;
        };
        
        //绑定显示滑动事件
        var step = 1;
        $(window).scroll(function () {
            if (step == 1 && isFull()) {
                step++;
                setTimeout(function () {
                    document.addEventListener("touchmove", function (e) {
                        // /^(?:INPUT|TEXTAREA|A)$/.test(e.target.tagName) || e.preventDefault();
                        if (step == 2 && isFull()) {
                            $(".unLazy").click();
                        }
                    });
                }, 200);
            }
        });

    // 商品收藏
    $("#j_fav_goods").on('click', function () {
        var btn = $(this);
        var sku = btn.data('sku');
        var isFaved = btn.hasClass('fav-active');

        isFaved ? btn.html("&#xe605; 收藏") : btn.html("&#xe605; 取消收藏");
        
        btn.toggleClass('fav-active', !isFaved);

        $.get((isFaved ? GOODS_REMOVE_FAV_API : GOODS_ADD_FAV_API) + sku);
        return false;
    });


    // 店铺收藏
    $("#j_fav_shop").on('click', function () {
        var btn = $(this);
        var shopId = btn.data('shopid');
        var icon = btn.find('.iconfont');
        var isFaved = icon.hasClass('fav-active');

        icon.toggleClass('fav-active', !isFaved);

        $.get((isFaved ? SHOP_REMOVE_FAV_API : SHOP_ADD_FAV_API) + shopId);
        return false;
    });


    // 修改数量
    var $buyNum = $("#buyNum");

    $buyNum.on('change', function () {
        var num = parseInt($buyNum.val(), 10);
        if (isNaN(num)) {
            num = 1;
        }
        renderBuyLink(num);
    });

    $("#J_g_quantity_sub").on('click', function () {
        var num = parseInt($buyNum.val(), 10);
        if (num > 1) {
            var newNum = num - 1;
            renderBuyLink(newNum);
        }

        return false;
    })

    $("#J_g_quantity_add").on('click', function () {
        var num = parseInt($buyNum.val(), 10);
        var newNum = num + 1;
        renderBuyLink(newNum);
        return false;
    });

    function renderBuyLink(qty) {
        if (qty > WIN.goods.StockQty) {
            WIN.alert('已经超过最大的购买数量');
            qty = WIN.goods.StockQty;
        }

        $buyNum.val(qty);
        var buyNowlink = $("#j_buy_now_btn").attr('href');
        var addCartlink = $("#j_add_btn").attr('href');
        $("#j_buy_now_btn").attr('href', buyNowlink.replace(/[0-9]+$/i, qty));
        $("#j_add_btn").attr('href', addCartlink.replace(/[0-9]+$/i, qty));
    }

    // 加入购物车
    var adding = false;
    $("#j_add_btn").on('click', function () {
        if (adding) {
            return false;
        }
        var api = $(this).attr('href');
        adding = true;

        addAnimation();

        $.ajax({
            type: "GET",
            dataType: 'json',
            url: api,
            success: function (data) {
                if (data.err_code && data.err_code > 0) {
                    WIN.alert('添加失败，请稍后重试！');
                } else {
                    Global.updateMinCart()
                }
                adding = false;
            }
        });
        return false;
    });

    function addAnimation() {
        var pic = $('#slider').find('img').eq(0).attr('src');
        var aniWarp = '<div style="width:320px;height:320px;position:absolute;top:30px;right:50%;margin-right:-160px;z-index:10000000;-webkit-transition: all .5s ease-out;-o-transition: all .5s ease-out;transition: all .5s ease-out;"><img src="' + pic + '" width="100%" height="100%"/></div>';

        var goodsPic = $(aniWarp).appendTo('body');

        setTimeout(function () {
            goodsPic.css({
                "top": "10px",
                "right": "15px",
                '-webkit-transform': 'scale(0,0)',
                "transform": 'scale(0,0)',
                '-webkit-transform-origin': "top right",
                'transform-origin': "top right",
                'margin-right': '0'
            });
        }, 50)
    }

});