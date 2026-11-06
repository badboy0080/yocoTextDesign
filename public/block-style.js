// 划中的字号和字体颜色写在选区上，记号是 {{#颜色|字号}}文字{{/}}。整块只继续画旧的底色、间距、描边。颜色只接受十六进制。
(function (root) {
  function clampBlockStyle(value, min, max) {
    const n = Number(value);
    if (!Number.isFinite(n)) return null;
    return Math.min(max, Math.max(min, Math.round(n)));
  }

  function safeBlockColor(value) {
    const text = String(value || "").trim();
    return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(text) ? text : "";
  }

  function blockStyleDeclarations(override, borderColor) {
    const spec = { fontSize: "", color: "", padding: "", backgroundColor: "", borderRadius: "", border: "" };
    if (!override || typeof override !== "object") return spec;
    if (override.fontSize != null) {
      const fontSize = clampBlockStyle(override.fontSize, 12, 48);
      if (fontSize != null) spec.fontSize = `${fontSize}px`;
    }
    const color = safeBlockColor(override.color);
    if (color) spec.color = color;
    if (override.padding != null) {
      const padding = clampBlockStyle(override.padding, 0, 64);
      if (padding != null) spec.padding = `${padding}px`;
    }
    const background = safeBlockColor(override.background);
    if (background) spec.backgroundColor = background;
    if (override.radius != null) {
      const radius = clampBlockStyle(override.radius, 0, 40);
      if (radius != null) spec.borderRadius = `${radius}px`;
    }
    if (override.borderWidth != null) {
      const borderWidth = clampBlockStyle(override.borderWidth, 0, 8);
      if (borderWidth === 0) spec.border = "0";
      else if (borderWidth) {
        const borderInk = safeBlockColor(borderColor) || "#161616";
        spec.border = `${borderWidth}px solid ${borderInk}`;
      }
    }
    return spec;
  }

  function blockStyleCss(override, borderColor) {
    const spec = blockStyleDeclarations(override, borderColor);
    let css = "";
    if (spec.fontSize) css += `font-size:${spec.fontSize};`;
    if (spec.color) css += `color:${spec.color};`;
    if (spec.padding) css += `padding:${spec.padding};`;
    if (spec.backgroundColor) css += `background-color:${spec.backgroundColor};`;
    if (spec.borderRadius) css += `border-radius:${spec.borderRadius};`;
    if (spec.border) css += `border:${spec.border};`;
    return css;
  }

  function paintBlockStyleHtml(html, extra) {
    if (!extra || !html) return html;
    const start = html.indexOf('style="');
    if (start < 0) return html.replace(/^(\s*<[a-zA-Z0-9]+)/, `$1 style="${extra}"`);
    const valueStart = start + 7;
    const end = html.indexOf('"', valueStart);
    if (end < 0) return html;
    return `${html.slice(0, end)}${extra}${html.slice(end)}`;
  }

  function parseRunSpec(spec) {
    const text = String(spec || "").trim();
    const match = text.match(/^(#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3})?)?(?:\|(\d{1,2}))?$/);
    if (!match || (!match[1] && match[2] == null)) return null;
    const color = match[1] ? safeBlockColor(match[1]) : "";
    let fontSize = "";
    if (match[2] != null) {
      const size = Number(match[2]);
      if (Number.isInteger(size) && size >= 12 && size <= 48) fontSize = String(size);
      else if (!color) return null;
    }
    if (!color && !fontSize) return null;
    return { color, fontSize };
  }

  function formatRunSpec(run) {
    if (!run || typeof run !== "object") return "";
    const color = safeBlockColor(run.color);
    let fontSize = "";
    if (run.fontSize != null && run.fontSize !== "") {
      const size = clampBlockStyle(run.fontSize, 12, 48);
      if (size != null) fontSize = String(size);
    }
    if (!color && !fontSize) return "";
    return `${color}${fontSize ? `|${fontSize}` : ""}`;
  }

  function runStyleCss(run) {
    const parsed = typeof run === "string" ? parseRunSpec(run) : parseRunSpec(formatRunSpec(run));
    if (!parsed) return "";
    let css = "";
    if (parsed.color) css += `color:${parsed.color};`;
    if (parsed.fontSize) css += `font-size:${parsed.fontSize}px;`;
    return css;
  }

  const RUN_MARKER = /\{\{(#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3})?(?:\|\d{1,2})?|\|\d{1,2})\}\}((?:(?!\{\{)[\s\S])*?)\{\{\/\}\}/;

  function expandRunMarkers(text, wrap) {
    let out = String(text ?? "");
    for (let i = 0; i < 20; i += 1) {
      const pattern = new RegExp(RUN_MARKER.source, "g");
      if (!pattern.test(out)) break;
      let changed = false;
      out = out.replace(new RegExp(RUN_MARKER.source, "g"), (full, spec, inner) => {
        const parsed = parseRunSpec(spec);
        const css = parsed ? runStyleCss(parsed) : "";
        const canonical = parsed ? formatRunSpec(parsed) : "";
        if (!parsed || !css || !canonical) return full;
        changed = true;
        return wrap(canonical, inner, css);
      });
      if (!changed) break;
    }
    return out;
  }

  function stripRunMarkers(text) {
    return expandRunMarkers(text, (_spec, inner) => inner);
  }

  function snapRunCut(line, index) {
    const text = String(line || "");
    let cursor = Math.max(0, Math.min(text.length, Number(index) || 0));
    const token = /\{\{(?:#[0-9a-fA-F]{3,6}(?:\|\d{1,2})?|\|\d{1,2})\}\}|\{\{\/\}\}/g;
    const opens = [];
    for (const match of text.matchAll(token)) {
      if (match[0] === "{{/}}") {
        const start = opens.pop();
        if (start == null) continue;
        const end = match.index + match[0].length;
        if (cursor > start && cursor < end) cursor = end;
      } else {
        opens.push(match.index);
      }
    }
    return cursor;
  }

  function copyRunSpans(html) {
    let out = String(html ?? "");
    const pattern = /<span class="inline-run" data-run="[^"]*" style="([^"]*)">((?:(?!<span class="inline-run")[\s\S])*?)<\/span>/g;
    for (let i = 0; i < 20; i += 1) {
      const next = out.replace(pattern, '<span style="$1">$2</span>');
      if (next === out) break;
      out = next;
    }
    return out;
  }

  const BLOCK_STYLE_KINDS = {
    title: "标题",
    heading: "标题",
    paragraph: "段落",
    lead: "段落",
    card: "重点",
    quote: "重点",
    highlight: "重点",
  };

  root.YoocoBlockStyle = {
    clampBlockStyle,
    safeBlockColor,
    blockStyleDeclarations,
    blockStyleCss,
    paintBlockStyleHtml,
    parseRunSpec,
    formatRunSpec,
    runStyleCss,
    expandRunMarkers,
    stripRunMarkers,
    snapRunCut,
    copyRunSpans,
    BLOCK_STYLE_KINDS,
  };
})(globalThis);
