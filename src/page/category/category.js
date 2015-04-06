//list or search   by douban
define('page/category/category',['zepto/zepto/1.1.2/zepto'],function (require,exports,module){
    
	var $ = require("zepto/zepto/1.1.2/zepto");
	
	$(".row").on('click', function() {
		$(this).toggleClass("open");
		$("#cate-sub-" + $(this).data("id")).toggle();
		return false;
	});
	
	$(".cate-sub .item-wrap").on('click', function() {
		$('#container').show();
		$('#in-container').show();
		return false;
	});
	
	$(".cate-sub .item-wrap").on('click', function() {
		$('#container').hide();
		$('#in-container').show();
		return false;
	});
	
	$("#in-close").on('click', function() {
		$('#in-container').hide();
		$('#container').show();
		return false;
	});

	
})