# Instagram compatibility review — 5 October 2026

The extension baseline was `ee70807` (26 January 2026). The upstream repository was reviewed through [`9796c4d`](https://github.com/davidarroyo1234/InstagramUnfollowers/commit/9796c4da05cc6681b6332a2727c77e09f92b7991), dated 30 September 2026.

## Findings from upstream

| Change | What changed | Relevance to this extension |
| --- | --- | --- |
| [3b8c194 / #323](https://github.com/davidarroyo1234/InstagramUnfollowers/commit/3b8c1940ed9cecef4eaf67494b1744efc4b47a3b), 9 September | Replaced an obsolete GraphQL query that returned empty edges with the paginated REST friendships endpoints. Uses `ds_user_id` to identify the signed-in account. | This extension already used REST, so switching endpoints again would not fix its reported failure. Its extra, mandatory profile lookup was a separate blocker. |
| [c628bb2 / #326](https://github.com/davidarroyo1234/InstagramUnfollowers/commit/c628bb2), 10 September | Improved partial-scan handling and follower ID comparison. | Never present a failed or incomplete scan as a fresh, complete result. |
| [8a5b0f8 / #329](https://github.com/davidarroyo1234/InstagramUnfollowers/commit/8a5b0f8), 10 September | Added a scan notice and configurable request size. | Instagram may return short pages regardless of the requested count. Continue using the cursor, not page length. |
| [0d71e7d / #345](https://github.com/davidarroyo1234/InstagramUnfollowers/commit/0d71e7db1c206940b3967848ec343a2385f93532), 30 September | Added web request headers, bounded HTTP 429 retries and incomplete-scan protection; raised page caps to 250 following / 1,500 followers. | The extension already sent those headers, but its 429 loop had no retry limit. Port the relevant safeguards and preserve the existing headers. |
| [9796c4d / #346](https://github.com/davidarroyo1234/InstagramUnfollowers/commit/9796c4da05cc6681b6332a2727c77e09f92b7991), 30 September | Improved cooldown feedback and error recognition. | Show a retry countdown and finish with an actionable error when retries are exhausted. |

These are changes reported by the upstream project, not an official specification of Instagram's private APIs.

## Reported failure and local fixes

The provided screenshot shows `Could not get user info. Make sure you're logged in.` while the UI still says `Scanning in progress...`. In the old implementation, both profile lookup attempts could fail before the first follower/following request. The screenshot alone does not establish the underlying HTTP status.

Version 1.0.1 identified the account using the session cookie and allowed scans to continue after profile HTTP 400/401/403/404/405 without an explicit login/challenge response. That fix was incomplete: HTTP 429 on this optional profile request still blocked all list requests. See the live diagnosis below. The scanner never guesses the signed-in username from links to other profiles. Real login redirects, explicit verification challenges and errors from friendship endpoints stop with a clear message.

Additional fixes:

- Acknowledge scan-start messages immediately; acknowledge unfollow requests with their actual outcome.
- Persist complete snapshots in the service worker even when the popup is closed. Restore current progress on reopening and mark tab closure/reload as an interruption.
- Keep results under `scanResult:<account ID>` and transient scan state in session storage. Ignore old, unowned cache entries because their owner cannot be recovered safely. They are not deleted.
- Keep the last complete result when a refresh fails, with a visible timestamp. Correctly restore completed scans containing zero non-followers.
- Bound HTTP 429 retries to three, use increasing delays (30/60/120 seconds), honor `Retry-After`, and stop instead of retrying early when Instagram requests a cooldown longer than five minutes. Network requests time out after 30 seconds. POSTs are not automatically retried.
- Encode opaque pagination cursors, deduplicate users, prefer exact `pk_id` strings and detect missing lists, stalled pagination, missing continuation cursors and page-limit truncation.
- Version 1.0.1 compared lists against separately fetched profile totals. Version 1.0.2 removes that request and uses pagination and explicit list-restriction flags instead; it does not claim to know totals before the lists have been read.
- Prevent concurrent scans of the same account from different tabs. Stop if the signed-in account changes.
- Confirm unfollow success from Instagram's response before updating the UI or cache.

## Live diagnosis and correction — 5 October, version 1.0.2

The user reported the same retry countdown after more than a day. The upstream HEAD was checked again and was still `9796c4d`; there was no newer upstream fix to apply.

Read-only tests in the user's existing Brave session established:

- Opening the account's following list in Instagram's own UI produced HTTP 200 on `/api/v1/friendships/<account>/following/`.
- A single authenticated GET to `/api/v1/users/<account>/info/` produced HTTP 429 with no `Retry-After` header. No authentication values were extracted or logged.
- Reading following pages directly with the extension's public web headers and pacing retrieved all 143 following accounts in three pages, matching the count displayed in the profile. This was an API diagnostic, not a scan started in the extension popup.
- The same read-only diagnostic retrieved 157 followers in eight pages; the final pages of both lists reported `has_more: false`. The follower count also matched the profile. Comparing the deduplicated IDs identified 15 accounts that do not follow back. No unfollow request was made. The probes used same-origin credentials automatically and did not read CSRF or session cookie values.

The profile endpoint's refusal therefore did not establish a general inability to read the lists. The old scan retried this unnecessary request before attempting either list. Version 1.0.2 removes profile-info requests entirely, matching upstream's direct friendship scan. Account selection still uses `ds_user_id` and is checked throughout the scan.

The scanner rejects explicit `should_limit_list_of_followings` / `should_limit_list_of_followers` flags and a positive `hidden_following_account_count`, in addition to malformed pages, stalled cursors, missing continuation and safety caps. It has no independent total on a generic Instagram page, so `has_more: true` without a next cursor remains an error. Completed counts come from the deduplicated lists; the snapshot's optional username remains null. Genuine 429s on list endpoints still use bounded backoff. Error messages and cooldowns identify the affected list.

## Validation

`npm test` runs mocked API, extension message/storage and popup DOM regressions, including the observed profile-429/list-200 case. `npm run test:browser` loads the real Manifest V3 extension into an isolated Chromium profile and serves local Instagram response fixtures; no authenticated Instagram account or real unfollow is used. It verifies that the extension never requests the unavailable profile endpoint, and covers popup closure/reopening, pagination, failed refreshes, HTTP 429, tab reload and account isolation. `npm run lint` checks production and test scripts.

After this change, all 53 unit/regression tests, the isolated Manifest V3 integration test and lint passed.

These checks validate the extension's behavior against known response shapes and failure modes. Live API diagnostics are recorded separately above. Reloading version 1.0.2 and completing a live scan in its popup remains a manual verification step, since the private API can vary by account.
