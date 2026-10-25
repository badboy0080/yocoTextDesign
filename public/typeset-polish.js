/*
 * 排版后处理：半角数字、中英之间留空。
 * 只处理预览和复制用的文字，不改代码块和网址内部。
 * 空格用普通空格，大约是一个汉字的四分之一宽。已有空格不再加。
 */
(function (root) {
  const GAP = " ";
  const CJK = /[\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF]/;
  const LATIN = /[A-Za-z0-9]/;
  const HAN = "[\\u3400-\\u4DBF\\u4E00-\\u9FFF\\uF900-\\uFAFF]";
  const MARKS = "(?:\\*\\*|__|~~|\\+\\+|==|\\*|~)";

  function foldFullwidthDigits(text) {
    return text.replace(/[\uFF10-\uFF19]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xFEE0));
  }

  function polishPlain(text) {
    const cjk = "[\\u3400-\\u4DBF\\u4E00-\\u9FFF\\uF900-\\uFAFF]";
    const latin = "[A-Za-z0-9]";
    let out = foldFullwidthDigits(text);
    out = out.replace(new RegExp(`(${cjk})(${MARKS}*)(${latin})`, "g"), `$1${GAP}$2$3`);
    out = out.replace(new RegExp(`(${latin})(${MARKS}*)(${cjk})`, "g"), `$1$2${GAP}$3`);
    return out;
  }

  function classifyEnd(text) {
    const stripped = text.replace(new RegExp(`${MARKS}+$`), "");
    if (!stripped) return "none";
    const ch = stripped[stripped.length - 1];
    if (/\s/u.test(ch)) return "space";
    if (CJK.test(ch)) return "cjk";
    if (LATIN.test(ch)) return "latin";
    return "other";
  }

  function classifyStart(text) {
    const stripped = text.replace(new RegExp(`^${MARKS}+`), "");
    if (!stripped) return "none";
    const ch = stripped[0];
    if (/\s/u.test(ch)) return "space";
    if (CJK.test(ch)) return "cjk";
    if (LATIN.test(ch)) return "latin";
    return "other";
  }

  function splitProtected(source) {
    const re = /`[^`\n]*`|https?:\/\/[^\s<>\])）]+/gi;
    const parts = [];
    let last = 0;
    for (const match of source.matchAll(re)) {
      const index = match.index ?? 0;
      if (index > last) parts.push({ keep: false, text: source.slice(last, index) });
      const token = match[0];
      if (token.startsWith("`")) {
        parts.push({ keep: true, text: token });
      } else {
        // 网址内部不改。只有紧挨在英数后面的中文才拆出去，避免把「查看。」吃进链接。
        const peeled = token.match(new RegExp(`^(https?:\\/\\/.*[A-Za-z0-9])(${HAN}.*)$`, "i"));
        if (peeled) {
          parts.push({ keep: true, text: peeled[1] });
          parts.push({ keep: false, text: peeled[2] });
        } else {
          parts.push({ keep: true, text: token });
        }
      }
      last = index + token.length;
    }
    if (last < source.length) parts.push({ keep: false, text: source.slice(last) });
    return parts;
  }

  function needsGap(prev, next) {
    const left = classifyEnd(prev);
    const right = classifyStart(next);
    return (left === "cjk" && right === "latin") || (left === "latin" && right === "cjk");
  }

  function polishTypesetText(value) {
    const source = String(value ?? "");
    if (!source) return "";
    const parts = splitProtected(source).map((part) => (
      part.keep ? part : { keep: false, text: polishPlain(part.text) }
    ));
    let out = "";
    parts.forEach((part, index) => {
      if (index > 0 && needsGap(parts[index - 1].text, part.text)) out += GAP;
      out += part.text;
    });
    return out;
  }

  root.polishTypesetText = polishTypesetText;
})(typeof globalThis !== "undefined" ? globalThis : this);
