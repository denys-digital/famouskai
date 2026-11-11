# Famouskai Tabbed Sidebar

This document describes the architecture, behavior, global JavaScript API, panel components, and storage keys for the tabbed sidebar in Famouskai.

The left sidebar features core navigation tabs (Explorer, Outline, Tools, Windows & Settings) and supports dynamic runtime tab registration from extensions and plugins.

---

## 1. Behavior and Accessibility

1. **Toolbar Navigation:**
   - The top toolbar contains tab buttons (`#tab-explorer`, `#tab-outline`, `#tab-tools`, `#tab-settings`, plus dynamic extension tabs) inside `#sidebar-tab-group`.
   - Each tab button represents one panel in `#sidebar-left`.

2. **Toggle and Mutual Exclusion:**
   - Clicking an inactive tab switches to that tab and opens the sidebar if hidden.
   - Clicking the currently active tab toggles (closes) the sidebar panel.
   - Clicking the Hide Menu button (`#btn-hide-sidebar`) inside the sidebar header closes the sidebar.
   - While the Side Drawer is open, a double-chevron button (`#btn-hide-drawer`) appears to the right of Hide Menu and closes the drawer only. The drawer header has the same double-chevron button (`#sidebar-drawer-close`).
   - Active tab buttons retain their highlighted CSS state (`.is-active`) while the sidebar remains open.

