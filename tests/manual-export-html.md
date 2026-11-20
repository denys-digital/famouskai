# Manual QA Test Suite - Standalone HTML Export

## Feature
Standalone HTML Export Core Feature (`Export Markdown -> HTML autonome`).

## Objective
Verify that the static HTML export functionality correctly converts active Markdown content into a clean, responsive, standalone `.html` file with filtered `preview-themes.css` rules, correct timestamped naming (`YYYY-MM-DD--HH-mm`), toast notification, auto-preview in a new browser tab, and proper core toolbar button visibility rules (without adding any entry in the left sidebar Tools menu or 1-letter plugin buttons).

## Test Datasets

Every test opens its sample file from the repository: open the address under test followed by `?open=tests/<file>`, for example `https://app.famouskai.com/?open=tests/fixtures-syntax-sample.js`. It opens in the app under its own name, unsaved.

| Dataset | File | Used by |
| :--- | :--- | :--- |
| A | `tests/fixtures-syntax-sample.js` | EXPORT-01 |
| B | `tests/fixtures-syntax-sample.md` (headings, lists, 2 tables, code blocks) | EXPORT-02, 03, 04, 06, 07 |
| - | none: a `[New]` window, then type `# Hello` | EXPORT-05 |

## Test Matrix

| Test ID | Scenario | Pre-conditions | Action Steps | Expected Outcome |
| :--- | :--- | :--- | :--- | :--- |
| **EXPORT-01** | Export button visibility on non-Markdown files | Dataset A open. | 1. Open Dataset A.<br>2. Observe the top right action toolbar and left sidebar. | 1. The `Export` button is NOT displayed in the toolbar.<br>2. No `Export HTML Statique` item appears in the left sidebar Tools list. |
| **EXPORT-02** | Export button visibility on Markdown files when preview is closed | Dataset B open, Preview off. | 1. Open Dataset B.<br>2. Ensure Preview is closed. | The `Export` button is hidden while Preview is closed. |
| **EXPORT-03** | Export button visibility on Markdown files when preview is open | Dataset B open. | 1. Open Dataset B.<br>2. Click `Preview` button. | The `Export` button appears immediately to the right of `Print PDF` button with identical core button styling in `#toolbar-right`. |
| **EXPORT-04** | Standalone HTML export execution with saved Markdown file | Dataset B open, Preview on. | 1. Click `Export` button.<br>2. Confirm save location/dialog if prompted.<br>3. Come back to the Famouskai editor tab, then look at the toast and at the new browser tab. | 1. Default suggested filename is formatted as `fixtures-syntax-sample_YYYY-MM-DD--HH-mm.html` (date and time of now).<br>2. Toast message `HTML exported successfully!` appears.<br>3. The exported HTML automatically opens in a new browser tab for preview.<br>4. The exported HTML shows the document styled like the Famouskai preview (headings, lists, code blocks and tables are styled), with no Famouskai toolbar or sidebar. |
| **EXPORT-05** | Standalone HTML export execution with new/unsaved document | A new window (`+`), file `[New]`. | 1. Type `# Hello`.<br>2. Click `Preview`.<br>3. Click `Export`.<br>4. Come back to the Famouskai editor tab. | 1. Default suggested filename is formatted as `document_YYYY-MM-DD--HH-mm.html` (date and time of now).<br>2. Back on the editor tab, a toast confirms success.<br>3. Exported file opens in a new browser tab. |
| **EXPORT-06** | User cancellation of export save dialog | Dataset B open, Preview on. | 1. Click `Export` button.<br>2. Cancel the browser file save dialog. | Export is safely aborted without error or success toast. |
| **EXPORT-07** | Sidebar Tools & Plugin Toolbar Non-Pollution | Dataset B open. | 1. Expand the left sidebar.<br>2. Check the "Tools" section and the `#toolbar-plugins` area. | No new tool item or 1-letter plugin button is created (Export HTML behaves as a core feature like Print PDF). |
