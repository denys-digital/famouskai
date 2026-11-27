/*
 * Famouskai Editor - Local-First PWA IDE
 * Copyright (C) 2026 Denys Poulat (https://github.com/denys-digital)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * -------------------------------------------------------------------------
 * COMMERCIAL LICENSE
 * For commercial integration without the AGPLv3 strict open-source
 * restrictions, please contact the author to acquire a commercial license.
 * -------------------------------------------------------------------------
 */
/*
 * Famouskai Editor - Core Boot & Startup
 *
 * Holds startup routines:
 * - Opening a file passed via URL query parameter to a new window (checkOpenFileInNewWindow)
 * - Handling Share Target API (Android INTENT) content (checkSharedContent)
 * - Opening a file of this site named in the URL (openFixtureFromUrl): ?open=<path> of any file
 *   type Famouskai edits (WORKSPACE_ALLOWED_EXT), subfolders and .github/ included, other hidden
 *   folders excluded (?fixture= is the older name of ?open=)
 * - Forcing the display from the URL (applyViewFromUrl): &view=editor|split|read|read-light,
 *   &tab=<sidebar tab id> and &preview=dark|light, for this opening only, with or without ?open=
 * - Initial UI update (updateUI)
 * - Initial syntax coloration and editor focus for [New] file
 *
 * Execution Order:
 * MUST remain the LAST core script loaded in index.html because it executes startup
 * initialization code that needs every earlier file, UI element, and global.
 *
 * Globals used:
 * - initWorkspace, updateUI, applyNativeColoration, emitFileOpen, addRecentFile, showToast
 * - currentFileName, fileHandle, lastKnownModifiedTime, isInitialLoad, isModified, editor
 * - idbKeyval, confirm, fetch, localStorage
 * - togglePreview, toggleFullPreview, isPreviewOpen, isPreviewFull (core-preview.js)
 * - FamousPluginCore.Sidebar (getTab, switchTab, closeSidebar, isOpen)
 * - isPreviewDark, previewDarkSetting, updatePreviewThemeUI (core-settings.js)
 *
 * Globals defined:
 * - checkOpenFileInNewWindow
 * - checkSharedContent
 * - openFixtureFromUrl, applyViewFromUrl, openFromUrl
 */
// ﹥ ASSET ERROR RECOVERY & INTEGRITY LISTENERS (CSP LOT 1)
// Replaces inline onerror="..." attributes on <script> and <link> elements.
function retryAssetWithCacheBuster(element, attrName) {
    if (!element || element.dataset.retryAttempted === 'true') return false;
    element.dataset.retryAttempted = 'true';
    const currentUrl = element.getAttribute(attrName);
    if (!currentUrl) return false;
    const separator = currentUrl.includes('?') ? '&' : '?';
    const retryUrl = currentUrl + separator + 'v=' + Date.now();
    if (element.tagName === 'SCRIPT') {
        // A script element never loads twice: changing its src does nothing,
        // so insert a fresh element right after it.
        const retry = document.createElement('script');
        retry.src = retryUrl;
        retry.dataset.retryAttempted = 'true';
        element.after(retry);
    } else {
        element.setAttribute(attrName, retryUrl);
    }
    return true;
}

function handleAssetError(event) {
    const target = event && event.target;
    if (!target) return;

    if (target.tagName === 'LINK' && target.rel === 'stylesheet') {
        retryAssetWithCacheBuster(target, 'href');
    } else if (target.tagName === 'SCRIPT') {
        const src = target.getAttribute('src') || '';
        if (src.includes('ace.js')) {
            if (typeof showError === 'function') showError();
        } else if (src.includes('diff2html')) {
            retryAssetWithCacheBuster(target, 'src');
        }
    }
}

// Global capture-phase error listener for resource loading failures
window.addEventListener('error', handleAssetError, true);

// Verify loaded status of critical assets once core-boot runs
function verifyCriticalAssets() {
    if (typeof ace === 'undefined' && typeof showError === 'function') {
        showError();
    }

    if (typeof Diff2Html === 'undefined') {
        const diffScript = document.querySelector('script[src*="diff2html"]');
        if (diffScript) retryAssetWithCacheBuster(diffScript, 'src');
    }

    const cssLinks = document.querySelectorAll('link[rel="stylesheet"]');
    cssLinks.forEach((link) => {
        // A stylesheet that failed to load has link.sheet === null in standard browsers
        if (link.sheet === null) {
            retryAssetWithCacheBuster(link, 'href');
        }
    });
}

verifyCriticalAssets();

// Launch initialization on startup
initWorkspace();

