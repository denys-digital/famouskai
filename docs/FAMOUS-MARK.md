# Famous Mark Guide

Famous Marks are a universal single-line bookmarking and section folding system built into Famouskai Editor. "Famous Mark" is the family name of three Unicode characters: the Famous Arrow `﹥`, the Magic Dot `•` and the Flying Bubble `°`. Any line beginning with one of them acts as a section bookmark in the Outline tab and creates a fold point in the text editor.

## Supported Marks

| Character | Unicode Code Point | Name | How to Type |
| --- | --- | --- | --- |
| `﹥` | `U+FE65` | Famous Arrow | Snippet `/fa` + `Tab` |
| `•` | `U+2022` | Magic Dot | Snippet `/md` + `Tab` |
| `°` | `U+00B0` | Flying Bubble | Snippet `/fb` + `Tab` |

The mark definitions are declared centrally in `FamousMark.MARKS`.

## Writing a Mark

A valid Famous Mark line must start with a mark character, optionally preceded by leading whitespace and tolerated comment prefix characters (`PREFIX_CLASS`: `/`, `!`, `<`, `*`, `\`, `-`, `#`, `%`, `;`, `@`). Text following the mark becomes the bookmark label. Trailing comment closers `-->` or `*/` are stripped automatically.

### Valid Examples

- JS / C++: `// ﹥ Core Logic Setup`
- CSS / C-style: `/* • Dark Theme Variables */`
- HTML / XML: `<!-- ° Main Navigation Panel -->`
- Python / Shell: `# ﹥ Database Connection Handler`
- Markdown / Text: `• Project Milestones`
- TeX / LaTeX: `% ﹥ Document Preamble`
- INI / Assembly: `; • Database Configuration`
- Annotations: `@ ° Core Marker Definition`

### Unrecognized Examples

- `const mark = "﹥ Section";` (Mark is in the middle of a line rather than anchored at the start)
- `/* Comment */ ﹥ Label` (Closing comment `*/` appears before the mark, breaking prefix matching)
- `code // ﹥ Heading` (Non-whitespace code appears before comment characters)

## Feature Integration

Famous Marks integrate automatically across key editor components:

- **Outline Tab**: Lines starting with a Famous Mark appear as navigation bookmarks. Users can filter the Outline view by selecting specific mark type badges (`﹥`, `•`, `°`).
- **Code Folding**: Ace Editor uses Famous Marks to delimit fold regions. Text folds from one mark line down to the next mark line or the end of the document.
- **Magic Snippets**: The Snippets engine binds its help descriptions (`/fa`, `/md`, `/fb`) directly to the human-readable labels defined in `FamousMark.MARKS`.

## Contributor Guide

Developers and contributors must access all Famous Mark features through `window.FamousPluginCore.FamousMark`.

### Global API

`window.FamousPluginCore.FamousMark` exposes the following properties:

- `MARKS`: Object mapping semantic names (`arrow`, `magic`, `bubble`) to `{ char, label }`.
- `CHAR_CLASS`: String containing all mark characters (`"\uFE65\u2022\u00B0"`).
- `PREFIX_CLASS`: String of tolerated comment prefix characters (`"/!<*\\-#%;@"`).
- `regex`: Canonical `RegExp` matching anchored mark lines and capturing label text in group 1.
- `test(line)`: Function returning `true` if a line starts with a Famous Mark pattern, `false` otherwise.
- `match(line)`: Function executing `regex` against a line, returning a match array where index 1 contains the label, or `null`.

### Extension Rules

- **Single Source of Truth**: Never redefine a custom regex for Famous Marks elsewhere in the codebase.
- **Load Order**: `plugins/ext-famous-core.js` must load before `plugins/ext-outline.js`, `plugins/ext-snippets.js`, and the main `index.html` inline script.
- **Adding Markers**: Adding a fourth mark requires adding a single entry to `MARKS` inside `plugins/ext-famous-core.js`.
- **Testing**: Run `tests/unit-famous-mark.html` in a web browser to verify all unit tests pass after making any changes.

## Planned Extensions

These are ideas for later versions, not features of 0.1.0:

- **Magic Dot levels**: `••` and `•••` as level 2 and level 3 headings in any document, like `##` and `###` in Markdown.
- **Flying Bubble notes**: `°[note](text)` to pin a note to a place in the document.
