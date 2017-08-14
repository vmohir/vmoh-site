import React from "react";
import PortfolioMedia from "./Portfolio/PortfolioMedia";

// main layout (the app)

export default class Portfolio extends React.Component {
	constructor() {
		super();
		this.state = {
			gallery: [
				{img: "/images/img1.jpg", title: "title", desc: "description about image"},
				{img: "/images/img2.jpg", title: "the new title", desc: "the new description"},
				{img: "/images/img2.jpg", title: "the new title", desc: "the new description"},
				{img: "/images/img2.jpg", title: "the new title", desc: "the new description"},
			]
		}
	}

	render() {
		const { gallery } = this.state;
		const { id:section_id } = this.props;
		let galleryComp = gallery.map((media, index) => <PortfolioMedia {...media} key={index} />);
		return (
			<div id={section_id}>
				<button className="vertical-slider-nav-btn vertical-slider-nav-top"><span className="glyphicon glyphicon-chevron-up"></span></button>
				<div className="vertical-slider-container">
					<ul>{galleryComp}</ul>
				</div>
				<button className="vertical-slider-nav-btn vertical-slider-nav-bottom"><span className="glyphicon glyphicon-chevron-down"></span></button>
			</div>
		);
	}

	componentDidMount() {
		this.initiateVerticalSlider();
	}

	initiateVerticalSlider = () => {
		$('.vertical-slider-item:first-child').addClass('vertical-slider-item-active');
	}
}
