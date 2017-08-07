import React from "react";
import PortfolioMedia from "./Portfolio/PortfolioMedia";

// main layout (the app)

export default class Portfolio extends React.Component {
	constructor() {
		super();
		this.state = {
			gallery: [
				{img: "image-url", title: "title", desc: "description about image"}
			]
		}
	}

	render() {
		const { gallery } = this.state;
		const galleryComp = gallery.map((media, index)=>{
			return <PortfolioMedia {...media} key={index} />
		})
		return (
			<div>{galleryComp}</div>
		);
	}
}
