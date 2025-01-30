import {
	join
} from "@std/path";

import svgToPng from "@pumpn/svg-to-png";

const {
	args: [namesString],
	cwd,
	readDir
} = Deno;

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

const variants = [
	"transparent",
	"base",
	"social",
	"wide"
];

for (const name of names) {
	console.info(`Converting to png for project "${name}"`);

	const projectFolderPath = join(projectsFolderPath, name);

	for (const variant of variants) {
		const logoSvgFilePath = join(projectFolderPath, `${variant}.svg`);
		const logoPngFilePath = logoSvgFilePath.replace(/\.svg$/v, ".png");

		await svgToPng(logoSvgFilePath, logoPngFilePath);
	}
}
