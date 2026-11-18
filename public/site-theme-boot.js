/* 在样式之前给整站标上日夜。没手动选过就跟系统，选过就记住。 */
(function () {
  var key = "yooco-site-theme";
  var stored = "";
  try { stored = localStorage.getItem(key) || ""; } catch (error) { stored = ""; }
  var theme = stored === "day" || stored === "night"
    ? stored
    : (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "night" : "day");
  document.documentElement.setAttribute("data-site", theme);
  window.__yoocoSiteTheme = theme;
  window.__yoocoSetSiteTheme = function (next, persist) {
    if (next !== "day" && next !== "night") return;
    window.__yoocoSiteTheme = next;
    document.documentElement.setAttribute("data-site", next);
    if (persist) {
      try { localStorage.setItem(key, next); } catch (error) { /* 隐私模式只记在这一页 */ }
    }
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", next === "night" ? "#120F0D" : "#F3EEE3");
  };
  var meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", theme === "night" ? "#120F0D" : "#F3EEE3");
  var observer = new MutationObserver(function () {
    if (document.documentElement.getAttribute("data-site") !== window.__yoocoSiteTheme) {
      document.documentElement.setAttribute("data-site", window.__yoocoSiteTheme);
    }
  });
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-site"] });
})();
