# What You Don't Know About CSS - v2 (2026)

## PART 1 - Intro (reuse from v1, slides 1-9)

1. **Title slide** - update date
2. **Agenda** - update with new sections
3. **Disclaimer** - keep as-is
4. **Who Am I** - keep as-is
5. **Why are we here** - keep as-is
6. **Stockholm Syndrome** - keep as-is
7. **Stockholm true** - keep as-is
8. **You know nothing** - keep as-is
9. **Show me the code** (align-content center) - keep as-is

---

## PART 2 - Bridge slides (NEW)

10. **"Version 2"** - This is the second version of this talk. The first one was presented in Milan, November 2024.

11. **Topics we covered in v1** - List:
    - Specificity deep dive (:where, :is, :has, :nth-child, @scope, @layer, Shadow DOM)
    - Color (OKLCH, color-mix, RCS, accessibility)
    - "JavaScript only" (View Transitions, Scroll-driven Animations, Anchor Positioning, interpolate-size, Top Layer, field-sizing, Container Queries)
    - Misc (display: contents, text-wrap, grid tricks, clamp)

12. **QR Code to v1** - Link + QR code to https://makhbeth.github.io/know-css/

13. **Celebrate :has()** - "Before going further, let's celebrate! :has() won the State of CSS 2025 award as the #1 most-used and most-loved feature."

---

## PART 3 - The var() space hack -> if() transition (NEW)

14. **"So it's 2026 now..."** - Transition slide

15. **"This is how my 2026 started"** - Show LinkedIn post screenshot.
    `--override-app-option-number-max-width: ;`
    - Space is a valid CSS value! A good old trick from when we were beautiful and young.
    - A 5-year-old (gosh) post by Lea Verou on the topic.
    - The var() space hack pattern:
      ```css
      --ON: initial;   /* triggers fallback */
      --OFF: ;         /* space = valid, fallback skipped */

      button {
        --is-raised: var(--OFF);
        border: var(--is-raised, 1px solid #ccc);
        background: var(--is-raised, linear-gradient(white, #eee)) #f0f0f0;
        box-shadow: var(--is-raised, 0 2px 4px rgba(0,0,0,.2));
      }
      .raised { --is-raised: var(--ON); }
      ```
    - Ref: https://lea.verou.me/blog/2020/10/the-var-space-hack-to-toggle-multiple-values-with-one-custom-property/

16. **"Yeah, but what if we have if() at home now?"** - Transition to CSS if()

17. **CSS `if()` function** - Inline conditionals in CSS. Chrome 137+.
    ```css
    .element {
      color: if(style(--theme: dark): white; else: black);
      padding: if(media(width >= 768px): 2rem; else: 1rem);
    }
    ```
    - Supports: `style()`, `media()`, `supports()` conditions
    - The end of the space hack era (eventually, when cross-browser)

---

## PART 4 - Must-have features (NEW)

### 18. Section slide: "Must-have"

### 19. `@starting-style` + `transition-behavior: allow-discrete`
- Animate from `display: none` - **Baseline Newly Available!**
- No more JS for enter/exit animations on dialogs, popovers, etc.
- Also kills the old `animation-fill-mode: forwards` hack where you'd use a keyframe animation
  just to fake an entry transition (animate opacity 0→1 and keep it with `forwards`).
  That was never a real transition:  it was a one-shot animation pretending to be one.
  Now we have the real thing.

**Slide 19a - The old hack (what we used to do):**
  ```css
  /* The animation-fill-mode hack */
  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  dialog[open] {
    animation: fade-in 0.3s ease forwards;
  }
  /* Problems:
     - Not a real transition (no reverse on close)
     - animation-fill-mode: forwards keeps the end state,
       but it's fragile and fights with other styles
     - No way to animate display: none → block */
  ```

**Slide 19b - The new way:**
  ```css
  dialog {
    opacity: 0;
    transition:
      opacity 0.3s,
      display 0.3s allow-discrete;
  }
  dialog[open] {
    opacity: 1;
    @starting-style {
      opacity: 0;
    }
  }
  ```
  - Real transitions, real reverse on close, real `display: none` support.

