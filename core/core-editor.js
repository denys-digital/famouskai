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
 * Famouskai Core - Editor Initialization & Event Handlers
 *
 * What it holds:
 *   - Core UI update function (updateUI)
 *   - Ace Editor configuration, instance creation, and event bindings
 *   - Famous Mark YAML fold mode patching
 *   - Startup lifecycle listeners (DOMContentLoaded, workspace-updated)
 *
 * Globals used:
 *   - ace, document, window, localStorage
 *   - fileHandle, currentFileName, isModified, isInitialLoad, lastKnownModifiedTime
 *   - autoSaveTimer, isAutoSaveEnabled
 *   - FILE_ICON_MAP
 *   - window.FamousPluginCore
 *   - showError, applyNativeColoration, saveFile, refreshWorkspaceList, renderWorkspaceSelect, renderRecentFilesList
 *
 * Globals defined:
 *   - updateUI
 *   - isYamlMode, patchFoldMode, nativeRangeOverlapsMarker, syncFoldWidgetCache
 *   - cleanupCursorLocalStorage, applyScreenLayout, getWindowsSignature, sendWindowHeartbeat, renderActiveWindowsList
 *
 * Note: The editor instance (let editor in core-state.js) is initialized in this file.
 */

// ﹥ CORE UI UPDATE
// Overwriting updateUI to natively support inline icons and preview buttons
function updateUI() {
    const titleName = currentFileName || "[New]";
    const modStar = isModified ? " *" : "";
    document.title = modStar + titleName + " - Famouskai Editor";

    const fileNameEl = document.getElementById("file-name");

    let ext = currentFileName ? currentFileName.split('.').pop().toLowerCase() : '';

    if (!ext && editor) {
        const modeId = editor.session.$modeId || "";
        const modeName = modeId.split('/').pop();

        const modeMap = { 'javascript':'js', 'typescript':'ts', 'html':'html', 'xml':'xml',
           'css':'css', 'json':'json', 'markdown':'md', 'yaml':'yml', 'text':'txt',
           'csv':'csv', 'svg':'svg', 'diff':'patch', 'patch':'patch'
        };
        ext = modeMap[modeName] || 'txt';
    }

    updateSnippetsUI(ext);

    const iconHtml = getFileIcon(ext);

    // Build modular HTML structure for text and copy button
    let content = iconHtml + `<span id="file-name-text">${titleName}${modStar}</span>`;

    if (fileHandle) {
        // Inline SVG for the copy icon
        content += `<button id="file-name-copy" class="toolbar-icon-btn" title="Copy file name">
                        <svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                    </button>`;

        // Add external link button specifically for HTML files
        if (ext === 'html' || ext === 'svg')  {
            content += `<button id="file-name-open-ext" class="toolbar-icon-btn" title="View in new tab">
                            <svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                        </button>`;
        }
    }

    fileNameEl.innerHTML = content;
    fileNameEl.title = currentFileName || "[New]";

    // Re-attach specific event listeners after innerHTML mutation
    const textEl = document.getElementById("file-name-text");
    if (textEl) {
        // Set tooltip securely via DOM property to avoid quote escaping issues
        textEl.title = `${titleName} - Click to rename`;

        if (fileHandle) {
            textEl.addEventListener("click", renameCurrentFile);
        }
    }

    const copyEl = document.getElementById("file-name-copy");
    if (copyEl) {
        copyEl.addEventListener("click", copyFileName);
    }

    // Attach event listener for the external link button
    const openExtEl = document.getElementById("file-name-open-ext");
    if (openExtEl && fileHandle) {
        openExtEl.addEventListener("click", openHtmlInNewTab);
    }

    if (isModified) fileNameEl.classList.add('is-modified');
    else fileNameEl.classList.remove('is-modified');

    document.getElementById("btn-reload").disabled = !fileHandle;
    document.getElementById("btn-move").disabled = !fileHandle || isModified;

    const toggleAutoSave = document.getElementById("toggle-autosave");
    toggleAutoSave.disabled = !fileHandle;
    if (!fileHandle) {
        toggleAutoSave.checked = false;
        // Do NOT touch isAutoSaveEnabled here, preserve user intent in memory
    } else {
        // Restore actual user intent visually when a file is opened
        toggleAutoSave.checked = isAutoSaveEnabled;
    }

    const btnPreview = document.getElementById("btn-preview");
    const btnExport = document.getElementById("btn-export-html");
    const btnPreviewTheme = document.getElementById("btn-preview-theme");
    const isMobkaiMode = typeof window.isMobkai === 'function' && window.isMobkai();
    if (ext === 'md') {
        btnPreview.style.display = "inline-block";
        if (isPreviewOpen) {
            document.getElementById("btn-print").style.display = "inline-block";
            if (btnExport) btnExport.style.display = "inline-block";
            if (btnPreviewTheme) btnPreviewTheme.style.display = "inline-block";
        } else {
            if (btnExport) btnExport.style.display = "none";
            if (btnPreviewTheme) btnPreviewTheme.style.display = "none";
        }
    } else if (!isMobkaiMode && (ext === 'patch' || ext === 'diff')) {
        btnPreview.style.display = "inline-block";
        document.getElementById("btn-print").style.display = "none";
        if (btnExport) btnExport.style.display = "none";
        if (btnPreviewTheme) btnPreviewTheme.style.display = "none";
    } else {
        btnPreview.style.display = "none";
        document.getElementById("btn-print").style.display = "none";
        if (btnExport) btnExport.style.display = "none";
        if (btnPreviewTheme) btnPreviewTheme.style.display = "none";
        if (isPreviewOpen) togglePreview();
    }

    const toolbarRight = document.getElementById("toolbar-right");
    const divider = document.getElementById("toolbar-plugins-divider");

    if (toolbarRight && divider && btnPreview) {
        const hasTools = toolbarRight.hasAttribute("data-has-tools");
        const isPreviewVisible = btnPreview.style.display !== "none";

        if (hasTools && isPreviewVisible) {
            divider.style.display = "block";
        } else {
            divider.style.display = "none";
        }
    }

    // Tell the other windows at once when the file name changes.
    if (typeof window.sendWindowHeartbeat === 'function') {
        window.sendWindowHeartbeat();
    }
}

