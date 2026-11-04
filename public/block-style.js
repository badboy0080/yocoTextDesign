// 预览里划中一块后，把字号、字体颜色写回这一块。底色、间距、描边仍能读旧数据，面板不再改它们。颜色只接受十六进制。
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
    BLOCK_STYLE_KINDS,
  };
})(globalThis);