// ﹥ HANDLE OPEN FILE IN NEW WINDOW (URL QUERY PARAM)
async function checkOpenFileInNewWindow() {
    const urlParams = new URLSearchParams(window.location.search);
    const openFileId = urlParams.get('open_file_id');
    if (!openFileId) return;

    try {
        const key = 'famouskai_open_file_' + openFileId;
        const handle = await idbKeyval.get(key);
        if (handle) {
            await idbKeyval.del(key);

            // Check and request permission if needed
            if (await handle.queryPermission({ mode: 'readwrite' }) !== 'granted') {
                await handle.requestPermission({ mode: 'readwrite' });
            }

            const file = await handle.getFile();
            const text = await file.text();

            fileHandle = handle;
            currentFileName = handle.name;
            lastKnownModifiedTime = file.lastModified;
            isInitialLoad = true;
            isModified = false;

            let changedOnOpen = false;
            if (editor) {
                editor.setValue(text, -1);
                applyNativeColoration(currentFileName);
                changedOnOpen = emitFileOpen();
                updateUI();
                addRecentFile(handle);
                setTimeout(() => {
                    editor.focus();
                    isInitialLoad = false;
                }, 50);
            }
            // Keep the Auto-cleanup warning visible instead of replacing it.
            if (!changedOnOpen && window.showToast) window.showToast("File opened in new window", "success");
        }
    } catch (err) {
        console.error("Error opening file in new window:", err);
    } finally {
        // Clean up query param from URL
        const url = new URL(window.location.href);
        url.searchParams.delete('open_file_id');
        window.history.replaceState({}, document.title, url.pathname + url.search);
    }
}

// Trigger check shortly after UI and Ace editor are initialized
setTimeout(checkOpenFileInNewWindow, 250);

// ﹥ SHARE TARGET API HANDLING (ANDROID INTENT)
async function checkSharedContent() {
    // Exit early if the URL doesn't contain the flag set by the Service Worker
    if (!window.location.search.includes('shared=true')) return;

    try {
        const sharedFile = await idbKeyval.get('famouskai_shared_file');
        const sharedText = await idbKeyval.get('famouskai_shared_text');

        if (sharedFile || sharedText) {
            // Prevent accidental overwriting of unsaved work
            if (isModified && !confirm("Unsaved changes will be lost. Load the shared content?")) {
                window.history.replaceState({}, document.title, window.location.pathname);
                return;
            }

            isInitialLoad = true;
            fileHandle = null; // Forces "Save As" since we don't have FileSystemAccess rights on shared Android intents
            isModified = false;

            if (sharedFile) {
                currentFileName = sharedFile.name;
                const text = await sharedFile.text();
                editor.setValue(text, -1);
                await idbKeyval.del('famouskai_shared_file'); // Cleanup
                if (window.showToast) window.showToast("Shared file loaded", "success");
            } else if (sharedText) {
                currentFileName = "shared_snippet.txt";
                editor.setValue(sharedText, -1);
                await idbKeyval.del('famouskai_shared_text'); // Cleanup
                if (window.showToast) window.showToast("Shared text loaded", "success");
            }

            applyNativeColoration(currentFileName);
            emitFileOpen();
            updateUI();

            setTimeout(() => {
                if (editor) editor.focus();
                isInitialLoad = false;
            }, 50);
        }

        // Clean the URL to prevent reloading the same shared file upon manual page refresh
        window.history.replaceState({}, document.title, window.location.pathname);

    } catch (err) {
        console.error("Error reading shared content from IDB:", err);
    }
}

// Trigger the check shortly after the UI and Ace editor are initialized
setTimeout(checkSharedContent, 300);

// ﹥ OPEN A TEST FILE FROM THE URL (?fixture=tests/fixtures-name.ext)
// The test hub links to the sample files and the manual test plans this way:
// one click opens the file under its own name, unsaved (fileHandle null), so
// testers have nothing to save or clean up. Only flat tests/fixtures-* files
// and tests/manual-*.md plans of this site are read.
// Files of this site that a link may open: any file with a type Famouskai edits
// (WORKSPACE_ALLOWED_EXT: md, js, json, csv...), subfolders too, for example
// a docs folder when reviewing a PR on its preview. Hidden folders stay closed
// except a leading .github/ (contributor guides, templates, bots).
const SITE_PATH_RE = /^(?:\.github\/)?(?:[A-Za-z0-9_-][A-Za-z0-9._-]*\/)*[A-Za-z0-9_-][A-Za-z0-9._-]*\.[A-Za-z0-9]+$/;

function isOpenableSitePath(path) {
    if (!SITE_PATH_RE.test(path) || path.includes('..')) return false;
    return WORKSPACE_ALLOWED_EXT.includes(path.split('.').pop().toLowerCase());
}

