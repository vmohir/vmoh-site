import Ps from "perfect-scrollbar";
require('perfect-scrollbar/jquery')($);

$(document).ready(function() {


	// Sliders nav buttons
	$(document).delegate('.vertical-slider-nav-btn', 'click', handleClickOnVerticalSliderNavButtons);

	function handleClickOnVerticalSliderNavButtons(e) {
		// which button is clicked? top or bottom?
		let is_top = false;
		if ($(e.currentTarget).hasClass('vertical-slider-nav-top'))
			is_top = true;


		// the element which is visible in the slider now
		const $active_item = $(".vertical-slider-item-active");
		let $item_after_active_item = $active_item.next('.vertical-slider-item');
		let $item_before_active_item = $active_item.prev('.vertical-slider-item');


		// if is the first or last element and can't slide
		if (is_top && $active_item.is(':last-child'))
			$item_after_active_item = $('.vertical-slider-item').first();
		if (!is_top && $active_item.is(':first-child'))
			$item_before_active_item = $('.vertical-slider-item').last();


		// change items classes
		$active_item.toggleClass('vertical-slider-item-active');
		if (is_top)
			$item_after_active_item.toggleClass('vertical-slider-item-active');
		else
			$item_before_active_item.toggleClass('vertical-slider-item-active');
	}

});