import React from "react";

// Skillbar sliders

export default class Skillbar extends React.Component {
	render() {
		const { name, percent } = this.props;
		
		return (
			<tr className="skillbar-container" data-percent={percent}>
				<td>{name}</td>
				<td class="progress">
					<div class="progress-bar" role="progressbar" aria-valuenow={percent} aria-valuemin="0" aria-valuemax="100" style={{width: percent + "%"}}>
						<span>{percent}%</span>
					</div>
				</td>
			</tr>
		);
	}
}
