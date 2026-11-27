# Manual Test Plan — Paste Language Detection (`core/core-shortcuts.js`)

## Overview
Verify that pasting text into an empty, unsaved document (`[New]`) selects the matching language: the file icon next to `[New]` and the syntax colors both change. This includes YAML documents and Markdown files with YAML front matter.

## Test Datasets

Every test copies a sample file from the repository, so each run pastes the same content and there is nothing to type, save or delete.

**To open a file:** open the address under test followed by `?open=tests/<file>`, for example `https://app.famouskai.com/?open=tests/fixtures-syntax-sample.diff`. It opens in the app under its own name, unsaved.

| Dataset | File | Used by |
| :--- | :--- | :--- |
| A | `tests/fixtures-syntax-sample.diff` | PASTE-01 |
| B | `tests/fixtures-paste-circle.svg` (1 line: `<svg viewBox="0 0 10 10"><circle cx="5" cy="5" r="4"/></svg>`) | PASTE-02 |
| C | `tests/fixtures-syntax-sample.html` | PASTE-03 |
| D | `tests/fixtures-syntax-sample.xml` | PASTE-04 |
| E | `tests/fixtures-syntax-sample.yml` | PASTE-05 |
| F | `tests/fixtures-syntax-sample.js` | PASTE-06 |
| G | `tests/fixtures-syntax-sample.json` | PASTE-07 |
| H | `tests/fixtures-syntax-sample.css` | PASTE-08 |
| I | `tests/fixtures-syntax-sample.md` | PASTE-09, PASTE-13, PASTE-14 |
| J | `tests/fixtures-paste-front-matter.md` (YAML front matter `---` / `title: Note` / `date: 2026-10-29` / `---`, then `# Heading` and `Body text.`) | PASTE-10 |
| K | `tests/fixtures-syntax-sample.csv` | PASTE-11 |
| L | `tests/fixtures-paste-prose.txt` (2 lines: `Todo: buy milk`, `Note: call Bob`) | PASTE-12, PASTE-13, PASTE-14 |

## How to run each test

1. Open the dataset of the test (see above).
2. Click in the editor, press Ctrl+A then Ctrl+C (Cmd on macOS). Look at the icon and the colors: they are the expected result.
3. Click **New** in the toolbar: the title shows `[New]`.
4. Click in the editor and press Ctrl+V.

## Test Matrix

| Test ID | Language / Case | Dataset | Expected after the paste (icon next to `[New]`, colors) |
| :--- | :--- | :--- | :--- |
| **PASTE-01** | Diff / Patch | A | Icon `±`. Same colors as the opened file. |
| **PASTE-02** | SVG | B | Icon `<s>`. Same colors as the opened file. |
| **PASTE-03** | HTML | C | Icon `<h>`. Same colors as the opened file. |
| **PASTE-04** | XML | D | Icon `<x>`. Same colors as the opened file. |
| **PASTE-05** | YAML | E | Icon `Yᴍʟ`. Same colors as the opened file. Fold arrows show in the gutter next to the YAML blocks. |
| **PASTE-06** | JavaScript | F | Icon `JS`. Same colors as the opened file. |
| **PASTE-07** | JSON | G | Icon `{}`. Same colors as the opened file. |
| **PASTE-08** | CSS | H | Icon `#`. Same colors as the opened file (not the JavaScript colors). |
| **PASTE-09** | Markdown | I | Icon `M⇣`. Same colors as the opened file (not the JavaScript colors). |
| **PASTE-10** | Markdown with YAML front matter | J | Icon `M⇣` (not `Yᴍʟ`). Same colors as the opened file. |
| **PASTE-11** | CSV | K | Icon `▥`. Same colors as the opened file (columns colored, not plain text). |
| **PASTE-12** | Short prose with colons | L | Icon `Txᴛ` (stays plain text, not YAML). |

## Second paste and manual re-detection

The language is detected on the first paste only (a paste into an empty document, or one that replaces the whole document after Ctrl+A). A later paste keeps the language; the button ↻ next to `[New] *` detects it again from the whole document.

| Test ID | Scenario | Pre-conditions | Action Steps | Expected Outcome |
| :--- | :--- | :--- | :--- | :--- |
| **PASTE-13** | A second paste keeps the first language | Dataset I copied, then **New** | 1. Ctrl+V: icon `M⇣`.<br>2. Open dataset L in another window, Ctrl+A, Ctrl+C.<br>3. Back in the `[New]` window, click at the end of the text, press Enter, Ctrl+V. | After step 1 the button ↻ shows next to `[New] *`. After step 3 the icon stays `M⇣` and the Markdown colors stay (no switch to `Txᴛ`). |
| **PASTE-14** | Re-detect with ↻ | PASTE-13 done | 1. Ctrl+A, Ctrl+V (dataset L is still in the clipboard).<br>2. Ctrl+Z until the Markdown text is back.<br>3. Click ↻ next to `[New] *`. | After step 1 the icon is `Txᴛ` (a paste that replaces all the text detects again). After step 2 the icon stays `Txᴛ`. After step 3 the icon is `M⇣` and the Markdown colors are back. |
