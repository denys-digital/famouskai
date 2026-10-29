# Famouskai Tabbed Sidebar

This document describes the architecture, behavior, global JavaScript API, panel components, and storage keys for the tabbed sidebar in Famouskai 0.1.0.

In Famouskai 0.1.0, the left sidebar features four fixed navigation tabs: Explorer, Outline, Tools, and Windows & Settings. Adding custom tabs from extensions or plugins is not supported in 0.1.0.

---

## 1. Behavior and Accessibility

1. **Toolbar Navigation:**
   - The top toolbar contains tab buttons (`#tab-explorer`, `#tab-outline`, `#tab-tools`, `#tab-settings`) inside `#sidebar-tab-group`.
   - Each tab button represents one of the four core panels.

2. **Toggle and Mutual Exclusion:**
   - Clicking an inactive tab switches to that tab and opens the sidebar if hidden.
   - Clicking the currently active tab toggles (closes) the sidebar panel.
   - Clicking the Hide Menu button (`#btn-hide-sidebar`) inside the sidebar header closes the sidebar.
   - While the Side Drawer is open, a double-chevron button (`#btn-hide-drawer`) appears to the right of Hide Menu and closes the drawer only. The drawer header has the same double-chevron button (`#sidebar-drawer-close`).
   - Active tab buttons retain their highlighted CSS state (`.is-active`) while the sidebar remains open.

3. **Side Drawer Overlay Architecture:**
   - The sliding overlay container (`#sidebar-drawer`) slides in from the left over the main editor workspace.
   - It renders heavy extension dialogs (such as the Magic Snippets Manager) without obscuring the main sidebar layout or displacing editor focus.

4. **ARIA Accessibility Semantics:**
   - `#sidebar-tab-group` has `role="tablist"` and `aria-label="Sidebar"`.
   - Tab buttons have `role="tab"`, `aria-selected` (`true` when active and open, `false` otherwise), and `aria-controls` pointing to the panel ID (`panel-<name>`).
   - Panel containers (`#panel-explorer`, `#panel-outline`, `#panel-tools`, `#panel-settings`) have `role="tabpanel"` and `aria-labelledby` pointing to their matching tab ID (`tab-<name>`).

---

## 2. API Reference: `window.FamousPluginCore.Sidebar`

The global sidebar manager attaches to `window.FamousPluginCore.Sidebar`.

### Public Interface
- `TABS`: Array of the 4 tabs, each `{ id, color }`: ids `'explorer'`, `'outline'`, `'tools'`, `'settings'`; `color` is a CSS token of `style.css` (`var(--color-tab-explorer)`, `--color-tab-outline`, `--color-tab-tools`, `--color-tab-settings`). The color fills the tab button on hover and when selected, and draws the line on top of the open panel.
- `getTab(tabId)`: Returns the `TABS` entry with this id, or `undefined`.
- `activeTab`: String holding current active tab ID (defaults to `'explorer'`).
- `isOpen`: Boolean indicating whether the sidebar panel is currently visible.
- `switchTab(tabId, openIfClosed = true)`: Switches to `tabId` and opens the sidebar if `openIfClosed` is true and sidebar is closed.
- `toggleSidebar(tabId)`: Toggles visibility; if `tabId` is provided, switches to tab or closes if active.
- `openSidebar()`: Opens sidebar panel (`#sidebar-left`) and triggers an editor resize event.
- `closeSidebar()`: Closes sidebar panel and closes any active side drawer overlay.
- `openDrawer(title, content)`: Opens Side Drawer overlay with a title string and HTML string or HTMLElement content.
- `closeDrawer()`: Closes Side Drawer overlay.

