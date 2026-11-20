# Manual Test Specification: Extract & Copy Markdown Table (`manual-tool-extract-mk-table.md`)

## Test Datasets

Every test opens its sample file from the repository, so each run starts from the same content and there is nothing to type, save or delete.

**To open a file:** open the address under test followed by `?open=tests/<file>`, for example `https://app.famouskai.com/?open=tests/fixtures-extract-table-team.md`. It opens in the app under its own name, unsaved.

| Dataset | File | Used by |
| :--- | :--- | :--- |
| A | `tests/fixtures-extract-table-team.md` (16 lines: title line 1, header line 3, alignment line 4, rows `101` to `110` on lines 5 to 14, plain text line 16) | TC-MK-TBL-01, 02, 03, 05, 06 |
| - | `tests/fixtures-syntax-sample.js` | TC-MK-TBL-04 |

To check the clipboard, open a new window with `+` and paste (Ctrl+V).

## Manual Test Scenarios

| Test ID | Scenario | Pre-conditions | Action Steps | Expected Outcome |
|---|---|---|---|---|
| **TC-MK-TBL-01** | Extract specific rows from middle of Markdown table | `fixtures-extract-table-team.md` (Dataset A) open | 1. Select lines 6 and 7 (rows `102` and `103`).<br>2. Click "Extract & Copy Table" in the Tools tab.<br>3. Paste in a new window. | 1. Toast `Extracted and copied to clipboard!`<br>2. 4 lines, top to bottom:<br>line 3 of Dataset A (header)<br>line 4 (alignment)<br>line 6 (`102` Bob)<br>line 7 (`103` Charlie) |
| **TC-MK-TBL-02** | Extract when selection already includes header & alignment rows | `fixtures-extract-table-team.md` (Dataset A) open | 1. Select lines 3 to 14 (the whole table).<br>2. Click "Extract & Copy Table".<br>3. Paste in a new window. | 1. Toast `Extracted and copied to clipboard!`<br>2. Lines 3 to 14 of Dataset A, 12 lines: header and alignment rows only once. |
| **TC-MK-TBL-03** | Non-table selection error handling | `fixtures-extract-table-team.md` (Dataset A) open | 1. Select line 1 (`# Table Test Document`), click "Extract & Copy Table".<br>2. Select line 16 (`Some plain text after the table.`), click "Extract & Copy Table". | 1. and 2. Browser alert `Please select one or more lines from the Markdown table.` The clipboard is not changed. |
| **TC-MK-TBL-04** | Tool visibility on non-markdown files | `fixtures-syntax-sample.js` open | 1. Open the Tools tab. | 1. "Extract & Copy Table" is not listed (Markdown files only). |
| **TC-MK-TBL-05** | Mixed selection (table rows + non-table text) | `fixtures-extract-table-team.md` (Dataset A) open | 1. Select from line 9 (row `105`) to line 16.<br>2. Click "Extract & Copy Table".<br>3. Paste in a new window. | 1. Toast `Extracted and copied to clipboard!`<br>2. 8 lines, top to bottom:<br>line 3 (header)<br>line 4 (alignment)<br>line 9 (`105`)<br>line 10 (`106`)<br>line 11 (`107`)<br>line 12 (`108`)<br>line 13 (`109`)<br>line 14 (`110`)<br>Not pasted: `Some plain text after the table.` |
| **TC-MK-TBL-06** | Disjoint multi-selection (Ctrl/Cmd + selection) | `fixtures-extract-table-team.md` (Dataset A) open | 1. Select line 6, then hold Ctrl (Cmd on macOS) and select line 9, then line 12.<br>2. Click "Extract & Copy Table".<br>3. Paste in a new window. | 1. Toast `Extracted and copied to clipboard!`<br>2. 5 lines, top to bottom:<br>line 3 (header)<br>line 4 (alignment)<br>line 6 (`102`)<br>line 9 (`105`)<br>line 12 (`108`)<br>No empty line between them. |
