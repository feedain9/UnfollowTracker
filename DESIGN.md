---
name: UnfollowTracker
description: An ivory website with violet actions and coral accents, alongside a themeable browser panel.
colors:
  site-bg: "#fffcfa"
  site-text: "#292332"
  site-muted: "#665e6d"
  site-quiet: "#716776"
  site-line: "#e4d9e2"
  site-coral: "#b44542"
  site-button-ink: "#ffffff"
  site-surface: "#ffffff"
  site-purple: "#8241a5"
  site-purple-hover: "#6d318f"
  site-lavender: "#f4edf8"
  site-peach: "#fff1e9"
  site-scrollbar: "#b7a5bb"
  site-reciprocal: "#427652"
  ring-tip: "#e64955"
  ring-line: "#c135841a"
  ring-glow: "#833ab414"
  site-hero-glow: "#f777371c"
  site-browser-shadow: "#49325255"
  site-menu-shadow: "#4932521f"
  demo-text: "#fff8f4"
  demo-coral: "#ffb19c"
  demo-button-ink: "#181114"
  ring-peach: "#f77737"
  ring-coral: "#c13584"
  ring-purple: "#833ab4"
  panel-bg: "#0c0c0e"
  panel-surface: "#151518"
  panel-raised: "#1e1e22"
  panel-text: "#faf7f4"
  panel-muted: "#a8a5ab"
  panel-line: "#303035"
  panel-accent: "#ffad98"
  panel-button-ink: "#111113"
  panel-online: "#74cda7"
  panel-light-bg: "#fcfbfa"
  panel-light-surface: "#f2f0ee"
  panel-light-raised: "#e9e6e3"
  panel-light-text: "#1a191c"
  panel-light-muted: "#615c65"
  panel-light-line: "#d4cfd4"
  panel-light-accent: "#923822"
  panel-light-button: "#222024"
  panel-light-button-text: "#fff"
  selection-rust: "#a44133"
  panel-scrim: "#0009"
  policy-muted: "#bcb8bd"
  site-outline: "#997da6"
  site-outline-hover: "#f4edf8"
  site-outline-hover-line: "#8241a5"
  site-trust: "#665e6d"
  site-feature-line: "#e4d9e2"
  site-feature-copy: "#665e6d"
  site-feature-note: "#b44542"
  site-step-line: "#997da6"
  site-faq-icon: "#8241a5"
  site-faq-copy: "#665e6d"
  site-closing-line: "#eacabd"
  site-closing-glow: "#fbe6dd"
  site-closing-copy: "#665e6d"
  site-closing-note: "#b44542"
  site-article-copy: "#665e6d"
  site-article-line: "#e4d9e2"
  site-article-heading: "#292332"
  site-menu-line: "#e4d9e2"
typography:
  display:
    fontFamily: "Manrope, sans-serif"
    fontSize: "clamp(45px, 5.2vw, 72px)"
    fontWeight: 600
    lineHeight: 1.07
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Manrope, sans-serif"
    fontSize: "clamp(30px, 3.4vw, 46px)"
    fontWeight: 600
    lineHeight: 1.12
    letterSpacing: "-0.035em"
  feature-title:
    fontFamily: "Manrope, sans-serif"
    fontSize: "32px"
    fontWeight: 550
    lineHeight: 1.15
    letterSpacing: "-0.03em"
  body:
    fontFamily: "Manrope, sans-serif"
    fontSize: "16px"
    lineHeight: 1.65
  site-copy:
    fontFamily: "Manrope, sans-serif"
    fontSize: "13px"
    lineHeight: 1.85
  site-nav:
    fontFamily: "Manrope, sans-serif"
    fontSize: "12px"
  panel-body:
    fontFamily: "Manrope, sans-serif"
    fontSize: "13px"
    lineHeight: 1.6
  panel-stat:
    fontFamily: "Manrope, sans-serif"
    fontSize: "26px"
    fontWeight: 700
    lineHeight: 1.6
    letterSpacing: "-0.04em"
  panel-label:
    fontFamily: "Manrope, sans-serif"
    fontSize: "10px"
    lineHeight: 1.5
  panel-name:
    fontFamily: "Manrope, sans-serif"
    fontSize: "12px"
    fontWeight: 650
    lineHeight: 1.6
  compact-meta:
    fontFamily: "Manrope, sans-serif"
    fontSize: "11px"
  brand-small:
    fontFamily: "Manrope, sans-serif"
    fontSize: "14px"
  article-copy:
    fontFamily: "Manrope, sans-serif"
    fontSize: "15px"
  intro-copy:
    fontFamily: "Manrope, sans-serif"
    fontSize: "17px"
  step-title:
    fontFamily: "Manrope, sans-serif"
    fontSize: "18px"
  dialog-title:
    fontFamily: "Manrope, sans-serif"
    fontSize: "19px"
  policy-lead:
    fontFamily: "Manrope, sans-serif"
    fontSize: "20px"
  policy-section:
    fontFamily: "Manrope, sans-serif"
    fontSize: "22px"
  policy-title:
    fontFamily: "Manrope, sans-serif"
    fontSize: "36px"
  panel-connect-title:
    fontFamily: "Manrope, sans-serif"
    fontSize: "25px"
