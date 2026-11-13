# Changelog

All notable changes to Famouskai will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- Outline: two buttons, `-#` and `+#`, move every heading of the selection
  (or of the cursor line) one level up or down, in one undo step. They sit
  with the fold buttons on their own row under the Outline title.
- Tidy & Sanitize Text: a new rule removes empty blockquote lines (`>`,
  `> >`) in Markdown files and keeps the blank lines that separate
  blockquote paragraphs.

### Changed

- Outline Reorder works on Markdown files only and lists only the headings
  while it is on: a heading moves with its whole section, Famous Mark,
  TODO and @ lines included. The Reorder button is hidden for HTML, JS,
  CSS and other files.

### Fixed

- Outline: the ﹥, • and ° filters each show only the lines with their own
  mark. Before, ﹥ showed all three marks and • and ° showed nothing.
- Outline Reorder: dragging a Markdown heading moves its whole section
  (sub-headings, Famous Mark lines, text, code blocks), down to the next
  heading of the same or higher level. One Ctrl+Z undoes the move.
- Update: after an upgrade, Famouskai no longer mixes new and old files
  (for example the new page with the old stylesheet). The old version's
  cache is deleted before the new one takes over, and a message says when
  to reload. The message stays until you click OK. Famouskai never reloads
  by itself.
- Offline: the Service Worker only answers requests for Famouskai's own
  files and leaves any other request to the browser.

## [0.2.0] - 2026-11-11

### Added

- Mobkai: on a phone, Famouskai opens a minimal note mode: a touch-friendly
  editor without the desktop menus, a status bar (Copy all, messages,
  version) and recovery of an unsaved [New] note with a Restore button.
- Side drawer: four sizes (S, M, L, XL), a colored band that matches its
  tab, and full height.
- Full view preview: the sidebar closes while the preview takes the whole
  width, and a new setting "Outline open on preview" keeps the Outline open.
- Extensions can add their own sidebar tabs and drawers, each with its own
  color (`FamousPluginCore.Sidebar.registerTab`). A demo extension and the
  "Add a sidebar tab" guide in docs/PLUGIN-ARCHITECTURE.md show how.
- A Content Security Policy now protects the app and every HTML export:
  no inline scripts, nothing loads from a third party.
- Unit test pages for every core/ file, and tests/ci-browser-tests.mjs to
  run them in a browser.

### Changed

- The main script of index.html is split into small files in core/ (no
  behavior change). The "Where is what" table in docs/PLUGIN-ARCHITECTURE.md
  lists what each file holds.
- When both 'Autosave' and 'Auto-cleanup on Save' are turned on, the delay
  before saving triples (4.5s instead of 1.5s) to avoid cleaning up trailing
  spaces or empty lines while typing.
- "Open HTML" opens the page in a new tab from a local copy, so the Content
  Security Policy can stay strict.

### Fixed

- Magic Snippets: a click on a snippet in the Tools tab list now shows the
  "Snippet inserted" message, as a click in the Manage Snippets drawer does.
- Save As on Android no longer names new files `.txt.json`.

## [0.1.3] - 2026-11-05

### Changed

