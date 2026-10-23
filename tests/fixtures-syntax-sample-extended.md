# Work anywhere, like at home: the case for light, local-first tools

<!-- Famouskai long Markdown sample: printing, Outline, preview and reading tests.
     The short construct catalogue is fixtures-syntax-sample.md. -->

An essay in ten parts
=====================

When you sit down at a computer that is not your own, your immediate priority is momentum. Whether you are using a terminal in a public library, a workstation in a university laboratory, a rental PC in a cybercafé, a borrowed laptop, or a lightweight Chromebook without Linux desktop access, the goal remains identical: you need to open your files, make edits, write documentation, or review code, and save your progress without friction. In these temporary environments, traditional software installation workflows break down completely. System security policies rightly restrict administrative privileges, preventing the installation of heavy integrated development environments or desktop binaries.

## 1. The Shared Computer Scenario

In shared or public computing spaces, the user environment is strictly constrained by administrative policies. System administrators lock operating system settings, disable persistent local storage across reboots, and restrict executable installation. Understanding these constraints is essential for selecting tools that work reliably in temporary environments.

The Reality of Temporary Workstations
-------------------------------------

A temporary workstation offers immediacy at the price of persistence. You cannot assume that custom software installed during your session will remain after logout. Furthermore, browser extensions, system services, and local background daemons are either inaccessible or wiped clean during standard station reset cycles. When operating under these conditions, every step requiring administrative rights or long download sequences delays actual productive work.

### 1.1 Administrative and Technical Constraints

On most public, corporate, and educational machines, user accounts run under restricted security profiles.

#### 1.1.1 Permission Boundaries

You can use the applications already there, mostly a web browser, but you cannot change the system.

##### 1.1.2 Software Installation

An installer that asks for administrator rights stops at the first screen, and a portable
executable copied from a USB drive is often blocked as well.

###### 1.1.3 Summary of What Is Usually Blocked

- Installers that need administrator rights.
- The terminal, package managers and container runtimes.
- Anything kept in the user profile: it is often wiped when the session ends.

Public Wi-Fi networks and shared institution connections present unpredictable throughput and strict proxy filtering. Firewalls frequently block non-standard ports or web socket connections required by cloud-hosted editing platforms. Furthermore, entering account passwords, API tokens, or personal credentials into unknown web browsers or persistent session managers introduces lingering security vulnerabilities that are difficult to audit and clean up after session termination.

﹥ Field Notes: Shared Workstation Observations

What you can usually count on, from one library, lab or business center to the next:

- A recent Chrome or Edge, because browsers update themselves; that is enough for the File System Access API.
- A USB port or a cloud drive in the browser, to bring your files and take them back.
- A time limit on the session, so an editor must start at once and save in place, with no export step.

## 2. Why Heavy Cloud Tools Fail Away from Home

Modern software development and document creation have increasingly migrated toward heavy, account-centric cloud platforms. While cloud platforms offer convenience within predictable home or office setups, they encounter severe structural failure modes when accessed from temporary or restricted hardware.

### 2.1 The Account Requirement Barrier

The requirement to sign in before creating or editing a single text file introduces immediate friction and security risks:

1. **Authentication Overheads**: Single Sign-On (SSO) redirects, multi-factor authentication prompts, and email verification steps consume valuable session time.
2. **Credential Footprints**: Logging into personal or corporate accounts on a public browser leaves residual session cookies and local storage tokens that require explicit manual cleanup.
3. **Account Security Flags**: Anomalous login locations often trigger automated security flags, locking accounts precisely when access is most urgent.

### 2.2 Network Dependency and Resource Overhead

Cloud-bound editors rely on continuous server connectivity. If the network drops or experiences high latency, typing feedback stutters, auto-completion fails, and unsaved changes risk being lost during connection timeouts. Furthermore, heavy client-side JavaScript bundles frequently exceed several dozen megabytes, causing prolonged load times on metered connections.

• Core Observations on Cloud Tool Friction

