/* ==========================================================================
   Anchorage Alpha — accessibility widget (no dependencies)
   Injected at the end of <body>. All markup lives under #a11y; every widget
   style is scoped in a11y.css under #a11y or prefixed a11y-.
   ========================================================================== */
(function () {
'use strict';

/* ------------------------------ state ------------------------------ */
var KEY = 'a11y.settings.v1';
var DEFAULTS = {
  bigger: 0, spacing: 0, lineHeight: 0, align: 0, dyslexia: 0, dictionary: 0,
  contrast: 0, smart: 0, bright: 0, gray: 0, sat: 0, links: 0, hideImg: 0,
  cursor: 0, tips: 0, pause: 0, mute: 0, reader: 0, keyboard: 0, profile: ''
};
function clone(o) { var n = {}, k; for (k in o) n[k] = o[k]; return n }
var state = clone(DEFAULTS);

(function load() {
  var stored = false;
  try {
    var raw = localStorage.getItem(KEY);
    if (raw) {
      var p = JSON.parse(raw);
      if (p && typeof p === 'object') {
        for (var k in DEFAULTS) if (p[k] !== undefined && typeof p[k] === typeof DEFAULTS[k]) state[k] = p[k];
        stored = true;
      }
    }
  } catch (e) { /* private mode / storage disabled */ }
  if (!stored) {
    try { if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) state.pause = 1; } catch (e) {}
  }
})();
function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }

