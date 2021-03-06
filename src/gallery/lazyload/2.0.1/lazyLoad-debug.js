// !图片延迟加载来自腾讯
define("gallery/lazyload/2.0.1/lazyLoad-debug", ["jquery-debug"], function (require, exports, module) {
    var $ = require('jquery-debug');

    var win = $(window)

    var lazy = {
        flag: "data-oxlazy",
        init: function () {
            
            var items = this.items = [];

            $("[" + this.flag + "]").each(function(index, item){
                items.push(item);
            });

            this.cnt = items.length;

            if (this.cnt === 0) {
                return false;
            }

            win.bind("scroll.oxlazy", function (d) {
                lazy.detect();
            }).bind("resize.oxlazy", function (d) {
                lazy.detect();
            });
        },
        detect: function () {
            var newitems = [];
            for (var i = 0; i < this.cnt; i++) {
                if (!lazy.rock(this.items[i])) {
                    newitems.push(this.items[i]);
                }
            };
            this.items = newitems;
            this.cnt = this.items.length
        },
        isInView: function (data) {
            var data_ = $(data);
            var offset = data_.offset();
            var top = offset.top - win.scrollTop();
            var height = win.height();
            var height_ = -(data_.height());

            if ((top < height_) || (top >= height)) {
                return false;
            }
            return data_;
        },
        rock: function (data) {
            var h = data.getAttribute(this.flag);
            if ((!h) || (h === "")) {
                return false;
            }
            var f = this.isInView(data);
            if (!f) {
                return false;
            }

            var ifimg = data.tagName === "IMG";
            var ififrame = data.tagName === "IFRAME";
            var g = data.getAttribute(this.flag + "-timestamp") === "1"
            var d = g ? ("?t=" + this.getTimeStamp()) : "";
            h = h + d;

            if (ifimg || ififrame) {
                data.setAttribute("src", h);
            } else {
                f.css("background-image", "url(" + h + ")");
            }
            data.removeAttribute(this.flag);
            return true
        },
        getTimeStamp: function () {
            var d = new Date();
            return (d.getFullYear() + "" + d.getMonth() + "" + d.getDate());
        }
    }

    $(function () {
        lazy.init();
        lazy.detect();
    });

    return lazy;
});