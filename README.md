# AltaCare Website

**Connecting Families. Supporting Agencies. Changing Lives.**

A fast, mobile-first, multilingual marketing website for AltaCare, built with **plain HTML, CSS,
and vanilla JavaScript** — no frameworks, no build step, no npm. It works when opened directly
from disk or hosted on any static host.

---

## Languages

The site ships in **7 languages**, switchable from the top-right selector on every page (and the
footer links):

`English | Español | বাংলা | Русский | Shqip | اردو | العربية`

- **Urdu (`ur`) and Arabic (`ar`) are right-to-left.** The engine sets `<html dir="rtl">`
  automatically, the layout mirrors, and an Arabic-capable web font (Noto Sans Arabic) loads for them.
- The chosen language is saved (localStorage) and added to the URL as `?lang=es` so links are shareable.
- **English** (`js/i18n/en.js`) is the **source of truth**. The other six files mirror its keys.
- The Spanish / Bengali / Russian / Albanian / Urdu / Arabic files are **drafts**. They read well but
  should get a **final review by a native speaker** before go-live. Edit the text in each
  `js/i18n/<lang>.js` file — keys must stay identical to `en.js`.

To add or change copy: edit `en.js` first, then mirror the same key in each other language file.

---

## Run locally

**Option A — just open it:** double-click `index.html`. Translations are plain `<script>` files
(not `fetch`), so everything works over `file://`.

**Option B — local server (recommended for SEO/Lighthouse checks):**

```bash
python -m http.server 8000
# then visit http://localhost:8000
```

---

## Configure before go-live

Open **`js/main.js`** and edit the `CONFIG` block at the top:

```js
var CONFIG = {
  formspreeEndpoint: "https://formspree.io/f/YOUR_FORM_ID", // contact form delivery
  whatsappNumber: "16462835605"                              // digits only, country code first
};
```

1. **Contact form (Formspree).** Create a free form at <https://formspree.io>, copy your form ID,
   and paste the full endpoint. Until you do, the form runs in **demo mode** — it shows a success
   message without actually sending. Submissions include the visitor's chosen `language`.
   *(Any service that accepts an HTML `POST` works — swap the endpoint accordingly.)*
2. **WhatsApp.** Set `whatsappNumber` to the real business number (currently `646-283-5605`).
   All `[data-whatsapp]` links and the floating button use it.
3. **Instagram.** Replace the placeholder `https://instagram.com/` links (header social icons,
   footer, contact page) with the real profile URL.
4. **Domain.** The canonical/hreflang tags and `sitemap.xml` use `https://www.altacare.org/`.
   Find-and-replace this with the real domain across the `.html` files and `sitemap.xml`.

---

## File structure

```
index.html              Homepage (hero, statement, about, services, OPWDD,
                        agency growth, community, testimonials, contact, footer)
services.html           Services for Families
opwdd.html              OPWDD Support
agency-growth.html      Agency Growth & Marketing
community.html          Community Partnerships (+ blog "coming soon" teaser)
contact.html            Contact page with full form

css/styles.css          All styling (brand colors as CSS variables, mobile-first)
js/i18n.js              Translation engine + SEO meta updates + language switching
js/main.js              Mobile nav, language dropdown, WhatsApp links, form handler
js/i18n/en.js           English (source of truth)
js/i18n/es.js           Español (draft)
js/i18n/bn.js           বাংলা  (draft)
js/i18n/ru.js           Русский (draft)
js/i18n/sq.js           Shqip  (draft)
js/i18n/ur.js           اردو   (draft, RTL)
js/i18n/ar.js           العربية (draft, RTL)

assets/logo.svg         Logo  ·  assets/favicon.svg  Favicon
robots.txt              Search-engine directives
sitemap.xml             Multilingual sitemap with hreflang alternates
```

---

## Brand system

| Token   | Value     | Use                  |
|---------|-----------|----------------------|
| Navy    | `#0B2447` | Headers, primary     |
| Green   | `#1F9D55` | AltaCare accent, CTAs |
| White   | `#FFFFFF` | Base                 |
| Soft gray | `#F4F6F9` | Section backgrounds |

Fonts: **Poppins** (headings) + **Lato** (body), loaded from Google Fonts.

---

## SEO notes

Each page includes per-language `hreflang` alternates, a canonical URL, Open Graph tags, and the
homepage adds `LocalBusiness` JSON-LD. `robots.txt` and `sitemap.xml` are included.

Because translation happens client-side (the plain HTML/JS constraint), language variants share one
HTML file and switch via `?lang=`. Modern crawlers render this, but **pre-rendered per-language
pages index slightly better**. If stronger multilingual SEO is needed later, the same translation
files can be used to generate separate `/es/`, `/bn/`, etc. folders — no rewrite required.

---

## Add the blog / online booking later

- **Blog/news:** a "coming soon" teaser is on the Community page; drop in `blog.html` (or a
  `/blog/` folder) reusing the shared header/footer and `data-i18n` pattern.
- **Calendar booking:** the footer links a "coming soon" note; embed a Calendly/Cal.com widget on a
  new `booking.html` when ready.
