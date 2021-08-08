import { csv_url, scale_wranglers } from "../constants";
import * as d3 from "d3";
import Canvg from "canvg";

// Get the string representation of a DOM node (removes the node)
function domNodeToString(domNode) {
	var element = document.createElement("div");
	element.appendChild(domNode);
	return element.innerHTML;
}

function percentages(counts, count = false) {
	let total = d3.sum(Object.values(counts));
	let percentage = {};
	Object.keys(counts).forEach(
		(score) => (percentage[score] = Math.round((counts[score] * 100) / total))
	);
	return count
		? Object.fromEntries(
				Object.keys(counts).map((s) => [s, [counts[s], percentage[s]]])
		  )
		: percentage;
}

// The table generation function
function tabulate(data, columns, parent) {
	var table = parent
			.append("table")
			.attr("style", "margin: 5px")
			.style("border-collapse", "collapse")
			.style("border", "2px black solid"),
		thead = table.append("thead"),
		tbody = table.append("tbody");

	// append the header row
	thead
		.append("tr")
		.selectAll("th")
		.data(columns)
		.enter()
		.append("th")
		.style("padding", "1px 4px")
		.style("border", "1px black solid")
		.text(function (column) {
			return column;
		});

	// create a row for each object in the data
	var rows = tbody.selectAll("tr").data(data).enter().append("tr");

	// create a cell in each row for each column
	rows
		.selectAll("td")
		.data(function (row) {
			return columns.map(function (column) {
				return { column: column, value: row[column] };
			});
		})
		.enter()
		.append("td")
		.attr("style", "border: 1px black solid; padding: 1px 4px;")
		.html((d) =>
			typeof d.value === "string"
				? d.value
				: d.value.length
				? `${d.value[0]}(${d.value[1]}%)`
				: `${d.value}%`
		);

	return table;
}

const get_data = (key) => {
	return d3.csv(csv_url).then((scores) => {
		if (key == "General") {
			var aggregated_scores = d3.rollup(
				scores.filter((s) => {
					return ["M", "F"].includes(s.gender);
				}),
				(v) => v.length,
				(d) => d.gender,
				(d) => d.grade
			);

			var data = Array.from(aggregated_scores, (value) => ({
				...percentages(Object.fromEntries(value[1]), true),
				gender: value[0],
			}));

			return { data };
		} else {
			let unique_scores = {};
			Array.from(new Set(scores.map((d) => d[key]))).forEach(
				(x) => (unique_scores[scale_wranglers[key](parseFloat(x))] = 0)
			);

			var aggregated_scores = d3.rollup(
				scores,
				(v) => v.length,
				(d) => d.grade,
				(d) => scale_wranglers[key](parseFloat(d[key]))
			);

			var data = Array.from(aggregated_scores, (value) => ({
				...unique_scores,
				...percentages(Object.fromEntries(value[1])),
				grade: value[0],
			}));

			return { unique_scores, data };
		}
	});
};