/* ------------------------------ icons ------------------------------ */
var I = {
  access: '<circle cx="12" cy="4.4" r="1.9"/><path d="M4.6 8.6h14.8"/><path d="M12 8.6v5.2"/><path d="M12 13.8 8.7 20.4"/><path d="M12 13.8l3.3 6.6"/>',
  bolt: '<path d="M13 2 5 13.5h5L10.5 22 19 10.5h-5z"/>',
  eyeoff: '<path d="M3 3l18 18"/><path d="M10.6 6.3A9.9 9.9 0 0 1 12 6.2c5 0 9 5.8 9 5.8a17 17 0 0 1-2.4 3.1"/><path d="M6.6 8.1A16.6 16.6 0 0 0 3 12s4 5.8 9 5.8c1.2 0 2.3-.3 3.3-.7"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
  book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15.5H6.5A2.5 2.5 0 0 0 4 21z"/><path d="M8.5 8h7M8.5 11.5h5"/>',
  palette: '<path d="M12 3a9 9 0 1 0 0 18c1.4 0 2-.9 2-1.8 0-1.6-1.6-2-1.6-3.4 0-1.2 1-2 2.4-2H17a4.5 4.5 0 0 0 4.5-4.5C21 6 17 3 12 3z"/><circle cx="8" cy="9" r="1.1" fill="currentColor" stroke="none"/><circle cx="12" cy="7" r="1.1" fill="currentColor" stroke="none"/><circle cx="7" cy="13.5" r="1.1" fill="currentColor" stroke="none"/>',
  aa: '<path d="M3.5 19 9 5l5.5 14"/><path d="M5.6 14.5h6.8"/><path d="M16.5 19c1.8-4.4 3-7 3.5-9 .6 2.4 1.7 5.4 3.5 9"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5 21 21"/>',
  hand: '<path d="M8 12V5.5a1.5 1.5 0 0 1 3 0V11"/><path d="M11 11V4.5a1.5 1.5 0 0 1 3 0V11"/><path d="M14 11V6.5a1.5 1.5 0 0 1 3 0V13"/><path d="M17 13v-2.5a1.5 1.5 0 0 1 3 0V15a6 6 0 0 1-6 6h-1.5a6 6 0 0 1-5.2-3L6 15.5l2.6-1.4a1.6 1.6 0 0 0 2.4.9"/>',
  wave: '<path d="M2 12h3l2.5-7 3 14 3-10 2.5 5h6"/>',
  textbig: '<path d="M3.5 18 8.5 6l5 12"/><path d="M5.3 14.5h6.4"/><path d="M15.5 18c1.6-3.9 2.6-6.2 3-8 .5 2 1.4 4.7 3 8"/>',
  spacing: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  lineh: '<path d="M4 5v14"/><path d="M9 5v14"/><path d="M13 9h7M13 15h7"/>',
  align: '<path d="M4 6h16M4 12h10M4 18h13"/>',
  contrast: '<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5v17a8.5 8.5 0 0 0 0-17z" fill="currentColor" stroke="none"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3 7 7M17 17l1.7 1.7M18.7 5.3 17 7M7 17l-1.7 1.7"/>',
  drop: '<path d="M12 3s6.5 6.6 6.5 11a6.5 6.5 0 0 1-13 0C5.5 9.6 12 3 12 3z"/>',
  sat: '<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5a8.5 8.5 0 0 1 0 17" fill="currentColor" stroke="none"/>',
  link: '<path d="M9.5 14.5 14.5 9.5"/><path d="M11 6.5 12.6 5a4 4 0 0 1 5.7 5.7L16.8 12"/><path d="M13 17.5 11.4 19a4 4 0 0 1-5.7-5.7L7.2 12"/>',
  img: '<rect x="3.5" y="4.5" width="17" height="15" rx="2"/><circle cx="9" cy="10" r="1.5"/><path d="M4.5 17.5 10 12l4 4 3-2.5 3 3"/>',
  cursor: '<path d="M5 3l14 7.5-6.2 1.6L10.6 19z"/>',
  tip: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5"/><circle cx="12" cy="8" r=".9" fill="currentColor" stroke="none"/>',
  pause: '<rect x="7" y="5" width="3.6" height="14" rx="1"/><rect x="13.4" y="5" width="3.6" height="14" rx="1"/>',
  mute: '<path d="M11 5 6.5 9H3v6h3.5L11 19z"/><path d="M16 9.5l5 5M21 9.5l-5 5"/>',
  speaker: '<path d="M11 5 6.5 9H3v6h3.5L11 19z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9.5 9.5 0 0 1 0 13"/>',
  keyboard: '<rect x="2.5" y="6.5" width="19" height="11" rx="2"/><path d="M6.5 10h.01M10 10h.01M13.5 10h.01M17 10h.01M8 14h8"/>',
  bulb: '<path d="M9.5 18h5M10.5 21h3"/><path d="M12 3a6 6 0 0 1 3.5 10.9V16h-7v-2.1A6 6 0 0 1 12 3z"/>',
  smart: '<circle cx="11" cy="12" r="8.5"/><path d="M11 3.5v17a8.5 8.5 0 0 0 0-17z" fill="currentColor" stroke="none"/><path d="M19 2.5l.6 1.6 1.6.6-1.6.6-.6 1.6-.6-1.6-1.6-.6 1.6-.6z"/>'
};
function svg(name) {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + (I[name] || '') + '</svg>';
}

/* --------------------------- feature model --------------------------- */
var PROFILES = {
  adhd:       { label: 'ADHD',                   icon: 'bolt',   set: { pause: 1, lineHeight: 2, spacing: 1, links: 1 } },
  blind:      { label: 'Blind',                  icon: 'eyeoff', set: { reader: 1, keyboard: 1, tips: 1, pause: 1 } },
  cognitive:  { label: 'Cognitive & Learning',   icon: 'bulb',   set: { bigger: 1, spacing: 1, lineHeight: 2, align: 1, pause: 1, links: 1, dictionary: 1 } },
  colorblind: { label: 'Color Blind',            icon: 'palette',set: { smart: 1, links: 1 } },
  dyslexia:   { label: 'Dyslexia',               icon: 'aa',     set: { dyslexia: 1, spacing: 1, lineHeight: 2, align: 0, bigger: 1 } },
  lowvision:  { label: 'Low Vision',             icon: 'search', set: { bigger: 2, cursor: 1, links: 1, keyboard: 1, spacing: 1, smart: 1 } },
  motor:      { label: 'Motor Impaired',         icon: 'hand',   set: { keyboard: 1, cursor: 1, pause: 1, links: 1 } },
  seizure:    { label: 'Seizure & Epileptic',    icon: 'wave',   set: { pause: 1, sat: 1 } }
};

