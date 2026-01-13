/* =========================================================
  Trackly — Vanilla JS (Beginner-friendly, production habits)
  - State in memory (apps array)
  - Render functions update the DOM
  - localStorage persists data + UI preference
========================================================= */

"use strict";

/* -----------------------------
  1) Tiny helpers
----------------------------- */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function uid() {
  // Simple unique id: timestamp + random
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function safeText(str) {
  // Prevent null/undefined in UI
  return (str ?? "").toString().trim();
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  // date input returns yyyy-mm-dd; keep it readable
  const [y, m, d] = dateStr.split("-");
  if (!y || !m || !d) return dateStr;
  return `${d}/${m}/${y}`;
}

/* -----------------------------
  2) DOM references
----------------------------- */
const els = {
  // nav + scroll spy
  navLinks: $$(".nav-link"),
  sections: ["features", "demo", "proof", "faq"].map((id) => document.getElementById(id)),

  // mobile menu
  mobileBtn: $("#mobileMenuBtn"),
  mobileMenu: $("#mobileMenu"),

  // modal
  overlay: $("#modalOverlay"),
  modal: $("#modal"),
  closeModalBtn: $("#closeModal"),
  modalPrimary: $("#modalPrimary"),
  openAbout1: $("#openAboutModal"),
  openAbout2: $("#openAboutModal2"),
  openKeyboardHelp: $("#openKeyboardHelp"),

  // preference toggle
  compactToggle: $("#compactToggle"),

  // app form
  form: $("#appForm"),
  formStatus: $("#formStatus"),
  company: $("#company"),
  role: $("#role"),
  status: $("#status"),
  date: $("#date"),
  link: $("#link"),
  notes: $("#notes"),
  editId: $("#editId"),
  submitBtn: $("#submitBtn"),
  resetBtn: $("#resetBtn"),

  // list controls
  search: $("#search"),
  filter: $("#filter"),
  sort: $("#sort"),

  // list + meta
  list: $("#appList"),
  empty: $("#emptyState"),
  resultsMeta: $("#resultsMeta"),

  // stats
  statTotal: $("#statTotal"),
  statApplied: $("#statApplied"),
  statInterview: $("#statInterview"),
  statOffer: $("#statOffer"),

  // buttons
  seed: $("#seedDemoData"),
  clearAll: $("#clearAll"),

  // FAQ
  faqBtns: $$(".faq-btn"),
};

/* -----------------------------
  3) localStorage keys
----------------------------- */
const STORAGE_KEY_APPS = "trackly.apps.v1";
const STORAGE_KEY_PREFS = "trackly.prefs.v1";

/* -----------------------------
  4) App state
----------------------------- */
let apps = []; // array of application objects
let prefs = {
  compact: false,
};

/* -----------------------------
  5) Load / Save
----------------------------- */
function loadState() {
  try {
    const rawApps = localStorage.getItem(STORAGE_KEY_APPS);
    const rawPrefs = localStorage.getItem(STORAGE_KEY_PREFS);

    apps = rawApps ? JSON.parse(rawApps) : [];
    prefs = rawPrefs ? { ...prefs, ...JSON.parse(rawPrefs) } : prefs;
  } catch (e) {
    // If storage gets corrupted, reset safely
    apps = [];
    prefs = { compact: false };
  }

  applyPrefsToUI();
}

function saveApps() {
  localStorage.setItem(STORAGE_KEY_APPS, JSON.stringify(apps));
}

function savePrefs() {
  localStorage.setItem(STORAGE_KEY_PREFS, JSON.stringify(prefs));
}

/* -----------------------------
  6) Preferences (compact mode)
----------------------------- */
function applyPrefsToUI() {
  // We store compact on the <html> element via dataset
  document.documentElement.dataset.compact = prefs.compact ? "true" : "false";
  if (els.compactToggle) {
    els.compactToggle.setAttribute("aria-pressed", prefs.compact ? "true" : "false");
    els.compactToggle.textContent = prefs.compact ? "Comfort" : "Compact";
  }
}

/* -----------------------------
  7) Rendering
----------------------------- */
function getFilteredApps() {
  const q = safeText(els.search.value).toLowerCase();
  const statusFilter = els.filter.value;
  const sortMode = els.sort.value;

  let result = apps.slice();

  // Search (company or role)
  if (q) {
    result = result.filter((a) => {
      const hay = `${a.company} ${a.role}`.toLowerCase();
      return hay.includes(q);
    });
  }

  // Filter by status
  if (statusFilter !== "all") {
    result = result.filter((a) => a.status === statusFilter);
  }

  // Sort
  result.sort((a, b) => {
    if (sortMode === "company") return a.company.localeCompare(b.company);
    if (sortMode === "status") return a.status.localeCompare(b.status);
    if (sortMode === "oldest") return (a.createdAt || 0) - (b.createdAt || 0);
    // newest (default)
    return (b.createdAt || 0) - (a.createdAt || 0);
  });

  return result;
}

function statusBadge(status) {
  // Minimal mapping to keep UI consistent
  const map = {
    applied: "bg-slate-100 text-slate-700 border-slate-200",
    interview: "bg-amber-50 text-amber-700 border-amber-200",
    offer: "bg-emerald-50 text-emerald-700 border-emerald-200",
    rejected: "bg-rose-50 text-rose-700 border-rose-200",
  };
  const labelMap = {
    applied: "Applied",
    interview: "Interview",
    offer: "Offer",
    rejected: "Rejected",
  };

  return {
    classes: map[status] || "bg-slate-100 text-slate-700 border-slate-200",
    label: labelMap[status] || "Unknown",
  };
}

function renderStats() {
  const total = apps.length;
  const applied = apps.filter((a) => a.status === "applied").length;
  const interview = apps.filter((a) => a.status === "interview").length;
  const offer = apps.filter((a) => a.status === "offer").length;

  els.statTotal.textContent = total;
  els.statApplied.textContent = applied;
  els.statInterview.textContent = interview;
  els.statOffer.textContent = offer;
}

function renderList() {
  const items = getFilteredApps();

  // meta
  const meta = items.length === apps.length
    ? `${items.length} item${items.length === 1 ? "" : "s"}`
    : `${items.length} shown of ${apps.length}`;

  els.resultsMeta.textContent = meta;

  // empty state
  if (apps.length === 0) {
    els.empty.classList.remove("hidden");
  } else {
    els.empty.classList.add("hidden");
  }

  // render cards
  els.list.innerHTML = items.map(cardTemplate).join("");

  // If search/filter yields nothing, show a friendly message
  if (apps.length > 0 && items.length === 0) {
    els.list.innerHTML = `
      <li class="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
        <p class="text-sm font-semibold">No matches</p>
        <p class="mt-2 text-sm text-slate-600">Try clearing search or changing filters.</p>
      </li>
    `;
  }
}

function cardTemplate(a) {
  const badge = statusBadge(a.status);

  const safeCompany = escapeHtml(a.company);
  const safeRole = escapeHtml(a.role);
  const safeNotes = escapeHtml(a.notes || "");

  const dateLabel = a.date ? formatDate(a.date) : "—";

  // If link exists, make it safe + clickable
  const linkPart = a.link
    ? `<a class="text-sm font-semibold text-slate-900 underline decoration-slate-300 underline-offset-4 hover:decoration-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 rounded"
          href="${escapeAttr(a.link)}" target="_blank" rel="noreferrer">
          Open job link
       </a>`
    : `<span class="text-sm text-slate-500">No link</span>`;

  return `
    <li class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div class="min-w-0">
          <div class="flex flex-wrap items-center gap-2">
            <p class="truncate text-sm font-semibold text-slate-900">${safeCompany}</p>
            <span class="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${badge.classes}">
              ${badge.label}
            </span>
          </div>
          <p class="mt-1 text-sm text-slate-600">${safeRole}</p>

          <div class="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-600">
            <span><span class="font-semibold text-slate-800">Applied:</span> ${dateLabel}</span>
            <span class="hidden sm:inline">•</span>
            ${linkPart}
          </div>

          ${safeNotes
            ? `<p class="mt-3 text-sm text-slate-600"><span class="font-semibold text-slate-800">Notes:</span> ${safeNotes}</p>`
            : ""
          }
        </div>

        <div class="flex shrink-0 items-center gap-2">
          <button
            class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20"
            data-action="edit"
            data-id="${a.id}"
            type="button"
          >
            Edit
          </button>
          <button
            class="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 shadow-sm hover:bg-rose-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/20"
            data-action="delete"
            data-id="${a.id}"
            type="button"
          >
            Delete
          </button>
        </div>
      </div>
    </li>
  `;
}

/* -----------------------------
  8) Basic HTML escaping (security habit)
  This is a good signal for recruiters.
----------------------------- */
function escapeHtml(str) {
  return safeText(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(str) {
  // For href attribute; still basic, but prevents accidental breaking
  return escapeHtml(str);
}

/* -----------------------------
  9) Form validation (helpful errors)
----------------------------- */
function setFieldError(fieldName, message) {
  const p = document.querySelector(`[data-error-for="${fieldName}"]`);
  if (!p) return;

  if (message) {
    p.textContent = message;
    p.classList.remove("hidden");
  } else {
    p.textContent = "";
    p.classList.add("hidden");
  }
}

function clearAllErrors() {
  ["company", "role", "status", "link"].forEach((name) => setFieldError(name, ""));
}

function validateForm(data) {
  clearAllErrors();

  let ok = true;

  if (data.company.length < 2) {
    setFieldError("company", "Company name should be at least 2 characters.");
    ok = false;
  }

  if (data.role.length < 2) {
    setFieldError("role", "Role title should be at least 2 characters.");
    ok = false;
  }

  if (!data.status) {
    setFieldError("status", "Please choose a status (Applied/Interview/Offer/Rejected).");
    ok = false;
  }

  if (data.link) {
    try {
      new URL(data.link);
    } catch {
      setFieldError("link", "That link doesn't look valid. Include https://");
      ok = false;
    }
  }

  // Screen-reader friendly form status
  if (!ok) {
    els.formStatus.textContent = "Please fix the highlighted fields.";
  } else {
    els.formStatus.textContent = "";
  }

  return ok;
}

/* -----------------------------
  10) CRUD actions
----------------------------- */
function resetFormToAddMode() {
  els.editId.value = "";
  els.submitBtn.textContent = "Add application";
  els.form.reset();
  clearAllErrors();
  els.formStatus.textContent = "";
}

function fillFormForEdit(app) {
  els.company.value = app.company;
  els.role.value = app.role;
  els.status.value = app.status;
  els.date.value = app.date || "";
  els.link.value = app.link || "";
  els.notes.value = app.notes || "";
  els.editId.value = app.id;

  els.submitBtn.textContent = "Save changes";
  els.company.focus();
}

function upsertApp(data) {
  const editingId = els.editId.value;

  if (editingId) {
    // Update
    apps = apps.map((a) => (a.id === editingId ? { ...a, ...data } : a));
  } else {
    // Create
    apps.unshift({
      id: uid(),
      createdAt: Date.now(),
      ...data,
    });
  }

  saveApps();
  renderStats();
  renderList();
  resetFormToAddMode();
}

function deleteApp(id) {
  apps = apps.filter((a) => a.id !== id);
  saveApps();
  renderStats();
  renderList();
}

/* -----------------------------
  11) Modal (accessible)
  - ESC closes
  - Click overlay closes
  - Focus trap inside modal
  - Return focus to the opener
----------------------------- */
let lastFocusedEl = null;

function openModal(mode = "about") {
  lastFocusedEl = document.activeElement;

  // Update modal content based on mode
  const title = $("#modalTitle");
  const desc = $("#modalDesc");

  if (mode === "keyboard") {
    title.textContent = "Keyboard shortcuts";
    desc.textContent = "Small habits that make you faster.";
    // Keep the modal body already contains shortcuts; this mode just changes heading.
  } else {
    title.textContent = "About this project";
    desc.textContent = "A premium frontend demo designed for junior hiring signals.";
  }

  els.overlay.classList.remove("hidden");
  els.overlay.classList.add("flex");
  els.overlay.setAttribute("aria-hidden", "false");

  document.body.classList.add("modal-open");

  // Focus the modal container so keyboard users start inside
  els.modal.focus();

  document.addEventListener("keydown", onModalKeydown);
  els.overlay.addEventListener("mousedown", onOverlayMouseDown);
}

function closeModal() {
  els.overlay.classList.add("hidden");
  els.overlay.classList.remove("flex");
  els.overlay.setAttribute("aria-hidden", "true");

  document.body.classList.remove("modal-open");

  document.removeEventListener("keydown", onModalKeydown);
  els.overlay.removeEventListener("mousedown", onOverlayMouseDown);

  // Return focus back to what opened the modal
  if (lastFocusedEl && typeof lastFocusedEl.focus === "function") {
    lastFocusedEl.focus();
  }
}

function onOverlayMouseDown(e) {
  // Only close if user clicks the dark overlay, not the modal box
  if (e.target === els.overlay) closeModal();
}

function getFocusableInModal() {
  const focusables = $$(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    els.modal
  ).filter((el) => !el.hasAttribute("disabled") && !el.getAttribute("aria-hidden"));
  return focusables;
}

function onModalKeydown(e) {
  if (e.key === "Escape") {
    e.preventDefault();
    closeModal();
    return;
  }

  // Focus trap: keep tab inside modal
  if (e.key === "Tab") {
    const focusables = getFocusableInModal();
    if (focusables.length === 0) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
}

/* -----------------------------
  12) FAQ Accordion (keyboard + aria)
  - Buttons already exist in HTML
  - We toggle aria-expanded and animate height
----------------------------- */
function initFaq() {
  els.faqBtns.forEach((btn) => {
    btn.addEventListener("click", () => toggleFaq(btn));
    btn.addEventListener("keydown", (e) => {
      // Space/Enter also triggers click naturally for <button>
      // We keep this for clarity; not strictly needed.
      if (e.key === "Enter" || e.key === " ") {
        // let click happen
      }
    });
  });
}

function toggleFaq(btn) {
  const wrapper = btn.closest("div");
  const panel = $(".faq-panel", wrapper);
  const expanded = btn.getAttribute("aria-expanded") === "true";

  // Optional: close others (accordion behavior)
  els.faqBtns.forEach((b) => {
    if (b !== btn) collapseFaq(b);
  });

  if (expanded) collapseFaq(btn);
  else expandFaq(btn);

  function expandFaq(b) {
    const w = b.closest("div");
    const p = $(".faq-panel", w);
    b.setAttribute("aria-expanded", "true");

    // animate height: from 0 -> scrollHeight
    p.classList.remove("hidden");
    p.style.height = "0px";
    p.style.transition = "height 180ms ease";
    // next frame to ensure transition applies
    requestAnimationFrame(() => {
      p.style.height = p.scrollHeight + "px";
    });

    // after transition, set to auto height
    p.addEventListener(
      "transitionend",
      () => {
        if (b.getAttribute("aria-expanded") === "true") {
          p.style.height = "auto";
        }
      },
      { once: true }
    );
  }

  function collapseFaq(b) {
    const w = b.closest("div");
    const p = $(".faq-panel", w);
    b.setAttribute("aria-expanded", "false");

    // if height is auto, set to current px first
    p.style.transition = "height 180ms ease";
    p.style.height = p.scrollHeight + "px";
    requestAnimationFrame(() => {
      p.style.height = "0px";
    });

    p.addEventListener(
      "transitionend",
      () => {
        if (b.getAttribute("aria-expanded") === "false") {
          p.classList.add("hidden");
        }
      },
      { once: true }
    );
  }
}

/* -----------------------------
  13) Scroll Spy (active section highlight)
  - Uses IntersectionObserver (efficient)
----------------------------- */
function initScrollSpy() {
  const linkById = new Map(
    els.navLinks.map((a) => [a.dataset.section, a])
  );

  const observer = new IntersectionObserver(
    (entries) => {
      // Find the most visible section that is intersecting
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visible) return;

      const id = visible.target.id;
      els.navLinks.forEach((l) => l.classList.remove("is-active"));
      const active = linkById.get(id);
      if (active) active.classList.add("is-active");
    },
    {
      // Adjust for sticky header height:
      rootMargin: "-30% 0px -60% 0px",
      threshold: [0.1, 0.2, 0.35, 0.5, 0.7],
    }
  );

  els.sections.forEach((sec) => sec && observer.observe(sec));
}

/* -----------------------------
  14) Mobile menu toggle
----------------------------- */
function initMobileMenu() {
  if (!els.mobileBtn || !els.mobileMenu) return;

  els.mobileBtn.addEventListener("click", () => {
    const isOpen = els.mobileMenu.classList.contains("hidden") === false;
    els.mobileMenu.classList.toggle("hidden");
    els.mobileBtn.setAttribute("aria-expanded", String(!isOpen));
  });

  // Close menu when a link is clicked
  $$("a", els.mobileMenu).forEach((a) => {
    a.addEventListener("click", () => {
      els.mobileMenu.classList.add("hidden");
      els.mobileBtn.setAttribute("aria-expanded", "false");
    });
  });
}

/* -----------------------------
  15) Demo data seed + clear
----------------------------- */
function seedDemoData() {
  const now = Date.now();

  apps = [
    {
      id: uid(),
      createdAt: now - 1000 * 60 * 60 * 24 * 2,
      company: "Canva",
      role: "Junior Frontend Developer",
      status: "interview",
      date: "",
      link: "https://example.com",
      notes: "Prepare UI accessibility examples.",
    },
    {
      id: uid(),
      createdAt: now - 1000 * 60 * 60 * 24 * 5,
      company: "Atlassian",
      role: "Software Engineer Intern/Grad",
      status: "applied",
      date: "",
      link: "",
      notes: "Follow up next week.",
    },
    {
      id: uid(),
      createdAt: now - 1000 * 60 * 60 * 24 * 10,
      company: "Shopify",
      role: "Frontend Engineer (Junior)",
      status: "offer",
      date: "",
      link: "https://example.com",
      notes: "Negotiate start date and salary range.",
    },
  ];

  saveApps();
  renderStats();
  renderList();
}

function clearAll() {
  apps = [];
  saveApps();
  renderStats();
  renderList();
  resetFormToAddMode();
}

/* -----------------------------
  16) Main init (run once)
----------------------------- */
function init() {
  loadState();

  // Initial render
  renderStats();
  renderList();

  // Interactions: scroll spy, faq, mobile menu
  initScrollSpy();
  initFaq();
  initMobileMenu();

  // Preference: compact toggle
  if (els.compactToggle) {
    els.compactToggle.addEventListener("click", () => {
      prefs.compact = !prefs.compact;
      savePrefs();
      applyPrefsToUI();
    });
  }

  // Modal openers
  [els.openAbout1, els.openAbout2].forEach((btn) => {
    if (!btn) return;
    btn.addEventListener("click", () => openModal("about"));
  });

  if (els.openKeyboardHelp) {
    els.openKeyboardHelp.addEventListener("click", () => openModal("keyboard"));
  }

  // Modal closers
  els.closeModalBtn.addEventListener("click", closeModal);
  els.modalPrimary.addEventListener("click", closeModal);

  // Search/filter/sort re-render
  [els.search, els.filter, els.sort].forEach((control) => {
    control.addEventListener("input", () => renderList());
    control.addEventListener("change", () => renderList());
  });

  // Buttons
  els.seed.addEventListener("click", seedDemoData);
  els.clearAll.addEventListener("click", () => {
    // Simple confirm to avoid accidental wipe
    const ok = confirm("Clear all applications? This cannot be undone.");
    if (ok) clearAll();
  });

  // Reset form
  els.resetBtn.addEventListener("click", resetFormToAddMode);

  // Form submit
  els.form.addEventListener("submit", (e) => {
    e.preventDefault();

    const data = {
      company: safeText(els.company.value),
      role: safeText(els.role.value),
      status: els.status.value,
      date: els.date.value,
      link: safeText(els.link.value),
      notes: safeText(els.notes.value),
    };

    if (!validateForm(data)) {
      // focus the first field that has an error message showing
      const firstError = $('[data-error-for]:not(.hidden)');
      if (firstError) {
        const fieldName = firstError.getAttribute("data-error-for");
        const field = document.getElementById(fieldName);
        if (field) field.focus();
      }
      return;
    }

    upsertApp(data);
  });

  // Event delegation for Edit/Delete on list
  els.list.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;

    const action = btn.dataset.action;
    const id = btn.dataset.id;
    const found = apps.find((a) => a.id === id);
    if (!found) return;

    if (action === "edit") {
      fillFormForEdit(found);
      return;
    }

    if (action === "delete") {
      const ok = confirm(`Delete ${found.company} — ${found.role}?`);
      if (ok) deleteApp(id);
    }
  });
}

document.addEventListener("DOMContentLoaded", init);
