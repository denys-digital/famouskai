# Manual Test Specification: Click on Snippet Help List (`clic-on-snippet-help-list`)

## Overview
This document outlines manual testing scenarios for inserting snippets and triggering the help dialog by clicking anywhere on the full width of snippet entries in the sidebar lexicon panel.

## Test Datasets

Every test opens its sample file from the repository, so each run starts from the same content and there is nothing to type, save or delete.

**To open a file:** open the address under test followed by `?open=tests/<file>`, for example `https://app.famouskai.com/?open=tests/fixtures-snippets-sample.md`. It opens in the app under its own name, unsaved. Open it again before each test.

| Dataset | File | Used by |
| :--- | :--- | :--- |
| A | `tests/fixtures-snippets-sample.md` (3 lines; line 2 `Hello World Famouskai Editor`, line 3 `This is line two for testing selection.`) | TS-SNIP-01 to 07 |

TS-SNIP-03 also needs one custom snippet, created once in Tools tab > `Manage snippets` > add: Key `wrap`, Help Description `Wrap selection`, Snippet Content `[{{selection}}]$1`, Allowed Extensions empty. Delete it after the run.

## Test Matrix

| Test ID | Scenario | Pre-conditions | Action Steps | Expected Outcome |
| :--- | :--- | :--- | :--- | :--- |
| **TS-SNIP-01** | Full-width row click insertion without selection | Dataset A open, cursor at the end of the file (Ctrl+End, empty line 4) | 1. Open the Tools tab.<br>2. Click the far right end of the `/code: Insert a code section` row. | 1. Line 4 and line 5 are each three backticks (an empty code section). The cursor is at the end of line 4, in the editor. Toast `Snippet /code inserted`. The file shows as unsaved. |
| **TS-SNIP-02** | Snippet insertion with existing text selection (no `{{selection}}` in snippet) | Dataset A open | 1. Select `Hello World` on line 2 (first 11 characters).<br>2. Click the `/fa: Famous arrow` row. | 1. Line 2 is `﹥  Famouskai Editor` (the arrow, then 2 spaces: the one of the snippet and the one that followed `World`). Focus in the editor. |
| **TS-SNIP-03** | Snippet insertion with existing text selection (`{{selection}}` variable in snippet) | Dataset A open, custom snippet `wrap` created (see Test Datasets) | 1. Select `line two` on line 3.<br>2. Click the `/wrap: Wrap selection` row. | 1. Line 3 is `This is [line two] for testing selection.` Focus in the editor. |
| **TS-SNIP-04** | Click on `/help` row | Dataset A open, custom snippet `wrap` not created | 1. Click the `/help: Show alert list` row.<br>2. Close the alert. | 1. The alert reads, top to bottom:<br>MAGIC SNIPPETS FOR .MD:<br>/fa ➔ Famous arrow<br>/fb ➔ Flying bubble<br>/md ➔ Magic dot<br>/date ➔ Insert current date (YYYY-MM-DD)<br>/time ➔ Insert current time (HH:MM)<br>/cmt ➔ Multiline comment<br>/pb ➔ Force page break (PDF)<br>/br ➔ Insert a line break<br>/code ➔ Insert a code section<br>2. Focus back in the editor, text unchanged. |
| **TS-SNIP-05** | Visual styling & hover effect | Dataset A open, Tools tab | 1. Move the mouse over the `/fa` row, from its left end to its right end. | 1. On the whole row width: hover background, accent text color, pointer cursor. |
| **TS-SNIP-06** | Click-to-insert from the Manage Snippets drawer | Dataset A open, Tools tab, cursor at the start of line 1 | 1. Click `Manage snippets`.<br>2. Click the text of the `/fb` card (not Edit or Delete).<br>3. Click Edit, then Delete (Cancel the confirm) on another card. | 1. The drawer opens.<br>2. Line 1 starts with `° ` . Toast `Snippet /fb inserted`. The file shows as unsaved. Focus in the editor.<br>3. Nothing is inserted. |
| **TS-SNIP-07** | Toast after a click in the Tools tab list | Dataset A open, Tools tab, cursor at the start of line 1 | 1. Click the `/md: Magic dot` row.<br>2. Click the `/help` row. | 1. Line 1 starts with `• `. Toast `Snippet /md inserted`.<br>2. The help alert (TS-SNIP-04), no toast. |
