# breadcrumb

Path navigation above an article (source: https://wknd.site/us/en/magazine/guide-la-skateparks.html).

## Authoring (Document Authoring)

Model: `standalone`

Block table named `Breadcrumb`, one row, one cell holding an ordered list:

1. Parent pages as links, e.g. [Magazine](/us/en/magazine)
2. The current page title as plain text, last

Plain paragraphs (one per item) work too. The block renders `nav[aria-label="Breadcrumb"] > ol`; the last item is marked `aria-current="page"`.

## Supported variations

No variations.

## Universal Editor fields

N/A (Document Authoring project)
