"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import {
  HERO_SPECIMEN,
  SECTION_SPECIMENS,
  SHELF_SPECIMENS,
  type Specimen,
} from "@/lib/home-specimens";
import { HomeFlipBook } from "@/components/home-flip-book";
import { shiftStyle } from "@/components/home-parallax";
import { PlatePage, SpecimenSheet } from "@/components/home-sheet";

function Spread({ specimen, tilt, roomy }: { specimen: Specimen; tilt?: boolean; roomy?: boolean }) {
  const tiltRef = useRef<HTMLDivElement>(null);
  useBookTilt(tiltRef, Boolean(tilt));
  const plate = specimen.plate;
  return (
    <div className={roomy ? "bk-book is-roomy" : "bk-book"} key={specimen.id}>
      <div className="bk-book-tilt" ref={tiltRef}>
        <div className="bk-volume">
          <div className="bk-spread">
            {plate ? <PlatePage plate={plate} /> : null}
            <div className="bk-leaf">
              <SpecimenSheet specimen={specimen} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function useBookTilt(ref: RefObject<HTMLDivElement | null>, enabled: boolean) {
  useEffect(() => {
    const book = ref.current;
    if (!book || !enabled) return;
    const node = book;
    const view = window;
    const reduce = view.matchMedia("(prefers-reduced-motion: reduce)");
    const fine = view.matchMedia("(hover: hover) and (pointer: fine)");
    const wide = view.matchMedia("(min-width: 961px)");
    if (reduce.matches || !fine.matches || !wide.matches) return;
    const restX = -8;
    const restY = 5;
    const max = 4;
    let tx = restX;
    let ty = restY;
    let cx = restX;
    let cy = restY;
    let frame = 0;
    function paint() {
      frame = 0;
      cx += (tx - cx) * 0.14;
      cy += (ty - cy) * 0.14;
      node.style.transform = `rotateX(${cy.toFixed(2)}deg) rotateY(${cx.toFixed(2)}deg)`;
      if (Math.abs(tx - cx) > 0.04 || Math.abs(ty - cy) > 0.04) frame = view.requestAnimationFrame(paint);
    }
    function kick() {
      if (!frame) frame = view.requestAnimationFrame(paint);
    }
    function move(event: PointerEvent) {
      const box = node.getBoundingClientRect();
      const px = (event.clientX - box.left) / box.width - 0.5;
      const py = (event.clientY - box.top) / box.height - 0.5;
      tx = restX + px * max * 2;
      ty = restY - py * max;
      kick();
    }
    function leave() {
      tx = restX;
      ty = restY;
      kick();
    }
    node.addEventListener("pointermove", move);
    node.addEventListener("pointerleave", leave);
    return () => {
      node.removeEventListener("pointermove", move);
      node.removeEventListener("pointerleave", leave);
      if (frame) view.cancelAnimationFrame(frame);
      node.style.transform = "";
    };
  }, [enabled, ref]);
}

export function HeroBook() {
  return (
    <>
      <Spread specimen={HERO_SPECIMEN} tilt />
      <p className="bk-caption">真实主题排版，不是示意图。清氧绿 · 《红楼梦》开篇</p>
    </>
  );
}

const SPLITS = [
  { num: "01", title: "贴上你的文章", text: "把 Word、纯文本或直接粘贴的原文放进来。标题、段落和重点按主题排好，先在纸上看效果。" },
  { num: "02", title: "换一个主题，整篇换皮", text: "同一段文字，换主题就换气质。字号、颜色、分隔和重点跟着走，正文一句不改。" },
  { num: "03", title: "标题、引用和重点各就各位", text: "小标题、引文和需要强调的句子按主题长好，不用再一段段手调。" },
  { num: "04", title: "复制出去就能用", text: "预览通过后，一键复制到公众号。版式跟着走，不用在后台再排一遍。" },
];

function OpenReading({ specimen, onClose }: { specimen: Specimen; onClose: () => void }) {
  const [large, setLarge] = useState(false);
  return (
    <article className={large ? "bk-open is-large" : "bk-open"} id="opened-book">
      <Spread specimen={specimen} roomy />
      <div className="bk-open-copy">
        <p className="bk-num">{specimen.theme.label}</p>
        <h3>{specimen.work}</h3>
        <p className="bk-open-author">{specimen.author}</p>
        <p>{specimen.note}</p>
        <p className="bk-open-meta">{specimen.credit}</p>
        <div className="bk-open-actions">
          <button type="button" className="ol-primary" onClick={() => setLarge(true)}>看这一页</button>
          <button type="button" className="ol-secondary" onClick={onClose}>回到书架</button>
        </div>
      </div>
    </article>
  );
}

export function HomeShowcase() {
  const books = SHELF_SPECIMENS;
  const [index, setIndex] = useState(0);
  const [opened, setOpened] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [flip, setFlip] = useState<0 | 1 | -1>(0);
  const count = books.length;
  const openedBook = books.find((book) => book.id === opened) ?? null;

  useEffect(() => {
    setReady(true);
  }, []);

  function commit(step: number) {
    const next = (index + step + count) % count;
    setIndex(next);
    setOpened((current) => (current ? books[next].id : null));
  }

  function turn(step: 1 | -1) {
    if (flip !== 0) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (opened || reduce) {
      commit(step);
      return;
    }
    setFlip(step);
  }

  function finishFlip() {
    const step = flip;
    if (!step) return;
    setIndex((current) => (current + step + count) % count);
    setFlip(0);
  }

  function openBook(book: Specimen) {
    setOpened(book.id);
    const order = books.findIndex((item) => item.id === book.id);
    if (order >= 0) setIndex(order);
    window.requestAnimationFrame(() => {
      document.getElementById("opened-book")?.scrollIntoView({ block: "start", behavior: "auto" });
    });
  }

  return (
    <>
      <section className="bk-opening" data-parallax aria-labelledby="home-opening-title">
        <div className="bk-giant bk-shift" style={shiftStyle(240)} aria-hidden="true">篇</div>
        <div className="bk-opening-copy bk-shift" style={shiftStyle(-130)}>
          <h2 id="home-opening-title">
            <span>每一篇，都该有一次体面的开场。</span>
            <em>标题、首句、空白，都算数。</em>
          </h2>
          <p>标题怎么落、首句怎么起、空白留多少，按主题排好，松紧你来定。</p>
        </div>
      </section>

      {SECTION_SPECIMENS.map((specimen, order) => {
        const copy = SPLITS[order];
        const book = order === 3;
        return (
          <section className="bk-split" data-parallax id={`piece-${copy.num}`} key={specimen.id} aria-labelledby={`piece-${copy.num}-title`}>
            <div className="bk-split-copy bk-shift" style={shiftStyle(-110)}>
              <p className="bk-num">{copy.num}</p>
              <h2 id={`piece-${copy.num}-title`}>{copy.title}</h2>
              <p>{copy.text}</p>
            </div>
            <div className="bk-split-stage bk-shift" id={`sheet-${specimen.id}`} style={shiftStyle(140)}>
              {book ? <Spread specimen={specimen} /> : (
                <div className="bk-paper">
                  <SpecimenSheet specimen={specimen} />
                </div>
              )}
              <p className="bk-caption">
                <span>{specimen.theme.label}</span>
                <span>{specimen.credit}</span>
              </p>
            </div>
          </section>
        );
      })}

      <section className="bk-studio" data-parallax aria-labelledby="home-studio-title">
        <div className="bk-studio-head bk-shift" style={shiftStyle(-90)}>
          <h2 id="home-studio-title">
            <span>把工作台</span>
            <em>围着文章铺开。</em>
          </h2>
          <p>左边看结构，中间改文章，右边调主题。预览里的样子，就是复制出去的样子。</p>
        </div>
        <div className="bk-cards bk-shift" style={shiftStyle(120)}>
          <article className="bk-feature">
            <p className="bk-num">大纲</p>
            <h3>文章大纲</h3>
            <p>可折叠，可搜索。点一条，就跳到那一段。</p>
            <ol>
              <li>01 先看结构</li>
              <li>02 搜标题，不删段落</li>
              <li>03 收起来也不挡正文</li>
            </ol>
          </article>
          <article className="bk-card">
            <h3>微信手机框</h3>
            <p>文章区里看手机上的样子。设置栏还在右边。</p>
          </article>
          <article className="bk-card">
            <h3>多套主题</h3>
            <p>清氧绿、深空青、质感，还有这一排书封上的几套。</p>
          </article>
          <article className="bk-card">
            <h3>划词改样式</h3>
            <p>在预览里划一段，改这一处的字号和样子。</p>
          </article>
          <article className="bk-card">
            <h3>日夜外壳</h3>
            <p>只换网站的纸色。稿子自己的配色不动。</p>
          </article>
          <article className="bk-card bk-card-accent">
            <h3>复制到公众号</h3>
            <p>预览通过后复制。版式跟着走，后台不用再排一遍。</p>
          </article>
        </div>
      </section>

      <section className={openedBook ? "bk-shelf is-reading" : "bk-shelf"} data-parallax id="theme-shelf" aria-labelledby="home-shelf-title">
        <div className="bk-shelf-head bk-shift" style={shiftStyle(-80)}>
          <div>
            <h2 id="home-shelf-title">主题书架</h2>
            <p>左右翻一页。左页是画，右页是用这个主题排好的名著选段。</p>
          </div>
          <div className="bk-shelf-nav">
            <button type="button" aria-label="往前翻一页" onClick={() => turn(-1)} disabled={flip !== 0}>←</button>
            <span className="bk-flip-count">{index + 1} / {count}</span>
            <button type="button" aria-label="往后翻一页" onClick={() => turn(1)} disabled={flip !== 0}>→</button>
          </div>
        </div>
        {openedBook ? null : (
          <HomeFlipBook
            books={books}
            index={index}
            direction={flip}
            onOpen={() => openBook(books[index])}
            onDone={finishFlip}
          />
        )}
        {openedBook ? <OpenReading specimen={openedBook} onClose={() => { setOpened(null); document.getElementById("theme-shelf")?.scrollIntoView({ block: "start" }); }} /> : null}
        {!ready ? (
          <div className="bk-reads">
            {books.map((book) => (
              <article key={book.id} id={`sheet-${book.id}`} className="bk-read">
                <h3>{book.theme.label} · {book.work}</h3>
                <SpecimenSheet specimen={book} />
              </article>
            ))}
          </div>
        ) : null}
      </section>
    </>
  );
}
