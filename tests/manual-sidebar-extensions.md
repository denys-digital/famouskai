# Manual Test Specification: Sidebar Extensions & Demo Tab (Sidebar Lot 3)

This document provides step-by-step manual test procedures for verifying custom sidebar extension tabs and the developer demo tab (`plugins/ext-sidebar-demo.js`).

---

## Test Scenarios Matrix

| Test ID | Scenario | Pre-conditions | Action Steps | Expected Outcome |
| --- | --- | --- | --- | --- |
| **EXT-01** | Demo Tab Off by Default | Clean browser session, `famouskai_dev_demo_tab` not set in LocalStorage | 1. Open Famouskai in browser.<br>2. Inspect `#sidebar-tab-group` in top toolbar.<br>3. Open DevTools Console and evaluate `window.FamousPluginCore.Sidebar.getTab('demo')`. | 1. Only the 4 core tabs (Explorer, Outline, Tools, Settings) are visible in the toolbar.<br>2. No `D` or `Demo` tab button exists.<br>3. `getTab('demo')` returns `undefined`. |
| **EXT-02** | Enable Demo Tab via LocalStorage | App loaded | 1. In DevTools Console, run: `localStorage.setItem('famouskai_dev_demo_tab', '1');`<br>2. Reload the page (F5).<br>3. Inspect `#sidebar-tab-group`. | 1. A new tab button with icon `D` and title `Demo extension` appears after the Settings tab.<br>2. Tab button hover/accent color matches `var(--color-tab-tools)`. |
| **EXT-03** | Keyboard Navigation with Extension Tab | Demo tab enabled (`famouskai_dev_demo_tab === '1'`), app loaded | 1. Click the Settings tab button to focus it.<br>2. Press `ArrowRight` on keyboard.<br>3. Press `ArrowLeft` on keyboard. | 1. Focus moves from Settings to the Demo (`D`) tab button.<br>2. Focus returns smoothly to Settings button. |
| **EXT-04** | Open Demo Tab & Panel Render | Demo tab enabled, app loaded | 1. Click the Demo (`D`) tab button.<br>2. Inspect `#sidebar-left` and `#panel-demo`. | 1. Sidebar opens to the Demo panel.<br>2. Active line on top of sidebar matches `var(--color-tab-tools)`.<br>3. Panel displays `DEMO EXTENSION` title, descriptive text, and `Open Demo Drawer` button. |
| **EXT-05** | Open Side Drawer in Size M | Demo tab open and visible | 1. Click `Open Demo Drawer` button in the Demo panel.<br>2. Inspect `#sidebar-drawer`. | 1. Side drawer overlay slides open to the right of the sidebar.<br>2. Drawer title displays `Demo drawer`.<br>3. Drawer width is size M (520px, 2x sidebar width).<br>4. Drawer accent band matches active tab color (`var(--color-tab-tools)`). |
| **EXT-06** | Close Side Drawer | Side drawer open | 1. Click the close button (`««`) in drawer header or next to "Hide Menu". | 1. Drawer slides closed smoothly without closing the sidebar. |
| **EXT-07** | Disable Demo Tab | Demo tab enabled | 1. In DevTools Console, run: `localStorage.removeItem('famouskai_dev_demo_tab');`<br>2. Reload the page (F5).<br>3. Inspect `#sidebar-tab-group`. | 1. Demo tab `D` is gone.<br>2. App operates normally with the 4 core tabs only.<br>3. No console errors thrown. |
