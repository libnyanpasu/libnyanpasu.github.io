# Proxy Chains

`Clash Nyanpasu` inherits the proxy chain feature from `Clash Verge`, allowing the creation of proxy chains through either `Script` or `Merge` chain types. This section is inspired by and adapted from the `Clash Verge` documentation[^1].

## What are Proxy Chains?

> In the future, we plan to categorize proxy chains into two types: based on Profile and global.
>
> - Each configuration will have its own independent proxy chain, referred to as a `Profile` proxy chain.
> - A global proxy chain affects all configurations.
>
> We aim to implement this feature in version `1.6.0`.

A proxy chain refers to the sequential processing of a `Profile`. A Profile can be processed through `A`, `B`, `C`, or even more processing nodes to generate a final proxy configuration. Thus, the combination of multiple processing nodes forms a proxy chain. You can freely combine these processing nodes to create your own proxy chain.

## Merge Processing

This processing node offers a configuration merging functionality similar to `OpenClash`. It implements rules for overriding configurations as defined below.

::: warning Note
When using other fields such as `dns`, `tun`, etc., you must select the corresponding fields in the settings page under **_Clash Fields_**. Unselected fields will be ignored.
:::

- `prepend-rules`: Merges content before `rules`, similar to Clash's `rules` configuration.
- `append-rules`: Merges content after `rules`, similar to Clash's `rules` configuration.
- `prepend-proxies`: Merges content before `proxies`, similar to Clash's `proxies` configuration.
- `append-proxies`: Merges content after `proxies`, similar to Clash's `proxies` configuration.
- `prepend-proxy-groups`: Merges content before `proxy-groups`, similar to Clash's `proxy-groups` configuration.
- `append-proxy-groups`: Merges content after `proxy-groups`, similar to Clash's `proxy-groups` configuration.
- Other Clash fields: Directly sets these fields to overwrite the corresponding content in the profile for the 5 default fields (`rules`, `proxies`, `proxy-groups`, `proxy-providers`, `rule-providers`) and other fields supported by clash/clash meta.

> Future improvements for Merge are planned, such as recursive merging and custom support for `prepend-*` and `append-*`.

## Script Processing

::: info Tip

- Currently, script processing nodes based on `JavaScript` do not support ES Modules, Async/Await, Fetch, etc. We plan to support these features in the future.
- We also plan to support `Lua` script processing nodes, including support for `Fetch` and `Async`.

:::

This processing node currently offers a `JavaScript` script processing functionality based on `QuickJS`, similar to CFW's `Mixins` or preprocessing features.

Scripts accept a method signature `function main(config: ClashConfig): ClashConfig`, where `ClashConfig` is the configuration type for Clash. The script's return value will be the final configuration.

Below is an example script for adding `proxies-provider`:

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
    // Rule sets should be added here
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

## References

[^1]: [Clash Verge - Proxy Chain](https://github.com/zzzgydi/clash-verge/wiki/%E4%BD%BF%E7%94%A8%E6%8C%87%E5%8D%97)