rounded:
  progress-track: "3px"
  profile-focus: "4px"
  compact: "6px"
  field: "8px"
  control: "9px"
  panel-card: "12px"
  site-frame: "14px"
  circle: "50%"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  panel-gutter: "20px"
  lg: "24px"
  xl: "28px"
  xxl: "32px"
components:
  button-site-primary:
    backgroundColor: "{colors.site-purple}"
    textColor: "{colors.site-button-ink}"
    rounded: "{rounded.control}"
    padding: "13px 24px"
  button-site-primary-hover:
    backgroundColor: "{colors.site-purple-hover}"
  button-site-outline:
    backgroundColor: "transparent"
    textColor: "{colors.site-text}"
    rounded: "{rounded.control}"
    padding: "13px 24px"
  button-panel-primary:
    backgroundColor: "{colors.panel-text}"
    textColor: "{colors.panel-button-ink}"
    rounded: "{rounded.control}"
    padding: "12px 16px"
    width: "100%"
  button-panel-primary-light:
    backgroundColor: "{colors.panel-light-button}"
    textColor: "{colors.panel-light-button-text}"
  button-panel-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.panel-text}"
    rounded: "{rounded.control}"
    padding: "6px 10px"
  input-panel-search:
    backgroundColor: "{colors.panel-surface}"
    textColor: "{colors.panel-text}"
    rounded: "{rounded.field}"
    padding: "10px 12px"
    width: "100%"
  navigation-site:
    typography: "{typography.site-nav}"
  card-panel-stat:
    backgroundColor: "{colors.panel-surface}"
    rounded: "{rounded.panel-card}"
    padding: "16px 4px 15px"
  row-panel-result:
    padding: "12px 0"
    typography: "{typography.panel-name}"
  dialog-panel-confirmation:
    backgroundColor: "{colors.panel-surface}"
    textColor: "{colors.panel-text}"
    rounded: "{rounded.panel-card}"
    padding: "24px"
    width: "calc(100% - 32px)"
  disclosure-site-faq:
    rounded: "{rounded.control}"
    padding: "20px 23px"
---

# Design System: UnfollowTracker

## Overview

**Creative North Star: "Clarity, alongside you"**

UnfollowTracker pairs an ivory website with violet actions, restrained coral accents, and its existing open orange-to-magenta-to-purple ring. The browser panel retains its independent dark and light themes. Manrope carries both the spacious website and the compact browser panel. The result is quiet and practical: a clear result, a visible next action, and enough separation to read names and status without decoration competing with them. The North Star is descriptive shorthand for the built artifacts, not a newly approved identity or design comp.

The same identity supports two densities. The website gives the product demonstrations room; the extension fits working controls into a narrow browser panel. A light panel theme changes the neutral and accent roles while preserving structure. The reference-led page composition and each surface's mode belong in [the surface brief](.impeccable/surfaces/site-index-html.md), not in the global identity.

**Key Characteristics:**
- An ivory marketing canvas with charcoal text, pale peach and lavender surfaces, and a separate light/dark panel palette.
- A distinctive open ring; simple stroke SVGs for functional icons.
- One type family, tight large headlines, tabular result numbers, and calm body copy.
- Tonal surfaces, thin boundaries, moderate corners, and restrained responsive feedback.
- Explicit status, readable action labels, and visible disclosure of synthetic demonstrations.

Recorded from `site/assets/site.css`, `site/assets/site.js`, `scripts/build-site.js`, `src/popup.html`, `src/styles/popup.css`, `src/scripts/popup.js`, `src/scripts/i18n.js`, and the site content on 5 October 2026. Visual references: [desktop](.impeccable/review/desktop.png) (1440 × 6163), [desktop hero](.impeccable/review/desktop-hero.png) (1440 × 1000), [mobile](.impeccable/review/mobile.png) (390 × 7578), [French dark panel](.impeccable/review/panel-results-fr.png) and [English light panel](.impeccable/review/panel-light-en.png) (both 360 × 800). The finish review accepted the prepared visual artifacts. Native Brave panel placement and the actual deployment configuration remain release prerequisites; this document does not claim deployment or new live-browser verification.

