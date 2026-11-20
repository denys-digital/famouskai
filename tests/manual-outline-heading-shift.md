# Manual Tests - Outline: Move all headings of a selection up or down (-# / +#)

This suite covers manual verification of the Outline heading level shift buttons (`-#` and `+#`) in Famouskai.

## Test Datasets

Every test opens its sample file from the repository, so each run starts from the same content and there is nothing to type, save or delete.

**To open a file:** open the address under test followed by `?open=tests/<file>`, for example `https://app.famouskai.com/?open=tests/fixtures-outline-shift.md`. It opens in the app under its own name, unsaved. Open it again before each test that says "Dataset A open".

| Dataset | File | Used by |
| :--- | :--- | :--- |
| A | `tests/fixtures-outline-shift.md` (6 lines: `# Title`, `regular paragraph`, `## A`, `text under A`, `### B`, `text under B`) | OUTLINE-SHIFT-01 to 05, 07 |
| - | `tests/fixtures-syntax-sample.js` | OUTLINE-SHIFT-06 |

## Scenarios

| Test ID | Scenario | Pre-conditions | Action Steps | Expected Outcome |
|---|---|---|---|---|
| **OUTLINE-SHIFT-01** | Shift headings down (+#) on selection | Dataset A open, Outline tab open | 1. Select lines 3 to 6 (from `## A` to `text under B`).<br>2. Click `+#` in the Outline toolbar. | 1. Lines 1 to 6, top to bottom:<br>`# Title`<br>`regular paragraph`<br>`### A`<br>`text under A`<br>`#### B`<br>`text under B`<br>Toast `2 headings moved down`. Lines 3 to 6 stay selected. The file shows as unsaved. |
| **OUTLINE-SHIFT-02** | Shift headings up (-#) on selection | Right after OUTLINE-SHIFT-01, selection kept | 1. Click `-#` in the Outline toolbar. | 1. Lines 3 and 5 are back to `## A` and `### B` (the text of Dataset A). Toast `2 headings moved up`. |
| **OUTLINE-SHIFT-03** | Undo in one step (Ctrl+Z) | Dataset A open, lines 3 to 6 selected | 1. Click `+#`.<br>2. Press Ctrl+Z (Cmd+Z on macOS) once. | 1. Lines 3 and 5 are `### A` and `#### B`.<br>2. One Ctrl+Z brings back `## A` and `### B`. |
| **OUTLINE-SHIFT-04** | Cursor on heading without selection | Dataset A open, no selection, cursor on line 1 (`# Title`) | 1. Click `+#`. | 1. Line 1 is `## Title`; lines 2 to 6 unchanged. Toast `1 heading moved down`. |
| **OUTLINE-SHIFT-05** | Cursor on normal text line | Dataset A open, no selection, cursor on line 2 (`regular paragraph`) | 1. Click `+#`.<br>2. Click `-#`. | 1. and 2. Nothing changes. Toast `No heading changed`. The file does not show as unsaved. |
| **OUTLINE-SHIFT-06** | Row hidden for non-markdown file | `fixtures-syntax-sample.js` open, Outline tab open | 1. Look at the Outline panel. | 1. The row with `+`, `H1` to `H4`, `+#`, `-#` is hidden. |
| **OUTLINE-SHIFT-07** | Theme appearance (light and dark) | Dataset A open, Outline tab open | 1. Look at `-#` and `+#` in light theme, then in dark theme. | 1. Both buttons look like the other buttons of the row (`H1`, `H2`...), are readable, and stay on the same row. |
