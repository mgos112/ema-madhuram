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

## Universal Editor fields

N/A (Document Authoring project)
