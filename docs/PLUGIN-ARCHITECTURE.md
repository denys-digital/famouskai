# Famouskai Plugin & Architecture Guide

This document explains the technical philosophy behind Famouskai's JavaScript architecture and provides a step-by-step guide on how to extend the editor with new tools or features.

## 1. The "Why": Architectural Philosophy

**Famouskai is a Zero-Build, Local-First application.** Our core promise is that anyone, anywhere, can download the repository and double-click `index.html` to run a fully functional IDE without installing a local server, Node.js, or any build tools.

### The CORS Challenge
Modern JavaScript architecture relies on ES Modules (`import`/`export`). However, browsers strictly enforce Cross-Origin Resource Sharing (CORS) policies. If you open a file locally (using the `file://` protocol), the browser considers the origin as `null` and actively blocks ES Module imports for security reasons.

### The Solution: Single Global Namespace
To maintain the `file://` capability without polluting the global `window` scope with dozens of random variables, we use a **Single Global Namespace Pattern**. 
Everything belongs to a single object: `window.FamousPluginCore`.

- **NO** `<script type="module">` allowed.
- **NO** bundlers (Vite, Webpack, Rollup) allowed.
- **NO** global variables except `FamousPluginCore`.

---

## Where is what: the core files

Famouskai's core code is split into classic JavaScript files in `core/` loaded by `index.html` in a fixed order, sharing one global scope without modules or build steps. A function defined in a later file can be called at run time by an earlier file (for instance when a user clicks a button), but not during the initial execution of its top-level code.

| File | What it holds |
| --- | --- |
| `core/core-mobkai.js` | Mobkai, the minimal note mode on a phone: detection (and the `?mobkai=1` / `0` / `auto` override), loaded first in `<head>` so the desktop layout never flashes; status bar (Copy all, version) and draft recovery for the [New] note. |
| `core/core-window.js` | Window context/layout helpers (`isPopupWindow`, `getPopupAppUrl`), auto window layout initialization, global toast notifications (`window.showToast`), `window.currentWorkspaceHandle`. |
| `core/core-workspace-store.js` | Multi-workspace selector and storage (`getSavedWorkspaces`, `saveWorkspaceToStore`, `renderWorkspaceSelect`), workspace filter handler (`applyWorkspaceFilter`), recent files stack and list renderer (`addRecentFile`, `renderRecentFilesList`). |
| `core/core-state.js` | Shared file state (`fileHandle`, `currentFileName`, `isModified`, `lastKnownModifiedTime`), file metadata accessor (`window.FamousPluginCore.getCurrentFile`), editor and autosave state, unified workspace file configuration and icons (`WORKSPACE_FILE_GROUPS`, `FILE_ICON_MAP`). |
| `core/core-editor.js` | UI update logic (`updateUI`), Ace Editor setup and configuration, Famous Mark YAML fold mode patching (`initFamousMarkFolding`), cursor position LocalStorage LRU cleanup, active windows tracker (`renderActiveWindowsList`). |
| `core/core-file.js` | Syntax coloration mode mapping (`applyNativeColoration`), file lifecycle operations (`newFile`, `openFile`, `saveFile`, `saveAsFile`, `reloadFile`), file open trigger emission (`emitFileOpen`), save indicator (`afficherSucces`). |
| `core/core-workspace-tree.js` | Workspace list refresh (`refreshWorkspaceList`), file icon badge generator (`getFileIcon`), directory tree rendering with lazy loading (`renderDirectoryTree`). |
| `core/core-settings.js` | Side menu toggle buttons, preferences persistence (`loadPreferences`, `savePreferences`), preview theme button state (`updatePreviewThemeUI`), tool settings injection (`FamousPluginCore.Manager.renderSettings`). |
| `core/core-shortcuts.js` | Clickable links handler, editor change listener for autosave/outline refresh, toolbar action bindings (New, Open, Save, etc.), custom keyboard shortcuts, mode detection on paste, search box match counter patch. |
| `core/core-pwa.js` | File System Access API browser support banner, Service Worker registration, PWA `launchQueue` file handling, version reading from `sw.js` (`#app-version`), accidental reload/closure guard (`beforeunload`). |
| `core/core-file-actions.js` | Workspace title click handler, workspace file filter listeners (`initExtFilters`), file rename dialog (`renameCurrentFile`), file move/copy actions (`copyFileName`, `moveFile`), opening HTML in new tab (`openHtmlInNewTab`). |
| `core/core-sync.js` | BroadcastChannel listener (`'famouskai_sync'`) for cross-window and Diffskai saves/merges, auto-reload and editor update on external file changes. |
| `core/core-preview.js` | Live preview pane toggle and rendering (`togglePreview`, `updatePreviewContent`), full preview mode (`toggleFullPreview`), PDF print (`window.print`), standalone HTML export, preview dark theme switch, new window/tab toolbar button handler. |
| `core/core-snippets.js` | Sidebar Magic Snippets UI filtering and display (`updateSnippetsUI`), click-to-insert snippet logic (`insertSnippetByKey`), HTML escaping helper (`escapeHtml`), snippet search input and filter buttons listeners. |
| `core/core-boot.js` | Application startup initialization (`initWorkspace`), opening file passed via URL query parameter (`checkOpenFileInNewWindow`), Android Share Target API handling (`checkSharedContent`), initial UI update and editor focus. |

