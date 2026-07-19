import React from "react";

// Component for each social link 

export default class SocialLink extends React.Component {
	render() {
		const { name , url } = this.props;
		
		return (
			<li>
				<a href={url}>{name}</a>
			</li>
		);
	}
}
