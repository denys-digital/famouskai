# Version Popup & Copy - Manual Test Plan

## Overview
This document describes the manual test scenarios for the version popup interaction on the sidebar footer.

## Test Matrix

| Test ID | Scenario | Pre-conditions | Action Steps | Expected Outcome |
|---|---|---|---|---|
| VER-01 | Version hover state | Sidebar is open | Hover mouse over the `#app-version` button at the bottom of the sidebar | Mouse cursor changes to pointer (`main-cliquable`), background changes to hover color (`var(--color-bg-hover)`), text becomes brighter (`var(--color-text-primary)`). |
| VER-02 | Click on version button | Service worker loaded version successfully (e.g., `famouskai-v36.2`) | Click on `#app-version` button | 1. The exact version string (`famouskai-v36.2`) is copied to the system clipboard.<br>2. A toast appears at the bottom right displaying `"Version famouskai-v36.2 copied!"` with success styling (green badge). |
| VER-03 | Disabled state when loading/unresolved | Version reading is still in progress (`Reading version...`) or failed (`Unknown version`, `Local Mode`) | Observe and try clicking `#app-version` button | Button is disabled (`disabled` attribute present), mouse hover does not display pointer/hover background, clicking performs no action. |
| VER-04 | Hide menu button style check | Sidebar is open | Observe `#btn-hide-sidebar` styling on hover and normal state | Button inherits standard button text color and displays hover highlight without CSS `color` directive overrides. |

## Verification Sample
No document text required for this test.