var FEATURES = [
  { id: 'bigger',    label: 'Bigger Text',     icon: 'textbig',  levels: ['Off', '1.15\u00d7', '1.3\u00d7', '1.5\u00d7'], desc: 'Enlarges every piece of text on the site through three sizes, including content revealed later.' },
  { id: 'spacing',   label: 'Text Spacing',    icon: 'spacing',  levels: ['Off', 'Level 1', 'Level 2', 'Level 3'], desc: 'Widens letter and word spacing across the site.' },
  { id: 'lineHeight',label: 'Line Height',     icon: 'lineh',    levels: ['Off', '1.5', '1.8', '2.1'], desc: 'Increases the space between lines of text.' },
  { id: 'align',     label: 'Text Alignment',  icon: 'align',    levels: ['Left', 'Center', 'Right'], desc: 'Forces left, centre or right alignment of body text.' },
  { id: 'dyslexia',  label: 'Dyslexia Friendly',icon: 'aa',      desc: 'Switches the whole site to the Atkinson Hyperlegible typeface with wider spacing.' },
  { id: 'dictionary',label: 'Dictionary',      icon: 'book',     desc: 'Double-click any word on the site to look up its definition in a new tab.' },
  { id: 'contrast',  label: 'Contrast +',      icon: 'contrast', levels: ['Off', 'Dark', 'Light'], desc: 'High-contrast palette: black on white, or white on black with yellow links.' },
  { id: 'smart',     label: 'Smart Contrast', icon: 'smart',    desc: 'Fixes faint grey text and text sitting on top of photos.' },
  { id: 'bright',    label: 'Brightness',      icon: 'sun',      levels: ['Off', '125%', '80%'], desc: 'Brightens or dims the entire page.' },
  { id: 'gray',      label: 'Grayscale',       icon: 'drop',     desc: 'Removes all colour from the page.' },
  { id: 'sat',       label: 'Saturation',      icon: 'sat',      levels: ['Off', 'Low', 'High'], desc: 'Reduces or intensifies colour intensity.' },
  { id: 'links',     label: 'Highlight Links', icon: 'link',     desc: 'Underlines and outlines every link so they stand out.' },
  { id: 'hideImg',   label: 'Hide Images',     icon: 'img',      desc: 'Hides photos and keeps the page readable. Brand logos stay visible.' },
  { id: 'cursor',    label: 'Cursor',          icon: 'cursor',   levels: ['Off', 'Black', 'White'], desc: 'Replaces the mouse cursor with a large, high-visibility arrow.' },
  { id: 'tips',      label: 'Tooltips',        icon: 'tip',      desc: 'Shows the name of any link, button or card you point at or focus.' },
  { id: 'pause',     label: 'Pause Animations',icon: 'pause',    desc: 'Stops every animation and automatic movement on the page. On by default when your device asks for reduced motion.' },
  { id: 'mute',      label: 'Mute Sounds',     icon: 'mute',     desc: 'Silences any audio, video or spoken output.' },
  { id: 'reader',    label: 'Screen Reader',   icon: 'speaker',  desc: 'Reads text under your pointer or focus aloud. A lightweight helper \u2014 it does not replace NVDA, JAWS or VoiceOver.' },
  { id: 'keyboard',  label: 'Keyboard Navigation', icon: 'keyboard', desc: 'Adds a strong focus ring to every control and keeps the skip link visible. Tab to move, Enter to select, Alt+A opens this menu.' }
];
var GROUPS = [
  { title: 'Accessibility profiles', type: 'profiles', items: Object.keys(PROFILES).map(function (k) { return { id: k, label: PROFILES[k].label, icon: PROFILES[k].icon, desc: 'Applies a preset built for ' + PROFILES[k].label + ' users. Selecting another profile replaces these settings; touching any tile clears it.' }; }) },
  { title: 'Text', items: FEATURES.slice(0, 6) },
  { title: 'Colour & Contrast', items: FEATURES.slice(6, 13) },
  { title: 'Orientation', items: FEATURES.slice(13, 15) },
  { title: 'Behaviour', items: FEATURES.slice(15, 18) },
  { title: 'Other', items: FEATURES.slice(18, 19) }
];
var BY_ID = {};
FEATURES.forEach(function (f) { BY_ID[f.id] = f; });

