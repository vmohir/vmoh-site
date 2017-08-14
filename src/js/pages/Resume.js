import React from "react";
import Skillbar from "./Resume/Skillbar";
import Education from "./Resume/Education";
import Job from "./Resume/Job";

// My Resume section

export default class Resume extends React.Component {
	constructor() {
		super();
		this.state = {
			skillgroups: [
				[
					{name: "HTML5", percent: 100},
					{name: "CSS3", percent: 100},
					{name: "Bootstrap", percent: 100},
				],
				[
					{name: "JS/ES6", percent: 70},
					{name: "jQuery", percent: 60},
					{name: "React", percent: 20},
				],
				[
					{name: "Wordpress", percent: 90},
					{name: "PHP", percent: 60},
					{name: "PHPUnit", percent: 20},
					{name: "Composer", percent: 15},
					{name: "MySQL", percent: 40},
				],
				[
					{name: "Git", percent: 40},
				],
				[
					{name: "C/C++", percent: 50},
					{name: "Qt", percent: 20},
				],
				[
					{name: "Python", percent: 25},
				]
			],
			education: [
				{institue: "University of Tehran", field: "Software Engineering", desc: "I'm student"}
			],
			jobs: [
				{title: "Web designer and webmaster", compony: "etuts.ir", desc: "technology tutorials", url: "http://etuts.ir"}
			],
		}
	}

	render() {
		const { skillgroups, education, jobs } = this.state;
		const { id:section_id } = this.props;
		
		// repeated code
		const skillsComp = skillgroups.map((skills,main_index) => {
			const skillsGroup = skills.map((item,index) => <Skillbar {...item} key={main_index + index} />);
			return (
				<tbody>
					{skillsGroup}
				</tbody>
			);
		});
		const educationComp = education.map((item, index) => <Education {...item} key={index} />);
		const jobsComp = jobs.map((item, index) => <Job {...item} key={index} />);

		return (
			<div id={section_id}>
				<button className="vertical-slider-nav-btn vertical-slider-nav-top"><span className="glyphicon glyphicon-chevron-up"></span></button>
				<div className="vertical-slider-container">
					<div class="vertical-slider-item" id="skills">
						<div class="big-glyphicon glyphicon glyphicon-knight"></div>
						<h1>Skills</h1>
						<div>
							<table id="skills-table">
								{skillsComp}
							</table>
						</div>
					</div>
					<div class="vertical-slider-item" id="education">
						<div class="big-glyphicon glyphicon glyphicon-education"></div>
						<h1>Education</h1>
						<ul>
							{educationComp}
						</ul>
					</div>
					<div class="vertical-slider-item" id="jobs">
						<div class="big-glyphicon glyphicon glyphicon-briefcase"></div>
						<h1>Job Experiences</h1>
						<ul>
							{jobsComp}
						</ul>
					</div>
				</div>
				<button className="vertical-slider-nav-btn vertical-slider-nav-bottom"><span className="glyphicon glyphicon-chevron-down"></span></button>
			</div>
		);
	}

	componentDidMount() {
		this.initiateVerticalSlider();
	}

	initiateVerticalSlider = () => {
		$('.vertical-slider-item:first-child').addClass('vertical-slider-item-active');
	}
}
