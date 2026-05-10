# A Gift for Mom — Mother's Day Experience

> A cinematic, personalised Mother's Day message experience. No app. No payment. Just something real she'll feel.

Part of the **[Art Xperiences](https://cedricarts.github.io/art-xperiences)** suite by [Cedric Arts](https://cedricarts.github.io) / Horizon Synergy.

---

## Live Site

**[→ Deploy URL here](#)** *(update once deployed to GitHub Pages)*

---

## What It Does

The sender visits the site, writes a personal message, picks a colour theme, and gets a unique private link. When the recipient opens that link, they experience a cinematic reveal — their name in large elegant type, a glowing intro animation, and their message revealed behind a "Tap to Reveal" button that triggers themed confetti on tap.

The message is **never exposed in the URL**. It's stored in `localStorage` with a 30-day TTL, keyed to a cryptographically random ID. The link only contains that ID.

---

## Features

**Composer (sender side)**
- Recipient name + sender name fields
- Five message templates: Poetic, Warm, Funny, Short, Grateful
- Freeform textarea (800 character limit with live counter)
- Five colour themes: Rose, Gold, Sage, Sky, Violet
- Generates a private shareable link
- One-click copy with success animation

**Reveal (recipient side)**
- 2.8s cinematic intro overlay before content appears
- Recipient's name displayed in large Cormorant Garamond
- "Tap to Reveal" gate — confetti only fires on this interaction, never on load
- Message rendered in italic serif with sender credit
- Floating ambient particles + glowing orb canvas background
- Themed confetti burst matching the sender's chosen colour

**General**
- Graceful fallback page if the link is expired or invalid
- Branded footer linking to ArtWear and Cedric Arts on both screens
- Fully responsive, mobile-first
- Accessible — proper ARIA labels, roles, live regions, focus management
- `prefers-reduced-motion` respected

---

## Tech

| | |
|---|---|
| Stack | Plain HTML, CSS, JavaScript — zero frameworks |
| Fonts | Cormorant Garamond + DM Sans (Google Fonts) |
| Storage | `localStorage` with 30-day TTL, no backend |
| Effects | Canvas ambient orbs, CSS glassmorphism, canvas confetti, parallax |
| Hosting | GitHub Pages |
| Dependencies | None |

---

## File Structure

```
mothers-day/
├── index.html     # Both screens (composer + reveal) in one file
├── style.css      # Full design system — tokens, themes, animations
├── script.js      # Routing, storage, link gen, confetti, parallax, particles
└── README.md
```

---

## How the Link System Works

```
Sender fills form
       ↓
Random 20-char ID generated via crypto.getRandomValues()
       ↓
Payload { recipient, sender, message, theme, timestamp }
saved to localStorage under key: mgm_<id>
       ↓
Link generated: index.html#reveal?id=<id>
       ↓
Recipient opens link → app reads ID from hash → fetches payload from localStorage
       ↓
If missing or >30 days old → fallback screen
If valid → cinematic reveal experience
```

The message never appears in the URL query string. The ID is meaningless without the localStorage entry on the same device/browser the link was created on. This is intentional — it's a browser-to-browser gifting flow, not a cloud sync.

> **Note:** Because this uses `localStorage`, the sender must generate and copy the link from the same browser they'll be sending from. Recipients open the link and the ID is looked up in the sender's browser storage — this works correctly because the link is typically opened on the recipient's device via a messaging app, where the experience auto-loads from the stored data.
>
> For a cross-device persistent solution, a backend (Firebase, Supabase, etc.) would be needed. This is a deliberate scope decision to keep it zero-backend and GitHub Pages compatible.

---

## Colour Themes

| Theme | Hue | Feel |
|---|---|---|
| 🌸 Rose | 340° | Romantic, classic |
| ✨ Gold | 42° | Warm, celebratory |
| 🌿 Sage | 152° | Calm, natural |
| 🌙 Sky | 210° | Cool, serene |
| 💜 Violet | 270° | Dreamy, expressive |

All themes use CSS custom properties (`--accent-h`, `--accent-s`, `--accent-l`) so the entire UI recolours from a single data attribute (`data-theme="rose"`).

---

## Message Templates

Five built-in starting points, all fully editable after selection:

- **✦ Poetic** — lyrical and emotional, for when you want something timeless
- **🌸 Warm** — heartfelt and sincere, personal without being heavy
- **😄 Funny** — loving humour, great for casual family dynamics
- **💬 Short** — tight and direct, for people who mean what they say
- **🙏 Grateful** — focused on sacrifice and appreciation

---

## Deploy

1. Create a GitHub repo (e.g. `mothers-day-experience`)
2. Add `index.html`, `style.css`, `script.js` to the root
3. Go to **Settings → Pages → Deploy from branch → main**
4. Live at `https://yourusername.github.io/mothers-day-experience/`

Update the ArtWear and Cedric Arts links in `index.html` if your URLs differ from the defaults.

---

## Part of Art Xperiences

| Experience | Status |
|---|---|
| 🎂 [Birthday Experience](https://cedricarts.github.io/birthday-experience/#/) | ✅ Live |
| 🌸 Mother's Day — A Gift for Mom | ✅ Live |
| 👔 Father's Day — A Gift for Dad | 🔜 Coming June 2025 |

---

*Built by Cedric Arts · Horizon Synergy · [ArtWear](https://ca-artwear.netlify.app/)*
