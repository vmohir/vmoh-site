import React from 'react'
import Skillbar from './Resume/Skillbar'
import Education from './Resume/Education'
import Job from './Resume/Job'

// My Resume section

export default class Resume extends React.Component {
  constructor() {
    super()
    this.state = {
      skillgroups: [
        {
          title: 'Frontend web designer',
          skills: [{ name: 'HTML5 - CSS3', percent: 100 }, { name: 'Sass/PostCSS/SMACSS etc', percent: 100 }, { name: 'Bootstrap/Semantic etc', percent: 100 }, { name: 'JS/ES6', percent: 70 }, { name: 'jQuery', percent: 60 }, { name: 'React Redux', percent: 100 }, { name: 'Angular', percent: 20 }],
        },
        {
          title: 'Designing skills',
          skills: [{ name: 'Photoshop', percent: 100 }, { name: 'Illustrator', percent: 20 }, { name: 'After effects', percent: 10 }, { name: 'UI/UX', percent: 80 }],
        },
        {
          title: 'Wordpress developing',
          skills: [{ name: 'Theme developing', percent: 90 }, { name: 'Woocommerce', percent: 100 }, { name: 'bbpress', percent: 100 }, { name: 'buddypress', percent: 60 }],
        },
        {
          title: 'PHP developing',
          skills: [{ name: 'PHP', percent: 60 }, { name: 'Laravel', percent: 10 }, { name: 'PHPUnit', percent: 10 }, { name: 'Composer', percent: 15 }, { name: 'Telegram API', percent: 90 }],
        },
        {
          title: 'C/C++ programming',
          skills: [{ name: 'C/C++', percent: 50 }, { name: 'Qt', percent: 20 }],
        },
        {
          title: 'Python developing',
          skills: [{ name: 'Python', percent: 25 }],
        },
        {
          title: 'Databases',
          skills: [{ name: 'MySQL', percent: 40 }],
        },
        {
          title: 'Other skills',
          skills: [{ name: 'SEO', percent: 70 }, { name: 'Git', percent: 70 }],
        },
        {
          title: 'English',
          skills: [{ name: 'Writing/Listening', percent: 90 }, { name: 'Speaking', percent: 70 }],
        },
      ],
      education: [{ institue: 'University of Tehran', field: 'Software Engineering', desc: "I've been studying computer engineering at University of Tehran since Sep 2015." }],
      jobs: [{ title: 'Web designer and webmaster', compony: 'etuts.ir', desc: 'technology tutorials', url: 'http://etuts.ir' }],
    }
  }

  render() {
    const { skillgroups, education, jobs } = this.state
    const { id: section_id } = this.props

    // repeated code
    const skillsComp = skillgroups.map((group, main_index) => {
      const colCount = Object.keys(group.skills[0]).length
      const skillsGroup = group.skills.map((item, index) => <Skillbar {...item} key={main_index + index} />)
      return (
        <tbody>
          <tr>
            <td className="skill-group-title" colSpan={colCount}>
              {group.title}
            </td>
          </tr>
          {skillsGroup}
        </tbody>
      )
    })
    const educationComp = education.map((item, index) => <Education {...item} key={index} />)
    const jobsComp = jobs.map((item, index) => <Job {...item} key={index} />)

    return (
      <div id={section_id}>
        <button className="vertical-slider-nav-btn vertical-slider-nav-top">
          <span className="glyphicon glyphicon-chevron-up" />
        </button>
        <div className="vertical-slider-container">
          <div class="vertical-slider-item" id="skills">
            <div class="big-glyphicon glyphicon glyphicon-knight" />
            <h1>Skills</h1>
            <div>
              <table id="skills-table">{skillsComp}</table>
            </div>
          </div>
          <div class="vertical-slider-item" id="education">
            <div class="big-glyphicon glyphicon glyphicon-education" />
            <h1>Education</h1>
            <ul>{educationComp}</ul>
          </div>
          <div class="vertical-slider-item" id="jobs">
            <div class="big-glyphicon glyphicon glyphicon-briefcase" />
            <h1>Job Experiences</h1>
            <ul>{jobsComp}</ul>
          </div>
        </div>
        <button className="vertical-slider-nav-btn vertical-slider-nav-bottom">
          <span className="glyphicon glyphicon-chevron-down" />
        </button>
      </div>
    )
  }

  componentDidMount() {
    this.initiateVerticalSlider()
    this.initiateJqueryPerfectSlider()
  }
  componentDidUpdate(prevProps, prevState) {
    this.updateJqueryPerfectSlide()
  }

  initiateJqueryPerfectSlider = () => {
    $('#skills').perfectScrollbar({
      suppressScrollX: true,
    })
  }
  initiateVerticalSlider = () => {
    $('.vertical-slider-item:first-child').addClass('vertical-slider-item-active')
  }

  updateJqueryPerfectSlide = () => {
    $('#skills').perfectScrollbar('update')
  }
}
