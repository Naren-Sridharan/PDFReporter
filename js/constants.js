import { stackedBarChart } from "./components/Charts";

export const scale_wranglers = {
	cantril: (x) => Math.trunc(x),
	CHS: (x) =>
		x >= 5.5
			? "All"
			: x >= 4.5
			? "Most"
			: x >= 3.5
			? "Lots"
			: x >= 2.5
			? "Some"
			: x >= 1.5
			? "Little"
			: "None",
	"GAD-2": (x) => (x >= 3 ? "Anxious" : "Not Anxious"),
	"PHQ-2": (x) => (x >= 3 ? "Depressed" : "Not Depressed"),
	"CSI-4": (x) => (x >= 4 ? "Disengaged" : "Engaged"),
};

export const csv_url =
	"https://raw.githubusercontent.com/Naren-Sridharan/PDFReporter/master/data/mentalhealth_1k.csv";
