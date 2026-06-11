/* =========================================================================
   AltaCare — i18n engine (vanilla JS, no dependencies, no fetch)
   Translations are loaded as plain <script> files that populate
   window.ALTACARE_I18N[lang]. This works over file:// (no CORS).
   ========================================================================= */
(function () {
  "use strict";

  var SUPPORTED = ["en", "es", "bn", "ru", "sq", "ur", "ar"];
  var DEFAULT_LANG = "en";
  var STORAGE_KEY = "altacare_lang";

  var META = {
    en: { label: "English",  native: "English",  flag: "🇺🇸", dir: "ltr" },
    es: { label: "Spanish",  native: "Español",  flag: "🇪🇸", dir: "ltr" },
    bn: { label: "Bengali",  native: "বাংলা",     flag: "🇧🇩", dir: "ltr" },
    ru: { label: "Russian",  native: "Русский",  flag: "🇷🇺", dir: "ltr" },
    sq: { label: "Albanian", native: "Shqip",    flag: "🇦🇱", dir: "ltr" },
    ur: { label: "Urdu",     native: "اردو",      flag: "🇵🇰", dir: "rtl" },
    ar: { label: "Arabic",   native: "العربية",   flag: "🇸🇦", dir: "rtl" }
  };

  window.ALTACARE_I18N = window.ALTACARE_I18N || {};
  var I18N = window.ALTACARE_I18N;

  /* ---- helpers ---- */
  function getParam(name) {
    var m = new RegExp("[?&]" + name + "=([^&]+)").exec(window.location.search);
    return m ? decodeURIComponent(m[1]) : null;
  }

  function resolveInitialLang() {
    var fromUrl = getParam("lang");
    if (fromUrl && SUPPORTED.indexOf(fromUrl) !== -1) return fromUrl;
    var stored = null;
    try { stored = localStorage.getItem(STORAGE_KEY); } catch (e) {}
    if (stored && SUPPORTED.indexOf(stored) !== -1) return stored;
    var nav = (navigator.language || "en").slice(0, 2).toLowerCase();
    if (SUPPORTED.indexOf(nav) !== -1) return nav;
    return DEFAULT_LANG;
  }

  // Dot-path lookup: t("hero.slogan")
  function lookup(dict, key) {
    if (!dict) return undefined;
    var parts = key.split(".");
    var cur = dict;
    for (var i = 0; i < parts.length; i++) {
      if (cur == null) return undefined;
      cur = cur[parts[i]];
    }
    return cur;
  }

  function translate(key, lang) {
    var val = lookup(I18N[lang], key);
    if (val == null && lang !== DEFAULT_LANG) val = lookup(I18N[DEFAULT_LANG], key);
    return val;
  }

  /* ---- apply translations to the DOM ---- */
  function applyTo(root, lang) {
    root = root || document;

    // Text content
    var nodes = root.querySelectorAll("[data-i18n]");
    nodes.forEach(function (el) {
      var val = translate(el.getAttribute("data-i18n"), lang);
      if (val != null) {
        if (el.hasAttribute("data-i18n-html")) el.innerHTML = val;
        else el.textContent = val;
      }
    });

    // Attributes: data-i18n-attr="placeholder:key, aria-label:key2"
    var attrNodes = root.querySelectorAll("[data-i18n-attr]");
    attrNodes.forEach(function (el) {
      el.getAttribute("data-i18n-attr").split(",").forEach(function (pair) {
        var bits = pair.split(":");
        if (bits.length !== 2) return;
        var attr = bits[0].trim();
        var val = translate(bits[1].trim(), lang);
        if (val != null) el.setAttribute(attr, val);
      });
    });
  }

  /* ---- per-page SEO meta ---- */
  function updateMeta(lang) {
    var pageKey = document.body.getAttribute("data-page") || "home";

    var title = translate("meta." + pageKey + ".title", lang) || translate("meta.home.title", lang);
    var desc  = translate("meta." + pageKey + ".description", lang) || translate("meta.home.description", lang);

    if (title) document.title = title;
    if (desc) {
      var m = document.querySelector('meta[name="description"]');
      if (m) m.setAttribute("content", desc);
      var og = document.querySelector('meta[property="og:description"]');
      if (og) og.setAttribute("content", desc);
    }
    var ogt = document.querySelector('meta[property="og:title"]');
    if (ogt && title) ogt.setAttribute("content", title);
    var ogl = document.querySelector('meta[property="og:locale"]');
    if (ogl) ogl.setAttribute("content", lang);
  }

  /* ---- reflect lang in URL without reloading ---- */
  function syncUrl(lang) {
    if (!window.history || !window.history.replaceState) return;
    var url = new URL(window.location.href);
    url.searchParams.set("lang", lang);
    window.history.replaceState({}, "", url);
  }

  /* ---- public: set language ---- */
  function setLang(lang, opts) {
    if (SUPPORTED.indexOf(lang) === -1) lang = DEFAULT_LANG;
    opts = opts || {};

    var meta = META[lang];
    document.documentElement.setAttribute("lang", lang);
    document.documentElement.setAttribute("dir", meta.dir);

    applyTo(document, lang);
    updateMeta(lang);

    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
    if (opts.updateUrl !== false) syncUrl(lang);

    window.ALTACARE_CURRENT_LANG = lang;
    document.dispatchEvent(new CustomEvent("altacare:langchange", { detail: { lang: lang } }));
  }

  /* ---- expose API ---- */
  window.AltaCareI18n = {
    SUPPORTED: SUPPORTED,
    META: META,
    t: function (key) { return translate(key, window.ALTACARE_CURRENT_LANG || DEFAULT_LANG); },
    setLang: setLang,
    current: function () { return window.ALTACARE_CURRENT_LANG || DEFAULT_LANG; },
    resolveInitialLang: resolveInitialLang,
    apply: applyTo
  };

  // Initialise as soon as the script + translation files have parsed.
  document.addEventListener("DOMContentLoaded", function () {
    setLang(resolveInitialLang(), { updateUrl: false });
  });
})();
