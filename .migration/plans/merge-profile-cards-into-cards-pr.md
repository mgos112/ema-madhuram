# Plan: Push the header and footer changes from a separate branch (and handle the PageSpeed quota error)

## What the error means
`Quota exceeded for quota metric 'Queries' and limit 'Queries per minute' of service 'pagespeedonline.googleapis.com'` comes from the automated **PageSpeed check** (`aem-psi-check`) that runs on your pull requests:
- **Where it comes from:** the check asks Google's PageSpeed Insights service to score the PR's test URL. Google limits how many requests one project can make per minute.
- **Whose quota it is:** the project number (`583229823889`) belongs to the check's own API account, not to your site or your code. When many PRs across many sites run the check at the same moment, that shared per-minute limit runs out and Google refuses the request.
- **What it says about your PR:** nothing. Your page was never scored, so it hasn't passed or failed on performance, accessibility or SEO. It's a temporary, external rate limit, like the "Timeout Exceeded" case your playbook (§C1) calls transient.

**What to do:**
1. **Wait a few minutes,** since the limit is per minute, then re-run the check. Editing the PR description doesn't re-run it, and the re-run API returns 403 (playbook §C1). The way to trigger it is an empty commit on the PR branch:
   ```bash
   git commit --allow-empty -m "chore: re-trigger aem-psi-check"
   git push
   ```
   Or use **Sync → Code** after making any change, since my pushes are currently refused with 403.
2. **If it keeps hitting the quota,** I can run Lighthouse locally against the branch preview link (playbook §C5) and put the scores in the PR description.
3. **Merging:** your playbook only treats the check as OK to merge past when it passes, or fails solely on the known SEO "noindex" false negative. A quota error isn't a result, so re-run it before merging.

## Goal
Get the header, footer and font changes onto GitHub on their own branch, separate from `main`. The work is on the local branch **`header-footer-migration`**, created from the latest `main` (`73f7cee`, after your PRs #3 and #4). Nothing is committed yet.

## What goes into the branch (code only)

| File | Change |
|---|---|
| `blocks/header/header.js`, `header.css` | New two-row header: utility bar (Sign In, language panel), main bar (logo, sections with yellow chip, search), fixed and shrinking on scroll, mobile push drawer |
| `blocks/footer/footer.js`, `footer.css` | New dark footer: logo, nav, Follow Us icons, credits; two-column mobile layout |
| `styles/styles.css` | WKND font tokens, headings at Asar's regular weight, header height reservation (117px / 194px), drawer width and page push |
| `styles/fonts.css` + 6 files in `fonts/` | Self-hosted Source Sans Pro and Asar |
| `.gitignore` | Ignores the header and footer validation working folders |

**Not included:**
- **Nav and footer content plus their images** (`content/nav.plain.html`, `content/footer.plain.html`, `content/images/`): content isn't tracked in git and reaches the site through Document Authoring.
- **Validation files** in `migration-work/`: excluded from git.
- **Unused Roboto font files** in `fonts/`: they stay as they are (optional cleanup later).

## Steps
1. **Check the base.** Fetch `origin` and confirm `main` is still at `73f7cee`. If it moved, rebase the uncommitted work onto the new `main`.
2. **Final checks:**
   - `npm run lint`
   - the header and footer breakpoint and fetch-path checks
   - a render check of the 5 migrated pages at 390 and 1280px
3. **Commit** on `header-footer-migration`, with identity `Claude Code <noreply@anthropic.com>` and no AI attribution.
4. **Push** `header-footer-migration` to `mgos112/ema-madhuram`.
5. **If GitHub refuses with 403** (as on the last three attempts), run `git reset --mixed HEAD~1`. That keeps every change uncommitted on the branch, so **Sync → Code** can push it.
6. **Report** the branch (or Sync) result and the test link `https://header-footer-migration--ema-madhuram--mgos112.aem.page/us/en/magazine`.
7. **If the PR's PageSpeed check hits the quota error,** wait a few minutes and re-trigger it with an empty commit (see above). If it keeps failing, I run local Lighthouse on the branch preview and report the scores.

I won't open a PR or merge unless you ask.

## After the push
- **Code:** it runs on the branch preview right away.
- **Content:** the header and footer content still comes from the boilerplate `nav` and `footer` pages in Document Authoring. To show the real WKND header and footer there, those pages and their 13 images need uploading and previewing; I'll only do that when you ask:
  - `content/nav.plain.html` → `/nav.html`
  - `content/footer.plain.html` → `/footer.html`

| Surface | Changed by this plan? |
|---|---|
| Local workspace | ✅ Commit on `header-footer-migration` (or left uncommitted for Sync if the push is refused) |
| GitHub | ✅ New branch `header-footer-migration`; an empty re-trigger commit only if the PageSpeed check needs re-running |
| `main` / live code | ❌ No |
| Document Authoring / EDS preview / live content | ❌ No |

## Checklist
- [ ] Fetch `origin`; confirm `main` is still `73f7cee` (rebase if it moved)
- [ ] Run `npm run lint`, the breakpoint and fetch-path checks for header and footer, and a render check of the 5 pages at 390/1280
- [ ] Commit header, footer, styles, fonts and `.gitignore` on `header-footer-migration` (no content, no validation files, no AI attribution)
- [ ] Push `header-footer-migration` to `mgos112/ema-madhuram`
- [ ] If the push returns 403: `git reset --mixed HEAD~1` so the changes stay uncommitted for **Sync → Code**
- [ ] If the PageSpeed check reports the quota error: wait a few minutes, then push an empty commit `chore: re-trigger aem-psi-check`
- [ ] If the quota error repeats: run local Lighthouse on the branch preview and add the scores to the PR description
- [ ] Report the branch or Sync result, the branch preview link, the check status, and the nav/footer Document Authoring sync paths

*Carrying out this plan needs Execute mode.*
