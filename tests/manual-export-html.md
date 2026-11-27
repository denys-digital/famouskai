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
| B | `tests/fixtures-syntax-sample.md` (headings, lists, 2 tables, code blocks) | EXPORT-02, 03, 04, 06, 07, 08, 09, 10, 11 |
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
| **EXPORT-08** | Dark preview gives a dark exported file, with a theme switch | Dataset B open, Preview on, preview in the dark theme (moon button). | 1. Click `Export` and save.<br>2. Look at the exported file in the new tab.<br>3. Click `Dark theme` at the top right of the exported page.<br>4. Click it again. | 2. The page is dark like the app preview (dark background, light text, dark tables and code blocks); the `Dark theme` box at the top right is checked.<br>3. The box is unchecked and the page turns light, like the light preview.<br>4. The page is dark again. |
| **EXPORT-09** | Light preview gives a light exported file; print stays light | Dataset B open, Preview on, preview in the light theme (sun button off). | 1. Click `Export` and save.<br>2. Look at the exported file in the new tab.<br>3. Check `Dark theme`, then press Ctrl+P. | 2. The page is light, as before this change; the `Dark theme` box is unchecked.<br>3. The page turns dark; the print preview is light (white page, black text) and shows no `Dark theme` box. |
| **EXPORT-10** | Text size button zooms the preview text, not the headings | Dataset B open, Preview on, text size `A` (default). | 1. Click the `A` button right of the theme button.<br>2. Click it again.<br>3. Click it again.<br>4. Click it once more (`A+`), then press Ctrl+R (reload) and open the Preview. | 1. The button shows `A+`; paragraphs, lists and tables get bigger (18 px); the headings keep their size.<br>2. The button shows `A++`; the text is bigger again (23 px); the headings keep their size.<br>3. The button shows `A`; the text is back to its first size (15 px).<br>4. After the reload the button still shows `A+` and the text is at 18 px. |
| **EXPORT-11** | Exported file keeps the text size, with a size switch | Dataset B open, Preview on, text size `A++`. | 1. Click `Export` and save.<br>2. Look at the exported file in the new tab.<br>3. Click `15` in the `Text` switch at the top right.<br>4. Click `18`, then press Ctrl+P. | 2. The text is big (23 px), the headings are like in the app; the `Text 15 18 23` switch at the top right has `23` selected, left of the `Dark theme` box.<br>3. The text turns small (15 px), the headings keep their size.<br>4. The text is at 18 px; the print preview shows the text at 18 px and no switch. |
