# Plan: Fold the profile cards into Cards, then push to a new branch and open a PR

## Goal
Bring the About Us migration in line with the playbook, then get the code changes to `main` through a branch and pull request. Your choices:
- **PR only.** I open the PR and don't merge it, so you can review first. Merging `main` ships the code.
- **Fix the block first.** The separate `cards-profile` block becomes a `profile` variant of the Cards block.
- **Keep content local.** Nothing goes to Document Authoring (DA) or EDS preview.

## Part 1: Move the profile cards into the Cards block (playbook §C4)
Right now `blocks/cards-profile/` is a separate block folder. The playbook says a variant is an extra class on its base block, in the same folder.

1. **Block code (`blocks/cards/cards.js`)**
   - Move the profile logic in from `blocks/cards-profile/cards-profile.js`: social-link detection, the inline icons, the role line, defensive cell handling and image optimization.
   - Run it only when `block.classList.contains('profile')`.
   - Keep the default Cards behaviour exactly as it is for every other cards block.
2. **Styles (`blocks/cards/cards.css`)**
   - Move the profile CSS in, scoped to `.cards.profile …`: circular portrait, centred name, uppercase role, dark icon-only social bar, and a 1 / 2 / 4-column grid.
   - The default Cards rules stay as they are.
3. **Docs and metadata**
   - Fold the authoring notes from `blocks/cards-profile/README.md` and `metadata.json` into the Cards block's docs as a "Profile" variant section.
   - Then remove the `blocks/cards-profile/` folder.
4. **Import scripts**
   - `tools/importer/parsers/cards-profile.js`: emit the block as `Cards (Profile)`, so the page markup becomes `class="cards profile"`.
   - The template's block entry in `page-templates.json` and `import-about-us.js` keeps the `cards-profile` mapping name, which points at this parser.
   - Rebuild `import-about-us.bundle.js` and run `node --check` on both scripts.
5. **Re-import**
   - Re-import the page with `--force` (playbook §B1: content comes only from the importer, no hand edits).
   - Confirm `us/en/about-us` now has 2 `cards profile` blocks with 4 and 3 profiles, and that all wording is unchanged.

## Part 2: Verify (playbook §C5)
- Check the About Us page in the local preview at 390, 768 and 1280px:
  - Both blocks load, all 7 portraits load and every profile has its social icons.
  - The grid has 1, 2 and 4 columns at those widths.
  - There's no horizontal overflow.
- Check the home page, which also uses Cards, to confirm the default Cards layout didn't change.
- Run `npm run lint`. ESLint and Stylelint must both pass.

## Part 3: Branch, commit and PR (playbook §C1)
1. **Get the latest `main`.** Fetch it and make sure the local `main` isn't behind before branching. The uncommitted work carries over to the new branch.
2. **Create a slash-free branch,** e.g. `about-us-migration`.
3. **Commit only code:**
   - `blocks/cards/`, plus the removal of `blocks/cards-profile/` (never committed, so there is nothing to delete in git)
   - `scripts/scripts.js` (section-metadata support)
   - `tools/importer/**`: parser, transformers, import script and bundle, `page-templates.json`, URL list, reports in JSON and xlsx
   - `.migration/plans/*.md` for this work

   **Not committed:**
   - `content/`, `migration-work/` and `catalog/`, which git already excludes
   - `.migration/project.json`
   - the old wknd-trendsetters preview plan, which describes the archived migration
4. **Commit message:** the identity is `Claude Code <noreply@anthropic.com>`, with **no AI attribution** trailer.
5. **Push** the branch to `mgos112/ema-madhuram`.
6. **Open the PR** against `main` through the GitHub API, because the `gh` CLI isn't available. The body follows the playbook template: Summary, Changes, Verified (widths and computed values), then the Test URLs:
   - Branch preview: `https://about-us-migration--ema-madhuram--mgos112.aem.page/us/en/about-us`
   - Before: `https://main--ema-madhuram--mgos112.aem.live/us/en/about-us`
   - After: `https://about-us-migration--ema-madhuram--mgos112.aem.page/us/en/about-us`
7. **Leave the PR unmerged** and report its link and check status.

## What to expect
- **The test link won't show the page yet.** Content stays local, so the branch preview link returns 404 until the page is synced to DA. The PSI check may fail or show low scores for that reason, apart from the known SEO false negative caused by the platform's noindex header.
  - Local file: `content/us/en/about-us.plain.html`
  - DA target: `/us/en/about-us.html` on `mgos112/ema-madhuram`
- **Possible permission prompt.** If the push or the PR call returns 401/403, you'll need to turn on git access in **Settings → LLM Permissions**, then I'll retry.

| Surface | Changed? |
|---|---|
| Local workspace | ✅ Block refactor and re-imported About Us page |
| GitHub | ✅ New branch and an open PR (not merged) |
| `main` / live code | ❌ Not until you merge |
| Document Authoring / EDS preview / live content | ❌ No |

## Checklist
- [ ] Move the profile logic into `blocks/cards/cards.js` behind the `profile` class; default Cards behaviour unchanged
- [ ] Move the profile CSS into `blocks/cards/cards.css`, scoped to `.cards.profile`
- [ ] Fold the cards-profile docs into the Cards block docs and remove `blocks/cards-profile/`
- [ ] Update the parser to emit `Cards (Profile)`; rebuild the bundle; `node --check` both
- [ ] Re-import About Us with `--force`; confirm 2 `cards profile` blocks (4 and 3 profiles) and unchanged wording
- [ ] Verify About Us at 390/768/1280 (columns, images, icons, no overflow)
- [ ] Re-check the home page's default Cards layout
- [ ] `npm run lint` passes
- [ ] Fetch `main`, confirm it's current, create branch `about-us-migration`
- [ ] Commit code only (no `content/`, `migration-work/`, `catalog/`, `.migration/project.json`), no AI attribution
- [ ] Push the branch to `mgos112/ema-madhuram`
- [ ] Open the PR via the GitHub API using the playbook template with the branch preview URL
- [ ] Report the PR link, check status and the DA sync path; leave the PR unmerged

*Carrying out this plan needs Execute mode.*
