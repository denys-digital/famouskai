# Manual Test Specification: Workspace File Click Behaviors (clic-on-wks-files)

## Overview
This specification details manual test scenarios for opening workspace files in Famouskai via click gestures in the Workspace Explorer sidebar.

## Scope
- Standard Single Click: Open file in current instance.
- `Ctrl+Click` / `Cmd+Click`: Open file in a new popup window instance.
- `Ctrl+Shift+Click` / `Cmd+Shift+Click`: Open file in a new browser tab instance.
- Lexicon sidebar section updates.

---

## Test Scenarios

| Test ID | Scenario | Pre-conditions | Action Steps | Expected Outcome |
| :--- | :--- | :--- | :--- | :--- |
| **WKS-CLK-01** | Standard click opens file in current instance | Workspace folder is loaded in sidebar with readable files. | 1. Click on any file (e.g. `syntaxe.js`) in the Workspace tree.<br>2. Observe current editor. | File content is loaded in the current Ace editor instance. Status bar updates with current file name. |
| **WKS-CLK-02** | Ctrl+Click / Cmd+Click opens file in popup window | Workspace folder loaded with readable files. Browser allows popups. | 1. Hold `Ctrl` (or `Cmd` on Mac) and click on a file in the Workspace tree.<br>2. Observe browser windows. | A new Famouskai window opens as a popup with the selected file loaded and ready for editing. Toast notification indicates "File opened in new window". |
| **WKS-CLK-03** | Ctrl+Shift+Click / Cmd+Shift+Click opens file in new tab | Workspace folder loaded with readable files. | 1. Hold `Ctrl`+`Shift` (or `Cmd`+`Shift` on Mac) and click on a file in the Workspace tree.<br>2. Observe browser tabs. | A new Famouskai tab opens in the browser with the selected file loaded. Current tab remains intact. |

---

## Sample Text Dataset
For manual testing, create a workspace folder containing the following dummy file (`sample.txt`):

```text
Famouskai Workspace Click Test File
Line 1: Testing standard click
Line 2: Testing Ctrl+click / Cmd+click
Line 3: Testing Ctrl+Shift+click / Cmd+Shift+click
```
