# Manual Test Specification: Contextual New Instance Button ('+')

## Overview
This specification details manual test scenarios for the contextual '+' button behavior in Famouskai, verifying tab vs popup context detection and automatic window positioning.

## Scope
- Context Detection: Standard browser tab vs Popup / PWA standalone window.
- Tab Context Behavior: Clicking '+' in a browser tab opens a new browser tab.
- Popup Context Behavior: Clicking '+' in a popup window opens a new popup window.
- Wide Screen Side-by-Side Positioning: When initial popup is on the left, new popup automatically opens on the right.
- Standard Screen Positioning: New popup opens in full screen mode.

---

## Test Scenarios

| Test ID | Scenario | Pre-conditions | Action Steps | Expected Outcome |
| :--- | :--- | :--- | :--- | :--- |
| **CTX-WIN-01** | Open new instance from browser tab | Famouskai is open in a standard browser tab. | 1. Click the '+' (`btn-new-window`) button in the toolbar.<br>2. Observe the resulting browser behavior. | A new Famouskai instance opens in a new browser tab in the current browser window. The window is not detached or resized. |
| **CTX-WIN-02** | Open new instance from popup window (Standard Screen) | Famouskai is open in a popup window on a standard display width (width <= 2000px). | 1. Click the '+' (`btn-new-window`) button in the toolbar.<br>2. Observe the resulting browser window. | A new Famouskai instance opens in a new popup window in full-screen mode. |
| **CTX-WIN-03** | Open new instance from popup window (Wide Screen, Left Initial Position) | Famouskai is open in a popup window on a wide screen display (> 2000px width) positioned on the left side of the screen. | 1. Click the '+' (`btn-new-window`) button in the toolbar.<br>2. Observe the new window position. | A new Famouskai instance opens in a new popup window positioned on the right half of the screen, creating a side-by-side view with the first window. |
| **CTX-WIN-04** | Open new instance from popup window (Wide Screen, Right Initial Position) | Famouskai is open in a popup window on a wide screen display (> 2000px width) positioned on the right side of the screen. | 1. Click the '+' (`btn-new-window`) button in the toolbar.<br>2. Observe the new window position. | A new Famouskai instance opens in a new popup window positioned on the left half of the screen. |
| **CTX-WIN-05** | Button Tooltip Update | Famouskai instance is launched in either tab or popup mode. | 1. Hover over the '+' button in the toolbar.<br>2. Inspect the tooltip title. | Tooltip shows "Open new tab" when running in a browser tab, and "Open new window" when running in a popup/standalone window. |

---

## Sample Text Dataset
For manual testing, open or paste the following test dataset into the editor:

```markdown
# Contextual '+' Window Opening Manual Test Data

## Test Case Checklist
- [ ] Test 1: Tab mode opens new tab
- [ ] Test 2: Popup mode (standard screen) opens full screen popup
- [ ] Test 3: Popup mode (wide screen, left) opens popup on right
- [ ] Test 4: Popup mode (wide screen, right) opens popup on left
- [ ] Test 5: Tooltip reflects current window context
```