Key pain points observed when relying on cloud-exclusive tools on shared terminals include:

* Unplanned platform maintenance windows disabling document access without advance notice.
* Bloated web interfaces that degrade performance and cause lagging cursor response on entry-level hardware.
* Mandatory cloud synchronization forcing local documents into third-party remote storage servers.

```
+--------------------------------------+---------------------------------+
| Cloud editor                         | Local-first editor (Famouskai)  |
+--------------------------------------+---------------------------------+
| Account and sign-in first            | No account, opens at once       |
| Large download on every launch       | Cached once by a Service Worker |
| Needs the server to keep working     | Works offline in the browser    |
| Files live in the vendor's database  | Files stay on your disk         |
+--------------------------------------+---------------------------------+
```

## 3. What Local-First Means and What It Costs

The local-first software movement advocates for applications that prioritize local disk storage and client-side processing, returning ownership and control of data to the user. To learn more about the broader principles and research around local-first software, visit <https://localfirstweb.dev/>.

```
       +-------------------------------------------------------+
       |                  User Workspace                       |
       |                                                       |
       |   +-------------------+       +-------------------+   |
       |   |   Local Editor    | <---> |    Local Disk     |   |
       |   |   (Browser PWA)   |       |   (File System)   |   |
       |   +-------------------+       +-------------------+   |
       |             ^                           ^             |
       +-------------|---------------------------|-------------+
                     | (Optional)                | (Physical)
                     v                           v
           +-------------------+       +-------------------+
           | Backup / Synced   |       |   USB Storage     |
           | Folder (Disk)     |       |   Drive           |
           +-------------------+       +-------------------+
```

### 3.1 The Core Principles of Local-First Design

Local-first software operates on several core tenets that align directly with the needs of temporary workstations:

- **Local Storage Priority**: Primary data resides directly on the user's local disk or external storage media, ensuring immediate accessibility.
- **Instant Readiness**: The application loads instantly from local cache without waiting for distant servers or network handshakes.
- **Offline Resilience**: Full editing, formatting, search, and file management functions operate seamlessly without an active network connection.
- **Open Standards**: Files remain formatted in open, human-readable plain-text standards, avoiding vendor lock-in.

### 3.2 Understanding the Architectural Trade-offs

Choosing local-first architecture involves clear technical trade-offs that users and developers must understand:

1. **No Native Real-Time Collaboration**: Without a centralized websocket server, simultaneous multi-user co-editing on the exact same live buffer is not natively built-in.
2. **Browser Permission Management**: The browser prompts the user for explicit read/write permission when accessing files via the [File System Access API][fsa-api].
3. **Manual Sync Responsibility**: Synchronizing files across multiple distinct physical devices relies on file system synchronization tools, USB drives, or git repositories rather than background cloud databases.

[fsa-api]: https://developer.mozilla.org/en-US/docs/Web/API/File_System_API

° Architectural Trade-offs Summary

> Local-first software gives up seamless real-time multi-user cloud synchronization in exchange for absolute privacy, instant startup speed, offline independence, and complete data sovereignty.

## 4. Why Open Source Matters in 2026

In 2026, artificial intelligence models and automated code agents regularly write, refactor, and review software across global repositories. In this landscape, the inspectability and licensing of developer tools have become more critical than ever before.

### 4.1 Auditing Code in the Era of AI Agents

When AI agents assist in software development, human developers and automated systems must be able to inspect the precise source code running in the browser. Proprietary, obfuscated web applications can silently transmit document telemetry, user keystrokes, or workspace content to external machine learning training pipelines.

```
       [ Local Buffer ] ---> [ Inspection Gate ] ---> [ Local Disk ]
                                    |
                            (No Network Egress)
```

### 4.2 Verifying Data Boundaries and Copyleft Guarantees

