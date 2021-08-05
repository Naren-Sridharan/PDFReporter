import { neverland as $, html } from "neverland";

import IntroPage from "./IntroPage";
import CantrilPage from "./CantrilPage";
import GADPage from "./GADPage";
import PHQPage from "./PHQPage";
import CHSPage from "./CHSPage";
import CSIPage from "./CSIPage";
import StackedBarChart from "./StackedBarChart";

const Router = $(function (auth, setAuth) {
	switch (auth.page) {
		case 1:
			return html`${CantrilPage(auth, setAuth)}`;
			break;
		case 2:
			return html`${GADPage(auth, setAuth)}`;
			break;
		case 3:
			return html`${PHQPage(auth, setAuth)}`;
			break;
		case 4:
			return html`${CHSPage(auth, setAuth)}`;
			break;
		case 5:
			return html`${CSIPage(auth, setAuth)}`;
			break;
		default:
			return html`${IntroPage(auth, setAuth)}${StackedBarChart()}`;
	}
});

export default Router;
