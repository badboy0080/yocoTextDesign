/**
 * 站点级统一配置。
 * 换正式域名、公众号名称/二维码确定后，只改这一个文件。
 * 注意：工作室页（public/studio.html）是纯静态页，其页脚文案与二维码在
 * studio.html 内同步维护，改动时两处一起改。
 */
export const SITE_CONFIG = {
  /**
   * 正式站点地址。标题、canonical、sitemap 从这里取。
   * 不带 www 的 yoooco.com 目前也能打开，站内链接和这里统一用 www。
   */
  siteUrl: "https://www.yoooco.com",
  wechat: {
    /** 公众号名称；未确定前留空，页脚不显示名称，只显示引导文案 */
    accountName: "",
    /** 自动回复暗号 */
    keyword: "排版",
    /** 关注后领取的资料描述 */
    offer: "精选主题包",
    /** 二维码图片路径；替换真实二维码时把图片放到 public/ 并改这里 */
    qrPath: "/wechat-qr.svg",
    /** 真实二维码是否已就位（false 时显示占位图） */
    qrReady: false,
  },
} as const;

export type SiteConfig = typeof SITE_CONFIG;
