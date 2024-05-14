# 开发

## 开发守则

- 项目使用 ESLint、Prettier、Stylelint、Clippy、Rustfmt 等工具进行代码风格检查。请在提交代码前确保代码风格正确。
  - 请不要使用 `git -n` 跳过代码风格检查。我们以后会在 CI/CD 中加入代码风格检查。
- 请不要提交无用的代码、文件、文件夹。
- 如果涉及大的功能重构，或者是新功能，请先在 issue 中提出，以便讨论。

## 环境要求

不管使用什么系统，以下依赖都是必须的：

- Rust v1.78 或更高的稳定版本
  - 在 Windows 下务必使用 MSVC 工具链
- Node.js v20 LTS 或更新的 LTS、Latest 版本
- PNPM v9 或更高的稳定版本
- git

此外，我们还需要一些额外依赖以确保项目正常构建：

- cmake - 由 `zip` crate 引入的要求
- llvm - 由 `rquickjs` 或 `rocksdb` 引入的要求
- patch - 由 `rquickjs` 引入的要求

### Windows

在 Windows 下，还需要遵循以下建议：

- 首次开启项目使用管理员权限，`patch` 指令需要管理员权限才能执行。
- 通过 `scoop`、`choco`、`winget` 安装 `gsudo`（当然 Windows 11 自带的 sudo 也是可以的）——方便进行终端提权操作。

## 准备

在开发之前，我们需要对项目的一些环境进行初始化。

首先，我们需要安装前端依赖：

```bash
pnpm i
```

此外，我们还需要下载内核、资源文件等 sidecar、resource 二进制文件。

> 此指令支持使用终端代理，如果网络连通性有问题，请使用代理。

```bash
pnpm check
```

如果发现文件缺失，或者想强制更新资源文件，可以使用以下指令：

```bash
pnpm check --force
```

## 开发

目前我们提供了两个便捷指令来启动开发环境。通常我们更建议使用专用的开发实例。

- 启动专用的开发实例

```bash
pnpm dev:diff
```

- 启动和发布程序行为类似的开发实例

```bash
pnpm dev
```
