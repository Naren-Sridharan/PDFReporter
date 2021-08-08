import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { stackedBarChart, table } from "./Charts";
import * as htmlToPdfmake from "html-to-pdfmake";

pdfMake.vfs = pdfFonts.pdfMake.vfs;
pdfMake.fonts = {
	Roboto: {
		normal: "Roboto-Regular.ttf",
		bold: "Roboto-Medium.ttf",
		italics: "Roboto-Italic.ttf",
		bolditalics: "Roboto-Italic.ttf",
	},
};

/**
 * @desc pdf content
 * @param {Array} sections
 * @param {Number} pageWidth Width in inches
 * @param {Number} pageHeight Width in inches
 * @return title, pageSize, content, pageMargin
 * */
const pdfContent = (sections) => {
	let content = [];
	sections.forEach((section, si) => {
		var table = htmlToPdfmake(section.table);
		console.log(table);
		content.push({
			text: section.heading || `Section ${si + 1}`,
			fontSize: 20,
			alignment: "center",
			margin: [15, 15],
			// If it is the first section, do not insert a pageBreak.
			pageBreak: si === 0 ? null : "before",
		});
		section.images.forEach((image, j) => {
			content.push({
				image,
				alignment: "center",
				width: 5 * 0.7,
				pageBreak: j !== 0 ? "before" : null,
			});
		});
		content.push(table);
	});
	return content;
};

/**
 * @desc Print pdf for the puzzles
 * @param {Array} sections
 * @param {Number} pageWidth Width in inches
 * @param {Number} pageHeight Width in inches
 * */
export const printPdf = async (pages) => {
	var fs = require("fs");

	var sections = await Promise.all(
		pages.map(async (page) =>
			Promise.all([stackedBarChart(page, true), table(page, true)]).then(
				(values) => ({
					heading: `${page} Overview`,
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
		footer: function (currentPage, pageCount, pageSize) {
			return [
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
			];
		},
		pageBreakBefore: function (
			currentNode,
			followingNodesOnPage,
			nodesOnNextPage,
			previousNodesOnPage
		) {
			return (
				currentNode.headlineLevel === 1 && followingNodesOnPage.length === 0
			);
		},
	};

	// console.log(docDefinition);
	pdfMake.createPdf(docDefinition).download(`pdf-${+new Date()}.pdf`);
};
