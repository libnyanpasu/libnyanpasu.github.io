# Installation

Clash Nyanpasu currently supports Windows 7 and later, Linux, and macOS 10.15 and later.

- The Windows Arm64 variants is not currently supported and will be considered for support once it is supported by Clash Rust.
- The Linux variants does not currently support the Arm architecture and will be considered for support after the 1.5.0 release.

::: info Tips

Some explanations of terms included in the [GitHub Releases](https://github.com/libnyanpasu/clash-nyanpasu/releases) page:

- `x86` - i386/i686, for 32-bit operating system.
- `amd64` - x64/x86_64, for currently popular devices.
- `aarch64` - armv8/arm64/armv9, for devices with Arm CPUs.

We currently plan to support only `x86`, `amd64` and `aarch64` architectures.

:::

## Windows

::: warning Note
Starting with 1.5.0, **Clash Nyanpasu** no longer provides MSI installers.
:::

First, please make sure that the WebView2 runtime is installed on your system. If your system does not have the WebView2 runtime installed, you can download and install it from the [Microsoft official site](https://developer.microsoft.com/en-us/microsoft-edge/webview2).

### Installer

Please download the latest version of `Clash.Nyanpasu_x.y.z_x64-setup.exe` from the [GitHub Releases](https://github.com/libnyanpasu/clash-nyanpasu/releases) and install it.

### Portable

::: warning Note
Please note that Tauri does not officially **support** the portable variant. The portable[^1] variant provided by Clash Nyanpasu is generated through an automated packaging process and explicitly ignores WebView2 detection, so some problems may be encountered. We plan to stick to the principle that the portable variant does not modify the registry in the future. As a result, some features may **not** work properly:

- **System Services**: We are planning to **remove** `nyanpasu-service` from the portable variant because it does service registration and modifies the registry, which is against the principles of the portable variant.
- **Notifications**: System notifications are not available on Windows 10/11 with the portable variant, so some of the actions that trigger notifications on the backend will not be visible.
- **Shortcut Import** (Custom Schema): This feature will be **removed** as the portable variant cannot modify the registry.

:::

Download the latest version of `Clash.Nyanpasu_x.y.z_x64_portable.zip` from the [GitHub Releases](https://github.com/libnyanpasu/clash-nyanpasu/releases) page, extract and run it.

## macOS

Download the latest version of `Clash.Nyanpasu_x64.app.tar.gz` (Intel CPU) or `Clash.Nyanpasu.aarch64.app.tar.gz` (M-series CPUs) and install it.

If you encounter any installation problems, please refer to the [FAQ](../others/faq).

## Linux

For Linux, due to the limitations of AppImage, we recommend using **Package Manager** to install or compile the app yourself.

Tauri 2 is currently in beta, and when it is released, we will introduce more package support and potentially Flatpak support[^2].

::: warning Note
The following features are currently not supported for installation via package manager:

- In-app updates
- Core updates

Note: AppImage variant supports in-app updates.
:::

### Debian/Ubuntu

Download the latest version of the DEB package using a _third-party PPA source_ or from the [GitHub Releases](https://github.com/libnyanpasu/clash-nyanpasu/releases) page.

#### Installation via DEB package

Download the latest version of `clash-nyanpasu_x.y.z_amd64.deb` from the [GitHub Releases](https://github.com/libnyanpasu/clash-nyanpasu/releases) page.

Then execute it in the terminal:

```bash
sudo apt install -y ./clash-nyanpasu_x.y.z_amd64.deb
```

### ArchLinux

AUR packages are currently provided by enthusiasts: [Stable (need to compile)](https://aur.archlinux.org/packages/clash-nyanpasu) / [Stable (binaries)](https://aur.archlinux.org/packages/clash-nyanpasu-bin) or [Development (need to compile)](https://aur.archlinux.org/packages/clash-nyanpasu-git).

The following is a demonstration of installing AUR packages using `paru`:

::: code-group

```bash [Stable (need to compile)]
paru -Syu clash-nyanpasu
```

```bash [Stable (binaries)]
paru -Syu clash-nyanpasu-bin
```

```bash [Development (need to compile)]
paru -Syu clash-nyanpasu-git
```

:::

### AppImage

::: warning Tip
The following known bugs exist with the AppImage variant:

- TUN authorization is not supported. If you need to use TUN mode, start the AppImage variant with `sudo`.
- Clash Rust is temporarily unavailable and is being [investigated](https://github.com/libnyanpasu/clash-nyanpasu/issues/1448).
- Service mode is not supported at this time.
- Core updates are not supported at this time.

**If you encounter any other problems while using it, feel free to submit a new issue for feedback!**
:::

Download the latest version of `clash-nyanpasu_x.y.z_amd64.AppImage` from [the GitHub Releases](https://github.com/libnyanpasu/clash-nyanpasu/releases) page, then double-click to run it.

If you want to run it in a terminal, you can execute the following command:

```bash
chmod +x ./clash-nyanpasu_x.y.z_amd64.AppImage
./clash-nyanpasu_x.y.z_amd64.AppImage

```

If you need to autostart, you may need to write a `.desktop` file.
The following is a sample `.desktop` file that you can place in the `/usr/share/applications` or `~/.local/share/applications/` directory.
First, let's download the icon for Clash Nyanpasu:
::: code-group

```bash [User Directory]
mkdir -p ~/.local/share/icons/clash-nyanpasu
wget -O ~/.local/share/icons/clash-nyanpasu/clash-nyanpasu.png https://raw.githubusercontent.com/libnyanpasu/clash-nyanpasu/main/frontend/nyanpasu/src/assets/image/logo-box.png
```

```bash [System Directory]
sudo mkdir -p /usr/share/icons/clash-nyanpasu
sudo wget -O /usr/share/icons/clash-nyanpasu/clash-nyanpasu.png https://raw.githubusercontent.com/libnyanpasu/clash-nyanpasu/main/frontend/nyanpasu/src/assets/image/logo-box.png
```

:::

Then we write the `.desktop` file:

```ini
[Desktop Entry]
Categories=Development;
Comment=A Clash GUI based on Tauri.
Exec=/path/to/clash-nyanpasu_x.y.z_amd64.AppImage %U # Please change to your AppImage path.
Icon=/path/to/clash-nyanpasu.png # Please replace with the path of the icon you downloaded.
GenericName=Clash Nyanpasu
Name=Clash Nyanpasu
Terminal=false
Type=Application
Autostart=true # Whether to autostart or not.
```

Update the database:

::: code-group

```bash [User Directory]
update-desktop-database ~/.local/share/applications
```

```bash [System Directory]
sudo update-desktop-database /usr/share/applications
```

:::

## Reference

[^1]: Portable definition: [Portable application - Wikipedia](https://en.wikipedia.org/wiki/Portable_application)

[^2]: Flatpak support is not yet complete: https://github.com/tauri-apps/tauri/issues/3619
