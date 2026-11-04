# Manual Test Plan — Paste Language Detection (`index.html`)

## Overview
Verify that pasting text into an empty, unsaved document (`[New]`) selects the matching Ace syntax mode, including YAML documents and Markdown files with YAML front matter.

## Test Matrix

| Test ID | Language / Case | Sample to Paste into `[New]` | Expected Ace Mode |
| :--- | :--- | :--- | :--- |
| **PASTE-01** | Diff / Patch | `tests/fixtures-syntax-sample.diff` (or a `--- a/...` / `+++ b/...` block) | `ace/mode/diff` |
| **PASTE-02** | SVG | `<svg viewBox="0 0 10 10"><circle cx="5" cy="5" r="4"/></svg>` | `ace/mode/svg` |
| **PASTE-03** | HTML | `tests/fixtures-syntax-sample.html` (starts with `<!DOCTYPE html>`) | `ace/mode/html` |
| **PASTE-04** | XML | `tests/fixtures-syntax-sample.xml` (starts with `<?xml`) | `ace/mode/xml` |
| **PASTE-05** | YAML (sample & workflows) | `tests/fixtures-syntax-sample.yml`, `.github/workflows/sanity.yml`, or `- name: Alice` | `ace/mode/yaml` (with YAML folding enabled) |
| **PASTE-06** | JavaScript | `tests/fixtures-syntax-sample.js` (`const`, `function`, `=>`) | `ace/mode/javascript` |
| **PASTE-07** | JSON | `tests/fixtures-syntax-sample.json` (`{ "key": "value" }`) | `ace/mode/json` |
| **PASTE-08** | CSS | `tests/fixtures-syntax-sample.css` (`selector { prop: value; }`) | `ace/mode/css` |
| **PASTE-09** | Markdown | `tests/fixtures-syntax-sample.md` (`# Heading` or `- list item`) | `ace/mode/markdown` |
| **PASTE-10** | Markdown with YAML front matter | `---\ntitle: Note\ndate: 2026-10-29\n---\n\n# Heading\n\nBody text.` | `ace/mode/markdown` (not stolen by YAML) |
| **PASTE-11** | CSV | `tests/fixtures-syntax-sample.csv` (consistent comma/semicolon columns) | `ace/mode/csv` |
| **PASTE-12** | Short prose with colons | `Todo: buy milk\nNote: call Bob` | `ace/mode/text` (remains plain text) |
