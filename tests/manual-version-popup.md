# Version Popup & Copy - Manual Test Plan

## Overview
This document describes the manual test scenarios for the version popup interaction on the sidebar footer.

## Test Matrix

| Test ID | Scenario | Pre-conditions | Action Steps | Expected Outcome |
|---|---|---|---|---|
| VER-01 | Version hover state | Sidebar is open | Hover the version button at the bottom of the sidebar (`#app-version`) | The mouse pointer becomes a hand, the button background turns to the hover gray of the sidebar buttons, the text gets brighter. |
| VER-02 | Click on version button | The button shows the version, the `CACHE_NAME` of `sw.js` (for example `famouskai-0.2.1-v49`) | 1. Click the version button.<br>2. Paste (`Ctrl+V`) in the editor. | 1. A green toast at the bottom right reads `Version famouskai-0.2.1-v49 copied!` (the version shown).<br>2. The pasted text is exactly the version, for example `famouskai-0.2.1-v49`, nothing else. |
| VER-03 | Disabled state when loading/unresolved | The button reads `Reading version...` (while loading), `Unknown version` (no version found in `sw.js`) or `Local Mode` (`sw.js` cannot be read, for example a page opened from `file://`) | 1. Hover the version button.<br>2. Click it. | 1. No hand pointer, no hover background.<br>2. No toast, the clipboard is unchanged. |
| VER-04 | Hide menu button style check | Sidebar is open | Look at the hide sidebar button (`#btn-hide-sidebar`), then hover it | Normal state: the same text color as the other sidebar buttons. Hover: the hover gray background, as on the version button. |

## Test Datasets
No dataset: these tests need no file content.
