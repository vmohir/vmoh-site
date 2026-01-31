import React from 'react';
import etuts_img from '../../images/portfolio/etuts.jpg';
import etuts_bot_img from '../../images/portfolio/etutsbot.jpg';
import graph_web from '../../images/portfolio/graphWeb.jpg';
import metrix from '../../images/portfolio/metrix-dashboard.jpg';
import metrix_landing from '../../images/portfolio/metrix-landing.jpg';
import opencharity_img from '../../images/portfolio/opencharity.jpg';
import pstuts_img from '../../images/portfolio/pstuts.jpg';
import smarty_push_admin from '../../images/portfolio/smarty-push-admin.jpg';
import smarty_push from '../../images/portfolio/smarty-push.jpg';
import PortfolioMedia from './Portfolio/PortfolioMedia';

// main layout (the app)

export default class Portfolio extends React.Component {
  constructor() {
    super();
    this.state = {
      gallery: [
        {
          img: etuts_img,
          title: 'Etuts Wordpress Theme',
          desc: 'A Wordpress/WooCommerce/bbpress theme',
          technologies: ['Wordpress', 'WooCommerce', 'bbpress', 'jQuery Ajax', 'CSS3'],
          link: 'http://etuts.ir',
        },
        {
          img: pstuts_img,
          title: 'Pstuts Wordpress Theme',
          desc: 'A Wordpress blog theme',
          technologies: ['Wordpress', 'WooCommerce', 'CSS3'],
          link: 'http://demo.vmoh.ir/pstuts',
        },
        {
          img: opencharity_img,
          title: 'Open Charity Drupal Theme',
          desc: 'A Drupal Theme for OpenCharity website',
          technologies: ['Drupal', 'CSS3', 'Sass', 'JS'],
          link: 'http://vmoh.ir/drupal/drupal-open-charity-design/',
        },
        {
          img: etuts_bot_img,
          title: 'Etuts Telegram Bot',
          desc: 'A Telegram bot for etuts.ir',
          technologies: ['PHP Composer', 'Telegram API', 'Guzzle HTTP'],
          link: 'https://github.com/gvmohzibat/etuts-telegram-bot',
        },
        {
          img: null,
          title: 'TAP30 Contest',
          desc: 'A Constest held by TAP30 Company in University of Tehran. My job was to design the frontend of the website',
          technologies: ['HTML5', 'JS', 'jQuery', 'CSS3'],
          link: 'https://github.com/UT-CE-ACM/tap30-contest',
        },
        {
          img: graph_web,
          title: 'Graph web',
          desc: 'A project from Mohaymen Company to test my frontend designing skills.',
          technologies: ['ES6', 'ReactJS', 'CSS3', 'SVG', 'HTML5', 'Webpack'],
          link: 'https://github.com/gvmohzibat/graph-web',
        },
        {
          img: smarty_push,
          title: 'Smarty Push Publishers Dashboard',
          desc: 'Dashboard of publishers at smarty push.',
          technologies: ['Angular', 'Typescript', 'CSS3', 'Sass', 'HTML5', 'Material', 'Bootstrap'],
          link: '#',
        },
        {
          img: smarty_push_admin,
          title: 'Smarty Push Admin Dashboard',
          desc: 'Dashboard of admins at smarty push.',
          technologies: ['Angular', 'Typescript', 'CSS3', 'Sass', 'HTML5', 'Material', 'Bootstrap'],
          link: '#',
        },
        {
          img: metrix,
          title: 'Metrix Dashboard',
          desc: 'Dashboard of Metrix.ir',
          technologies: ['Angular', 'Typescript', 'CSS3', 'Sass', 'HTML5', 'Material', 'Bootstrap'],
          link: 'https://dashboard.metrix.ir',
        },
        {
          img: metrix_landing,
          title: 'Metrix Landing',
          desc: 'Landing page of Metrix.ir',
          technologies: ['jQuery', 'HTML5', 'CSS3', 'Sass', 'Bootstrap'],
          link: 'https://metrix.ir',
        },
      ],
    };
  }

  render() {
    const { gallery } = this.state;
    const { id: section_id } = this.props;
    let galleryComp = gallery.map((media, index) => <PortfolioMedia {...media} key={index} />);
    return (
      <div id={section_id}>
        <button className="vertical-slider-nav-btn vertical-slider-nav-top">
          <span className="glyphicon glyphicon-chevron-up" />
        </button>
        <div className="vertical-slider-container">
          <ul>{galleryComp}</ul>
        </div>
        <button className="vertical-slider-nav-btn vertical-slider-nav-bottom">
          <span className="glyphicon glyphicon-chevron-down" />
        </button>
      </div>
    );
  }

  componentDidMount() {
    this.initiateVerticalSlider();
  }

  initiateVerticalSlider = () => {
    $('.vertical-slider-item:first-child').addClass('vertical-slider-item-active');
  };
}
