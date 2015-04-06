(function () {
    var host = location.host;
    var domain = host.substr(host.indexOf('.') + 1);

    seajs.config({
        alias: {
            "$": "jquery/jquery/1.7.2/jquery",
            "jquery": "jquery/jquery/1.7.2/jquery",
            "handlebars": "gallery/handlebars/1.3.0/handlebars",
            "backbone": "gallery/backbone/1.0.0/backbone",
            "underscore": "gallery/underscore/1.6.0/underscore",
            "global": "global/global"
        },
        debug: false,
        base: '/m/'
    });
})();