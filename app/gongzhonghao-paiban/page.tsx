import { AccountLayout } from "@/components/account-layout";
import {
  LANDING_COMPARE_CAPTION,
  LANDING_COMPARE_SRC,
  LANDING_DEFINITION,
  LANDING_FAQS,
  LANDING_H1,
  LANDING_UPDATED,
  TRIAL_URL,
  landingJsonLd,
} from "@/lib/landing-answer";
import { landingMetadata } from "@/lib/site-seo";
import "./landing.css";

export const metadata = landingMetadata;

export default function GongzhonghaoPaibanPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(landingJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <AccountLayout section="公众号排版" skin="obsidian">
        <article className="seo-landing">
          <p className="auth-eyebrow">YOOCO / 公众号排版</p>
          <h1>{LANDING_H1}</h1>
          <p className="seo-landing-lead">{LANDING_DEFINITION}</p>
          <p>
            官网：<a href={TRIAL_URL}>{TRIAL_URL}</a>
          </p>
          <p className="seo-landing-cta">
            <a className="account-primary-button" href={TRIAL_URL}>
              免费试用
            </a>
          </p>

          <h2>适合谁，不太适合谁</h2>
          <h3>适合</h3>
          <ul>
            <li>
              经常发<strong>微信文章排版</strong>、需要稳定版式的公众号作者和小编
            </li>
            <li>文章写完了，不想再在公众号后台逐段调字号、行距、加粗的人</li>
            <li>想同一篇文换几种气质主题（清氧绿 / 深空青 / 静山 / 素墨 / 手札橙）再挑一版发出去的人</li>
            <li>
              需要<strong>AI文章排版</strong>帮忙「结构化 + 上主题」，但不需要 AI 代写全文的人
            </li>
          </ul>
          <h3>不太适合</h3>
          <ul>
            <li>要复杂拖拽、海量模板素材库、SVG 互动动画的人（那是 135 / 秀米一类编辑器的强项）</li>
            <li>只想找壁纸、拼图、纯图片海报排版的人（Yooco 偏文字自动排版）</li>
            <li>指望工具替你从零写完整篇文章的人（Yooco 不替你写全文）</li>
          </ul>

          <h2>怎么走完一次公众号排版</h2>
          <ol className="seo-landing-steps">
            <li>
              <strong>粘贴或上传</strong>
              <p>
                打开 <a href={TRIAL_URL}>{TRIAL_URL}</a>
                ，把写好的公众号原文粘贴进工作台，或上传文件。文言文、干货、随笔都行。
              </p>
            </li>
            <li>
              <strong>点「优化排版」，再换主题</strong>
              <p>
                点「优化排版」，看段落是否拆开、关键句有没有标出来。不满意就换主题（清氧绿、深空青、静山、素墨、手札橙），别在正文里硬抠样式。
              </p>
            </li>
            <li>
              <strong>复制到微信公众号</strong>
              <p>复制成品，粘贴进微信公众号后台的图文编辑器，微调后发布。</p>
            </li>
          </ol>
          <p>不需要会设计。目标是少在排版上耗时间，把注意力留在写作。</p>

          <h2>Yooco 和 135编辑器、秀米、花生怎么选</h2>
          <p>
            没有完美工具。下表按「你主要痛点是什么」选，不是打分排名。竞品能力以各站公开说明为准；Yooco 侧为产品事实。
          </p>
          <div className="seo-landing-table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">维度</th>
                  <th scope="col">Yooco</th>
                  <th scope="col">135编辑器</th>
                  <th scope="col">秀米</th>
                  <th scope="col">花生排版器</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">核心定位</th>
                  <td>文字自动排版 + 主题：粘贴 → 优化排版 → 复制去公众号</td>
                  <td>一站式图文编辑器（模板/素材/AI排版/SVG 等）</td>
                  <td>偏设计感的模板拖拽排版</td>
                  <td>Markdown / 粘贴 → 选样式 → 复制到公众号</td>
                </tr>
                <tr>
                  <th scope="row">上手路径</th>
                  <td>短：三步出成品</td>
                  <td>功能面广，按场景选模块</td>
                  <td>选模板再拖改</td>
                  <td>开网页即用，偏 Markdown 工作流</td>
                </tr>
                <tr>
                  <th scope="row">主题 / 样式</th>
                  <td>清氧绿、深空青、静山、素墨、手札橙等主题切换</td>
                  <td>模板与素材库体量大</td>
                  <td>样式与设计感强</td>
                  <td>多种排版样式可切换</td>
                </tr>
                <tr>
                  <th scope="row">素材库 / 拖拽</th>
                  <td>
                    <strong>不做</strong>复杂拖拽素材库
                  </td>
                  <td>强（模板、版权素材等）</td>
                  <td>强（拖拽排版）</td>
                  <td>轻：偏文本与样式，支持图片粘贴等</td>
                </tr>
                <tr>
                  <th scope="row">AI 角色</th>
                  <td>
                    <strong>AI文章排版</strong>：结构化已有文章并套主题；<strong>不替你写全文</strong>
                  </td>
                  <td>有 AI 文案+排版等能力（以 135 产品页为准）</td>
                  <td>以设计排版为主</td>
                  <td>本地/网页排版工具，开源免费向</td>
                </tr>
                <tr>
                  <th scope="row">最适合</th>
                  <td>写完正文、要可读层次和稳定主题的人</td>
                  <td>要模板、素材、互动、团队协作的人</td>
                  <td>要强设计感、愿意花时间拖改的人</td>
                  <td>Markdown / 飞书 Notion 粘贴、要免费轻工具的人</td>
                </tr>
                <tr>
                  <th scope="row">Yooco 边界（必读）</th>
                  <td>偏文字自动排版与主题；不做复杂拖拽素材库；不替你写全文</td>
                  <td>—</td>
                  <td>—</td>
                  <td>—</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>选工具一句话：</p>
          <ul>
            <li>正文写好了、只想快速出能发的版式 → 先试 Yooco</li>
            <li>要海量模板、SVG、素材版权与团队协作 → 看 135 / 秀米</li>
            <li>习惯 Markdown、要开箱即用的轻排版 → 看花生</li>
          </ul>

          <h2>同一篇《出师表》，排之前和排之后</h2>
          <p>用例：《出师表》节选——在 www.yoooco.com 真站点「优化排版」实测，非演示假文。</p>
          <h3>排之前</h3>
          <p>长段糊成一堵墙，没有段落、没有重点，读起来费劲。</p>
          <h3>排之后（清氧绿主题示例）</h3>
          <ul>
            <li>标题恢复可读</li>
            <li>段落按意群拆开</li>
            <li>关键句黄条标出（如「此诚危急存亡之秋也」）</li>
            <li>关键词加粗（如「开张圣听」）</li>
            <li>可换主题再挑气质</li>
          </ul>
          <figure>
            {/* 用站内原图地址，方便直接引用，不走图片优化链接。 */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={LANDING_COMPARE_SRC}
              width={1080}
              height={1440}
              alt="《出师表》节选排版对照：上面是没拆段的素文，下面是 Yooco 清氧绿优化排版"
            />
            <figcaption>{LANDING_COMPARE_CAPTION}</figcaption>
          </figure>

          <h2>常见问题</h2>
          {LANDING_FAQS.map((item) => (
            <section key={item.question}>
              <h3>{item.question}</h3>
              <p>{item.answer}</p>
            </section>
          ))}

          <p className="seo-landing-end">写完正文不想再手工抠格式？打开 Yooco 免费试用：</p>
          <p className="seo-landing-cta">
            <a className="account-primary-button" href={TRIAL_URL}>
              免费试用
            </a>
          </p>
          <p>
            <a href={TRIAL_URL}>{TRIAL_URL}</a>
          </p>
          <p className="seo-landing-updated">
            Last updated: <time dateTime={LANDING_UPDATED}>{LANDING_UPDATED}</time>
          </p>
        </article>
      </AccountLayout>
    </>
  );
}
