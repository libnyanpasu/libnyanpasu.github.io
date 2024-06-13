# Custom Rules

## Using Merge

### Create a New Merge Proxy Chain

::: warning Note
Versions prior to 1.6.0 referred to this as creating a new configuration.
:::

In the proxy chain, there is a field called `append-rules`. This is where we can add custom rules, which will be placed at the very beginning of the running configuration, thus having the highest priority.

The `append-rules` field should be written following the Clash rules format. You can refer to the core documentation for more details, which we won't cover here.

[Clash Meta Docs](https://wiki.metacubex.one/en/config/rules/)

[Clash Rust Docs](https://watfaq.github.io/clash-rs/clash_doc/struct.ClashConfigDef.html)

### Writing Rules

Assuming that there is a proxy group named `GitHub`, here is how you can add rules to this group.

```yaml
append-rules:
  - DOMAIN-KEYWORD,github,GitHub
  - DOMAIN-SUFFIX,github.com,GitHub
  - DOMAIN-SUFFIX,github.io,GitHub
  - DOMAIN-SUFFIX,githubapp.com,GitHub
  - DOMAIN-SUFFIX,githubassets.com,GitHub
  - DOMAIN-SUFFIX,githubusercontent.com,GitHub
```

Activate this proxy chain, and you should see the rules you just added on the `Rules` page.

## Using Script

### Create a New Script Proxy Chain

::: warning Note
Versions prior to 1.6.0 referred to this as creating a new configuration.
:::

Scripts have full configuration file editing permissions and offer more flexible editing methods. You can use JavaScript/Lua methods to configure flexibly, including adding rule providers to fetch rules from the network. Here we use JavaScript as an example.

For more details, please refer to the core documentation.

[Clash Meta Docs](https://wiki.metacubex.one/en/config/rule-providers/)

[Clash Rust Docs](https://watfaq.github.io/clash-rs/clash_doc/struct.ClashConfigDef.html)

### Adding Rules

Assuming I want to create a new GitHub proxy group and assign some proxy rules to this group, the code would be as follows.

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

### Adding a Rule Provider

You can also use a Rule Provider to add rules more flexibly.

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

  const custom_rules = ['RULE-SET,GitHub,GitHub Group']

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
