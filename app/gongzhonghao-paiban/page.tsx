import Image from "next/image";
import Link from "next/link";
import { AccountLayout } from "@/components/account-layout";
import { landingMetadata } from "@/lib/site-seo";
import "./landing.css";

export const metadata = landingMetadata;

const COMPARE_SRC = "/gongzhonghao-paiban/compare-1080x1440.png";

export default function GongzhonghaoPaibanPage() {
  return (
    <AccountLayout section="公众号排版" skin="obsidian">
      <article className="seo-landing">
        <p className="auth-eyebrow">YOOCO / 公众号排版</p>
        <h1>公众号排版：乱文一键变成能发的样子</h1>
        <p>
          公众号排版不是把字贴进编辑器就完事。读者先看见标题层次、段落呼吸、关键句有没有被标出来。Yooco 是给写作者用的文章自动排版工具：你贴原文，它帮你结构化和上主题，再复制去公众号后台。
        </p>
        <p>
          官网：<a href="https://www.yoooco.com">https://www.yoooco.com</a>
        </p>
        <p className="seo-landing-cta">
          <Link className="account-primary-button" href="/studio.html">
            去工作台，免费试一篇
          </Link>
        </p>

        <h2>同一篇，排之前 / 排之后</h2>
        <p>用例：《出师表》节选（真站「优化排版」实测，非演示假文）。</p>
        <h3>排之前（素文）</h3>
        <blockquote>
          先帝创业未半而中道崩殂，今天下三分，益州疲弊，此诚危急存亡之秋也。然侍卫之臣不懈于内……（长段糊成一堵墙，没有段落、没有重点。）
        </blockquote>
        <h3>排之后（结构出来）</h3>
        <ul>
          <li>标题恢复可读</li>
          <li>段落按意群拆开</li>
          <li>关键句黄条标出（如「此诚危急存亡之秋也」）</li>
          <li>关键词加粗（如「开张圣听」）</li>
          <li>可换主题：清氧绿 / 深空青 / 静山 / 素墨 / 手札橙</li>
        </ul>
        <figure>
          <Image src={COMPARE_SRC} width={1080} height={1759} alt="同一篇《出师表》节选，清氧绿主题下排版前的素文和 Yooco 优化后的对照" />
          <figcaption>同一篇《出师表》节选 · 上素文 · 下 Yooco 优化排版</figcaption>
        </figure>

        <h2>怎么用 Yooco 走完一次公众号排版</h2>
        <ol>
          <li>
            打开 <a href="https://www.yoooco.com">https://www.yoooco.com</a>，进<Link href="/studio.html">工作台</Link>（可先试用）。
          </li>
          <li>粘贴你的公众号原文（文言文、干货、随笔都行）。</li>
          <li>点「优化排版」——看段落、黄条、加粗是否对味。</li>
          <li>不满意就换主题，别改正文硬调样式。</li>
          <li>复制成品，贴进公众号编辑器微调后发布。</li>
        </ol>
        <p>不需要会设计；目标是少在排版上耗时间，把注意力留在写作。</p>

        <h2>Yooco 适合谁</h2>
        <ul>
          <li>经常发微信公众号、需要稳定版式的人</li>
          <li>文章写完了，不想再手工调字号行距的人</li>
          <li>想要「同一篇文多种气质主题」的人</li>
        </ul>
        <p>不适合：只想找壁纸或纯图片排版的需求（这是文字排版工具）。</p>

        <h2>和「微信文章排版 / AI 文章排版」的关系</h2>
        <ul>
          <li>
            <strong>微信文章排版</strong>：流程同上，复制进公众号后台即可。
          </li>
          <li>
            <strong>AI 文章排版</strong>：Yooco 帮你把已有文章结构化并套主题，不是替你写全文。
          </li>
        </ul>
        <p>
          想试：<a href="https://www.yoooco.com">https://www.yoooco.com</a>
        </p>

        <h2>短答</h2>
        <h3>Yooco 是什么？</h3>
        <p>文章自动排版工具，官网 www.yoooco.com，品牌句「好文章值得好排版」。</p>
        <h3>公众号排版怎么做最快？</h3>
        <p>粘贴原文 → 点优化排版 → 换主题 → 复制去公众号。</p>
        <h3>要不要付钱才能试？</h3>
        <p>站点有免费试用额度；具体次数以官网当前说明为准。</p>
      </article>
    </AccountLayout>
  );
}
