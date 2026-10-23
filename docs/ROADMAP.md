# Roadmap

What comes after Famouskai 0.1.0 (Sankukai). There are no dates on purpose: each line says what changes for you, not when.

## 0.1.x: fixes

- Fixes for issues reported after the 0.1.0 release.

## 0.2: for contributors

- Dynamic Magic Snippets, and click-to-insert from the snippet list.
- Search inside the Markdown preview, with highlighted matches and next/previous.
- Click a heading in the Outline to scroll the preview to it.
- Markdown preview: GitHub and Obsidian style callouts (`> [!NOTE]`, `> [!WARNING]`…).
- Change case of the selection: UPPER, lower, Title Case, camelCase.
- Split the main script of `index.html` into smaller `core-*.js` files, easier to read and to change.
- A Content Security Policy, once the inline script is split.
- Relative paths in the Service Worker and the manifest, so Famouskai can be hosted in a sub-folder (for example GitHub Pages).
- A basic open/download fallback for Firefox and Safari.
- An API to add sidebar tabs and drawers from an extension, each with its own color.

## Later: ideas being explored

- A table preview for CSV files, with filters and hidden columns.
- SQL highlighting and folding.
- A scratch note: one quick temporary file, always one click away.
- Simple diagrams drawn from text.
- Scroll sync between a Markdown file and its preview.
- Compare two files straight from the file manager ("Open with" Diffskai).
- Monaco Editor (Diffskai) updated to its next major version.

---

This roadmap is a direction, not a promise. Ideas and votes are welcome in [Discussions](https://github.com/denys-digital/famouskai/discussions).