**Slide 19c - Real production code (tooltip popover):**
  ```css
  .tooltip {
    position: fixed;
    margin: 0;
    border: 0;
    padding: 0;
    background: transparent;
    overflow: visible;
    pointer-events: none;
    opacity: 0;
    transition:
      opacity var(--transition-speed-fast) var(--ease-in),
      display var(--transition-speed-fast) var(--ease-default) allow-discrete,
      overlay var(--transition-speed-fast) var(--ease-default) allow-discrete;
  }

  .tooltip:popover-open {
    opacity: 1;
    pointer-events: auto;

    @starting-style {
      opacity: 0;
    }
  }
  ```
  - Note `overlay` transition: keeps the element in the top layer during the exit animation
    (without it, the popover disappears instantly when closing because it leaves the top layer).
  - This is real CSS I shipped in production. No JS animation library needed.

### 20. Dialog & Popover upgrades (the top layer miracle)

**Slide 20a - The top layer: no more portals, no more z-index wars**
- Remember React portals? `createPortal(child, document.body)` just to escape
  a `overflow: hidden` or a stacking context? That's a framework workaround
  for a platform problem. The platform fixed it.
- The **top layer** is a browser-native layer that sits above everything in the document.
  No z-index value can beat it. No stacking context can trap it.
- `dialog.showModal()` and `[popover]` elements live in the top layer automatically.
- Multiple top-layer elements stack by open order. Last opened = on top. No z-index needed.
- Example to stress:
  ```css
  .overlay {
    position: fixed;
    z-index: 999999999; /* cute */
  }
  ```
  ```html
  <!-- This dialog will ALWAYS render above .overlay -->
  <dialog>I win. No z-index needed.</dialog>
  ```
- The portal pattern was: "I can't escape my parent's stacking context, so I'll
  teleport my DOM node to `<body>`." The top layer is: "The browser gives you
  a layer that's above the entire document. Just use it."
- **No more portals. No more z-index: 999999. No more DOM teleportation hacks.**

**Slide 20b - closedby, popover="hint", :open**
- **`closedby` attribute** on `<dialog>` - Chrome 134, Firefox 141
  ```html
  <dialog closedby="any">         <!-- backdrop click OR Esc -->
  <dialog closedby="closerequest"> <!-- Esc only -->
  <dialog closedby="none">         <!-- JS only -->
  ```
- **`popover="hint"`** - Tooltip-specific popovers (Chrome 133). A hint popover won't close an auto popover (your dropdown menu stays open when a tooltip appears!)
- **`:open` pseudo-class** - Style open dialogs/details/selects. Interop 2026.

### 21. `::details-content`
- Style and animate `<details>` expandable content. **Baseline Newly Available (Sep 2025).**
  ```css
  ::details-content {
    transition: height 0.3s, content-visibility 0.3s allow-discrete;
  }
  details[open]::details-content {
    height: auto;
  }
  ```

### 22. Customizable `<select>` (`appearance: base-select`)
- Full CSS control over dropdowns. Chrome 135+.
- New pseudo-elements: `::picker(select)`, `::picker-icon`, `::checkmark`
  ```css
  select, ::picker(select) {
    appearance: base-select;
  }
  ```

### 23. Typed `attr()`
- `attr()` can now return numbers, colors, lengths - not just strings! Chrome 133+.
  ```css
  .grid {
    grid-template-columns: repeat(attr(data-columns type(<number>), 3), 1fr);
  }
  div {
    background: attr(data-bg type(<color>), black);
  }
  ```
- Joke: CSS has types now. Meanwhile JavaScript... `"2" + 2 === "22"`

### 24. CSS Carousels (`::scroll-button()`, `::scroll-marker()`)
- Zero-JS accessible carousels. Chrome 135+.
- Tongue-in-cheek: "perfect for content nobody wants to see anyway"
- But genuinely useful for image galleries, testimonials, etc.

---

## PART 5 - Strong additions (NEW)

### 25. Section slide: "Strong additions"

### 26. `text-box-trim` / `text-box`
- Remove unwanted vertical whitespace above/below text. Chrome 133+.
  ```css
  h1 {
    text-box: trim-both cap alphabetic;
  }
  ```
- Finally pixel-perfect vertical alignment without magic numbers.

### 27. `sibling-count()` / `sibling-index()`
- Know how many siblings and your position. Part of Interop 2026.
  ```css
  li {
    animation-delay: calc(sibling-index() * 0.1s);
    opacity: calc(1 - sibling-index() / sibling-count());
  }
  ```
- Dynamic staggered animations, proportional sizing - no JS counters needed.

### 28. `contrast-color()`
- Auto-pick readable text color against any background.
  ```css
  div {
    background: var(--brand-color);
    color: contrast-color(var(--brand-color));
  }
  ```
