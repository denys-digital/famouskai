# Manual Test Specification: Print PDF Output Verification

## Test Overview
Verify that triggering "Print PDF" (`window.print()`) renders only document content in the print preview / exported PDF and completely hides floating elements, toasts, dialogs, and UI overlays across multi-page documents.

## Test Matrix

| Test ID | Scenario | Pre-conditions | Action Steps | Expected Outcome |
| :--- | :--- | :--- | :--- | :--- |
| **PRINT-01** | Multi-page Markdown Print PDF layout | Multi-page Markdown file open in editor (e.g. `tests/fixtures-syntax-sample-extended.md`). Preview pane active. | 1. Trigger print via "Print PDF" button or `Ctrl+P` / `Cmd+P`.<br>2. Inspect pages 1, 2, 3, and following in the print preview window. | 1. Page content renders clearly on white background.<br>2. No toast boxes (`#toast-msg`), dialogs, or floating rectangles appear at the top or bottom of pages 2+. |
| **PRINT-02** | Print PDF while a Toast notification is active | A toast message is visible on screen (e.g., after copying snippet or saving). | 1. While toast is displayed, click "Print PDF".<br>2. Inspect print preview. | Toast notification is completely hidden in print layout. |
| **PRINT-03** | Print PDF while a Modal Dialog is open | A modal dialog is open (e.g. Rename dialog or Snippet manager modal). | 1. Open dialog.<br>2. Trigger print.<br>3. Inspect print preview. | Modal dialog and backdrop are completely hidden in print preview. |

## Raw Test Dataset Sample
Use `tests/fixtures-syntax-sample-extended.md` for multi-page print preview testing.
