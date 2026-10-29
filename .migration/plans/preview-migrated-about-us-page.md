# Plan: Viewing the Migrated About Us Page in the Local Preview

## Why you see a different project
The About Us migration exists only in this workspace. The panel you're looking at shows the version synced to GitHub (`mgos112/ema-madhuram`, branch `main`) and Code Sync. That version is still the starting template, because none of this work has been committed, pushed or uploaded:

| Surface | Has the migrated page? |
|---|---|
| Local workspace / in-app preview | ✅ Yes |
| GitHub `main` / Code Sync | ❌ No (nothing committed or pushed) |
| Document Authoring (DA) | ❌ No (page not uploaded) |
| EDS preview / live (`*.aem.page` / `*.aem.live`) | ❌ No |

You chose **local preview only**, so this plan keeps everything in the workspace and nothing goes to GitHub or DA.

## How to open the in-app preview (step by step)
The preview is in the **Workspace Panel** on the right side of the screen, next to this chat.

1. **Switch to the Preview view.** In the Workspace header at the top of the right panel, open the **ViewPicker**, the leftmost dropdown. Under **Content**, pick **Preview**. The shortcut is `Ctrl+Cmd+1`.
   - If you see a file tree with a code editor (**Files**) or a diff list (**Changes**), you're in a Code view, not the page preview. Switch back to **Preview**.
2. **Show the page tree.** Click the **Tree toggle** (chevron icon) next to the ViewPicker to open the left sidebar.
3. **Select the page.** In the tree, click **`about-us`**. The page name appears in the Workspace header and the page renders in the preview.
   - If `about-us` isn't in the tree, click **Refresh** in the header actions to reload.
4. **Optional preview controls** (in the header actions area):
   - **Viewport menu** (device icon): switch between Desktop, Tablet and Mobile.
   - **Inspect mode** (cursor icon): click any element to add it to the chat, for example "make this heading smaller".
   - **Open in new tab**: open the preview full-size in its own browser tab.

Note: the **Sync** button (far right, with a badge) will show pending items, because this migration's code and content aren't pushed or uploaded yet. Leave it alone if you want to stay local only.

## What you should see
- 7 sections: intro photo mosaic, case study intro, photo gallery, testimonial tabs, latest articles, FAQ and closing banner.
- The light-grey, centered and split section styles are applied.
- Things to try:
  - Click the testimonial avatars to switch tabs. Arrow, Home and End keys work too.
  - Open and close the FAQ questions.
  - Use the Viewport menu to check the Tablet and Mobile layouts.

## What's local and what you can change
- **The page content** is in the workspace's `about-us` page. If you want text or link edits, I can make small targeted changes, but re-running the import will overwrite them.
- **Blocks:** `columns-image-mosaic`, `columns-article-intro`, `cards-gallery`, `tabs-testimonial`, `cards-article`, `accordion-faq`, `hero-inset-overlay`. They only handle layout so far; colours, fonts and spacing come with design migration.
- **Site script fix:** support for section styles (`scripts/scripts.js`), also local only. You can see it, and all the new files, in the **Changes** view (`Ctrl+Cmd+7`) under Unstaged Changes.

## Checklist
- [ ] In the Workspace header, open the **ViewPicker** and choose **Content → Preview** (`Ctrl+Cmd+1`)
- [ ] Click the **Tree toggle** (chevron) to show the page tree
- [ ] Select **`about-us`** in the tree (use **Refresh** if it's missing)
- [ ] Check that all 7 sections render with their section styles
- [ ] Try the testimonial tabs (click and keyboard)
- [ ] Expand and collapse the 4 FAQ items
- [ ] Use the **Viewport menu** to check the Tablet and Mobile layouts
- [ ] Optional: use **Inspect mode** to pick elements you want changed and send them to the chat
- [ ] Optional next step: run **Start Design Migration** to match the original site's look
- [ ] Optional later: to get it onto GitHub or DA, use **Sync → Code / Content** or ask me to push to a branch and upload (a separate, explicit step)

*This plan only reads files and doesn't publish anything. Making changes for you needs Execute mode.*