Visual refinement on 6 October 2026: the owner requested a lighter landing page closer to the logo. Only website color roles and the browser theme color changed; layout, typography, content, extension themes and interactions remain intact. The surface brief and sidecar carry the same color direction.

## Colors

Warm ivory and charcoal make the website bright and readable. Violet anchors the heading and main actions; coral provides smaller emphasis. The product demonstrations retain the real panel’s dark palette within clearly bounded frames.

### Primary

- **Site purple** highlights the second hero line and fills primary website actions; a deeper purple supplies hover feedback.
- **Site coral** highlights useful icons, textual links, focus and comparison results. Pale peach and lavender carry section backgrounds without lowering text contrast.
- **Panel coral** marks the non-reciprocal count, active scan progress, and focus. **Light panel rust** fills those same roles on pale surfaces.
- Website primary buttons use white text on violet. The extension and its dark demonstrations retain neutral primary buttons and coral hover feedback.

### Secondary

- **Ring orange, magenta, purple and coral tip** echo the supplied raster identity. The website uses a broken conic gradient with a small detached tip and an inset matching its surface. Purple also connects website actions to the logo; the extension uses its supplied raster logo unchanged.

### Tertiary

- **Panel online mint** is a connection indicator, always accompanied by text; it is not the general success-action palette.

### Neutral

- **Site background, text, muted, quiet, and line** separate the canvas, main reading, supporting copy, annotation, and boundaries.
- **Panel background, surface, and raised** establish the canvas, stat cards/search/dialog, and hover/avatar-fallback layers. **Panel text, muted, and line** remain distinct in both themes.

**The Accent Has a Job Rule.** On the website, use violet for primary actions and hero emphasis, and coral for supporting emphasis, links and focus. Keep each accent readable against ivory and tinted surfaces. Product illustrations use their own dark theme roles.

**The Theme Roles Rule.** Switch the complete panel palette together. Preserve the muted/text/border hierarchy and use the darker rust accent in the light theme.

The YAML records reused source values. Demo-only scenery colors remain scoped to the product illustrations. Sidecar tonal ramps are synthesized previews, not additional production tokens. The frontmatter also records live selection, dialog, policy, article, FAQ, outline-button and closing-section roles previously omitted from the token layer. Scenery-only colors remain scoped exceptions.

## Typography

**Display Font:** Manrope, with sans-serif fallback.
**Body Font:** Manrope, with the same fallback.
**Label/Mono Font:** No separate mono face; result counts use tabular numerals.

The locally hosted variable font supplies weights from 400 to 800 with `font-display: swap`. Large text relies on moderate weight and negative tracking, rather than extreme boldness. The site balances headings with CSS; the panel uses compact labels, short lines, and a stronger numerical hierarchy.

### Hierarchy

- **Display and headline:** the normative clamps and tracking are in the frontmatter. The hero becomes 59px at the tablet breakpoint, 44px on mobile, and 39px on very narrow screens. Mobile hero line height is 1.12; mobile section headings are 33px.
- **Feature titles:** the 32px title role steps down to 29px and 27px as columns narrow, then returns to 29px when features stack.
- **Body:** the website base is supplemented by a 17px hero introduction with 1.8 line height and a 650px maximum width. Most feature copy uses the smaller, spacious `site-copy` role. Article reading uses 15px/1.9, falling to 14px on mobile, within a 780px container.
- **Panel:** names and section headings sit above smaller usernames, status, timestamp, and helper text. Numbers use the `panel-stat` role and `font-variant-numeric: tabular-nums`. Labels may wrap; names truncate only inside constrained result rows.
- **Controls:** website buttons use 13px/700; panel primary buttons inherit the 13px base at weight 650. Compact status and secondary panel controls use the compact-meta role. Website actions and disclosure copy retain a readable size on mobile; compact illustration labels are a separate role. Logo text uses weight 750 in both surfaces.

**The Reading Before Decoration Rule.** Preserve the name, handle, result, and next action hierarchy. The miniature browser illustrations are reduced representations, not a type scale for new working interfaces. Live website reassurance, publication status, navigation, help links and FAQ text must not be shrunk to the miniature scale: they stay at least 12px (11px for compact bylines and illustration disclosure), with wrapping when space narrows. Interactive browser-demo tab labels use at least 11px, and its scan/download actions use at least 12px. The real panel unfollow action is never reduced below 11px by its narrow breakpoint. Component-specific responsive heading sizes remain documented in their stylesheet and have value-and-file-scoped detector exceptions; they are not global type steps.