---

## 2. The "What" & "Where": Directory Structure

All custom logic, tools, and extensions are strictly encapsulated in the `/plugins/` directory.

- `plugins/tools.js` - Initializes the `FamousPluginCore.Manager` (The core registry).
- `plugins/ext-*.js` - Core editor extensions (e.g., Outline, Snippets).
- `plugins/tool-*.js` - Individual, modular tools (e.g., Beautifier, Cleanup).

---

## 3. The "How": Creating a New Tool (Clickable Actions)

> **Reference File:** For a production-hardened tool implementation, refer to `plugins/tool-cleanup-text.js` and its zero-build unit test page `tests/unit-cleanup-text.html` as reference files to copy from.

Tools (`tool-*.js`) are user-triggered actions (buttons you click in the sidebar). Want to add a Markdown table generator or a code linter? Here is the exact 5-step process.

### Step 1: Create the tool file
Create a new file in the `/plugins/` directory. Name it descriptively, starting with `tool-` (e.g., `tool-table-generator.js`).

### Step 2: Write the boilerplate
Use the `FamousPluginCore.Manager.register` method to inject your tool. Copy this template:

```javascript
/*
 * Famouskai Editor - [Your Tool Name]
 * Author: [Your Name/GitHub Handle]
 */
window.FamousPluginCore.Manager.register({
    // The display name in the IDE toolbar/menu
    name: "Generate Markdown Table",
    
    // Array of file extensions where this tool should be visible.
    // Use an empty string '' to allow the tool on unsaved [New] files.
    extensions: ['md', 'txt'], 
    
    // (Optional) A native confirmation prompt before execution
    confirmMsg: "Do you want to insert a table at the cursor position?",
    
    // The core function executed when the tool is clicked.
    // 'editor' is the Ace Editor instance.
    action: function(editor) {
        // 1. Get current cursor position
        const pos = editor.getCursorPosition();
        
        // 2. Define your logic
        const tableTemplate = "\n| Header 1 | Header 2 |\n| -------- | -------- |\n| Cell 1   | Cell 2   |\n";
        
        // 3. Apply to the editor
        editor.session.insert(pos, tableTemplate);
        
        // 4. (Optional) Provide feedback using the global toast
        if (window.showToast) window.showToast("Table generated!");
    }
});

```

### Step 3: Register the file in `index.html`

For the application to load your tool, you must add it to the `<script>` stack in `index.html`.
Locate the `<!-- ﹥ TOOLS LOADING + EXTENSIONS -->` section of `index.html` and add your script:

```html
    <!-- Tools -->
    <script src="plugins/tool-beautify.js"></script>
    <script src="plugins/tool-bold2h4.js"></script>
    <script src="plugins/tool-cleanup.js"></script>
    <script src="plugins/tool-diffskai.js"></script>
    <script src="plugins/tool-workspace.js"></script>
    <!-- Add your new tool here: -->
    <script src="plugins/tool-table-generator.js"></script>
```

