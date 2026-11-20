# Manual Test Specification: Print PDF Output Verification

## Test Overview
Verify that "Print PDF" (`window.print()`) prints only the Markdown preview, and hides the toolbar, sidebar, editor, toasts, dialogs and overlays on every page.

## Test Datasets

**To open a file:** open the address under test followed by `?open=tests/<file>`, for example `https://app.famouskai.com/?open=tests/fixtures-syntax-sample-extended.md`. It opens in the app under its own name, unsaved.

| Dataset | File | Used by |
| :--- | :--- | :--- |
| A | `tests/fixtures-syntax-sample-extended.md` (long Markdown essay, several printed pages) | PRINT-01, PRINT-02, PRINT-03 |

The **Print PDF** button shows only while the preview is shown. Do not use `Ctrl+P` in the editor: it is "go to pair", not print.

## Test Matrix

| Test ID | Scenario | Pre-conditions | Action Steps | Expected Outcome |
| :--- | :--- | :--- | :--- | :--- |
| **PRINT-01** | Multi-page Markdown print layout | Dataset A open, preview shown (toolbar **Preview**). | 1. Click **Print PDF**.<br>2. Scroll through every page of the print preview. | 1. The print preview opens.<br>2. Page 1 starts with the title `Work anywhere, like at home: the case for light, local-first tools`. Every page shows only the rendered document on a white background: no toolbar, no sidebar, no editor, no toast, no dialog, no gray or colored rectangle at the top or bottom of page 2 and after. |
| **PRINT-02** | Print while a toast is shown | Dataset A open, preview shown. | 1. Click the version button at the bottom of the sidebar (toast `Version ... copied!`).<br>2. While the toast is visible, click **Print PDF**. | 2. The toast is not on any page of the print preview. |
| **PRINT-03** | Print while a dialog is open | Dataset A open, preview shown. | 1. Open the Tools tab, click `Manage snippets` (the drawer opens).<br>2. Click **Print PDF**. | 2. Neither the drawer nor any backdrop is on any page of the print preview; only the document. |
