import React from "react";
import SocialLinks from "./Profile/SocialLinks"

// Profile section

export default class Profile extends React.Component {
	constructor() {
		super();
		this.state = {

		}
	}

	render() {
		const { fullname, bio } = this.props;
		return (
			<section id="profile">
				<h1>{fullname}</h1>
				<p>{bio}</p>
				<SocialLinks />
			</section>
		);
	}
}
