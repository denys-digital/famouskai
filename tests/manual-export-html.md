# Manual QA Test Suite - Standalone HTML Export

## Feature
Standalone HTML Export Core Feature (`Export Markdown -> HTML autonome`).

## Objective
Verify that the static HTML export functionality correctly converts active Markdown content into a clean, responsive, standalone `.html` file with filtered `preview-themes.css` rules, correct timestamped naming (`YYYY-MM-DD--HH-mm`), toast notification, auto-preview in a new browser tab, and proper core toolbar button visibility rules (without adding any entry in the left sidebar Tools menu or 1-letter plugin buttons).

## Test Matrix

| Test ID | Scenario | Pre-conditions | Action Steps | Expected Outcome |
| :--- | :--- | :--- | :--- | :--- |
| **EXPORT-01** | Export button visibility on non-Markdown files | A non-Markdown file (e.g. `script.js` or `style.css`) is opened in Famouskai. | 1. Open `script.js`.<br>2. Observe the top right action toolbar and left sidebar. | 1. The `Export` button is NOT displayed in the toolbar.<br>2. No `Export HTML Statique` item appears in the left sidebar Tools list. |
| **EXPORT-02** | Export button visibility on Markdown files when preview is closed | A Markdown file (e.g. `notes.md`) is opened, and Preview is toggled OFF. | 1. Open `notes.md`.<br>2. Ensure Preview is closed. | The `Export` button is hidden while Preview is closed. |
| **EXPORT-03** | Export button visibility on Markdown files when preview is open | A Markdown file (e.g. `notes.md`) is opened, and Preview is toggled ON. | 1. Open `notes.md`.<br>2. Click `Preview` button. | The `Export` button appears immediately to the right of `Print PDF` button with identical core button styling in `#toolbar-right`. |
| **EXPORT-04** | Standalone HTML export execution with saved Markdown file | A saved Markdown file named `rapport.md` with formatting (headings, lists, code, tables) is open and previewed. | 1. Click `Export` button.<br>2. Confirm save location/dialog if prompted.<br>3. Inspect toast notification and browser tabs. | 1. Default suggested filename is formatted as `rapport_YYYY-MM-DD--HH-mm.html`.<br>2. Toast message `HTML exported successfully!` appears.<br>3. The exported HTML automatically opens in a new browser tab for preview.<br>4. Exported HTML contains strictly filtered `.markdown-body` CSS from `preview-themes.css` without `@media print` or `diff2html` rules. |
| **EXPORT-05** | Standalone HTML export execution with new/unsaved document | An unsaved new document `[New]` containing Markdown text is open with Preview active. | 1. Type Markdown content in new document.<br>2. Click `Preview`.<br>3. Click `Export`. | 1. Default suggested filename is formatted as `document_YYYY-MM-DD--HH-mm.html`.<br>2. Toast notification confirms success.<br>3. Exported file opens in a new browser tab. |
| **EXPORT-06** | User cancellation of export save dialog | Markdown preview is active. | 1. Click `Export` button.<br>2. Cancel the browser file save dialog. | Export is safely aborted without error or success toast. |
| **EXPORT-07** | Sidebar Tools & Plugin Toolbar Non-Pollution | Open any `.md` file. | 1. Expand the left sidebar.<br>2. Check the "Tools" section and the `#toolbar-plugins` area. | No new tool item or 1-letter plugin button is created (Export HTML behaves as a core feature like Print PDF). |
