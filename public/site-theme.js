/* 工作台顶栏的白天 / 黑夜。只有点按钮才写进本地，避免把系统偏好锁死。 */
(function () {
  var root = document.documentElement;
  function paint() {
    var current = root.getAttribute("data-site") === "night" ? "night" : "day";
    document.querySelectorAll("[data-site-value]").forEach(function (button) {
      var on = button.getAttribute("data-site-value") === current;
      button.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }
  document.addEventListener("click", function (event) {
    var button = event.target && event.target.closest ? event.target.closest("[data-site-value]") : null;
    if (!button || typeof window.__yoocoSetSiteTheme !== "function") return;
    window.__yoocoSetSiteTheme(button.getAttribute("data-site-value"), true);
    paint();
  });
  paint();
  new MutationObserver(paint).observe(root, { attributes: true, attributeFilter: ["data-site"] });
})();
