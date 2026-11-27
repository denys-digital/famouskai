# Vendor Info: DOMPurify

- **Project**: [DOM-only XSS sanitizer for HTML, MathML and SVG](https://github.com/cure53/DOMPurify)
- **Version**: 3.5.0
- **License**: MPL-2.0 OR Apache-2.0
- **Distribution**: [jsDelivr npm registry](https://www.jsdelivr.com/package/npm/dompurify)

**How to update**
1. Open the central `updater.html` tool in your browser.
2. Click "Choose parent folder" and select the root directory (e.g. `vendor/`).
3. Select **DOMPurify** from the dropdown menu.
4. Click "Download Target Version". The tool will automatically target the `vendor/dompurify/` subfolder, create it if needed, and write the updated files.
5. Update [sw.js](../../sw.js), [THIRD-PARTY-NOTICES.md](../../THIRD-PARTY-NOTICES.md) and [README.md](../../README.md) with generated related snippets.

**Files maintained by the updater**
* `purify.min.js`
