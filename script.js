/* ═══════════════════════════════════════════════════════════════
   A GIFT FOR MOM — script.js
   Plain JS, no frameworks. GitHub Pages compatible.
═══════════════════════════════════════════════════════════════ */

"use strict";

/* ─── Constants ───────────────────────────────────────────── */
const STORAGE_PREFIX = "mgm_";
const MSG_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

/* ─── DOM refs ────────────────────────────────────────────── */
const $ = (id) => document.getElementById(id);

const screenComposer = $("screen-composer");
const screenReveal = $("screen-reveal");
const recipientInput = $("recipient-name");
const senderInput = $("sender-name");
const messageInput = $("message-body");
const charRemaining = $("char-remaining");
const composerError = $("composer-error");
const btnGenerate = $("btn-generate");
const linkOutput = $("link-output");
const generatedLink = $("generated-link");
const btnCopy = $("btn-copy");
const copySuccess = $("copy-success");
const introOverlay = $("intro-overlay");
const revealContent = $("reveal-content");
const revealFallback = $("reveal-fallback");
const revealGate = $("reveal-gate");
const messageDisplay = $("message-display");
const btnReveal = $("btn-reveal");
const displayRecipient = $("display-recipient");
const displayMessage = $("display-message");
const displaySender = $("display-sender");
const ambientCanvas = $("ambient-canvas");
const confettiCanvas = $("confetti-canvas");
const particlesEl = $("particles");
const themePills = document.querySelectorAll(".theme-pill");

/* ─── State ───────────────────────────────────────────────── */
let currentTheme = "rose";
let confettiRunning = false;
let confettiId = null;

/* ═══════════════════════════════════════════════════════════
   MESSAGE TEMPLATES
══════════════════════════════════════════════════════════ */
const TEMPLATES = {
  poetic: `You were my first home — the warmth I knew before I knew anything else. Every good thing in me learned its shape from watching you. I don't always find the words, but today I want you to know: the way you love is the most beautiful thing I've ever witnessed. Thank you for being the kind of woman who makes the world feel safer just by being in it. Happy Mother's Day, Mom. I love you more than I'll ever say out loud.`,

  warm: `Mom, I've been trying to put into words what you mean to me, and I keep falling short. You've given me so much more than a home — you gave me a sense of who I am. Thank you for every sacrifice I saw, and every one I didn't. Today is yours. I hope it feels even half as special as you've always made me feel. I love you deeply.`,

  funny: `Mom, you always said I'd understand when I was older. Well, I'm older now — and honestly? I still don't know how you did it. You raised me, survived me, and somehow came out still loving me. That's not parenting, that's a superpower. Happy Mother's Day to the woman who deserves a medal, a vacation, and probably a very long nap. Love you to the moon and back. 🌸`,

  short: `Mom — thank you. For everything seen and unseen. For the times you stayed up worried, the times you cheered loudest, and the times you just knew. I don't say it enough: I am so grateful you're my mom. Happy Mother's Day. I love you.`,

  gratitude: `There's a version of my life without your sacrifices, and I never want to visit it. You gave up things I'll never fully know so that I could have everything I needed. That kind of love doesn't ask for anything back — and that's exactly why I want to give you everything. Thank you, Mom. From the bottom of my heart. Happy Mother's Day.`,
};

function initTemplates() {
  const chips = document.querySelectorAll(".template-chip");
  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const key = chip.dataset.tpl;
      const text = TEMPLATES[key];
      if (!text) return;

      messageInput.value = text;
      charRemaining.textContent = 800 - text.length;

      // Visual feedback
      chips.forEach((c) => c.classList.remove("used"));
      chip.classList.add("used");

      // Reset generate button state
      btnGenerate.disabled = false;
      btnGenerate.querySelector(".btn-text").textContent =
        "Generate Surprise Link";
      linkOutput.hidden = true;
      clearError();

      messageInput.focus();
      messageInput.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  });
}

