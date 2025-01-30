import {
	join
} from "@std/path";

const {
	args: [namesString],
	cwd,
	readDir,
	readTextFile,
	writeTextFile
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

for (const name of names) {
	console.info(`Generating variants for project "${name}"`);

	const projectFolderPath = join(projectsFolderPath, name);

	const transparentLogoFilePath = join(projectFolderPath, "transparent.svg");

	const logoFileContent = await readTextFile(transparentLogoFilePath);

	const logoAsSymbol = logoFileContent
		.replaceAll(
			/^<svg\s+xmlns="[^"]+"\s+viewBox="(?<viewBox>[^"]+)"\s+>(?<content>.*?)<\/svg>/gmsv,
			"<symbol viewBox=\"$<viewBox>\" id=\"logo\">$<content></symbol>"
		);

	const baseLogoContentPrefix = `
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 4000 4000"
		>
			<defs>
	`;

	const baseLogoContentSuffix = `
			</defs>
			<rect
				width="100%"
				height="100%"
				fill="white"
			/>
			<use
				href="#logo"
				width="2296"
				height="3056"
				x="852"
				y="472"
			/>
		</svg>
	`;

	const baseLogoContent = `${baseLogoContentPrefix}${logoAsSymbol}${baseLogoContentSuffix}`;

	const baseLogoFilePath = join(projectFolderPath, "base.svg");

	await writeTextFile(baseLogoFilePath, baseLogoContent);

	const socialLogoContentPrefix = `
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 1280 640"
		>
			<defs>
	`;

	const socialLogoContentSuffix = `
			</defs>
			<rect
				width="100%"
				height="100%"
				fill="white"
			/>
	
			<use
				href="#logo"
				height="50%"
				y="25%"
			/>
		</svg>
	`;

	const socialLogoContent = `${socialLogoContentPrefix}${logoAsSymbol}${socialLogoContentSuffix}`;

	const socialLogoFilePath = join(projectFolderPath, "social.svg");

	await writeTextFile(socialLogoFilePath, socialLogoContent);

	const wideLogoContentPrefix = `
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="-4000 0 12000 4000"
		>
			<defs>
	`;

	const wideLogoContentSuffix = `
			</defs>
			<rect
				width="4000"
				height="4000"
				fill="white"
			/>
			<use
				href="#logo"
				width="2296"
				height="3056"
				x="852"
				y="472"
			/>
		</svg>
	`;

	const wideLogoContent = `${wideLogoContentPrefix}${logoAsSymbol}${wideLogoContentSuffix}`;

	const wideLogoFilePath = join(projectFolderPath, "wide.svg");

	await writeTextFile(wideLogoFilePath, wideLogoContent);
}
