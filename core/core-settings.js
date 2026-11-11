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
 * Famouskai Core - Side Menu & Settings
 *
 * What it holds:
 *   - Side menu buttons: open/close the left sidebar (btn-menu), hide it (btn-hide-sidebar)
 *   - Preferences: defaults, load from and save to localStorage (famouskai_prefs)
 *   - Preview theme button state (updatePreviewThemeUI, dark/light icons)
 *   - Tool settings rendering at startup (FamousPluginCore.Manager.renderSettings)
 *   - Universal change listener for the settings checkboxes
 *
 * Globals used:
 *   - editor, isAutoSaveEnabled, isModified, fileHandle
 *   - saveFile, window.FamousPluginCore (Outline, Manager)
 *
 * Globals defined:
 *   - sidebar
 *   - defaultPrefs
 *   - isPreviewDark
 *   - SVG_MOON, SVG_SUN
 *   - updatePreviewThemeUI
 *   - loadPreferences
 *   - savePreferences
 */

// ﹥ SIDE MENU MANAGEMENT
const sidebar = document.getElementById("sidebar-left");

document.getElementById("btn-menu").addEventListener("click", () => {
    sidebar.style.display = (sidebar.style.display === "none" || sidebar.style.display === "") ? "flex" : "none";
    if (sidebar.style.display === "flex") {
        if (window.FamousPluginCore && window.FamousPluginCore.Outline) {
            window.FamousPluginCore.Outline.update(editor);
        }
    }
    editor.resize(); // Prevents text from being cut when window shrinks
});

document.getElementById("btn-hide-sidebar").addEventListener("click", () => {
    sidebar.style.display = "none";
    editor.resize();
});

// ﹥ SETTINGS & PREFERENCES MANAGEMENT
const defaultPrefs = { wrap: true, autosave: false, links: false, sidebarStartup: false, settingsStartup: true, fullPreviewStartup: false, previewOutline: false, previewDark: false };
let isPreviewDark = false;

const SVG_MOON = '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>';
const SVG_SUN = '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>';

function updatePreviewThemeUI() {
    const previewRender = document.getElementById("preview-render");
    const btnTheme = document.getElementById("btn-preview-theme");
    if (previewRender) {
        if (isPreviewDark) {
            previewRender.classList.add("preview-dark");
        } else {
            previewRender.classList.remove("preview-dark");
        }
    }
    if (btnTheme) {
        if (isPreviewDark) {
            btnTheme.innerHTML = SVG_SUN;
            btnTheme.title = "Light preview";
            btnTheme.setAttribute("aria-label", "Switch preview to light theme");
            btnTheme.setAttribute("aria-pressed", "true");
        } else {
            btnTheme.innerHTML = SVG_MOON;
            btnTheme.title = "Dark preview";
            btnTheme.setAttribute("aria-label", "Switch preview to dark theme");
            btnTheme.removeAttribute("aria-pressed");
        }
    }
}

function loadPreferences() {
    let prefs = defaultPrefs;
    try {
        const stored = localStorage.getItem('famouskai_prefs');
        if (stored) {
            prefs = Object.assign({}, defaultPrefs, JSON.parse(stored));
        }
    } catch (e) { console.warn("Failed to parse famouskai_prefs preference from localStorage:", e); }
    
    // Restore UI state safely
    const toggleWrap = document.getElementById("toggle-wrap");
    if (toggleWrap) toggleWrap.checked = prefs.wrap;

    const toggleLinks = document.getElementById("toggle-links");
    if (toggleLinks) toggleLinks.checked = prefs.links;

    const toggleSidebarStartup = document.getElementById("toggle-sidebar-startup");
    if (toggleSidebarStartup) toggleSidebarStartup.checked = prefs.sidebarStartup;

    const toggleFullPreviewStartup = document.getElementById("toggle-full-preview-startup");
    if (toggleFullPreviewStartup) toggleFullPreviewStartup.checked = prefs.fullPreviewStartup;

    const togglePreviewOutline = document.getElementById("toggle-preview-outline");
    if (togglePreviewOutline) togglePreviewOutline.checked = !!prefs.previewOutline;

    // Render dynamic tool settings into settings panel
    if (window.FamousPluginCore && window.FamousPluginCore.Manager) {
        const settingsContainer = document.getElementById("settings-container");
        if (settingsContainer) {
            window.FamousPluginCore.Manager.renderSettings(settingsContainer);
        }
    }
    
    // Autosave internal state restoration (visual state is handled by updateUI)
    isAutoSaveEnabled = prefs.autosave;
    isPreviewDark = !!prefs.previewDark;
    // Mobkai: dark preview by default on a phone (Denys, PR #333; the theme button is hidden there)
    if (typeof window.isMobkai === 'function' && window.isMobkai()) isPreviewDark = true;
    updatePreviewThemeUI();
    
    // Apply editor settings
    if (editor) editor.session.setUseWrapMode(prefs.wrap);
    
    // Apply Sidebar state safely
    if (prefs.sidebarStartup) {
        const sidebar = document.getElementById("sidebar-left");
        if (sidebar) sidebar.style.display = "flex";
        setTimeout(() => { if (editor) editor.resize(); }, 50);
    }
}

function savePreferences() {
    const prefs = {
        wrap: document.getElementById("toggle-wrap") ? document.getElementById("toggle-wrap").checked : true,
        autosave: isAutoSaveEnabled,
        links: document.getElementById("toggle-links") ? document.getElementById("toggle-links").checked : false,
        sidebarStartup: document.getElementById("toggle-sidebar-startup") ? document.getElementById("toggle-sidebar-startup").checked : false,
        fullPreviewStartup: document.getElementById("toggle-full-preview-startup") ? document.getElementById("toggle-full-preview-startup").checked : false,
        previewOutline: document.getElementById("toggle-preview-outline") ? document.getElementById("toggle-preview-outline").checked : false,
        previewDark: isPreviewDark
    };
    localStorage.setItem('famouskai_prefs', JSON.stringify(prefs));
}

// Apply preferences when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
    loadPreferences();
});

// Universal listener for all settings checkboxes
document.querySelectorAll('#settings-container .sidebar-checkbox').forEach(cb => {
    cb.addEventListener('change', (e) => {
        const setting = e.target.dataset.setting;
        
        // Specific logic trigger per setting
        if (setting === 'wrap' && editor) {
            editor.session.setUseWrapMode(e.target.checked);
        } else if (setting === 'autosave') {
            isAutoSaveEnabled = e.target.checked;
            const isMobkaiMode = typeof window.isMobkai === 'function' && window.isMobkai();
            if (isAutoSaveEnabled && isModified && fileHandle && !isMobkaiMode) saveFile();
        }
        
        // Save globally on any modification
        savePreferences();
    });
});
