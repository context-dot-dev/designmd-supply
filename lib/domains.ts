export type TopDomain = {
  name: string;
  domain: string;
};

// The supply. Brand assets, screenshots, and design.md content are loaded
// from Turso on demand — this list is just what shows up on the homepage
// directory and what generateStaticParams pre-renders.
export const TOP_DOMAINS: TopDomain[] = [
  { name: "Apple", domain: "apple.com" },
  { name: "Microsoft", domain: "microsoft.com" },
  { name: "Google", domain: "google.com" },
  { name: "Amazon", domain: "amazon.com" },
  { name: "Nvidia", domain: "nvidia.com" },
  { name: "Meta", domain: "meta.com" },
  { name: "Tesla", domain: "tesla.com" },
  { name: "Broadcom", domain: "broadcom.com" },
  { name: "Taiwan Semiconductor", domain: "tsmc.com" },
  { name: "Berkshire Hathaway", domain: "berkshirehathaway.com" },
  { name: "Eli Lilly", domain: "lilly.com" },
  { name: "JPMorgan Chase", domain: "jpmorganchase.com" },
  { name: "Walmart", domain: "walmart.com" },
  { name: "Visa", domain: "visa.com" },
  { name: "Mastercard", domain: "mastercard.com" },
  { name: "UnitedHealth Group", domain: "unitedhealthgroup.com" },
  { name: "ExxonMobil", domain: "exxonmobil.com" },
  { name: "Costco", domain: "costco.com" },
  { name: "Oracle", domain: "oracle.com" },
  { name: "Netflix", domain: "netflix.com" },
  { name: "Adobe", domain: "adobe.com" },
  { name: "Salesforce", domain: "salesforce.com" },
  { name: "Cisco", domain: "cisco.com" },
  { name: "Coca-Cola", domain: "coca-cola.com" },
  { name: "PepsiCo", domain: "pepsico.com" },
  { name: "Nike", domain: "nike.com" },
  { name: "McDonald's", domain: "mcdonalds.com" },
  { name: "Toyota", domain: "toyota.com" },
  { name: "Samsung", domain: "samsung.com" },
  { name: "Sony", domain: "sony.com" },
  { name: "IBM", domain: "ibm.com" },
  { name: "Intel", domain: "intel.com" },
  { name: "AMD", domain: "amd.com" },
  { name: "Qualcomm", domain: "qualcomm.com" },
  { name: "Spotify", domain: "spotify.com" },
  { name: "Airbnb", domain: "airbnb.com" },
  { name: "Uber", domain: "uber.com" },
  { name: "Shopify", domain: "shopify.com" },
  { name: "Stripe", domain: "stripe.com" },
  { name: "Square", domain: "block.xyz" },
  { name: "PayPal", domain: "paypal.com" },
  { name: "Coinbase", domain: "coinbase.com" },
  { name: "Dropbox", domain: "dropbox.com" },
  { name: "Atlassian", domain: "atlassian.com" },
  { name: "GitHub", domain: "github.com" },
  { name: "Linear", domain: "linear.app" },
  { name: "Notion", domain: "notion.so" },
  { name: "Figma", domain: "figma.com" },
  { name: "OpenAI", domain: "openai.com" },
  { name: "Anthropic", domain: "anthropic.com" },
];

export function getTopDomain(domain: string): TopDomain | undefined {
  return TOP_DOMAINS.find((d) => d.domain === domain);
}
