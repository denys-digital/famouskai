# Famous Mark Guide

Famous Marks are a universal single-line bookmarking system built into Famouskai Editor. "Famous Mark" is the family name of three Unicode characters: the Famous Arrow `﹥`, the Magic Dot `•` and the Flying Bubble `°`. Any line beginning with one of them acts as a bookmark in the Outline tab.

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
- Text: `• Project Milestones` (in Markdown use `﹥` or `°`: `•` is a plain bullet there)
- TeX / LaTeX: `% ﹥ Document Preamble`
- INI / Assembly: `; • Database Configuration`
- Annotations: `@ ° Core Marker Definition`

### Unrecognized Examples

- `const mark = "﹥ Section";` (Mark is in the middle of a line rather than anchored at the start)
- `/* Comment */ ﹥ Label` (Closing comment `*/` appears before the mark, breaking prefix matching)
- `code // ﹥ Heading` (Non-whitespace code appears before comment characters)

## Where a Mark Counts (file type)

A mark is recognized only where the file gives it a place; everywhere else it is an ordinary character. The file type comes from `FamousMark.profile(filename, modeId)`.

| Profile | Files | Rule |
| --- | --- | --- |
| `markdown` | `.md`, `.markdown` | `﹥` and `°` at the start of a line or right after `<!--`. `•` is an ordinary bullet. Nothing inside a fenced code block. |
| `commented` | `.js`, `.ts`, `.css`, `.html`, `.svg`, `.xml`, `.yaml` | A mark counts only in a comment, as the syntax highlighting sees it: `// ﹥ x` is a mark, `const s = "﹥ x";` is not. `# x` in YAML is a comment, not a heading. |
| `plain` | `.txt`, and every type opened in text mode (`.py`, `.sh`, `.ini`, unknown types) | A mark at the start of a line, after the tolerated prefixes above. |
| `none` | `.json`, `.csv`, `.tsv`, `.log`, `.diff`, `.patch` | No marks. A JSON file lists the keys of its first two levels of objects instead; CSV, log and diff files show "No outline for this file type". |

`TODO` and `@` bookmarks follow the same rule: in Markdown at the start of a line or in `<!-- -->` (`// TODO` is plain text there), in code only inside a comment (so a `@decorator` is not listed), in plain text at the start of a line.

## Feature Integration

Famous Marks integrate automatically across key editor components:

- **Outline Tab**: Lines starting with a Famous Mark appear as navigation bookmarks. Users can filter the Outline view by selecting specific mark type badges (`﹥`, `•`, `°`). The Outline is a tree: a Famous Mark, TODO or @ line is indented one step under the Markdown heading that holds it. In a Markdown file a `#` badge shows the headings only, and the `•` badge is hidden.
- **`•` sections**: outside Markdown, a `•` line opens a section like a `#` heading. The number of dots is the level (`•` to `••••`, 1 to 4); a section holds every line down to the next `•` of the same or a higher level. The Outline shows `•` sections in bold, indented by level, with the other items of the section one step under them.
- **Outline colors**: one look per meaning. A `•` section shows its dots (`•`, `••`, `•••`) in the heading color, with no left border. A `﹥` point shows the arrow as a pointer, coral red (`#F95B56`), no left border. A `°` note shows the bubble, pink italic (`#FF87B4`) with a left border: in the Outline a left border means "temporary" (TODO, `@`, `°`).
- **Code Folding**: the language's own folding (Markdown headings, JS functions, HTML elements), plus, in code and plain-text files, a fold on each `•` line for its section (`SectionFold` in `core/core-editor.js`, a wrapper around the language's fold mode). Where the language already folds a `•` line with a real range, its own fold wins. `﹥` and `°` never fold. Markdown keeps Ace's native heading folding only.
- **Reorder**: in Reorder mode the Outline lists the sections (`#` headings in Markdown, `•` sections in code and plain text) and moves exactly the lines of a section, with the `﹥`, `°`, TODO lines and code it holds. Lines above the first section never move. One Undo restores the order. JSON and CSV files have no Reorder.
- **Heading tools**: in a code or plain-text file that has `•` sections, the Outline shows the `+ H1 H2 H3 H4` buttons (H*n* folds every `•` section of level *n* and deeper) and `-#` / `+#` (remove or add one dot on the `•` lines of the selection, levels 1 to 4).
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
- `profile(filename, modeId)`: the file's Famous Mark profile, `'markdown'`, `'commented'`, `'plain'` or `'none'` (by extension for a saved file, by Ace mode for an unsaved one).
- `parse(line)`: `null`, or `{ kind, mark, level, label }` where `kind` is `'point'` (﹥), `'section'` (• to ••••, `level` 1 to 4) or `'note'` (°).
- `sectionRange(items, idx, totalLines)`: `{ start, end }`, the lines held by `items[idx]`. An item with a numeric `level` (a `#` heading, a `•` line) holds every line down to the next one of the same or a higher level; any other item holds the lines down to the next item. The one section definition used by the Outline, folding and Reorder.

### Extension Rules

- **Single Source of Truth**: Never redefine a custom regex for Famous Marks elsewhere in the codebase.
- **Load Order**: `plugins/ext-famous-core.js` must load before `plugins/ext-outline.js`, `plugins/ext-snippets.js`, and the `core/` scripts.
- **Adding Markers**: Adding a fourth mark requires adding a single entry to `MARKS` inside `plugins/ext-famous-core.js`.
- **Testing**: Run `tests/unit-famous-mark.html` in a web browser to verify all unit tests pass after making any changes.

## Planned Extensions

These are ideas for later versions, not features of 0.1.0:

- **Magic Dot levels**: `••` and `•••` as level 2 and level 3 headings in any document, like `##` and `###` in Markdown.
- **Flying Bubble notes**: `°[note](text)` to pin a note to a place in the document.
