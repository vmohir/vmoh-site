import React from 'react';

export default class CloseButton extends React.Component {
	render() {
		return (
			<button id="close-section-button" className="close-button" onClick={this.handleClickOnButton}>
				<span class="glyphicon glyphicon-remove center-block text-center" aria-hidden="true"></span>
			</button>
		);
	}

	handleClickOnButton = (e) => {
		const _self = e.currentTarget;
		
		this.props.handleClick(_self);
	}

	handleSectionReaveal = ($flipContianer) => {
		const $closeButton = $flipContianer.find('#close-section-button');
		const $closeButton_top = $closeButton.css('top').replace("px", "");

		// initial state
		$closeButton.css({
			top: ($closeButton_top * 3).toString() + 'px',
			right: ($closeButton_top * 3).toString() + 'px',
		    transform: 'scale(0)',
		    opacity: 0,
		});

		// final state
		anime({
			targets: $closeButton.toArray(),
			scale: 1,
			top: $closeButton_top,
			right: $closeButton_top,
			opacity: 1,
			delay: 800
		});
	}
}
