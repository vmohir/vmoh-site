import React from "react";
import Middle_image from "./Middle_image";
import Resume from "./Resume";
import Profile from "./Profile";
import Portfolio from "./Portfolio";

// main layout (the app)

export default class Layout extends React.Component {
	constructor() {
		super();
		this.state = {
			fullname: "Vahid Mohammadi",
			bio: "Web developer and designer",
			showSection: null,
		}
	}

	showSection(section) {
		const { fullname, bio } = this.state;
		switch (section) {
			case "Resume":
			return (<Resume />);
			
			case "Profile":
			return (<Profile fullname={fullname} bio={bio} />);

			case "Profile":
			return (<Portfolio />);
		}
	}

	render() {
		const { showSection, fullname, bio } = this.state;
		return (
			<div>
				<Middle_image fullname={fullname} bio={bio} />
				{ showSection ? this.showSection(showSection) : null}
			</div>
		);
	}
}
