// Copyright (c) 2019 Ivan Maksimović

// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:

// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

/* eslint-disable max-statements */
import {
	basename, dirname, join, toFileUrl
} from "@std/path";

import { launch } from "@astral/astral";
import { sleep } from "@radashi-org/radashi";

import {
	baseSvgContent, textSvgContentPrefix, textSvgContentSuffix
} from "./create-base/_exports.js";

const {
	args: [namesString],
	cwd,
	mkdir,
	readDir,
	writeTextFile
} = Deno;

console.warn("This is not quite working yet...create the base of new logos by copying the template logo and changing the text in Adobe Illustrator.");

// A lot of the code here is based on or straight up yanked from https://github.com/ivnmaksimovic/fitr-svg-text.
// See the license at the top of this file.
// This blog post was also helpful: https://loga.nz/blog/measuring-line-height/

const projectsFolderPath = join(cwd(), "projects");

if (namesString === undefined) {
	throw new Error("Project names are required");
}

let names = namesString.split(",");

if (namesString === "all") {
	const projectsFolderEntries = await Array.fromAsync(readDir(projectsFolderPath));

	names = projectsFolderEntries
		.filter((entry) => entry.isDirectory)
		.map((entry) => entry.name);
}

for (const name of names) {
	console.info(`Creating base for project "${name}"`);

	const projectFolderPath = join(projectsFolderPath, name);

	await mkdir(projectFolderPath, { recursive: true });

	const transparentLogoFilePath = join(projectFolderPath, "transparent.svg");

	const logoFileContent = baseSvgContent
		.replace(/(?=<\/svg>\s*$)/v, `${textSvgContentPrefix}${name}${textSvgContentSuffix}`);

	await writeTextFile(transparentLogoFilePath, logoFileContent);

	const browser = await launch();

	const scriptFilePath = import.meta.filename;

	if (scriptFilePath === undefined) {
		throw new Error("Script file path is undefined");
	}

	const scriptsFolderPath = dirname(scriptFilePath);

	const scriptFileName = basename(scriptFilePath);

	const dependenciesFolderPath = join(scriptsFolderPath, scriptFileName.replace(/\.js$/v, ""));

	const canvasFilePath = join(dependenciesFolderPath, "canvas.html");

	const canvasPage = await browser.newPage(toFileUrl(canvasFilePath).toString());

	await canvasPage.waitForSelector("canvas");

	await canvasPage.waitForNetworkIdle();

	await canvasPage.evaluate(async () => {
		const canvasElement = document.querySelector("canvas");

		if (canvasElement === null) {
			throw new Error("Canvas element not found");
		}

		canvasElement.setAttribute("width", "2296");
		canvasElement.setAttribute("height", "3056");

		const context = canvasElement.getContext("2d");

		if (context === null) {
			throw new Error("Canvas context not found");
		}

		const fontFace = new FontFace("InterVariable", "url(\"https://rsms.me/inter/font-files/InterVariable.woff2?v=4.1\")");

		await fontFace.load();

		context.font = "900 1em Inter";

		context.measureText("hello world");
	});

	await sleep(2_000);

	const bbox = await canvasPage.evaluate(
		({ name }) => {
			const canvasElement = document.querySelector("canvas");

			if (canvasElement === null) {
				throw new Error("Canvas element not found");
			}

			const context = canvasElement.getContext("2d");

			if (context === null) {
				throw new Error("Canvas context not found");
			}

			context.fillText(name, 2_296 / 2, 3_056 / 2);

			/**
			 *
			 * @param context.context
			 * @param context - The root object
			 * @param text
			 * @param context.text
			 * @example
			 */
			const getTextBBox = ({ context: innerContext, text }) => {
				const metrics = innerContext.measureText(text);
				const left = metrics.actualBoundingBoxLeft * -1;
				const top = metrics.actualBoundingBoxAscent * -1;
				const right = metrics.actualBoundingBoxRight;
				const bottom = metrics.actualBoundingBoxDescent;
				// actualBoundinBox... excludes white spaces
				const innerWidth = text.trim() === text ? right - left : metrics.width;
				const height = bottom - top;

				return {
					bottom,
					fakeHeight: metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent,
					fakeWidth: metrics.width,
					height,
					left,
					right,
					top,
					width: innerWidth
				};
			};

			return getTextBBox({
				context,
				text: name
			});
		},
		{ args: [{ name }] }
	);

	await canvasPage.goto(toFileUrl(transparentLogoFilePath).toString());

	await canvasPage.waitForSelector("text");

	const fixedSvgContent = await canvasPage.evaluate(
		({
			fakeHeight,
			fakeWidth,
			height: actualTextHeight,
			left,
			right,
			top,
			width: actualTextWidth
		}) => {
			const textElement = document.querySelector("text");

			if (textElement === null) {
				throw new Error("Text element not found");
			}

			const textBoxElement = textElement.parentElement;

			if (textBoxElement === null) {
				throw new Error("Text box element not found");
			}

			const textPositionerBoxElement = textBoxElement.parentElement;

			if (textPositionerBoxElement === null) {
				throw new Error("Text position box element not found");
			}

			const parentSvgElement = textPositionerBoxElement.parentElement;

			if (parentSvgElement === null) {
				throw new Error("Parent svg element not found");
			}

			parentSvgElement.setAttribute("width", "2296");
			parentSvgElement.setAttribute("height", "3056");

			/**
			 * Sets default text width and height as viewbox so text proportions can be kept, while
			 * reseting viewbox to be exactly same as current text size.
			 * It also sets y coord because text gets verticaly aligned after reseting viewbox. Why?
			 *
			 * @param {object} options - The options object;
			 * @param {number} options.textWidth - text width with default font size and viewbox
			 * @param {number} options.textHeight - text height with default font size and viewbox
			 * @param {number} options.width - wanted textWidth set in props
			 * @param {number} options.maxHeight - wanted max height set in props when name is for example few chars
			 * @param {number} options.parentSvgHeight - height of svg container, where FitrSvgText is rendered
			 * @returns {Record<string, number|string>} - The object with new viewbox, width, x and y values
			 * @example
			 */
			const fitSvg = ({
				maxHeight,
				parentSvgHeight,
				textHeight,
				textHeightWithPadding,
				textWidth,
				textWidthWithPadding,
				width
			}) => {
				let height = width * textHeight / textWidth;

				let fixedWidth = width;

				if (height > maxHeight) {
					height = maxHeight;
					fixedWidth = height * textWidth / textHeight;
				}

				const topOffset = (parentSvgHeight - height) / 2;

				// const x = (2_296 / 2) - (fixedWidth / 2);
				const x = 200;
				const y = 2_414 - topOffset;

				// const viewBoxX = -(textWidth / 2);
				const viewBoxX = 0;

				const viewBox = `${viewBoxX + left}, 0, ${textWidth}, ${textHeight}`;

				return {
					textHeightWithPadding,
					textWidth,
					textWidthWithPadding,
					viewBox,
					width: fixedWidth,
					x,
					y
				};
			};

			/**
			 *
			 * @example
			 */
			const getNewDimensions = () => {
				const textWidthWithPadding = textElement.getBBox().width;
				const textWidth = actualTextWidth;
				const textHeightWithPadding = textElement.getBBox().height;
				const textHeight = actualTextHeight;

				const parentSvgHeight = parentSvgElement.getBoundingClientRect().height;

				return fitSvg({
					maxHeight: 884,
					parentSvgHeight,
					textHeight: textHeight - (fakeHeight - textHeightWithPadding),
					textHeightWithPadding,
					textWidth: textWidth - (fakeWidth - textWidthWithPadding),
					textWidthWithPadding,
					width: 1_896
				});
			};

			const {
				textWidth,
				textWidthWithPadding,
				viewBox,
				width,
				x,
				y
			} = getNewDimensions();

			// textElement.setAttribute("dx", String(-left));

			textPositionerBoxElement.setAttribute("width", String(width));
			textPositionerBoxElement.setAttribute("x", String(x));
			textPositionerBoxElement.setAttribute("y", String(y));

			textBoxElement.setAttribute("viewBox", String(viewBox));

			// debug rects
			// const debugRect1 = document.createElementNS("http://www.w3.org/2000/svg", "rect");

			// debugRect1.setAttribute("x", 0);
			// debugRect1.setAttribute("y", 0);
			// debugRect1.setAttribute("width", String(left));
			// debugRect1.setAttribute("height", 100);
			// debugRect1.setAttribute("fill", "red");
			// debugRect1.setAttribute("opacity", "0.2");

			// textBoxElement.append(debugRect1);

			// const debugRect2 = document.createElementNS("http://www.w3.org/2000/svg", "rect");

			// debugRect2.setAttribute("x", 200);
			// debugRect2.setAttribute("y", 2_414);
			// debugRect2.setAttribute("width", 100);
			// debugRect2.setAttribute("height", 100);
			// debugRect2.setAttribute("fill", "green");
			// debugRect2.setAttribute("opacity", "0.2");

			// parentSvgElement.append(debugRect2);

			parentSvgElement.removeAttribute("width");
			parentSvgElement.removeAttribute("height");

			return parentSvgElement.outerHTML;
		},
		{
			args: [bbox]
		}
	);

	await browser.close();

	await writeTextFile(transparentLogoFilePath, fixedSvgContent);
}
