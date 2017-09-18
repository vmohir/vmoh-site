import React from "react";
import SocialLink from "./SocialLink";

// Social links in profile section

export default class SocialLinks extends React.Component {
	constructor() {
		super();
		this.state = {
			social_links: [
				{name: "linkedin", url: "https://www.linkedin.com/in/vahidmohammadi/"},
				{name: "stackoverflow", url: "https://stackoverflow.com/story/vmoh_ir/"},
				{name: "Github", url: "http://github.com/gvmohzibat/"},
				// {name: "Jobinja", url: "https://jobinja.ir/user/vmoh_ir"},
			],
		}
	}

	render() {
		const { social_links } = this.state;
		const sociallinksComp = social_links.map((link, index) => {
			return (<SocialLink {...link} key={index} />);
		} )

		return (
			<ul id="social-links-list">{sociallinksComp}</ul>
		);
	}
}
