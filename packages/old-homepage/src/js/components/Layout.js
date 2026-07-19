import React from 'react';
import Middle_image from './MiddleImage';
import Resume from '../pages/Resume';
import Profile from '../pages/Profile';
import Portfolio from '../pages/Portfolio';
import SectionRevealButton from './SectionRevealButton';
import anime from 'animejs';
import $ from 'jquery';
import delay from '../functions';
import update from 'react-addons-update';
import CloseButton from './CloseButton';
// import { pdfMake } from 'pdfmake'

// main layout (the app)

export default class Layout extends React.Component {
  constructor() {
    super();
    this.state = {
      fullname: 'Vahid Mohammadi',
      bio: 'Web developer and designer',
      allowSection: null,
      sections: null,
      allowSectionButtons: false,
    };

    // attributes
    const { fullname } = this.state;

    this.state.sections = {
      Resume: { jsx: <Resume /> },
      Profile: { jsx: <Profile fullname={fullname} /> },
      Portfolio: { jsx: <Portfolio /> },
    };

    const { sections } = this.state;

    for (let section in sections) {
      sections[section].jsx.props.id = section.toLowerCase();
      sections[section].sectionContainerClass = `section-container-${section.toLowerCase()}`;
    }
  }

  render() {
    const { fullname, bio, MiddleImageStates } = this.state;
    return (
      <div id="react-root" className="full-height">
        <section id="middle-img-container" className="text-center">
          <ul id="section-buttons">{this.showSectionButtons()}</ul>
          <div id="middle-img" className="flip-container center-block">
            <div className="flipper">
              <Middle_image
                fullname={fullname}
                bio={bio}
                handleMouseOver={this.handleHoverMiddleImage}
                className="flip-card flip-card-front"
              />
              <div id="section-container" className="flip-card flip-card-back">
                <CloseButton
                  handleClick={this.handleClickOnCloseSectionButton}
                  ref={CloseButton => (this.closeButton = CloseButton)}
                />
                <div className="section-content">{this.showSection()}</div>
              </div>
            </div>
          </div>
          {/* <button onClick={this.handleClickDownloadPDF()}>download pdf</button> */}
        </section>
      </div>
    );
  }

  showSection = () => {
    const { allowSection, sections } = this.state;
    let result = null;
    if (allowSection && sections.hasOwnProperty(allowSection)) {
      result = sections[allowSection].jsx;
      $('#section-container').addClass(sections[allowSection].sectionContainerClass);
    }
    return result;
  };

  showSectionButtons = () => {
    const { allowSectionButtons, sections } = this.state;
    let result = [];
    if (allowSectionButtons) {
      for (let section in sections) {
        result.push(
          <SectionRevealButton
            name={section}
            handleClick={this.handleClickOnSectionRevealButton}
          />,
        );
      }
    }
    return result;
  };

  handleHoverMiddleImage = elm => {
    // elm = #middle-img-comp
    if (this.state.allowSectionButtons) return;
    this.setState({ allowSectionButtons: true });

    this.animationsOnHoverMiddleImage(elm);
  };

  /**
   * Animations:
   * 1. "MiddleImg" scaleDown
   * 2. section buttons rotate and scaleUp
   */
  animationsOnHoverMiddleImage = elm => {
    // elm = #middle-img-comp
    const $sectionButtons = $('#section-buttons');

    // initial state
    $sectionButtons.css({
      transform: 'scale(0) rotate(-30deg) translateX(-50%) translateY(-50%)',
      opacity: 0.3,
    });

    // final state
    anime({
      // scaleDown middle img
      targets: $(elm).closest('#middle-img').toArray(),
      scale: 1,
      opacity: 1,
      complete: anim => {
        anime({
          // scaleUp and rotate section buttons
          targets: $sectionButtons.toArray(),
          opacity: 1,
          translateX: '-50%',
          translateY: '-50%',
          scale: 1.3,
          rotate: 0,
          duration: 2000,
          elasticity: 300,
          complete: anim => {
            anime({
              // targets:
            });
          },
        });
      },
    });
  };

  handleClickOnSectionRevealButton = event => {
    // event is click on a section reveal button
    // show the section
    const _self = event.currentTarget;
    const section_name = $(_self).html();
    this.setState({ allowSection: section_name });

    // scaleUp and rotate the Middle img
    const $flipContianer = $('.flip-container');
    $flipContianer.addClass('active-flip');

    // show the close button
    this.closeButton.handleSectionReaveal($flipContianer);
  };
  handleClickOnCloseSectionButton = e => {
    $('.flip-container').removeClass('active-flip');
    delay(300).then(() => {
      this.setState({ allowSection: null });
      $('#section-container').removeClass((index, className) => {
        return (className.match(/(^|\s)section-container-\S+/g) || []).join(' ');
      });
    });
  };
  // handleClickDownloadPDF = e => {
  //   const docDefinition = {
  //     content: ['this is a text'],
  //   }
  //   pdfMake.createPdf(docDefinition).download()
  // }
}
