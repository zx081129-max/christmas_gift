/* global window, document */
const stage = document.getElementById('receive-stage');
const bodyEl = document.body;
const particlesRoot = document.getElementById('receive-particles');
const SVG_NS = 'http://www.w3.org/2000/svg';

const STATES = {
  IDLE: 'IDLE',
  INTRO: 'INTRO',
  NAME_INPUT: 'NAME_INPUT',
  PLAYING: 'PLAYING',
  ENDING: 'ENDING',
  DONE: 'DONE'
};

const INTRO_LINES = [
  '圣诞夜到了。',
  '在过去的几天里，\n来自世界各地的陌生人\n把祝福留在了这里。',
  '今晚，\n这些祝福会被送到\n每一个陌生人的手上。'
]; 

let currentState = STATES.IDLE;
let nickname = '';
let sequenceToken = 0;
let endingContainer = null;
let isPlaying = false;

if (bodyEl) {
  bodyEl.classList.add('is-fade');
  window.requestAnimationFrame(() => {
    bodyEl.classList.add('is-ready');
  });
}

function wait(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function getCanonicalUrl() {
  return window.location.href;
}

let shareToastEl = null;
let shareToastTimer = null;

function ensureShareToast() {
  if (shareToastEl) {
    return shareToastEl;
  }
  shareToastEl = document.createElement('div');
  shareToastEl.className = 'share-toast';
  document.body.appendChild(shareToastEl);
  return shareToastEl;
}

function showShareToast(message, duration = 1600) {
  const el = ensureShareToast();
  el.textContent = message;
  el.classList.remove('is-visible');
  window.requestAnimationFrame(() => {
    el.classList.add('is-visible');
  });
  if (shareToastTimer) {
    window.clearTimeout(shareToastTimer);
  }
  shareToastTimer = window.setTimeout(() => {
    el.classList.remove('is-visible');
  }, duration);
}

function fallbackCopy(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', 'true');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  textarea.style.pointerEvents = 'none';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  let success = false;
  try {
    success = document.execCommand('copy');
  } catch (err) {
    success = false;
  }
  textarea.remove();
  return success;
}

function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text).then(() => true).catch(() => fallbackCopy(text));
  }
  return Promise.resolve(fallbackCopy(text));
}

function showManualCopyPrompt(text) {
  window.prompt('请手动复制链接', text);
}

function getParticlePosition() {
  let x = 0;
  let y = 0;
  let attempts = 0;
  do {
    x = Math.random();
    y = Math.random();
    attempts += 1;
  } while (attempts < 10 && Math.abs(x - 0.5) < 0.2 && Math.abs(y - 0.5) < 0.2);
  return { x, y };
}

function setupReceiveParticles() {
  if (!particlesRoot) {
    return;
  }
  particlesRoot.innerHTML = '';
  const count = 8 + Math.floor(Math.random() * 5);
  for (let i = 0; i < count; i += 1) {
    const particle = document.createElement('span');
    particle.className = 'receive-particle';
    const size = 1.5 + Math.random() * 1.5;
    const opacity = 0.08 + Math.random() * 0.08;
    const duration = 15000 + Math.random() * 10000;
    const drift = (120 + Math.random() * 120) * (Math.random() > 0.5 ? 1 : -1);
    const { x, y } = getParticlePosition();

    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.left = `${(x * 100).toFixed(2)}%`;
    particle.style.top = `${(y * 100).toFixed(2)}%`;
    particle.style.opacity = opacity.toFixed(2);
    particle.style.setProperty('--particle-duration', `${Math.round(duration)}ms`);
    particle.style.setProperty('--particle-drift', `${drift.toFixed(1)}px`);
    particle.style.animationDelay = `${-Math.random() * duration}ms`;
    particle.setAttribute('aria-hidden', 'true');
    particlesRoot.appendChild(particle);
  }
}

function clearStage() {
  stage.innerHTML = '';
}

function createLayer() {
  const layer = document.createElement('div');
  layer.className = 'receive-layer';
  stage.appendChild(layer);
  return layer;
}

function fadeIn(el) {
  el.classList.add('is-visible');
  el.classList.remove('is-fading');
}

