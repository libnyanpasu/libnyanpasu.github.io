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
