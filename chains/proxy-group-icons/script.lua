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
