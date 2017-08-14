import React from "react";
import SocialLinks from "./Profile/SocialLinks"

// Profile section

export default class Profile extends React.Component {
	render() {
		const { fullname, bio } = this.props;
		const { id:section_id } = this.props;

		return (
			<div id={section_id}>
				<div className="section-container-padding-safe">
					<div className="absolute-center-container">
						<h1>{fullname}</h1>
						<p>{bio}</p>
						<SocialLinks />
					</div>
				</div>
			</div>
		);
	}
}
