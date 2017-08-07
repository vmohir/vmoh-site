import React from "react";
import Middle_image from "./Middle_image";
import Resume from "../pages/Resume";
import Profile from "../pages/Profile";
import Portfolio from "../pages/Portfolio";
import SectionRevealButton from "./SectionRevealButton";
import anime from 'animejs';
import $ from 'jquery';
import delay from "../functions";

// main layout (the app)

export default class Layout extends React.Component {
	constructor() {
		super();
		this.state = {
			fullname: "Vahid Mohammadi",
			bio: "Web developer and designer",
			allowSection: null,
			sections: null,
			allowSectionButtons: false,
		};

		// attributes
		const { fullname, bio } = this.state;
		const idAttr = {'id': 'value'};

		this.state.sections = {
			Resume: {jsx: (<Resume />)},
			Profile: {jsx: (<Profile fullname={fullname} bio={bio} />)},
			Portfolio: {jsx: (<Portfolio />)},
		};

		const { sections } = this.state;

		for (let section in sections) {
			sections[section].jsx.props.id = section.toLowerCase();
			sections[section].sectionContainerClass = `section-container-${section.toLowerCase()}`;
		}
	}

	render() {
		const { fullname, bio } = this.state;
		return (
			<div id="react-root" class="full-height">	
				<section id="middle-img-container" class="text-center">
					<ul id="section-buttons">
						{this.showSectionButtons() /* list of li */}
					</ul>
					<div id="middle-img" className="flip-container center-block">
						<div className="flipper">
							<Middle_image fullname={fullname} bio={bio} handleMouseOver={this.handleHoverMiddleImage} className="flip-card flip-card-front" />
							<div id="section-container" className="flip-card flip-card-back">
								<button id="close-section-button" className="close-button" onClick={this.handleClickOnCloseSectionButton}><span class="glyphicon glyphicon-remove center-block text-center" aria-hidden="true"></span></button>
								{this.showSection()}
							</div>
						</div>
					</div>
				</section>
			</div>
		);
	}

	showSection = () => {
		const { allowSection, sections } = this.state;
		let result = null;
		if (allowSection) {
			if (sections.hasOwnProperty(allowSection)) {
				result = sections[allowSection].jsx;
				$('#section-container').addClass(sections[allowSection].sectionContainerClass);
			}
		}
		return result;
	}

	showSectionButtons = () => {
		const { allowSectionButtons , sections } = this.state;
		let result = [];
		if (allowSectionButtons) {
			for (let section in sections) {
				result.push((<SectionRevealButton name={section} handleClick={this.handleClickOnSectionRevealButton} />));
			}
		}
		return result;
	}

	handleHoverMiddleImage = (elm) => {
		if (this.state.allowSectionButtons)
			return;
		this.setState({ allowSectionButtons: true });

		this.animationsOnHoverMiddleImage(elm);
	}


	/**
	 * Animations:
	 * 1. "MiddleImg" scaleDown
	 * 2. section buttons rotate and scaleUp
	 */
	animationsOnHoverMiddleImage = (elm) => {
		const $sectionButtons = $('#section-buttons');

		// first state
		$sectionButtons.css({
			transform: 'scale(0) rotate(-30deg) translateX(-50%) translateY(-50%)',
			opacity: 0.3,
		});
		// second state
		anime({ // scaleDown middle img
			targets: $(elm).closest('#middle-img').toArray(),
			scale: 0.7,
			opacity: 0.9,
			complete: (anim) => {
				anime({ // scaleUp and rotate section buttons
					targets: $sectionButtons.toArray(),
					opacity: 1,
					translateX: '-50%',
					translateY: '-50%',
					scale: 1,
					rotate: 0,
					duration: 2000,
					elasticity: 600,
					complete: (anim) => {
						anime({
							// targets:
						});
					}
				});
			}
		});
	}

	handleClickOnSectionRevealButton = (e) => {

		// show the section
		const _self = e.currentTarget;
		const section_name = $(_self).html();
		this.setState({ allowSection: section_name });
		

		// scaleUp and rotate the Middle img
		const $middleImg = $("#middle-img-comp");

		$(".flip-container").addClass('active-flip');
		// hide middleImg completely
	}
	handleClickOnCloseSectionButton = () => {
		$(".flip-container").removeClass('active-flip');
		delay(800).then(() => {
			this.setState({ allowSection: null });
		});
	}
}