function route() {
  const hash = location.hash; // e.g. "#reveal?id=abc123"
  if (hash.startsWith("#reveal")) {
    const params = new URLSearchParams(hash.slice(hash.indexOf("?") + 1));
    const id = params.get("id");
    if (id) {
      bootReveal(id);
    } else {
      bootComposer();
    }
  } else {
    bootComposer();
  }
}

function bootComposer() {
  document.title = "A Gift for Mom — Create";
  show(screenComposer);
  initParallax();
}

function bootReveal(id) {
  document.title = "A Gift for Mom ✦";
  show(screenReveal);
  loadReveal(id);
}

function show(screen) {
  [screenComposer, screenReveal].forEach((s) => {
    s.classList.remove("active", "visible");
    s.style.display = "";
  });
  screen.classList.add("active");
  screen.style.display = "flex";
  requestAnimationFrame(() => {
    requestAnimationFrame(() => screen.classList.add("visible"));
  });
}

/* ═══════════════════════════════════════════════════════════
   COMPOSER
══════════════════════════════════════════════════════════ */

/* Theme picker */
themePills.forEach((pill) => {
  pill.addEventListener("click", () => {
    themePills.forEach((p) => {
      p.classList.remove("active");
      p.setAttribute("aria-pressed", "false");
    });
    pill.classList.add("active");
    pill.setAttribute("aria-pressed", "true");
    currentTheme = pill.dataset.theme;
    document.documentElement.setAttribute("data-theme", currentTheme);
    restartAmbient();
  });
});

/* Char counter */
messageInput.addEventListener("input", () => {
  const left = 800 - messageInput.value.length;
  charRemaining.textContent = left;
  charRemaining.style.color = left < 60 ? "hsl(340,70%,65%)" : "";
});

/* Generate link */
btnGenerate.addEventListener("click", () => {
  const recipient = recipientInput.value.trim();
  const sender = senderInput.value.trim();
  const message = messageInput.value.trim();

  if (!recipient || !sender || !message) {
    showError("Please fill in all three fields before generating your link.");
    return;
  }
  clearError();

  const id = generateId();
  const payload = {
    recipient,
    sender,
    message,
    theme: currentTheme,
    ts: Date.now(),
  };

  try {
    localStorage.setItem(STORAGE_PREFIX + id, JSON.stringify(payload));
  } catch (e) {
    showError(
      "Could not save your message. Please allow localStorage in your browser settings.",
    );
    return;
  }

  const url = buildLink(id);
  generatedLink.value = url;
  linkOutput.hidden = false;
  linkOutput.removeAttribute("hidden");

  btnGenerate.disabled = true;
  btnGenerate.querySelector(".btn-text").textContent = "Link Generated ✓";

  linkOutput.scrollIntoView({ behavior: "smooth", block: "nearest" });
});

function buildLink(id) {
  const base = location.href.split("#")[0].replace(/\?.*$/, "");
  return `${base}#reveal?id=${id}`;
}

/* Copy */
btnCopy.addEventListener("click", async () => {
  const url = generatedLink.value;
  try {
    await navigator.clipboard.writeText(url);
  } catch {
    generatedLink.select();
    document.execCommand("copy");
  }
  btnCopy.classList.add("copied");
  copySuccess.hidden = false;
  copySuccess.removeAttribute("hidden");
  setTimeout(() => {
    btnCopy.classList.remove("copied");
    copySuccess.hidden = true;
  }, 3000);
});

/* Input change resets generate button */
[recipientInput, senderInput, messageInput].forEach((el) => {
  el.addEventListener("input", () => {
    btnGenerate.disabled = false;
    btnGenerate.querySelector(".btn-text").textContent =
      "Generate Surprise Link";
    linkOutput.hidden = true;
    clearError();
  });
});

function showError(msg) {
  composerError.textContent = msg;
  composerError.hidden = false;
  composerError.removeAttribute("hidden");
}
function clearError() {
  composerError.textContent = "";
  composerError.hidden = true;
}

