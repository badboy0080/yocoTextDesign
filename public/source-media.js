/**
 * 从原文里找回图片和链接。
 * 优化如果把它们收成纯文字或整段丢掉，这里按原文补回去。
 * 预览和复制用的是同一套地址规则，写在 app.js。
 */

const IMAGE_EXT = /\.(?:jpe?g|png|gif|webp)(?:!|$)/i;
const IMAGE_HOST = /(^|\.)(?:mmbiz\.qpic\.cn|mmbiz\.qlogo\.cn|qpic\.cn|qlogo\.cn)$/i;
const IMAGE_QUERY = /[?&](?:wx_fmt|format|fmt)=(jpe?g|png|gif|webp)\b/i;
const DATA_IMAGE = /^data:image\/(png|jpeg|gif|webp);base64,([a-z0-9+/=]+)$/i;
const EMBEDDED_IMAGE_MAX_BYTES = 2 * 1024 * 1024;
const TRAILING_URL_PUNCT = /[>）)\]】》」』。．.，,；;：:！!？?、]+$/u;

export function cleanPastedUrl(value) {
  return String(value || "").trim().replace(/^[<（(]+/, "").replace(TRAILING_URL_PUNCT, "");
}

export function absoluteHttpUrl(value) {
  let raw = cleanPastedUrl(value);
  if (raw.startsWith("//")) raw = `https:${raw}`;
  if (!/^https?:\/\//i.test(raw)) return "";
  try {
    const url = new URL(raw);
    if (url.protocol !== "http:" && url.protocol !== "https:") return "";
    return url.href;
  } catch {
    return "";
  }
}

export function allowedDataImage(value) {
  const raw = String(value || "").trim().replace(/\s/g, "");
  const match = raw.match(DATA_IMAGE);
  if (!match) return "";
  const bytes = Math.floor((match[2].length * 3) / 4);
  if (!bytes || bytes > EMBEDDED_IMAGE_MAX_BYTES) return "";
  return raw;
}

export function isDisplayImageUrl(value) {
  const url = absoluteHttpUrl(value);
  if (!url) return false;
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }
  if (IMAGE_HOST.test(parsed.hostname)) return true;
  if (IMAGE_EXT.test(parsed.pathname)) return true;
  if (IMAGE_QUERY.test(parsed.search)) return true;
  return false;
}

function cleanAlt(value) {
  const alt = String(value || "").replace(/\s+/g, " ").replace(/[\[\]]/g, "").trim();
  return alt.slice(0, 80) || "文章配图";
}

function stripCode(source) {
  return String(source || "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`\n]*`/g, "");
}

function blobHasUrl(blob, url) {
  if (!url) return false;
  let from = 0;
  while (from <= blob.length) {
    const index = blob.indexOf(url, from);
    if (index < 0) return false;
    const next = blob[index + url.length] || "";
    if (!/[A-Za-z0-9/?#=&_%~.+-]/.test(next)) return true;
    from = index + url.length;
  }
  return false;
}

export function extractSourceMedia(source) {
  const text = stripCode(source);
  const images = [];
  const links = [];
  const seenImage = new Set();
  const seenLink = new Set();
  const pushImage = (url, alt) => {
    if (!url || seenImage.has(url) || images.length >= 30) return;
    seenImage.add(url);
    images.push({ url, alt: cleanAlt(alt) });
  };
  const pushLink = (url, label) => {
    if (!url || seenImage.has(url) || seenLink.has(url) || links.length >= 30) return;
    seenLink.add(url);
    links.push({ url, label: String(label || url).replace(/\s+/g, " ").trim() || url });
  };

  for (const match of text.matchAll(/!\[([^\]]*)\]\((data:image\/(?:png|jpeg|gif|webp);base64,[a-z0-9+/=]+)\)/gi)) {
    const url = allowedDataImage(match[2]);
    if (url) pushImage(url, match[1]);
  }
  for (const match of text.matchAll(/!\[([^\]]*)\]\((https?:\/\/[^)\s]+)(?:\s+"[^"]*")?\)/gi)) {
    const url = absoluteHttpUrl(match[2]);
    if (url) pushImage(url, match[1]);
  }
  for (const line of text.split("\n")) {
    const data = allowedDataImage(line.trim());
    if (data) pushImage(data, "文章配图");
  }
  for (const match of text.matchAll(/(^|[^!])\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g)) {
    const url = absoluteHttpUrl(match[3]);
    if (!url) continue;
    pushLink(url, match[2]);
  }
  for (const match of text.matchAll(/https?:\/\/[^\s<>\])）]+/gi)) {
    const url = absoluteHttpUrl(match[0]);
    if (!url || seenImage.has(url) || seenLink.has(url)) continue;
    if (isDisplayImageUrl(url)) pushImage(url, "文章配图");
    else pushLink(url, url);
  }
  return { images, links };
}

function collectStrings(block) {
  if (!block || block.type === "code") return [];
  const found = [];
  for (const key of ["text", "title", "sub"]) {
    if (typeof block[key] === "string") found.push({ holder: block, key, value: block[key] });
  }
  if (Array.isArray(block.items)) {
    block.items.forEach((item, index) => {
      if (typeof item === "string") found.push({ holder: block.items, key: index, value: item });
      else if (item && typeof item === "object") {
        for (const key of ["text", "title", "label", "value"]) {
          if (typeof item[key] === "string") found.push({ holder: item, key, value: item[key] });
        }
      }
    });
  }
  if (Array.isArray(block.headers)) {
    block.headers.forEach((cell, index) => {
      if (typeof cell === "string") found.push({ holder: block.headers, key: index, value: cell });
    });
  }
  if (Array.isArray(block.rows)) {
    block.rows.forEach((row) => {
      if (!Array.isArray(row)) return;
      row.forEach((cell, index) => {
        if (typeof cell === "string") found.push({ holder: row, key: index, value: cell });
      });
    });
  }
  return found;
}

function isWholeLabel(value, index, label) {
  if (/[\u3400-\u9fff]/.test(label)) return true;
  const before = value[index - 1] || "";
  const after = value[index + label.length] || "";
  return !/[A-Za-z0-9]/.test(before) && !/[A-Za-z0-9]/.test(after);
}

function findSoleLabel(blocks, label) {
  const hits = [];
  blocks.forEach((block) => {
    collectStrings(block).forEach((entry) => {
      let from = 0;
      while (from <= entry.value.length) {
        const index = entry.value.indexOf(label, from);
        if (index < 0) break;
        const before = entry.value.slice(0, index);
        const after = entry.value.slice(index + label.length);
        const linked = before.endsWith("[") || after.startsWith("](");
        if (!linked && isWholeLabel(entry.value, index, label)) hits.push({ entry, index });
        from = index + Math.max(label.length, 1);
      }
    });
  });
  return hits.length === 1 ? hits[0] : null;
}

function anchorBefore(source, needle) {
  const index = String(source || "").indexOf(needle);
  if (index <= 0) return "";
  const before = String(source).slice(0, index).replace(/[#>*`[\]()!_~=|-]/g, "");
  return before.replace(/\s+/g, "").slice(-8);
}

function insertAfterAnchor(blocks, anchor, block) {
  if (anchor && anchor.length >= 4) {
    const index = blocks.findIndex((item) => JSON.stringify(item).includes(anchor));
    if (index >= 0) {
      blocks.splice(index + 1, 0, block);
      return;
    }
  }
  blocks.push(block);
}

export function restoreSourceMedia(document, source) {
  if (!document || !Array.isArray(document.blocks)) return document;
  const { images, links } = extractSourceMedia(source);
  if (!images.length && !links.length) return document;
  const blocks = JSON.parse(JSON.stringify(document.blocks));
  const blob = () => JSON.stringify(blocks);
  images.forEach((image) => {
    if (blobHasUrl(blob(), image.url)) return;
    insertAfterAnchor(blocks, anchorBefore(source, image.url), {
      type: "image",
      url: image.url,
      alt: image.alt || "文章配图",
    });
  });
  links.forEach((link) => {
    if (blobHasUrl(blob(), link.url)) return;
    const label = String(link.label || "").trim();
    const safeLabel = label.replace(/[\[\]]/g, "");
    const hit = safeLabel && safeLabel !== link.url && safeLabel.length >= 2
      ? findSoleLabel(blocks, safeLabel)
      : null;
    if (hit) {
      const { entry, index } = hit;
      const value = entry.value;
      entry.holder[entry.key] = `${value.slice(0, index)}[${safeLabel}](${link.url})${value.slice(index + safeLabel.length)}`;
      return;
    }
    const text = safeLabel && safeLabel !== link.url ? `[${safeLabel}](${link.url})` : link.url;
    blocks.push({ type: "paragraph", text });
  });
  return { ...document, blocks };
}
