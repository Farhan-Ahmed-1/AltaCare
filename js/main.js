/* =========================================================================
   AltaCare — UI interactions: mobile nav, language dropdown, form handler.
   Depends on AltaCareI18n (js/i18n.js).
   ========================================================================= */
(function () {
  "use strict";

  /* ----- CONFIG: edit these for go-live ----- */
  var CONFIG = {
    formspreeEndpoint: "https://formspree.io/f/YOUR_FORM_ID", // <-- replace with real Formspree ID
    whatsappNumber: "16462835605"                              // digits only, country code first
  };

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    var I18n = window.AltaCareI18n;

    /* ---------------- Mobile nav ---------------- */
    var navToggle = document.querySelector(".nav-toggle");
    if (navToggle) {
      navToggle.addEventListener("click", function () {
        var open = document.body.getAttribute("data-nav") === "open";
        document.body.setAttribute("data-nav", open ? "closed" : "open");
        navToggle.setAttribute("aria-expanded", String(!open));
      });
      // close nav after tapping a link
      document.querySelectorAll(".primary-nav a").forEach(function (a) {
        a.addEventListener("click", function () {
          document.body.setAttribute("data-nav", "closed");
          navToggle.setAttribute("aria-expanded", "false");
        });
      });
    }

    /* ---------------- Language selector ---------------- */
    var lang = document.querySelector(".lang");
    if (lang && I18n) {
      var toggle = lang.querySelector(".lang__toggle");
      var menu = lang.querySelector(".lang__menu");
      var currentLabel = lang.querySelector(".lang__current");

      // Build menu from supported languages
      menu.innerHTML = "";
      I18n.SUPPORTED.forEach(function (code) {
        var m = I18n.META[code];
        var b = document.createElement("button");
        b.type = "button";
        b.setAttribute("role", "option");
        b.setAttribute("data-lang", code);
        b.setAttribute("lang", code);
        b.innerHTML = '<span class="lang__flag" aria-hidden="true">' + m.flag + "</span><span>" + m.native + "</span>";
        b.addEventListener("click", function () {
          I18n.setLang(code);
          closeMenu();
        });
        menu.appendChild(b);
      });

      function refreshSelector() {
        var cur = I18n.current();
        if (currentLabel) currentLabel.textContent = I18n.META[cur].native;
        menu.querySelectorAll("button").forEach(function (b) {
          b.setAttribute("aria-selected", String(b.getAttribute("data-lang") === cur));
        });
      }

      function openMenu() { lang.setAttribute("data-open", "true"); toggle.setAttribute("aria-expanded", "true"); }
      function closeMenu() { lang.setAttribute("data-open", "false"); toggle.setAttribute("aria-expanded", "false"); }

      toggle.addEventListener("click", function (e) {
        e.stopPropagation();
        lang.getAttribute("data-open") === "true" ? closeMenu() : openMenu();
      });
      document.addEventListener("click", function (e) { if (!lang.contains(e.target)) closeMenu(); });
      document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenu(); });

      document.addEventListener("altacare:langchange", refreshSelector);
      refreshSelector();
    }

    /* ---------------- Footer language links ---------------- */
    document.querySelectorAll(".footer-langs button[data-lang]").forEach(function (b) {
      b.addEventListener("click", function () { if (I18n) I18n.setLang(b.getAttribute("data-lang")); });
    });

    /* ---------------- WhatsApp links (keep ?lang on internal nav not needed) ---------------- */
    document.querySelectorAll("[data-whatsapp]").forEach(function (a) {
      var msg = a.getAttribute("data-whatsapp") || "Hello AltaCare, I'd like to learn more.";
      a.setAttribute("href", "https://wa.me/" + CONFIG.whatsappNumber + "?text=" + encodeURIComponent(msg));
      a.setAttribute("target", "_blank");
      a.setAttribute("rel", "noopener");
    });

    /* ---------------- Contact form ---------------- */
    var form = document.querySelector("form[data-altacare-form]");
    if (form) {
      var status = form.querySelector(".form__status");
      form.setAttribute("action", CONFIG.formspreeEndpoint);
      form.setAttribute("method", "POST");

      form.addEventListener("submit", function (e) {
        e.preventDefault();
        if (status) { status.className = "form__status"; status.textContent = ""; }

        var btn = form.querySelector('button[type="submit"]');
        var original = btn ? btn.textContent : "";
        if (btn) { btn.disabled = true; btn.textContent = I18n ? (I18n.t("contact.form.sending") || "Sending…") : "Sending…"; }

        var data = new FormData(form);
        // include chosen language for context
        if (I18n) data.append("language", I18n.current());

        // If endpoint still a placeholder, just simulate success (dev/demo mode).
        var isPlaceholder = CONFIG.formspreeEndpoint.indexOf("YOUR_FORM_ID") !== -1;

        function onOk() {
          showStatus("ok", I18n ? I18n.t("contact.form.success") : "Thank you! We'll be in touch soon.");
          form.reset();
        }
        function onErr() {
          showStatus("err", I18n ? I18n.t("contact.form.error") : "Something went wrong. Please call us at 646-283-5605.");
        }
        function done() { if (btn) { btn.disabled = false; btn.textContent = original; } }

        if (isPlaceholder) {
          setTimeout(function () { onOk(); done(); }, 700);
          return;
        }

        fetch(CONFIG.formspreeEndpoint, {
          method: "POST",
          body: data,
          headers: { Accept: "application/json" }
        }).then(function (res) {
          res.ok ? onOk() : onErr();
        }).catch(onErr).then(done);
      });

      function showStatus(kind, msg) {
        if (!status) return;
        status.className = "form__status form__status--" + kind;
        status.textContent = msg;
      }
    }

    /* ---------------- Footer year ---------------- */
    var yr = document.querySelector("[data-year]");
    if (yr) yr.textContent = new Date().getFullYear();
  });
})();
