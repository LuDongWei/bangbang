(function () {
    var host = location.host;
    var domain = host.substr(host.indexOf('.') + 1);

    seajs.config({
        alias: {
            "zepto": "zepto/zepto/1.1.2/zepto",
            "jquery": "zepto/zepto/1.1.2/zepto",
            "$": "zepto/zepto/1.1.2/zepto",
            "handlebars": "gallery/handlebars/1.3.0/handlebars",
            "backbone": "gallery/backbone/1.0.0/backbone",
            "underscore": "gallery/underscore/1.6.0/underscore",
            "global": "global/global"
        },
        debug: false,
        base: '/m/'
    });
})();