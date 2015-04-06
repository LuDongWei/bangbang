define("gallery/region/1.0.0/region.js", ["jquery", "gallery/events/1.0.0/events", "gallery/region/1.0.0/region-model", "gallery/region/1.0.0/region-view"], function (require, exports, module) {

    var $ = require("jquery");
    var Events = require("gallery/events/1.0.0/events");

    var Model = require("gallery/region/1.0.0/region-model");
    var View = require("gallery/region/1.0.0/region-view");

    var Region = function (options) {
        var self = this;
        Events.mixTo(self);

        self.regionState = {
            "province": {
                parentId: 1,
                selectedId: null
            },
            "city": {
                parentId: null,
                selectedId: null
            },
            "district": {
                parentId: null,
                selectedId: null
            }
        };

        self.opt = $.extend(Region.defaults, options || {});

        self.view = new View({
            showType: self.opt.mobile ? "click" : "mouseenter",
            container: self.opt.target,
            inputName: self.opt.inputName,
            inputId: self.opt.inputId
        });

        if (window.getAreaChildren) {
            var source = {
                getAreaChildren: window.getAreaChildren
            };
        } else {
            console.log('缺少地址数据！');
            return false;
        }

        self.model = new Model({
            source: source
        });


        self.view.on("showSelect", self.onShowSelect, self);
        self.view.on("selected", self.onSelected, self);

        self.model.on("loaded", self.onDataLoaded, self);

    };

    Region.prototype.init = function (seletedIds) {

        var self = this;

        self.isInit = true;

        if (!seletedIds) {
            seletedIds = [null, null, null];
        }

        self.view.init();

        self.regionState.province.parentId = 1;
        self.regionState.city.parentId = seletedIds[0] || null;
        self.regionState.district.parentId = seletedIds[1] || null;

        var provinceIdSelId = self.regionState.province.selectedId = seletedIds[0] || null;
        var citySelId = self.regionState.city.selectedId = seletedIds[1] || null;
        var districtSelId = self.regionState.district.selectedId = seletedIds[2] || null;

        self.model.fetch(1, "province");

        if (provinceIdSelId) {
            self.model.fetch(provinceIdSelId, "city");
        }
        if (citySelId) {
            self.model.fetch(citySelId, "district");
        }

    };

    Region.prototype.onShowSelect = function (type) {

        // 最后的省是不用再去加载数据的
        if (!type) {
            return false;
        }

        var self = this;
        var parentId = self.regionState[type].parentId;
        var selectedId = self.regionState[type].selectedId;

        if (parentId === null) {
            self.view.needParentId(type);
        } else if (selectedId === null) {

            self.view.loading(type);

            self.model.fetch(parentId, type);
        }
    };

    Region.prototype.onSelected = function (evtData) {
        var self = this;
        var type = evtData.type;
        var id = evtData.id;


        if (type === "province") {

            self.regionState.province.selectedId = id;
            self.regionState.city.parentId = id;
            self.regionState.city.selectedId = null;
            self.regionState.district.parentId = null;
            self.regionState.district.selectedId = null;

            self.view.reset("city", "district");

            $(self.opt.inputId[0]).val(id);
        }

        if (type === "city") {

            self.regionState.city.selectedId = id;
            self.regionState.district.parentId = id;
            self.regionState.district.selectedId = null;

            self.view.reset("district");

            $(self.opt.inputId[1]).val(id);
        }

        if (type === "district") {
            self.regionState.district.selectedId = id;

            $(self.opt.inputId[2]).val(id);
        }

        self.trigger("selected", evtData);

        self.isInit = false;
    };

    Region.prototype.onDataLoaded = function (type, parentId, list) {

        var self = this;
        var simpleList = [];
        var selectedId = parseInt(self.regionState[type].selectedId, 10);
        var selectedObj;



        for (var i = 0, l = list.length; i < l; i++) {

            var isSelected = list[i].id === selectedId;

            var item = {
                name: list[i].name,
                id: list[i].id,
                type: type,
                postCode: list[i].parent_id,
                selected: isSelected
            };

            if (isSelected) {
                selectedObj = item;
            }

            simpleList.push(item);
        }

        self.view.render(type, simpleList, selectedObj);

        if (selectedObj && self.isInit) {
            self.trigger("selected", selectedObj);
        }

    };

    Region.defaults = {
        mobile: false,
        source: null,
        target: ".region",
        inputName: ["provinceId", "cityId", "districtId"],
        inputId: ["provinceId", "cityId", "districtId"]
    };

    module.exports = Region;

});