Open source software distributed under strong copyleft licenses—such as the [GNU AGPLv3](https://www.gnu.org/licenses/agpl-3.0.html)—guarantees that users and auditing tools can inspect the codebase to confirm that:

- No hidden network requests transport file contents to third-party tracking servers.
- All text processing, syntax highlighting, and Markdown rendering take place strictly within local browser memory.
- No analytics trackers, telemetry beacons, or advertising scripts are embedded in the application bundle.

﹥ A Note in Two Other Languages

*L'expérience d'écriture sur un ordinateur partagé exige simplicité, clarté et fiabilité. Lorsqu'on travaille dans une bibliothèque publique ou un cybercafé, la garantie d'un outil local-first prend tout son sens : le cœur du système reste vos fichiers, préservés avec soin et sans aucun intermédiaire.*

In software architecture and human-computer interaction, this concept relates to what is known in Japanese as 伴走 (*bansō*: walking side-by-side or accompanying), where the editor serves as a quiet companion to the writer's thought process without intruding or imposing proprietary barriers.

### 4.3 When Code Is Cheap, Trust Is the Scarce Part

AI agents now write a large share of new code. That changes what open source is for:

1. **Reading replaces trusting.** When anyone can generate an editor in an afternoon, the question is no longer "can it be built?" but "what does this one do with my files?". Only readable source answers it.
2. **Small beats clever.** A tool made of short, plain files can be reviewed by a person, or by an agent working for that person, in one sitting. A bundled, minified application cannot.
3. **Licenses travel with the code.** The AGPLv3 keeps every modified copy that is offered to users as open as the original, including copies offered over a network.

> An editor you cannot read is an editor you have to believe.

#### 4.3.1 What This Means for Contributors

- Explain the impact of a change before writing it: the smallest change that solves the problem usually exists.
- Keep the zero-build rule: the code a reviewer reads is the code that runs.
- Treat a generated patch like any other patch: it is merged only when a person understands it.

## 5. Walkthrough: Working with Famouskai

Famouskai is designed specifically around these principles. Built as a zero-build, zero-CDN, zero-account Progressive Web App, it opens instantly in any modern Chromium desktop browser and works directly with files on your disk. For full architectural principles, consult [`../DNA.md`](../DNA.md) and [`../README.md`](../README.md).

```
+-----------------------------------------------------------------------+
| + New Open Save As... Move Reload | notes.md |  D  Print PDF  Preview |
+--------------+------------------------------------+-------------------+
| Explorer     | # Project status                   | Project status    |
| Outline      |                                    |                   |
| Tools        | ﹥ This week                        | ﹥ This week       |
| Windows &    | - Finish the release notes         | • Finish the      |
| Settings     |                                    |   release notes   |
+--------------+------------------------------------+-------------------+
  sidebar tabs   the editor (Ace)                     live preview
```

### 5.1 Opening Folders and Direct File Access

To start working in Famouskai on a temporary machine:

1. Open <https://app.famouskai.com> in Chrome or Edge, or double-click `index.html` in a copy of the repository.
2. Press <kbd>Ctrl</kbd>+<kbd>O</kbd> to open one file, or click **+** (Set New Workspace) in the Explorer tab to pick a folder.
3. Select the folder on your USB drive or in your cloud drive.
4. Allow read and write access when the browser asks.

```javascript
/*
 * Native File System Access API snippet
 * Demonstrating direct file handle request in Chromium
 */
async function openLocalFile() {
    try {
        const [fileHandle] = await window.showOpenFilePicker({
            types: [{
                description: 'Text Files',
                accept: { 'text/plain': ['.txt', '.md', '.js', '.css', '.json'] }
            }]
        });
        const fileData = await fileHandle.getFile();
        const content = await fileData.text();
        editor.setValue(content, -1);       // the Ace editor of the page
        window.showToast(`Opened ${fileHandle.name}`, 'info');
    } catch (err) {
        console.log("File selection cancelled or failed:", err);
    }
}
```

### 5.2 Editing and Offline Resilience

Once a file is open in Famouskai, editing happens directly within the browser memory buffer. Syntax highlighting for Markdown, HTML, CSS, JavaScript, JSON, YAML, and `.log` files is powered by locally vendored Ace Editor routines.

<!-- Raw HTML comment: Document structure and offline state verification -->

<details>
<summary>Technical Deep Dive: Service Worker Caching Architecture</summary>
Famouskai uses a Service Worker (`sw.js`) that caches the app's scripts, stylesheets, fonts and vendored libraries on the first visit. Later launches need no network at all. Monaco, the engine of Diffskai, is the one exception: it is cached in the background, so open Diffskai once while online. Offline mode needs HTTPS or `localhost`; it does not work from `file://`.
</details>

Key editor operations include:

- Pressing <kbd>Ctrl</kbd>+<kbd>S</kbd> writes changes directly back to your local file on disk without intermediate dialogs.
- Toggling the live Markdown preview provides instant HTML rendering sanitized via DOMPurify.
- Inserting structured section markers using Famous Marks (`﹥`, `•`, `°`) as detailed in [`../docs/FAMOUS-MARK.md`](../docs/FAMOUS-MARK.md).

### 5.3 Resolving Conflicts in Diffskai

When working with files on shared networks or USB drives, external programs (such as git, background scripts, or automated tools) may modify the file on disk while you have it open in Famouskai.

> If the file changed on disk since you opened it, Famouskai stops before saving and offers to open **Diffskai**, its side-by-side comparison and merge view.
>
> > Diffskai runs entirely in the browser, with a local copy of the Monaco diff engine.
> >
> > > What you can do there:
> > > - Copy changes from one side to the other, or edit the merged text by hand.
> > > - Save: Diffskai writes the result to the real file, and Famouskai reloads it.

```
+-----------------------------------+-----------------------------------+
| Disk version (changed elsewhere)  | Famouskai file (your edits)       |
+-----------------------------------+-----------------------------------+
| 10 | const theme = "system";      | 10 | const theme = "dark";        |
| 11 | const delay = 10000;         | 11 | const delay = 5000;          |
+-----------------------------------+-----------------------------------+
                                     The Famouskai file is always on the right.
```

Diffskai highlights added, removed and changed lines. Before it saves, it checks the file on disk again and asks if it changed in the meantime, so neither version is lost without you deciding.

### 5.4 Outputting Work via Print and HTML Export

When your document is complete, Famouskai provides two zero-dependency export pathways:

1. **Print to PDF**: the **Print PDF** button prints the preview. Toolbars, sidebars, notices (`#toast-msg`) and dialogs are hidden by `@media print` rules, so only the document is printed, on white pages. In the editor, <kbd>Ctrl</kbd>+<kbd>P</kbd> is "go to the matching bracket", not print.
2. **Export to HTML**: the **Export** button saves the rendered Markdown as one self-contained `.html` file, with the preview styles and the Oswald font embedded. It opens anywhere, with no network.

## 6. Technical Reference and Architectural Samples

To ensure long-term maintainability and zero-build compatibility, Famouskai adheres to a strict single global namespace architecture. All tools and extensions attach to `window.FamousPluginCore`.

### 6.1 Tool Extension Pattern

Below is a complete, production-hardened tool extension skeleton demonstrating how new actions register with the Famouskai Plugin Manager without requiring npm or build step tools:

```javascript
/*
 * Famouskai Editor - Document Statistics Tool Sample
 * Author: Famouskai Core Contributors
 */
(function() {
    'use strict';

    // Ensure global namespace exists
    window.FamousPluginCore = window.FamousPluginCore || {};

    // Helper functions called inside action (tested for bold preview rendering)
    function calculateWordCount(rawText) {
        if (!rawText) return 0;
        return rawText.trim().split(/\s+/).filter(w => w.length > 0).length;
    }

    function calculateCharacterCount(rawText) {
        return rawText ? rawText.length : 0;
    }

    function formatStatsMessage(lines, words, chars) {
        return `Lines: ${lines} | Words: ${words} | Chars: ${chars}`;
    }

    // Register custom tool with manager
    if (window.FamousPluginCore.Manager) {
        window.FamousPluginCore.Manager.register({
            name: "Document Word Statistics",
            extensions: ['md', 'txt', ''],
            toolbar: {
                letter: "W",
                color: "var(--fm-sky)"
            },
            action: function(editor) {
                if (!editor) return;
                const text = editor.getValue();
                const wordCount = calculateWordCount(text);
                const charCount = calculateCharacterCount(text);
                const lineCount = editor.session.getLength();

                const summary = formatStatsMessage(lineCount, wordCount, charCount);

                window.showToast(summary, "info");
            }
        });
    }
})();
```

### 6.2 Styling with Theme Variables

Extension styles live in `style.css`, in "Layer 5: Plugins & Extensions", and use the semantic custom properties defined in `:root`. Never hard-code a hex value in a rule:

```css
/* Custom extension styling sample in Layer 5 */
.ext-stats-panel {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    background-color: var(--color-bg-panel);
    border: 1px solid var(--color-border);
    border-radius: 4px;
    color: var(--color-text-primary);
    font-family: var(--font-mono);
    font-size: 13px;
}

.ext-stats-panel .highlight {
    color: var(--color-accent);
    font-weight: bold;
}
```

### 6.3 Progressive Web App Manifest and Format Code Samples

The start of the real `manifest.json`: name, icon and window style of the installed app. The rest of the file declares the file types the app opens from the file manager and the share target.

```json
{
    "name": "Famouskai Editor",
    "short_name": "Famouskai",
    "start_url": "/",
    "display": "standalone",
    "background_color": "#202124",
    "theme_color": "#2f3033",
    "icons": [
        {
            "src": "icon.svg",
            "sizes": "any",
            "type": "image/svg+xml",
            "purpose": "any maskable"
        }
    ]
}
```

Below are configuration and template examples in YAML, HTML, and Markdown demonstrating code syntax highlighting handled by Famouskai.

```yaml
# A release card, in the spirit of fixtures-syntax-sample.yml
release:
  name: Famouskai
  version: "0.1.0"
  date: 2026-10-25
dna:
  local: true
  zero_build: true
  zero_cdn: true
storage:
  engine: indexeddb       # recent files, settings, snippets
  max_recent_files: 50
```

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Famouskai Offline Container</title>
    <link rel="stylesheet" href="style.css">
    <script>
        // Inline script demonstration for syntax test
        const appState = { mode: "standalone", ready: true };
    </script>
</head>
<body>
    <div id="app-root"></div>
    <script src="vendor/ace-builds/ace.js"></script>
    <script src="plugins/tools.js"></script>
</body>
</html>
```

~~~text
Famouskai Plain Text Buffer (Tilde Fence Sample)
------------------------------------------------
This block uses tildes (~~~) for fence boundaries.
All formatting tokens are treated as plain text strings.
~~~

````
```js
// Four-backtick outer fence showing three-backtick fence inside
function computeSha256(input) {
    return window.crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
}
```
````

Below is a plain text fence without language specification:

```
Famouskai Non-Highlighted Text Fence
------------------------------------
This block demonstrates fence rendering without language tags.
Verbatim text preservation is guaranteed across all lines.
```

## 7. Feature Matrices and Comparison Tables

The tables below test alignment, line breaks inside cells, emoji and wide layouts.

**Text Editor Feature Comparison Matrix**

| Criterion | Local-first web app | Hosted cloud editor | Installed desktop editor |
| :--- | :---: | :---: | ---: |
| **Setup** | None, open a URL | Account and sign-in | Installer, admin rights |
| **Offline editing** | ⚡ Yes | ❌ Limited or none | ⚡ Yes |
| **Where files live** | 🔒 Your disk | ☁️ The vendor's servers | 🔒 Your disk |
| **Data sent out** | None | Depends on the vendor<br>(often analytics) | Depends on the vendor |
| **Works on a borrowed PC** | ✅ Yes | ⚠️ With your password | ❌ Rarely |

**Where Famouskai 0.1.0 works**

This wide table tests column overflow and page breaks in Print PDF:

| Browser | Engine | Open and save in place | Offline mode | Install as app | Open from file manager | Recent files kept | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Chrome (desktop)** | Chromium | Yes | Yes | Yes | Yes, once installed | Yes | Reference browser |
| **Edge (desktop)** | Chromium | Yes | Yes | Yes | Yes, once installed | Yes | Same engine as Chrome |
| **Chrome on ChromeOS** | Chromium | Yes | Yes | Yes | Yes, once installed | Yes | No Linux needed |
| **Firefox** | Gecko | No | Yes | No | No | Yes | A banner explains the limits |
| **Safari** | WebKit | No | Yes | No | No | Yes | No File System Access API |
| **Kiosk or guest mode** | Chromium | Yes | Yes | Often blocked | No | Until the session ends | Save to your USB drive |

---

## 8. Operational Checklists and Procedures

Below are operational checklists and nested instructions for working on temporary hardware.

> Important Reminder:
> > Always clean up temporary browser caches and verify your saved files on your USB drive before ending your session.
> >
> > - Ensure all modified editor buffers show saved status.
> > - Eject USB drives safely through the operating system manager.

### 8.1 Shared Computer Departure Checklist

Follow these steps before logging out of a shared computer terminal:

1. **Verify Unsaved File Buffers**:
   - Confirm that all open editor files have zero unsaved indicators.
   - Perform a manual save with <kbd>Ctrl</kbd>+<kbd>S</kbd> on every modified document.
2. **Review Output Files on USB Media**:
   - Check that exported `.html` or `.pdf` files exist in your target directory.
   - Verify file sizes and modification timestamps in the file explorer.
3. **Clear Browser Temporary Session Data**:
   - Open browser settings or press <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>Delete</kbd>.
   - Clear browsing history, cookies, and cached files for the current session.
   - This also clears Famouskai's recent files, settings and snippets on that computer: your files on the USB drive stay untouched.

The checklist below summarizes departure tasks:

- [x] Save all open files back to local disk or USB drive
- [x] Close active browser tabs running local sessions
- [ ] Eject USB storage media safely from system tray
- [ ] Verify no physical items are left at the workstation

### 8.2 System Setup Step Sequence

10. Connect your external USB media containing your workspace repository.
11. Launch Google Chrome or Microsoft Edge on the workstation.
12. Navigate to your local `index.html` file or launch the installed Famouskai PWA:
    * Select your working folder using the File System Access API dialog.
    * Verify that the Explorer tab renders your folder tree correctly:
      + Check the file names and their file-type icons.
      + Open your target Markdown document for editing.
      + Activate live preview pane to verify rendering.
    * List item containing a second paragraph and code block:

      This second paragraph resides inside item 12 of the ordered list, testing multi-paragraph list element rendering in Markdown preview.

      ```bash
      # Shell command inside list item
      echo "Workspace verified successfully"
      ```

13. Continue editing with full offline resilience.

## 9. Text Wrapping and Inline Formatting

To test line wrapping in the editor and in print, here is a long string with no space: the SHA-256 of an empty file, written twice.

`e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`

Formatting syntax samples: **bold text**, *italic text*, ***bold italic text***, ~~strikethrough text~~, inline `<script>alert('test')</script>` tag, and escaped characters: \*escaped asterisk\*, \_escaped underscore\_, and \#escaped hash tag\#.

Hard line break demonstration line 1
Hard line break demonstration line 2\
Hard line break demonstration line 3

Horizontal rule variations:

***

___

---

## 10. Try It

To explore Famouskai's architecture, philosophy, and codebase further:

- Read the project DNA in [`../DNA.md`](../DNA.md).
- Learn about universal section marking in [`../docs/FAMOUS-MARK.md`](../docs/FAMOUS-MARK.md).
- Review full usage and installation instructions in [`../README.md`](../README.md).