if (typeof ace !== 'undefined') {
    ace.config.set('basePath', 'vendor/ace-builds');
    ace.config.set('modePath', 'vendor/ace-builds');
    ace.config.set('themePath', 'vendor/ace-builds');

    // Register custom syntax modes explicitly to bypass the default vendor directory
    ace.config.setModuleUrl("ace/mode/log", "plugins/ace-custom/mode-log.js");

    editor = ace.edit("editor");
    // Without this, window.editor is the <div id="editor"> element (browser named access).
    window.editor = editor;

    editor.setTheme("ace/theme/famouskai");
    editor.session.setMode("ace/mode/text");

    editor.setOptions({
        fontSize: "18px",
        fontFamily: "monospace",
        useSoftTabs: true,
        tabSize: 4,
        wrap: true,
        showGutter: true,
        enableAutoIndent: true,
        selectionStyle: "line",
        highlightActiveLine: true,
        cursorStyle: "smooth",
        showPrintMargin: false,
        displayIndentGuides: true,
        vScrollBarAlwaysVisible: false,
        hScrollBarAlwaysVisible: false
    });

    if (typeof window.isMobkai === 'function' && window.isMobkai()) {
        editor.setOptions({
            fontSize: "18px",
            wrap: true,
            indentedSoftWrap: false,
            showGutter: false,
            highlightActiveLine: false,
            displayIndentGuides: false,
            dragEnabled: false,
            enableMobileMenu: false
        });
        if (editor.renderer) {
            editor.renderer.setPadding(8);
            editor.renderer.setScrollMargin(8, 48, 0, 0);
        }
    }

    // ============================================================================
    // FAMOUS MARK UNIVERSAL FOLDING (U+FE65 "﹥") - STABILIZED PATCH (v8)
    // ----------------------------------------------------------------------------
    // Drop-in replacement for the v7 block. Place this single IIFE call right
    // after editor.session.setMode('ace/mode/text') and editor.setOptions(...),
    // BEFORE editor.session.setUseWorker(false).
    //
    // CHANGES SINCE v7 (v8 - stabilization release):
    //
    // 1. YAML EXCLUSION (deliberate scope reduction, not a bug fix):
    //    All test scenarios are conclusive EXCEPT YAML, which still shows
    //    intermittent/unstable behavior under real-world usage. To ship a
    //    reliable v8 now, Famous Mark folding is explicitly DISABLED for any
    //    session whose current language mode id contains "yaml". Native YAML
    //    folding is left completely untouched (never patched, never wrapped),
    //    exactly as if this whole system did not exist for that mode. This is a
    //    deliberate, explicit early-exit - not a silent failure - and is fully
    //    reversible by removing the isYamlMode() guard once YAML is revisited.
    //    See the separate YAML handoff document for the open investigation.
    //
    // 2. LOG NOISE REDUCTION: the two highest-frequency trace lines
    //    ("[FoldPatch] Found on row ..." and "[FoldPatch] Range triggered on
    //    row ...") fire on almost every keystroke, scroll and redraw and were
    //    flooding the console during daily use. They are commented out by
    //    default (search for "UNCOMMENT FOR DEBUG" below to re-enable them) but
    //    intentionally left in the code, not deleted, so any future
    //    investigation can turn them back on with a one-line change. All other
    //    trace logs (patch lifecycle, cache sync, native suppression, mode
    //    changes, errors) remain active permanently.
    //
    // No other logic changed since v7: STEP 5's real session.$setFolding() fix
    // (fixes brand-new/.txt documents) and the removal of the v6 "safety net"
    // click handler (fixes the fold-then-instant-unfold race) are both kept as
    // validated by the latest test round (JS/CSS/HTML/.txt/.log/new documents
    // all conclusive).
    // ============================================================================
    (function initFamousMarkFolding(editor) {
        if (!editor || editor.session.isFamousFoldPatchInit) {
            console.log('[FoldPatch] Already initialized for this session, skipping.');
            return;
        }
        editor.session.isFamousFoldPatchInit = true;

        console.log('[FoldPatch] 0. Initializing Famous Mark universal folding system (v8).');

        const Range = ace.require('ace/range').Range;
        // U+FE65 "﹥" (Famous Arrow) + U+2022 "•" (Magic Dot) + U+00B0 "°" (Flying Bubble)
        // Read from the single source of truth (ext-famous-core.js) instead of a local
        // literal, so ACE folding and Outline bookmarking can never drift apart again.
        // Defensive fallback preserved in case ext-famous-core.js failed to load
        // (e.g. offline PWA with a partially corrupted cache).
        const famousRegex = (window.FamousPluginCore && window.FamousPluginCore.FamousMark)
            ? window.FamousPluginCore.FamousMark.regex
            : /^\s*[/<*!\-#%;]*\s*[﹥•°]/;

        // Returns true if the CURRENT session language is YAML. Famous Mark
        // folding is intentionally disabled for this mode (see header comment).
        function isYamlMode() {
            const modeId = editor.session.getMode() && editor.session.getMode().$id;
            return !!modeId && modeId.indexOf('yaml') !== -1;
        }

        // ------------------------------------------------------------------------
        // STEP 1 - Universal Fold Support Extension for modes WITHOUT native
        // folding (ace/mode/text: .txt files and brand new unsaved documents).
        // Unaffected by the YAML exclusion: YAML always has its own native
        // foldingRules already, so this injection never applies to it anyway.
        // ------------------------------------------------------------------------
        try {
            const BaseFoldMode = ace.require('ace/mode/folding/fold_mode').FoldMode;
            const TextMode = ace.require('ace/mode/text').Mode;
            if (!TextMode.prototype.foldingRules) {
                console.log('[FoldPatch] 1. Injecting base FoldMode into ace/mode/text prototype.');
                const fallbackFoldMode = new BaseFoldMode();
                // Tells patchFoldMode() to NEVER delegate to the native
                // implementation for this instance: it has no real rules
                // (foldingStartMarker/foldingStopMarker are null), delegating
                // would throw "Cannot read properties of null (reading 'test')".
                fallbackFoldMode.isFamousBaseFallback = true;
                TextMode.prototype.foldingRules = fallbackFoldMode;
            } else {
                console.log('[FoldPatch] 1. ace/mode/text already has foldingRules, skipping injection.');
            }
        } catch (e) {
            console.log('[FoldPatch] ERROR while injecting text-mode folding support.', e);
        }

        // ------------------------------------------------------------------------
        // STEP 2 - Core patch: wrap getFoldWidget/getFoldWidgetRange of any
        // foldMode object to recognize the Famous Mark, falling back to the
        // native implementation for every other line (except on the injected
        // empty BaseFoldMode, which has no native implementation to fall back to).
        // NEVER called for YAML foldMode objects (see the $foldMode trap below).
        // ------------------------------------------------------------------------
        function patchFoldMode(foldMode) {
            if (!foldMode || foldMode.isFamousPatched) {
                return;
            }
            console.log('[FoldPatch] 2. Patching new foldMode instance.');
            foldMode.isFamousPatched = true;

            const originalGetFoldWidget = foldMode.getFoldWidget;
            const originalGetFoldWidgetRange = foldMode.getFoldWidgetRange;
            const canDelegate = !foldMode.isFamousBaseFallback;

            // Does the native fold range for this row swallow a Famous Mark row?
            // Anti-recursion: some native modes call "this.getFoldWidget(...)"
            // from inside their own getFoldWidgetRange. We temporarily restore
            // the native getFoldWidget during the probe so any such internal
            // call never re-enters our patched version.
            function nativeRangeOverlapsMarker(session, foldStyle, row) {
                if (!canDelegate || !originalGetFoldWidgetRange) {
                    return false;
                }
                const patchedGetFoldWidget = foldMode.getFoldWidget;
                foldMode.getFoldWidget = originalGetFoldWidget;
                try {
                    const nativeRange = originalGetFoldWidgetRange.call(foldMode, session, foldStyle, row);
                    if (!nativeRange) {
                        return false;
                    }
                    for (let r = nativeRange.start.row; r <= nativeRange.end.row; r++) {
                        const l = session.getLine(r);
                        if (l && famousRegex.test(l)) {
                            return true;
                        }
                    }
                    return false;
                } catch (e) {
                    console.log('[FoldPatch] Error probing native range overlap, ignoring.', e);
                    return false;
                } finally {
                    foldMode.getFoldWidget = patchedGetFoldWidget;
                }
            }

            foldMode.getFoldWidget = function(session, foldStyle, row) {
                const line = session.getLine(row);
                if (line && famousRegex.test(line)) {
                    // UNCOMMENT FOR DEBUG - very high frequency (fires on nearly
                    // every redraw/keystroke), kept disabled by default since v8.
                    // console.log('[FoldPatch] Found on row ' + row);
                    return 'start';
                }
                if (canDelegate && originalGetFoldWidget) {
                    try {
                        const widget = originalGetFoldWidget.call(this, session, foldStyle, row);
                        if (widget === 'start' && nativeRangeOverlapsMarker(session, foldStyle, row)) {
                            console.log('[FoldPatch] Suppressing native fold widget on row ' + row + ' (overlaps a Famous Mark line).');
                            return '';
                        }
                        return widget;
                    } catch (e) {
                        console.log('[FoldPatch] originalGetFoldWidget threw, ignoring.', e);
                        return '';
                    }
                }
                return '';
            };

            foldMode.getFoldWidgetRange = function(session, foldStyle, row) {
                const line = session.getLine(row);
                if (line && famousRegex.test(line)) {
                    // UNCOMMENT FOR DEBUG - very high frequency (fires on nearly
                    // every redraw/keystroke), kept disabled by default since v8.
                    // console.log('[FoldPatch] Range triggered on row ' + row);
                    const startRow = row;
                    const startColumn = line.length;
                    const maxRow = session.getLength();
                    let endRow = startRow;
                    for (let i = startRow + 1; i < maxRow; i++) {
                        if (famousRegex.test(session.getLine(i))) {
                            break;
                        }
                        endRow = i;
                    }
                    if (endRow > startRow) {
                        const endColumn = session.getLine(endRow).length;
                        return new Range(startRow, startColumn, endRow, endColumn);
                    }
                    return null;
                }
                if (canDelegate && originalGetFoldWidgetRange) {
                    try {
                        if (nativeRangeOverlapsMarker(session, foldStyle, row)) {
                            console.log('[FoldPatch] Suppressing native fold range on row ' + row + ' (overlaps a Famous Mark line).');
                            return null;
                        }
                        return originalGetFoldWidgetRange.call(this, session, foldStyle, row);
                    } catch (e) {
                        console.log('[FoldPatch] originalGetFoldWidgetRange threw, ignoring.', e);
                        return null;
                    }
                }
                return null;
            };
        }

        // ------------------------------------------------------------------------
        // STEP 3 - Synchronously repopulate session.foldWidgets for every Famous
        // Mark row so Ace's native gutterclick gate always passes:
        //   session.foldWidgets && session.foldWidgets[row] && onFoldWidgetClick()
        // Never called for YAML sessions (see the $foldMode trap below).
        // ------------------------------------------------------------------------
        function syncFoldWidgetCache(session) {
            if (!session || typeof session.getFoldWidget !== 'function') {
                console.log('[FoldPatch] syncFoldWidgetCache: session.getFoldWidget not wired yet, skipping.');
                return;
            }
            if (!session.foldWidgets) {
                session.foldWidgets = [];
            }
            const len = session.getLength();
            let synced = 0;
            for (let row = 0; row < len; row++) {
                const line = session.getLine(row);
                if (line && famousRegex.test(line)) {
                    try {
                        session.foldWidgets[row] = session.getFoldWidget(row);
                        synced++;
                    } catch (e) {
                        console.log('[FoldPatch] Error syncing foldWidgets cache for row ' + row, e);
                    }
                }
            }
            if (synced > 0) {
                console.log('[FoldPatch] 5. foldWidgets cache synced for ' + synced + ' Famous Mark row(s).');
            }
        }

        // ------------------------------------------------------------------------
        // STEP 4 - Trap session.$foldMode so every foldMode Ace assigns (now or
        // later, for any language, including redundant reassignments) is patched
        // and the widget cache is resynced immediately and synchronously.
        //
        // YAML EXCLUSION: if the mode being assigned is YAML, we deliberately
        // skip patchFoldMode() and syncFoldWidgetCache() entirely. The native
        // foldMode object is stored as-is and left 100% untouched, so YAML
        // folding behaves exactly as stock Ace - Famous Mark folding simply does
        // not exist for this language for now.
        // ------------------------------------------------------------------------
        let internalFoldMode = editor.session.$foldMode;
        if (internalFoldMode && !isYamlMode()) {
            patchFoldMode(internalFoldMode);
        }
        let lastLanguageModeId = editor.session.getMode() && editor.session.getMode().$id;

        Object.defineProperty(editor.session, '$foldMode', {
            get: function() {
                return internalFoldMode;
            },
            set: function(newMode) {
                internalFoldMode = newMode;

                const currentLanguageModeId = editor.session.getMode() && editor.session.getMode().$id;
                const isYaml = currentLanguageModeId && currentLanguageModeId.indexOf('yaml') !== -1;
                const isRedundantReassignment = currentLanguageModeId && currentLanguageModeId === lastLanguageModeId;
                lastLanguageModeId = currentLanguageModeId;

                if (isYaml) {
                    console.log('[FoldPatch] YAML mode detected - skipping Famous Mark folding entirely, native YAML folding only.');
                    return;
                }

                console.log('[FoldPatch] 3. Ace assigned a new $foldMode. Intercepting.');
                if (newMode) {
                    patchFoldMode(newMode);
                }

                // Ace's own $setFolding() just reset session.foldWidgets = []
                // for this new object instance, REGARDLESS of whether the
                // language actually changed. Resync our rows synchronously,
                // right now, so clicks never race the cache.
                syncFoldWidgetCache(editor.session);

                if (isRedundantReassignment) {
                    console.log('[FoldPatch] Redundant $foldMode reassignment for ' + currentLanguageModeId + ', skipping disruptive tokenizer restart.');
                    return;
                }

                // Real language change: let the tokenizer redraw normally, then
                // resync again once it settles (defensive double-check).
                setTimeout(function() {
                    try {
                        editor.session.bgTokenizer.start(0);
                    } catch (e) {
                        console.log('[FoldPatch] bgTokenizer restart failed, ignoring.', e);
                    }
                    setTimeout(function() {
                        syncFoldWidgetCache(editor.session);
                    }, 20);
                }, 10);
            }
        });

        // Keep the cache fresh as the user types (adds/removes Famous Marks).
        // No-ops harmlessly for YAML sessions since syncFoldWidgetCache only
        // touches Famous Mark rows, and those rows were never patched for YAML
        // in the first place (session.getFoldWidget still points to the
        // untouched native YAML implementation).
        let changeSyncTimer = null;
        editor.session.on('change', function() {
            if (isYamlMode()) {
                return;
            }
            clearTimeout(changeSyncTimer);
            changeSyncTimer = setTimeout(function() {
                syncFoldWidgetCache(editor.session);
            }, 150);
        });

        // ------------------------------------------------------------------------
        // STEP 5 - Force the currently active session to pick up folding right
        // now (covers a blank new document loaded in text mode BEFORE our patch
        // to TextMode.prototype.foldingRules ran). Skipped entirely for YAML.
        //
        // Preference order:
        //   1. session.setFolding(rules)   - public API, if present.
        //   2. session.$setFolding(rules)  - REAL internal API used by Ace's own
        //      setMode()/$onChangeMode() pipeline. Performs the full wiring:
        //      resets foldWidgets, and (re)binds session.getFoldWidget /
        //      session.getFoldWidgetRange to the new foldMode. Present in every
        //      Ace build, including this one (setFolding without "$" is the one
        //      missing here).
        //   3. Last-resort manual replication, only if neither API exists.
        // ------------------------------------------------------------------------
        try {
            if (isYamlMode()) {
                console.log('[FoldPatch] 4. Initial mode is YAML, skipping forced fold re-application.');
            } else {
                const currentMode = editor.session.getMode();
                if (currentMode && currentMode.foldingRules) {
                    console.log('[FoldPatch] 4. Forcing session to re-apply folding for the currently active mode.');
                    if (typeof editor.session.setFolding === 'function') {
                        editor.session.setFolding(currentMode.foldingRules);
                    } else if (typeof editor.session.$setFolding === 'function') {
                        console.log('[FoldPatch] 4b. Using internal session.$setFolding (real Ace wiring) instead of the missing public setFolding().');
                        editor.session.$setFolding(currentMode.foldingRules);
                    } else {
                        console.log('[FoldPatch] 4c. Neither setFolding nor $setFolding available, falling back to manual wiring.');
                        editor.session.$foldMode = currentMode.foldingRules;
                        const foldStyle = editor.session.$foldStyle || 'markbegin';
                        editor.session.foldWidgets = [];
                        editor.session.getFoldWidget = function(row) {
                            return currentMode.foldingRules.getFoldWidget(editor.session, foldStyle, row);
                        };
                        editor.session.getFoldWidgetRange = function(row) {
                            return currentMode.foldingRules.getFoldWidgetRange(editor.session, foldStyle, row);
                        };
                    }
                    if (editor.session.bgTokenizer) {
                        editor.session.bgTokenizer.start(0);
                    }
                    setTimeout(function() {
                        syncFoldWidgetCache(editor.session);
                        if (editor.renderer) {
                            editor.renderer.updateFull(true);
                        }
                    }, 30);
                }
            }
        } catch (e) {
            console.log('[FoldPatch] ERROR while forcing initial fold support.', e);
        }

        console.log('[FoldPatch] 6. Famous Mark universal folding system ready (YAML excluded by design).');
    })(editor);
    // ------------------------------------------------------------------------

    editor.session.setUseWorker(false);

    editor.session.on('change', function() {
        if (!isInitialLoad && !isModified) {
            isModified = true;
            updateUI();
        }
    });

    // --- LocalStorage Cursor Position Management & LRU Cleanup ---
    const MAX_CURSOR_ENTRIES = 50;

    function cleanupCursorLocalStorage(maxAllowed = MAX_CURSOR_ENTRIES) {
        try {
            const cursorKeys = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('cursor_')) {
                    let updatedAt = 0;
                    try {
                        const val = JSON.parse(localStorage.getItem(key));
                        if (val && typeof val.updatedAt === 'number') {
                            updatedAt = val.updatedAt;
                        }
                    } catch (e) {
                        // Ignore parse errors, treat as oldest
                    }
                    cursorKeys.push({ key, updatedAt });
                }
            }

            if (cursorKeys.length > maxAllowed) {
                // Sort ascending by updatedAt: oldest (0 or lower) first
                cursorKeys.sort((a, b) => a.updatedAt - b.updatedAt);
                const entriesToRemove = cursorKeys.length - maxAllowed;
                for (let i = 0; i < entriesToRemove; i++) {
                    localStorage.removeItem(cursorKeys[i].key);
                }
            }
        } catch (e) {
            console.warn("Failed to cleanup cursor position LocalStorage entries:", e);
        }
    }

    // Expose for startup and testing
    window.cleanupCursorLocalStorage = cleanupCursorLocalStorage;

    editor.selection.on('changeCursor', function() {
        if (!isInitialLoad && currentFileName) {
            const cursor = editor.getCursorPosition();
            const cursorData = {
                row: cursor.row,
                column: cursor.column,
                updatedAt: Date.now()
            };
            localStorage.setItem(`cursor_${currentFileName}`, JSON.stringify(cursorData));
            cleanupCursorLocalStorage(MAX_CURSOR_ENTRIES);
        }
    });

} else {
    showError();
}

