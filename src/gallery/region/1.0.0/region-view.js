define("gallery/region/1.0.0/region-view", ["jquery","gallery/events/1.0.0/events"],function (require, exports, module) {

    var $ = require("jquery");
    var Events = require("gallery/events/1.0.0/events");

    var View = function (options) {

        var self = this;
        Events.mixTo(self);

        self.types = ["province", "city", "district"];
        self.first = ['请选择省份...', '请选择城市...', '请选择县区...'];

        self.opt = options;
    };

    View.prototype.init = function () {

        var self = this;

        self.dom = $(document.createElement("div")).addClass("rg-selects");

        var html = "";

        for (var i = 0; i < self.types.length; i++) {

             html = html + '<select class="rg-item rg-' + self.types[i] + '" data-type="' + self.types[i] + '" data-first="' + self.first[i] + '"><option>' + self.first[i] + '</option></select>';
               
             //<input type="hidden" value="" class="rg-value" name="' + self.opt.inputName[i] + '" id="' + self.opt.inputId[i] + '"/>
             //html = html + '<div style="z-index:' + (3 - i) + '" ><div class="rg-current"><div class="rg-cur-title" data-first="' + self.first[i] + '">' + self.first[i] + '</div><div class="rg-ico"><i class="rg-arrow"></i></div></div><div class="rg-list" style="z-index:' + (4 - i) + '"></div></div>';
        }

        self.dom.append(html);

        self.dom.on("change", "select", function () {
            var owner = $(this);
            var option = owner.val().split('|');

            var type = option[0];
            var id = option[1];
            var postCode = option[2];
            var name = option[3];

            self.trigger("selected", {
                type: type,
                id: id,
                name: name,
                postCode: postCode
            });
            


            self.trigger("showSelect", nextType(type));

            return false;
        });

        $(self.opt.container).append(self.dom);
    };

    View.prototype.reset = function () {
        var self = this;
        if (arguments.length) {
            for (var i = 0; i < arguments.length; i++) {
                var select = $(".rg-" + arguments[i], self.dom);
                select.find("option").remove();
                select.append('<option class="first-opt">' + select.data("first") + '</option>');
            }
        }
    };

    View.prototype.render = function (type, list, selectedObj) {
        var self = this;
        var html = "";
        

        for (var i = 0, l = list.length; i < l; i++) {
            html = html + '<option ' + (list[i].selected ? 'selected' : '') + ' value="' + type + '|' + list[i].id + '|' + list[i].postCode + '|' + list[i].name + '">' + self.format(list[i].name) + '</option>';
        }

        var select = $(".rg-" + type, self.dom);
        select.append(html).removeAttr('disabled').find('.first-opt').html(select.data('first'));

    };

    View.prototype.loading = function (type) {
        $(".rg-" + type, this.dom).attr('disabled','disabled').find(".first-opt").html('正在加载...');
    };

    View.prototype.needParentId = function (type) {
        $(".rg-" + type, this.dom).html("<option>请选择上一级</option>");
    };

    View.prototype.format = function (name) {

        if (name.length > 8) {
            name = name.substr(0, 6) + "...";
        }
        return name;
    };

    function nextType(type) {
        if (type == 'province') {
            return 'city';
        } else if (type == 'city') {
            return 'district';
        }
    }

    module.exports = View;

});