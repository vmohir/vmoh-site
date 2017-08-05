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

	showSection = (section) => {
		const { fullname, bio } = this.state;
		if (typeof section == "string")
			section = [section];
		let result = null;
		if (section) {
			result = [];
			section.forEach((section,index)=>{
				switch (section) {
					case "Resume":
					result.push((<Resume />));
					break;
					
					case "Profile":
					result.push((<Profile fullname={fullname} bio={bio} />));
					break;

					case "Portfolio":
					result.push((<Portfolio />));
					break;
				}
			});
		}
		return result;
	}

	render() {
		const { showSection, fullname, bio } = this.state;
		return (
			<div id="react-root">
				<Middle_image fullname={fullname} bio={bio} handleMouseOver={this.handleHoverMiddleImage} />
				{this.showSection(showSection)}
			</div>
		);
	}

	handleHoverMiddleImage = () => {
		this.setState({showSection: ["Resume","Profile","Portfolio"]});
		console.log(this.state.showSection);
	}
}
