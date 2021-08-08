import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { stackedBarChart, table } from "./Charts";
import * as htmlToPdfmake from "html-to-pdfmake";
import { scale_meanings } from "../constants";

pdfMake.vfs = pdfFonts.pdfMake.vfs;
pdfMake.fonts = {
	Roboto: {
		normal: "Roboto-Regular.ttf",
		bold: "Roboto-Medium.ttf",
		italics: "Roboto-Italic.ttf",
		bolditalics: "Roboto-Italic.ttf",
	},
};

const pdfContent = (sections) => {
	const pageSize = { width: 595.28, height: 841.89 };
	let content = [
		{
			text: `Mental Health Survey Report \n
						 Resilient Youth Australia\n
						 Date ${new Date().toDateString()}`,
			fontSize: 20,
			alignment: "center",
			margin: [15, 15],
			pageBreak: "after",
		},
	];
	sections.forEach((section, si) => {
		var table = htmlToPdfmake(section.table);
		table[0].alignment = "center";
		content.push({
			text: section.heading,
			fontSize: 20,
			alignment: "center",
			margin: [15, 15],
			// If it is the first section, do not insert a pageBreak.
			pageBreak: si === 0 ? null : "before",
		});
		content.push({
			text: section.subheading,
			fontSize: 12,
			alignment: "center",
			margin: [15, 15],
		});
		section.images.forEach((image, j) => {
			content.push({
				image,
				alignment: "center",
				width: pageSize.width * 0.8,
				height: pageSize.height * 0.4,
				pageBreak: j !== 0 ? "before" : null,
			});
		});
		content.push(table);
	});
	return content;
};

export const printPdf = async (pages) => {
	var fs = require("fs");

	var sections = await Promise.all(
		pages.map(async (page) =>
			Promise.all([stackedBarChart(page, true), table(page, true)]).then(
				(values) => ({
					heading: `${page.toUpperCase()} Overview`,
					subheading: `${scale_meanings[page]}`,
					images: values[0] ? [values[0]] : [],
					table: values[1],
				})
			)
		)
	);

	var docDefinition = {
		pageSize: "A4",
		pageOrientation: "portrait",
		pageMargins: [40, 60, 40, 60],
		content: pdfContent(sections),
		footer: (currentPage) => [
			{
				text: "Page " + currentPage.toString(),
				alignment: currentPage % 2 === 0 ? "left" : "right",
				style: "normalText",
				bold: true,
				margin: [10, 10, 10, 10],
			},
			{
				text: "\u00A9 Resilient Youth Australia Pty Ltd, 2020 (ABN 19 636 065 711). All Rights Reserved.\nConnected, Protected, Respected\u00AE is the Registered Trademark of Resilient Youth Australia Pty Ltd.",
				alignment: "center",
				style: "normalText",
				fontSize: 10,
				margin: [0, 0, 0, 0],
			},
		],
		pageBreakBefore: (currentNode, followingNodesOnPage) =>
			currentNode.headlineLevel === 1 && followingNodesOnPage.length === 0,
	};

	pdfMake.createPdf(docDefinition).download(`pdf-${+new Date()}.pdf`);
};
