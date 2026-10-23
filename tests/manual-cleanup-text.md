# Manual Test Plan - Tidy & Sanitize Text Tool (`tool-cleanup-text.js`)

This document defines manual test scenarios for verifying the "Tidy & Sanitize Text" tool (`plugins/tool-cleanup-text.js`) according to AGENTS.md requirements.

## Test Matrix

| Test ID | Scenario | Pre-conditions | Action Steps | Expected Outcome |
| :--- | :--- | :--- | :--- | :--- |
| **TC-CLEAN-01** | Tool Visibility in Sidebar | App loaded in browser | Open sidebar menu and check TOOLS section | "Tidy & Sanitize Text" appears in sidebar for any open file type or unsaved file. Hovering shows description tooltip. No toolbar button (icon) is present in toolbar-plugins. |
| **TC-CLEAN-02** | Full Document Cleanup | Document contains trailing spaces, white lines with spaces, consecutive blank lines, leading blank lines, internal double spaces (e.g., ASCII schema or CSS alignment), and missing trailing newline | Click "Tidy & Sanitize Text" in TOOLS section | Confirmation prompt appears stating `Scope: Entire document`. Upon confirmation, trailing spaces removed, white lines emptied, consecutive blank lines merged to 1, leading blank lines removed, internal double spaces/alignments PRESERVED (protected from compression), single trailing newline ensured. Toast displays summary of fixes. |
| **TC-CLEAN-03** | Selection-only Cleanup | Selection made over a subset of lines with whitespace issues and double spaces | Select specific lines and click "Tidy & Sanitize Text" | Confirmation prompt appears stating `Scope: Current selection`. Upon confirmation, cleanup rules apply strictly to the selected range, including internal double space reduction. Text outside selection remains untouched. Toast displays summary. |
| **TC-CLEAN-04** | Already Clean Document | Document already adheres to all cleanup rules | Click "Tidy & Sanitize Text" | Confirmation prompt appears. Upon confirmation, document remains unchanged and Toast displays "Text is already clean!". |
| **TC-CLEAN-05** | Double Spaces with Indentation (Selection vs Full Document) | Code/text containing internal multiple spaces or CSS/ASCII alignment | Run "Tidy & Sanitize Text" | In Full Document scope (`isSelection === false`), internal multiple spaces/alignments are preserved intact. In Selection scope (`isSelection === true`), internal multiple spaces within the text body are reduced to single spaces while indentation is preserved. |
| **TC-CLEAN-06 (T1)** | Auto-cleanup on Save (`[New]` unsaved file) | Open `[New]` file, paste uncleaned dataset, check "Auto-cleanup on Save" in SETTINGS | Click "Save" / "As...", pick target file in OS Save dialog, confirm save | On-before-save trigger fires, editor content is sanitized automatically before writing to disk and remains sanitized in editor. |
| **TC-CLEAN-07 (T2)** | Auto-cleanup on Save (`[Named]` existing file) | Open named file, paste uncleaned text, check "Auto-cleanup on Save" | Click "Save" (Ctrl+S) | On-before-save trigger fires, editor content is sanitized automatically and saved to disk. |
| **TC-CLEAN-08 (T3)** | Auto-cleanup on Open | Check "Auto-cleanup on Open" in SETTINGS | Click "Open" and select a file containing uncleaned text | On-file-open trigger fires immediately after reading file, content is loaded sanitized in editor. |
| **TC-CLEAN-09 (T4)** | Auto-cleanup on Reload | Check "Auto-cleanup on Open" in SETTINGS, file reloaded from disk after external edit | Click "Reload" button in toolbar | On-file-open trigger fires upon reload, content is reloaded sanitized in editor. |

---

## Repeatable Copy-Paste Test Dataset (Edge Cases)

To perform repeatable manual validation, copy the raw code block below into a new Famouskai document (`[New]`) or selection, then execute **"Tidy & Sanitize Text"**.

```text




# Test Suite - Edge Cases for Text Cleanup

1. Trailing spaces testing:
This line has 4 trailing spaces.
This line has 2 trailing tabs.
This line has trailing spaces and tabs mixed.

2. White lines testing (lines with spaces or tabs only):




3. Double spaces vs Indentation testing:
    const variable  =  "hello  world";
	function  testFunction(  param1,   param2  )  {
        if  (true)  {
            return   "preserved  indentation  tests";
        }
    }

4. Consecutive blank lines testing:


Line after 3 blank lines.



Line after 4 blank lines.

5. Trailing newlines testing (3 blank lines at the end of file):


```

### Expected Output Dataset (After Full Document Cleanup)

In Full Document scope, internal multiple spaces (ASCII schemas, CSS alignment) are preserved intact:

```text
# Test Suite - Edge Cases for Text Cleanup

1. Trailing spaces testing:
This line has 4 trailing spaces.
This line has 2 trailing tabs.
This line has trailing spaces and tabs mixed.

2. White lines testing (lines with spaces or tabs only):

3. Double spaces vs Indentation testing:
    const variable  =  "hello  world";
	function  testFunction(  param1,   param2  )  {
        if  (true)  {
            return   "preserved  indentation  tests";
        }
    }

4. Consecutive blank lines testing:

Line after 3 blank lines.

Line after 4 blank lines.

5. Trailing newlines testing (3 blank lines at the end of file):

```

### Expected Output Dataset (After Selection-Only Cleanup on Section 3)

In Selection scope, internal multiple spaces are compressed:

```text
3. Double spaces vs Indentation testing:
    const variable = "hello world";
	function testFunction( param1, param2 ) {
        if (true) {
            return "preserved indentation tests";
        }
    }
```
