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
 *   - isPreviewDark
 *   - updatePreviewThemeUI
 *   - savePreferences
 *   - isPopupWindow
 *   - getPopupAppUrl
 *   - getCleanAppUrl
 *   - marked
 *   - DOMPurify
 *   - Diff2Html
 *   - window.FamousPluginCore
 *   - DOM elements (#preview-pane, #main-area, #btn-preview, #btn-preview-full, #btn-print, #btn-export-html, #btn-preview-theme, #preview-render, #sidebar-left, #toggle-full-preview-startup, #btn-new-window)
 *
 * Globals defined:
 *   - isPreviewOpen
 *   - isPreviewFull
 *   - previewTimer
 *   - wasSidebarOpen
 *   - wasSidebarTab
 *   - togglePreview
 *   - toggleFullPreview
 *   - updatePreviewContent
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

function updatePreviewContent() {
    if (!isPreviewOpen || !editor) return;

    const content = editor.getValue();
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
            previewEl.innerHTML = DOMPurify.sanitize(marked.parse(content));
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
        isPreviewDark = !isPreviewDark;
        updatePreviewThemeUI();
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
