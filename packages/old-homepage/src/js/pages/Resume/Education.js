import React from "react";

// Education sliders

export default class Education extends React.Component {
	render() {
		const { institue, field, desc } = this.props;
		
		return (
			<li>
				<div className="education-container">
					<h3>{field}</h3>
					<span>{institue}</span>
					<p>{desc}</p>
				</div>
			</li>
		);
	}
}
