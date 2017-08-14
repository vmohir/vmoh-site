import React from "react";

// main layout (the app)

export default class PortfolioMedia extends React.Component {
	render() {
		const { title, img, desc } = this.props;
		return (
			<li class="vertical-slider-item portfolio-media-item">
				<img src={img} alt={title} />
				<div className="portfolio-media-content">
					<h1>{title}</h1>
					<p>{desc}</p>
				</div>
			</li>
		);
	}
}
