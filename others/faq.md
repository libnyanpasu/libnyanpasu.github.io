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

There are currently two ways to directly open it:

- Right-click on the tray icon and choose **Open Dir - Config Dir**. You can then open the config directory.
- Enter the main app interface, go to the **Settings page**, find the **Open Config Dir** and click the button to open the config directory.

> Logs directory are also accessible in the same way.

::: info Tips
In situations where you cannot access the tray or enter the main interface, you can directly enter the path to open it.

Starting from v1.6.0, Clash Nyanpasu splits the install directory into a config directory and a data directory, and moves the log directory to the data directory. Windows users can choose to migrate the config directory.

- On Windows, the default config directory is in `%APPDATA%`, data directory is in the `%LOCALAPPDATA%`.
- On macOS, it should in `~/Library/Application Support` directory of a user.
- On Linux, it is a temp directory via a AppImage executable. Otherwise, it should be `/usr/bin`.
  :::

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
