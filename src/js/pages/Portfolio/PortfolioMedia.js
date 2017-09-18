import React from "react";
import $ from "jquery"

// main layout (the app)

export default class PortfolioMedia extends React.Component {
	render() {
		const { title, img, desc, technologies, link } = this.props;
		const technologiesComp = technologies.map((tech, index) => <li>{tech}</li>);

		let imgComp = null;
		let mainListItem_noImgClass = "portfolio-media-no-img";
		if (img) {
			imgComp = (
				<div className="portfolio-media-image-container">
					<img src={img} alt={title} ref={imgC => this.portfolioImg = imgC} />
				</div>
			);
			mainListItem_noImgClass = null;
		}

		return (
			<li class={"vertical-slider-item portfolio-media-item "+mainListItem_noImgClass}>
				{imgComp}
				<a className="portfolio-media-view-link" href={link} target="_blank">View link</a>
				<div className="portfolio-media-content">
					<h1>{title}</h1>
					<p>{desc}</p>
					<ul className="portfolio-media-techs">
						{technologiesComp}
					</ul>
				</div>
			</li>
		);
	}
	/*componentDidMount() {
		// https://www.npmjs.com/package/image-size
		// console.log(this.portfolioImg.clientHeight);
		// console.log($(".portfolio-media-image-container img").height());
	}*/
}
