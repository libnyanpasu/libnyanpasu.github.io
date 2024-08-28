# Installation

Clash Nyanpasu currently supports Windows 7 and higher, Linux, and macOS 10.15 and higher.

- The Windows ARM64 version is not currently supported and will be considered for support once it is supported by Clash Rust.
- The Linux version does not currently support the ARM architecture and will be considered for support after the 1.5.0 release.

::: info Tips

Some explanations of terms included in the [GitHub Release](https://github.com/LibNyanpasu/clash-nyanpasu/releases) page:

- `amd64` - x86_64, for regular computers this is the one to choose
- `aarch64` - armv8/arm64/armv9 for computers with ARM CPUs.

The current program only supports the `amd64` and `aarch64` architectures.
:::

## Windows

::: warning Note
Starting with 1.5.0, **Clash Nyanpasu** no longer provides `MSI` installers.
:::

First, please make sure that the Webview2 runtime is installed on your system. If your system does not have the Webview2 runtime installed, you can download and install it from [Microsoft official site](https://developer.microsoft.com/en-us/microsoft-edge/webview2/).

### NSIS

Please download the latest version of `Clash.Nyanpasu_x.y.z_x64-setup.exe` from [GitHub Release](https://github.com/LibNyanpasu/clash-nyanpasu/releases).

### Portable version

::: warning Note
Please note that Tauri does not officially **support** the portable version.
The portable version[^1] provided by Clash Nyanpasu is generated through an automated packaging process and explicitly ignores Webview2 detection, so some problems may be encountered. We plan to stick to the principle that the portable version does not modify the registry in the future. As a result, some features may **not** work properly:

- **System services**: Since `nyanpasu-service` registers services and modifies the registry, which is against the principles of the portable version, we plan to **remove it** from the portable version.
- **Notifications**: The Portable Edition does not have access to system notifications on Windows 10, so some of the back-end actions that trigger notifications will not be visible.
- **Shortcut Import** (Custom Schema): Given that the Portable Edition cannot modify the registry, this feature will be **Removed**.

:::

Download the latest version of `Clash.Nyanpasu_x.y.z_x64_portable.zip` from the [GitHub Release](https://github.com/LibNyanpasu/clash-nyanpasu/releases) page, unzip it and run it.

## MacOS

Download the latest version of `Clash.Nyanpasu_x64.app.tar.gz` (Intel CPU) or `Clash.Nyanpasu.aarch64.app.tar.gz` (M-series CPUs) and install it normally.

If you encounter installation issues, please refer to [FAQ](../others/faq).

## Linux

For Linux, due to the limitations of AppImage, we recommend using **Package Manager** to install or compile the program yourself.

Tauri 2 is currently in beta, and when it is released we will introduce more package support, potentially FlatPak support[^2].

::: warning Note
Installation via package management is currently not supported:

- In-app updates
- Kernel updates

Note: `AppImage` supports in-app updates.
:::

### Debian/Ubuntu

Download the latest version of the `deb` package using a _third-party PPA source_ or from the [GitHub Release](https://github.com/LibNyanpasu/clash-nyanpasu/releases) page.

#### Installation using Deb packages

Download the latest version of `clash-nyanpasu_x.y.z_amd64.deb` from the [GitHub Release](https://github.com/LibNyanpasu/clash-nyanpasu/releases) page.

Then execute it in the terminal:

```bash
sudo apt install -y ./clash-nyanpasu_x.y.z_amd64.deb

```

### ArchLinux

AUR packages are currently provided by enthusiasts: [Stable (compiled)](https://aur.archlinux.org/packages/clash-nyanpasu) / [Stable binary package](https://aur.archlinux.org/packages/clash- nyanpasu-bin) or [development version (compiled)](https://aur.archlinux.org/packages/clash-nyanpasu-git).

The following is a demonstration of installing AUR packages using `paru`:

::: code-group

```bash [Stable (compilation required)]]
paru -Syu clash-nyanpasu
```

```bash [Stabilized (pre-compiled)]]
paru -Syu clash-nyanpasu-bin
```

```bash [development version (requires compilation)]]
paru -Syu clash-nyanpasu-git
```

:::

### AppImage

::: warning Tip
AppImage has the following known bugs:

- `TUN` authorization is not supported, if you need to use TUN mode, start the `AppImage` package with `sudo`.
- `Clash Rust` is temporarily unavailable and is being [investigated](https://github.com/libnyanpasu/clash-nyanpasu/issues/1448).
- Service mode is not supported at this time
- Kernel updates are not supported at this time

**If you encounter any other problems while using it, feel free to open a new issue feedback**.
:::

Download the latest version of `clash-nyanpasu_x.y.z_amd64.AppImage` from the [GitHub Release](https://github.com/LibNyanpasu/clash-nyanpasu/releases) page, then double-click to run it.

If you want to run it in a terminal, you can use the following command:

```bash
chmod +x ./clash-nyanpasu_x.y.z_amd64.AppImage
./clash-nyanpasu_x.y.z_amd64.AppImage

```

If you need to autostart, you may need to write a `.desktop` file.
Below is a sample `.desktop` file that you can place in the `/usr/share/applications` or `~/.local/share/applications/` directory.
First, let's download the icon for `Clash Nyanpasu`: ::.
::: code-group

```bash [user directory]
mkdir -p ~/.local/share/icons/clash-nyanpasu
wget -O ~/.local/share/icons/clash-nyanpasu/clash-nyanpasu.png https://raw.githubusercontent.com/libnyanpasu/clash-nyanpasu/main/ frontend/nyanpasu/src/assets/image/logo-box.png
```

```bash [system directory]
sudo mkdir -p /usr/share/icons/clash-nyanpasu
sudo wget -O /usr/share/icons/clash-nyanpasu/clash-nyanpasu.png https://raw.githubusercontent.com/libnyanpasu/clash-nyanpasu/main/ frontend/nyanpasu/src/assets/image/logo-box.png
```

:::

Then we write the `.desktop` file:

```ini
[Desktop Entry]
Categories=Development.
Comment=A Clash GUI based on tauri.
Exec=/path/to/clash-nyanpasu_x.y.z_amd64.AppImage %U # Please change to your AppImage path.
Icon=/path/to/clash-nyanpasu.png # Please replace with the path of the icon you downloaded above.
GenericName=Clash Nyanpasu
Name=Clash Nyanpasu
Terminal=false
Type=Application
Autostart=true # Whether to autostart or not.
```

Update the database:

::: code-group

```bash [user-directory]
update-desktop-database ~/.local/share/applications
```

```bash [system directory]
sudo update-desktop-database /usr/share/applications
```

:::

## Reference

[^1]: Portable definition: https://zh.wikipedia.org/wiki/%E7%B6%A0%E8%89%B2%E8%BB%9F%E9%AB%94

[^2]: Flatpak support is not yet complete: https://github.com/tauri-apps/tauri/issues/3619