- Contributing: new coding standard "No emoji": no pictographs in code, user
  interface text, comments, commit messages or pull request titles (#62).

## [0.1.2] - 2026-11-04

### Added

- Workspaces: a × button next to the workspace list removes the selected
  workspace after a confirmation (the folder on disk is not touched), and the
  "Access error" message offers to remove the broken workspace. Thanks
  @yoreva-01 (#43).
- Firefox and Safari: **Open** loads a file through the browser picker and
  **Save** downloads a copy, instead of doing nothing. Saving in place,
  workspaces and conflict detection still need desktop Chromium. Thanks
  @yoreva-01 (#44).

### Fixed

- Offline mode now works when Famouskai is hosted in a sub-folder (such as a
  GitHub Pages project site): the Service Worker and the manifest use relative
  paths. Thanks @yoreva-01 (#40, closes #35).
- Pasting YAML into a new, empty document now selects YAML highlighting (files
  starting with `#` comments or a top-level list were taken for Markdown or
  CSS). Markdown with YAML front matter stays Markdown. Thanks @yoreva-01 (#41).
- Tool triggers (`onFileOpen`, `onBeforeSave`, ...) now respect the tool's
  `extensions` list, like the Tools tab. Thanks @yoreva-01 (#42).
- Full preview on a new, unsaved file no longer throws an error, and a diff
  typed in a new file is still shown as a diff after switching full preview.
- Diffskai: "Collapse unchanged" works as soon as the files load. Identical
  lines stayed visible until the box was unchecked and checked again.
- Windows & Settings tab: the list of open windows no longer drops windows
  that sit in the background, then shows them again. A closed window leaves the
  list at once.

## [0.1.1] - 2026-10-29

### Fixed

- Diffskai: the Open buttons stay disabled until the editor and the file sent by
  Famouskai have finished loading. Picking a file too early showed the error
  "Cannot read properties of undefined (reading 'setLanguage')".
- Magic Snippets: clicking a snippet in the Tools tab list, or in the Manage
  Snippets drawer, inserts it into the editor again. The click did nothing.

## [0.1.0] - 2026-10-23

### Added

- Open Source governance structure: `LICENSE` (AGPLv3), `docs/COMMERCIAL-LICENSE.md`,
  `docs/CLA.md`, `.github/CODE_OF_CONDUCT.md`, `.github/CONTRIBUTING.md`,
  `.github/SECURITY.md`, issue and pull request templates, automated CLA signature
  bot, and branch protection on `main`.
- `docs/00-START-HERE-HOW-TO.md`: contributor onboarding guide covering both a
  browser-only workflow and a local Git command-line workflow.
- Ko-fi sponsorship link.
- Code editor with syntax coloring for CSS, CSV/TSV, Diff/Patch, HTML, JavaScript/TypeScript, JSON, Markdown, SVG, XML, YAML, Log (`.log`), and plain text files.
- Live Markdown preview pane and single-file HTML export.
- Diffskai side-by-side file comparison and merge view.
- Tabbed sidebar with Explorer, Outline, Tools, and Windows & Settings tabs.
- Famous Marks section navigation and text folding using Famous Arrow (`﹥`), Magic Dot (`•`), and Flying Bubble (`°`).
- Magic Snippets for quick template and symbol insertion.
- Built-in tools: Beautify selection, Convert Bold to H4, Tidy & Sanitize Text, Clean Semantic Bookmarks, Compare this file (Diffskai), Extract & Copy Table, Remove Duplicate Lines, Sort Lines, and Set Default Workspace.
- Light/dark theme switch for the Markdown preview (moon/sun button), remembered across sessions. Print PDF and HTML export stay light.
- Offline editor capabilities provided by Service Worker caching.
- Opening files from the operating system's file manager when the app is installed (Chromium).
- Zero-build browser unit test pages in `tests/unit-*.html`.
- CSV and TSV files: one color per column and automatic detection of the separator (comma, semicolon, tab or pipe).
- Each sidebar tab has its own color.

### Changed

- Editor syntax colors now use the documented Famouskai palette (keywords in purple, variables in coral red; three editor colors added: Emerald, Bright Gold, Pink Carnation).
- Updated Marked to 18.1.1 and added DOMPurify 3.4.17 as local libraries.
- Added warning banner on non-Chromium browsers explaining that file opening and saving require desktop Chromium.
- Hardened tabbed sidebar preference handling against corrupted local storage data and added ARIA accessibility attributes.
- Preserved line endings, cursor position, and scroll position when executing text cleanup.
- The Oswald font is now bundled with the app instead of loaded from Google Fonts, and embedded in HTML exports.
- Updated Service Worker cache list to include preview styles and Web App Manifest.
- Diffskai opens maximized and always shows the Famouskai file on the right. In compare mode its Save now writes straight back to that file on disk (no "Save as" dialog), asks before overwriting a file changed on disk in the meantime, and opens other files from the same folder. Compare and conflict modes now share one hand-off and one save path.
- Recent files keep 50 entries, one per file, with a "Wks" filter for the current workspace.
- The drawer closes with a double chevron, in its header and next to "Hide Menu".
- Tidy & Sanitize Text removes empty list markers in Markdown files.
- Markdown preview: code blocks use a dark blue theme and show function names in bold, also in HTML exports.
- Test sample files in `tests/` rewritten in English with real content that covers every coloring rule.

### Fixed

- Corrected Web App Manifest JSON formatting warnings in browser developer tools.
- Handled invalid local storage preference values safely with fallbacks to default settings.
- Hardened Service Worker fetch error handling and cached Monaco assets to allow offline Diffskai access.
- Restored syntax coloring for files opened from the operating system's file manager.
- Several Famouskai and Diffskai windows open at the same time no longer interfere: saving in one Diffskai only reloads the Famouskai window(s) showing that same file, a window with unsaved edits is always asked first, and each comparison gets its own unique session. Diffskai now warns before closing with unsaved changes.
- "Auto-cleanup on Open" now runs on every way of opening a file (Explorer, recent files, file manager, new window, share target), and a file it changes is marked as modified with a notice.
- In Diffskai, Ctrl+S saves the focused panel instead of opening the browser's "Save page" dialog.
- YAML folding: a list at the same indent as its key folds with it, and block scalars and comments no longer create wrong fold points.

### Security

- Sanitized Markdown preview and HTML export outputs with DOMPurify to prevent XSS vulnerabilities.

### Known Limitations

- Offline mode requires serving the application over HTTPS or localhost, not from `file://`.
- Saving files requires the File System Access API, so a desktop Chromium browser such as Chrome or Edge is required; other browsers display a warning banner.
- Monaco Editor (Diffskai) remains pinned at version 0.56.0 for this release.

[Unreleased]: https://github.com/denys-digital/famouskai/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/denys-digital/famouskai/compare/v0.1.3...v0.2.0
[0.1.3]: https://github.com/denys-digital/famouskai/compare/v0.1.2...v0.1.3
[0.1.2]: https://github.com/denys-digital/famouskai/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/denys-digital/famouskai/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/denys-digital/famouskai/releases/tag/v0.1.0
