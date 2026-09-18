(function (window) {
  "use strict";

  var STORAGE_KEY = "yooco-device-id";
  var ALLOWED = { visit: 1, trial_click: 1, optimize_ok: 1 };

  function getDeviceId() {
    try {
      var stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored && /^[A-Za-z0-9._:-]{8,80}$/.test(stored)) return stored;
      var created =
        window.crypto && typeof window.crypto.randomUUID === "function"
          ? window.crypto.randomUUID()
          : "d" + Date.now().toString(36) + Math.random().toString(36).slice(2, 12);
      window.localStorage.setItem(STORAGE_KEY, created);
      return created;
    } catch (_err) {
      window.__yoocoDeviceId =
        window.__yoocoDeviceId ||
        "anon-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
      return window.__yoocoDeviceId;
    }
  }

  function shouldCountVisit() {
    var path = window.location.pathname || "/";
    return (
      path === "/" ||
      path === "/studio" ||
      path === "/studio/" ||
      path === "/studio.html" ||
      /\/studio\.html$/.test(path)
    );
  }

  function track(event) {
    if (!ALLOWED[event]) return;
    try {
      var body = JSON.stringify({ event: event, deviceId: getDeviceId() });
      var sent = false;
      try {
        if (navigator.sendBeacon) {
          sent = navigator.sendBeacon(
            "/api/track",
            new Blob([body], { type: "text/plain;charset=UTF-8" }),
          );
        }
      } catch (_beaconErr) {
        sent = false;
      }
      if (sent) return;
      window
        .fetch("/api/track", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: body,
          keepalive: true,
          credentials: "same-origin",
        })
        .catch(function () {});
    } catch (_err) {
      /* never break the page */
    }
  }

  window.yoocoTrack = track;
  if (shouldCountVisit()) track("visit");
})(window);
