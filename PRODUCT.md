# UnfollowTracker

## Product truth
Free desktop browser extension comparing the current Instagram following and follower lists. It identifies accounts that do not follow the signed-in account back. It does not identify historical unfollow events. Complete snapshots are stored locally per Instagram account; partial scans never overwrite them. Scans are explicit, use the existing Instagram session and respect bounded backoff. A user can export results and individually confirm an unfollow. From 1.2.1, store installs show a one-time, dismissible invitation to leave a Chrome Web Store review after three complete scans, without any reward. No bulk automation, accounts or paid plans. Since version 1.2.0, store installs send anonymous usage statistics (value ranges only, never Instagram identifiers, usernames or lists) to the publisher's self-hosted Plausible; users can turn them off in the panel. The website measures its audience with the same cookieless Plausible. No other developer-operated data service.

## Confirmed brief — updated 7 October 2026
The owner authorized hosting, store submission and automatic daily article publication on 5 October. The persistent browser side panel replaces the transient popup. When no Instagram tab exists, offer to open one, never open or scan automatically. French and English for the extension and marketing site. Product name: UnfollowTracker. The site is live on unfollow.yadulink.com; version 1.1.0 is publicly installable from the Chrome Web Store as of 7 October 2026.

## Measurement — decided 24 October 2026
The owner asked to see site traffic, installs, usage and uninstalls. Chosen: anonymous Plausible statistics only (no Instagram account identity, no install identifier), an opt-out toggle in the panel, a welcome page opened on install and a one-click uninstall survey. Collecting Instagram usernames would require a new owner decision, explicit consent and new store declarations. Details: `docs/analytics/MEASUREMENT.md`.

## Audience and success
People who use Instagram on desktop and want a clear, practical way to compare reciprocal follows. Explain the exact result within seconds, demonstrate the panel, earn trust through visible behavior and clear local-data handling, and lead to a free installation when the store listing exists.

## Visual authority
The existing extension's near-black / off-white palette and coral-to-purple ring are established identity. The user pinned https://www.weespy.now/ for the spacious composition, large centered promise, demonstrations beside benefits, generous pacing, FAQ and closing call to action. They subsequently requested a lighter landing page: the deployed site uses an ivory canvas, violet actions and coral accents from the logo, with dark product demonstrations. Follow DESIGN.md. No borrowed testimonials, invented metrics, proprietary graphics or unrelated features.

## Constraints and publication
Chromium side-panel API; minimum Chrome 116. Brave supported in principle via its Chromium base, final live browser acceptance remains a release check. No mobile browser extension claim. Instagram may limit requests or change undocumented endpoints; no promise of guaranteed availability, completeness when Instagram hides data, or zero account risk. Publisher/support reuse Yadulink: AVICLICK (Yadulink), support@yadulink.com, 40 rue Alexandre Dumas, 75011 Paris, France. The owner selected Cloudflare Pages for this site, which is live with HTTPS. The official install URL is https://chromewebstore.google.com/detail/unfollowtracker/ckkgnnifiojkmmfmeejeebafldholdnc and is configured in site/publication.json. Store approval does not replace real-account acceptance testing or guarantee future Instagram availability.
