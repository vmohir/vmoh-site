import React from "react";
import Skillbar from "./Resume/Skillbar";
import Education from "./Resume/Education";
import Job from "./Resume/Job";

// My Resume section

export default class Resume extends React.Component {
	constructor() {
		super();
		this.state = {
			skills: [
				{name: "HTML", percent: 100},
				{name: "CSS", percent: 100},
				{name: "JS", percent: 50},
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
		const { skills, education, jobs } = this.state;
		
		const skillsComp = skills.map((item, index) => <Skillbar {...item} key={index} />);
		const educationComp = education.map((item, index) => <Education {...item} key={index} />);
		const jobsComp = jobs.map((item, index) => <Job {...item} key={index} />);

		return (
			<div>
				<div id="Skills">
					<h1>Skills</h1>
					<ul>
						{skillsComp}
					</ul>
				</div>
				<div id="Education">
					<h1>Education</h1>
					<ul>
						{educationComp}
					</ul>
				</div>
				<div id="Jobs">
					<h1>Jobs</h1>
					<ul>
						{jobsComp}
					</ul>
				</div>
			</div>
		);
	}
}
