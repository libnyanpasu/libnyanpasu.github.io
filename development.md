# Development

## Development Guidelines

- The project uses tools such as ESLint, Prettier, Stylelint, Clippy, Rustfmt, etc. for code style checking. Please make sure the code is styled correctly before committing it.
  - Please do not use `git -n` to skip code style checks. We have now added code style checking to CI.
- Please do not commit useless code, files, or directories.
- If it involves a big feature refactoring or a new feature, please raise it in an issue first so that it can be discussed.

## Environment Requirements

The following dependencies are required regardless of the system used:

- Rust v1.78 or later stable version.
  - Be sure to use the MSVC toolchain on Windows.
- Node.js v20 LTS or a newer LTS/Latest version.
- pnpm v9 or later stable version
- git

There are also a few additional dependencies we'll need to ensure the project builds properly:

- cmake - Requirements introduced by the `zip` crate.
- llvm - Required by `rquickjs` or `rocksdb`.
- patch - Requirements introduced by `rquickjs`.

### Windows

On Windows, the following recommendations should also be followed:

- Open the project for the first time with administrator permission. The `patch` command requires administrator permission to execute.
- Install `gsudo` via `scoop`, `choco`, or `winget` (of course Windows 11 comes with sudo as well) for easy terminal lifting.

## Preparation

Before development, we need to initialize some environments for the project.

First, we need to install the front-end dependencies:

`bash
pnpm i
`

In addition, we need to download the cores, resource files, etc., for the sidecar and resource binary files.

> This command supports the use of terminal proxies. If network connectivity is an issue, use a proxy.

```bash
pnpm check
```

If you find a missing file or want to force an update of the resource file, you can use the following commands:

```bash
pnpm check --force
```

## Development

We currently provide two convenience commands to start the development environment. Usually we prefer to use a dedicated development instance.

- Start the dedicated development instance:

```bash
pnpm dev:diff
```

- Launch a development instance with behavior similar to that of the distributor:

```bash
pnpm dev
```