> **Note:** Yes, manually adding `<script>` tags might feel a bit "old-school" in the era of automated bundlers. But the moment you double-click `index.html` and it instantly runs in your browser without waiting for a 30-second build step, we promise you'll forgive us.

### Step 4: Add it to the Service Worker (`sw.js`)

Famouskai is an offline-capable Progressive Web App (PWA). If you don't declare your new file in the Service Worker, the app will crash when offline.

1. Open `sw.js`.
2. Locate the `URLS_TO_CACHE` array.
3. Add your new file path: `'./plugins/tool-table-generator.js',`.
4. **CRITICAL:** Increment the `CACHE_NAME` version at the top of the file following Semantic Versioning (e.g., change `famouskai-v1.0.0` to `famouskai-v1.0.1`). If you forget this, returning users' browsers will never download your new file!

### Step 5: Test Locally & Verify

Double-click `index.html` in your file explorer. Press **F12** (or Ctrl+Shift+I) to open your browser's Developer Tools. Run through this mental checklist:

* [ ] **Cache Cleared:** Did I perform a Hard Reload (Ctrl+Shift+R) to flush the old Service Worker?
* [ ] **No Errors:** Is the DevTools Console entirely free of red error messages?
* [ ] **Contextual Visibility:** Does my tool appear in the sidebar's "Tools" section *only* when a matching file type is opened?
* [ ] **Execution:** Does `console.log()` confirm my data is flowing correctly when I click the tool? Does my tool work as expected.


### 3.a Adding a Toolbar Shortcut (Toolbar Icon)

By default, all registered tools must appear in the left sidebar under the "Tools" section. However, for frequently used tools, you can provide a quick access button directly in the top-right toolbar (next to the "Preview" button).

To preserve Famouskai's visual lightness and avoid the "rainbow" effect of heavy IDEs, the API imposes strict and elegant constraints:

1. **Single character:** The button will only contain one uppercase letter (the initial of your tool).
2. **Semantic hover color:** The button remains discreet (neutral gray) and only reveals its custom color on hover (`:hover`).

To enable this option, add the `toolbar` object to your tool's configuration when calling `FamousPluginCore.Manager.register`:

```javascript
/*
 * Famouskai Editor - [Your Tool Name]
 * Author: [Your Name/GitHub Handle]
 */
window.FamousPluginCore.Manager.register({
    name: "Generate Markdown Table",
    extensions: ['md', 'txt'], 
    
    // HERE: Toolbar button configuration
    toolbar: {
        // The displayed letter (If multiple letters are provided, only the 1st is kept and capitalized)
        letter: "T",
        // The hover color. ALWAYS use Famouskai palette tokens (see style.css Layer 1)
        color: "var(--fm-magenta)" 
    },
    
    confirmMsg: "...",
    
    action: function(editor) {
        // Your business logic here...
    }
});
```

#### Toolbar Constraints & Best Practices

* **Zero DOM Manipulation:** **Never** attempt to inject an HTML button into the toolbar yourself. The Framework (`renderTools` and `updateUI`) takes care of generating the button with the correct width, aligning it to the right, injecting the CSS variable for dynamic hover, and smartly managing the vertical divider with native buttons.
* **Color Selection:** You must **never** hardcode a hexadecimal value (e.g., `#ff0000`). Refer to **LAYER 1: SETTINGS (Global Variables)** in the `style.css` file and choose a color from the "Primary Colors" or "Secondary Colors" (e.g., `var(--fm-orange)`, `var(--fm-green)`, `var(--fm-sky)`). This guarantees your button will remain accessible if a global dark/light theme is added in the future.
* **Contextual Availability:** If your tool defines an array like `extensions: ['md']`, the toolbar button will smartly appear (and disappear) *only* when the user is viewing a Markdown file. The entire lifecycle is managed by the core.

### 3.b Tool Settings and Triggers

Tools can declare user-configurable settings and register background triggers to react automatically to IDE lifecycle events.

#### Declaring Tool Settings

A tool specifies its configurable options in an optional `settings` array passed during registration:

