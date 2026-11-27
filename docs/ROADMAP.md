# Roadmap

What comes next for Famouskai. Each version line has a name: 0.1.x is Sankukai, 0.2.x is Osakai, 0.3.x is Ekekai. There are no dates on purpose: each line says what changes for you, not when.

## 0.2.x: for contributors (Osakai)

Shipped in 0.2.0:

- The main script is split into small files in `core/`, each with its own unit test page: easier to read, easier to change.
- A Content Security Policy for the app and every HTML export.
- An API to add sidebar tabs and drawers from an extension, each with its own color.
- Mobkai: a minimal note mode on a phone.

Shipped in 0.2.1:

- Outline: `-#` and `+#` buttons move the headings of the selection one level up or down.
- Outline Reorder in Markdown: a heading moves with its whole section, and one Ctrl+Z undoes the move.
- Tidy & Sanitize Text removes empty blockquote lines in Markdown.
- Safer updates: a new version never mixes with the files of the old one, and Famouskai never reloads by itself.

Shipped in 0.2.2:

- Famous Marks follow the file type: in Markdown, `#` headings are the structure; in code, a mark counts only inside a comment.
- The Outline is a tree: marks, TODO and `@` lines sit under the heading that holds them, and each Famous Mark has its own look.
- Outside Markdown, `•` lines are sections: they show in the Outline, fold, and move with Reorder.
- An Outline for JSON files: the keys of the first two levels.
- Links that open a file of the site straight in the app (`?open=`), in the view you pick (`&view=read`, `&view=split`...). The README opens three sample files in one click.
- Diffskai: Scroll-up and Scroll-down buttons.

Already shipped in 0.1.x: relative paths for hosting in a sub-folder, a basic open/download fallback for Firefox and Safari, click-to-insert from the snippet list.

## 0.3.x: for every language (Ekekai)

Shipped in 0.3.0:

- Two new languages, each as one complete lot (colors, folding, Outline with its own filter, Famous Marks in comments, Diffskai, offline): Python and YAML.
- An Outline for CSS files: selectors and block at-rules, nested 3 levels.
- A click on an Outline item scrolls the Markdown preview to it.
- The HTML export follows the dark or light preview theme, with a switch in the file.

Next (several are open good first issues):

- Dynamic Magic Snippets.
- Search inside the Markdown preview, with highlighted matches and next/previous.
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
