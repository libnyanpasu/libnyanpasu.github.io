# 代理链

`Clash Nyanpasu` 继承了 `Clash Verge` 的代理链功能，可以通过 `Script` 或 `Merge` 两种 链 类型来实现代理链。本节内容引自并改编自 `Clash Verge` 的文档[^1]。

## 什么是代理链？

> 未来，我们会将代理链划分为 基于 Profile、全局 的两种类型。
>
> - 每个配置拥有自己独自的代理链，这种代理链称为 `Profile` 代理链。
> - 全局代理链是一个全局的代理链，它会影响所有的配置。
>
> 目前我们计划在 `1.6.0` 中实现这个功能。

所谓代理链，即 `Profile` 的后处理的链式调用。一个 Profile 可以通过 `A`、`B`、`C` 甚至更多的链处理节点，生成出一个最终的代理配置。
因此，多个链处理节点的组合，就构成了代理链。您可以按照自己的需求，自由组合链处理节点，实现自己的代理链。

## Merge（合并）处理

此处理节点提供了类似 `OpenClash` 的配置合并功能。它通过定义了以下规则，实现了对配置的覆盖。

::: warning 注意
需要使用其他字段时，例如 `dns`, `tun` 等，需要在设置页 - **_Clash 字段_** 里勾选对应的字段，不勾选的字段将被忽略。
:::

- `prepend-rules`：类型和 Clash `rules` 配置一致，内容合并到 `rules` 前
- `append-rules`：类型和 Clash `rules` 配置一致，内容合并到 `rules` 后
- `prepend-proxies`：类型和 Clash `proxies` 配置一致，内容合并到 `proxies` 前
- `append-proxies`：类型和 Clash `proxies` 配置一致，内容合并到 `proxies` 后
- `prepend-proxy-groups`：类型和 Clash `proxy-groups` 配置一致，内容合并到 `proxy-groups` 前
- `append-proxy-groups`：类型和 Clash `proxy-groups` 配置一致，内容合并到 `proxy-groups` 后
- 其他 Clash 的字段：5 个默认使用的字段（`rules`, `proxies`, `proxy-groups`, `proxy-providers`, `rule-providers`）以及其他clash/clash meta支持的字段，直接设置这些字段将直接覆盖profile对应字段的内容。

> 我们计划在未来针对 Merge 的改进，譬如提供递归合并的功能，自定义 `prepend-*`、`append-*` 的支持。

## Script（脚本）处理

::: info 提示

- 目前基于 `JavaScript` 的脚本处理节点，尚不支持 ES Modules、Async/Await、Fetch 等特性。我们计划在未来支持这些特性。
- 我们计划在未来支持 `Lua` 脚本处理节点，并提供 `Fetch`、`Async` 的支持。

:::

此处理节点目前提供了基于 `QuickJS` 的 `JavaScript` 脚本处理功能，类似于 CFW 提供的 `Mixins` 或 _预处理_ 功能。

脚本接受一个方法签名为 `function main(config: ClashConfig): ClashConfig` 的方法，其中 `ClashConfig` 是 Clash 的配置类型。脚本的返回值将作为最终的配置。

以下是一个添加 `proxies-provider` 的脚本示例：

```javascript
// Define the `main` function

function main(config) {
  const extra = {
    'rule-providers': {
      reject: {
        type: 'http',
        behavior: 'domain',
        url: 'https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/reject.txt',
        path: './ruleset/reject.yaml',
        interval: 86400
      },
      icloud: {
        type: 'http',
        behavior: 'domain',
        url: 'https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/icloud.txt',
        path: './ruleset/icloud.yaml',
        interval: 86400
      },
      apple: {
        type: 'http',
        behavior: 'domain',
        url: 'https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/apple.txt',
        path: './ruleset/apple.yaml',
        interval: 86400
      },
      google: {
        type: 'http',
        behavior: 'domain',
        url: 'https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/google.txt',
        path: './ruleset/google.yaml',
        interval: 86400
      },
      proxy: {
        type: 'http',
        behavior: 'domain',
        url: 'https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/proxy.txt',
        path: './ruleset/proxy.yaml',
        interval: 86400
      },
      direct: {
        type: 'http',
        behavior: 'domain',
        url: 'https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/direct.txt',
        path: './ruleset/direct.yaml',
        interval: 86400
      },
      private: {
        type: 'http',
        behavior: 'domain',
        url: 'https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/private.txt',
        path: './ruleset/private.yaml',
        interval: 86400
      },
      gfw: {
        type: 'http',
        behavior: 'domain',
        url: 'https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/gfw.txt',
        path: './ruleset/gfw.yaml',
        interval: 86400
      },
      greatfire: {
        type: 'http',
        behavior: 'domain',
        url: 'https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/greatfire.txt',
        path: './ruleset/greatfire.yaml',
        interval: 86400
      },
      'tld-not-cn': {
        type: 'http',
        behavior: 'domain',
        url: 'https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/tld-not-cn.txt',
        path: './ruleset/tld-not-cn.yaml',
        interval: 86400
      },
      telegramcidr: {
        type: 'http',
        behavior: 'ipcidr',
        url: 'https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/telegramcidr.txt',
        path: './ruleset/telegramcidr.yaml',
        interval: 86400
      },
      cncidr: {
        type: 'http',
        behavior: 'ipcidr',
        url: 'https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/cncidr.txt',
        path: './ruleset/cncidr.yaml',
        interval: 86400
      },
      lancidr: {
        type: 'http',
        behavior: 'ipcidr',
        url: 'https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/lancidr.txt',
        path: './ruleset/lancidr.yaml',
        interval: 86400
      },
      applications: {
        type: 'http',
        behavior: 'classical',
        url: 'https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/applications.txt',
        path: './ruleset/applications.yaml',
        interval: 86400
      }
    }
  }

  const extra_rules = [
    // 规则集合开始
    'RULE-SET,applications,DIRECT',
    'DOMAIN,clash.razord.top,DIRECT',
    'DOMAIN,yacd.haishan.me,DIRECT',
    'RULE-SET,icloud,DIRECT',
    'RULE-SET,apple,Apple',
    'RULE-SET,private,DIRECT',
    'RULE-SET,reject,REJECT',
    'RULE-SET,tld-not-cn,Proxies',
    'RULE-SET,gfw,Proxies',
    'RULE-SET,telegramcidr,Telegram',
    'GEOIP,LAN,DIRECT',
    'GEOIP,CN,DIRECT'
  ]
  extra.rules = [...extra_rules, ...config.rules]
  extra.dns = { ...config.dns, enable: false }
  return { ...config, ...extra }
}
```

## 引用

[^1]: [Clash Verge - 代理链](https://github.com/zzzgydi/clash-verge/wiki/%E4%BD%BF%E7%94%A8%E6%8C%87%E5%8D%97)
