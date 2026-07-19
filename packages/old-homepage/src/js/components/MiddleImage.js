import React from "react";
import anime from 'animejs';
import $ from 'jquery';
import avatar_img from "../../images/avatar.jpg";

// the main title and image and description that is show at first

export default class Middle_image extends React.Component {
	constructor() {
		super();
		this.state = {
			allowHoverMiddleImgContainer: true,
		};
	}
	render() {
		const { fullname, bio, className } = this.props;
		return (
			<div id="middle-img-comp" class={"center-block "+className} onMouseOver={this.handleHoverMiddleImgContainer} ref={_self => {this.MiddleImg = _self}}>
				<img id="main-avatar" src={avatar_img} alt={fullname} class="center-block img-responsive img-circle" />
				<h1>{fullname}</h1>
				<p>{bio}</p>
			</div>
		);
	}

	componentDidMount() {
		setTimeout(() => {
			this.fireHoverMiddleImgContainer();
		}, 1200);
	}

	handleHoverMiddleImgContainer = (e) => {
		const { allowHoverMiddleImgContainer } = this.state;
		if (!allowHoverMiddleImgContainer) {
			return false;
		}
		const _self = e.currentTarget; // #middle-img-comp
		$(_self).find("#main-avatar").addClass('is-active');
		const animation = anime({
			targets: _self,
			update: (anim) => {
				if (anim.progress > 75)
					$(_self).find("h1").slideUp(120, () => { $(_self).find("p").slideUp(120); });
				this.props.handleMouseOver(_self);

				// do not re run this function
				this.setState({ allowHoverMiddleImgContainer: false }); // this should be last line
			}
		});
	}

	// Hover simulate
	fireHoverMiddleImgContainer = () => {
		var evObj = document.createEvent( 'Events' );
        evObj.initEvent( 'mouseover', true, false );
        this.MiddleImg.dispatchEvent( evObj );
	}
}