function fadeOut(el) {
  el.classList.remove('is-visible');
  el.classList.add('is-fading');
}

function setFadeDuration(el, durationMs) {
  el.style.transition = `opacity ${durationMs}ms ease`;
}

function setState(nextState) {
  const order = Object.values(STATES);
  if (order.indexOf(nextState) <= order.indexOf(currentState)) {
    return;
  }
  currentState = nextState;
}

async function showIdle() {
  clearStage();
  setState(STATES.IDLE);
  const layer = createLayer();
  const glow = document.createElement('button');
  glow.type = 'button';
  glow.className = 'receive-glow receive-clickable';
  glow.setAttribute('aria-label', '开始接收祝福');
  layer.appendChild(glow);
  glow.addEventListener('click', () => {
    if (currentState !== STATES.IDLE) {
      return;
    }
    runIntro();
  }, { once: true });
}

async function runIntro() {
  setState(STATES.INTRO);
  clearStage();
  const token = ++sequenceToken;
  const layer = createLayer();
  const introEl = document.createElement('div');
  introEl.className = 'receive-intro receive-fade';
  layer.appendChild(introEl);

  const introTimings = [
    { fadeIn: 800, hold: 1200, fadeOut: 600, after: 400 },
    { fadeIn: 1000, hold: 2000, fadeOut: 800, after: 400 },
    { fadeIn: 1000, hold: 2000, fadeOut: 800, after: 0 }
  ];

  for (let i = 0; i < INTRO_LINES.length; i += 1) {
    if (token !== sequenceToken || currentState !== STATES.INTRO) {
      return;
    }
    introEl.textContent = INTRO_LINES[i];
    setFadeDuration(introEl, introTimings[i].fadeIn);
    fadeIn(introEl);
    await wait(introTimings[i].fadeIn + introTimings[i].hold);
    setFadeDuration(introEl, introTimings[i].fadeOut);
    fadeOut(introEl);
    await wait(introTimings[i].fadeOut + introTimings[i].after);
  }

  runNameInput();
}

function runNameInput() {
  setState(STATES.NAME_INPUT);
  clearStage();
  const layer = createLayer();
  let hasConfirmed = false;
  const container = document.createElement('div');
  container.className = 'receive-name receive-clickable';
  const prompt = document.createElement('p');
  prompt.className = 'receive-name-text receive-fade';
  prompt.textContent = '今晚，\n我们想这样称呼你。';
  const controls = document.createElement('div');
  controls.className = 'receive-name-controls receive-fade';
  const input = document.createElement('input');
  input.className = 'receive-name-input';
  input.type = 'text';
  input.placeholder = '你的昵称';
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'receive-name-button';
  button.textContent = '确认';

  controls.appendChild(input);
  controls.appendChild(button);
  container.appendChild(prompt);
  container.appendChild(controls);
  layer.appendChild(container);
  window.requestAnimationFrame(() => {
    setFadeDuration(prompt, 1000);
    fadeIn(container);
    fadeIn(prompt);
    setFadeDuration(controls, 800);
    window.setTimeout(() => {
      fadeIn(controls);
    }, 200);
  });

  function handleConfirm() {
    if (hasConfirmed) {
      return;
    }
    hasConfirmed = true;
    button.disabled = true;
    input.disabled = true;
    setFadeDuration(prompt, 600);
    setFadeDuration(controls, 600);
    fadeOut(prompt);
    fadeOut(controls);
    window.setTimeout(() => {
      clearStage();
    }, 600);
    nickname = input.value.trim();
    window.setTimeout(() => {
      runPlaying();
    }, 1200);
  }

  button.addEventListener('click', handleConfirm);
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleConfirm();
    }
  });
}

async function loadWishes() {
  const res = await fetch('/api/receive?count=12');
  if (!res.ok) {
    return [];
  }
  return res.json();
}

