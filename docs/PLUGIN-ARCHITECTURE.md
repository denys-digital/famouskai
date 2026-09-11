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

## 2. The "What" & "Where": Directory Structure

All custom logic, tools, and extensions are strictly encapsulated in the `/plugins/` directory.

- `plugins/tools.js` - Initializes the `FamousPluginCore.Manager` (The core registry).
- `plugins/ext-*.js` - Core editor extensions (e.g., Outline, Snippets).
- `plugins/tool-*.js` - Individual, modular tools (e.g., Beautifier, Cleanup).

---

## 3. The "How": Creating a New Tool (Clickable Actions)

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
3. Add your new file path: `'/plugins/tool-table-generator.js',`.
4. **CRITICAL:** Increment the `CACHE_NAME` version at the top of the file following Semantic Versioning (e.g., change `famouskai-v1.0.0` to `famouskai-v1.0.1`). If you forget this, returning users' browsers will never download your new file!

### Step 5: Test Locally & Verify

Double-click `index.html` in your file explorer. Press **F12** (or Ctrl+Shift+I) to open your browser's Developer Tools. Run through this mental checklist:

* [ ] **Cache Cleared:** Did I perform a Hard Reload (Ctrl+Shift+R) to flush the old Service Worker?
* [ ] **No Errors:** Is the DevTools Console entirely free of red error messages?
* [ ] **Contextual Visibility:** Does my tool appear in the sidebar's "Tools" section *only* when a matching file type is opened?
* [ ] **Execution:** Does `console.log()` confirm my data is flowing correctly when I click the tool? Does my tool work as expected.

---

## 4. Advanced: Extending Core Logic (Passive Extensions)

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

### Step 4: Initialize it in `index.html`

Your extension needs to be triggered when the app loads. Find the `DOMContentLoaded` event listener in the main `<script>` block of `index.html` and trigger your `init` method:

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
Exactly like tools ([see Step 4](#step-4-add-it-to-the-service-worker-swjs)), add `'/plugins/ext-wordcounter.js'` to the `URLS_TO_CACHE` array and **increment the `CACHE_NAME` version**.

### Step 6: Test Locally & Verify

Double-click `index.html` in your file explorer. Press **F12** (or Ctrl+Shift+I) to open your browser's Developer Tools. Run through this mental checklist:

* [ ] **Cache Cleared:** Did I perform a Hard Reload (Ctrl+Shift+R) to ensure the new extension code is running?
* [ ] **Initialization:** Does `console.log()` confirm my `init()` function fired exactly once during startup?
* [ ] **Event Binding:** Does my logic trigger correctly (e.g., on keystroke, on scroll) without throwing DevTools errors?
* [ ] **Performance:** If my extension runs on every keystroke, did I check the DevTools Console to ensure it isn't causing infinite loops or massive UI lag?

---

## 5. Styling your Plugin (The Monolith & Namespace Approach)

Famouskai does not use separate CSS files for plugins. Loading a dozen small CSS files dynamically introduces Flash of Unstyled Content (FOUC), breaks offline caching reliability, and complicates the Service Worker setup.

**All plugin styles must be written inside the main `style.css` file.**

To keep the monolith clean and prevent CSS collision, we enforce a **Strict Namespacing Rule**:

1. **Location:** Scroll to the very bottom of `style.css` and locate the `/* ﹥ 13. PLUGINS & EXTENSIONS */` section. Place your CSS there.
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
**In `style.css` (Section 13):**
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
- **Debugging:** Because there is no build step or minification in development, `console.log()` is your best friend. Errors will point directly to the exact line in your original file.

---

## 7. Got an Idea but Can't Code It?

Not a developer, but have a brilliant idea for a new tool or workflow extension that would make Famouskai better? We've got you covered!

- **Community Requests:** Open a [Feature Request Issue](https://github.com/denys-digital/famouskai/issues) and describe your idea in detail. The open-source community might build it for you.
- **Custom Development:** If your team requires a specific integration, a custom format parser, or a proprietary tool built directly into the editor for commercial use, you can sponsor the feature. Reach out via GitHub Discussions or check the [COMMERCIAL-LICENSE.md](COMMERCIAL-LICENSE.md) to get in touch with the core maintainers. We can build it for you!
