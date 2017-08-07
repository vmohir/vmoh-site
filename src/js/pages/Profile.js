import React from "react";
import SocialLinks from "./Profile/SocialLinks"

// Profile section

export default class Profile extends React.Component {
	render() {
		const { fullname, bio } = this.props;
		return (
			<div>
				<h1>{fullname}</h1>
				<p>{bio}</p>
				<SocialLinks />
			</div>
		);
	}
}
