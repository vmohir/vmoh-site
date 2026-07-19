import React from 'react';

export default class SectionRevealButton extends React.Component {
	render() {
		const { name } = this.props;

		return (
			<li class="text-center" onClick={this.handleClickOnLi}>{name}</li>
		);
	}
	handleClickOnLi = (e) => {
		const { handleClick } = this.props;
		handleClick(e);
	}
}
