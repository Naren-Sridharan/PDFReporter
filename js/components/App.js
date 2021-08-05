import { neverland as $, html, useState } from "neverland";
import Router from "./Router";

const App = $(function () {
	let page = new URLSearchParams(window.location.search).get("p");

	const [auth, setAuth] = useState({
		page: page,
	});

	console.log("Reached app");

	return html`${Router(auth, setAuth)}`;
});

export default App;
