# Frequently Asked Questions

This section contains common questions about _Clash Nyanpasu_.
Please check here first if you have any questions.

## Application

### 1. macOS "Clash Nyanpasu" is damaged and can't be opened

Open **Terminal** and run:

```bash
sudo xattr -r -d com.apple.quarantine /Applications/Clash\ Nyanpasu.app
```

### 2. Where is the Clash Nyanpasu application / logs directory?

There are currently two ways to directly open it:

- Right-click on the tray icon and choose **Open Dir - App Dir**. You can then open the application directory.
- Enter the main program interface, go to the **Settings page**, find the **Open App Dir** and click the button to open the application directory.

> Clash Core directory and Logs directory are also accessible in the same way.

In situations where you cannot access the tray or enter the main interface, you can directly enter the path to open it. (The clash core directory is in the installation directory)

#### Windows

::: info Tip
Starting from v1.5.1, Clash Nyanpasu supports customizing the application directory on Windows. If you have used this feature, please replace the path accordingly.
:::

- Application directory: `C:/Users/Username/.config/clash-nyanpasu`
- Logs directory: `C:/Users/Username/.config/clash-nyanpasu/logs`

#### macOS & Linux

- Application directory: `$HOME/.config/clash-nyanpasu`
- Logs directory: `$HOME/.config/clash-nyanpasu/logs`

### 3. How to modify the diary level?

- In the **Miscellaneous** option on the **Settings page**, you can find **App Logs Level** to modify the diary level, which takes effect immediately after saving.
- Find `verge.yaml` (later may be renamed to `nyanpasu.yaml`) in the **App Dir**, find `app_log_level` to modify the diary level, and restart the program after saving.

> Optional diary levels include: `trace`, `debug`, `info`, `warn`, `error`, or leave blank (no log recording).