### Internal Lifecycle & UI Helpers
- `applyTabColors()`: Sets `--sidebar-tab-color` on each tab button from `TABS`.
- `init()`: Binds event listeners, restores persisted tab state, and reads startup open/close preferences.
- `bindToolbarTabs()`: Attaches click listeners to `.sidebar-tab-btn` buttons.
- `bindHideButtons()`: Attaches click listener to `#btn-hide-sidebar`.
- `updatePanelsDisplay()`: Updates CSS display on panel elements based on `activeTab`.
- `updateTabUI()`: Updates `.is-active` class and `aria-selected` attributes on toolbar tab buttons, and sets `--sidebar-active-color` on `#sidebar-left` (color of the line on top of the panel).
- `initSideDrawer()`: Attaches the close listener to `#sidebar-drawer-close` and `#btn-hide-drawer`.
- `setDrawerState(isOpen)`: Toggles the `sidebar-drawer-open` class on `#sidebar-left` (shows `#btn-hide-drawer`).

---

## 3. Tab Panels and Components

### Explorer Panel (`#panel-explorer`)
- **Workspaces Selector:** Dropdown (`#workspace-select`) listing up to 10 saved workspace handles from IndexedDB. Includes a Set New Workspace button (`#btn-add-workspace`) and refresh button (`#btn-refresh-workspace`).
- **Workspace File Tree:** Folder explorer tree (`#workspace-file-list`) with search input (`#workspace-search`) and extension filter badges (`#workspace-ext-filters`).
- **Recent Files Stack:** Stack list (`#recent-files-list`) holding up to 10 recent file records.

### Outline Panel (`#panel-outline`)
- **Heading Fold Controls:** Unfold all button (`#btn-unfold-all`) and level fold buttons (`H1` to `H4`).
- **Copy Outline:** Copy button (`#btn-outline-copy`) to copy structure text to clipboard.
- **Search, Sort & Reorder Controls:** Search input (`#outline-search`), A-Z sort toggle button (`#btn-outline-sort`), and Drag & Drop reorder mode button (`#btn-outline-reorder-mode`).
- **Filter Badges:** Quick filter badges (`#outline-mark-filters`) for `All`, Famous Marks (`﹥`, `•`, `°`), `TODO`, `@`, `</>` HTML/XML tags, and `JS` symbols.
- **Table of Contents Tree:** Rendered heading and mark structure (`#toc-list`).

### Tools Panel (`#panel-tools`)
- **Contextual Tools:** Dynamic list (`#tools-list`) of registered tools matching the current file extension.
- **Magic Snippets:** Snippets list (`#snippets-lexicon`) with search input (`#snippet-search`), type filter buttons (`Custom`, `Default`), click-to-insert on each row, and Manage Snippets button (`#btn-manage-snippets`) triggering the Side Drawer. In the drawer, clicking a snippet's text also inserts it.

### Windows & Settings Panel (`#panel-settings`)
- **Screen Layout Controls:** Positioning buttons (`#btn-layout-tile-left`, `#btn-layout-tile-right`, `#btn-layout-fullscreen`) utilizing `window.moveTo()` and `window.resizeTo()`.
- **Active Windows Tracker:** List (`#active-windows-list`) displaying active Famouskai browser instances using BroadcastChannel heartbeat.
- **Editor & Extension Settings:** Checkbox controls (`#settings-container`) for Word Wrap, AutoSave, Links, and tool-registered settings.
- **Lexicon:** Static keyboard shortcuts reference (`.lexicon-box` in `index.html`, under the "LEXICON & SHORTCUTS" title).

---

## 4. Persistence & Storage Keys

- `famouskai_active_sidebar_tab`: LocalStorage string storing active tab ID (`explorer`, `outline`, `tools`, `settings`).
- `famouskai_prefs`: LocalStorage JSON object parsed with `try/catch` guard (reads `sidebarStartup` boolean to restore startup open state).
- `famouskai_workspaces`: IndexedDB (`idb-keyval`) array storing workspace handle records (max 10).
- `famouskai_recent_files`: IndexedDB (`idb-keyval`) array storing recent file handle records (max 10).
- `famouskai_tool_settings`: LocalStorage JSON object storing tool configuration states.
- `famouskai_user_snippets`: IndexedDB (`idb-keyval`) object storing user custom snippets (`plugins/ext-snippets.js`); falls back to a LocalStorage JSON string only when `idbKeyval` is unavailable.
