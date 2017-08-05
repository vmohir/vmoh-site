import React from "react";

// Job sliders

export default class Job extends React.Component {
	render() {
		const { title, compony, desc, url } = this.props;
		
		return (
			<li>
				<div className="job-container">
					<h3><a href="{url}">{title}</a></h3>
					<span>{compony}</span>
					<p>{desc}</p>
				</div>
			</li>
		);
	}
}
