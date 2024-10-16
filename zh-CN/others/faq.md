# 常见问题

本部分包含有关 _Clash Nyanpasu_ 的常见问题。
如果您有任何问题，请先查看此处。

## 应用

### 1. macOS `"Clash Nyanpasu" 已损坏，无法打开`

打开 **Terminal** 并运行：

```bash
sudo xattr -r -d com.apple.quarantine /Applications/Clash\ Nyanpasu.app
```

### 2. Clash Nyanpasu 配置/数据/日志目录在哪里？

目前有两种方式可以直接打开：

- 右键托盘图标，选择 **打开目录 - 配置目录**。即可打开配置目录。
- 进入主程序界面，进入 **设置页**，找到 **配置目录** 并点击按钮，点击即可打开配置目录。

> 数据目录、日志目录也同样可以。

在无法访问托盘、无法进入主界面的情况，我们可以直接输入路径打开。（内核目录在安装目录下）

#### Windows

::: info 提示
自 v1.5.1 起，Clash Nyanpasu 支持在 Windows 上自定义应用目录，如果您使用了此功能，请自行替换路径。
自 v1.6.0 起，Clash Nyanpasu 将应用目录拆分为配置目录和数据目录，在 Windows 下可选择修改配置目录。
:::

- 应用目录（v1.6.0 之前）：`%USERPROFILE%\.config\clash-nyanpasu`

- 配置目录：`%APPDATA%\Clash Nyanpasu\config`
- 数据目录：`%LOCALAPPDATA%\Clash Nyanpasu\data`
- 日志目录：`%LOCALAPPDATA%\Clash Nyanpasu\data\logs`

#### macOS & Linux

- 应用目录：`$HOME/.config/clash-nyanpasu`
- 日志目录：`$HOME/.config/clash-nyanpasu/logs`

### 3. 如何修改日志等级？

- 在 **设置页** 的 **Nyanpasu 设置** 选项中，可以找到 **应用程序日志等级** 修改日志等级，保存后立即生效。
- 在 **配置目录** 下找到 `nyanpasu-config.yaml`，找到 `app_log_level` 修改日志等级，保存后需要重启程序。

> 可选的日志级别有：`trace`、`debug`、`info`、`warn`、`error`、`silent`（不记录日志）。

### 4. 如何开启 TUN 模式？

::: info 提示
TUN 模式需要一定的权限。

- 在 Windows 系统下请以管理员身份运行 Clash Nyanpasu 才能开启。
- 在 macOS 下请点击 **设置页** 的 **Clash 内核** 旁边的 **设置图标**，打开内核设置，点击内核一侧的 **小锁图标**，输入密码后授权，重启内核即可。
- 在 Linux 下同 macOS，当然你也可以使用 sudo 运行达到授权效果。
  :::

- 在 **设置页** 的 **系统设置** 选项中，打开 **TUN 模式**。

#### macOS 手动授权

如果授权不成功可以手动输入指令执行，授权后同样需要重启。

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

### 5. 缺少订阅获取节点类型

部分订阅类型会根据请求的用户代理 (UA) 来识别并下发相应的配置文件。Nyanpasu 默认的 UA 为 `clash-nyanpasu/vx.y.z`，其中 `x.y.z` 是软件版本。
如果你无法获取到某些类型的节点，很可能是因为订阅系统没有将 Nyanpasu 的 UA 添加到识别列表中。

#### 解决方案

- 联系订阅提供者，请求添加对 Nyanpasu UA 的支持。
- 修改 UA 为订阅提供者支持的类型，例如 `clash-meta` 等。