- Callback to v1: remember the manual `clamp()` + `oklch()` hack for contrast? This is the native solution!

### 29. CSS Trigonometry functions
- `sin()`, `cos()`, `tan()`, `atan2()` - **Baseline Widely Available** (since 2023, 3 years!).
  ```css
  .dot {
    --angle: calc(var(--i) * 360deg / 12);
    translate: calc(cos(var(--angle)) * 20vmin)
               calc(sin(var(--angle)) * 20vmin * -1);
  }
  ```
- Clock faces, circular menus, wave animations - pure CSS.
- Worth mentioning because many still don't know they exist.

### 30. `corner-shape`
- Beyond border-radius: `scoop`, `bevel`, `notch`, `squircle`. Chrome 139+.
  ```css
  .card {
    border-radius: 2rem;
    corner-shape: squircle;
  }
  ```

### 31. Scroll-State Container Queries
- Style sticky headers when stuck, snapped elements, scrollable overflow. Chrome 133+.
  ```css
  .sticky-header {
    container-type: scroll-state;
    position: sticky;
    top: 0;
  }
  .sticky-header > nav {
    @container scroll-state(stuck: top) {
      background: var(--accent);
      box-shadow: 0 2px 8px rgba(0,0,0,.2);
    }
  }
  ```

---

## PART 6 - Worth a mention (NEW)

### 32. Section slide: "Worth a mention"

### 33. Quick-fire round:
- **`@scope`** - Now Baseline Newly Available! (Firefox 146, Dec 2025). Was experimental in v1.
- **Anchor Positioning** - Cross-browser interop via Interop 2025. Was Chromium-only in v1.
- **Masonry Layout** - `display: masonry`. Part of Interop 2026.
- **`reading-flow`** - Control keyboard/screen-reader nav order in flex/grid. Accessibility win.
- **Gap Decorations** - Style grid/flex gaps with `column-rule`/`row-rule`. Chrome 147.
- **CSS `@function` / `@mixin`** - W3C First Public Working Draft (May 2025). The future. Experimental in Chrome Canary.

---

## PART 7 - Closing

34. **Thanks + Have fun!** - keep from v1
35. **Bibliography / QR code** - update with new references

---

## TODO: Examples to build

Each slide needs a live interactive example in the presentation. Here's what's missing:

- [ ] **if()** - Live toggle between themes or layouts using `if(style(...))`. Show the before (space hack) and after (if()) side by side.
- [ ] **@starting-style** - Live dialog/popover that fades in and out. Show the old `animation-fill-mode` hack next to the new approach.
- [ ] **Top layer** - Demo with a `position: fixed; z-index: 999999999` element + a dialog that opens above it effortlessly. Kill the portal myth. Then show `closedby` variants and `popover="hint"` tooltip that doesn't close a dropdown.
- [ ] **::details-content** - Animated `<details>` expand/collapse with smooth height transition.
- [ ] **Customizable `<select>`** - Styled dropdown with custom options, icons, colors.
- [ ] **Typed `attr()`** - Grid that reads column count from `data-columns`. Color from `data-bg`.
- [ ] **CSS Carousels** - Minimal scroll-marker + scroll-button carousel.
- [ ] **text-box-trim** - Side-by-side heading with and without trim. Show the whitespace difference.
- [ ] **sibling-count() / sibling-index()** - Staggered animation on a list. Items fade in one by one, no JS.
- [ ] **contrast-color()** - Color grid where text auto-adjusts. Callback to v1's manual clamp() approach.
- [ ] **Trig functions** - Circular menu or clock layout, pure CSS.
- [ ] **corner-shape** - Card gallery with squircle, scoop, bevel, notch side by side.
- [ ] **Scroll-state queries** - Sticky header that changes style when stuck. Bonus: snapped state.
- [ ] **var() space hack** - Interactive toggle showing the ON/OFF pattern.

---

## Key references
- CSS Wrapped 2025: https://chrome.dev/css-wrapped-2025/
- State of CSS 2025: https://2025.stateofcss.com/
- Interop 2026: https://web.dev/blog/interop-2026
- Lea Verou var() space hack: https://lea.verou.me/blog/2020/10/the-var-space-hack-to-toggle-multiple-values-with-one-custom-property/
- CSS if(): https://developer.chrome.com/blog/if-article
- nerdy.dev 4 CSS features 2026: https://nerdy.dev/4-css-features-every-front-end-developer-should-know-in-2026
- CSS Mixins: https://www.w3.org/TR/css-mixins-1/