/* ------------------------------ markup ------------------------------ */
var EMAIL = 'investor@anchoragealpha.com';
var root = document.createElement('div');
root.id = 'a11y';
/* the page's smooth-scroll library locks the page while this panel is open; this tells it to leave wheel/touch scrolling inside the panel alone */
root.setAttribute('data-lenis-prevent', '');

var cards = '';
GROUPS.forEach(function (g) {
  var tiles = '';
  g.items.forEach(function (f) {
    var isProfile = g.type === 'profiles';
    tiles +=
      '<div class="a11y-tl-wrap">' +
        '<button type="button" class="a11y-tl' + (isProfile ? ' pf' : '') + '" ' +
          'data-t="' + (isProfile ? 'profile' : (f.levels ? 'level' : 'toggle')) + '" ' +
          (isProfile ? 'data-p="' + f.id + '"' : 'data-f="' + f.id + '"') + ' aria-pressed="false">' +
          svg(f.icon) +
          '<span class="lb">' + f.label + '</span>' +
          '<span class="st">Off</span>' +
        '</button>' +
        '<button type="button" class="a11y-info" aria-label="About ' + f.label.replace(/&/g, '&amp;') + '" aria-expanded="false" data-for="' + (isProfile ? 'p:' + f.id : f.id) + '">i</button>' +
        '<p class="a11y-desc" data-desc="' + (isProfile ? 'p:' + f.id : f.id) + '">' + f.desc + '</p>' +
      '</div>';
  });
  cards += '<section class="a11y-card"><h3>' + g.title + '</h3><div class="a11y-grid">' + tiles + '</div></section>';
});

root.innerHTML =
  '<div class="a11y-panel" id="a11y-panel" role="dialog" aria-label="Accessibility menu" aria-hidden="true">' +
    '<div class="a11y-head">' + svg('access') + '<span class="a11y-title">Accessibility</span>' +
      '<button type="button" class="a11y-hbtn" id="a11y-reset" aria-label="Reset all accessibility settings">\u21ba</button>' +
      '<button type="button" class="a11y-hbtn" id="a11y-close" aria-label="Close accessibility menu">\u00d7</button>' +
    '</div>' +
    '<div class="a11y-body" id="a11y-body" tabindex="0">' + cards + '</div>' +
    '<div class="a11y-foot">Settings are saved on this device. Accessibility help: <a href="mailto:' + EMAIL + '">' + EMAIL + '</a></div>' +
  '</div>' +
  '<button type="button" class="a11y-trigger" id="a11y-trigger" aria-label="Open accessibility menu (Alt+A)" aria-expanded="false" aria-controls="a11y-panel">' + svg('access') + '</button>' +
  '<div class="a11y-tip" id="a11y-tip" role="tooltip" hidden></div>' +
  '<div class="a11y-dict" id="a11y-dict" hidden></div>' +
  '<div class="a11y-sr" id="a11y-live" role="status" aria-live="polite"></div>';

var panel = root.querySelector('#a11y-panel');
var trigger = root.querySelector('#a11y-trigger');
var live = root.querySelector('#a11y-live');
var tipEl = root.querySelector('#a11y-tip');
var dictEl = root.querySelector('#a11y-dict');

