# logos

[![logo of pumpncode/logos][logo-wide]][self]

This is the repository for all the logos for Pumpn Code projects. It includes Adobe Illustrator source files, as well as various ready-to-use variants in SVG and PNG formats. For authors, it also includes scripts to help automate the process of exporting the logos in various formats.

## Getting Started

### Prerequisites

- [Deno][deno]
- [Node.js][node-js]

### Installation

1. Install dependencies for local development:

	```sh
	npm install
	```

## Usage

`<project-names>` below is a comma-separated list of project names. The project names are the names of the directories in the "projects" directory and these folders need to exist except for the `create-base` command.

### Create a base logo for a new project (not really working yet)

```sh
deno task create-base <project-names>
```

### Generate variants of a logo

```sh
deno task generate-variants <project-names>
```

### Convert project logos from SVG to PNG

```sh
deno task convert-to-png <project-names>
```

### Generate variants and convert to PNG in one command (might only work on unix systems)

```sh
deno task process <project-names>
```

## Roadmap

See the [current projects][projects] and the [open issues][issues] for a list of proposed features and known issues.

## Contributing

Any contributions you make are **greatly appreciated**.

See the [contributing guide][contributing]  for ways to get started.

This project has a [code of conduct][code-of-conduct]. By interacting with this repository you agree to follow its terms.

## Contact

Pumpn Code - <office@pumpn.net>

Nano Miratus - [@nnmrts][nnmrts-github] - <nanomiratus@gmail.com>

Project Link: <https://github.com/pumpncode/logos>

## Contributors

| Name | Website | GitHub |
| -- | -- | -- |
| **Nano Miratus** | <https://pumpn.net/> | [**@nnmrts**][nnmrts-github] |

## License

[0BSD][license] © [Pumpn Code][pumpn-website]

[logo-wide]: /projects/logos/wide.svg
[self]: https://github.com/pumpncode/logos
[deno]: https://deno.com
[node-js]: https://nodejs.org
[projects]: https://github.com/pumpncode/logos/projects
[issues]: https://github.com/pumpncode/logos/issues
[contributing]: https://github.com/pumpncode/.github/contributing.md
[code-of-conduct]: https://github.com/pumpncode/.github/code-of-conduct.md
[nnmrts-github]: https://github.com/nnmrts
[license]: /license.md
[pumpn-website]: https://pumpn.net