function buildMetaText(wish) {
  const name = wish.name ? wish.name : '一位陌生人';
  const country = wish.country ? wish.country : '某个地方';
  return `来自 ${country} 的 ${name} 跟你说：`;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function clampNumber(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function mulberry32(seed) {
  let t = seed >>> 0;
  return function random() {
    t += 0x6D2B79F5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle(arr, rng) {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function rngRange(rng, min, max) {
  return min + (max - min) * rng();
}

function getSafeRect() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const isDesktop = vw >= 768;
  const safeWidth = (isDesktop ? 0.6 : 0.86) * vw;
  const safeHeight = (isDesktop ? 0.55 : 0.6) * vh;
  const safeLeft = (vw - safeWidth) / 2;
  const safeTop = (vh - safeHeight) / 2;
  const padX = clampNumber(vw * 0.04, 18, 28);
  const padY = clampNumber(vh * 0.03, 14, 22);

  return {
    vw,
    vh,
    isDesktop,
    safeLeft,
    safeTop,
    safeWidth,
    safeHeight,
    innerLeft: safeLeft + padX,
    innerRight: safeLeft + safeWidth - padX,
    innerTop: safeTop + padY,
    innerBottom: safeTop + safeHeight - padY
  };
}

const ANCHORS = (() => {
  const col = [0.3, 0.5, 0.7];
  const row = [0.2, 0.35, 0.5, 0.65];
  const out = [];
  row.forEach((ry) => {
    col.forEach((cx) => {
      out.push({ cx, ry });
    });
  });
  return out;
})();

function layoutBlessingBlock(blockEl, index, positionsCache, anchorsShuffled, rng) {
  const safe = getSafeRect();
  const blockMaxW = safe.isDesktop
    ? Math.min(560, safe.safeWidth * 0.85)
    : safe.safeWidth * 0.92;
  const safeArea = blockEl.querySelector('.blessing-safe-area');
  const widthTarget = safeArea || blockEl;
  widthTarget.style.maxWidth = `${Math.floor(blockMaxW)}px`;
  if (!safe.isDesktop) {
    widthTarget.style.width = `${Math.floor(blockMaxW)}px`;
  } else {
    widthTarget.style.removeProperty('width');
  }

  if (positionsCache[index]) {
    const cached = positionsCache[index];
    blockEl.style.left = `${cached.x}px`;
    blockEl.style.top = `${cached.y}px`;
    return;
  }

  const anchorIndex = anchorsShuffled[index];
  const anchor = ANCHORS[anchorIndex];
  let x = safe.safeLeft + safe.safeWidth * anchor.cx;
  let y = safe.safeTop + safe.safeHeight * anchor.ry;
  x += rngRange(rng, -0.03, 0.03) * safe.safeWidth;
  y += rngRange(rng, -0.02, 0.02) * safe.safeHeight;

  blockEl.style.visibility = 'hidden';
  blockEl.style.opacity = '0';
  blockEl.style.left = '50%';
  blockEl.style.top = '50%';
  blockEl.style.transform = 'translate(-50%, -50%)';

  const rect = widthTarget.getBoundingClientRect();
  const blockW = rect.width;
  const blockH = rect.height;

  x = clampNumber(x, safe.innerLeft + blockW / 2, safe.innerRight - blockW / 2);
  y = clampNumber(y, safe.innerTop + blockH / 2, safe.innerBottom - blockH / 2);

  const roundedX = Math.round(x);
  const roundedY = Math.round(y);
  blockEl.style.left = `${roundedX}px`;
  blockEl.style.top = `${roundedY}px`;

  positionsCache[index] = { x: roundedX, y: roundedY, anchorIndex };
}

function countChars(text) {
  return Array.from(text).length;
}

function splitByPattern(text, pattern) {
  const matches = text.match(pattern);
  if (!matches) {
    return [text];
  }
  return matches.map((segment) => segment.trim()).filter(Boolean);
}

function buildLinesFromTokens(tokens, maxChars) {
  const lines = [];
  let current = '';
  let currentLen = 0;

  tokens.forEach((token) => {
    const tokenLen = countChars(token);
    if (!current) {
      current = token;
      currentLen = tokenLen;
      return;
    }
    if (currentLen + tokenLen <= maxChars) {
      current += token;
      currentLen += tokenLen;
      return;
    }
    lines.push(current);
    current = token;
    currentLen = tokenLen;
  });

  if (current) {
    lines.push(current);
  }

  return lines;
}

function isCjkChar(char) {
  return /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u.test(char);
}

function getLetterSpacingValue(letterSpacing, fontSize) {
  if (!letterSpacing || letterSpacing === 'normal') {
    return 0;
  }
  const numeric = Number.parseFloat(letterSpacing);
  if (!Number.isFinite(numeric)) {
    return 0;
  }
  if (letterSpacing.endsWith('em')) {
    return numeric * fontSize;
  }
  return numeric;
}

function measureTextWidth(ctx, text, letterSpacing) {
  if (!text) {
    return 0;
  }
  const base = ctx.measureText(text).width;
  if (!letterSpacing) {
    return base;
  }
  const extra = letterSpacing * Math.max(0, Array.from(text).length - 1);
  return base + extra;
}

function wrapTextByWidth(text, maxWidth, fontStyle, letterSpacing) {
  if (!text) {
    return [''];
  }
  const tokens = [];
  let buffer = '';

  Array.from(text).forEach((char) => {
    if (isCjkChar(char)) {
      if (buffer) {
        tokens.push(buffer);
        buffer = '';
      }
      tokens.push(char);
      return;
    }
    if (/\s/.test(char)) {
      if (buffer) {
        tokens.push(buffer);
        buffer = '';
      }
      tokens.push(char);
      return;
    }
    buffer += char;
  });

  if (buffer) {
    tokens.push(buffer);
  }

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx.font = fontStyle;
  const lines = [];
  let line = '';

  const pushLine = () => {
    if (line) {
      lines.push(line.trimEnd());
      line = '';
    }
  };

  tokens.forEach((token) => {
    if (token.trim() === '' && !line) {
      return;
    }
    const next = `${line}${token}`;
    const nextWidth = measureTextWidth(ctx, next, letterSpacing);
    if (!line || nextWidth <= maxWidth) {
      line = next;
      return;
    }

    pushLine();
    if (token.trim() === '') {
      return;
    }
    const tokenWidth = measureTextWidth(ctx, token, letterSpacing);
    if (tokenWidth <= maxWidth) {
      line = token.trimStart();
      return;
    }

    let chunk = '';
    Array.from(token).forEach((char) => {
      const candidate = `${chunk}${char}`;
      const candidateWidth = measureTextWidth(ctx, candidate, letterSpacing);
      if (!chunk || candidateWidth <= maxWidth) {
        chunk = candidate;
        return;
      }
      lines.push(chunk);
      chunk = char;
    });
    line = chunk;
  });

  if (line) {
    lines.push(line.trimEnd());
  }

  return lines.length ? lines : [''];
}

function formatWishText(message) {
  const trimmed = message.replace(/\s+/g, ' ').trim();
  if (!trimmed) {
    return { lines: [''], gaps: [] };
  }

  const totalChars = countChars(trimmed.replace(/\s+/g, ''));
  let targetLines = 2;
  if (totalChars > 12) {
    targetLines = 3;
  }
  if (totalChars > 22) {
    targetLines = 4;
  }

  let maxChars = Math.max(6, Math.ceil(totalChars / targetLines));
  const sentences = splitByPattern(trimmed, /[^。！？!?]+[。！？!?]?/g);

  function buildWithMaxChars(limit) {
    const lines = [];
    const gaps = [];
    let lineIndex = 0;
    sentences.forEach((sentence, sentenceIndex) => {
      const tokens = splitByPattern(sentence, /[^，、,]+[，、,]?/g);
      const sentenceLines = buildLinesFromTokens(tokens, limit);
      sentenceLines.forEach((line) => {
        lines.push(line);
        lineIndex += 1;
      });
      if (sentenceIndex < sentences.length - 1) {
        gaps.push(lineIndex - 1);
      }
    });
    return { lines, gaps };
  }

  let result = buildWithMaxChars(maxChars);
  while (result.lines.length > 4 && maxChars < totalChars) {
    maxChars += 2;
    result = buildWithMaxChars(maxChars);
  }

  if (result.lines.length > 4) {
    const chunkSize = Math.ceil(trimmed.length / 4);
    const fallbackLines = [];
    for (let i = 0; i < trimmed.length; i += chunkSize) {
      fallbackLines.push(trimmed.slice(i, i + chunkSize));
    }
    result = {
      lines: fallbackLines.slice(0, 4),
      gaps: fallbackLines.length > 2 ? [1] : []
    };
  }

  return result;
}

function computeStrokeTimings(lines) {
  const lineCharCounts = lines.map((line) => countChars(line.replace(/\s+/g, '')));
  const totalChars = lineCharCounts.reduce((sum, count) => sum + count, 0);
  if (totalChars === 0) {
    return {
      lineDurations: lines.map(() => 0),
      lineDelays: lines.map(() => 0),
      perCharDuration: 160
    };
  }

  const targetTotal = clamp(Math.round(totalChars * 170), 2000, 2500);
  const perCharDuration = Math.round(clamp(targetTotal / totalChars, 140, 180));
  let pauseBudget = Math.max(0, targetTotal - perCharDuration * totalChars);
  const totalGaps = Math.max(0, totalChars - 1);
  const pauses = new Array(totalGaps).fill(0);

  for (let i = 0; i < totalGaps; i += 1) {
    if (pauseBudget < 80) {
      break;
    }
    if (Math.random() < 0.35) {
      const pause = Math.min(pauseBudget, 80 + Math.random() * 40);
      const rounded = Math.round(pause);
      pauses[i] = rounded;
      pauseBudget -= rounded;
    }
  }

  const lineDurations = [];
  const lineDelays = [];
  let cumulativeDelay = 0;
  let gapIndex = 0;

  lineCharCounts.forEach((count, lineIndex) => {
    const isLastLine = lineIndex === lineCharCounts.length - 1;
    let duration = count * perCharDuration;
    let lineBreakPause = 0;

    for (let i = 0; i < count; i += 1) {
      const isLastCharInLine = i === count - 1;
      if (isLastCharInLine && !isLastLine) {
        lineBreakPause = pauses[gapIndex] || 0;
        gapIndex += 1;
      } else if (!isLastCharInLine) {
        duration += pauses[gapIndex] || 0;
        gapIndex += 1;
      }
    }

    lineDelays.push(cumulativeDelay);
    lineDurations.push(duration);
    cumulativeDelay += duration + lineBreakPause;
  });

  return { lineDurations, lineDelays, perCharDuration };
}

function createWishLine(lineText, timings) {
  const {
    strokeDelay,
    strokeDuration,
    fillDelay,
    fillDuration
  } = timings;
  const lineEl = document.createElement('span');
  lineEl.className = 'receive-wish-line';
  lineEl.style.setProperty('--stroke-delay', `${strokeDelay}ms`);
  lineEl.style.setProperty('--stroke-duration', `${strokeDuration}ms`);
  lineEl.style.setProperty('--fill-delay', `${fillDelay}ms`);
  lineEl.style.setProperty('--fill-duration', `${fillDuration}ms`);
  lineEl.style.setProperty('--stroke-length', '320');
  lineEl.setAttribute('aria-label', lineText);

  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.classList.add('receive-wish-svg');
  svg.setAttribute('aria-hidden', 'true');

  const strokeText = document.createElementNS(SVG_NS, 'text');
  strokeText.classList.add('receive-wish-stroke');
  strokeText.textContent = lineText;

  svg.appendChild(strokeText);
  lineEl.appendChild(svg);

  return {
    lineEl,
    svg,
    strokeText
  };
}

async function playWish(wish, index, layoutState) {
  clearStage();
  const layer = createLayer();
  const block = document.createElement('div');
  block.className = 'blessing-block';

  const safeArea = document.createElement('div');
  safeArea.className = 'blessing-safe-area';

  const meta = document.createElement('div');
  meta.className = 'meta-line receive-wish-meta receive-signature';
  meta.textContent = buildMetaText(wish);

  const body = document.createElement('div');
  body.className = 'wish-line receive-wish-body blessing-text';
  const message = wish.message ? wish.message.replace(/\s+/g, ' ').trim() : '';
  const signatureRevealDuration = 600;
  const signaturePause = 400;
  const baseDelay = signatureRevealDuration + signaturePause;
  const strokeDuration = 2200;
  const fillDuration = 300;
  const fillDelayMs = baseDelay + strokeDuration;
  const totalReveal = strokeDuration + fillDuration;
  body.style.setProperty('--breathe-delay', `${Math.round(baseDelay + totalReveal)}ms`);

  safeArea.appendChild(meta);
  safeArea.appendChild(body);
  block.appendChild(safeArea);
  layer.appendChild(block);

  body.innerHTML = '';
  block.style.visibility = 'hidden';
  block.style.opacity = '0';
  block.style.left = '50%';
  block.style.top = '50%';
  block.style.transform = 'translate(-50%, -50%)';

  window.requestAnimationFrame(() => {
    const bodyStyle = window.getComputedStyle(body);
    const fontSize = parseFloat(bodyStyle.fontSize);
    const lineHeightValue = parseFloat(bodyStyle.lineHeight);
    const resolvedLineHeight = Number.isNaN(lineHeightValue) ? fontSize * 1.6 : lineHeightValue;
    const letterSpacing = getLetterSpacingValue(bodyStyle.letterSpacing, fontSize);

    const safe = getSafeRect();
    const blockMaxW = safe.isDesktop
      ? Math.min(560, safe.safeWidth * 0.85)
      : safe.safeWidth * 0.92;
    const padX = safe.isDesktop ? 0 : 24;
    const maxLineWidth = Math.max(0, blockMaxW - padX * 2);
    const formatted = !safe.isDesktop && maxLineWidth
      ? {
          lines: wrapTextByWidth(
            message,
            maxLineWidth,
            `${bodyStyle.fontWeight} ${bodyStyle.fontSize} ${bodyStyle.fontFamily}`,
            letterSpacing
          ),
          gaps: []
        }
      : formatWishText(message);

    const lineNodes = [];
    const lineFragments = [];
    formatted.lines.forEach((line, lineIndex) => {
      const lineNode = createWishLine(line, {
        strokeDelay: baseDelay,
        strokeDuration,
        fillDelay: fillDelayMs,
        fillDuration
      });
      lineFragments.push(lineNode.lineEl);
      lineNodes.push(lineNode);
      if (formatted.gaps && formatted.gaps.includes(lineIndex)) {
        const gap = document.createElement('span');
        gap.className = 'receive-wish-gap';
        gap.setAttribute('aria-hidden', 'true');
        lineFragments.push(gap);
      }
    });

    lineFragments.forEach((node) => {
      body.appendChild(node);
    });

    lineNodes.forEach(({ lineEl, svg, strokeText }) => {
      svg.style.fontFamily = bodyStyle.fontFamily;
      svg.style.fontSize = bodyStyle.fontSize;
      svg.style.fontWeight = bodyStyle.fontWeight;
      svg.style.letterSpacing = bodyStyle.letterSpacing;
      strokeText.setAttribute('x', '0');
      strokeText.setAttribute('y', `${fontSize}`);

      const textLength = strokeText.getComputedTextLength();
      const width = Math.ceil(textLength) + 2;
      const strokeLength = Math.max(140, Math.ceil(textLength) + 20);
      lineEl.style.setProperty('--stroke-length', `${strokeLength}`);
      svg.setAttribute('width', `${width}`);
      svg.setAttribute('height', `${resolvedLineHeight}`);
      svg.setAttribute('viewBox', `0 0 ${width} ${resolvedLineHeight}`);
    });

    layoutBlessingBlock(block, index, layoutState.positionsCache, layoutState.anchorsShuffled, layoutState.rng);

    window.requestAnimationFrame(() => {
      block.style.visibility = 'visible';
      block.style.opacity = '1';
      fadeIn(meta);
      lineNodes.forEach(({ lineEl }) => {
        lineEl.classList.add('is-animating');
      });
    });
  });

  const revealDuration = baseDelay + totalReveal;
  await wait(Math.max(400, revealDuration));
  await wait(2600);
  await wait(400);
  safeArea.classList.add('is-exiting');
  fadeOut(meta);
  await wait(600);
  if (layer.parentNode) {
    layer.remove();
  }
}

async function runPlaying() {
  if (isPlaying) {
    return;
  }
  isPlaying = true;
  setState(STATES.PLAYING);
  clearStage();
  const wishes = await loadWishes();
  if (!wishes.length) {
    runEnding();
    return;
  }
  const seed = Date.now() & 0xffffffff;
  const rng = mulberry32(seed);
  const anchorsShuffled = shuffle([...Array(ANCHORS.length).keys()], rng);
  const positionsCache = Array(ANCHORS.length).fill(null);
  const safeRect = getSafeRect();
  console.log('[receive] viewport', { vw: safeRect.vw, vh: safeRect.vh });
  console.log('[receive] safeRect', safeRect);
  console.log('[receive] anchorsShuffled', anchorsShuffled);
  const layoutState = {
    positionsCache,
    anchorsShuffled,
    rng
  };

  for (let i = 0; i < wishes.length; i += 1) {
    if (currentState !== STATES.PLAYING) {
      isPlaying = false;
      return;
    }
    await playWish(wishes[i], i, layoutState);
  }

  console.log('[receive] positionsCache', positionsCache);
  runEnding();
}

async function runEnding() {
  setState(STATES.ENDING);
  clearStage();
  const layer = createLayer();
  const container = document.createElement('div');
  container.className = 'receive-ending';
  const line1 = document.createElement('div');
  line1.className = 'receive-ending-line receive-fade';
  const line2 = document.createElement('div');
  line2.className = 'receive-ending-line receive-fade';
  line1.textContent = nickname ? `Merry Christmas，${nickname}` : 'Merry Christmas';
  line2.textContent = '祝你开心地度过新的一年。';

  container.appendChild(line1);
  container.appendChild(line2);
  layer.appendChild(container);
  endingContainer = container;

  window.requestAnimationFrame(() => {
    setFadeDuration(line1, 1200);
    fadeIn(line1);
  });
  await wait(1200);
  await wait(1200);
  setFadeDuration(line2, 1000);
  fadeIn(line2);
  await wait(1000);
  await wait(2500);

  runDone();
}

function runDone() {
  setState(STATES.DONE);
  isPlaying = false;
  if (endingContainer) {
    endingContainer.classList.add('shifted');
  }
  const done = document.createElement('div');
  done.className = 'receive-share receive-fade';
  done.textContent = '如果你愿意，可以把这个网站分享给别人。';
  stage.appendChild(done);
  let hasCopied = false;
  const fadeDuration = 240;
  const swapText = (nextText) => {
    done.style.transition = `opacity ${fadeDuration}ms ease`;
    done.classList.add('is-swapping');
    window.setTimeout(() => {
      done.textContent = nextText;
      done.classList.remove('is-swapping');
    }, fadeDuration);
  };
  const finalize = (nextText) => {
    hasCopied = true;
    swapText(nextText);
    done.classList.add('is-confirmed');
    done.removeEventListener('click', handleCopy);
  };
  const handleCopy = async () => {
    if (hasCopied) {
      return;
    }
    try {
      const copied = await copyToClipboard(getCanonicalUrl());
      if (!copied) {
        showManualCopyPrompt(getCanonicalUrl());
        showShareToast('请手动复制链接', 1600);
        finalize('请手动复制');
        return;
      }
      showShareToast('已复制链接', 1600);
      finalize('已复制 ✓');
    } catch (err) {
      showManualCopyPrompt(getCanonicalUrl());
      showShareToast('请手动复制链接', 1600);
      finalize('请手动复制');
    }
  };
  done.addEventListener('click', handleCopy);
  window.requestAnimationFrame(() => {
    setFadeDuration(done, 1000);
    fadeIn(done);
  });
}

(async () => {
  try {
    const phaseData = await window.Phase.requirePhase('receive');
    if (!phaseData) {
      return;
    }
    setupReceiveParticles();
    await showIdle();
  } catch (err) {
    clearStage();
    const layer = createLayer();
    const message = document.createElement('div');
    message.className = 'receive-intro receive-fade';
    message.textContent = '加载失败，请刷新重试。';
    layer.appendChild(message);
    window.requestAnimationFrame(() => {
      fadeIn(message);
    });
  }
})();