## Layout

The website uses a centered container capped at 1120px with 32px side gutters. At 850px and below, gutters become 20px; at 360px and below, they become 16px. Its header is 100px high on desktop and 82px below the tablet breakpoint. Repeated section spacing is 132px on desktop and 82px on mobile. These large spaces belong to the website density, not to the working panel.

The browser demonstration separates a flexible workspace from a persistent 320px panel. That panel narrows to 300px below 1100px and 290px below 850px. At 600px and below, the demonstration stacks a 150px workspace above the full-width panel. This responsive illustration does not claim that the extension runs on mobile browsers.

Features pair copy and demonstration in equal columns, while privacy and FAQ/guide areas use unequal columns. At 600px they become single-column reading sequences. The three setup steps also become a vertical list. Article pages retain the same navigation and colors within their narrower reading measure.

The real panel has a 280px minimum body width, a 600px content cap, and a column filling at least `100dvh`. Its main area grows to keep the footer below the working content. It uses 20px side gutters, an 18px main gap, an 8px stat-grid gap, and three equal stat columns. At 315px and below, gutters become 14px and the logo/result controls tighten. Longer lists scroll through the document; there is no fixed popup-height constraint.

## Elevation & Depth

Depth comes primarily from tonal changes and thin boundaries. The panel's cards, fields, and dialog have no drop shadows; the modal alone dims its surroundings. The website uses soft shadows where an object is visibly placed above another object, plus low-opacity coral light and rings in its atmospheric artwork. These effects are local to their compositions.

### Shadow Vocabulary

- **Browser demonstration:** `0 35px 80px -40px #49325255`, a wide shadow under the large browser frame.
- **Overlapping miniature window:** `0 16px 45px #09040855`, reinforcing the front window in the persistence illustration.
- **Open mobile navigation:** `0 15px 40px #4932521f`, separating the expanded menu from page content.
- **Modal backdrop:** `#0009`, with a bordered panel surface and no panel shadow.

**The Tonal First Rule.** Use surface color and a one-pixel boundary for routine working containers. Reserve shadow for the website's visibly layered objects and open navigation.

## Shapes

Controls use modest rounded rectangles: the shared control radius is distinct from the smaller field and compact-action corners. Panel stat cards and dialogs use the panel-card radius; full website demonstration and feature frames use the site-frame radius. Frames clip their contents. Thin borders remain visible rather than relying on shadow alone.

Circles identify avatars, connection dots, and the ring. The ring remains open and directional, with a detached tip; it is not a closed progress meter. Functional icons are inline stroke SVGs, normally 18px in the panel and 17–20px in website controls. Decorative icons are hidden from assistive technology. There is no reusable pill/chip system in the current build.

## Components

### Buttons

Direct and readable: violet website actions and neutral panel actions. Website actions have a 50px minimum height; the compact header variant has a 39px minimum. Panel primary actions fill their available width with a 46px minimum height. Secondary panel actions have a 32px minimum and a thin border. Compact row actions use the smaller radius and fit the narrow list.

Hover styling is restricted to devices that report hover. Website primary controls deepen to violet; panel primary controls turn coral. Secondary panel and icon buttons take the raised surface. Presses scale enabled main controls to 0.98. Website transitions use 180ms with `cubic-bezier(0.16, 1, 0.3, 1)`; panel controls use 160ms ease-out. Disabled panel buttons have half opacity and no active feedback. Site demo buttons disable during replay and show progress text.

### Inputs / Fields

The search field uses a surface fill, one-pixel border, rounded field corners, and a visible localized accessible label. The placeholder explains name-or-username search. Caret and keyboard focus use the panel accent. Filtering restarts the visible list at 50 results; “Show more” adds 50. Empty scan results and no search matches have distinct text states.

### Navigation

The site retains the ring and wordmark, four section links, a real locale link, and the current publication action. Below 850px the section links move into a bordered dropdown controlled by a button with `aria-expanded` and `aria-controls`. Escape closes the open menu and restores focus to that button; following a link also closes it. The extra header CTA is hidden below 600px while the hero action remains.

The extension exposes language and theme controls in the header. It reads saved local preferences, otherwise selecting French for a French browser UI and English for other languages; the default theme is dark. Locale changes update the document language, labels, status, result text, number/date formatting, and the bundled privacy link.

### Stat Cards and Result Rows

Three aligned counters precede the primary action. The non-reciprocal counter alone receives a 7% accent surface mix and a 35% accent border mix. Results are separated by one-pixel rules rather than individual elevated cards. Each row pairs a 32px circular avatar or initials fallback with a profile link and one labelled unfollow action. Failed images leave initials visible. Long display names truncate; the status area can wrap anywhere.

