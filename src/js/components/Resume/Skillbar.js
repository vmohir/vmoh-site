import React from "react";

// Skillbar sliders

export default class Skillbar extends React.Component {
	render() {
		const { name, percent } = this.props;
		
		return (
			<li>
				<div className="skillbar-container" data-percent="{percent}">
					<span className="skillbar-name">{name}</span>
					<span className="skillbar-percent">{percent}</span>
				</div>
			</li>
		);
	}
}
