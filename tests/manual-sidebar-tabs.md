# Manual Test Specification: Tabbed Sidebar Framework & Features

This document provides step-by-step manual test procedures for verifying the **Tabbed Sidebar Framework**, including top-toolbar tab navigation, multi-workspace switching, recent files stack, outline drag-and-drop reordering, Famous Marks quick filters, active windows detection, screen positioning, and the side drawer overlay.

---

## Sample Text Dataset for Manual Testing

Copy and paste the following dataset into Famouskai for testing:

```markdown
# Project Famouskai Specification
﹥ Core Local-First Principles
- 100% offline PWA architecture
- Zero-Build and Zero-CDN

## Architecture Modules
• Single Global Namespace (window.FamousPluginCore)
° Tabbed Sidebar Framework Integration
// TODO: Audit IndexedDB quota limits
// @denys-digital check CORS fallback

### Detailed Components
# 1. Explorer Module
﹥ Workspace selector dropdown
• Recent files stack (max 10)

# 2. Outline Module
﹥ Drag-and-drop section reordering
• Famous Marks quick filter badges

# 3. Windows & Settings
° Screen layout tile controls
• Active window heartbeat tracker
```

---

## Test Scenarios Matrix

| Test ID | Scenario | Pre-conditions | Action Steps | Expected Outcome |
| --- | --- | --- | --- | --- |
| **TSB-01** | Top Toolbar Tab Navigation | App loaded, sidebar hidden | 1. Click the Explorer tab icon in top toolbar.<br>2. Click the Outline tab icon.<br>3. Click the Outline tab icon again.<br>4. Click the Settings tab icon. | 1. Sidebar opens displaying Explorer panel, tab icon highlighted.<br>2. Panel switches to Outline, Outline tab highlighted.<br>3. Sidebar closes, no tab highlighted.<br>4. Sidebar opens to Settings panel. |
| **TSB-02** | Multi-Workspace Switcher | App loaded with file access | 1. Open Explorer panel.<br>2. Click `+` button in header.<br>3. Choose a local directory in native picker.<br>4. Repeat for a 2nd directory.<br>5. Select 1st directory from dropdown. | 1. Directory added to `#workspace-select` dropdown.<br>2. 2nd directory added to top of dropdown.<br>3. Selecting 1st directory updates file tree immediately. |
| **TSB-03** | Recent Files Stack | App loaded | 1. Open a local file `test1.txt`.<br>2. Open a 2nd file `test2.md`.<br>3. Check Recent Files section in Explorer.<br>4. Click `test1.txt` in recent files.<br>5. `Ctrl+Click` `test2.md`. | 1. `test2.md` appears at top of recent files stack, `test1.txt` below it.<br>2. Clicking `test1.txt` loads it into current editor instance.<br>3. `Ctrl+Click` opens `test2.md` in a new popup window. |
| **TSB-04** | Famous Marks Quick Filters | Sample text dataset pasted in editor | 1. Switch to Outline tab.<br>2. Click `﹥` badge in filter bar.<br>3. Click `TODO` badge.<br>4. Click `All` badge. | 1. Outline filters to display only `﹥ Core Local-First Principles` and `﹥ Workspace selector dropdown`.<br>2. Outline filters to display `TODO: Audit IndexedDB...`.<br>3. All headings and marks reappear. |
| **TSB-05** | Drag & Drop Section Reordering | Sample text dataset pasted in editor | 1. Open Outline tab.<br>2. Click `⇄ Reorder` toggle button.<br>3. Drag `# 2. Outline Module` item and drop it onto `# 1. Explorer Module`. | 1. Reorder button becomes active.<br>2. Text block `# 2. Outline Module` moves above `# 1. Explorer Module` directly in the editor document. Toast confirms "Section reordered!". |
| **TSB-06** | Active Windows Tracker | Multiple Famouskai windows open | 1. Open a 2nd Famouskai popup window.<br>2. Open Settings tab in 1st window.<br>3. Observe Active Windows section. | 1. Active Windows section lists "This Window" and the 2nd open instance.<br>2. Clicking the 2nd instance sends focus request heartbeat. |
| **TSB-07** | Screen Layout Positioning | App running in popup window context | 1. Open Settings tab.<br>2. Click `◧ Left` button.<br>3. Click `◨ Right` button.<br>4. Click `□ Full` button. | 1. Window resizes and moves to left 50% of screen.<br>2. Window resizes and moves to right 50% of screen.<br>3. Window maximizes to full available screen. |
| **TSB-08** | Side Drawer Overlay for Plugins | App loaded | 1. Open Tools tab.<br>2. Click `Manage Snippets` button. | 1. Side Drawer overlay slides open over sidebar.<br>2. Form for managing/adding snippets is rendered in drawer.<br>3. Clicking `×` closes drawer smoothly. |