window.addEventListener('DOMContentLoaded', () => {
    // Initial LRU cleanup of cursor positions in LocalStorage
    if (typeof window.cleanupCursorLocalStorage === 'function') {
        window.cleanupCursorLocalStorage(50);
    }

    // Workspace Select & Add Bindings
    const wksSelect = document.getElementById('workspace-select');
    if (wksSelect) {
        wksSelect.addEventListener('change', async (e) => {
            const idx = e.target.value;
            const removeBtn = document.getElementById('workspace-remove');
            if (removeBtn) removeBtn.disabled = (idx === '');
            if (idx === '') return;
            const list = await getSavedWorkspaces();
            const selected = list[parseInt(idx)];
            if (selected && selected.handle) {
                try {
                    const perm = await selected.handle.queryPermission({ mode: 'readwrite' });
                    if (perm !== 'granted') {
                        const req = await selected.handle.requestPermission({ mode: 'readwrite' });
                        if (req !== 'granted') return;
                    }
                    window.currentWorkspaceHandle = selected.handle;
                    await idbKeyval.set('default_workspace_handle', selected.handle);
                    refreshWorkspaceList();
                    renderRecentFilesList();
                } catch (err) {
                    console.error("Failed to activate workspace:", err);
                }
            }
        });
    }

    const btnAddWks = document.getElementById('btn-add-workspace');
    if (btnAddWks) {
        btnAddWks.addEventListener('click', async () => {
            if (window.FamousPluginCore && window.FamousPluginCore.Manager) {
                const tool = window.FamousPluginCore.Manager.registry.find(t => t.name === "Set Default Workspace");
                if (tool) {
                    tool.action(editor);
                }
            }
        });
    }

    // --- SCREEN LAYOUT CONTROLS ---
    const layoutControls = document.getElementById('window-layout-controls');
    if (layoutControls) {
        // Hide layout control buttons if running in normal browser window mode
        if (typeof isPopupWindow === 'function' && !isPopupWindow()) {
            layoutControls.style.display = 'none';
        }
    }

    const btnTileLeft = document.getElementById('btn-layout-tile-left');
    const btnTileRight = document.getElementById('btn-layout-tile-right');
    const btnFullscreen = document.getElementById('btn-layout-fullscreen');

    function applyScreenLayout(pos) {
        try {
            const screenLeft = window.screen.availLeft || 0;
            const screenTop = window.screen.availTop || 0;
            const availWidth = window.screen.availWidth;
            const availHeight = window.screen.availHeight;
            const halfWidth = Math.floor(availWidth / 2);

            if (pos === 'left') {
                window.moveTo(screenLeft, screenTop);
                window.resizeTo(halfWidth, availHeight);
            } else if (pos === 'right') {
                window.moveTo(screenLeft + halfWidth, screenTop);
                window.resizeTo(halfWidth, availHeight);
            } else if (pos === 'full') {
                window.moveTo(screenLeft, screenTop);
                window.resizeTo(availWidth, availHeight);
            }
            if (window.showToast) window.showToast("Layout set to " + pos, "success");
        } catch (err) {
            console.warn("Screen layout error:", err);
        }
    }

    if (btnTileLeft) btnTileLeft.addEventListener('click', () => applyScreenLayout('left'));
    if (btnTileRight) btnTileRight.addEventListener('click', () => applyScreenLayout('right'));
    if (btnFullscreen) btnFullscreen.addEventListener('click', () => applyScreenLayout('full'));

    // --- ACTIVE WINDOWS TRACKER (BROADCASTCHANNEL HEARTBEAT) ---
    const windowInstanceId = Date.now().toString() + '_' + Math.random().toString(36).substring(2, 6);
    window.name = 'famouskai_win_' + windowInstanceId;
    const activeInstances = new Map();
    const winTrackerChannel = new BroadcastChannel('famouskai_window_tracker');
    let lastWindowsSignature = '';
    const PRUNE_TIMEOUT_MS = 75000;

    function getWindowsSignature() {
        let sig = 'self:' + windowInstanceId + ':' + (currentFileName || '[New]') + ';';
        const sortedKeys = Array.from(activeInstances.keys()).sort();
        for (const key of sortedKeys) {
            if (key === windowInstanceId) continue;
            const data = activeInstances.get(key);
            sig += key + ':' + (data ? data.title : '') + ';';
        }
        return sig;
    }

    function sendWindowHeartbeat() {
        const titleName = currentFileName || "[New]";
        winTrackerChannel.postMessage({
            type: 'HEARTBEAT',
            id: windowInstanceId,
            title: titleName + " - Famouskai",
            timestamp: Date.now()
        });
    }

    function renderActiveWindowsList() {
        const listContainer = document.getElementById('active-windows-list');
        if (!listContainer) return;

        const now = Date.now();
        // Prune inactive windows (> 75s stale)
        for (const [id, data] of activeInstances.entries()) {
            if (now - data.timestamp > PRUNE_TIMEOUT_MS) {
                activeInstances.delete(id);
            }
        }

        const currentSig = getWindowsSignature();
        if (currentSig === lastWindowsSignature && listContainer.children.length > 0) {
            return;
        }
        lastWindowsSignature = currentSig;

        if (activeInstances.size === 0) {
            listContainer.innerHTML = `<div class="workspace-empty-msg">1 active instance (this window)</div>`;
            return;
        }

        listContainer.innerHTML = '';
        // Add current window item first
        const currentDiv = document.createElement('div');
        currentDiv.className = 'workspace-file-item';
        currentDiv.style.paddingLeft = '8px';
        currentDiv.title = "Current active window";
        currentDiv.innerHTML = `<span class="file-icon-badge icon-js">●</span> <strong>This Window</strong> (${currentFileName || '[New]'})`;
        currentDiv.onclick = () => {
            window.focus();
            if (window.editor && typeof window.editor.focus === 'function') {
                window.editor.focus();
            }
        };
        listContainer.appendChild(currentDiv);

        activeInstances.forEach((data, id) => {
            if (id === windowInstanceId) return;
            const div = document.createElement('div');
            div.className = 'workspace-file-item';
            div.style.paddingLeft = '8px';
            div.title = "Click to focus this window";
            div.innerHTML = `<span class="file-icon-badge icon-html">○</span> ${data.title}`;
            div.onclick = () => {
                let raised = false;
                try {
                    const targetWinName = 'famouskai_win_' + id;
                    const ref = window.open('', targetWinName);
                    if (ref) {
                        let isBlank = false;
                        try {
                            if (!ref.location || ref.location.href === 'about:blank' || ref.location.pathname === '/about:blank') {
                                isBlank = true;
                            }
                        } catch (e) {
                            // Cross-origin or restricted
                        }
                        if (isBlank) {
                            ref.close();
                        } else {
                            ref.focus();
                            raised = true;
                        }
                    }
                } catch (err) {
                    // Ignore open/focus failure
                }

                winTrackerChannel.postMessage({
                    type: 'FOCUS_REQUEST',
                    targetId: id
                });

                if (!raised && window.showToast) {
                    window.showToast("Switch to this window with Alt+Tab", "info");
                }
            };
            listContainer.appendChild(div);
        });
    }

    winTrackerChannel.onmessage = (event) => {
        const msg = event.data;
        if (!msg || typeof msg !== 'object') return;

        if (msg.type === 'HEARTBEAT' && msg.id) {
            activeInstances.set(msg.id, {
                title: msg.title,
                timestamp: Date.now()
            });
            renderActiveWindowsList();
        } else if (msg.type === 'BYE' && msg.id) {
            activeInstances.delete(msg.id);
            renderActiveWindowsList();
        } else if (msg.type === 'FOCUS_REQUEST' && msg.targetId === windowInstanceId) {
            window.focus();
            if (window.editor && typeof window.editor.focus === 'function') {
                window.editor.focus();
            }
        }
    };

    // Send departure notification when window is closed or navigated away
    window.addEventListener('pagehide', () => {
        try {
            winTrackerChannel.postMessage({
                type: 'BYE',
                id: windowInstanceId
            });
        } catch (e) {
            // Channel may already be closed
        }
    });

    // Send heartbeat immediately when returning to visible state
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            sendWindowHeartbeat();
            renderActiveWindowsList();
        }
    });

    // updateUI() runs outside this closure: give it the heartbeat.
    window.sendWindowHeartbeat = sendWindowHeartbeat;

    // Testing hook (minimal test inspection without altering public behavior)
    window._testWindowTracker = {
        windowInstanceId,
        activeInstances,
        winTrackerChannel,
        PRUNE_TIMEOUT_MS,
        sendWindowHeartbeat,
        renderActiveWindowsList,
        getWindowsSignature
    };

    // Start periodic heartbeat and prune check
    setInterval(() => {
        sendWindowHeartbeat();
        renderActiveWindowsList();
    }, 2000);
    sendWindowHeartbeat();

    if (window.FamousPluginCore && window.FamousPluginCore.Sidebar) {
        window.FamousPluginCore.Sidebar.init();
    }
    if (window.FamousPluginCore && window.FamousPluginCore.Outline) {
        window.FamousPluginCore.Outline.init();
    }
    if (window.FamousPluginCore && window.FamousPluginCore.SnippetManager) {
        window.FamousPluginCore.SnippetManager.init();
    }

    // Secure bindings without HTML onclick attributes
    document.getElementById("btn-refresh-workspace").addEventListener("click", refreshWorkspaceList);

    const btnRecentFilterWks = document.getElementById("btn-recent-filter-workspace");
    if (btnRecentFilterWks) {
        btnRecentFilterWks.addEventListener("click", () => {
            try {
                const current = localStorage.getItem('famouskai_recent_filter_workspace');
                const next = current === '1' ? '0' : '1';
                localStorage.setItem('famouskai_recent_filter_workspace', next);
            } catch (e) {
                console.warn("Failed to update famouskai_recent_filter_workspace preference:", e);
            }
            renderRecentFilesList();
        });
    }

    document.getElementById("btn-unfold-all").addEventListener("click", () => {
        if(editor) editor.session.unfold();
    });

    document.querySelectorAll("[data-fold-level]").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const level = parseInt(e.target.dataset.foldLevel);
            if (window.FamousPluginCore && window.FamousPluginCore.Outline) {
                window.FamousPluginCore.Outline.foldToLevel(level, editor);
            }
        });
    });
});

window.addEventListener('workspace-updated', async () => {
    // Reset extension filters to default state on workspace change
    if (typeof activeExtFilter !== 'undefined') {
        activeExtFilter = null;
        document.querySelectorAll('#workspace-ext-filters .fold-btn').forEach(btn => {
            btn.classList.remove('active-filter');
        });
    }
    // Reset text search filter to present all files
    const searchInput = document.getElementById("workspace-search");
    const searchClear = document.getElementById("workspace-search-clear");
    if (searchInput && searchClear) {
        searchInput.value = "";
        searchClear.style.display = "none";
    }
    await renderWorkspaceSelect();
    refreshWorkspaceList();
    renderRecentFilesList();
});
