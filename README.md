![](/.github/assets/repo-banner.png)

<div align="center">
  <h1>Storyblok CLI</h1>
  <p align="center">A powerful CLI for scaffolding <a href="https://www.storyblok.com?utm_source=github.com&utm_medium=readme&utm_campaign=storyblok" target="_blank">Storyblok</a> projects and fieldtypes.</p>
  <br />
</div>

<p align="center">
  <a href="https://npmjs.com/package/storyblok">
    <img src="https://img.shields.io/npm/v/storyblok/latest.svg?style=flat-square" alt="Storyblok JS" />
  </a>
  <a href="https://npmjs.com/package/storyblok" rel="nofollow">
    <img src="https://img.shields.io/npm/dt/storyblok.svg?style=flat-square" alt="npm">
  </a>
</p>

<p align="center">
  <a href="https://discord.gg/jKrbAMz">
   <img src="https://img.shields.io/discord/700316478792138842?label=Join%20Our%20Discord%20Community&style=appveyor&logo=discord&color=09b3af">
   </a>
  <a href="https://twitter.com/intent/follow?screen_name=storyblok">
    <img src="https://img.shields.io/badge/Follow-%40storyblok-09b3af?style=appveyor&logo=twitter" alt="Follow @Storyblok" />
  </a>
  <a href="https://app.storyblok.com/#!/signup?utm_source=github.com&utm_medium=readme&utm_campaign=storyblok-richtext">
    <img src="https://img.shields.io/badge/Try%20Storyblok-Free-09b3af?style=appveyor&logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAABGdBTUEAALGPC/xhBQAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAHqADAAQAAAABAAAAHgAAAADpiRU/AAACRElEQVRIDWNgGGmAEd3D3Js3LPrP8D8WXZwSPiMjw6qvPoHhyGYwIXNAbGpbCjbzP0MYuj0YFqMroBV/wCxmIeSju64eDNzMBJUxvP/9i2Hnq5cM1devMnz984eQsQwETeRhYWHgIcJiXqC6VHlFBjUeXgav40cIWkz1oLYXFmGwFBImaDFBHyObcOzdW4aSq5eRhRiE2dgYlpuYoYSKJi8vw3GgWnyAJIs/AuPu4scPGObd/fqVQZ+PHy7+6udPOBsXgySLDfn5GRYYmaKYJcXBgWLpsx8/GPa8foWiBhuHJIsl2DkYQqWksZkDFgP5PObcKYYff//iVAOTIDlx/QPqRMb/YSYBaWlOToZIaVkGZmAZSQiQ5OPtwHwacuo4iplMQEu6tXUZMhSUGDiYmBjylFQYvv/7x9B04xqKOnQOyT5GN+Df//8M59ASXKyMHLoyDD5JPtbj42OYrm+EYgg70JfuYuIoYmLs7AwMjIzA+uY/zjAnyWJpDk6GOFnCvrn86SOwmsNtKciVFAc1ileBHFDC67lzG10Yg0+SjzF0ownsf/OaofvOLYaDQJoQIGix94ljv1gIZI8Pv38zPvj2lQWYf3HGKbpDCFp85v07NnRN1OBTPY6JdRSGxcCw2k6sZuLVMZ5AV4s1TozPnGGFKbz+/PE7IJsHmC//MDMyhXBw8e6FyRFLv3Z0/IKuFqvFyIqAzd1PwBzJw8jAGPfVx38JshwlbIygxmYY43/GQmpais0ODDHuzevLMARHBcgIAQAbOJHZW0/EyQAAAABJRU5ErkJggg==" alt="Follow @Storyblok" />
  </a>
</p>

## Pre-requisites

- [Node.js >= 18.0.0](https://nodejs.org/en/download/)
- Storyblok account (sign up [here](https://app.storyblok.com/#!/signup?utm_source=github.com&utm_medium=readme&utm_campaign=storyblok-cli))
- Personal access token from Storyblok (get it [here](https://app.storyblok.com/#/me/account?tab=token))

## 🚀 Usage

### Installation

```bash
npm install storyblok -g
```

If you prefer not to install the package globally you can use `npx`:

```bash
npx storyblok <command>
```

## Breaking Changes ⚠️

### `.storyblok` directory as default

All the commands that generate files will now use the `.storyblok` directory as the default directory to interact with those files. This aims to encapsulate all Storyblok CLI operations instead of filling them on the root. Users would be able to customize the directory by using the `--path` flag.

Example:

```bash
storyblok pull-languages --space=12345
```

Will generate the languages in the `.storyblok/languages` directory.

> [!TIP]
> If you prefer to avoid pushing the `.storyblok` directory to your repository you can add it to your `.gitignore` file.

### Generated filename syntax conventions

The generated files will now follow a more consistent naming convention. The files will be named using the following syntax:

```
<filename>.<suffix>.<extension>
```

Where:

- `<filename>` is the name of the file. Customizable by the user with the `--filename` flag
- `<suffix>` is an optional suffix to differentiate the files. By default is going to be the `spaceId` and is customizable by the user with the `--suffix` flag
- `<extension>` is the file extension. By default is `json` (Not configurable)

Example:

```bash
storyblok pull-languages --space=12345 --filename=my-languages --suffix=dev
```

Will generate the languages in the following path  `.storyblok/languages/my-languages.dev.json`

If you would like to use a timestamp as the suffix you can use:

```bash
storyblok pull-languages --space=12345 --filename=my-languages --suffix="$(date +%s)"
```

> [!WARNING]
> The `--filename` will be ignored in the case that `--separate-files` is used on the commands that supports it.

## Setup

First clone the repository and install the dependencies:

```bash
pnpm install
```

Then you can stub and run the CLI with:

```bash
pnpm run dev <command>
```

For example:

```bash
pnpm run dev login
```

### Testing

To run the tests you can use the following command:

```bash
pnpm run test
```

If you prefer a more visual experience while writing tests you can use this command powered by [vitest/ui](https://vitest.dev/guide/ui):

```bash
pnpm run test:ui
```

You can also check the coverage with:

```bash
pnpm run coverage
```

### Debugging

To debug the CLI you can use the `launch.json` configuration in the `.vscode` folder. You can run any command with the debugger attached.

![Debugging](/.github/assets/debug-vscode.png)

Then you can set breakpoints directly to the typescript files and the debugger will handle the rest with sourcempaps.

![Debugging](/.github/assets/breakpoints.png)

### Contributing

Please see our [contributing guidelines](https://github.com/storyblok/.github/blob/main/contributing.md) and our [code of conduct](https://www.storyblok.com/trust-center#code-of-conduct?utm_source=github.com&utm_medium=readme&utm_campaign=storyblok-js).
This project use [semantic-release](https://semantic-release.gitbook.io/semantic-release/) for generate new versions by using commit messages and we use the Angular Convention to naming the commits. Check [this question](https://semantic-release.gitbook.io/semantic-release/support/faq#how-can-i-change-the-type-of-commits-that-trigger-a-release) about it in semantic-release FAQ
