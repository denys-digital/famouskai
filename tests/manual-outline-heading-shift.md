# Manual Tests - Outline: Move all headings of a selection up or down (-# / +#)

This suite covers manual verification of the Outline heading level shift buttons (`-#` and `+#`) in Famouskai.

## Scenarios

| Test ID | Scenario | Pre-conditions | Action Steps | Expected Outcome |
|---|---|---|---|---|
| OUTLINE-SHIFT-01 | Shift headings down (+#) on selection | A Markdown file open with text containing H2 (`## A`) and H3 (`### B`) | Select the text containing the headings. Click `+#` in the Outline toolbar. | Headings become H3 (`### A`) and H4 (`#### B`). Toast indicates "2 headings moved down". Selection is maintained. Document is marked modified (*). |
| OUTLINE-SHIFT-02 | Shift headings up (-#) on selection | Document state after OUTLINE-SHIFT-01 with selection intact | Click `-#` in the Outline toolbar. | Headings become H2 (`## A`) and H3 (`### B`), returning to original text. Toast indicates "2 headings moved up". |
| OUTLINE-SHIFT-03 | Undo in one step (Ctrl+Z) | After performing OUTLINE-SHIFT-01 or OUTLINE-SHIFT-02 | Press `Ctrl+Z` (or `Cmd+Z`) in the editor. | The entire shift action is reverted in a single undo step. |
| OUTLINE-SHIFT-04 | Cursor on heading without selection | Empty selection, cursor placed on line `# Heading` | Click `+#` in the Outline toolbar. | Line becomes `## Heading`. Toast indicates "1 heading moved down". |
| OUTLINE-SHIFT-05 | Cursor on normal text line | Cursor placed on a line with no heading (e.g. `regular paragraph`) | Click `+#` or `-#` in the Outline toolbar. | No changes applied. Toast indicates "No heading changed" (info type). Document is not modified. |
| OUTLINE-SHIFT-06 | Row hidden for non-markdown file | Open a `.js` or `.txt` file | Inspect the Outline panel. | The `#markdown-fold-buttons` row (containing `+`, `H1`-`H4`, `+#`, `-#`) is hidden (`display: none`). |
| OUTLINE-SHIFT-07 | Theme appearance (light and dark) | Markdown file open, Outline panel visible | Toggle between themes / preview themes | Buttons `-#` and `+#` match the appearance of existing `.fold-btn` buttons, remain legible, and properly align on their row without wrapping awkwardly. |