function announce(msg) { live.textContent = ''; setTimeout(function () { live.textContent = msg; }, 40); }
function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]; }); }

/* ------------------------------ apply ------------------------------ */
var SCOPE = 'body *:not(#a11y):not(#a11y *):not(#root):not(svg):not(script):not(style):not(canvas)';
var dysFontLoaded = false;

function scaleText() {
  var els = document.querySelectorAll(SCOPE), i, el, fs;
  if (!state.bigger) {
    for (i = 0; i < els.length; i++) { el = els[i]; if (el.__a11yFS != null) { el.style.fontSize = ''; el.__a11yFS = null; } }
    return;
  }
  for (i = 0; i < els.length; i++) { el = els[i]; if (el.__a11yFS == null) { fs = parseFloat(getComputedStyle(el).fontSize); if (fs > 0) el.__a11yFS = fs; } }
  var f = [1, 1.15, 1.3, 1.5][state.bigger];
  for (i = 0; i < els.length; i++) { el = els[i]; if (el.__a11yFS != null) el.style.fontSize = (el.__a11yFS * f) + 'px'; }
}

function applyFilter() {
  var parts = [];
  if (state.bright === 1) parts.push('brightness(1.25)');
  else if (state.bright === 2) parts.push('brightness(.8)');
  if (state.gray) parts.push('grayscale(1)');
  if (state.sat === 1) parts.push('saturate(.4)');
  else if (state.sat === 2) parts.push('saturate(1.9)');
  document.documentElement.style.filter = parts.join(' ');
}

function applyMedia() {
  var els = document.querySelectorAll('audio,video');
  for (var i = 0; i < els.length; i++) { try { els[i].muted = !!state.mute; } catch (e) {} }
  if (state.mute) stopSpeech();
}

function ensureDysFont() {
  if (dysFontLoaded) return;
  dysFontLoaded = true;
  var l = document.createElement('link');
  l.rel = 'stylesheet';
  l.href = 'https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&display=swap';
  document.head.appendChild(l);
}

function syncLenis() {
  try { if (window.__lenis && window.__lenis.options) window.__lenis.options.lerp = state.pause ? 1 : 0.085; } catch (e) {}
}

function stateText(f) { return f.levels ? f.levels[state[f.id]] : (state[f.id] ? 'On' : 'Off'); }

function renderTiles() {
  var btns = root.querySelectorAll('.a11y-tl');
  for (var i = 0; i < btns.length; i++) {
    var b = btns[i], on;
    if (b.getAttribute('data-t') === 'profile') {
      on = state.profile === b.getAttribute('data-p');
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      b.querySelector('.st').textContent = on ? 'Active' : 'Off';
    } else {
      var f = BY_ID[b.getAttribute('data-f')];
      on = !!state[f.id];
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      b.querySelector('.st').textContent = stateText(f);
    }
  }
}

function applyAll() {
  var c = document.documentElement.classList;
  c.toggle('a11y-bigger1', state.bigger === 1); c.toggle('a11y-bigger2', state.bigger === 2); c.toggle('a11y-bigger3', state.bigger === 3);
  c.toggle('a11y-sp1', state.spacing === 1); c.toggle('a11y-sp2', state.spacing === 2); c.toggle('a11y-sp3', state.spacing === 3);
  c.toggle('a11y-lh1', state.lineHeight === 1); c.toggle('a11y-lh2', state.lineHeight === 2); c.toggle('a11y-lh3', state.lineHeight === 3);
  c.toggle('a11y-al1', state.align === 1); c.toggle('a11y-al2', state.align === 2);
  c.toggle('a11y-dys', !!state.dyslexia);
  c.toggle('a11y-contrast1', state.contrast === 1); c.toggle('a11y-contrast2', state.contrast === 2);
  c.toggle('a11y-smart', !!state.smart);
  c.toggle('a11y-links', !!state.links);
  c.toggle('a11y-hideimg', !!state.hideImg);
  c.toggle('a11y-cur1', state.cursor === 1); c.toggle('a11y-cur2', state.cursor === 2);
  c.toggle('a11y-keyboard', !!state.keyboard);
  c.toggle('a11y-pause', !!state.pause);
  if (state.dyslexia) ensureDysFont();
  scaleText();
  applyFilter();
  applyMedia();
  window.paused = !!state.pause;
  syncLenis();
  renderTiles();
  if (!state.reader) stopSpeech();
}

