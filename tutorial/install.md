# Installation

Clash Nyanpasu currently supports Windows 7 and higher, Linux, and macOS 10.15 and above.

- Windows ARM64 version is currently not supported, support will be considered following Clash Rust's compatibility.
- The Linux version does not currently support ARM architecture, support is expected to be considered after the release of version 1.5.0.

::: info Tip
The [GitHub Release](https://github.com/LibNyanpasu/clash-nyanpasu/releases) page includes explanations for some terms:

- `amd64` - x86_64, suitable for regular computers
- `aarch64` - armv8/arm64/armv9, choose this for computers using ARM CPUs

Plans are in place to support only the above architectures.
:::

## Windows

::: warning Note
Starting from version 1.5.0, **Clash Nyanpasu** will no longer provide `MSI` installer packages.
:::

First, ensure your system has the Webview2 runtime installed. If not, you can download and install it from the [Microsoft official website](https://developer.microsoft.com/en-us/microsoft-edge/webview2/).

### NSIS

Download the latest version of `Clash.Nyanpasu_x.y.z_x64-setup.exe` from the [GitHub Release](https://github.com/LibNyanpasu/clash-nyanpasu/releases) page.

### Portable Version

::: warning Note
Please note that the Tauri official does **not support** portable versions.  
The portable version provided by Clash Nyanpasu[^1] is generated through an automated packaging process and explicitly ignores the detection of Webview2, which might lead to some issues. We plan to adhere to the principle of not modifying the registry for portable versions in the future. Therefore, some features may **not** work as expected:

- **System Services**: Since `clash-verge-service` involves service registration and registry modification, it contradicts the principle of the portable version and will be removed.
- **Notification Functionality**: Portable versions cannot use system notifications on Windows 10, making some backend notification triggers invisible.
- **Quick Import** (Custom Schema): Given that the portable version cannot modify the registry, this feature will not be supported.

:::

Download the latest version of `Clash.Nyanpasu_x.y.z_x64_portable.zip` from the [GitHub Release](https://github.com/LibNyanpasu/clash-nyanpasu/releases) page, unzip it, and run.

## MacOS

Download the latest version of `Clash.Nyanpasu_x64.app.tar.gz` (for Intel CPUs) or `Clash.Nyanpasu.aarch64.app.tar.gz` (for M series CPUs) from the [GitHub Release](https://github.com/LibNyanpasu/clash-nyanpasu/releases) page and install as usual.

If you encounter any installation issues, please refer to the [FAQ](../others/faq).

## Linux

Due to limitations with AppImage, we recommend installation via **package managers** or compiling from source.

With Tauri 2 in its testing phase, we plan to introduce RPM support and potentially FlatPak support[^2] upon its official release.

::: info Tip
If using a **package manager** or compiling from source, please **do not** use the <u>in-app update</u> feature.
:::

### Debian/Ubuntu

Install using a _third-party PPA source_ or download the latest `deb` package from the [GitHub Release](https://github.com/LibNyanpasu/clash-nyanpasu/releases) page.

#### Installing Using a Deb Package

Download the latest version of `clash-nyanpasu_x.y.z_amd64.deb` from the [GitHub Release](https://github.com/LibNyanpasu/clash-nyanpasu/releases) page.

Then execute in the terminal:

```bash
sudo apt install -y ./clash-nyanpasu_x.y.z_amd64.deb
```

### ArchLinux

AUR packages are currently provided by enthusiasts: [Stable version (compiled)](https://aur.archlinux.org/packages/clash-nyanpasu) / [Binary Package](https://aur.archlinux.org/packages/clash-nyanpasu-bin) or [Development version (compiled)](https://aur.archlinux.org/packages/clash-nyanpasu-git).

Here is an example of installing AUR packages using `paru`:

::: code-group

```bash [Stable version (compiled)]
paru -Syy clash-nyanpasu
```

```bash [Binary Package]
paru -Syy clash-nyanpasu-bin
```

```bash [Development version (compiled)]
paru -Syy clash-nyanpasu-git
```

:::

### AppImage

::: danger Warning

Due to the development team's lack of a Linux DE environment, issues arising within the AppImage environment may not be promptly resolved.

Known issues include:

- Inability to update the kernel program
- Inability to detect kernel program version
- Potential failure to elevate privileges, leading to TUN unusable

:::

Download the latest version of `clash-nyanpasu_x.y.z_amd64.AppImage` from the GitHub Release page, then double-click to run it.

To run it from the terminal, you can use the following commands:

```bash
chmod +x ./clash-nyanpasu_x.y.z_amd64.AppImage
./clash-nyanpasu_x.y.z_amd64.AppImage
```

For autostart, you may need to write a `.desktop` file.

## References

[^1]: The definition of **Portable** - https://en.wikipedia.org/wiki/Portable
[^2]: The work of **FlatPak** support is still in progress - https://github.com/tauri-apps/tauri/issues/3619
