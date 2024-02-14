# 安装

Clash Nyanpasu 目前支持 Windows 7 及更高版本、Linux 以及 macOS 10.15 及以上版本。

- 目前不支持 Windows ARM64 版本，待 Clash Rust 支持后，将考虑提供支持。
- Linux 版本目前不支持 ARM 架构，预计在 1.5.0 版本发布后，将考虑提供支持。

::: info 提示

[GitHub Release](https://github.com/LibNyanpasu/clash-nyanpasu/releases) 页面中包含的一些名词解释：

- `amd64` - x86_64，常规的电脑选这个
- `aarch64` - armv8/arm64/armv9 使用 ARM CPU 的电脑选这个

目前计划只支持

:::

## Windows

::: warning 注意
1.5.0 开始，**Clash Nyanpasu** 不再提供 `MSI` 安装包。
:::

首先，请确保您的系统已安装 Webview2 运行时。如果您的系统未安装 Webview2 运行时，您可以从 [Microsoft 官方网站](https://developer.microsoft.com/en-us/microsoft-edge/webview2/) 下载并安装。

### NSIS

请从 [GitHub Release](https://github.com/LibNyanpasu/clash-nyanpasu/releases) 页面下载最新版本的 `Clash.Nyanpasu_x.y.z_x64-setup.exe`。

### 便携版

::: warning 注意
请留意，Tauri 官方并 **不支持** 便携版。  
由 Clash Nyanpasu 提供的便携版[^1]是通过自动打包流程生成的，且显式忽略了 Webview2 的检测，因此可能会遇到一些问题。我们计划在未来坚持便携版不修改注册表的原则。因此，部分功能可能 **无法** 正常工作：

- **系统服务**：由于 `clash-verge-service` 会进行服务注册和修改注册表，这与便携版的原则相违背，所以我们计划将其从便携版中移除。
- **通知功能**：便携版在 Windows 10 上无法使用系统通知，因此后端一些触发通知的操作将不可见。
- **快捷导入**（Custom Schema）：鉴于便携版无法修改注册表，该功能将不被支持。

:::

从 [GitHub Release](https://github.com/LibNyanpasu/clash-nyanpasu/releases) 页面下载最新版本的 `Clash.Nyanpasu_x.y.z_x64_portable.zip`，解压后运行。

## MacOS

从 [GitHub Release](https://github.com/LibNyanpasu/clash-nyanpasu/releases) 页面下载最新版本的 `Clash.Nyanpasu_x64.app.tar.gz`（Intel CPU）或 `Clash.Nyanpasu.aarch64.app.tar.gz`（M 系列 CPU），正常安装即可。

如果遇到安装问题，请参考 [常见问题](../others/faq)。

## Linux

Linux 下由于 AppImage 的限制，我们更建议使用 **包管理器** 安装或者自行编译。

目前 Tauri 2 正在测试阶段，等其正式发布后，我们会引入 RPM 的支持，以及潜在的 FlatPak 支持[^2]。

::: info 提示

如果使用 **包管理器** 或自行编译的程序，请 **不要** 使用 <u>应用内更新</u> 的功能。

:::

### Debian/Ubuntu

使用 _第三方 PPA 源_ 或 从 [GitHub Release](https://github.com/LibNyanpasu/clash-nyanpasu/releases) 页面下载最新版本的 `deb` 包。

#### 使用 Deb 包安装

从 [GitHub Release](https://github.com/LibNyanpasu/clash-nyanpasu/releases) 页面下载最新版本的 `clash-nyanpasu_x.y.z_amd64.deb`。

然后在终端中执行：

```bash
sudo apt install -y ./clash-nyanpasu_x.y.z_amd64.deb
```

### ArchLinux

目前由爱好者提供了 AUR：[稳定版（编译）](https://aur.archlinux.org/packages/clash-nyanpasu) / [稳定版二进制包](https://aur.archlinux.org/packages/clash-nyanpasu-bin) or [开发版（编译）](https://aur.archlinux.org/packages/clash-nyanpasu-git).

以下是使用 `paru` 安装 AUR 包的示范：

::: code-group

```bash [稳定版（编译）]
paru -Syy clash-nyanpasu
```

```bash [稳定版二进制包]
paru -Syy clash-nyanpasu-bin
```

```bash [开发版（编译）]
paru -Syy clash-nyanpasu-git
```

:::

### AppImage

::: danger 警告

由于开发组缺乏 Linux DE 的环境，因此 AppImage 环境中出现的问题无法得到及时修复。

目前的已知问题：

- 无法更新内核程序
- 无法检测内核程序版本
- 可能的无法提权导致 TUN 无法使用

:::

从 [GitHub Release](https://github.com/LibNyanpasu/clash-nyanpasu/releases) 页面下载最新版本的 `clash-nyanpasu_x.y.z_amd64.AppImage`，然后双击运行它。

如果你想要在终端中运行，可以使用以下命令：

```bash
chmod +x ./clash-nyanpasu_x.y.z_amd64.AppImage
./clash-nyanpasu_x.y.z_amd64.AppImage
```

如果你需要自动启动，可能需要编写 `.desktop` 文件。

## 引用

[^1]: 便携版定义：https://zh.wikipedia.org/wiki/%E7%B6%A0%E8%89%B2%E8%BB%9F%E9%AB%94
[^2]: Flatpak 支持工作还没有完成：https://github.com/tauri-apps/tauri/issues/3619
