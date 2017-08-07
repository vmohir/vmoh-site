import React from "react";

// main layout (the app)

export default class PortfolioMedia extends React.Component {
	render() {
		const { title, img, desc } = this.props;
		return (
			<div>
				<img src="{img}" alt="{title}"/>
				<h1>{title}</h1>
				<p>{desc}</p>
			</div>
		);
	}
}