export const stackedBarChart = (key, png = false) => {
	if (!png) {
		d3.select("svg").remove();
	}

	if (key === "General") {
		return;
	}

	return get_data(key).then(({ unique_scores, data }) => {
		// set the dimensions and margins of the graph
		var margin = { top: 10, right: 30, bottom: 50, left: 50 },
			width = 460 - margin.left - margin.right,
			height = 400 - margin.top - margin.bottom;

		var svgContainer = png
			? d3.select(document.createElement("custom"))
			: d3.select("#viz");

		// append the svg object to the body of the page
		var svg = svgContainer
			.append("svg")
			.attr("id", `sbc`)
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom);

		var svgg = svg
			.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		// List of subgroups
		const subgroups = Object.keys(unique_scores);

		// List of groups
		const groups = data.map((d) => d.grade);

		// Add X axis
		const x = d3.scaleBand().domain(groups).range([0, width]).padding([0.2]);

		svgg
			.append("g")
			.attr("transform", `translate(0, ${height})`)
			.call(d3.axisBottom(x).tickSizeOuter(0));

		// Add Y axis
		const y = d3.scaleLinear().domain([0, 100]).range([height, 0]);

		svgg.append("g").call(d3.axisLeft(y));

		let colorscheme = d3.schemeRdYlGn;
		colorscheme[2] = [colorscheme[5][0], colorscheme[5][4]];

		// color palette = one color per subgroup
		const color = d3
			.scaleOrdinal()
			.domain(subgroups)
			.range(colorscheme[subgroups.length].reverse());

		//stack the data? --> stack per subgroup
		const stackedData = d3.stack().keys(subgroups)(data);

		// Show the bars
		svgg
			.append("g")
			.selectAll("g")
			// Enter in the stack data = loop key per key = group per group
			.data(stackedData)
			.join("g")
			.attr("fill", (d) => color(d.key))
			.selectAll("rect")
			// enter a second time = loop subgroup per subgroup to add all rectangles
			.data((d) => d)
			.join("rect")
			.attr("x", (d) => x(d.data.grade))
			.attr("y", (d) => y(d[1]))
			.attr("height", (d) => y(d[0]) - y(d[1]))
			.attr("width", x.bandwidth());

		svgg
			.append("text")
			.attr("class", "x label")
			.attr("font-weight", "bold")
			.attr("text-anchor", "end")
			.attr("x", width / 2 + 20)
			.attr("y", height + 40)
			.text("Year Level");

		svgg
			.append("text")
			.attr("class", "y label")
			.attr("text-anchor", "end")
			.attr("font-weight", "bold")
			.attr("y", -40)
			.attr("x", -40)
			.attr("dy", ".75em")
			.attr("transform", "rotate(-90)")
			.text("Percentage of Respondents (%)");

		if (png) {
			var canvas = svgContainer
				.append("canvas")
				.attr("id", "canvas")
				.attr("width", width + margin.left + margin.right)
				.attr("height", height + margin.top + margin.bottom);

			var context = canvas.node().getContext("2d");

			Canvg.fromString(context, svg.html()).render();

			var img = canvas.node().toDataURL("image/png");

			d3.select("custom").remove();

			return img;
		}
	});
};

export const scatterChart = (key, png = false) => {
	return;
	d3.select("canvas").remove();
	// Get the data
	d3.csv(csv_url)
		.then((data) => {
			var svgContainer = d3
				.select("#viz")
				.select("canvas")
				.attr("width", 500)
				.attr("height", 500);

			var aggregated_scores = d3.rollup(
				data.filter((s) => {
					return ["M", "F"].includes(s.gender);
				}),
				(v) => v.length,
				(d) => d.gender,
				(d) => d.grade
			);

			var tdata = Array.from(aggregated_scores, (value) => ({
				...percentages(Object.fromEntries(value[1]), true),
				gender: value[0],
			}));

			tabulate(tdata, Object.keys(tdata[0]), svgContainer);

			return;

			// set the dimensions and margins of the graph
			var margin = { top: 20, right: 20, bottom: 30, left: 50 },
				width = 960 - margin.left - margin.right,
				height = 500 - margin.top - margin.bottom;

			// set the ranges
			var x = d3.scaleLinear().range([0, width]);
			var y = d3.scaleLinear().range([height, 0]);

			// append the svg obgect to the body of the page
			// appends a 'group' element to 'svg'
			// moves the 'group' element to the top left margin
			var svg = svgContainer
				.append("svg")
				.attr("width", width + margin.left + margin.right)
				.attr("height", height + margin.top + margin.bottom)
				.append("g")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

			// format the data
			data = data.map((d) => ({
				csi: parseFloat(d["CSI-4"]),
				gad: parseFloat(d["GAD-2"]),
			}));

			// Scale the range of the data
			x.domain([0, d3.max(data, (d) => d.csi)]);
			y.domain([0, d3.max(data, (d) => d.gad)]);

			// Add the scatterplot
			svg
				.selectAll("dot")
				.data(data)
				.enter()
				.append("circle")
				.attr("r", 5)
				.attr("cx", (d) => x(d.csi))
				.attr("cy", (d) => y(d.gad));

			// Add the X Axis
			svg
				.append("g")
				.attr("transform", "translate(0," + height + ")")
				.call(d3.axisBottom(x));

			// Add the Y Axis
			svg.append("g").call(d3.axisLeft(y));
		})
		.catch((reason) => console.log(reason));

	if (png) {
		var image = canvas.toDataURL("image/png");
		stackedBarChart(key);
		return image;
	}
};

export const table = (key, pdfmake = false) => {
	if (!pdfmake) {
		d3.select("table").remove();
	}

	// Get the data
	return get_data(key).then(({ data }) => {
		var table = tabulate(
			data,
			Object.keys(data[0]),
			pdfmake ? d3.select(document.createElement("custom")) : d3.select(`#viz`)
		);
		if (pdfmake) {
			var table_html_text = `<table>${table.html()}</table>`;
			d3.select("custom").remove();
			return table_html_text;
		}
	});
};
