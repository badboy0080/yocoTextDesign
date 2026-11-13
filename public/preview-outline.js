// 排版结果左侧的大纲。只读预览里的标题，不写进正文，也不进复制稿。
(function (root) {
  const STATUS = {
    empty: "这篇还是空的",
    none: "这篇没有标题",
  };

  function normalizeOutlineText(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function clampOutlineLevel(level) {
    const numeric = Number(level);
    const n = Number.isFinite(numeric) ? Math.round(numeric) : 2;
    if (n < 1) return 1;
    if (n > 6) return 6;
    return n;
  }

  function outlineItemsFromRecords(records) {
    const items = [];
    const seen = new Set();
    (records || []).forEach((record) => {
      const text = normalizeOutlineText(record?.text);
      if (!text) return;
      const key = record?.key ?? null;
      if (key != null) {
        if (seen.has(key)) return;
        seen.add(key);
      }
      items.push({ key, level: clampOutlineLevel(record.level), text });
    });
    if (!items.length) return [];
    const min = items.reduce((lowest, item) => Math.min(lowest, item.level), 6);
    return items.map((item) => ({
      ...item,
      indent: (item.level - min) * 12,
    }));
  }

  function outlineMode(empty, count) {
    if (empty) return "empty";
    if (!count) return "none";
    return "list";
  }

  function activeOutlineIndex(tops, line, atBottom) {
    if (!tops || !tops.length) return -1;
    if (atBottom) return tops.length - 1;
    let index = 0;
    for (let i = 0; i < tops.length; i += 1) {
      if (Number(tops[i]) <= line) index = i;
    }
    return index;
  }

  function headingText(el) {
    const main = el.querySelector?.(".heading-panel-main, .heading-oval-text, .heading-atlas-main");
    if (!main) return normalizeOutlineText(el.innerText || el.textContent);
    const mainText = normalizeOutlineText(main.innerText || main.textContent);
    const sub = el.querySelector(".heading-panel-sub, .heading-atlas-sub");
    const subText = sub ? normalizeOutlineText(sub.innerText || sub.textContent) : "";
    if (!subText || subText === "SECTION") return mainText;
    return `${mainText} ${subText}`.trim();
  }

  function readHeadingRecords(page) {
    if (!page?.querySelectorAll) return [];
    const records = [];
    const title = page.querySelector("#articleTitle");
    if (title && !title.hidden && title.getAttribute("aria-hidden") !== "true") {
      const text = normalizeOutlineText(title.innerText || title.textContent);
      if (text) records.push({ key: title, level: 1, text });
    }
    page.querySelectorAll("#articleBody [data-type='heading'], #articleBody .article-masthead-title").forEach((el) => {
      if (el.closest?.(".toc-card, .preview-outline, .signature-card")) return;
      const text = headingText(el);
      if (!text) return;
      const level = el.classList?.contains("article-masthead-title") && !el.dataset?.level ? 2 : el.dataset?.level;
      records.push({ key: el, level, text });
    });
    return records;
  }

  function mountPreviewOutline(doc) {
    const outline = doc.querySelector("#previewOutline");
    const stage = doc.querySelector("#previewStage");
    const page = doc.querySelector("#articlePage");
    const toggle = doc.querySelector("#previewOutlineToggle");
    const body = doc.querySelector("#previewOutlineBody");
    const status = doc.querySelector("#previewOutlineStatus");
    const nav = doc.querySelector("#previewOutlineNav");
    if (!outline || !stage || !page || !toggle || !body || !status || !nav) return;

    const view = doc.defaultView;
    const narrowQuery = view.matchMedia("(max-width: 823px)");
    let saved = "";
    try { saved = view.localStorage.getItem("yooco-preview-outline") || ""; } catch { saved = ""; }
    let open = saved === "open" || (saved !== "shut" && !narrowQuery.matches);
    let items = [];
    let active = -1;
    let timer = 0;
    let frame = 0;

    function setOpen(next, persist) {
      open = Boolean(next);
      outline.classList.toggle("is-collapsed", !open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.textContent = open ? "收起" : "大纲";
      if (!persist) return;
      try { view.localStorage.setItem("yooco-preview-outline", open ? "open" : "shut"); } catch { /* 隐私模式写不进去就只记在这一页 */ }
    }

    function sameItems(next) {
      if (next.length !== items.length) return false;
      return next.every((item, index) => item.key === items[index].key && item.text === items[index].text && item.level === items[index].level && item.indent === items[index].indent);
    }

    function paintActive() {
      const buttons = nav.querySelectorAll(".preview-outline-item");
      buttons.forEach((button, index) => {
        const on = index === active;
        button.classList.toggle("is-current", on);
        if (on) button.setAttribute("aria-current", "location");
        else button.removeAttribute("aria-current");
      });
      const current = buttons[active];
      if (!current) return;
      const box = body.getBoundingClientRect();
      const btn = current.getBoundingClientRect();
      if (btn.top < box.top) body.scrollTop -= box.top - btn.top;
      else if (btn.bottom > box.bottom) body.scrollTop += btn.bottom - box.bottom;
    }

    function scrollToItem(item) {
      const el = item?.key;
      if (!el?.isConnected) {
        refresh();
        return;
      }
      const stageRect = stage.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      const top = stage.scrollTop + (elRect.top - stageRect.top) - 16;
      const reduce = view.matchMedia("(prefers-reduced-motion: reduce)").matches;
      stage.scrollTo({ top: Math.max(0, top), behavior: reduce ? "auto" : "smooth" });
    }

    function renderList(next, mode) {
      const showList = mode === "list";
      status.hidden = showList;
      nav.hidden = !showList;
      if (!showList) {
        status.textContent = STATUS[mode] || STATUS.none;
        nav.replaceChildren();
        items = [];
        active = -1;
        return;
      }
      if (sameItems(next)) return;
      const previousKey = items[active]?.key;
      items = next;
      nav.replaceChildren();
      next.forEach((item, index) => {
        const button = doc.createElement("button");
        button.type = "button";
        button.className = "preview-outline-item";
        button.style.setProperty("--outline-indent", `${item.indent}px`);
        button.dataset.level = String(item.level);
        button.textContent = item.text;
        button.title = item.text;
        button.addEventListener("click", () => {
          active = index;
          paintActive();
          scrollToItem(items[index]);
        });
        nav.append(button);
      });
      const kept = next.findIndex((item) => item.key === previousKey);
      active = kept >= 0 ? kept : -1;
    }

    function measureActive() {
      if (!items.length || stage.hidden) return;
      const stageRect = stage.getBoundingClientRect();
      const line = stageRect.top + Math.min(120, Math.max(64, stage.clientHeight * 0.2));
      const tops = items.map((item) => (item.key?.isConnected ? item.key.getBoundingClientRect().top : Number.POSITIVE_INFINITY));
      if (tops.every((top) => !Number.isFinite(top))) {
        refresh();
        return;
      }
      const atBottom = stage.scrollTop + stage.clientHeight >= stage.scrollHeight - 8;
      const next = activeOutlineIndex(tops, line, atBottom);
      if (next === active) return;
      active = next;
      paintActive();
    }

    function refresh() {
      outline.hidden = Boolean(stage.hidden);
      const empty = stage.classList.contains("is-source-empty");
      const records = empty ? [] : readHeadingRecords(page);
      const next = outlineItemsFromRecords(records);
      renderList(next, outlineMode(empty, next.length));
      if (next.length && !stage.hidden) measureActive();
    }

    function schedule(records) {
      const immediate = Array.isArray(records) && records.some((record) => record.attributeName === "hidden" || record.attributeName === "class");
      if (immediate) {
        view.clearTimeout(timer);
        timer = 0;
        refresh();
        return;
      }
      view.clearTimeout(timer);
      timer = view.setTimeout(() => {
        timer = 0;
        refresh();
      }, 60);
    }

    function onScroll() {
      if (frame) return;
      frame = view.requestAnimationFrame(() => {
        frame = 0;
        measureActive();
      });
    }

    toggle.addEventListener("click", () => setOpen(!open, true));
    stage.addEventListener("scroll", onScroll, { passive: true });
    setOpen(open, false);
    refresh();

    const pageObserver = new MutationObserver(schedule);
    pageObserver.observe(page, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["data-level", "hidden", "aria-hidden"],
    });
    const stageObserver = new MutationObserver(schedule);
    stageObserver.observe(stage, { attributes: true, attributeFilter: ["hidden", "class"] });
  }

  root.YoocoPreviewOutline = {
    normalizeOutlineText,
    clampOutlineLevel,
    outlineItemsFromRecords,
    outlineMode,
    activeOutlineIndex,
    readHeadingRecords,
    mountPreviewOutline,
    STATUS,
  };

  if (typeof document !== "undefined" && document.querySelector("#previewOutline")) {
    const start = () => mountPreviewOutline(document);
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
    else start();
  }
})(globalThis);
