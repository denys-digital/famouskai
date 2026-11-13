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
Plain text line of section 2.

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
| **TSB-03** | Recent Files Stack | App loaded | 1. Open a local file `test1.txt`.<br>2. Open a 2nd file `test2.md`.<br>3. Check Recent Files section in Explorer.<br>4. Click `test1.txt` in recent files.<br>5. `Ctrl+Click` `test2.md`.<br>6. Open a 3rd file `test3.md`, open `test1.txt` again, then `Ctrl+Shift+Click` `test3.md` in recent files. | 1. `test2.md` appears at top of recent files stack, `test1.txt` below it.<br>2. Clicking `test1.txt` loads it into current editor instance.<br>3. `Ctrl+Click` opens `test2.md` in a new popup window.<br>4. `Ctrl+Shift+Click` opens `test3.md` in a new browser tab. |
| **TSB-04** | Famous Marks Quick Filters | Sample text dataset pasted in editor | 1. Switch to Outline tab.<br>2. Click `﹥` badge in filter bar.<br>3. Click `TODO` badge.<br>4. Click `All` badge. | 1. Outline shows only the 3 `﹥` lines: `Core Local-First Principles`, `Workspace selector dropdown`, `Drag-and-drop section reordering`.<br>2. Outline filters to display `TODO: Audit IndexedDB...`.<br>3. All headings and marks reappear. |
| **TSB-05** | Drag & Drop Section Reordering | Open `tests/fixtures-outline-sample.md` in Famouskai (saved file, 3 heading levels, text with and without Famous Marks, a code block) | 1. Open Outline tab, click `⇄ Reorder`.<br>2. Drag `2. Budget` and drop it on `1. Travel plan`.<br>3. Press `Ctrl+Z`.<br>4. Drag `1.1.2 Day 2` and drop it on `1.1.1 Day 1`.<br>5. Press `Ctrl+Z`.<br>6. Drag `1. Travel plan` and drop it on `1.2 Kyoto` (its own sub-heading).<br>7. Keep Reorder on and open `tests/fixtures-outline-sample.js`.<br>8. Open `tests/fixtures-outline-sample.md` again. | 1. Reorder button becomes active. The Outline lists only the Markdown headings (`#`, `##`, `###`), each with a `⋮⋮` handle: no `﹥`, `•`, `°` or TODO lines (they move with their heading).<br>2. The whole `# 2. Budget` section moves to the top of the file: its `°` line, `Hotels: ...`, the code block and `## 2.1 Daily costs` with its `•` line and text. `# 1. Travel plan` and everything under it follow unchanged. Toast "Section reordered!". The file shows as unsaved.<br>3. One `Ctrl+Z` restores the original text.<br>4. `### 1.1.2 Day 2` with `﹥ Day trip to Kamakura` and `Lunch near the station.` moves above `### 1.1.1 Day 1`; the rest of `## 1.1 Tokyo` stays in place.<br>5. Original text back.<br>6. Nothing changes (a section cannot be dropped inside itself).<br>7. The `⇄ Reorder` button is hidden and the Outline shows no `⋮⋮` handles (Reorder is Markdown only: HTML, JS and CSS items have no clean block).<br>8. `⇄ Reorder` is visible again and not active; the Outline lists headings and Famous Mark lines again. |
| **TSB-06** | Active Windows Tracker | Multiple Famouskai windows open | 1. Open a 2nd Famouskai popup window.<br>2. Open Settings tab in 1st window.<br>3. Observe Active Windows section. | 1. Active Windows section lists "This Window" and the 2nd open instance.<br>2. Clicking the 2nd instance sends focus request heartbeat. |
| **TSB-07** | Screen Layout Positioning | App running in popup window context | 1. Open Settings tab.<br>2. Click `◧ Left` button.<br>3. Click `◨ Right` button.<br>4. Click `□ Full` button. | 1. Window resizes and moves to left 50% of screen.<br>2. Window resizes and moves to right 50% of screen.<br>3. Window maximizes to full available screen. |
| **TSB-08** | Side Drawer Overlay for Plugins | App loaded | 1. Open Tools tab.<br>2. Click `Manage Snippets` button. | 1. Side Drawer overlay slides open over sidebar.<br>2. Form for managing/adding snippets is rendered in drawer.<br>3. Clicking the double chevron button («, title "Close drawer") in the drawer header closes the drawer smoothly. |
| **TSB-09** | Full View Preview: Sidebar Auto-Close & Tab Deselection | App loaded with Markdown content, setting "Outline open on preview" off | 1. Open Explorer or Tools tab.<br>2. Open Preview.<br>3. Click Full View.<br>4. Observe sidebar and toolbar tab buttons.<br>5. Click Full View again (or close Preview). | 1. Sidebar is open on the chosen tab.<br>2. Preview splits screen.<br>3. Full View expands.<br>4. Sidebar closes automatically, no tab button is highlighted / selected.<br>5. Exiting Full View (or closing Preview) restores the sidebar and the previously active tab. |
| **TSB-10** | Full View Preview: Constant Sidebar Width | App loaded with Markdown preview in Full View | 1. In Full View, click Explorer, Outline, Tools, Settings tabs one by one. | 1. Sidebar opens and remains at constant 260px width across all tabs without shrinking. |
| **TSB-11** | Setting "Outline open on preview" | App loaded with Markdown document | 1. In Settings tab, check "Outline open on preview".<br>2. Close sidebar.<br>3. Open Preview (split or Full View).<br>4. Reload application and re-test. | 1. Setting checkbox is checked and saved.<br>2. Sidebar closed.<br>3. Opening Preview automatically opens the sidebar on the Outline tab, and Full View does not close it.<br>4. Setting remains checked after reload. |
