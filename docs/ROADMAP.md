# Roadmap

What comes next for Famouskai. Each version line has a name: 0.1.x is Sankukai, 0.2.x is Osakai. There are no dates on purpose: each line says what changes for you, not when.

## 0.2.x: for contributors (Osakai)

Shipped in 0.2.0:

- The main script is split into small files in `core/`, each with its own unit test page: easier to read, easier to change.
- A Content Security Policy for the app and every HTML export.
- An API to add sidebar tabs and drawers from an extension, each with its own color.
- Mobkai: a minimal note mode on a phone.

Already shipped in 0.1.x: relative paths for hosting in a sub-folder, a basic open/download fallback for Firefox and Safari, click-to-insert from the snippet list.

Next (several are open good first issues):

- Dynamic Magic Snippets.
- Search inside the Markdown preview, with highlighted matches and next/previous.
- Click a heading in the Outline to scroll the preview to it.
- Markdown preview: GitHub and Obsidian style callouts (`> [!NOTE]`, `> [!WARNING]`…).
- Change case of the selection: UPPER, lower, Title Case, camelCase.

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
