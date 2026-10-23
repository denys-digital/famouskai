# Manual Test Specification: Extract & Copy Markdown Table (`manual-tool-extract-mk-table.md`)

## Sample Dataset

Copy and paste the following Markdown table into editor (`test.md`):

```markdown
# Table Test Document

| ID | Name | Role | Status |
|---|:---|---:|:---:|
| 101 | Alice | Lead Architect | Active |
| 102 | Bob | Frontend Engineer | Active |
| 103 | Charlie | QA Lead | On Leave |
| 104 | Diana | Designer | Active |
| 105 | Evan | DevOps | Inactive |
| 106 | Fiona | Product Manager | Active |
| 107 | George | Backend Engineer | Active |
| 108 | Hannah | Security Engineer | Active |
| 109 | Ian | Data Scientist | On Leave |
| 110 | Julia | Systems Architect | Active |

Some plain text after the table.
```

## Manual Test Scenarios

| Test ID | Scenario | Pre-conditions | Action Steps | Expected Outcome |
|---|---|---|---|---|
| TC-MK-TBL-01 | Extract specific rows from middle of Markdown table | Markdown file active in editor containing the sample table | Select rows 102 and 103 (`| 102 | ...` and `| 103 | ...`), click "Extract & Copy Table" from Tools menu | Success toast `"Extracted and copied to clipboard!"` is shown. Clipboard contains header, alignment row, and selected rows 102 and 103. |
| TC-MK-TBL-02 | Extract when selection already includes header & alignment rows | Markdown file active in editor containing the sample table | Select entire table including header and alignment rows, click "Extract & Copy Table" | Toast shown. Extracted output contains header, alignment row, and data rows without duplication. |
| TC-MK-TBL-03 | Non-table selection error handling | Markdown file active in editor containing the sample document | Select `# Table Test Document` or `Some plain text after the table.`, click "Extract & Copy Table" | Browser alert `"Please select one or more lines from the Markdown table."` is displayed. |
| TC-MK-TBL-04 | Tool visibility on non-markdown files | Open a `.txt` or `.js` file in editor | Open Tools menu | "Extract & Copy Table" tool is not listed in Tools menu (restricted to `.md` files). |
| TC-MK-TBL-05 | Mixed selection (table rows + non-table text) | Markdown file active in editor containing the sample document | Select from row 105 down to `Some plain text after the table.`, click "Extract & Copy Table" | Toast shown. Non-table plain text line is automatically omitted from extracted clipboard output. |
| TC-MK-TBL-06 | Disjoint multi-selection (Ctrl/Cmd + selection) | Markdown file active in editor containing the 10-row sample table | Using Ctrl+click/drag (or Cmd+click/drag on macOS), select disjoint rows (e.g. 102, 105, and 108), click "Extract & Copy Table" | Toast shown. Extracted clipboard output clean-reconstructs the table with header, alignment row, and strictly rows 102, 105, and 108 (no empty or unselected lines). |
