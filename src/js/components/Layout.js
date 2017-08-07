import React from "react";
import Middle_image from "./Middle_image";
import Resume from "../pages/Resume";
import Profile from "../pages/Profile";
import Portfolio from "../pages/Portfolio";
import SectionRevealButton from "./SectionRevealButton";
import anime from 'animejs';
import $ from 'jquery';

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
			flipper_scale_amount: 1.7,
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
					<div id="middle-img" className="flip-container full-height center-block">
						<div className="flipper">
							<Middle_image fullname={fullname} bio={bio} handleMouseOver={this.handleHoverMiddleImage} className="flip-card flip-card-front" />
							<div id="section-container" className="flip-card flip-card-back">
								{this.showSection()}
							</div>
						</div>
					</div>
				</section>
			</div>
		);
	}

	showSection = () => {
		let { allowSection, sections } = this.state;
		if (typeof allowSection == "string")
			allowSection = [allowSection];
		let result = null;
		if (allowSection) {
			result = [];
			allowSection.forEach((section)=>{
				if (sections.hasOwnProperty(section)) {
					result.push(sections[section].jsx);
				}
			});
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

	handleHoverMiddleImage = (e) => {
		if (this.state.allowSectionButtons)
			return;
		this.setState({ allowSectionButtons: true });

		// Animations: section buttons rotate and scaleUp
		let $buttons = $('#section-buttons');
		$buttons.css({
			transform: 'scale(0) rotate(-30deg) translateX(-50%) translateY(-50%)',
			opacity: 0.3,
		});
		anime({
			targets: $buttons.toArray(),
			opacity: 1,
			translateX: '-50%',
			translateY: '-50%',
			scale: 1,
			rotate: 0,
			duration: 2000,
		});
	}

	handleClickOnSectionRevealButton = (e) => {

		// show the section
		const _self = e.currentTarget;
		const section_name = $(_self).html();
		this.setState({allowSection: section_name});

		// scaleUp Middle img
		const $middleImg = $("#middle-img-comp");

		const { flipper_scale_amount: scale_amount } = this.state;
		anime({
			targets: $middleImg.toArray(),
			scale: scale_amount - 0.1,
			duration: 2000,
			elasticity: 0,
			update: (anim) => {
				$(".flip-container").addClass('active-flip');
				const width_percent = scale_amount * 100;
				const margin_percent = (width_percent - 100)/2;
				$("#section-container").css({
					width: width_percent+'%',
					height: width_percent+'%',
					left: '-'+margin_percent+'%',
					top: '-'+margin_percent+'%',
				});
			}
		});
	}
}
