import { SITE_CONFIG } from "@/lib/site-config";
import { absoluteUrl, LANDING_PATH } from "@/lib/site-seo";

/** 试用按钮和正文里的官网链接。全页试用都去首页，不另开路径。 */
export const TRIAL_URL = SITE_CONFIG.siteUrl;

export const LANDING_H1 = "公众号排版：粘贴原文，一键变成能发的样子";

/** 开篇定义。整段可被引用，和结构化数据里的产品说明用同一句。 */
export const LANDING_DEFINITION =
  "公众号排版是把文章变成适合微信阅读的版式。Yooco 是公众号排版工具：粘贴或上传，一键优化排版、换主题，复制到公众号就能发。免费试用。适合写完正文的人。";

export const LANDING_UPDATED = "2026-10-26";

export const LANDING_COMPARE_SRC = "/gongzhonghao-paiban/compare-1080x1440.png";

/**
 * 定稿写的是「左 / 右」。这张 1080×1440 图实际是上素文、下清氧绿，
 * 图里自己也标着「排版前」「排版后」。方向改成上 / 下，其余用定稿。
 */
export const LANDING_COMPARE_CAPTION =
  "同一篇《出师表》节选 · 上素文 · 下 Yooco 优化排版（清氧绿）· 真站实测";

export const LANDING_FAQS = [
  {
    question: "Yooco 收费吗？免费试用怎么用？",
    answer:
      "有免费试用。打开 https://www.yoooco.com 即可粘贴文章试用「优化排版」；额度与套餐以官网当前说明为准。",
  },
  {
    question: "复制到公众号以后格式会乱吗？",
    answer:
      "按流程复制成品再贴进微信公众号编辑器，标题层次、段落和强调会一起带走。个别账号后台若有清理样式，以微信后台实际表现为准，可在后台微调。",
  },
  {
    question: "文章里的图片怎么处理？",
    answer:
      "Yooco 主路径是文字自动排版与主题。图多、要复杂拼版时，可在公众号后台补图，或改用偏素材/拖拽的编辑器。",
  },
  {
    question: "我写的内容隐私吗？会不会拿去训练？",
    answer:
      "以官网现行隐私政策与产品说明为准。写敏感内容前，请先阅读站点隐私条款；不要假设「本地不上传」。",
  },
  {
    question: "和微信自带编辑器是什么关系？",
    answer:
      "Yooco 不替代公众号后台。你在 Yooco 里排好，再复制到微信公众号编辑器发布。微信后台仍是发布与审核入口。",
  },
  {
    question: "AI 会不会替我写全文？",
    answer: "不会。Yooco 做的是AI文章排版：把你已有文章结构化并套主题，不替你从零写全文。",
  },
  {
    question: "邀请好友怎么算？",
    answer: "双方各 +5、一码最多 5 次、同一账号仅计一次。具体以官网邀请页当前规则为准。",
  },
  {
    question: "不会设计能不能用？",
    answer: "能。流程就是：粘贴或上传 → 点「优化排版」→ 换主题 → 复制到公众号。不必先学设计软件。",
  },
] as const;

const FEATURE_LIST = [
  "粘贴或上传",
  "优化排版",
  "主题（清氧绿、深空青、静山、素墨、手札橙）",
  "复制到微信公众号",
] as const;

/** 有免费试用，不写死价格。正文就是第一条问答。 */

export const landingJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": absoluteUrl(LANDING_PATH),
      url: absoluteUrl(LANDING_PATH),
      name: LANDING_H1,
      description: LANDING_DEFINITION,
      dateModified: LANDING_UPDATED,
      inLanguage: "zh-CN",
    },
    {
      "@type": "SoftwareApplication",
      name: "Yooco",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: TRIAL_URL,
      description: LANDING_DEFINITION,
      featureList: [...FEATURE_LIST],
      offers: {
        "@type": "Offer",
        url: TRIAL_URL,
        description: LANDING_FAQS[0].answer,
      },
    },
    {
      "@type": "FAQPage",
      mainEntity: LANDING_FAQS.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    },
  ],
};
