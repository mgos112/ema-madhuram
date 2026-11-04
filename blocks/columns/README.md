# columns

Boilerplate **columns** block: each row is laid out side by side from 900px and stacks on mobile, with image-only cells first.

## Authoring (Document Authoring)

Model: `standalone`

Block table named `Columns`. Each cell of a row becomes a column.

## Supported variations

### Featured — `Columns (Featured)` → `class="columns featured"`

Featured article teaser (source: https://wknd.site/us/en/magazine.html). One row, 2 cells:

| Cell 1 | Cell 2 |
| --- | --- |
| Image | Label paragraph (e.g. "Featured Article"), h2 title, description paragraph, call-to-action link in bold |

- From 900px the image takes two thirds of the width and the text sits in a grey panel beside it; on mobile the image stacks above the text.
- The paragraph directly above the heading is styled as the label; a bold link on its own line becomes the primary button.

### Spec — `Columns (Spec)` → `class="columns spec"`

Trip facts list (source: https://wknd.site/us/en/adventures/bali-surf-camp.html). One row per fact, 2 cells:

| Cell 1 | Cell 2 |
| --- | --- |
| Label (plain text, e.g. "Activity") | Value (plain text, e.g. "Surfing") |

- Rendered as a definition list (`dl` / `dt` / `dd`) in a single column at all widths, label above value, each item with a light left rule.
- Label and value casing is applied by CSS; keep the source wording.
- A missing value renders an empty `dd`; extra cells are merged into the value; empty rows are dropped.

## Universal Editor fields

N/A (Document Authoring project)
