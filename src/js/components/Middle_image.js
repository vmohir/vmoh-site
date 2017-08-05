import React from "react";

// the main title and image and description that is show at first

export default class Middle_image extends React.Component {
	constructor() {
		super();
	}

	render() {
		const { fullname, bio } = this.props;
		return (
			<section id="middle-img" class="col-sm-8 text-center">
				<div>
					<img id="main-avatar" src="../../images/vahid.jpg" alt="{fullname}" class="center-block img-responsive img-circle" />
					<h1>{fullname}</h1>
					<p>{bio}</p>
				</div>
			</section>
		);
	}
}