async function openFixtureFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const path = params.get('open') || params.get('fixture');
    if (!path) return false;
    try {
        if (!isOpenableSitePath(path)) {
            if (window.showToast) window.showToast("Cannot open this file: " + path, "error");
            return false;
        }
        if (isModified && !confirm("Unsaved changes will be lost. Open " + path + "?")) return false;
        const response = await fetch(path, { cache: 'no-store' });
        if (!response.ok) throw new Error('HTTP ' + response.status);
        const text = await response.text();

        isInitialLoad = true;
        fileHandle = null;
        currentFileName = path.split('/').pop();
        isModified = false;
        editor.setValue(text, -1);
        applyNativeColoration(currentFileName);
        const changedOnOpen = emitFileOpen();
        updateUI();
        setTimeout(() => {
            if (editor) editor.focus();
            isInitialLoad = false;
        }, 50);
        if (!changedOnOpen && window.showToast) window.showToast("Opened from the site (not saved)", "success");
        return true;
    } catch (err) {
        console.error("Error opening a file of the site:", err);
        if (window.showToast) window.showToast("Could not open: " + path, "error");
        return false;
    }
}

// ﹥ FORCE THE DISPLAY FROM THE URL (&view= and &tab=)
// A link says how the app opens, for this opening only (settings untouched):
//   ?view=editor      editor alone (preview closed)
//   ?view=split       Outline + editor + preview
//   ?view=read        reader: wide preview + Outline
//   ?view=read-light  wide preview alone
//   ?tab=<id>         sidebar tab to open (outline, explorer, tools, settings...)
//   ?preview=dark     dark preview theme (or light); the saved theme is kept and a
//                     click on the theme button saves the user's own choice again
// The preview views need a file the preview can show (Markdown, diff, patch):
// otherwise only &tab= applies. On a small screen (<= 900 px) the preview is
// already full width and the sidebar stays closed unless &tab= asks for it.
const URL_VIEWS = ['editor', 'split', 'read', 'read-light'];
const SIDEBAR_TAB_KEY = 'famouskai_active_sidebar_tab';

function applyViewFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const view = params.get('view');
    const tab = params.get('tab');
    const theme = params.get('preview');
    if (!view && !tab && !theme) return false;
    const sidebar = window.FamousPluginCore && window.FamousPluginCore.Sidebar;
    const isSmallScreen = window.innerWidth <= 900;
    let applied = false;

    // The remembered sidebar tab is a preference: a link must not change it.
    let savedTab = null;
    try { savedTab = localStorage.getItem(SIDEBAR_TAB_KEY); } catch (e) { /* storage blocked */ }
    const openTab = (id) => {
        if (!sidebar || !sidebar.getTab(id)) return false;
        sidebar.switchTab(id, true);
        return true;
    };

    try {
        if (view && URL_VIEWS.includes(view)) {
            const btnPreview = document.getElementById("btn-preview");
            const canPreview = !!btnPreview && btnPreview.style.display !== "none";
            if (view === 'editor') {
                if (isPreviewOpen) togglePreview();
                applied = true;
            } else if (canPreview) {
                if (!isPreviewOpen) togglePreview();
                const wantFull = view !== 'split';
                if (!isSmallScreen && isPreviewFull !== wantFull) toggleFullPreview();
                if (!tab && !isSmallScreen) {
                    if (view === 'read-light') {
                        if (sidebar && sidebar.isOpen) sidebar.closeSidebar();
                    } else {
                        openTab('outline');
                    }
                }
                applied = true;
            }
        }
        if (tab && openTab(tab)) applied = true;
        if (theme === 'dark' || theme === 'light') {
            if (previewDarkSetting === null) previewDarkSetting = isPreviewDark;
            isPreviewDark = theme === 'dark';
            updatePreviewThemeUI();
            applied = true;
        }
    } finally {
        try {
            if (savedTab === null) localStorage.removeItem(SIDEBAR_TAB_KEY);
            else localStorage.setItem(SIDEBAR_TAB_KEY, savedTab);
        } catch (e) { /* storage blocked */ }
    }
    if (editor) editor.resize();
    return applied;
}

// Open the file named in the URL, then apply &view= / &tab= (also without a
// file). A refused or missing file leaves the display as it is.
async function openFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const asksFile = params.has('open') || params.has('fixture');
    const opened = await openFixtureFromUrl();
    if (!asksFile || opened) applyViewFromUrl();
}

setTimeout(openFromUrl, 350);

updateUI();

// FORCE TOOL RENDERING AND AUTO-FOCUS AT STARTUP FOR "[New]" FILE
// Use currentFileName, not "": a file opened from the OS file manager
// (launchQueue) can already be loaded when this timer fires, and
// resetting to "" would drop its syntax coloring until a manual reload.
setTimeout(() => {
    applyNativeColoration(currentFileName);
    if (editor) editor.focus();
}, 100);
