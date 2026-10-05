# UnfollowTracker

Free Instagram follower/following comparison in a persistent browser side panel. Version **1.1.0**, French and English, dark and light themes.

The extension identifies accounts you follow that do not follow you back **in the current lists**. It does not track historical unfollow events. It uses your existing Instagram session; complete results stay in local extension storage, separately for each account. Requests still go to Instagram and profile photos come from Meta image servers.

## Use the extension

1. Load this repository's root folder as an unpacked extension in `chrome://extensions` or `brave://extensions`. Desktop Chrome 116+ or a compatible Chromium browser is required.
2. Click the extension icon to open the side panel.
3. If Instagram is not open in that window, choose **Open Instagram** and sign in directly on the website.
4. Start a scan. Keep the Instagram tab open; switching tabs or closing the panel is fine.
5. Search all results, show more rows, open a profile or export JSON. Unfollowing is individual and requires confirmation. Saved scans can be deleted from the panel.

After an update, reload the extension **from the folder actually loaded by the browser**, then reload Instagram. Reloading does not copy files between Git worktrees. The old popup file names are retained for compatibility, but the manifest now uses `side_panel.default_path`, not `action.default_popup`.

The 1.0.2 scan fix is preserved: scans read friendship lists directly without querying the profile metadata endpoint that could be rate-limited independently. Pagination, authentication, bounded retries and result completeness checks preserve the last complete result when a refresh fails. See the [compatibility report](docs/instagram-compatibility.md).

## Develop and preview

Vanilla JavaScript, Manifest V3, static HTML/CSS site. No runtime framework or remote code dependency.

```sh
npm ci --ignore-scripts
npm test
npm run lint
npx playwright install chromium  # only if Chromium is missing
npm run test:browser
npm run site:dev
```

Site preview: `http://localhost:4173/fr/` and `/en/`. Browser tests use isolated synthetic Instagram fixtures; no real account is scanned or unfollowed.

```sh
npm run build:site
npm run test:site
npm run assets:store
npm run build
```

`npm run build` produces `dist/site/` and `dist/unfollowtracker-1.1.0.zip` with a SHA-256 file. The archive contains only extension files and relevant third-party notices. Native canvas is only needed for the historical optional icon generator, not normal builds.

## Publication preparation

**Nothing is deployed or submitted by these commands.** The site defaults to prelaunch with `noindex`; installation links become live when `site/publication.json` contains the real Chrome Web Store URL. Production builds require public publisher/support/hosting details and generate the sitemap and indexable pages.

- [Publication checklist and browser acceptance](docs/release/PUBLISHING.md)
- [French and English store listing](docs/release/STORE-LISTING.md)
- [Privacy and permission declarations](docs/release/PRIVACY-AND-PERMISSIONS.md)
- [Weespy reference analysis](docs/weespy-reference-audit.md)
- [SEO strategy](docs/seo/SEO-STRATEGY.md) and [domain research](docs/seo/DOMAINS.md)

Suggested configurable host: `unfollow.yadulink.com`. Publisher/support details reuse Yadulink as requested. Native live Brave panel placement, hosting configuration and store submission remain release steps.

## Files

`src/` contains the side panel, scanner, worker and bundled policies. `assets/` contains local fonts and extension icons. `site/` contains bilingual marketing content, static assets and publication configuration. `scripts/` builds and serves the site, packages the extension and renders store artwork. `tests/` covers scanner lifecycle, panel behavior and the static site's interactions. `docs/` contains release and research material.

UnfollowTracker is independent of Instagram and Meta. Instagram may limit requests or change its undocumented endpoints. License: MIT; upstream attribution and font licensing are in [THIRD_PARTY_NOTICES.txt](THIRD_PARTY_NOTICES.txt).