### Connection, Scan, and Confirmation States

- **No usable Instagram connection:** show the connection explanation and an explicit open, return, or reload button as appropriate. The scan action stays disabled. Opening Instagram requires that button; no automatic scan is triggered.
- **Ready:** show connection text and enable the scan action. Before a first complete result, counters show dashes and a short disclosure explains session reads and local storage.
- **Scanning:** replace the action icon with a spinner, disable conflicting actions, and show a three-pixel progress line plus the current phase/count or retry message. The result list is hidden while scanning. The dot pulses at 1.4 seconds, the spinner rotates at 0.8 seconds, and progress transforms transition over 180ms.
- **Complete or cached:** render the latest complete snapshot and its timestamp; a refresh action replaces the first-scan label. Closing the Instagram tab disables new network actions but can leave cached results visible. Account changes clear mismatched results and close pending confirmation.
- **Interrupted or unavailable:** explain the condition in the status text; do not style a partial scan as a complete result. The prior complete snapshot is retained by the workflow.
- **Unfollow or saved-scan deletion:** use the native modal dialog with labelled title/body, explicit confirm text, and Cancel receiving initial focus. Each unfollow addresses one account. Buttons remain disabled while the confirmed operation runs.

### Browser Demonstration and FAQ

The synthetic browser tabs use `tablist`, `tab`, and `tabpanel` semantics, roving tab focus, and Arrow/Home/End navigation. Switching the workspace leaves the panel illustration in place. Scan replay updates the status and number using fictional data; JSON export includes an explicit demonstration notice. Display-only unfollow labels inside the website illustration are not action buttons.

FAQ entries use native `details`/`summary`. Opening an entry colors the summary coral and rotates the plus SVG by 45 degrees. The site includes a skip link, and icon-only export has an accessible text label. Website keyboard focus is a two-pixel coral outline with a five-pixel offset; panel focus uses its theme accent with a four-pixel offset. Connection/progress/export announcements use status regions. Both surfaces disable animation and transitions for reduced motion; the site also disables smooth scrolling and replay delays.

### Localized Pages and Prelaunch Content

French and English website pages are generated as complete HTML under `/fr/` and `/en/`: content and metadata are present before JavaScript executes. This is build-time pre-rendering, not a runtime translation dependency. Equivalent route links, `lang`, canonical, alternate-language, and social metadata are emitted per locale. JavaScript adds menu, tab, replay, and sample-export interactions. The extension translates from its packaged local catalogue.

With no store URL configured, actions lead to the installation section and explain that publication is forthcoming. The preview is `noindex`; the production build checks required publisher/support/address/hosting fields. The configurable `unfollow.yadulink.com` target is not evidence of a provisioned or deployed site. Public support and publisher details now reuse Yadulink as requested; Azure France Central is the prepared hosting target, with deployment configuration still to verify.

Privacy is explained in nearby copy and complete localized pages: comparison and complete snapshots stay in the browser; explicit requests still go to Instagram and profile images to Instagram/Meta hosts. The website uses local fonts and imagery, no analytics or login flow, and explicitly fictional sample accounts. Keep image provenance with the assets in `site/assets/provenance.json`; review captures are evidence, not product photography. Product-specific behavior and release obligations are owned by [PRODUCT.md](PRODUCT.md).

## Do's and Don'ts

### Do:

- **Do** preserve the open ring, Manrope, warm neutrals, and defined violet/coral roles. Keep the website light and product demonstrations scoped to their own theme.
- **Do** keep names, handles, result counts, status, and actions visibly distinct in narrow panels.
- **Do** retain keyboard focus, native disclosure/dialog semantics, localized accessible labels, and reduced-motion behavior.
- **Do** show whether data is a real complete snapshot or a fictional demonstration, alongside the relevant interface.
- **Do** keep all public claims and installation actions synchronized with the available product and publication configuration.

### Don't:

- **Don't** turn miniature demonstration labels into the default typography for working controls or reading text.
- **Don't** fill every container with saturated brand color or let the demonstration’s dark palette become the website canvas.
- **Don't** communicate connection, progress, or result meaning with color alone.
- **Don't** replace per-account confirmation with an automatic or bulk unfollow control.
- **Don't** imply historical unfollow detection, mobile extension support, guaranteed availability, or an existing store listing.

Not canonized: illustration-only scenery colors, reduced miniature text, synthetic account/count examples, isolated atmospheric geometry, and unused CSS variables are not shared design tokens. Native Brave placement, complete assistive-technology behavior, and every live Instagram failure state were not reverified during this documentation pass.