/* --------------------------- interactions --------------------------- */
function commit(msg) { save(); applyAll(); if (msg) announce(msg); }

root.addEventListener('click', function (e) {
  var t = e.target;
  if (!t.closest) return;
  var info = t.closest('.a11y-info');
  if (info) {
    var d = root.querySelector('[data-desc="' + info.getAttribute('data-for') + '"]');
    var open = info.getAttribute('aria-expanded') === 'true';
    root.querySelectorAll('.a11y-info[aria-expanded="true"]').forEach(function (b) {
      b.setAttribute('aria-expanded', 'false');
      root.querySelector('[data-desc="' + b.getAttribute('data-for') + '"]').classList.remove('show');
    });
    if (!open && d) { info.setAttribute('aria-expanded', 'true'); d.classList.add('show'); }
    return;
  }
  var tl = t.closest('.a11y-tl');
  if (tl) {
    var type = tl.getAttribute('data-t');
    if (type === 'profile') {
      var pid = tl.getAttribute('data-p');
      if (state.profile === pid) { // active profile -> everything off
        state = clone(DEFAULTS);
        commit('All accessibility settings reset');
      } else {
        state = clone(DEFAULTS);
        var set = PROFILES[pid].set;
        for (var k in set) state[k] = set[k];
        state.profile = pid;
        commit('Profile applied: ' + PROFILES[pid].label);
      }
    } else {
      var f = BY_ID[tl.getAttribute('data-f')];
      if (f.levels) state[f.id] = (state[f.id] + 1) % f.levels.length;
      else state[f.id] = state[f.id] ? 0 : 1;
      state.profile = '';
      commit(f.label + ': ' + (f.levels ? stateText(f) : (state[f.id] ? 'on' : 'off')));
    }
    return;
  }
  if (t.closest('#a11y-reset')) {
    state = clone(DEFAULTS);
    document.querySelectorAll(SCOPE).forEach(function (el) { if (el.__a11yFS != null) { el.style.fontSize = ''; el.__a11yFS = null; } });
    commit('All accessibility settings reset');
    return;
  }
  if (t.closest('#a11y-close')) { closePanel(); return; }
  if (t.closest('#a11y-trigger')) { togglePanel(); return; }
});

/* -------------------------- panel plumbing -------------------------- */
var isOpen = false;
function panelFocusables() {
  return Array.prototype.filter.call(panel.querySelectorAll('button:not([disabled]),[href],input,select,textarea,[tabindex]:not([tabindex="-1"])'),
    function (el) { return el.offsetWidth > 0 || el.offsetHeight > 0; });
}
function openPanel() {
  if (isOpen) return;
  isOpen = true;
  panel.classList.add('open');
  panel.setAttribute('aria-hidden', 'false');
  trigger.setAttribute('aria-expanded', 'true');
  trigger.setAttribute('aria-label', 'Close accessibility menu (Alt+A)');
  try { if (window.__lenis && window.__lenis.stop) window.__lenis.stop(); } catch (e) {}
  var f = panelFocusables();
  if (f[0]) f[0].focus();
}
function closePanel() {
  if (!isOpen) return;
  isOpen = false;
  panel.classList.remove('open');
  panel.setAttribute('aria-hidden', 'true');
  trigger.setAttribute('aria-expanded', 'false');
  trigger.setAttribute('aria-label', 'Open accessibility menu (Alt+A)');
  try { if (window.__lenis && window.__lenis.start) window.__lenis.start(); } catch (e) {}
  trigger.focus();
}
function togglePanel() { isOpen ? closePanel() : openPanel(); }