```javascript
window.FamousPluginCore.Manager.register({
    name: "Tidy & Sanitize Text",
    settings: [
        {
            id: "cleanup_on_save",
            label: "Auto-cleanup on Save",
            type: "checkbox",
            default: false,
            tooltip: "Automatically sanitize text formatting when saving a file"
        },
        {
            id: "cleanup_on_open",
            label: "Auto-cleanup on Open",
            type: "checkbox",
            default: false,
            tooltip: "Automatically sanitize text formatting when opening a file"
        }
    ],
    // ...
});
```

##### Schema Fields

- `id` (`string`): Unique setting identifier within the tool.
- `label` (`string`): Display label rendered in the UI.
- `type` (`string`): Kept for readability. The code does not read it: in 0.1.0 every setting is rendered as a checkbox and stores `true` or `false`, so write `"checkbox"`.
- `default` (`boolean`): Value used when no saved preference exists. If omitted, it is `false`.
- `tooltip` (`string`, optional): Hover text applied as title attribute on the setting label.

##### UI Rendering and Storage Mechanics

- **UI Location:** At startup, `core/core-settings.js` (in `loadPreferences()`) calls `FamousPluginCore.Manager.renderSettings()` on the `#settings-container` element of the "Windows & Settings" sidebar tab. It adds one labeled checkbox per setting.
- **LocalStorage Persistence:** User preferences are stored in LocalStorage under key `famouskai_tool_settings` as a JSON object grouped by tool name: `{ "Tool Name": { "setting_id": value } }`.
- **API Methods:**
  - `FamousPluginCore.Manager.getToolSettings(toolName)`: Returns key-value setting object for the specified tool.
  - `FamousPluginCore.Manager.setToolSetting(toolName, settingId, value)`: Updates a specific setting and persists changes to LocalStorage.

#### Lifecycle Event Triggers

Tools can subscribe to background lifecycle events dispatched by the core application via `FamousPluginCore.Manager.emit(eventName, editorInstance, extraArgs)`.

Like the Tools tab, `emit()` filters tools by their `extensions` list: a tool with a non-empty `extensions` array only runs its triggers when the current file's extension is in that list (include `""` to also run on new, unnamed files), while a tool with an empty `extensions: []` runs on every file.

##### Available Event Names & Sources

- `onFileOpen`: Dispatched in `core/core-file.js` within `openFile()` (when loading a file via native file picker) and `reloadFile()` (when re-reading active file from disk). Only these two functions emit it: files opened from the Explorer tab, the recent files list, the operating system's file manager, a new window or shared content do not trigger `onFileOpen` in 0.1.0.
- `onBeforeSave`: Dispatched in `core/core-file.js` within `saveFile()` and `saveAsFile()` right before write operations.

##### Handler Signature & Trigger Subscription

Trigger handlers are defined on the `triggers` object of a tool registration. Each handler receives three arguments:
1. `editor` (`Object`): Active Ace Editor instance.
2. `settings` (`Object`): Key-value map of current settings for this tool.
3. `extraArgs` (`Object`): Context object (e.g. `{ filename: currentFileName }`).

```javascript
    // actionSilently is a method your tool defines itself (see plugins/tool-cleanup-text.js),
    // not a core API.
    triggers: {
        onBeforeSave: function(editor, settings, extraArgs) {
            if (settings && settings.cleanup_on_save) {
                this.actionSilently(editor);
            }
        },
        onFileOpen: function(editor, settings, extraArgs) {
            if (settings && settings.cleanup_on_open) {
                this.actionSilently(editor);
            }
        }
    }
```

---

## 4. Advanced: Extending Core Logic (Passive Extensions)

> **Reference File:** For a production-hardened extension implementation, refer to `plugins/ext-famous-core.js` and its zero-build unit test page `tests/unit-famous-mark.html` as reference files to copy from.

If you are not building a simple click-to-execute tool, but rather modifying the editor's core behavior (like the Outline generator or keyboard shortcuts), create an `ext-*.js` file.

Extensions (`ext-*.js`) are passive or continuous features that modify the editor's core behavior, listen to events in the background, or alter the UI (e.g., the Table of Contents outline, or the Magic Snippets engine).

