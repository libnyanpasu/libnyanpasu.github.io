# 安装

Clash Nyanpasu 目前支持 Windows 7 及更高版本、Linux 以及 macOS 10.15 及更高版本。

- 目前不支持 Windows Arm64 版本，待 Clash Rust 支持后，将考虑提供支持。
- Linux 版本目前不支持 Arm 架构，预计在 1.5.0 版本发布后，将考虑提供支持。

::: info 提示

[GitHub Releases](https://github.com/libnyanpasu/clash-nyanpasu/releases) 页面中包含的一些名词解释：

- `x86` - i386/i686，32 位系统选这个
- `amd64` - x64/x86_64，常规电脑选这个
- `aarch64` - armv8/arm64/armv9，使用 Arm CPU 的电脑选这个

目前计划只支持 `x86`、`amd64` 和 `aarch64` 架构。

:::

## Windows

::: warning 注意
1.5.0 开始，**Clash Nyanpasu** 不再提供 MSI 安装包。
:::

首先，请确保您的系统已安装 WebView2 运行时。如果您的系统未安装 WebView2 运行时，您可以从 [Microsoft 官方网站](https://developer.microsoft.com/zh-cn/microsoft-edge/webview2) 下载并安装。

### 安装包

请从 [GitHub Releases](https://github.com/libnyanpasu/clash-nyanpasu/releases) 页面下载最新版本的 `Clash.Nyanpasu_x.y.z_x64-setup.exe` 并安装。

### 便携版

::: warning 注意
请留意，Tauri 官方并 **不支持** 便携版。
由 Clash Nyanpasu 提供的便携版[^1]是通过自动打包流程生成的，且显式忽略了 WebView2 的检测，因此可能会遇到一些问题。我们计划在未来坚持便携版不修改注册表的原则。因此，部分功能可能 **无法** 正常工作：

- **系统服务**：由于 `nyanpasu-service` 会进行服务注册和修改注册表，这与便携版的原则相违背，所以我们计划将其从便携版中 **移除**。
- **通知功能**：便携版在 Windows 10/11 上无法使用系统通知，因此后端一些触发通知的操作将不可见。
- **快捷导入**（Custom Schema）：鉴于便携版无法修改注册表，该功能将被 **移除**。

:::

从 [GitHub Releases](https://github.com/libnyanpasu/clash-nyanpasu/releases) 页面下载最新版本的 `Clash.Nyanpasu_x.y.z_x64_portable.zip`，解压后运行。

## macOS

从 [GitHub Releases](https://github.com/libnyanpasu/clash-nyanpasu/releases) 页面下载最新版本的 `Clash.Nyanpasu_x64.app.tar.gz`（Intel CPU）或 `Clash.Nyanpasu.aarch64.app.tar.gz`（M 系列 CPU），正常安装即可。

如果遇到安装问题，请参考 [常见问题](../others/faq)。

## Linux

Linux 下由于 AppImage 的限制，我们更建议使用 **包管理器** 安装或自行编译。

目前 Tauri 2 正在测试阶段，等其正式发布后，我们会引入更多包的支持，以及潜在的 FlatPak 支持[^2]。

::: warning 注意
目前通过包管理器安装不支持：

- 应用内更新
- 更新内核

注：AppImage 支持应用内更新。
:::

### Debian/Ubuntu

使用 _第三方 PPA 源_ 或 从 [GitHub Releases](https://github.com/libnyanpasu/clash-nyanpasu/releases) 页面下载最新版本的 DEB 包。

#### 使用 DEB 包安装

从 [GitHub Releases](https://github.com/libnyanpasu/clash-nyanpasu/releases) 页面下载最新版本的 `clash-nyanpasu_x.y.z_amd64.deb`。

然后在终端中执行：

```bash
sudo apt install -y ./clash-nyanpasu_x.y.z_amd64.deb
```

### ArchLinux

目前由爱好者提供了 AUR 软件包：[稳定版（需要编译）](https://aur.archlinux.org/packages/clash-nyanpasu) / [稳定版二进制包](https://aur.archlinux.org/packages/clash-nyanpasu-bin) / [开发版（需要编译）](https://aur.archlinux.org/packages/clash-nyanpasu-git).

以下是使用 `paru` 安装 AUR 包的示范：

::: code-group

```bash [稳定版 (需要编译)]
paru -Syu clash-nyanpasu
```

```bash [稳定版 (预编译)]
paru -Syu clash-nyanpasu-bin
```

```bash [开发版 (需要编译)]
paru -Syu clash-nyanpasu-git
```

:::

### AppImage

::: warning 提示
AppImage 存在以下已知缺陷：

- 不支持 TUN 授权，如果需要使用 TUN 模式，请使用 `sudo` 启动 AppImage 包
- Clash Rust 暂不可用，正在 [调查](https://github.com/libnyanpasu/clash-nyanpasu/issues/1448)
- 暂不支持服务模式
- 暂不支持内核更新

**如果你在使用时碰到其他问题，欢迎新开问题反馈。**

:::

从 [GitHub Releases](https://github.com/libnyanpasu/clash-nyanpasu/releases) 页面下载最新版本的 `clash-nyanpasu_x.y.z_amd64.AppImage`，然后双击运行它。

如果你想要在终端中运行，可以使用以下指令：

```bash
chmod +x ./clash-nyanpasu_x.y.z_amd64.AppImage
./clash-nyanpasu_x.y.z_amd64.AppImage
```

如果你需要开机自启，可能需要编写 `.desktop` 文件。
下面是一个 `.desktop` 文件示范，你可以将它放置到 `/usr/share/applications` 或 `~/.local/share/applications/` 目录下。
首先，我们先下载 `Clash Nyanpasu` 的图标:
::: code-group

```bash [用户目录]
mkdir -p ~/.local/share/icons/hicolor/256x256/apps/clash-nyanpasu
wget -O ~/.local/share/icons/hicolor/256x256/apps/clash-nyanpasu/clash-nyanpasu.png https://raw.githubusercontent.com/libnyanpasu/clash-nyanpasu/main/frontend/nyanpasu/src/assets/image/logo-box.png
```

```bash [系统目录]
sudo mkdir -p /usr/share/icons/hicolor/256x256/clash-nyanpasu
sudo wget -O /usr/share/icons/hicolor/256x256/clash-nyanpasu/clash-nyanpasu.png https://raw.githubusercontent.com/libnyanpasu/clash-nyanpasu/main/frontend/nyanpasu/src/assets/image/logo-box.png
```

:::

然后，我们编写 `.desktop` 文件：

```ini
[Desktop Entry]
Type=Application
Name=Clash Nyanpasu
GenericName=Clash GUI
Comment=A Clash GUI based on Tauri.
# 请换成你的 AppImage 路径
Exec=/your/appimage/path %U
Icon=clash-nyanpasu
Terminal=false
Categories=Development;
# 是否开机自启
X-Autostart=true

```

更新一下数据库：

::: code-group

```bash [用户目录]
gtk-update-icon-cache ~/.local/share/icons/hicolor
update-desktop-database ~/.local/share/applications
```

```bash [系统目录]
sudo gtk-update-icon-cache /usr/share/icons/hicolor
sudo update-desktop-database /usr/share/applications
```

:::

## 引用

[^1]: 便携版定义：[绿色软件 - 维基百科，自由的百科全书](https://zh.wikipedia.org/zh-cn/%E7%B6%A0%E8%89%B2%E8%BB%9F%E9%AB%94)

[^2]: Flatpak 支持工作还没有完成：https://github.com/tauri-apps/tauri/issues/3619