/* ═══════════════════════════════════════════════════════════
   REVEAL
══════════════════════════════════════════════════════════ */
function loadReveal(id) {
  pruneExpired();

  let payload;
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + id);
    if (!raw) throw new Error("missing");
    payload = JSON.parse(raw);
    if (Date.now() - payload.ts > MSG_TTL_MS) throw new Error("expired");
  } catch {
    showFallback();
    return;
  }

  /* Apply theme */
  document.documentElement.setAttribute("data-theme", payload.theme || "rose");

  /* Populate */
  displayRecipient.textContent = payload.recipient;
  displayMessage.textContent = payload.message;
  displaySender.textContent = payload.sender;

  /* Cinematic intro */
  runIntro();
}

function showFallback() {
  introOverlay.classList.add("hidden");
  revealContent.hidden = true;
  revealFallback.hidden = false;
  revealFallback.removeAttribute("hidden");
}

function runIntro() {
  /* After 2.8s, fade out overlay and show content */
  setTimeout(() => {
    introOverlay.classList.add("hidden");
    revealContent.style.display = "flex";
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        revealContent.style.opacity = "1";
      });
    });
  }, 2800);
}

/* Reveal button */
btnReveal.addEventListener("click", () => {
  revealGate.style.animation = "fade-out 0.4s ease forwards";
  setTimeout(() => {
    revealGate.style.display = "none";
    messageDisplay.hidden = false;
    messageDisplay.removeAttribute("hidden");
  }, 400);

  /* Confetti after a breath */
  setTimeout(() => launchConfetti(), 600);
});

/* ═══════════════════════════════════════════════════════════
   ID GENERATION
══════════════════════════════════════════════════════════ */
function generateId() {
  const arr = new Uint8Array(12);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(36).padStart(2, "0"))
    .join("")
    .slice(0, 20);
}

/* ═══════════════════════════════════════════════════════════
   STORAGE PRUNING — clean old entries
══════════════════════════════════════════════════════════ */
function pruneExpired() {
  const now = Date.now();
  for (const key of Object.keys(localStorage)) {
    if (!key.startsWith(STORAGE_PREFIX)) continue;
    try {
      const d = JSON.parse(localStorage.getItem(key));
      if (now - d.ts > MSG_TTL_MS) localStorage.removeItem(key);
    } catch {
      localStorage.removeItem(key);
    }
  }
}

/* ═══════════════════════════════════════════════════════════
   AMBIENT CANVAS — soft bokeh orbs
══════════════════════════════════════════════════════════ */
let ambientOrbs = [];
let ambientRaf = null;
let ambientCtx = null;

function initAmbient() {
  ambientCtx = ambientCanvas.getContext("2d");
  resizeAmbient();
  window.addEventListener("resize", resizeAmbient);
  buildOrbs();
  tickAmbient();
}

function resizeAmbient() {
  ambientCanvas.width = window.innerWidth;
  ambientCanvas.height = window.innerHeight;
}

function buildOrbs() {
  ambientOrbs = Array.from({ length: 7 }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    r: Math.random() * 280 + 120,
    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.2,
    hue: getAccentHue() + (Math.random() - 0.5) * 30,
    alpha: Math.random() * 0.08 + 0.04,
  }));
}

function restartAmbient() {
  ambientOrbs.forEach((o) => {
    o.hue = getAccentHue() + (Math.random() - 0.5) * 30;
  });
}

function getAccentHue() {
  const map = { rose: 340, gold: 42, sage: 152, sky: 210, violet: 270 };
  return map[currentTheme] || 340;
}

function tickAmbient() {
  const W = ambientCanvas.width,
    H = ambientCanvas.height;
  const ctx = ambientCtx;
  ctx.clearRect(0, 0, W, H);

  ambientOrbs.forEach((o) => {
    o.x += o.vx;
    o.y += o.vy;
    if (o.x < -o.r) o.x = W + o.r;
    if (o.x > W + o.r) o.x = -o.r;
    if (o.y < -o.r) o.y = H + o.r;
    if (o.y > H + o.r) o.y = -o.r;

    const grad = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
    grad.addColorStop(0, `hsla(${o.hue},70%,65%,${o.alpha})`);
    grad.addColorStop(1, "hsla(0,0%,0%,0)");
    ctx.beginPath();
    ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
  });

  ambientRaf = requestAnimationFrame(tickAmbient);
}

