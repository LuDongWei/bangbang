define("gallery/region/1.0.0/region-model", ["jquery","gallery/events/1.0.0/events"], function (require, exports, module) {

    var $ = require("jquery");
    var Events = require("gallery/events/1.0.0/events");

    var cache = {};

    var Model = function (options) {
            var self = this;
            Events.mixTo(self);

            self.source = "";
            self.inited = false;

            if (options && options.source) {
                self.source = options.source;
            } else {
                throw new Error("need region source path.");
            }
            self.inited = true;
             
        };

    Model.prototype.fetch = function (parentID, type) {
        var self = this;
        if (!self.inited) {
            throw new Error("Model need init.");
        }

        if (isNaN(parseInt(parentID, 10)) || parseInt(parentID, 10) < 0) { //如果选中首项
            throw new Error("parentID is invalid.");
        }

        if (cache[parentID + ""]) {
            return self.trigger("loaded", type, parentID, cache[parentID]);
        }


        var data=self.source.getAreaChildren(parentID);
        
        if (data) {
            self.trigger("loaded", type, parentID, data);
            cache[parentID + ""] = data;

        }else{
            throw new Error("region data load fail! [parentID:" + parentID + "]");
        }
        
    };

    module.exports = Model;

});

