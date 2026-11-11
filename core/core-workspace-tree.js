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
 * Famouskai Core - Workspace List & Directory Tree
 *
 * What it holds:
 *   - Workspace list refresh (refreshWorkspaceList)
 *   - File icon badge generator (getFileIcon)
 *   - Directory tree rendering with lazy loading (renderDirectoryTree)
 *   - Workspace render token tracking (currentWorkspaceRenderToken)
 *
 * Globals used:
 *   - window.currentWorkspaceHandle, FILE_ICON_MAP, WORKSPACE_IGNORED_DIRS, WORKSPACE_ALLOWED_EXT
 *   - idbKeyval, applyWorkspaceFilter, editor, isModified, fileHandle, currentFileName
 *   - isInitialLoad, lastKnownModifiedTime, applyNativeColoration, emitFileOpen, updateUI, addRecentFile
 *
 * Globals defined:
 *   - currentWorkspaceRenderToken
 *   - refreshWorkspaceList
 *   - getFileIcon
 *   - renderDirectoryTree
 */

let currentWorkspaceRenderToken = 0;
async function refreshWorkspaceList() {
    const listContainer = document.getElementById("workspace-file-list");
    const title = document.getElementById("workspace-name");

    if (!window.currentWorkspaceHandle) {
        title.textContent = "Not set";
        listContainer.innerHTML = `<div class="workspace-empty-msg">No folder selected</div>`;
        return;
    }

    const renderToken = ++currentWorkspaceRenderToken;
    try {
        title.textContent = window.currentWorkspaceHandle.name;
        listContainer.innerHTML = "";

        // Launch recursive tree generation
        await renderDirectoryTree(window.currentWorkspaceHandle, listContainer, renderToken);

        if (renderToken !== currentWorkspaceRenderToken) return;

        // Re-apply filters safely after DOM regeneration (avoids startup TDZ crash)
        if (typeof applyWorkspaceFilter === 'function' && document.getElementById("workspace-search")) {
            applyWorkspaceFilter();
        }

    } catch (error) {
        console.error("Workspace read error:", error);
        if (renderToken === currentWorkspaceRenderToken) {
            const failedName = window.currentWorkspaceHandle ? window.currentWorkspaceHandle.name : '';
            listContainer.innerHTML = `<div class="workspace-empty-msg is-error">Access error. Please reset the folder.</div>`;
            if (failedName) {
                const errDiv = listContainer.querySelector('.workspace-empty-msg');
                const removeBtn = document.createElement('button');
                removeBtn.type = 'button';
                removeBtn.className = 'fold-btn';
                removeBtn.textContent = "Remove '" + failedName + "' from the list";
                removeBtn.addEventListener('click', () => {
                    removeWorkspaceByName(failedName).catch((err) => console.error('Failed to remove workspace:', err));
                });
                errDiv.appendChild(document.createElement('br'));
                errDiv.appendChild(removeBtn);
            }
        }
    }
}

/**
 * Lightweight badge generator.
 * Fetches data directly from the unified FILE_ICON_MAP.
 */
function getFileIcon(ext) {
    const ico = FILE_ICON_MAP[ext] || { label: '⛘', className: 'icon-default' };
    return `<span class="file-icon-badge ${ico.className}">${ico.label}</span>`;
}

/**
 * Recursive function with Lazy Loading to generate the tree.
 */
async function renderDirectoryTree(dirHandle, container, renderToken) {
    let hasItems = false;
    const entries = [];

    for await (const entry of dirHandle.values()) {
        if (renderToken !== undefined && renderToken !== currentWorkspaceRenderToken) return;
        entries.push(entry);
    }

    if (renderToken !== undefined && renderToken !== currentWorkspaceRenderToken) return;

    entries.sort((a, b) => {
        if (a.kind === b.kind) return a.name.localeCompare(b.name);
        return a.kind === 'directory' ? -1 : 1;
    });

    for (const entry of entries) {
        if (renderToken !== undefined && renderToken !== currentWorkspaceRenderToken) return;
        if (entry.kind === 'directory') {
            if (WORKSPACE_IGNORED_DIRS.includes(entry.name) || entry.name.startsWith('.')) continue;
            hasItems = true;

            const details = document.createElement("details");
            details.classList.add("workspace-folder"); // CSS class for chevrons
            details.style.paddingLeft = "8px";

            const summary = document.createElement("summary");
            summary.textContent = entry.name; // Folder emoji removed
            summary.style.cursor = "pointer";
            summary.style.color = "#8ab4f8";
            summary.style.userSelect = "none";
            summary.style.fontSize = "13px";
            summary.style.padding = "4px 0";

            details.appendChild(summary);

            let isLoaded = false;
            summary.addEventListener('click', async (e) => {
                if (!isLoaded) {
                    const subContainer = document.createElement("div");
                    await renderDirectoryTree(entry, subContainer);
                    details.appendChild(subContainer);
                    isLoaded = true;
                    // Apply active filters to the newly loaded files
                    if (typeof applyWorkspaceFilter === 'function') {
                        applyWorkspaceFilter();
                    }
                }
            });

            container.appendChild(details);

        } else if (entry.kind === 'file') {
            const ext = entry.name.split('.').pop().toLowerCase();
            if (!WORKSPACE_ALLOWED_EXT.includes(ext)) continue;
            hasItems = true;

            const div = document.createElement("div");
            div.classList.add("workspace-file-item");
            div.style.paddingLeft = "28px"; // Alignment under folder text (14px icon + margins)

            // Add tooltip for hover
            div.title = entry.name;
            // Store the extension in the DOM for filtering
            div.dataset.ext = ext;

            // Inject colored icon via innerHTML
            div.innerHTML = getFileIcon(ext) + entry.name;

            div.onclick = async (e) => {
                if (e.ctrlKey || e.metaKey) {
                    // CTRL+SHIFT+click (or CMD+SHIFT+click): open file in a new browser tab
                    // CTRL+click (or CMD+click): open file in a new popup window
                    try {
                        const openFileId = Date.now().toString() + "_" + Math.random().toString(36).substring(2, 8);
                        const key = 'famouskai_open_file_' + openFileId;
                        await idbKeyval.set(key, entry);

                        const targetUrl = new URL(window.location.href);
                        targetUrl.searchParams.set('open_file_id', openFileId);

                        if (e.shiftKey) {
                            // Open in a new tab
                            window.open(targetUrl.toString(), '_blank');
                        } else {
                            // Open in a popup window
                            window.open(targetUrl.toString(), '_blank', 'popup=yes');
                        }
                    } catch (err) {
                        console.error("Error opening file in new window/tab:", err);
                        alert("File open error: " + err.message);
                    }
                    return;
                }

                if (isModified && !confirm("Unsaved changes will be lost. Continue?")) return;

                try {
                    const file = await entry.getFile();
                    const text = await file.text();

                    lastKnownModifiedTime = file.lastModified;

                    fileHandle = entry;
                    currentFileName = entry.name;
                    isInitialLoad = true;
                    isModified = false;

                    editor.setValue(text, -1);
                    applyNativeColoration(currentFileName);
                    emitFileOpen();
                    updateUI();
                    addRecentFile(entry);

                    setTimeout(() => { editor.focus(); isInitialLoad = false; }, 50);
                } catch (err) {
                    alert("File read error: " + err.message);
                }
            };
            container.appendChild(div);
        }
    }

    if (!hasItems) {
        container.insertAdjacentHTML('beforeend', `<div class="workspace-empty-msg is-padded">No supported files</div>`);
    }
}
