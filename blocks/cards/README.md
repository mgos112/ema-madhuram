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
