//home  -by douban
define('page/home/home', ['gallery/swipejs/2.0.1/swipe', 'zepto/zepto/1.1.2/zepto', 'gallery/handlebars/1.3.0/handlebars'], function (require, exports, module) {

	var $ = require("zepto/zepto/1.1.2/zepto");
	var Swipe = require("gallery/swipejs/2.0.1/swipe");
	var Handlebars = require("gallery/handlebars/1.3.0/handlebars");


	var sliderNav = document.getElementById('slider-nav').getElementsByTagName('li');
	sliderNav[0].className = 'on';

	var swipe = Swipe.create(document.getElementById('slider'), {
		auto: 3000,
		speed: 500,
		continuous: true,
		callback: function (pos) {

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

	//==换一批==//
	var template = Handlebars.compile($("#homeMore-template").html());
	var RECOMMEND_API = "/api/index?method=itemrecommend.get";

	var $changeGoods = $("#changeGoods");
	var $homeMoreList = $("#homeMoreList");
	var isReturn = true;

	var skusData = '';

	function Ajax(url, data, callback) {
		$.ajax({
			type: "get",
			url: url,
			dataType: "json",
			jsonp: "jsoncallback",
			data: data,
			success: function (json) {
				callback && callback(json);
				skusData = getSkus(json.data);
				isReturn = true;
			}
		})
	}

	$changeGoods.on("click", function () {

		if (isReturn) {
			isReturn = false;

			Ajax(RECOMMEND_API, {
				'skus': skusData
			}, function (json) {

				if (json.data && json.data.length > 0) {
					var goods = {
							goods: json.data
						},
						html = template(goods);

					$homeMoreList.html(html)
				};

			})
		}

	});

	function getSkus(data) {
		var arr = [];
		for (var i = 0; i < data.length; i++) {
			arr.push(data[i].sku_id);
		}
		return arr.join(',');
	}

    //搜索
    $(".l-a-btn").click(function () {
        $("#search-form").submit();
    })

})