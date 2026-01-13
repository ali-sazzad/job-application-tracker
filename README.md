# Trackly — Job Application Tracker (Vanilla JS + Tailwind)

Trackly is a premium, accessible job application tracker that helps you manage your job pipeline (Applied → Interview → Offer) with fast client-side search/filter/sort and automatic persistence using `localStorage`.

This is a **frontend-only** project designed to demonstrate real-world fundamentals for junior web developer / software engineer roles.

---

## ✨ Features

### Core
- **Add / Edit / Delete** job applications (CRUD)
- **Pipeline summary** stats (Total, Applied, Interview, Offer)
- **Search + Filter + Sort** (client-side, instant)
- **Persistent storage** via `localStorage` (data survives refresh)

### UX & Micro-interactions
- Sticky navbar with **scroll-spy active section highlight**
- Accessible **modal dialog** (ESC close, focus trap, focus return)
- Keyboard-friendly **FAQ accordion** with smooth expand/collapse
- Compact/Comfort UI preference toggle (saved to `localStorage`)
- Clear empty states and helpful messages (no “dead UI”)

### Accessibility (A11y)
- Skip-to-content link
- Semantic HTML structure (header/nav/main/sections/footer)
- Focus-visible rings for keyboard users
- ARIA used only when needed (`aria-modal`, `aria-expanded`, live region for form status)

### Performance
- No frameworks, no heavy libraries
- Efficient scroll-spy using `IntersectionObserver`
- Minimal DOM work: render list from state only when needed
- Respects `prefers-reduced-motion`

---

## 🧱 Tech Stack
- HTML (semantic layout)
- Tailwind CSS (utility-first styling)
- Small custom CSS file for global polish (`styles.css`)
- Vanilla JavaScript (clean functions + event delegation)
- Browser `localStorage` for persistence

---

## 🚀 How to Run

### Option A: Open directly
1. Download/clone this project
2. Open `index.html` in your browser

### Option B: Use VS Code Live Server (recommended)
1. Install the **Live Server** extension in VS Code
2. Right-click `index.html` → **Open with Live Server**

---

## 🧠 What I Learned (and proved with code)
- Building accessible UI patterns (modal focus trap, keyboard navigation, aria-expanded)
- Managing state in vanilla JS (CRUD + rendering)
- Client-side searching/filtering/sorting without frameworks
- Persisting data safely with localStorage (and recovering from corrupted storage)
- Writing maintainable UI code with small helper functions and event delegation
- Performance-friendly interactions (IntersectionObserver, minimal reflows)

---

## 🧩 Project Structure

trackly/
<br>index.html
<br>styles.css
<br>script.js
<br>assets/
<br>README.md


---

## ✅ Recruiter Notes (What this project demonstrates)
- Strong **frontend fundamentals**: DOM, events, rendering, state, and persistence
- **Accessibility-first mindset**: keyboard navigation, focus management, semantic HTML
- Clean UI engineering: predictable states (empty/error/edit mode) and helpful feedback
- Real-world UX patterns: scroll-spy navigation, modal, accordion, form validation
- Maintainable JS: small functions, readable logic, event delegation (no spaghetti listeners)
- Performance awareness: minimal effects, efficient observers, reduced-motion support

---

## 📌 Next Improvements (optional)
- Replace `confirm()` prompts with a custom inline confirmation UI
- Add toast notifications (e.g., “Saved”, “Deleted”)
- Export pipeline to CSV
- Add tag labels (Remote / Hybrid / On-site)
- Add “Follow-up date” reminders (still frontend-only)

---

## License
This project is for portfolio/demo use.
