/**
 * Cookie consent + Meta Pixel for the Valed marketing site (valed.ai).
 * Pixel ID 915178724171810 — only loads after the visitor accepts.
 */
(function () {
  var PIXEL_ID = "915178724171810";
  var STORAGE_KEY = "valed:cookie-consent:v1";
  var pixelReady = false;

  function getConsent() {
    try {
      var v = localStorage.getItem(STORAGE_KEY);
      return v === "accepted" || v === "rejected" ? v : null;
    } catch (e) {
      return null;
    }
  }

  function setConsent(value) {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch (e) {
      /* ignore */
    }
  }

  function loadMetaPixel() {
    if (pixelReady || typeof window === "undefined") return;
    if (window.fbq) {
      pixelReady = true;
      return;
    }

    !(function (f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = !0;
      n.version = "2.0";
      n.queue = [];
      t = b.createElement(e);
      t.async = !0;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");

    window.fbq("init", PIXEL_ID);
    window.fbq("track", "PageView");
    pixelReady = true;

    if (!document.getElementById("valed-meta-pixel-noscript")) {
      var ns = document.createElement("noscript");
      ns.id = "valed-meta-pixel-noscript";
      ns.innerHTML =
        '<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=' +
        PIXEL_ID +
        '&ev=PageView&noscript=1" alt="" />';
      document.body.appendChild(ns);
    }
  }

  function trackLead(el) {
    if (getConsent() !== "accepted" || !window.fbq) return;
    try {
      window.fbq("track", "Lead", {
        content_name: (el && (el.getAttribute("data-cta") || el.textContent || "")).trim().slice(0, 80),
      });
    } catch (e) {
      /* ignore */
    }
  }

  function wireRegisterCtas() {
    document.addEventListener(
      "click",
      function (ev) {
        var a = ev.target && ev.target.closest ? ev.target.closest('a[href*="app.valed.ai/auth/register"]') : null;
        if (a) trackLead(a);
      },
      true
    );
  }

  function hideBanner(el) {
    if (el && el.parentNode) el.parentNode.removeChild(el);
  }

  function ensureStyles() {
    if (document.getElementById("valed-cookie-styles")) return;
    var style = document.createElement("style");
    style.id = "valed-cookie-styles";
    style.textContent =
      "#valed-cookie-banner{position:fixed;left:16px;right:16px;bottom:16px;z-index:99999;max-width:720px;margin:0 auto;" +
      "background:#fff;border:1.5px solid rgba(0,0,0,.08);border-radius:18px;box-shadow:0 12px 40px rgba(20,18,12,.12);" +
      "padding:18px 20px;font-family:'DM Sans',system-ui,sans-serif;display:flex;flex-wrap:wrap;align-items:center;gap:14px}" +
      "#valed-cookie-banner .valed-cookie-text{flex:1 1 280px;margin:0;font-size:14px;line-height:1.5;color:#444}" +
      "#valed-cookie-banner a{color:#5A8200;font-weight:600;text-decoration:none}" +
      "#valed-cookie-banner .valed-cookie-actions{display:flex;gap:10px;flex-shrink:0}" +
      "#valed-cookie-banner button{appearance:none;cursor:pointer;border-radius:12px;padding:10px 18px;font-size:14px;font-weight:600;font-family:inherit}" +
      "#valed-cookie-banner .valed-cookie-reject{background:transparent;border:1.5px solid rgba(0,0,0,.12);color:#222}" +
      "#valed-cookie-banner .valed-cookie-accept{background:#BDFD50;border:none;color:#14120C}";
    document.head.appendChild(style);
  }

  function showBanner() {
    if (document.getElementById("valed-cookie-banner")) return;
    ensureStyles();

    var bar = document.createElement("div");
    bar.id = "valed-cookie-banner";
    bar.setAttribute("role", "dialog");
    bar.setAttribute("aria-live", "polite");
    bar.setAttribute("aria-label", "Consentimento de cookies");
    bar.innerHTML =
      '<p class="valed-cookie-text">Usamos cookies essenciais para o site funcionar e, com a tua autorização, cookies de análise e marketing (incluindo o Meta Pixel) para medir campanhas. ' +
      '<a href="/cookies.html">Política de cookies</a>.</p>' +
      '<div class="valed-cookie-actions">' +
      '<button type="button" class="valed-cookie-reject" data-consent="rejected">Recusar</button>' +
      '<button type="button" class="valed-cookie-accept" data-consent="accepted">Aceitar</button>' +
      "</div>";

    bar.addEventListener("click", function (ev) {
      var btn = ev.target.closest("[data-consent]");
      if (!btn) return;
      var value = btn.getAttribute("data-consent");
      setConsent(value);
      hideBanner(bar);
      if (value === "accepted") loadMetaPixel();
    });

    document.body.appendChild(bar);
  }

  function init() {
    wireRegisterCtas();
    var consent = getConsent();
    if (consent === "accepted") {
      loadMetaPixel();
      return;
    }
    if (consent === "rejected") return;
    showBanner();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
