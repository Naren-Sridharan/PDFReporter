var canvasElement = document.getElementById("canvas");

export const printPdf = (action) => {
	var docDefinition = {
		content: [
			{
				alignment: "center",
				text: "Resilient Youth Australia Survey Report",
				style: "header",
				fontSize: 23,
				bold: true,
				margin: [0, 10],
			},
			{
				margin: [0, 0, 0, 10],
				layout: {
					fillColor: function (rowIndex, node, columnIndex) {
						return rowIndex % 2 === 0 ? "#ebebeb" : "#f5f5f5";
					},
				},
				table: {
					widths: ["100%"],
					heights: [20, 10],
					body: [
						[
							{
								text: "SETOR: ADMINISTRATIVO",
								fontSize: 9,
								bold: true,
							},
						],
						[
							{
								text: "FUNÇÃO: DIRETOR DE ENSINO",
								fontSize: 9,
								bold: true,
							},
						],
					],
				},
			},
			{
				style: "tableExample",
				layout: {
					fillColor: function (rowIndex, node, columnIndex) {
						return rowIndex === 0 ? "#c2dec2" : null;
					},
				},
				table: {
					widths: ["30%", "10%", "25%", "35%"],
					heights: [10, 10, 10, 10, 30, 10, 25],
					headerRows: 1,
					body: [
						[
							{
								text: "AGENTE: Não Identificados",
								colSpan: 3,
								bold: true,
								fontSize: 9,
							},
							{},
							{},
							{
								text: "GRUPO: Grupo 1 - Riscos Físicos",
								fontSize: 9,
								bold: true,
							},
						],
						[
							{
								text: "Limite de Tolerância:",
								fontSize: 9,
								bold: true,
							},
							{
								text: "Meio de Propagação:",
								colSpan: 3,
								fontSize: 9,
								bold: true,
							},
							{},
							{},
						],
						[
							{
								text: [
									"Frequência: ",
									{
										text: "Habitual",
										bold: false,
									},
								],
								fontSize: 9,
								bold: true,
							},
							{
								text: [
									"Classificação do Efeito: ",
									{
										text: "Leve",
										bold: false,
									},
								],
								colSpan: 3,
								fontSize: 9,
								bold: true,
							},
							{},
							{},
						],
						[
							{
								text: "Tempo de Exposição:",
								colSpan: 2,
								fontSize: 9,
								bold: true,
							},
							{},
							{
								text: "Medição:",
								colSpan: 2,
								fontSize: 9,
								bold: true,
							},
							{},
						],
						[
							{
								text: "Fonte Geradora:",
								border: [true, true, false, false],
								colSpan: 2,
								fontSize: 9,
								bold: true,
							},
							{},
							{
								text: "Téc. Utilizada:",
								border: [false, true, true, false],
								colSpan: 2,
								fontSize: 9,
								bold: true,
							},
							{},
						],
						[
							{
								text: "Conclusão:",
								border: [true, false, true, true],
								colSpan: 4,
								fontSize: 9,
								bold: true,
							},
							{},
							{},
							{},
						],
						[
							{
								text: "EPIs/EPCs:",
								border: [true, true, false, true],
								colSpan: 3,
								fontSize: 9,
								bold: true,
							},
							{},
							{},
							{
								text: "CAs:",
								border: [false, true, true, true],
								fontSize: 9,
								bold: true,
							},
						],
					],
				},
			},
		],
	};

	if (action === 1) {
		pdfMake.createPdf(docDefinition).getDataUrl(function (dataURL) {
			renderPDF(dataURL, document.getElementById("canvas"));
		});
	} else if (action === 2) {
		var pdf = createPdf(docDefinition);
		pdf.download("PPRA.pdf");
	}
};

// * this is not important for PDFMake, it's here just to render the result *
// It's a Mozilla lib called PDFjs that handles pdf rendering directly on the browser
export const renderPDF = (url, canvasContainer, options) => {
	options = options || { scale: 1.4 };

	function renderPage(page) {
		var viewport = page.getViewport(options.scale);
		var wrapper = document.createElement("div");
		wrapper.className = "canvas-wrapper";
		var canvas = document.createElement("canvas");
		var ctx = canvas.getContext("2d");
		var renderContext = {
			canvasContext: ctx,
			viewport: viewport,
		};

		canvas.height = viewport.height;
		canvas.width = viewport.width;
		wrapper.appendChild(canvas);
		canvasContainer.appendChild(wrapper);

		page.render(renderContext);
	}

	function renderPages(pdfDoc) {
		for (var num = 1; num <= pdfDoc.numPages; num++)
			pdfDoc.getPage(num).then(renderPage);
	}

	PDFJS.disableWorker = true;
	PDFJS.getDocument(url).then(renderPages);
};
