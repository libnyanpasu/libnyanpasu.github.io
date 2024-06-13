# 自定义规则

## 使用 Merge 完成

### 新建一个 Merge 代理链

::: warning 注意
1.6.0 之前的版本叫做新建配置
:::

代理链其中有一个字段叫做 `append-rules`，这里就是我们进行自定义规则的入口，它会将规则复写到运行配置的最前面，达到最高优先级规则的效果。

append-rules 的编写需要参照 Clash 的 rules 字段，你可以参照内核文档了解更多，这里不在赘述。

[Clash Meta Docs](https://wiki.metacubex.one/en/config/rules/)

[Clash Rust Docs](https://watfaq.github.io/clash-rs/clash_doc/struct.ClashConfigDef.html)

### 编写规则

假设已知 proxy-groups 有一个名为 `GitHub` 的组别，那么给这个组别添加规则的方法如下。

```yaml
append-rules:
  - DOMAIN-KEYWORD,github,GitHub
  - DOMAIN-SUFFIX,github.com,GitHub
  - DOMAIN-SUFFIX,github.io,GitHub
  - DOMAIN-SUFFIX,githubapp.com,GitHub
  - DOMAIN-SUFFIX,githubassets.com,GitHub
  - DOMAIN-SUFFIX,githubusercontent.com,GitHub
```

启用这个代理链，应该可以在 `规则页` 看到你刚刚添加的规则。

## 使用 Script 完成

### 新建一个 Script 代理链

::: warning 注意
1.6.0 之前的版本叫做新建配置
:::

Script 拥有完整的配置文件编辑权限，并且拥有更自由的编辑方法，你可以调用 JavaScript/Lua 方法灵活配置，因此这里还可以添加 rule provider 达到从网络拉取规则的方法。这里使用 JavaScript 作为演示。

具体的功能同样请查阅内核文档。

[Clash Meta Docs](https://wiki.metacubex.one/en/config/rule-providers/)

[Clash Rust Docs](https://watfaq.github.io/clash-rs/clash_doc/struct.ClashConfigDef.html)

### 添加 Rule

假设现在我想新建一个 GitHub 的代理组别，且给这个组别分配上一些代理规则，那么代码如下。

```js
// Define the `main` function

function main(params) {
  const custom_proxy_groups = [
    {
      name: 'GitHub Group',
      type: 'select',
      proxies: params.proxies
    }
  ]

  const custom_rules = [
    'DOMAIN-KEYWORD,github,GitHub Group',
    'DOMAIN-SUFFIX,github.com,GitHub Group',
    'DOMAIN-SUFFIX,github.io,GitHub Group',
    'DOMAIN-SUFFIX,githubapp.com,GitHub Group',
    'DOMAIN-SUFFIX,githubassets.com,GitHub Group',
    'DOMAIN-SUFFIX,githubusercontent.com,GitHub Group'
  ]

  console.log('Apply script at: ', new Date())

  return {
    ...params,
    'proxy-groups': {
      ...custom_proxy_groups,
      ...params['proxy-groups']
    },
    rules: {
      ...custom_rules,
      ...params.rules
    }
  }
}
```

### 添加 Rule Provider

你也可以使用 Rule Provider 更灵活地添加规则。

```js
// Define the `main` function

function main(params) {
  const custom_proxy_groups = [
    {
      name: 'GitHub Group',
      type: 'select',
      proxies: params.proxies
    }
  ]

  const custom_rule_providers = {
    GitHub: {
      type: 'http',
      behavior: 'domain',
      url: 'https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Ruleset/Github.list',
      path: './ruleset/GitHub.yaml',
      interval: 86400
    }
  }

  const custom_rules = ['RULE-SET,GitHub,AppGitHub Group']

  console.log('Apply script at: ', new Date())

  return {
    ...params,
    'proxy-groups': {
      ...custom_proxy_groups,
      ...params['proxy-groups']
    },
    'rule-providers': custom_rule_providers,
    rules: {
      ...custom_rules,
      ...params.rules
    }
  }
}
```
