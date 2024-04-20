# Clash Field

## Default

### proxies

Proxy node, with content as an array. Obtained from configuration file.

[Clash Meta Docs](https://wiki.metacubex.one/en/config/proxies/)

### proxy-groups

Composed of multiple proxy nodes. Obtained from configuration file.

[Clash Meta Docs](https://wiki.metacubex.one/en/config/proxy-groups/)

### proxy-providers

Proxy providers, capable of merging multiple configuration files.

[Clash Meta Docs](https://wiki.metacubex.one/en/config/proxy-providers/)

### rules

Proxy rules, where rules are matched in the order from top to bottom, with rules at the top of the list having higher priority than those below them.

[Clash Meta Docs](https://wiki.metacubex.one/en/config/rules/)

### rule-providers

Proxy rule providers, capable of managing rules and updating them individually.

[Clash Meta Docs](https://wiki.metacubex.one/en/config/rule-providers/)

## Handle

### mode

Operation Mode.

- `rule` Rule-based matching
- `global` Global proxy (requires selecting proxy/strategy in GLOBAL proxy group)
- `direct` Global direct connection

[Clash Meta Docs](https://wiki.metacubex.one/en/config/general/#operation-mode)

### port

HTTP(S) proxy port.

[Clash Meta Docs](https://wiki.metacubex.one/en/config/inbound/port/#https)

### socks-port

SOCKS4/4a/5 proxy port.

[Clash Meta Docs](https://wiki.metacubex.one/en/config/inbound/port/#socks44a5)

### mixed-port

Mixed port is a special port that supports both HTTP(S) and SOCKS5 protocols simultaneously. You can use any program that supports HTTP or SOCKS proxies to connect to this port.

[Clash Meta Docs](https://wiki.metacubex.one/en/config/inbound/port/#_2)

### allow-lan

Allows other devices to access the internet through Clash proxy port.

[Clash Meta Docs](https://wiki.metacubex.one/en/config/general/#allow-lan)

### log-level

Controls the logging level of Clash core, only output to console and control page.

- `silent` Silent, no output.
- `error` Outputs logs of errors and unusable logs.
- `warning` Outputs logs of errors that do not affect operations, and logs of error level.
- `info` Outputs general operational logs, as well as logs of error and warning levels.
- `debug` Outputs as much information as possible during runtime.

[Clash Meta Docs](https://wiki.metacubex.one/en/config/general/#log-level)

### ipv6

Whether to allow the kernel to accept IPv6 traffic.

[Clash Meta Docs](https://wiki.metacubex.one/en/config/general/#ipv6)

### secret

Access key for the External Control API.

[Clash Meta Docs](https://wiki.metacubex.one/en/config/general/#external-control-api)

### external-controller

External controller, allows controlling your Clash kernel using RESTful API.

API listening address, you can change 127.0.0.1 to 0.0.0.0 to listen on all IPs.

[Clash Meta Docs](https://wiki.metacubex.one/en/config/general/#external-control-api)

## Other

### dns

Enable DNS configuration field.

[Clash Meta Docs](https://wiki.metacubex.one/en/config/dns/)

### tun

Enable TUN configuration field.

[Clash Meta Docs](https://wiki.metacubex.one/en/config/inbound/tun/)

### ebpf

eBPF redirection to TUN is a feature that intercepts all network traffic on a specific network interface and redirects it to the TUN interface. This feature requires kernel support.

Supported kernel: `Mihomo` `Clash Premium`

[Clash Docs](https://clash.wiki/premium/ebpf.html)

### hosts

Enable hosts configuration field.

[Clash Meta Docs](https://wiki.metacubex.one/config/dns/hosts/?h=hosts#hosts)

### script

::: warning
ONLY SUPPORT Premiun kernel.

You should prioritize using the Nyanpasu script feature.
:::

Clash Premium has implemented a script feature based on Python3, allowing users to dynamically and flexibly select policies for data packets.

[Clash Docs](https://clash.wiki/premium/script.html)

### profile

In the official Clash documentation, 'profile' should serve as an extended configuration, but in Clash.meta, it's only used as a cache item.

[Clash Meta Docs](https://wiki.metacubex.one/en/config/general/#cache)

### payload

Payload serves as the content for rule-providers.

[Clash Meta Docs](https://wiki.metacubex.one/en/config/rule-providers/content/)

### tunnels

Flow forwarding tunnel, capable of forwarding TCP/UDP traffic, and can also be forwarded through a proxy.

[Clash Meta Docs](https://wiki.metacubex.one/en/config/tunnels/)

### auto-redir

[Clash Docs](https://clash.wiki/premium/ebpf.html)

### experimental

Experimental configuration

[Clash Meta Docs](https://wiki.metacubex.one/en/config/experimental/)

### interface-name

Specify the outbound interface for the proxy-groups.

[Clash Meta Docs](https://wiki.metacubex.one/en/config/proxy-groups/#interface-name)

### routing-mark

Attach a routing markwhen the proxy-groups goes outbound.

[Clash Meta Docs](https://wiki.metacubex.one/en/config/proxy-groups/#routing-mark)

### redir-port

The redirect port is only applicable to Linux (Android) and macOS.
Can only proxy TCP traffic.

[Clash Meta Docs](https://wiki.metacubex.one/en/config/inbound/port/#_3)

### tproxy-port

The tproxy port is only applicable to Linux (Android).
Capable of proxying both TCP and UDP traffic.

[Clash Meta Docs](https://wiki.metacubex.one/en/config/inbound/port/#_3)

### iptables

[Clash Meta Docs](https://wiki.metacubex.one/en/faq/in/#_4)

### external-ui

::: info
Recommend using the built-in Web UI management feature of Nyanpasu.
:::

Allows running static webpage resources (such as Clash-dashboard) on Clash API, path is API address/ui.

[Clash Meta Docs](https://wiki.metacubex.one/en/config/general/#external-user-interface)

### bind-address

Binding address, only allows other devices to access through this address.

[Clash Meta Docs](https://wiki.metacubex.one/en/config/general/#allow-lan)

### authentication

User authentication for http(s), socks, and mixed proxies.

[Clash Meta Docs](https://wiki.metacubex.one/en/config/general/#user-authentication)

## Meta

### tls

Proxie field.

[Clash Meta Docs](https://wiki.metacubex.one/en/config/proxies/tls/)

### sniffer

Clash uses a Mapping mechanism to address the issue of being unable to pass domain names through the Redir port in transparent proxy scenarios. However, this mechanism can lead to inaccuracies in domain name restoration and domain-based routing if Clash's built-in DNS resolution service is not used.

Meta incorporates a Sniffer domain name sniffer, which reads the domain name field in handshake packets to restore IPs to domain names, effectively addressing the shortcomings of the Mapping mechanism.

[Clash Meta Docs](https://wiki.metacubex.one/en/config/sniff/#_1)

### geox-url

Custom GEO Download Address

[Clash Meta Docs](https://wiki.metacubex.one/en/config/general/#custom-geo-download-address)

### listeners

[Clash Meta Docs](https://wiki.metacubex.one/en/config/inbound/listeners/)

### sub-rules

[Clash Meta Docs](https://wiki.metacubex.one/en/config/sub-rule/)

### geodata-mode

Change the geoip usage file, mmdb or dat,true is dat, with a default value of false.

[Clash Meta Docs](https://wiki.metacubex.one/en/config/general/#geo-data-mode)

### unified-delay

Change delay calculation method, remove additional delays such as handshakes.

[Clash Meta Docs](https://wiki.metacubex.one/en/config/general/#unified-delay)

### tcp-concurrent

[Clash Meta Docs](https://wiki.metacubex.one/en/config/general/#tcp-concurrency)

### enable-process

Meta rename find-process-mode.

### find-process-mode

Controls whether Clash matches processes.

- `always` Enables, forces matching of all processes.
- `strict` Default, Clash determines whether to enable.
- `off` Does not match processes, recommended for use on routers.

[Clash Meta Docs](https://wiki.metacubex.one/en/config/general/#process-matching-mode)

### skip-auth-prefixes

Set the IP ranges allowed to skip authentication.

[Clash Meta Docs](https://wiki.metacubex.one/en/config/general/#user-authentication)

### external-controller-tls

HTTPS-API listening address, requires configuring the tls section for certificate and private key configuration, external-controller must also be filled in.

[Clash Meta Docs](https://wiki.metacubex.one/en/config/general/#external-control-api)

### global-client-fingerprint

Global TLS fingerprint, lower priority than client-fingerprint inside proxy.

Currently supports TCP/grpc/WS/HTTP transport with TLS, supported protocols are VLESS, Vmess, and trojan.

[Clash Meta Docs](https://wiki.metacubex.one/en/config/general/#global-client-fingerprint)
