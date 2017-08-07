import React from "react";
import ReactDOM from "react-dom";
// import $ from 'jquery';

require('../css/main.scss');

// window.jQuery = window.$ = $;

import Layout from "./components/Layout"

const app = document.getElementById('app');
ReactDOM.render(<Layout/>, app);
