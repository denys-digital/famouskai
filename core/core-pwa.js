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
 * Famouskai Core - Browser Support Banner, PWA & Close Guard
 *
 * What it holds:
 *   - Browser support banner (File System Access API feature detection)
 *   - Service Worker registration & PWA launchQueue handling
 *   - Version reading from sw.js for Settings panel display
 *   - Security against accidental closure/reload (beforeunload listener)
 *
 * Globals used:
 *   - isModified
 *   - fileHandle
 *   - currentFileName
 *   - lastKnownModifiedTime
 *   - isInitialLoad
 *   - editor
 *   - applyNativeColoration
 *   - emitFileOpen
 *   - updateUI
 *   - addRecentFile
 *   - window.showToast
 *   - DOM element #app-version
 *   - DOM element #mobkai-status-version
 *
 * Globals defined:
 *   - None
 */

// ﹥ BROWSER SUPPORT BANNER (FILE SYSTEM ACCESS API FEATURE DETECTION)
(function initBrowserSupportBanner() {
    if ('showOpenFilePicker' in window) return;
    // Mobkai: no banner on a phone (docs-lab/MOBKAI-SPEC.md 14.2, Q4)
    if (typeof window.isMobkai === 'function' && window.isMobkai()) return;

    try {
        if (sessionStorage.getItem('famouskai_browser_banner_dismissed') === '1') {
            return;
        }
    } catch (err) {
        console.warn("SessionStorage access failed:", err);
    }

    const banner = document.createElement('div');
    banner.id = 'browser-support-banner';
    banner.setAttribute('role', 'status');

    const textSpan = document.createElement('span');
    textSpan.textContent = "Famouskai needs the File System Access API to open and save files in place on your disk. It is available in desktop Chromium browsers such as Chrome and Edge. In this browser, Open loads a file you pick and Save downloads a copy instead of writing in place.";
    banner.appendChild(textSpan);

    const closeBtn = document.createElement('button');
    closeBtn.setAttribute('aria-label', 'Close');
    closeBtn.textContent = "×";
    closeBtn.addEventListener('click', () => {
        banner.remove();
        try {
            sessionStorage.setItem('famouskai_browser_banner_dismissed', '1');
        } catch (err) {
            console.warn("SessionStorage setItem failed:", err);
        }
    });
    banner.appendChild(closeBtn);

    if (document.body.firstChild) {
        document.body.insertBefore(banner, document.body.firstChild);
    } else {
        document.body.appendChild(banner);
    }
})();

// ﹥ PWA AND FILE HANDLING API
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('Service Worker registered!'))
            .catch(err => console.log('Service Worker Error:', err));
    });
}

if ('launchQueue' in window) {
    window.launchQueue.setConsumer(async (launchParams) => {
        if (launchParams.files && launchParams.files.length > 0) {
            if (isModified && !confirm("Unsaved changes will be lost. Open the new file?")) return;

            try {
                const handle = launchParams.files[0];
                fileHandle = handle;
                currentFileName = handle.name;

                const file = await fileHandle.getFile();
                const text = await file.text();

                lastKnownModifiedTime = file.lastModified;

                isInitialLoad = true;
                isModified = false;
                editor.setValue(text, -1);

                applyNativeColoration(currentFileName);
                emitFileOpen();
                updateUI();
                addRecentFile(handle);

                setTimeout(() => { editor.focus();
                    isInitialLoad = false; }, 50);
            } catch (err) {
                alert("System opening error: " + err.message);
            }
        }
    });
}

// ﹥ VERSION READING FROM SERVICE WORKER
fetch('sw.js')
    .then(response => response.text())
    .then(text => {
        const match = text.match(/CACHE_NAME\s*=\s*['"]([^'"]+)['"]/);
        const versionBtn = document.getElementById('app-version');
        const mobkaiVersion = document.getElementById('mobkai-status-version');
        if (match) {
            const versionStr = match[1];
            if (versionBtn) {
                versionBtn.textContent = versionStr;
                versionBtn.disabled = false;
                versionBtn.addEventListener('click', async () => {
                    try {
                        await navigator.clipboard.writeText(versionStr);
                        if (window.showToast) window.showToast("Version " + versionStr + " copied!", "success");
                    } catch (err) {
                        console.error("Failed to copy version:", err);
                    }
                });
            }
            if (mobkaiVersion) {
                mobkaiVersion.textContent = versionStr;
            }
        } else {
            if (versionBtn) {
                versionBtn.textContent = 'Unknown version';
                versionBtn.disabled = true;
            }
            if (mobkaiVersion) {
                mobkaiVersion.textContent = 'Unknown version';
            }
        }
    })
    .catch(() => {
        const versionBtn = document.getElementById('app-version');
        const mobkaiVersion = document.getElementById('mobkai-status-version');
        if (versionBtn) {
            versionBtn.textContent = 'Local Mode';
            versionBtn.disabled = true;
        }
        if (mobkaiVersion) {
            mobkaiVersion.textContent = 'Local Mode';
        }
    });

// ﹥ SECURITY AGAINST ACCIDENTAL CLOSURE / RELOAD
window.addEventListener('beforeunload', (e) => {
    if (isModified) {
        // Cancel default action
        e.preventDefault();
        // Required by Chrome/ChromeOS to display native warning popup
        e.returnValue = '';
    }
});
