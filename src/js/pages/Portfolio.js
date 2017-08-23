import React from "react";
import PortfolioMedia from "./Portfolio/PortfolioMedia";
import etuts_img from "../../images/portfolio/etuts.jpg";
import pstuts_img from "../../images/portfolio/pstuts.jpg";
import opencharity_img from "../../images/portfolio/opencharity.jpg";
import etuts_bot_img from "../../images/portfolio/etutsbot.jpg";

// main layout (the app)

export default class Portfolio extends React.Component {
	constructor() {
		super();
		this.state = {
			gallery: [
				{img: etuts_img, title: "Etuts Wordpress Theme", desc: "A Wordpress/WooCommerce/bbpress theme", technologies: ["PHP","Wordpress","WooCommerce","bbpress","jQuery Ajax","CSS3","MyCred API","Responsive"], link: "http://etuts.ir"},
				{img: pstuts_img, title: "Pstuts Wordpress Theme", desc: "A Wordpress blog theme", technologies: ["PHP","Wordpress","CSS3","Responsive"], link: "http://demo.vmoh.ir/pstuts"},
				{img: opencharity_img, title: "Open Charity Drupal Theme", desc: "A Drupal Theme for OpenCharity website", technologies: ["PHP","Drupal","CSS3","Sass","Javascript","Responsive"], link: "http://vmoh.ir/drupal/drupal-open-charity-design/"},
				{img: etuts_bot_img, title: "Etuts Telegram Bot", desc: "A Telegram bot for etuts.ir", technologies: ["PHP","Composer","Telegram API","Guzzle HTTP"], link: "https://github.com/gvmohzibat/etuts-telegram-bot"},
				{img: null, title: "TAP30 Contest", desc: "A Constest held by TAP30 Company in University of Tehran. My job was to design the frontend of the website", technologies: ["Javascript","jQuery","CSS3"], link: "https://github.com/UT-CE-ACM/tap30-contest"},
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