/* ═══════════════════════════════════════════════════════════
   FLOATING PARTICLES
══════════════════════════════════════════════════════════ */
function spawnParticles() {
  for (let i = 0; i < 20; i++) {
    const p = document.createElement("div");
    p.className = "particle";
    const size = Math.random() * 80 + 20;
    const left = Math.random() * 100;
    const delay = Math.random() * 12;
    const dur = Math.random() * 10 + 8;
    const rise = -(Math.random() * 300 + 150);
    const drift = (Math.random() - 0.5) * 100;
    const op = Math.random() * 0.2 + 0.05;

    p.style.cssText = `
      width: ${size}px; height: ${size}px;
      left: ${left}%;
      bottom: -${size}px;
      --dur: ${dur}s; --delay: ${delay}s;
      --rise: ${rise}px; --drift: ${drift}px; --op: ${op};
    `;
    particlesEl.appendChild(p);
  }
}

/* ═══════════════════════════════════════════════════════════
   CONFETTI ENGINE — premium, smooth, thematic
══════════════════════════════════════════════════════════ */
function launchConfetti() {
  if (confettiRunning) return;
  confettiRunning = true;

  const canvas = confettiCanvas;
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const hue = getAccentHue();
  const palette = [
    `hsl(${hue},80%,72%)`,
    `hsl(${hue},60%,88%)`,
    `hsl(${hue + 30},70%,75%)`,
    `hsl(${hue - 20},75%,70%)`,
    "#ffffff",
    `hsl(${hue},40%,92%)`,
  ];

  const PIECES = 160;
  const pieces = Array.from({ length: PIECES }, (_, i) => ({
    x: canvas.width * Math.random(),
    y: -20 - Math.random() * canvas.height * 0.5,
    w: Math.random() * 10 + 5,
    h: Math.random() * 5 + 3,
    vx: (Math.random() - 0.5) * 3,
    vy: Math.random() * 3 + 1.5,
    rot: Math.random() * Math.PI * 2,
    vr: (Math.random() - 0.5) * 0.15,
    color: palette[i % palette.length],
    shape: Math.random() > 0.6 ? "circle" : "rect",
    alpha: 1,
    decay: Math.random() * 0.004 + 0.003,
  }));

  let frame = 0;
  const FRAMES = 220;

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    pieces.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      p.vy += 0.05; // gravity
      p.vx *= 0.995;

      if (frame > FRAMES * 0.6) p.alpha -= p.decay;
      if (p.alpha <= 0) return;

      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;

      if (p.shape === "circle") {
        ctx.beginPath();
        ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      }
      ctx.restore();
    });

    frame++;
    if (frame < FRAMES + 60) {
      confettiId = requestAnimationFrame(draw);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      confettiRunning = false;
    }
  }

  draw();
}

/* ═══════════════════════════════════════════════════════════
   PARALLAX — subtle depth on mousemove
══════════════════════════════════════════════════════════ */
function initParallax() {
  let tx = 0,
    ty = 0,
    cx = 0,
    cy = 0;

  window.addEventListener("mousemove", (e) => {
    tx = (e.clientX / window.innerWidth - 0.5) * 18;
    ty = (e.clientY / window.innerHeight - 0.5) * 12;
  });

  window.addEventListener("deviceorientation", (e) => {
    if (e.gamma !== null) {
      tx = e.gamma * 0.4;
      ty = (e.beta - 45) * 0.3;
    }
  });

  (function parallaxLoop() {
    cx += (tx - cx) * 0.06;
    cy += (ty - cy) * 0.06;

    const card = document.querySelector(".composer-card");
    if (card) {
      card.style.transform = `perspective(1000px) rotateX(${-cy * 0.3}deg) rotateY(${cx * 0.3}deg)`;
    }

    requestAnimationFrame(parallaxLoop);
  })();
}

/* ═══════════════════════════════════════════════════════════
   INIT
══════════════════════════════════════════════════════════ */
window.addEventListener("hashchange", route);

(function init() {
  initAmbient();
  initTemplates();
  spawnParticles();
  route();
})();