3. **Side Drawer Overlay Architecture:**
   - The sliding overlay container (`#sidebar-drawer`) slides in from the left over the main editor workspace.
   - Opening a drawer replaces the previous one (invoking any active drawer's `onClose` callback before replacing).
   - It renders heavy extension dialogs (such as the Magic Snippets Manager) without obscuring the main sidebar layout or displacing editor focus.

4. **ARIA Accessibility Semantics & Keyboard Navigation:**
   - `#sidebar-tab-group` has `role="tablist"` and `aria-label="Sidebar"`.
   - Tab buttons have `role="tab"`, `aria-selected` (`true` when active and open, `false` otherwise), and `aria-controls` pointing to the panel ID (`panel-<id>`).
   - Roving `tabindex` ensures the active tab button receives `tabindex="0"`, while inactive tabs receive `tabindex="-1"`.
   - Arrow keys (`ArrowRight`, `ArrowLeft`, `ArrowDown`, `ArrowUp`), as well as `Home` and `End`, cycle focus across registered tab buttons in `#sidebar-tab-group`.
   - Panel containers have `role="tabpanel"` and `aria-labelledby` pointing to their matching tab ID (`tab-<id>`).

---

## 2. API Reference: `window.FamousPluginCore.Sidebar`

The global sidebar manager attaches to `window.FamousPluginCore.Sidebar`.

### Public Interface
- `TABS`: Array of registered tabs, each containing `{ id, title, color, icon, displayStyle, render, onShow, onHide, static }`. Core tabs default to ids `'explorer'`, `'outline'`, `'tools'`, `'settings'`. The color is a CSS token of `style.css` (e.g., `var(--color-tab-explorer)`, never a raw hex) that fills the tab button on hover and when selected, and draws the line on top of the open panel.
- `getTab(tabId)`: Returns the `TABS` entry with this id, or `undefined`.
- `activeTab`: String holding current active tab ID (defaults to `'explorer'`).
- `isOpen`: Boolean indicating whether the sidebar panel is currently visible.
- `registerTab(def)`: Registers a new dynamic tab into the sidebar.
  - `def.id`: Unique alphanumeric string identifier (`/^[a-z0-9_-]+$/i`). Throws if missing, invalid format, or already registered.
  - `def.title`: Human-readable title used for tooltips and ARIA attributes. Throws if missing.
  - `def.color`: CSS variable token string (e.g. `'var(--fm-magenta)'` or `'var(--color-tab-kanban)'`). Throws if missing or if it contains a raw hex `#` color.
  - `def.icon`: Text symbol consisting of 1 or 2 characters. If omitted, falls back to the first character of `def.title`. Throws if longer than 2 characters.
  - `def.displayStyle`: CSS display mode for the panel when active (`'flex'` or `'block'`, defaults to `'flex'`).
  - `def.render(panelEl)`: Optional lazy rendering callback executed exactly once when the tab panel is first displayed.
  - `def.onShow(panelEl)`: Optional callback invoked every time the tab panel becomes active.
  - `def.onHide(panelEl)`: Optional callback invoked when switching away from the tab or when closing the sidebar.
  - Creates the button `#tab-${id}` in `#sidebar-tab-group` and panel `#panel-${id}` in `.sidebar-inner`.
- `unregisterTab(tabId)`: Removes a registered tab and cleans up its DOM elements.
  - If the removed tab was currently active, calls its `onHide` hook and automatically falls back to `'explorer'`.
  - Static core tabs retain their HTML structure.
  - Returns `true` if found and unregistered, `false` otherwise.
- `switchTab(tabId, openIfClosed = true)`: Switches to `tabId` and opens the sidebar if `openIfClosed` is true and sidebar is closed. Runs tab lifecycle hooks (`onHide`, `render`, `onShow`).
- `toggleSidebar(tabId)`: Toggles visibility; if `tabId` is provided, switches to tab or closes if active.
- `openSidebar()`: Opens sidebar panel (`#sidebar-left`), triggers active tab hooks, and triggers an editor resize event.
- `closeSidebar()`: Closes sidebar panel, invokes active tab's `onHide` hook, and closes any active side drawer overlay.
- `openDrawer(title, content, options)`: Opens Side Drawer overlay with a title string, HTML string or HTMLElement content, and optional configuration `options`:
  - `options.size`: Drawer width size (`'S'`, `'M'`, `'L'`, `'XL'`, defaults to `'S'`). S equals sidebar width (measured dynamically from the DOM), M is 2 × S, L is 3 × S, XL is 4 × S. When `window.innerWidth < 1600`, size XL behaves as L. If the requested size exceeds available screen space to the right of the sidebar, it falls back to the next smaller size.
  - `options.color`: CSS token string overriding the drawer top color band (e.g. `'var(--color-tab-tools)'` or `'var(--fm-magenta)'`, never a raw hex). Defaults to the color of the tab active when the drawer opens (`Sidebar.getTab(Sidebar.activeTab).color`).
  - `options.onClose`: Optional callback function executed when `closeDrawer()` is invoked or when replaced by a new drawer.
  Calling `openDrawer(title, content)` with two arguments defaults to size `'S'` and the active tab's color.
- `closeDrawer()`: Closes Side Drawer overlay and triggers any pending `onClose` callback.

### Internal Lifecycle & UI Helpers
- `applyTabColors()`: Sets `--sidebar-tab-color` on each tab button from `TABS`.
- `init()`: Registers core tabs, binds event listeners, restores persisted tab state, and reads startup open/close preferences.
- `bindToolbarTabs()`: Attaches click listeners and arrow-key keyboard navigation to `.sidebar-tab-btn` buttons in `#sidebar-tab-group`.
- `bindHideButtons()`: Attaches click listener to `#btn-hide-sidebar`.
- `updatePanelsDisplay()`: Updates CSS display on panel elements based on `activeTab` and tab `displayStyle`.
- `updateTabUI()`: Updates `.is-active` class, roving `tabindex`, and `aria-selected` attributes on toolbar tab buttons, and sets `--sidebar-active-color` on `#sidebar-left` (color of the line on top of the panel).
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

- `famouskai_active_sidebar_tab`: LocalStorage string storing active tab ID (`explorer`, `outline`, `tools`, `settings`, or dynamic extension tab).
- `famouskai_prefs`: LocalStorage JSON object parsed with `try/catch` guard (reads `sidebarStartup` boolean to restore startup open state).
- `famouskai_workspaces`: IndexedDB (`idb-keyval`) array storing workspace handle records (max 10).
- `famouskai_recent_files`: IndexedDB (`idb-keyval`) array storing recent file handle records (max 10).
- `famouskai_tool_settings`: LocalStorage JSON object storing tool configuration states.
- `famouskai_user_snippets`: IndexedDB (`idb-keyval`) object storing user custom snippets (`plugins/ext-snippets.js`); falls back to a LocalStorage JSON string only when `idbKeyval` is unavailable.
