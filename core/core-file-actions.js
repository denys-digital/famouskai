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
 * Famouskai Core - File Actions & Workspace Search
 *
 * What it holds:
 *   - Workspace title click handler
 *   - Workspace file filter (wsSearchInput, wsSearchClear listeners, initExtFilters)
 *   - Rename logic (renameCurrentFile)
 *   - Move & Copy logic (copyFileName, moveFile, openHtmlInNewTab)
 *
 * Globals used:
 *   - editor
 *   - currentFileName
 *   - fileHandle
 *   - isModified
 *   - activeExtFilter
 *   - WORKSPACE_FILE_GROUPS
 *   - applyWorkspaceFilter
 *   - applyNativeColoration
 *   - updateUI
 *   - refreshWorkspaceList
 *   - window.currentWorkspaceHandle
 *   - window.FamousPluginCore
 *   - window.showToast
 *   - DOM elements (#workspace-name, #workspace-search, #workspace-search-clear, #workspace-ext-filters, #rename-dialog, #rename-input, #rename-cancel, #rename-form)
 *
 * Globals defined:
 *   - wsSearchInput
 *   - wsSearchClear
 *   - initExtFilters
 *   - renameCurrentFile
 *   - copyFileName
 *   - moveFile
 *   - openHtmlInNewTab
 */

// ﹥ INTERACTIVITY: WKS TITLE
document.getElementById("workspace-name").addEventListener("click", () => {
    if (window.FamousPluginCore && window.FamousPluginCore.Manager) {
        // Strict search for tool by exact name
        const tool = window.FamousPluginCore.Manager.registry.find(t => t.name === "Set Default Workspace");
        if (tool) {
            tool.action(editor);
        } else {
            console.warn("Tool 'Set Default Workspace' not registered.");
        }
    }
});

// ﹥ INTERACTIVITY: WKS FILE FILTER
wsSearchInput = document.getElementById("workspace-search");
wsSearchClear = document.getElementById("workspace-search-clear");

if (wsSearchInput && wsSearchClear) {
    wsSearchInput.addEventListener("input", applyWorkspaceFilter);

    wsSearchClear.addEventListener("click", () => {
        wsSearchInput.value = "";
        applyWorkspaceFilter();
        wsSearchInput.focus();
    });
}

/**
 * Builds the compact extension filter badges based on WORKSPACE_FILE_GROUPS.
 * Reuses the semantic CSS classes for UI color consistency.
 */
function initExtFilters() {
    const container = document.getElementById('workspace-ext-filters');
    if (!container) return;

    WORKSPACE_FILE_GROUPS.forEach(group => {
        const btn = document.createElement('button');

        // Combine base button style with the group's specific color class
        btn.className = `fold-btn ${group.className}`;
        btn.textContent = group.filter;

        const groupExts = Object.keys(group.types);
        btn.title = "Filter: " + groupExts.join(', ').toUpperCase();

        btn.onclick = () => {
            if (activeExtFilter === groupExts) {
                // Toggle off
                activeExtFilter = null;
                btn.classList.remove('active-filter');
            } else {
                // Toggle on: reset others and activate current
                document.querySelectorAll('#workspace-ext-filters .fold-btn').forEach(b => b.classList.remove('active-filter'));
                activeExtFilter = groupExts;
                btn.classList.add('active-filter');
            }
            if (typeof applyWorkspaceFilter === 'function') applyWorkspaceFilter();
        };

        container.appendChild(btn);
    });
}

// Initialize filters on load
initExtFilters();

// ﹥ RENAME LOGIC
/**
 * Mobkai: asks for a file name in the rename dialog. The Android Save picker always
 * keeps the extension of the suggested name, so the name is chosen here first.
 * @param {string} defaultName - Name shown in the field
 * @param {string} title - Dialog title
 * @param {string} okLabel - Submit button label
 * @returns {Promise<string|null>} The entered name, or null if cancelled
 */
function askFileName(defaultName, title, okLabel) {
    const dialog = document.getElementById('rename-dialog');
    const input = document.getElementById('rename-input');
    const cancelBtn = document.getElementById('rename-cancel');
    const form = document.getElementById('rename-form');
    const titleEl = form.querySelector('.sidebar-title');
    const okBtn = form.querySelector('button[type="submit"]');
    const oldTitle = titleEl.textContent;
    const oldOk = okBtn.textContent;
    titleEl.textContent = title;
    okBtn.textContent = okLabel;
    input.value = defaultName;

    return new Promise((resolve) => {
        const done = (value) => {
            form.removeEventListener('submit', onSubmit);
            cancelBtn.removeEventListener('click', onCancel);
            titleEl.textContent = oldTitle;
            okBtn.textContent = oldOk;
            dialog.close();
            resolve(value);
        };
        const onCancel = () => done(null);
        const onSubmit = (e) => {
            e.preventDefault();
            done(input.value.trim() || null);
        };
        form.addEventListener('submit', onSubmit);
        cancelBtn.addEventListener('click', onCancel);
        dialog.showModal();
        const dot = input.value.lastIndexOf('.');
        input.focus();
        input.setSelectionRange(0, dot > 0 ? dot : input.value.length);
    });
}

async function renameCurrentFile() {
    if (!fileHandle) return;

    // Mobkai: a phone browser cannot rename a file (no move() on Android),
    // so tapping the name saves the text under a new name (the old file stays).
    if (typeof window.isMobkai === 'function' && window.isMobkai()) {
        return saveAsFile();
    }

    // Protection against I/O conflicts
    if (isModified) {
        if (window.showToast) window.showToast("Save changes before renaming.", "warn");
        return;
    }

    const dialog = document.getElementById('rename-dialog');
    const input = document.getElementById('rename-input');
    const cancelBtn = document.getElementById('rename-cancel');
    const form = document.getElementById('rename-form');

    // Initialize input with current name
    input.value = currentFileName;

    // Create a Promise to handle the async dialog flow
    return new Promise((resolve) => {
        const cleanUp = () => {
            form.removeEventListener('submit', onSubmit);
            cancelBtn.removeEventListener('click', onCancel);
            dialog.close();
        };

        const onCancel = () => {
            cleanUp();
            resolve(null);
        };

        const onSubmit = async (e) => {
            e.preventDefault();
            const enteredName = input.value.trim();

            if (!enteredName || enteredName === currentFileName) {
                cleanUp();
                resolve(null);
                return;
            }

            // Extract original extension if present
            const lastDot = currentFileName.lastIndexOf('.');
            const origExt = lastDot > 0 ? currentFileName.substring(lastDot + 1) : "";

            let finalName = enteredName;

            if (enteredName.endsWith('.')) {
                if (origExt !== "") {
                    finalName = enteredName.slice(0, -1) + '.' + origExt;
                } else {
                    if (!confirm("Warning: You are creating a file without an extension. Do you want to proceed?")) {
                        return;
                    }
                }
            } else if (enteredName.lastIndexOf('.') === 0) {
                if (!confirm("Warning: You are creating a hidden file or file without a standard name/extension. Do you want to proceed?")) {
                    return;
                }
            } else if (enteredName.lastIndexOf('.') === -1) {
                if (origExt !== "") {
                    finalName = enteredName + '.' + origExt;
                } else {
                    if (!confirm("Warning: You are creating a file without an extension. Do you want to proceed?")) {
                        return;
                    }
                }
            }

            if (finalName === currentFileName) {
                cleanUp();
                resolve(null);
                return;
            }

            cleanUp();

            try {
                // CRITICAL: Ensure native history-preserving move API exists
                if (typeof fileHandle.move !== 'function') {
                    throw new Error("Browser lacks native move API support.");
                }

                // The 'submit' button click provides the FRESH User Activation context required by the OS!
                await fileHandle.move(finalName);

                // Update internal state
                currentFileName = finalName;
                applyNativeColoration(currentFileName);
                updateUI();

                if (window.currentWorkspaceHandle) refreshWorkspaceList();
                if (window.showToast) window.showToast("Renamed to " + finalName, "success");

                resolve(true);
            } catch (err) {
                // If it fails here, ChromeOS DriveFS physically rejected the specific rename operation
                alert("Rename failed: " + err.message);
                resolve(false);
            }
        };

        form.addEventListener('submit', onSubmit);
        cancelBtn.addEventListener('click', onCancel);

        // Show native modal
        dialog.showModal();

        // UX: Pre-select the file name without its extension
        const dotIndex = currentFileName.lastIndexOf('.');
        if (dotIndex > 0) {
            input.setSelectionRange(0, dotIndex);
        } else {
            input.select();
        }
    });
}

// ﹥ MOVE & COPY LOGIC
async function copyFileName(e) {
    e.stopPropagation(); // Prevent triggering other listeners
    if (!currentFileName || currentFileName === "[New]") return;
    try {
        await navigator.clipboard.writeText(currentFileName);
        if (window.showToast) window.showToast("Name copied", "success");
    } catch (err) {
        console.error("Clipboard access error:", err);
    }
}

async function moveFile() {
    if (!editor || !fileHandle) return;

    // Failsafe in case UI state is bypassed
    if (isModified) {
        if (window.showToast) window.showToast("Save changes before moving.", "warn");
        return;
    }

    try {
        // FIX: Request write permission on the source file FIRST,
        // while we still have the user activation from the button click.
        if (await fileHandle.queryPermission({ mode: 'readwrite' }) !== 'granted') {
            const perm = await fileHandle.requestPermission({ mode: 'readwrite' });
            if (perm !== 'granted') return; // User aborted the permission prompt
        }

        // Ask user for the destination directory with readwrite mode
        const dirHandle = await window.showDirectoryPicker({
            id: "famouskai-move-dir",
            mode: "readwrite"
        });

        // Ensure native move API is available
        if (typeof fileHandle.move !== 'function') {
            throw new Error("Browser lacks native move API support.");
        }

        // Move the file to the new directory (keeps currentFileName)
        await fileHandle.move(dirHandle);

        // Refresh Workspace UI if open
        if (window.currentWorkspaceHandle) refreshWorkspaceList();
        if (window.showToast) window.showToast("Moved to " + dirHandle.name, "success");

    } catch (err) {
        if (err.name !== 'AbortError') alert("Move failed: " + err.message);
    }
}

// Open HTML content in a new browser tab by injecting editor value
async function openHtmlInNewTab(e) {
    e.stopPropagation(); // Prevent triggering other listeners
    if (!editor) return;

    try {
        // Retrieve current content directly from the editor (includes unsaved changes)
        const content = editor.getValue();
        const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
        const blobUrl = URL.createObjectURL(blob);

        // Open the blob URL in a new tab
        const newWindow = window.open(blobUrl, '_blank');

        if (newWindow) {
            let revoked = false;
            const revoke = () => {
                if (!revoked) {
                    revoked = true;
                    URL.revokeObjectURL(blobUrl);
                }
            };

            try {
                newWindow.addEventListener('load', revoke, { once: true });
            } catch (_) {}
            setTimeout(revoke, 5000);

            if (window.showToast) window.showToast("Opened in new tab", "success");
        } else {
            URL.revokeObjectURL(blobUrl);
            // Fallback if popup blocker intercepts the action
            alert("Erreur : Le navigateur a bloqué l'ouverture du nouvel onglet.");
        }
    } catch (err) {
        console.error("Failed to open HTML in new tab:", err);
    }
}
