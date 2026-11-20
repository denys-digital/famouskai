# Manual Test Specification: Famous Marks

This document checks where a Famous Mark (`﹥`, `•`, `°`) counts and where it does not: tolerated prefixes, false positives, Markdown bullets, folding and the Outline click. The rules are in `docs/FAMOUS-MARK.md` ("Where a Mark Counts") and `docs-lab/FAMOUS-MARK-MATRIX.md`.

---

## Test Datasets

Every test opens its sample file from the repository, so each run starts from the same content and there is nothing to type, save or delete.

**To open a file:** open the address under test followed by `?open=tests/<file>`, for example `https://app.famouskai.com/?open=tests/fixtures-famous-mark-edge.txt`. It opens in the app under its own name, unsaved.

| Dataset | File | Used by |
| :--- | :--- | :--- |
| A | `tests/fixtures-famous-mark-edge.txt` (plain text: 8 valid prefixes, 6 lines that are not marks) | FM-01, FM-03 |
| B | `tests/fixtures-famous-mark-notes.md` (Markdown: 3 headings, `•` bullets, `°` in the middle of a line) | FM-02, FM-03, FM-04 |
| C | `tests/fixtures-outline-config.yaml` | FM-03 |

---

## Test Scenarios Matrix

| Test ID | Scenario | Pre-conditions | Action Steps | Expected Outcome |
| --- | --- | --- | --- | --- |
| **FM-01** | Tolerated prefixes and false positives (plain text) | Dataset A | 1. Open `fixtures-famous-mark-edge.txt`, open the Outline tab. | **Step 1 (`fixtures-famous-mark-edge.txt`)**, badges `All` `﹥` `•` `°` `TODO` `@`:<br>[top]<br>• Valid prefixes<br>&nbsp;&nbsp;&nbsp;&nbsp;﹥ slash comment<br>&nbsp;&nbsp;&nbsp;&nbsp;﹥ hash comment<br>&nbsp;&nbsp;&nbsp;&nbsp;° double dash<br>&nbsp;&nbsp;&nbsp;&nbsp;﹥ semicolon<br>&nbsp;&nbsp;&nbsp;&nbsp;° percent<br>&nbsp;&nbsp;&nbsp;&nbsp;﹥ at sign<br>&nbsp;&nbsp;&nbsp;&nbsp;﹥ html comment<br>&nbsp;&nbsp;&nbsp;&nbsp;° block comment<br>• Not marks<br>[happy end]<br>Not listed: lines 11 to 16 (`20°C`, `45° rotation`, the mark in a string, after code, after a closed comment, in the middle of a line). |
| **FM-02** | Markdown: `•` is a bullet, `°` in a sentence is text | Dataset B | 1. Open `fixtures-famous-mark-notes.md`, open the Outline tab. | **Step 1 (`fixtures-famous-mark-notes.md`)**, badges `All` `#` `﹥` `°` `TODO` `@`:<br>[top]<br>Trip notes<br>&nbsp;&nbsp;&nbsp;&nbsp;﹥ Pack the night before<br>&nbsp;&nbsp;&nbsp;&nbsp;° Check the weather<br>&nbsp;&nbsp;&nbsp;&nbsp;Day 1<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;° Call the hotel<br>&nbsp;&nbsp;&nbsp;&nbsp;Day 2<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;﹥ Train at 9:00<br>[happy end]<br>Not listed: line 4 `• Plain bullet, not a mark`, line 5 `- • Bullet with a dot`, line 6 `Temperature: 20°C in the morning.` |
| **FM-03** | Folding: sections fold, marks never do | Datasets A, B, C | 1. Open `fixtures-famous-mark-notes.md`, look at the gutter, then click the fold arrow of line 1.<br>2. Click it again. Open `fixtures-famous-mark-edge.txt`, look at the gutter, click the fold arrow of line 1.<br>3. Open `fixtures-outline-config.yaml`, look at the gutter, click the fold arrow of line 3. | 1. Fold arrows only on lines 1 (`# Trip notes`), 9 (`## Day 1`) and 14 (`## Day 2`); none on the mark lines 3, 7, 11, 16. Line 1 folds: lines 2 to 17 are hidden.<br>2. All open again. On the text file, fold arrows only on line 1 (`• Valid prefixes`) and line 10 (`• Not marks`). Line 1 folds lines 2 to 9; line 10 stays visible.<br>3. Only line 3 (`server:`) has a fold arrow, none on line 2 `# ﹥ yaml point`. It hides line 4 `port: 8080`. |
| **FM-04** | Outline click opens a folded section | Dataset B | 1. Open `fixtures-famous-mark-notes.md`, open the Outline tab, click the fold arrow of line 1.<br>2. In the Outline, click `° Call the hotel`. | 1. Lines 2 to 17 are hidden.<br>2. The fold opens, the cursor is on line 11 `° Call the hotel`, in view. |

Snippets `/fa`, `/md`, `/fb` and their help labels: `tests/manual-snippets-help-click.md` (TS-SNIP-02, 04, 06, 07). `•` sections, colors, Reorder and heading tools by file type: `tests/manual-sidebar-tabs.md` (TSB-12 to TSB-16).

Not manual: the code checks of the old deployment checklist (script order, Service Worker file list, one single mark regex) belong to code review. The regex and parser are covered by `tests/unit-famous-mark.html`, the offline start by check G2 of `tests/ci-browser-tests.mjs`.
