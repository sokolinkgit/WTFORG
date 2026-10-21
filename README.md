# HWDI — Healing With Donnel Israel

A one-page website for **Healing With Donnel Israel (HWDI)**, a Nairobi-based people-centred
ecosystem. Built with plain **HTML, CSS and JavaScript** — no frameworks, no build step,
no backend.

The site leads with the **five strategic pillars** and gives visitors a **floating WhatsApp
button** to join the community, plus a WhatsApp-powered membership form.

## Files

```
index.html                 All page content and structure
assets/css/styles.css      Design system, layout, components, responsive rules
assets/js/main.js          Navigation, reveals, pillar explorer, form → WhatsApp
assets/favicon.svg         Monogram favicon
site.webmanifest           Installable web-app metadata
```

## Run it locally

Any static server works:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

Opening `index.html` directly in a browser also works.

## How the WhatsApp integration works

No backend is required. Every call to action points at:

```
https://wa.me/254796967788?text=<pre-filled message>
```

- The **floating button** (bottom-right on every screen size) opens WhatsApp with a
  "I'd like to join the community" message.
- Each pillar panel has its own **Join this pillar** link with a pillar-specific message.
- The **membership interest form** validates name and interest locally, composes a
  message, and opens WhatsApp with it. The message is *not* stored anywhere — the site
  has no database and no analytics.

To change the number, update `WHATSAPP_NUMBER` in `assets/js/main.js` and the `wa.me`
links in `index.html`.

## Content & structure

| Section | Purpose |
| --- | --- |
| Hero | Identity, registration number, join prompt, five-pillar index |
| Our story | The documented three-stage founding model (2018 → 2024–26 → 21 Aug 2026) |
| Five pillars | Interactive explorer: mental health, climate, jobs, talent, spiritual growth |
| Model | Heal → Discover → Develop → Create → Connect → Transform |
| Ecosystem | Owned / incubated / partner brands, and the three institutional arms |
| 2026 sprint | The 28 core deliverables and the M-Changa campaign |
| Founder | Founder's declaration and the founder-led → ecosystem-led progression |
| Join | WhatsApp community CTA + membership interest form |
| Contact | Phone, registration details, all social channels |

## Institutional accuracy

The site keeps the legal and historical records distinct, as the founding document requires:

- **2018** is described as the origin of the vision (Mtaani Youth Network, Eastlands) —
  never as a legal registration.
- **21 August 2026** is the institutional recognition / structuring date.
- **Nairobi City County Youth & Sports Registration Certificate 2026, Reg No.
  DYS/YR/522/2026** is shown as provided.
- The footer states that the site is an institutional profile and not proof of
  incorporation; the company registration date is recorded separately once issued.

## Accessibility & performance

- Skip link, visible focus styles, keyboard-operable pillar tabs (arrow keys / Home / End),
  roving `tabindex`, ARIA tab semantics.
- `prefers-reduced-motion` disables animation; a `<noscript>` fallback keeps content visible.
- No images or JS libraries — only two web fonts (Fraunces + Plus Jakarta Sans), loaded
  with `display=swap`.
- A 3-second guard removes the reveal animation class if the script fails, so content is
  never left invisible.

## Editing content

All copy lives in `index.html`. Colours, type scale, spacing and radii are CSS custom
properties at the top of `assets/css/styles.css`. Each pillar has its own accent colour
(`--pillar`) set inline on the hero band, tab and panel.
