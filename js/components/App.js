import { neverland as $, html, useState } from "neverland";
import { printPdf } from "./PDFDownloader";
import { scale_wranglers } from "../constants";
import { table, scatterChart, stackedBarChart } from "./Charts";

const App = $(function () {
	const [page, setPage] = useState(0);

	const pages = ["General", ...Object.keys(scale_wranglers)];

	return html` <div id="${pages[page]}" class="page">
		<h1>Mental Health Report for Resilient Youth Australia</h1>
		<h2>${pages[page]}</h2>
		<div id="viz" class="viz">
			${stackedBarChart(pages[page])} ${table(pages[page])}
		</div>
		<button
			id="prev"
			onclick="${() => setPage(page - 1)}"
			disabled="${page == 0}"
		>
			Previous
		</button>
		<button id="print_report" onclick="${() => printPdf(pages)}">
			Print PDF Report
		</button>
		<button
			id="next"
			onclick="${() => setPage(page + 1)}"
			label="Next"
			disabled="${page == pages.length - 1}"
		>
			Next
		</button>
	</div>`;
});

export default App;
