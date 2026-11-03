# Plan: Push the header and footer changes from a separate branch

## Goal
Get the header, footer and font changes onto GitHub on their own branch, separate from `main`. The work is already on the local branch **`header-footer-migration`**, which I created from the latest `main` (`73f7cee`, after your PRs #3 and #4). Nothing is committed yet.

## What goes into the branch (code only)

| File | Change |
|---|---|
| `blocks/header/header.js`, `header.css` | New two-row header: utility bar (Sign In, language panel), main bar (logo, sections with yellow chip, search), fixed and shrinking on scroll, mobile push drawer |
| `blocks/footer/footer.js`, `footer.css` | New dark footer: logo, nav, Follow Us icons, credits; two-column mobile layout |
| `styles/styles.css` | WKND font tokens, headings at Asar's regular weight, header height reservation (117px / 194px), drawer width and page push |
| `styles/fonts.css` + 6 files in `fonts/` | Self-hosted Source Sans Pro and Asar |
| `.gitignore` | Ignores the header and footer validation working folders |

**Not included:**
- **Nav and footer content plus their images** (`content/nav.plain.html`, `content/footer.plain.html`, `content/images/`): content isn't tracked in git. It reaches the site through Document Authoring (see "After the push").
- **Validation files** in `migration-work/`: excluded from git.
- **Unused Roboto font files** in `fonts/`: they stay as they are. Removing them is an optional cleanup for later.

## Steps
1. **Check the base.** Fetch `origin` and confirm `main` is still at `73f7cee`. If it has moved, rebase the uncommitted work onto the new `main` before pushing.
2. **Final checks before pushing:**
   - `npm run lint` (ESLint and Stylelint)
   - the header and footer breakpoint and fetch-path checks
   - a quick render check of the 5 migrated pages at 390 and 1280px
3. **Commit** the files above on `header-footer-migration`, with identity `Claude Code <noreply@anthropic.com>` and no AI attribution (your playbook rule).
4. **Push** `header-footer-migration` to `mgos112/ema-madhuram`.
5. **If GitHub refuses the push with 403** (as on the last three attempts), undo my local commit with `git reset --mixed HEAD~1`. That keeps every change, uncommitted, on the same branch, so the app's **Sync → Code** shows them and can push them. Last time Sync had nothing to offer because I had already committed.
6. **Report:** the branch link (or the Sync instructions) and the test link `https://header-footer-migration--ema-madhuram--mgos112.aem.page/us/en/magazine`.

I won't open a PR or merge; you've handled those yourself so far. I can open the PR with the playbook template if you want.

## After the push: what the branch will show
- **The new code runs on the branch preview right away.** The header and footer content, though, is fetched from the site's `nav` and `footer` pages, which still hold the boilerplate in Document Authoring.
- **Until the content is synced, the preview shows the new styling around the old boilerplate content.** To see the real WKND header and footer there, the nav and footer pages (and their 13 images) need uploading to Document Authoring and previewing. I'll only do that when you ask:
  - `content/nav.plain.html` → `/nav.html`
  - `content/footer.plain.html` → `/footer.html`

| Surface | Changed by this plan? |
|---|---|
| Local workspace | ✅ Commit on `header-footer-migration` (or left uncommitted for Sync if the push is refused) |
| GitHub | ✅ New branch `header-footer-migration` (no PR, no merge) |
| `main` / live code | ❌ No |
| Document Authoring / EDS preview / live content | ❌ No |

## Checklist
- [ ] Fetch `origin`; confirm `main` is still `73f7cee` (rebase if it moved)
- [ ] Run `npm run lint`, the breakpoint and fetch-path checks for header and footer, and a render check of the 5 pages at 390/1280
- [ ] Commit header, footer, styles, fonts and `.gitignore` on `header-footer-migration` (no content, no validation files, no AI attribution)
- [ ] Push `header-footer-migration` to `mgos112/ema-madhuram`
- [ ] If the push returns 403: `git reset --mixed HEAD~1` so the changes stay uncommitted for **Sync → Code**
- [ ] Report the branch or Sync result, the branch preview link, and the nav/footer Document Authoring sync paths

*Carrying out this plan needs Execute mode.*
