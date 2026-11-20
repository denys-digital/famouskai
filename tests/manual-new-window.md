# Manual Test Specification: Contextual New Instance Button ('+')

## Overview
This specification details manual test scenarios for the contextual '+' button behavior in Famouskai, verifying tab vs popup context detection and automatic window positioning.

## Scope
- Context Detection: Standard browser tab vs Popup / PWA standalone window.
- Tab Context Behavior: Clicking '+' in a browser tab opens a new browser tab.
- Popup Context Behavior: Clicking '+' in a popup window opens a new popup window.
- Wide Screen Side-by-Side Positioning: When initial popup is on the left, new popup automatically opens on the right.
- Standard Screen Positioning: New popup opens in full screen mode.

## Setup

Desktop Chromium. No file content is needed: the tests start from `[New]`. A "popup window" is a Famouskai window without address bar: the installed app, or the window opened by `Ctrl`+click on a workspace file (`tests/manual-workspace-files-click.md`, WKS-CLK-02). "Wide screen" = screen width over 2000 px, or screen width × zoom of the system (devicePixelRatio) over 2000 px; otherwise "standard screen". Allow popups for the address when Chrome asks.

---

## Test Scenarios

| Test ID | Scenario | Pre-conditions | Action Steps | Expected Outcome |
| :--- | :--- | :--- | :--- | :--- |
| **CTX-WIN-01** | Open new instance from browser tab | Famouskai is open in a standard browser tab. | 1. Click the '+' (`btn-new-window`) button in the toolbar.<br>2. Observe the resulting browser behavior. | A new tab opens next to the current one in the same browser window, with Famouskai on `[New]` (the address has no `?open=` or `?fixture=`). The first tab keeps its size and content. |
| **CTX-WIN-02** | Open new instance from popup window (Standard Screen) | Famouskai is open in a popup window on a standard display width (width <= 2000px). | 1. Click the '+' (`btn-new-window`) button in the toolbar.<br>2. Observe the resulting browser window. | A new popup window opens with Famouskai on `[New]`, covering the whole usable screen (the screen minus the system shelf or taskbar). It is a normal window, not the F11 full-screen mode. |
| **CTX-WIN-03** | Open new instance from popup window (Wide Screen, Left Initial Position) | Famouskai is open in a popup window on a wide screen display (> 2000px width) positioned with its left edge in the left quarter of the screen. | 1. Click the '+' (`btn-new-window`) button in the toolbar.<br>2. Observe the new window position. | A new popup window opens on the right half of the screen (left edge at the middle, half the usable width, full usable height), with Famouskai on `[New]`. |
| **CTX-WIN-04** | Open new instance from popup window (Wide Screen, Right Initial Position) | Famouskai is open in a popup window on a wide screen display (> 2000px width) with its left edge right of the left quarter of the screen. | 1. Click the '+' (`btn-new-window`) button in the toolbar.<br>2. Observe the new window position. | A new popup window opens on the left half of the screen (left edge at the screen edge, half the usable width, full usable height), with Famouskai on `[New]`. |
| **CTX-WIN-05** | Button Tooltip Update | Famouskai instance is launched in either tab or popup mode. | 1. Hover over the '+' button in the toolbar.<br>2. Inspect the tooltip title. | In a browser tab the tooltip reads `Open new tab`. In a popup window or the installed app it reads `Open new window`. |

---
