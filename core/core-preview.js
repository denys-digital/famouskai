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
 * Famouskai Core - Live Preview & Toolbar Controls
 *
 * What it holds:
 *   - Markdown and Patch/Diff live preview panel toggle and content rendering
 *   - Full preview mode toggle
 *   - Print PDF action binding
 *   - Standalone HTML export action binding
 *   - Dark/light preview theme toggle and state handling
 *   - New window / new tab toolbar button action
 *
 * Globals used:
 *   - currentFileName
 *   - editor
 *   - isPreviewDark, previewDarkSetting
 *   - updatePreviewThemeUI
 *   - previewTextSize, nextPreviewTextSize, updatePreviewTextSizeUI
 *   - savePreferences
 *   - isPopupWindow
 *   - getPopupAppUrl
 *   - getCleanAppUrl
 *   - marked
 *   - DOMPurify
 *   - Diff2Html
 *   - window.FamousPluginCore
 *   - DOM elements (#preview-pane, #main-area, #btn-preview, #btn-preview-full, #btn-print, #btn-export-html, #btn-preview-theme, #btn-preview-text-size, #preview-render, #sidebar-left, #toggle-full-preview-startup, #btn-new-window)
 *
 * Globals defined:
 *   - isPreviewOpen
 *   - isPreviewFull
 *   - previewTimer
 *   - wasSidebarOpen
 *   - wasSidebarTab
 *   - previewMarkdownText
 *   - togglePreview
 *   - toggleFullPreview
 *   - updatePreviewContent
 *   - renderMarkdownWithLines
 *   - scrollPreviewToLine
 *   - btnExportHTML
 *   - btnPreviewTheme
 *   - newWinBtn
 */

// ﹥ LIVE PREVIEW (MARKDOWN & HTML)
let isPreviewOpen = false;
let isPreviewFull = false;
let previewTimer = null;
let wasSidebarOpen = false; // Tracks sidebar state for Full View
let wasSidebarTab = null;
let previewMarkdownText = null; // editor text the Markdown preview shows, null when it shows none

function togglePreview() {
    isPreviewOpen = !isPreviewOpen;
    const pane = document.getElementById("preview-pane");
    const mainArea = document.getElementById("main-area");
    const btn = document.getElementById("btn-preview");
    const btnFull = document.getElementById("btn-preview-full");
    const btnPrint = document.getElementById("btn-print");

    let ext = currentFileName ? currentFileName.split('.').pop().toLowerCase() : '';
    if (!ext && editor) {
        const modeId = editor.session.$modeId || "";
        if (modeId.includes("markdown")) {
            ext = "md";

        } else if (modeId.includes('diff')) {
            ext = 'patch'; // pasted/unsaved diff content
        }
    }

    if (isPreviewOpen) {
        pane.style.display = "flex";
        mainArea.classList.add("preview-active");

        btn.classList.add("btn-active");
        btn.textContent = "Close Preview";
        btnFull.style.display = "inline-block";

        if (ext === 'md') {
            btnPrint.style.display = "inline-block";
            const btnExport = document.getElementById("btn-export-html");
            if (btnExport) btnExport.style.display = "inline-block";
            const btnPreviewTheme = document.getElementById("btn-preview-theme");
            if (btnPreviewTheme) btnPreviewTheme.style.display = "inline-block";
            const btnTextSize = document.getElementById("btn-preview-text-size");
            if (btnTextSize) btnTextSize.style.display = "inline-block";
        }

        updatePreviewContent();

        const isSmallScreen = window.innerWidth <= 900;
        const sidebarModule = window.FamousPluginCore && window.FamousPluginCore.Sidebar;

        if (isSmallScreen) {
            // When width is small (preview becomes full-view by default via CSS),
            // ensure active tab is deactivated even if "Outline open on preview" is checked
            // or if a tab was open previously.
            if (sidebarModule && sidebarModule.isOpen) {
                wasSidebarOpen = true;
                wasSidebarTab = sidebarModule.activeTab;
                sidebarModule.closeSidebar();
            }
        } else {
            // Outline open on preview setting
            const previewOutlinePref = document.getElementById("toggle-preview-outline")?.checked;
            if (previewOutlinePref && sidebarModule) {
                sidebarModule.switchTab('outline', true);
            }

            // Apply default full preview if the setting is checked and not already active
            const isFullPref = document.getElementById("toggle-full-preview-startup")?.checked;
            if (isFullPref && !isPreviewFull) {
                toggleFullPreview();
            }
        }
    } else {
        pane.style.display = "none";
        mainArea.classList.remove("preview-active", "preview-full");
        isPreviewFull = false; // Safe manual state reset

        btn.classList.remove("btn-active");
        btn.textContent = "Preview";
        btnFull.style.display = "none";
        btnFull.classList.remove("btn-active");
        btnPrint.style.display = "none";
        const btnExport = document.getElementById("btn-export-html");
        if (btnExport) btnExport.style.display = "none";
        const btnPreviewTheme = document.getElementById("btn-preview-theme");
        if (btnPreviewTheme) btnPreviewTheme.style.display = "none";
        const btnTextSize = document.getElementById("btn-preview-text-size");
        if (btnTextSize) btnTextSize.style.display = "none";

        // Restore sidebar if it was hidden by Full View
        if (wasSidebarOpen && window.FamousPluginCore && window.FamousPluginCore.Sidebar) {
            if (wasSidebarTab) {
                window.FamousPluginCore.Sidebar.switchTab(wasSidebarTab, true);
            } else {
                window.FamousPluginCore.Sidebar.openSidebar();
            }
        }
        wasSidebarOpen = false;
        wasSidebarTab = null;
    }
    if (editor) editor.resize();
}

function toggleFullPreview() {
    if (!isPreviewOpen) return;
    isPreviewFull = !isPreviewFull;
    const mainArea = document.getElementById("main-area");
    const btnFull = document.getElementById("btn-preview-full");
    const sidebarModule = window.FamousPluginCore && window.FamousPluginCore.Sidebar;
    const previewOutlinePref = document.getElementById("toggle-preview-outline")?.checked;

    if (isPreviewFull) {
        mainArea.classList.add("preview-full");
        btnFull.classList.add("btn-active");

        if (previewOutlinePref) {
            // Setting on: Full View does not close the sidebar
            wasSidebarOpen = false;
            wasSidebarTab = null;
        } else {
            // Setting off: Hide sidebar and remember its state and tab
            wasSidebarOpen = sidebarModule ? sidebarModule.isOpen : (document.getElementById("sidebar-left")?.style.display === "flex");
            wasSidebarTab = sidebarModule ? sidebarModule.activeTab : null;
            if (sidebarModule) {
                sidebarModule.closeSidebar();
            } else {
                const sidebarEl = document.getElementById("sidebar-left");
                if (sidebarEl) sidebarEl.style.display = "none";
            }
        }
    } else {
        mainArea.classList.remove("preview-full");
        btnFull.classList.remove("btn-active");

        // Restore sidebar
        if (wasSidebarOpen) {
            if (sidebarModule) {
                if (wasSidebarTab) {
                    sidebarModule.switchTab(wasSidebarTab, true);
                } else {
                    sidebarModule.openSidebar();
                }
            } else {
                const sidebarEl = document.getElementById("sidebar-left");
                if (sidebarEl) sidebarEl.style.display = "flex";
            }
        }
        wasSidebarOpen = false;
        wasSidebarTab = null;
    }
    if (editor) editor.resize();
    // NEW: re-render only for patch/diff files, so the layout switches
    // (stacked <-> side-by-side) immediately. No-op for Markdown and any
    // other format, since their rendering never depended on isPreviewFull.
    let ext = currentFileName ? currentFileName.split('.').pop().toLowerCase() : '';
    if (!ext && editor) {
        const modeId = editor.session.$modeId || "";
        if (modeId.includes('diff')) ext = 'patch';
    }
    if (ext === 'patch' || ext === 'diff') updatePreviewContent();
}

/**
 * Markdown preview only: a line "• text" (optional leading spaces, one •, one space)
 * becomes "- text", so marked renders it as a list. In Markdown, • is an ordinary
 * bullet. Fenced code blocks are never changed.
 * Returns a new string: the editor text is never changed.
 */
function magicDotToMarkdownList(text) {
    let inFence = false;
    return String(text).split('\n').map(line => {
        const trimmed = line.trim();
        if (trimmed.startsWith('```') || trimmed.startsWith('~~~')) {
            inFence = !inFence;
            return line;
        }
        if (inFence) return line;
        return line.replace(/^( *)• (.*)$/, '$1- $2');
    }).join('\n');
}

/**
 * Markdown preview only: same HTML as marked.parse(text), plus a data-fk-line attribute
 * (0-based editor line) on the first element of each top-level block, so the preview can
 * scroll to a line (scrollPreviewToLine). Raw HTML blocks are left as the user wrote them.
 * magicDotToMarkdownList() keeps the line count, so its output can be passed here.
 */
function renderMarkdownWithLines(text) {
    const src = String(text).replace(/\r\n|\r/g, '\n'); // marked's own line-end normalisation
    const tokens = marked.lexer(src);
    let pos = 0;
    let line = 0;
    let html = '';
    tokens.forEach(token => {
        const raw = token.raw || '';
        const at = raw ? src.indexOf(raw, pos) : -1;
        if (at !== -1) {
            for (let i = pos; i < at; i++) if (src.charCodeAt(i) === 10) line++;
            pos = at;
        }
        // Inline links are resolved by the lexer: a block renders the same alone.
        const single = [token];
        single.links = tokens.links;
        let part = marked.parser(single);
        if (token.type !== 'html') {
            part = part.replace(/^(\s*<[a-zA-Z][a-zA-Z0-9]*)/, '$1 data-fk-line="' + line + '"');
        }
        html += part;
        if (at !== -1) {
            for (let i = pos; i < pos + raw.length; i++) if (src.charCodeAt(i) === 10) line++;
            pos += raw.length;
        }
    });
    return html;
}

/**
 * Scrolls the open Markdown preview to the block that holds an editor line (0-based):
 * the block starts at the top of the preview, or, inside a long block (list, code),
 * the matching share of its height. A line past the last block scrolls to the end.
 * Returns true when the preview scrolled, false when there is no Markdown preview.
 */
function scrollPreviewToLine(line) {
    if (!isPreviewOpen || !editor) return false;
    // A click right after typing: render the text now rather than wait for the debounce.
    if (previewMarkdownText !== editor.getValue()) updatePreviewContent();
    if (previewMarkdownText === null) return false;
    const container = document.getElementById('preview-content');
    const previewEl = document.getElementById('preview-render');
    if (!container || !previewEl || !previewEl.classList.contains('markdown-body')) return false;
    const blocks = previewEl.querySelectorAll('[data-fk-line]');
    if (blocks.length === 0) return false;

    if (line <= 0) {
        container.scrollTop = 0;
        return true;
    }
    let target = null;
    let nextLine = null;
    for (const el of blocks) {
        const start = Number(el.getAttribute('data-fk-line'));
        if (start <= line) target = el;
        else { nextLine = start; break; }
    }
    if (!target) {
        container.scrollTop = 0;
        return true;
    }
    const start = Number(target.getAttribute('data-fk-line'));
    if (nextLine === null) {
        const total = editor.session.getLength();
        if (line >= total - 1 && line > start) {
            container.scrollTop = container.scrollHeight;
            return true;
        }
        nextLine = Math.max(total, start + 1);
    }
    const share = line > start ? (line - start) / (nextLine - start) : 0;
    const top = target.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop;
    const GAP = 8; // keep a little air above the block
    container.scrollTop = Math.max(0, Math.round(top + share * target.offsetHeight - GAP));
    return true;
}

function updatePreviewContent() {
    if (!isPreviewOpen || !editor) return;

    const content = editor.getValue();
    previewMarkdownText = null;
    let ext = currentFileName ? currentFileName.split('.').pop().toLowerCase() : '';

    if (!ext) {
        const modeId = editor.session.$modeId || "";
        if (modeId.includes("markdown")) ext = "md";
    }

    if (ext === 'md') {
        const previewEl = document.getElementById('preview-render');
        previewEl.classList.remove('d2h-body');
        previewEl.classList.add('markdown-body');
        previewEl.style.display = 'block';
        if (typeof DOMPurify !== 'undefined') {
            previewEl.innerHTML = DOMPurify.sanitize(renderMarkdownWithLines(magicDotToMarkdownList(content)));
            previewMarkdownText = content;
        } else {
            previewEl.textContent = content;
            console.warn("DOMPurify is undefined, falling back to textContent for Markdown preview");
        }
        if (window.FamousPluginCore && window.FamousPluginCore.FamousUp) {
            window.FamousPluginCore.FamousUp.process(previewEl);
        }
        if (window.FamousPluginCore && window.FamousPluginCore.PreviewCode) {
            window.FamousPluginCore.PreviewCode.process(previewEl);
        }

    } else if (ext === 'patch' || ext === 'diff') {
        const previewEl = document.getElementById('preview-render');
        previewEl.classList.remove('markdown-body');
        previewEl.classList.add('d2h-body');
        previewEl.style.display = 'block';

        const MAX_PRETTY_DIFF_SIZE = 2 * 1024 * 1024;
        if (content.length > MAX_PRETTY_DIFF_SIZE) {
            previewEl.textContent = content;
            return;
        }

        try {
            if (typeof Diff2Html === 'undefined') throw new Error('diff2html library not loaded');
            const renderer = Diff2Html.html || Diff2Html.getPrettyHtml;
            previewEl.innerHTML = renderer.call(Diff2Html, content, {
                drawFileList: true,
                matching: 'lines',
                outputFormat: isPreviewFull ? 'side-by-side' : 'line-by-line',
                colorScheme: 'dark'
            });
        } catch (e) {
            console.warn('Diff2Html rendering failed, falling back to raw text:', e);
            previewEl.textContent = content;
        }
    }
}

// Single unified click handler
document.getElementById("btn-print").onclick = () => {
    setTimeout(() => window.print(), 100);
};

const btnExportHTML = document.getElementById("btn-export-html");
if (btnExportHTML) {
    btnExportHTML.onclick = () => {
        if (window.FamousPluginCore && window.FamousPluginCore.ExportHTML) {
            window.FamousPluginCore.ExportHTML.exportMarkdownToHTML(editor);
        }
    };
}

document.getElementById("btn-preview").addEventListener("click", togglePreview);
document.getElementById("btn-preview-full").addEventListener("click", toggleFullPreview);
const btnPreviewTheme = document.getElementById("btn-preview-theme");
if (btnPreviewTheme) {
    btnPreviewTheme.addEventListener("click", () => {
        previewDarkSetting = null; // a click is the user's own choice: it is saved
        isPreviewDark = !isPreviewDark;
        updatePreviewThemeUI();
        savePreferences();
    });
}
const btnPreviewTextSize = document.getElementById("btn-preview-text-size");
if (btnPreviewTextSize) {
    btnPreviewTextSize.addEventListener("click", () => {
        previewTextSize = nextPreviewTextSize(previewTextSize);
        updatePreviewTextSizeUI();
        savePreferences();
    });
}

const newWinBtn = document.getElementById("btn-new-window");
if (newWinBtn) {
    newWinBtn.title = isPopupWindow() ? "Open new window" : "Open new tab";
    newWinBtn.addEventListener("click", () => {
        if (isPopupWindow()) {
            // Popup mode context: open a new popup window
            const screenWidth = window.screen.width;
            const dpr = window.devicePixelRatio || 1;
            const physicalWidth = screenWidth * dpr;
            const isWide = screenWidth > 2000 || physicalWidth > 2000;

            const screenLeft = window.screen.availLeft || 0;
            const screenTop = window.screen.availTop || 0;
            const availWidth = window.screen.availWidth;
            const availHeight = window.screen.availHeight;
            const halfWidth = Math.floor(availWidth / 2);

            let targetPos = 'full';
            let targetLeft = screenLeft;
            let targetTop = screenTop;
            let targetWidth = availWidth;
            let targetHeight = availHeight;

            if (isWide) {
                const currentLeft = window.screenX !== undefined ? window.screenX : window.screenLeft;
                // Determine if current initial window is positioned on the left side of the screen
                const isPositionedLeft = (currentLeft - screenLeft) < (halfWidth / 2);

                if (isPositionedLeft) {
                    targetPos = 'right';
                    targetLeft = screenLeft + halfWidth;
                    targetWidth = halfWidth;
                } else {
                    targetPos = 'left';
                    targetLeft = screenLeft;
                    targetWidth = halfWidth;
                }
            }

            const popupUrl = getPopupAppUrl(targetPos);
            const popupFeatures = `popup=yes,left=${targetLeft},top=${targetTop},width=${targetWidth},height=${targetHeight}`;
            window.open(popupUrl, '_blank', popupFeatures);
        } else {
            // Tab mode context: open a new browser tab
            window.open(getCleanAppUrl(), '_blank');
        }
    });
}
