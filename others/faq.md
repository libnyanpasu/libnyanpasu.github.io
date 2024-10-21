# Frequently Asked Questions

This section contains common questions about _Clash Nyanpasu_.
Please check here first if you have any questions.

## Application

### 1. macOS `"Clash Nyanpasu" is damaged and can't be opened`

Open **Terminal** and run:

```bash
sudo xattr -r -d com.apple.quarantine /Applications/Clash\ Nyanpasu.app
```

### 2. Where is the Clash Nyanpasu Config/Logs Directory?

There are currently two ways to open it directly:

- Right click on the tray icon and select **Open Dir - Config Dir**. You can open the configuration directory.

- Go to the main program interface, go to the **Settings page**, find the **Config Dir** and click on the button, click on it to open the Configuration Catalog.

> The same can be done for the log directory.

::: info Tips

In case you can't access the tray and can't get to the main screen, we can open it by entering the path directly.

Since v1.6.0, Clash Nyanpasu split the installation directory into configuration and data directories, the log directory was moved to the data directory, and Windows users can choose to migrate the configuration directory.

- For Windows, the default configuration directory is located at `%APPDATA%/Clash Nyanpasu/config` and the data directory is located at `%LOCALAPPDATA/Clash Nyanpasu/data`.

  - If you customize the configuration directory, the configuration directory is whichever you specify.

- For macOS, both the configuration directory and the data directory are located in `~/Library/Application Support/Clash Nyanpasu`.

- For Linux:

  - The data directory is located under `$XDG_CONFIG_HOME/clash-nyanpasu` or `$HOME/.config/clash-nyanpasu`.

  - The data directory is located under `$XDG_DATA_HOME/clash-nyanpasu` or `$HOME/.local/share/clash-nyanpasu`.

:::

If you need to get the journal yourself, you can go to the **data directory** and find the `logs` folder, which contains the log files of the current main program.

### 3. How to Edit the Log Level?

- In the **Nyanpasu Setting** option on the **Settings page**, you can find **App Log Level** to edit the log level, which takes effect immediately after saving.
- Find `nyanpasu-config.yaml` in the **Config Dir**, find `app_log_level` to edit the log level, and restart the app after saving.

> Optional log levels include: `trace`, `debug`, `info`, `warn`, `error`, or `silent` (no log recording).

### 4. How to Enable TUN Mode?

::: info Note
TUN mode requires certain permissions.

- On Windows, run Clash Nyanpasu as an administrator to enable TUN mode.
- On macOS, click the Settings icon next to Clash Kernel on the Settings page, open kernel settings, click the small lock icon on the kernel side, enter the password for authorization, and restart the kernel.
- On Linux, similar to macOS, you can run with sudo to achieve authorization.
  :::

- In the Settings page, under System Settings, enable TUN Mode.

#### Manual Authorization on macOS

- If authorization is not successful, you can manually run the following command. After authorization, a restart is still required.

```bash
# clash core
sudo chown root:admin /Applications/Clash\ Nyanpasu.app/Contents/MacOS/clash
sudo chmod +sx /Applications/Clash\ Nyanpasu.app/Contents/MacOS/clash

# mihomo core
sudo chown root:admin /Applications/Clash\ Nyanpasu.app/Contents/MacOS/mihomo
sudo chmod +sx /Applications/Clash\ Nyanpasu.app/Contents/MacOS/mihomo

# mihomo alpha core
sudo chown root:admin /Applications/Clash\ Nyanpasu.app/Contents/MacOS/mihomo-alpha
sudo chmod +sx /Applications/Clash\ Nyanpasu.app/Contents/MacOS/mihomo-alpha

# clash rust core
sudo chown root:admin /Applications/Clash\ Nyanpasu.app/Contents/MacOS/clash-rs
sudo chmod +sx /Applications/Clash\ Nyanpasu.app/Contents/MacOS/clash-rs
```

### 5. Missing Subscription Node Types

Some subscription types recognize the User Agent (UA) of the request and deliver the corresponding configuration file based on the UA. The default UA for Nyanpasu is `clash-nyanpasu/vx.y.z`, where `x.y.z` represents the software version. If you are unable to retrieve certain types of nodes, it is likely because the subscription provider has not added the Nyanpasu UA for recognition.

#### Solutions

1. Contact the subscription provider and request support for the Nyanpasu UA;
2. Edit the UA to a type supported by the subscription provider, such as `clash-meta`, etc.

### 6. What are program directories and kernel directories? What are their roles?

In the current version, we call the program installation directory, application directory or kernel directory, which contains all the current kernel and embedded resource files. You can open the directory by right clicking on the tray or find the corresponding directory in the settings page.

When you need to install service mode manually, you can find the service mode binaries in this way.