panel.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') { e.preventDefault(); closePanel(); return; }
  if (e.key === 'Tab') {
    var list = [trigger].concat(panelFocusables());
    var i = list.indexOf(document.activeElement);
    if (i < 0) i = 0;
    var n = e.shiftKey ? i - 1 : i + 1;
    if (n < 0) n = list.length - 1;
    if (n >= list.length) n = 0;
    e.preventDefault();
    list[n].focus();
  }
});
document.addEventListener('keydown', function (e) {
  if (e.altKey && (e.key === 'a' || e.key === 'A')) { e.preventDefault(); togglePanel(); }
  else if (e.key === 'Escape' && isOpen) { closePanel(); }
  else if (e.key === 'Escape') { hideDict(); }
});

/* --------------------------- dynamic text --------------------------- */
var scaleTimer = null;
var mo = new MutationObserver(function (muts) {
  var need = false, m, n;
  for (var i = 0; i < muts.length && !need; i++) {
    m = muts[i].addedNodes;
    for (var j = 0; j < m.length; j++) {
      n = m[j];
      if (n.nodeType === 1 && !(n.closest && n.closest('#a11y'))) { need = true; break; }
    }
  }
  if (need && state.bigger && !scaleTimer) {
    scaleTimer = setTimeout(function () { scaleTimer = null; scaleText(); }, 120);
  }
  if (state.mute) {
    for (var i2 = 0; i2 < muts.length; i2++) {
      var nn = muts[i2].addedNodes;
      for (var j2 = 0; j2 < nn.length; j2++) {
        var n2 = nn[j2];
        if (n2.nodeType === 1 && (n2.tagName === 'AUDIO' || n2.tagName === 'VIDEO')) n2.muted = true;
      }
    }
  }
});

/* ----------------------------- tooltips ----------------------------- */
var TIP_SEL = 'a,button,input,select,textarea,[title],[aria-label],.card,.inv-card,.scheme,.princ li,.pol';
function tipText(el) {
  return ((el.getAttribute('aria-label') || el.getAttribute('title') || (el.innerText || el.textContent || '')).trim()).slice(0, 120);
}
function place(el, x, y) {
  var r = el.getBoundingClientRect();
  var w = r.width, h = r.height;
  var L = Math.max(8, Math.min(x, innerWidth - w - 8));
  var T = Math.max(8, Math.min(y, innerHeight - h - 8));
  el.style.left = L + 'px';
  el.style.top = T + 'px';
}
function hideTip() { tipEl.hidden = true; }
document.addEventListener('mouseover', function (e) {
  if (!state.tips) { if (!tipEl.hidden) hideTip(); return; }
  var el = e.target && e.target.closest ? e.target.closest(TIP_SEL) : null;
  if (!el || el.closest('#a11y')) { hideTip(); return; }
  var t = tipText(el);
  if (!t) { hideTip(); return; }
  tipEl.textContent = t;
  tipEl.hidden = false;
  place(tipEl, e.clientX + 14, e.clientY + 18);
});
document.addEventListener('mouseout', function (e) {
  if (!state.tips) return;
  var el = e.target && e.target.closest ? e.target.closest(TIP_SEL) : null;
  if (el && (!e.relatedTarget || !el.contains(e.relatedTarget))) hideTip();
});
document.addEventListener('focusin', function (e) {
  if (!state.tips) return;
  var el = e.target && e.target.closest ? e.target.closest(TIP_SEL) : null;
  if (!el || el.closest('#a11y')) return;
  var t = tipText(el);
  if (!t) return;
  tipEl.textContent = t;
  tipEl.hidden = false;
  var r = el.getBoundingClientRect();
  place(tipEl, r.left, r.bottom + 8);
});
document.addEventListener('focusout', function (e) {
  if (e.target && e.target.closest && !e.target.closest('#a11y')) hideTip();
});
window.addEventListener('scroll', hideTip, true);

