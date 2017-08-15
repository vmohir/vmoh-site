import React from "react";
import ReactDOM from "react-dom";
import Ps from "perfect-scrollbar";
require('perfect-scrollbar/jquery')($);

require('../css/main.scss');

import Layout from "./components/Layout";

require('./general-scripts.js');

const app = document.getElementById('app');
ReactDOM.render(<Layout/>, app);
