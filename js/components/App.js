import { neverland as $, html, useState } from "neverland";
import { printPdf } from "./PDFDownloader";
import { StackedBarChart } from "./Charts";

const App = $(function () {
	const [auth, setAuth] = useState({
		pagenumber: 0,
	});

	const pages = ["General", "cantril", "GAD-2", "PHQ-2", "CHS", "CSI-4"];
	console.log(pages.length - 1);

	return html` <div id="${pages[auth.pagenumber]}" class="page">
		<h1>Mental Health Report for Resilient Youth Australia</h1>
		<h2>${pages[auth.pagenumber]}</h2>
		${StackedBarChart(pages[auth.pagenumber])}
		<button
			id="prev"
			onclick="${() => setAuth({ pagenumber: auth.pagenumber - 1 })}"
			disabled="${auth.pagenumber == 0}"
		>
			Previous
		</button>
		<button id="print_report" onclick="${printPdf}">Print PDF Report</button>
		<button
			id="next"
			onclick="${() => setAuth({ pagenumber: auth.pagenumber + 1 })}"
			label="Next"
			disabled="${auth.pagenumber == pages.length - 1}"
		>
			Next
		</button>
	</div>`;
});

export default App;
