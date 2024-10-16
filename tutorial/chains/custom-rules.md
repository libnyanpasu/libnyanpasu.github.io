# Proxy Chain Example

This section primarily demonstrates how to modify configurations and add rules through various processing nodes.

## Adding the Loyalsoldier Rule Set

Below is an example of routing all proxy rule sets through `Proxies` and all direct rule sets through `DIRECT`, along with adding the [Loyalsoldier Rule Set](https://github.com/Loyalsoldier/clash-rules).

::: code-group

```yaml [Merge]
rule-providers:
  reject:
    type: http
    behavior: domain
    url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/reject.txt"
    path: ./ruleset/reject.yaml
    interval: 86400
  icloud:
    type: http
    behavior: domain
    url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/icloud.txt"
    path: ./ruleset/icloud.yaml
    interval: 86400
  apple:
    type: http
    behavior: domain
    url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/apple.txt"
    path: ./ruleset/apple.yaml
    interval: 86400
  google:
    type: http
    behavior: domain
    url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/google.txt"
    path: ./ruleset/google.yaml
    interval: 86400
  proxy:
    type: http
    behavior: domain
    url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/proxy.txt"
    path: ./ruleset/proxy.yaml
    interval: 86400
  direct:
    type: http
    behavior: domain
    url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/direct.txt"
    path: ./ruleset/direct.yaml
    interval: 86400
  private:
    type: http
    behavior: domain
    url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/private.txt"
    path: ./ruleset/private.yaml
    interval: 86400
  gfw:
    type: http
    behavior: domain
    url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/gfw.txt"
    path: ./ruleset/gfw.yaml
    interval: 86400
  tld-not-cn:
    type: http
    behavior: domain
    url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/tld-not-cn.txt"
    path: ./ruleset/tld-not-cn.yaml
    interval: 86400
  telegramcidr:
    type: http
    behavior: ipcidr
    url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/telegramcidr.txt"
    path: ./ruleset/telegramcidr.yaml
    interval: 86400
  cncidr:
    type: http
    behavior: ipcidr
    url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/cncidr.txt"
    path: ./ruleset/cncidr.yaml
    interval: 86400
  lancidr:
    type: http
    behavior: ipcidr
    url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/lancidr.txt"
    path: ./ruleset/lancidr.yaml
    interval: 86400
  applications:
    type: http
    behavior: classical
    url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/applications.txt"
    path: ./ruleset/applications.yaml
    interval: 86400
append__rules:
- 'RULE-SET,applications,DIRECT',
- 'DOMAIN,clash.razord.top,DIRECT',
- 'DOMAIN,yacd.haishan.me,DIRECT',
- 'RULE-SET,icloud,DIRECT',
- 'RULE-SET,apple,Proxies',
- 'RULE-SET,private,DIRECT',
- 'RULE-SET,reject,REJECT',
- 'RULE-SET,tld-not-cn,Proxies',
- 'RULE-SET,gfw,Proxies',
- 'RULE-SET,telegramcidr,Proxies',
- 'GEOIP,LAN,DIRECT',
- 'GEOIP,CN,DIRECT'
```

```js [JavaScript]
export default function main(config) {
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
    // Rule set begins
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
  extra.rules = [...extra

_rules, ...config.rules]
  extra.dns = { ...config.dns, enable: false }
  return { ...config, ...extra }
}
```

```lua [Lua]
config['rule-providers'] = {
  reject = {
    type = 'http',
    behavior = 'domain',
    url = 'https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/reject.txt',
    path = './ruleset/reject.yaml',
    interval = 86400
  },
  icloud = {
    type = 'http',
    behavior = 'domain',
    url = 'https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/icloud.txt',
    path = './ruleset/icloud.yaml',
    interval = 86400
  },
  apple = {
    type = 'http',
    behavior = 'domain',
    url = 'https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/apple.txt',
    path = './ruleset/apple.yaml',
    interval = 86400
  },
  google = {
    type = 'http',
    behavior = 'domain',
    url = 'https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/google.txt',
    path = './ruleset/google.yaml',
    interval = 86400
  },
  proxy = {
    type = 'http',
    behavior = 'domain',
    url = 'https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/proxy.txt',
    path = './ruleset/proxy.yaml',
    interval = 86400
  },
  direct = {
    type = 'http',
    behavior = 'domain',
    url = 'https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/direct.txt',
    path = './ruleset/direct.yaml',
    interval = 86400
  },
  private = {
    type = 'http',
    behavior = 'domain',
    url = 'https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/private.txt',
    path = './ruleset/private.yaml',
    interval = 86400
  },
  gfw = {
    type = 'http',
    behavior = 'domain',
    url = 'https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/gfw.txt',
    path = './ruleset/gfw.yaml',
    interval = 86400
  },
  greatfire = {
    type = 'http',
    behavior = 'domain',
    url = 'https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/greatfire.txt',
    path = './ruleset/greatfire.yaml',
    interval = 86400
  },
  ['tld-not-cn'] = {
    type = 'http',
    behavior = 'domain',
    url = 'https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/tld-not-cn.txt',
    path = './ruleset/tld-not-cn.yaml',
    interval = 86400
  },
  telegramcidr = {
    type = 'http',
    behavior = 'ipcidr',
    url = 'https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/telegramcidr.txt',
    path = './ruleset/telegramcidr.yaml',
    interval = 86400
  },
  cncidr = {
    type = 'http',
    behavior = 'ipcidr',
    url = 'https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/cncidr.txt',
    path = './ruleset/cncidr.yaml',
    interval = 86400
  },
  lancidr = {
    type = 'http',
    behavior = 'ipcidr',
    url = 'https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/lancidr.txt',
    path = './ruleset/lancidr.yaml',
    interval = 86400
  },
  applications = {
    type = 'http',
    behavior = 'classical',
    url = 'https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/applications.txt',
    path = './ruleset/applications.yaml',
    interval = 86400
  }
}

local extra_rules = {
  -- Rule set begins
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
}

config.rules = {table.unpack(extra_rules), table.unpack(config.rules)}
config.dns = {enable = false, ...config.dns}

return config
```

:::

## Adding Icons to Proxy Groups

::: warning Note
Currently, **icon** are only supported by the `Mihomo` and `Clash Rust` Core; `Clash Premium` do not support it.
:::

The icon set used is [Koolson/Qure](https://github.com/Koolson/Qure), and the flag icons are from [HatScripts/circle-flags](https://github.com/HatScripts/circle-flags).

::: code-group

```yaml [Merge]
filter__proxy-groups:
  - when: |
      item.name == 'HK'
    merge:
      icon: 'https://raw.githubusercontent.com/HatScripts/circle-flags/gh-pages/flags/hk.svg'
  - when: |
      item.name == 'TW'
    merge:
      icon: 'https://raw.githubusercontent.com/HatScripts/circle-flags/gh-pages/flags/tw.svg'
  - when: |
      item.name == 'JP'
    merge:
      icon: 'https://raw.githubusercontent.com/HatScripts/circle-flags/gh-pages/flags/jp.svg'
  - when: |
      item.name == 'SG'
    merge:
      icon: 'https://raw.githubusercontent.com/HatScripts/circle-flags/gh-pages/flags/sg.svg'
  - when: |
      item.name == 'US'
    merge:
      icon: 'https://raw.githubusercontent.com/HatScripts/circle-flags/gh-pages/flags/us.svg'
  - when: |
      item.name == 'Apple'
    merge:
      icon: https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Apple.png
  - when: |
      item.name == 'Netflix'
    merge:
      icon: https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Netflix.png
  - when: |
      item.name == 'YouTube'
    merge:
      icon: https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/YouTube.png
  - when: |
      item.name == 'Disney'
    merge:
      icon: https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Disney%2B.png
  - when: |
      item.name == 'Microsoft'
    merge:
      icon: https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Microsoft.png
  - when: |
      item.name == 'OpenAI'
    merge:
      icon: https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/ChatGPT.png
  - when: |
      item.name == 'PayPal'
    merge:
      icon: https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/PayPal.png
  - when: |
      item.name == 'Spotify'
    merge:
      icon: https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Spotify.png
  - when: |
      item.name == 'Steam'
    merge:
      icon: https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Steam.png
  - when: |
      item.name == 'Telegram'
    merge:
      icon: https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Telegram.png
  - when: |
      item.name == 'Bilibili'
    merge:
      icon: https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/bilibili.png
  - when: |
      item.name == 'Google'
    merge:
      icon: https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Google.png
  - when: |
      item.name == 'Bahamut'
    merge:
      icon: https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Bahamut.png
  - when: |
      item.name == 'Proxies'
    merge:
      icon: https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Global.png
  - when: |
      item.name == 'Final'
    merge:
      icon: https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Final.png
```

```js [JavaScript]
/** @type {config} */
export default function (profile) {
  /**
   * Add an icon to a proxy group
   * @param {string} name - The name of the proxy group
   * @param {string} [iconset] - The name or link of the icon
   */
  const addIcon = (name, iconset) => {
    for (let group of profile['proxy-groups']) {
      if (group.name === name) {
        if (!iconset) {
          iconset = name
        }
        group['icon'] = iconset.startsWith('http')
          ? iconset
          : `https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/${iconset}.png`
      }
    }
  }

  // Define your own proxy group icons here
  addIcon(
    'HK',
    'https://raw.githubusercontent.com/HatScripts/circle-flags/gh-pages/flags/hk.svg'
  )
  addIcon(
    'TW',
    'https://raw.githubusercontent.com/HatScripts/circle-flags/gh-pages/flags/tw.svg'
  )
  addIcon(
    'JP',
    'https://raw.githubusercontent.com/HatScripts/circle-flags/gh-pages/flags/jp.svg'
  )
  addIcon(
    'SG',
    'https://raw.githubusercontent.com/HatScripts/circle-flags/gh-pages/flags/sg.svg'
  )
  addIcon(
    'US',
    'https://raw.githubusercontent.com/HatScripts/circle-flags/gh-pages/flags/us.svg'
  )
  addIcon('Apple')
  addIcon('Netflix')
  addIcon('YouTube')
  addIcon('Netflix')
  addIcon('Disney', 'Disney+')
  addIcon('Microsoft')
  addIcon('OpenAI', 'ChatGPT')
  addIcon('PayPal')
  addIcon('Spotify')
  addIcon('Steam')
  addIcon('Telegram')
  addIcon('Bilibili', 'bilibili')
  addIcon('Google')
  addIcon('Bahamut')
  addIcon('Proxies', 'Global')
  addIcon('Final')

  return profile
}
```

```lua [Lua]
-- Add icons to proxy groups
local function addIcon(name, iconset)
    if config["proxy-groups"] ~= nil then
        for _, group in ipairs(config["proxy-groups"]) do
            if group["name"] == name then
                if iconset == nil then
                    iconset = name
                end
                group["icon"] = iconset:find("^http") and iconset or "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/" .. iconset .. ".png"
            end
        end
    end
end

-- Define your own proxy group icons here
addIcon("HK", "https://raw.githubusercontent.com/HatScripts/circle-flags/gh-pages/flags/hk.svg")
addIcon("TW", "https://raw.githubusercontent.com/HatScripts/circle-flags/gh-pages/flags/tw.svg")
addIcon("JP", "https://raw.githubusercontent.com/HatScripts/circle-flags/gh-pages/flags/jp.svg")
addIcon("SG", "https://raw.githubusercontent.com/HatScripts/circle-flags/gh-pages/flags/sg.svg")
addIcon("US", "https://raw.githubusercontent.com/HatScripts/circle-flags/gh-pages/flags/us.svg")
addIcon("Apple")
addIcon("Netflix")
addIcon("YouTube")
addIcon("Netflix")
addIcon("Disney", "Disney+")
addIcon("Microsoft")
addIcon("OpenAI", "ChatGPT")
addIcon("PayPal")
addIcon("Spotify")
addIcon("Steam")
addIcon("Telegram")
addIcon("Bilibili", "bilibili")
addIcon("Google")
addIcon("Bahamut")
addIcon("Proxies", "Global")
addIcon("Final")

return config
```

:::