Unlike Tools, Extensions do not register with the `Manager`. They attach directly to the `window.FamousPluginCore` namespace and expose lifecycle methods (usually `init` and `update`). Here is how to create one.

### Step 1: Create the extension file
Create a file in the `/plugins/` directory starting with `ext-` (e.g., `ext-wordcounter.js`).

### Step 2: Define the Extension Object
Attach your logic to `window.FamousPluginCore`. Expose an `init()` method to handle the initial setup. 
**Avoid inline CSS**: always add CSS classes instead of hardcoding `.style` properties.

*Here is a boilerplate example of a hypothetical "Word Counter" extension that updates every time the user types:*

```javascript
/*
 * Famouskai Editor - Word Counter Extension
 */

window.FamousPluginCore = window.FamousPluginCore || {};

window.FamousPluginCore.WordCounter = {
    // Stores internal state
    lastCount: 0,
    
    // 1. The initialization method (called once on startup)
    init: function(editorInstance) {
        if (!editorInstance) return;
        
        // Inject a UI element dynamically into the toolbar
        const toolbarRight = document.getElementById("toolbar-right");
        if (toolbarRight) {
            const counterDiv = document.createElement("span");
            counterDiv.id = "word-counter-display";
            // Best practice: Use a class, define the rules in style.css
            counterDiv.classList.add("extension-word-counter"); 
            toolbarRight.prepend(counterDiv);
        }

        // Hook into Ace Editor's 'change' event to run continuously
        editorInstance.session.on('change', () => {
            this.update(editorInstance);
        });
        
        // Initial run
        this.update(editorInstance);
    },
    
    // 2. The update method (called on every keystroke)
    update: function(editorInstance) {
        const text = editorInstance.getValue();
        // Simple word count logic
        const words = text.trim().split(/\s+/).filter(word => word.length > 0);
        this.lastCount = words.length;
        
        // Update the UI
        const display = document.getElementById("word-counter-display");
        if (display) {
            display.textContent = `${this.lastCount} words`;
        }
    }
};
```

*(You would then add `.extension-word-counter { margin-right: 10px; color: var(--color-text-secondary); }` to `style.css`).*

### Step 3: Register the script in `index.html`

Locate the `<!-- ﹥ TOOLS LOADING + EXTENSIONS -->` section of `index.html` and add your script:

```html
    <!-- Core & Extension -->
    <script src="plugins/ext-outline.js"></script>
    <script src="plugins/ext-snippets.js"></script>
    <!-- Add your new extension here: -->
    <script src="plugins/ext-wordcounter.js"></script>

```

### Step 4: Initialize it in `core/core-editor.js`

Your extension needs to be triggered when the app loads. Find the `DOMContentLoaded` event listener in `core/core-editor.js` and trigger your `init` method:

```javascript
window.addEventListener('DOMContentLoaded', () => {
    // Existing core extensions...
    if (window.FamousPluginCore && window.FamousPluginCore.Outline) {
        window.FamousPluginCore.Outline.init();
    }
    
    // Initialize your new extension here:
    if (window.FamousPluginCore && window.FamousPluginCore.WordCounter) {
        window.FamousPluginCore.WordCounter.init(editor);
    }
});
```

