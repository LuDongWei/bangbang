//list or search   by douban
define('page/list/list', function (require, exports, module) {

    var $ = require('jquery/jquery/1.7.2/jquery');

    $(".page-handle").click(function () {
        return false;
    });
    $("#score-page-selector").change(function () {
        var url = $(this).parent().attr("href");
        var value = $(this).val();
        var pageHref = changeURLPar(url, "_pgix", value);
        window.location.href = pageHref;
    });

    function changeURLPar(destiny, par, par_value) {
        var pattern = par + "=([^&]*)";
        var replaceText = par + "=" + par_value;
        if (destiny.match(pattern)) {
            var tmp = "/\\" + par + "=[^&]*/";
            tmp = destiny.replace(eval(tmp), replaceText);
            return tmp;
        } else {
            if (destiny.match("[?]")) {
                return destiny + "&" + replaceText;
            } else {
                return destiny + "?" + replaceText;
            }
        }
        return destiny + "\n" + par + "\n" + par_value;
    }

    $(function () {
        $(".goodList-orderby li").click(function () {
            var orderNum = $(".goodList-orderby li").index($(this));
            switch (orderNum) {
                case 0:
                    window.location = "/list/index?stxt=" + escape($("#stxt").val()) + "&cid=" + $("#cid").val() + "&sort=u";
                    break;
                case 1:
                    window.location = "/list/index?stxt=" + escape($("#stxt").val()) + "&cid=" + $("#cid").val() + "&sort=s";
                    break;
                case 2:
                    window.location = "/list/index?stxt=" + escape($("#stxt").val()) + "&cid=" + $("#cid").val() + "&sort=n";
                    break;
                case 3:
                    $(".goodList-mask,.goodList-filter").show();
                    /*
                    if ($(this).hasClass("on")) {
                        var pfrom = $("#js-price-form").val();
                        var pto = $("#js-price-to").val();
                        if ($(this).find("i").text() == "&#xe61f;") window.location = "/list/index?sort=pasc";
                        else window.location = "/list/index?sort=pdesc";
                    } else {
                        window.location = "/list/index?sort=pasc&p1=" + pfrom + "&p2=" + pto;
                    }
                    */
                    break;
                    /*
                case 4:
                    $(".goodList-mask,.goodList-filter").show();
                    break;*/
                default: break;
            }
        })//click

        
        $(".goodList-filter a").click(function () {
            $(".goodList-mask,.goodList-filter").hide();
        });

        $("#js-filter-start").click(function () {
            var pfrom = $("#js-price-form").val();
            var pto = $("#js-price-to").val();
            var pOrder = $("input[name='pOrder']:checked").val();
            if (pOrder != "pdesc") pOrder = "pasc";
            window.location = "/list/index?stxt=" + escape($("#stxt").val()) + "&cid=" + $("#cid").val() + "&sort=" + pOrder + "&p1=" + pfrom + "&p2=" + pto;
            //alert("价格从 " + pfrom + " 到 " + pto + "排序：" + pOrder);
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
                            $(".list-display-ctrl").click();
                        }
                    });
                }, 200);
            }
        });

        //点击查看更多图片
        var isLoad = false;
        $(".list-display-ctrl").click(function () {
            if (!isLoad) {
                show();
                isLoad = true;
            }

        });

        //初始化
        var items = $(".defaultList-item").hide();
        var unit = 10;
        var ind = 1;
        function waitShow() {
            if ($(".defaultList-item:hidden").length >0) return true;
            return false;
        }

        //显示
        function show() {
            if (waitShow()) {
                $(".defaultList-item:lt(" + ind * unit + ")").show().find("img.lazy").each(function () {
                    $(this).attr("src", $(this).attr("data-original")).bind('load error', function () {
                        $(".goodList").show();
                        isLoad = false;
                        if (waitShow()) {
                            $(".list-display-load").hide();
                            $(".list-display-ctrl").show();
                        } else {
                            $(".list-display-load").hide();
                            $(".list-display-ctrl").hide();
                            $(".pager").show();
                        }
                    })
                });
                ind++;
            } else {
                $(".list-display-load").hide();
                $(".list-display-ctrl").hide();
                $(".pager").show();
            }
        }
        show();

    })
})