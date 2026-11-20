# Manual Test Specification: Workspace File Click Behaviors (clic-on-wks-files)

## Overview
This specification details manual test scenarios for opening workspace files in Famouskai via click gestures in the Workspace Explorer sidebar.

## Scope
- Standard Single Click: Open file in current instance.
- `Ctrl+Click` / `Cmd+Click`: Open file in a new popup window instance.
- `Ctrl+Shift+Click` / `Cmd+Shift+Click`: Open file in a new browser tab instance.
- Lexicon sidebar section updates.

## Setup

Desktop Chromium. Open `tests/fixtures-syntax-sample.txt` with `<address>/?open=tests/<file>`, save it with `Ctrl+S` as `sample.txt` in a new empty folder `wks-test`, then load `wks-test` as workspace (Explorer tab). Open a new `[New]` buffer before each test. Allow popups for the address when Chrome asks.

---

## Test Scenarios

| Test ID | Scenario | Pre-conditions | Action Steps | Expected Outcome |
| :--- | :--- | :--- | :--- | :--- |
| **WKS-CLK-01** | Standard click opens file in current instance | Setup done, `[New]` with no unsaved star. | 1. Click `sample.txt` in the Workspace tree. | In the same window: line 1 reads `Famouskai syntax sample: plain text (ace/mode/text)`, 36 lines. The toolbar file name reads `sample.txt`, the tab title `sample.txt - Famouskai Editor`. No new window or tab. |
| **WKS-CLK-02** | Ctrl+Click / Cmd+Click opens file in popup window | Setup done. | 1. Hold `Ctrl` (`Cmd` on Mac) and click `sample.txt` in the Workspace tree. | A new popup window (no address bar, no tabs) opens Famouskai with `sample.txt` (line 1 as WKS-CLK-01) and the toast `File opened in new window`. The first window still shows `[New]`. |
| **WKS-CLK-03** | Ctrl+Shift+Click / Cmd+Shift+Click opens file in new tab | Setup done. | 1. Hold `Ctrl`+`Shift` (`Cmd`+`Shift` on Mac) and click `sample.txt` in the Workspace tree. | A new tab in the same browser window opens Famouskai with `sample.txt` (line 1 as WKS-CLK-01) and the toast `File opened in new window`. The first tab still shows `[New]`. |

---