### Step 5: Update the Service Worker (`sw.js`)
Exactly like tools ([see Step 4](#step-4-add-it-to-the-service-worker-swjs)), add `'./plugins/ext-wordcounter.js'` to the `URLS_TO_CACHE` array and **increment the `CACHE_NAME` version**.

### Step 6: Test Locally & Verify

Double-click `index.html` in your file explorer. Press **F12** (or Ctrl+Shift+I) to open your browser's Developer Tools. Run through this mental checklist:

* [ ] **Cache Cleared:** Did I perform a Hard Reload (Ctrl+Shift+R) to ensure the new extension code is running?
* [ ] **Initialization:** Does `console.log()` confirm my `init()` function fired exactly once during startup?
* [ ] **Event Binding:** Does my logic trigger correctly (e.g., on keystroke, on scroll) without throwing DevTools errors?
* [ ] **Performance:** If my extension runs on every keystroke, did I check the DevTools Console to ensure it isn't causing infinite loops or massive UI lag?

---

## 4.a Add a sidebar tab (Sidebar Extension API & Side Drawer)

> **Reference File:** For a reference implementation of a custom tab and side drawer overlay, refer to `plugins/ext-sidebar-demo.js` and its manual test suite `tests/manual-sidebar-extensions.md`.

In addition to tools and editor extensions, Famouskai allows extensions to register custom top-level tabs in the sidebar navigation and open slide-out Side Drawer overlays via `window.FamousPluginCore.Sidebar`.

### Registering a Sidebar Tab

To add a new tab to the sidebar, call `FamousPluginCore.Sidebar.registerTab(descriptor)`:

```javascript
window.FamousPluginCore.Sidebar.registerTab({
    // Unique identifier ([a-z0-9_-]+)
    id: 'demo',

    // Display title used for ARIA labels and button tooltip
    title: 'Demo extension',

    // 1-2 character text symbol (no SVGs, no icon fonts).
    // If omitted, falls back to the first character of the title.
    icon: 'D',

    // CSS variable token (never raw hex like #ff0000).
    // Uses tokens defined in style.css Layer 1 (e.g. var(--color-tab-tools), var(--fm-magenta)).
    color: 'var(--color-tab-tools)',

    // (Optional) Panel CSS display mode ('flex' or 'block', defaults to 'flex')
    displayStyle: 'flex',

    // (Optional) Lazy rendering callback called once when panel DOM element is first created
    render: function(panelEl) {
        // Build panel DOM inside panelEl
    },

    // (Optional) Lifecycle callback invoked whenever the tab becomes active
    onShow: function(panelEl) {
        // Run activation logic
    },

    // (Optional) Lifecycle callback invoked whenever switching away or closing the sidebar
    onHide: function(panelEl) {
        // Run cleanup / deactivation logic
    }
});
```

#### Tab Registration Rules & Constraints

1. **Text Icons Only (1-2 characters):** Per Famouskai architecture, tab buttons strictly accept a 1- or 2-character text symbol (e.g., `'D'`, `'KB'`). SVGs, image files, and third-party icon fonts are forbidden for custom extension tabs.
2. **CSS Token Colors Only:** Tab `color` must strictly be a CSS variable token (e.g. `'var(--color-tab-tools)'`, `'var(--fm-magenta)'`). Raw hex colors (such as `#ff0000`) throw an architectural validation error.
3. **Zero Network:** Extensions must operate completely offline with zero CDN dependencies and zero network calls.
4. **Accessible Navigation:** Dynamically registered tab buttons automatically participate in ARIA `tablist` / `tab` roles, roving `tabindex`, and arrow-key keyboard navigation (`ArrowRight`, `ArrowLeft`, `Home`, `End`).
5. **Fallback Safety:** If an active extension tab is unregistered or unavailable, the sidebar automatically falls back to `'explorer'`.

### Opening a Side Drawer Overlay

Tabs and extensions can slide out an overlay panel next to the sidebar by calling `FamousPluginCore.Sidebar.openDrawer(title, content, options)`:

```javascript
const drawerContent = document.createElement('div');
drawerContent.style.padding = '12px';
drawerContent.textContent = 'Drawer body content';

window.FamousPluginCore.Sidebar.openDrawer('Demo drawer', drawerContent, {
    size: 'M',                         // 'S', 'M', 'L', or 'XL' (defaults to 'S')
    color: 'var(--color-tab-tools)',   // (Optional) CSS variable for accent band
    onClose: function() {              // (Optional) Callback fired when drawer closes
        console.log('Drawer closed');
    }
});
```

#### Side Drawer Sizes & Behavior

- **Sizes:**
  - `'S'`: 1x sidebar width (260px).
  - `'M'`: 2x sidebar width (520px).
  - `'L'`: 3x sidebar width (780px).
  - `'XL'`: 4x sidebar width (1040px on screens >= 1600px; automatically falls back to `'L'` on screens < 1600px).
- **Responsive Fallback:** If the available space to the right of the sidebar is insufficient, `openDrawer` automatically steps down to the next smaller size.
- **Single Drawer Instance:** Opening a drawer replaces any currently open drawer, firing the previous drawer's `onClose` callback cleanly.

### Enabling the Demo Tab (`plugins/ext-sidebar-demo.js`)

The demo tab is hidden by default so regular users never see it. Developers can activate it using a LocalStorage flag:

1. Open DevTools Console (**F12** or Ctrl+Shift+I).
2. Run:
   ```javascript
   localStorage.setItem('famouskai_dev_demo_tab', '1');
   ```
3. Reload the application (F5). The **D** tab will appear in the sidebar tab group.
4. To disable it, run:
   ```javascript
   localStorage.removeItem('famouskai_dev_demo_tab');
   ```
   and reload.

---

## 5. Styling your Plugin (The Monolith & Namespace Approach)

Famouskai does not use separate CSS files for plugins. Loading a dozen small CSS files dynamically introduces Flash of Unstyled Content (FOUC), breaks offline caching reliability, and complicates the Service Worker setup.

**All plugin styles must be written inside the main `style.css` file.**

To keep the monolith clean and prevent CSS collision, we enforce a **Strict Namespacing Rule**:

1. **Location:** Scroll to the very bottom of `style.css` and locate the `LAYER 5: PLUGINS & EXTENSIONS` section (specifically `﹥ 5.a.`). Place your CSS there.
2. **Namespacing:** You must prefix every single class with your extension or tool's name. Avoid generic names entirely.
    - *Invalid:* `.panel`, `.counter-text`, `.btn-active`
    - *Valid:* `.ext-wordcounter-panel`, `.ext-wordcounter-text`
3. **No Hardcoded Colors:** Never write a hex code (like `#ff0000`) in your CSS. Always use the semantic CSS variables defined in the `:root` block at the top of `style.css` (e.g., `color: var(--color-text-secondary);`). This ensures your plugin instantly supports future light/dark modes.
4. **No Inline Styles:** Do not use `element.style.color = "..."` in your JavaScript. Assign your namespaced class to the element instead.

Example of a perfect plugin styling workflow:

**In your JS (`plugins/ext-wordcounter.js`):**
```javascript
    const display = document.createElement("span");
    display.classList.add("ext-wordcounter-display");   // Clean class injection
    toolbar.prepend(display);
```

**In `style.css` (Layer 5):**
```css
    .ext-wordcounter-display {
        margin-right: 10px;
        color: var(--color-text-secondary);     /* Theme-proof color */
    }
```
---

## 6. Pro Tips & Debugging

Building zero-build apps is liberating, but it comes with its own set of rules. Keep these tips in mind to avoid headaches:

- **The Service Worker Trap:** The number one reason your new code "isn't working" is that the browser is serving an old, cached version of your file. When testing locally, always perform a **Hard Reload** (Ctrl+Shift+R / Cmd+Shift+R) or check "Disable cache" in your browser's DevTools Network tab.
- **Ace Editor API:** Famouskai relies heavily on Ace Editor. If you want to manipulate text, selections, or cursors, keep the [Ace Editor API documentation](https://ace.c9.io/#nav=api) handy.
- **Content Security Policy:** the app is served with a strict CSP (`_headers`): every script must be a file of the repository loaded by a `<script src>` tag. No inline `<script>`, no `onclick="..."` attributes (use `addEventListener`), no `eval` or `new Function`, nothing loaded from another site. Check the DevTools console for "Content Security Policy" errors before you open a PR.
- **Debugging:** Because there is no build step or minification in development, `console.log()` is your best friend. Errors will point directly to the exact line in your original file.

---

## 7. Got an Idea but Can't Code It?

Not a developer, but have a brilliant idea for a new tool or workflow extension that would make Famouskai better? We've got you covered!

- **Community Requests:** Open a [Feature Request Issue](https://github.com/denys-digital/famouskai/issues) and describe your idea in detail. The open-source community might build it for you.
- **Custom Development:** If your team requires a specific integration, a custom format parser, or a proprietary tool built directly into the editor for commercial use, you can sponsor the feature. Reach out via GitHub Discussions or check the [COMMERCIAL-LICENSE.md](COMMERCIAL-LICENSE.md) to get in touch with the core maintainers. We can build it for you!