/* ---------------------------- dictionary ---------------------------- */
function hideDict() { dictEl.hidden = true; }
function wordAt(x, y) {
  var w = '';
  var sel = window.getSelection && window.getSelection();
  if (sel && String(sel.toString()).trim()) w = String(sel.toString()).trim().split(/\s+/)[0];
  else {
    try {
      var r = null;
      if (document.caretRangeFromPoint) r = document.caretRangeFromPoint(x, y);
      else if (document.caretPositionFromPoint) { var p = document.caretPositionFromPoint(x, y); if (p) r = { startContainer: p.offsetNode, startOffset: p.offset }; }
      var node = r && (r.startContainer || r.offsetNode);
      var off = r && (r.startOffset != null ? r.startOffset : r.offset);
      if (node && node.nodeType === 3 && off != null) {
        var t = node.textContent || '';
        var before = t.slice(0, off).search(/[A-Za-z'\u2019-]+$/);
        var m = t.slice(off).match(/^[A-Za-z'\u2019-]+/);
        if (before > -1 && m) w = t.slice(before, off) + m[0];
        else if (m) w = m[0];
      }
    } catch (e) {}
  }
  return (w.match(/[A-Za-z'\u2019-]+/) || [''])[0];
}
document.addEventListener('dblclick', function (e) {
  if (!state.dictionary) return;
  if (e.target && e.target.closest && e.target.closest('#a11y')) return;
  var w = wordAt(e.clientX, e.clientY);
  if (!w) return;
  dictEl.innerHTML = '<b>' + esc(w.toLowerCase()) + '</b><a href="https://www.merriam-webster.com/dictionary/' + encodeURIComponent(w.toLowerCase()) + '" target="_blank" rel="noopener noreferrer">Look up the definition</a>';
  dictEl.hidden = false;
  place(dictEl, e.clientX, e.clientY + 18);
}, true);
document.addEventListener('click', function (e) {
  if (!dictEl.hidden && !(e.target.closest && e.target.closest('#a11y-dict'))) hideDict();
}, true);
window.addEventListener('scroll', hideDict, true);

/* --------------------------- screen reader --------------------------- */
var hoverTimer = null;
function speakText(t) {
  if (!t || state.mute) return;
  try { window.speechSynthesis.cancel(); var u = new SpeechSynthesisUtterance(t.slice(0, 300)); u.lang = 'en'; window.speechSynthesis.speak(u); } catch (e) {}
}
function stopSpeech() { try { window.speechSynthesis.cancel(); } catch (e) {} }
var READ_SEL = 'h1,h2,h3,p,a,button,label,li,.card,.inv-card,.scheme,.princ li,span';
function readText(el) {
  return ((el.getAttribute('aria-label') || el.getAttribute('title') || el.innerText || '') + '').trim().slice(0, 300);
}
document.addEventListener('mouseover', function (e) {
  if (!state.reader || state.mute) return;
  var el = e.target && e.target.closest ? e.target.closest(READ_SEL) : null;
  if (!el || el.closest('#a11y')) return;
  clearTimeout(hoverTimer);
  hoverTimer = setTimeout(function () { speakText(readText(el)); }, 250);
});
document.addEventListener('mouseout', function (e) {
  if (e.target && e.target.closest && e.target.closest(READ_SEL)) clearTimeout(hoverTimer);
});
document.addEventListener('focusin', function (e) {
  if (!state.reader || state.mute) return;
  var el = e.target && e.target.closest ? e.target.closest(READ_SEL) : null;
  if (!el || el.closest('#a11y')) return;
  clearTimeout(hoverTimer);
  speakText(readText(el));
});

/* ------------------------------- boot ------------------------------- */
document.body.appendChild(root);
mo.observe(document.body, { childList: true, subtree: true });
applyAll(); // re-applies stored settings before first paint
})();
