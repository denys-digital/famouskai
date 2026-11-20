# Manual Test Specification: Sidebar Extensions & Demo Tab (Sidebar Lot 3)

This document provides step-by-step manual test procedures for verifying custom sidebar extension tabs and the developer demo tab (`plugins/ext-sidebar-demo.js`).

No dataset: these tests need no file content. The Console commands are typed in DevTools (`Ctrl+Shift+I`) > **Console** of the Famouskai tab.

---

## Test Scenarios Matrix

| Test ID | Scenario | Pre-conditions | Action Steps | Expected Outcome |
| --- | --- | --- | --- | --- |
| **EXT-01** | Demo Tab Off by Default | `localStorage.getItem('famouskai_dev_demo_tab')` returns `null` | 1. Open Famouskai.<br>2. Look at the tab buttons of the top toolbar.<br>3. In the Console: `window.FamousPluginCore.Sidebar.getTab('demo')` | 2. Exactly 4 tab buttons: Explorer, Outline, Tools, Settings. No `D` button.<br>3. `undefined`. |
| **EXT-02** | Enable Demo Tab | App loaded | 1. In the Console: `localStorage.setItem('famouskai_dev_demo_tab', '1')`<br>2. Reload the page (`Ctrl+R`).<br>3. Hover the new last tab button. | 2. A 5th tab button `D` appears right after Settings.<br>3. Tooltip `Demo extension`; on hover it takes the same accent color as the Tools tab. |
| **EXT-03** | Keyboard Navigation with Extension Tab | Demo tab enabled, app loaded | 1. Click the Settings tab button.<br>2. Press `→`.<br>3. Press `←`. | 2. The focus ring moves to the `D` button.<br>3. The focus ring is back on Settings. |
| **EXT-04** | Open Demo Tab & Panel Render | Demo tab enabled, app loaded | 1. Click the `D` tab button. | 1. The sidebar opens on the Demo panel. The line at the top of the sidebar has the Tools tab color. The panel shows, top to bottom:<br>DEMO EXTENSION<br>This is a demo extension tab showcasing the dynamic sidebar tab registry and side drawer overlay.<br>Open Demo Drawer (full-width button) |
| **EXT-05** | Open Side Drawer in Size M | Demo panel open | 1. Click `Open Demo Drawer`. | 1. A drawer opens to the right of the sidebar, title `Demo drawer`, text `This drawer was opened from the Demo tab in size M (2x sidebar width).` Its width is twice the sidebar width (520 px with the default 260 px sidebar). Its accent band has the Tools tab color. |
| **EXT-06** | Close Side Drawer | Drawer open | 1. Click the close button `««` of the drawer header. | 1. The drawer closes; the sidebar stays open on the Demo panel. |
| **EXT-07** | Disable Demo Tab | Demo tab enabled | 1. In the Console: `localStorage.removeItem('famouskai_dev_demo_tab')`<br>2. Reload the page (`Ctrl+R`). | 2. The `D` button is gone; the 4 core tabs only. The Console shows no red error. |
