# Changelog

All notable changes to Famouskai will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Fixed

- Diffskai: the Open buttons stay disabled until the editor and the file sent by
  Famouskai have finished loading. Picking a file too early showed the error
  "Cannot read properties of undefined (reading 'setLanguage')".

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

[Unreleased]: https://github.com/denys-digital/famouskai/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/denys-digital/famouskai/releases/tag/v0.1.0
