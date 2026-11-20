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

// ﹥ • SECTION FOLDING (docs-lab/FAMOUS-MARK-MATRIX.md section 3.2, private issue 512)
// In code and plain text, a • line folds its section, like a # heading in Markdown.
// The language's own fold mode is wrapped (session.$setFolding, as YamlFolding does): no Ace
// prototype is patched. A section is FamousMark.sectionRange, the definition the Outline
// and Reorder use. ﹥ and ° never fold. Markdown and files with no marks keep native folding.
window.FamousPluginCore = window.FamousPluginCore || {};
window.FamousPluginCore.SectionFold = {
    /**
     * The • section that starts on `row`, by the Outline's file-type rule, or null.
     * @returns {{level: number}|null}
     */
    sectionAt: function(session, row) {
        const Outline = window.FamousPluginCore.Outline;
        if (!Outline || typeof Outline.markOnLine !== 'function') return null;
        const profile = Outline.fileProfile(Outline.currentFilename(), session.$modeId);
        if (profile !== 'commented' && profile !== 'plain') return null;
        const useTokens = profile === 'commented' && Outline.fileProfile('', session.$modeId) === 'commented';
        const mark = Outline.markOnLine(session.getLine(row), profile, useTokens ? session.getTokens(row) : null);
        return (mark && mark.kind === 'section') ? { level: mark.level } : null;
    },

    /**
     * Last row of the • section that starts on `row` (FamousMark.sectionRange).
     * @returns {number}
     */
    sectionEnd: function(session, row, level) {
        const total = session.getLength();
        const items = [{ line: row, level: level }];
        for (let r = row + 1; r < total; r++) {
            const next = this.sectionAt(session, r);
            if (next) {
                items.push({ line: r, level: next.level });
                if (next.level <= level) break;
            }
        }
        return window.FamousPluginCore.FamousMark.sectionRange(items, 0, total).end;
    },

    /**
     * A fold mode that answers for • lines and hands every other line to `base`
     * (the language's fold mode, or null in text mode). Where the language already folds
     * a • line with a real range, its fold wins.
     */
    wrap: function(base) {
        const self = this;
        const nativeRange = (session, style, row) =>
            (base && base.getFoldWidget(session, style, row) === 'start') ? base.getFoldWidgetRange(session, style, row) : null;
        return {
            $famousSectionFold: true,
            $base: base,
            foldingStartMarker: base ? base.foldingStartMarker : null,
            getFoldWidget: function(session, style, row) {
                const native = base ? base.getFoldWidget(session, style, row) : '';
                const section = self.sectionAt(session, row);
                if (!section) return native;
                if (native === 'start' && nativeRange(session, style, row)) return native;
                return self.sectionEnd(session, row, section.level) > row ? 'start' : native;
            },
            getFoldWidgetRange: function(session, style, row) {
                const section = self.sectionAt(session, row);
                const native = base ? nativeRange(session, style, row) : null;
                if (!section || native) {
                    return base ? base.getFoldWidgetRange(session, style, row) : null;
                }
                const end = self.sectionEnd(session, row, section.level);
                if (end <= row) return null;
                const Range = ace.require('ace/range').Range;
                return new Range(row, session.getLine(row).length, end, session.getLine(end).length);
            }
        };
    },

    /** Wraps the session's current fold mode once (no double wrap). */
    apply: function(session) {
        if (!session || typeof session.$setFolding !== 'function') return;
        const current = session.$foldMode;
        if (current && current.$famousSectionFold) return;
        session.$setFolding(this.wrap(current || null));
    },

    /**
     * Re-wraps after every mode change. Deferred one tick so a fold mode set in the
     * setMode callback (YamlFolding) is the one wrapped.
     */
    install: function(editor) {
        if (!editor) return;
        this.apply(editor.session);
        editor.on('changeMode', () => setTimeout(() => this.apply(editor.session), 0));
    }
};

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
    window.FamousPluginCore.SectionFold.install(editor);

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

    // Famous Mark folding was removed in 0.2.2 (Denys's decision, 2026-11-13):
    // folding is Ace's native folding only. Famous Marks stay Outline bookmarks.

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

    const btnHeadingPromote = document.getElementById("btn-heading-promote");
    if (btnHeadingPromote) {
        btnHeadingPromote.addEventListener("click", () => {
            if (window.FamousPluginCore && window.FamousPluginCore.Outline) {
                window.FamousPluginCore.Outline.shiftHeadings(editor, -1);
            }
        });
    }

    const btnHeadingDemote = document.getElementById("btn-heading-demote");
    if (btnHeadingDemote) {
        btnHeadingDemote.addEventListener("click", () => {
            if (window.FamousPluginCore && window.FamousPluginCore.Outline) {
                window.FamousPluginCore.Outline.shiftHeadings(editor, 1);
            }
        });
    }
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
