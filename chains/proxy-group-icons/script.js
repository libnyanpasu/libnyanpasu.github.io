/** @type {config} */
export default function (profile) {
  /**
   * Add an icon to a proxy group.
   * @param {string} name - Proxy group name
   * @param {string} [iconset] - Icon name or URL
   */
  const addIcon = (name, iconset) => {
    for (let group of profile["proxy-groups"]) {
      if (group.name === name) {
        if (!iconset) {
          iconset = name;
        }
        group["icon"] = iconset.startsWith("http")
          ? iconset
          : `https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/${iconset}.png`;
      }
    }
  };

  // Define your own proxy group icons here
  addIcon("HK", "https://raw.githubusercontent.com/HatScripts/circle-flags/gh-pages/flags/hk.svg");
  addIcon("TW", "https://raw.githubusercontent.com/HatScripts/circle-flags/gh-pages/flags/tw.svg");
  addIcon("JP", "https://raw.githubusercontent.com/HatScripts/circle-flags/gh-pages/flags/jp.svg");
  addIcon("SG", "https://raw.githubusercontent.com/HatScripts/circle-flags/gh-pages/flags/sg.svg");
  addIcon("US", "https://raw.githubusercontent.com/HatScripts/circle-flags/gh-pages/flags/us.svg");
  addIcon("Apple");
  addIcon("Netflix");
  addIcon("YouTube");
  addIcon("Netflix");
  addIcon("Disney", "Disney+");
  addIcon("Microsoft");
  addIcon("OpenAI", "ChatGPT");
  addIcon("PayPal");
  addIcon("Spotify");
  addIcon("Steam");
  addIcon("Telegram");
  addIcon("Bilibili", "bilibili");
  addIcon("Google");
  addIcon("Bahamut");
  addIcon("Proxies", "Global");
  addIcon("Final");

  return profile;
}
