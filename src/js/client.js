import React from "react";
import ReactDOM from "react-dom";

require('../css/main.scss');

import Layout from "./components/Layout"

const app = document.getElementById('app');
ReactDOM.render(<Layout/>, app);
