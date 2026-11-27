# Manual Test Plan - Tidy & Sanitize Text Tool (`tool-cleanup-text.js`)

This document defines manual test scenarios for verifying the "Tidy & Sanitize Text" tool (`plugins/tool-cleanup-text.js`) following the Manual Testing Protocol of `.github/CONTRIBUTING.md`.

## Test Datasets

Every test opens its sample file from the repository, so each run starts from the same content and there is nothing to type, save or delete. The files hold real trailing spaces and tabs: never copy them from a web page, open them.

**To open a file:** open the address under test followed by `?open=tests/<file>`, for example `https://app.famouskai.com/?open=tests/fixtures-cleanup-text-edge.txt`. It opens in the app under its own name, unsaved.

| Dataset | File | Used by |
| :--- | :--- | :--- |
| A | `tests/fixtures-cleanup-text-edge.txt` (39 lines: 4 leading blank lines, trailing spaces and tabs on lines 8 to 10, white lines 13 to 15, double spaces lines 18 to 21, 3 and 4 blank lines in section 4, 3 blank lines at the end) | TC-CLEAN-01, 02, 03, 05, 06, 07, 08, 09 |
| B | `tests/fixtures-cleanup-text-clean.txt` (Dataset A after a full cleanup) | TC-CLEAN-04 |
| C | `tests/fixtures-cleanup-text-quotes.md` (empty quote lines inside and outside quotes, and in a code block) | TC-CLEAN-10 |

---

## Test Matrix

| Test ID | Scenario | Pre-conditions | Action Steps | Expected Outcome |
| :--- | :--- | :--- | :--- | :--- |
| **TC-CLEAN-01** | Tool Visibility in Sidebar | Dataset A open | 1. Open the Tools tab. | 1. "Tidy & Sanitize Text" is listed. Hovering shows its description. No toolbar icon for it. |
| **TC-CLEAN-02** | Full Document Cleanup | Dataset A open, no selection | 1. Click "Tidy & Sanitize Text".<br>2. Confirm. | 1. The prompt says `Scope: Entire document`.<br>2. Toast `Document cleaned (24 fixes applied)`. The text is exactly the **Expected Output A** block below (24 lines, = Dataset B). Double spaces of section 3 are kept. |
| **TC-CLEAN-03** | Selection-only Cleanup | Dataset A open | 1. Select lines 17 to 23 (section 3).<br>2. Click "Tidy & Sanitize Text", confirm. | 1. The prompt says `Scope: Current selection`.<br>2. Toast `Selection cleaned (13 fixes applied)`. Lines 17 to 23 are exactly the **Expected Output B** block below. Every other line is unchanged (the 4 leading blank lines are still there). |
| **TC-CLEAN-04** | Already Clean Document | Dataset B open | 1. Click "Tidy & Sanitize Text", confirm. | 1. Toast `Text is already clean!`. The file stays unchanged (no unsaved mark). |
| **TC-CLEAN-05** | Double Spaces: full document vs selection | Results of TC-CLEAN-02 and TC-CLEAN-03 | 1. Compare line `    const variable  =  "hello  world";` in both results. | 1. Full document: the line is unchanged.<br>2. Selection: `    const variable = "hello world";` (4-space indent kept). |
| **TC-CLEAN-06 (T1)** | Auto-cleanup on Save (unsaved file) | Settings: "Auto-cleanup on Save" checked. Dataset A open (it has no file on disk yet) | 1. Click **Save**, choose a folder and name in the Save dialog, confirm. | 1. The editor shows exactly **Expected Output A**, and the saved file has the same content. |
| **TC-CLEAN-07 (T2)** | Auto-cleanup on Save (file on disk) | The file saved in TC-CLEAN-06 open. "Auto-cleanup on Save" checked | 1. Add 3 spaces at the end of line 1.<br>2. Press Ctrl+S. | 1. The 3 spaces are gone in the editor and in the saved file. |
| **TC-CLEAN-08 (T3)** | Auto-cleanup on Open | Settings: "Auto-cleanup on Open" checked | 1. Open Dataset A (`?open=` link above). | 1. The editor shows exactly **Expected Output A** right after opening, marked unsaved. |
| **TC-CLEAN-09 (T4)** | Auto-cleanup on Reload | "Auto-cleanup on Open" checked. The file saved in TC-CLEAN-06 open | 1. In another editor, add 3 spaces at the end of line 1 of that file and save.<br>2. Click **Reload** in Famouskai. | 1. The file reloads without the 3 spaces. |
| **TC-CLEAN-10** | Empty Blockquote Lines (Markdown) | Dataset C open, no selection | 1. Click "Tidy & Sanitize Text", confirm. | 1. The text is exactly the **Expected Output C** block below: the empty quotes at the start, at the end of the quote and after `Outside text.` are gone; the `>` between the two quotes stays; the code block keeps both `>` lines. |

---

## Expected Outputs

### Expected Output A (Dataset A after a full cleanup, = Dataset B)

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

The file ends right after the last line, with one newline (no blank line).

### Expected Output B (lines 17 to 23 of Dataset A after a selection cleanup)

```text
3. Double spaces vs Indentation testing:
    const variable = "hello world";
	function testFunction( param1, param2 ) {
        if (true) {
            return "preserved indentation tests";
        }
    }
```

### Expected Output C (Dataset C after a full cleanup)

````markdown
# Quotes

> first quote
>
> second quote

Outside text.

> quote with content

```text
>
>
```
````
