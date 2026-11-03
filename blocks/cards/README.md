# cards

Boilerplate **cards** block: one row per card, an image cell and a body cell, laid out as an auto-fill grid.

## Authoring (Document Authoring)

Model: `standalone`

Block table named `Cards`. One row per card; cells are an image and the card body.

## Supported variations

### Profile — `Cards (Profile)` → `class="cards profile"`

For people, contributor or team grids (source: https://wknd.site/us/en/about-us.html). One row per profile, 2 cells:

| Cell 1 | Cell 2 |
| --- | --- |
| Portrait image | Name as a heading (h3), role as a paragraph, social links (Facebook, Twitter, Instagram) as a list or link-only paragraphs |

- Layout: centered card with a circular portrait, name, uppercase role and a dark icon-only social bar. 1 column on mobile, 2 from 600px, 4 from 900px; the grid wraps.
- Missing cells are handled: a row with no image has no portrait, a row with no links has no social bar, and a single cell holding both the image and the text is split.
- Links to Facebook, Twitter/X and Instagram become icon-only buttons; the network name stays available to screen readers. Other links keep their visible text.
- Use plain Cards for content teasers with rectangular images, and Columns for non-repeating side-by-side layouts.

### Profile, Horizontal — `Cards (Profile, Horizontal)` → `class="cards profile horizontal"`

Article author byline (source: https://wknd.site/us/en/magazine/guide-la-skateparks.html). Same 2-cell content model as Profile (portrait | name h3, role, social links).

- Layout: 72px circular avatar beside the name (28/34/40px at mobile/768/1024) and muted uppercase 14px role; the dark social bar is the card's third child. Below 1024px the bar wraps onto its own line; from 1024px everything sits on one row, spaced apart. Max width 768px, with a 1px #ebebeb rule above.

### Button — `Cards (Button)` → `class="cards button"`

Article share rail (source: the sidebar of the LA Skateparks article). Rows are recognised by content, and **every row type is optional**, so articles without a PDF or without up-next stories simply leave those rows out:

| Row | Content |
| --- | --- |
| Title (optional) | Heading without links, e.g. "SHARE THIS STORY" |
| PDF panel (optional) | Title link to the PDF (h3), description paragraph, a list of file properties (filename, size, format — values only), then the plain download link to the PDF |
| Story (optional, repeatable) | Link to the story, then its date (in the same cell or a second cell) |

- PDF links get a `download` attribute (the file name); the last PDF link outside the heading becomes the dark download button with a down-arrow icon. Host the PDF next to the page in DA; never link to AEM DAM `coredownload.pdf` paths.
- Each story renders as a full-card link (title + muted date) with a 5px #ebebeb left border; hover/focus turns it yellow with a black border.
- The whole rail is uppercase.

### Dynamic — `Cards (Dynamic)` → `class="cards dynamic"`

Index-driven article teasers (source: "All Articles" on https://wknd.site/us/en/magazine.html). One row, one cell:

| Cell |
| --- |
| Path prefix of the pages to list, optionally followed by `\| <limit>`, e.g. `/us/en/magazine` or `/us/en/magazine \| 4` |

- Pages come from the query index (`/query-index.json`, via `scripts/query-index.js` `queryPages({ prefix, limit })`). The prefix page itself and the current page are excluded.
- Each card: linked image, linked uppercase title (h3), single-line description cut off with an ellipsis.
- The authored configuration is never shown. If the index is missing or has no matching pages, the block renders nothing.
- The prefix can also be authored as a link.

### Member Only — `Cards (Member Only)` → `class="cards member-only"`

Locked teasers for signed-out visitors (source: "Members Only" on the magazine page). One row per card, 2 cells:

| Cell 1 | Cell 2 |
| --- | --- |
| Image | Title (h3), description paragraph, then a short last paragraph used as the "Read More" call to action (plain text or a link) |

- The body renders above the image. Card content is faded to 65% opacity; the yellow lock ribbon in the top-left corner stays at full opacity.
- Rows without content are skipped; a missing image or body is fine.

## Universal Editor fields

N/A (Document Authoring project)
