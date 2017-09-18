import React from "react";
import SocialLinks from "./Profile/SocialLinks"

// Profile section

export default class Profile extends React.Component {
	constructor() {
		super();
		this.state = {
			fullbio: "Self starter, highly motivated and expert back-end and front-end developer",
		};
	}
	render() {
		const { fullname, id:section_id } = this.props;
		const { fullbio } = this.state;

		return (
			<div id={section_id}>
				<div className="section-container-padding-safe">
					<div className="absolute-center-container">
						<h1 className="profile-full-name">{fullname}</h1>
						<p className="profile-full-bio">{fullbio}</p>
						<SocialLinks />
					</div>
				</div>
			</div>
		);
	}
}
