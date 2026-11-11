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
 * Famouskai Core - Workspace Selector & Recent Files
 *
 * What it holds:
 *   - Workspace search filter globals and filter handler (applyWorkspaceFilter)
 *   - Multi-workspace selector and storage (MAX_WORKSPACES, isRecentWorkspaceFilterActive, getSavedWorkspaces, saveWorkspaceToStore, renderWorkspaceSelect, initWorkspace)
 *   - Recent files stack and list renderer (MAX_RECENT_FILES, recentFilesChannel, getRecentFiles, addRecentFile, recentFilesRenderToken, renderRecentFilesList)
 *
 * Globals used:
 *   - idbKeyval, window.currentWorkspaceHandle, window.showToast
 *   - refreshWorkspaceList, getFileIcon, editor, applyNativeColoration, emitFileOpen, updateUI
 *
 * Globals defined:
 *   - activeExtFilter, wsSearchInput, wsSearchClear, applyWorkspaceFilter
 *   - MAX_WORKSPACES, MAX_RECENT_FILES, isRecentWorkspaceFilterActive
 *   - getSavedWorkspaces, saveWorkspaceToStore, renderWorkspaceSelect, initWorkspace
 *   - recentFilesChannel, getRecentFiles, addRecentFile, recentFilesRenderToken, renderRecentFilesList
 */
// Workspace Search Filter Globals (Hoisted above refreshWorkspaceList)
let activeExtFilter = null;
let wsSearchInput = null;
let wsSearchClear = null;

function applyWorkspaceFilter() {
    if (!wsSearchInput) wsSearchInput = document.getElementById("workspace-search");
    if (!wsSearchClear) wsSearchClear = document.getElementById("workspace-search-clear");

    const filterTerm = wsSearchInput ? wsSearchInput.value.toLowerCase() : "";
    if (wsSearchClear) wsSearchClear.style.display = filterTerm ? "block" : "none";

    const fileItems = document.querySelectorAll("#workspace-file-list .workspace-file-item");
    fileItems.forEach(item => {
        const matchText = item.textContent.toLowerCase().includes(filterTerm);
        const matchExt = !activeExtFilter || activeExtFilter.includes(item.dataset.ext);
        item.style.display = (matchText && matchExt) ? "block" : "none";
    });
}

// --- MULTI-WORKSPACE SELECTOR & RECENT FILES STACK ---
const MAX_WORKSPACES = 10;
const MAX_RECENT_FILES = 50;

function isRecentWorkspaceFilterActive() {
    try {
        return localStorage.getItem('famouskai_recent_filter_workspace') === '1';
    } catch (e) {
        return false;
    }
}

async function getSavedWorkspaces() {
    try {
        const list = await idbKeyval.get('famouskai_workspaces');
        return Array.isArray(list) ? list : [];
    } catch (e) {
        return [];
    }
}

async function saveWorkspaceToStore(handle) {
    if (!handle) return;
    try {
        let workspaces = await getSavedWorkspaces();
        // Deduplicate by directory name
        workspaces = workspaces.filter(w => w.name !== handle.name);
        workspaces.unshift({
            id: Date.now().toString(),
            name: handle.name,
            handle: handle,
            lastAccessed: Date.now()
        });
        if (workspaces.length > MAX_WORKSPACES) {
            workspaces = workspaces.slice(0, MAX_WORKSPACES);
        }
        await idbKeyval.set('famouskai_workspaces', workspaces);
        await idbKeyval.set('default_workspace_handle', handle);
        window.currentWorkspaceHandle = handle;
        renderRecentFilesList();
    } catch (err) {
        console.error("Failed to save workspace handle:", err);
    }
}

async function renderWorkspaceSelect() {
    const selectEl = document.getElementById('workspace-select');
    if (!selectEl) return;

    const workspaces = await getSavedWorkspaces();
    selectEl.innerHTML = '';

    const defaultOpt = document.createElement('option');
    defaultOpt.value = '';
    defaultOpt.textContent = workspaces.length > 0 ? '-- Select Workspace --' : '-- No saved workspaces --';
    selectEl.appendChild(defaultOpt);

    workspaces.forEach((w, idx) => {
        const opt = document.createElement('option');
        opt.value = idx.toString();
        opt.textContent = w.name;
        if (window.currentWorkspaceHandle && window.currentWorkspaceHandle.name === w.name) {
            opt.selected = true;
        }
        selectEl.appendChild(opt);
    });

    const removeBtn = document.getElementById('workspace-remove');
    if (removeBtn) {
        removeBtn.disabled = (selectEl.value === '');
    }
}

async function removeWorkspaceByName(name) {
    if (!name) return;
    if (!confirm("Remove '" + name + "' from the list? The folder on disk is not touched.")) return;
    let workspaces = await getSavedWorkspaces();
    workspaces = workspaces.filter(w => w.name !== name);
    await idbKeyval.set('famouskai_workspaces', workspaces);
    const defaultHandle = await idbKeyval.get('default_workspace_handle');
    if (defaultHandle && defaultHandle.name === name) {
        await idbKeyval.del('default_workspace_handle');
    }
    if (window.currentWorkspaceHandle && window.currentWorkspaceHandle.name === name) {
        window.currentWorkspaceHandle = null;
        refreshWorkspaceList();
        renderRecentFilesList();
    }
    await renderWorkspaceSelect();
}

async function removeSelectedWorkspace() {
    const selectEl = document.getElementById('workspace-select');
    if (!selectEl || selectEl.value === '') return;
    const idx = Number(selectEl.value);
    const workspaces = await getSavedWorkspaces();
    if (!Number.isInteger(idx) || idx < 0 || idx >= workspaces.length) return;
    await removeWorkspaceByName(workspaces[idx].name);
}

async function initWorkspace() {
    try {
        const defaultHandle = await idbKeyval.get('default_workspace_handle');
        if (defaultHandle) {
            const permission = await defaultHandle.queryPermission({ mode: 'readwrite' });
            if (permission === 'granted') {
                window.currentWorkspaceHandle = defaultHandle;
            }
        }
        await renderWorkspaceSelect();
        if (window.currentWorkspaceHandle) {
            refreshWorkspaceList();
        }
    } catch (err) {
        console.error("Failed to load workspace:", err);
    }
    const removeBtn = document.getElementById('workspace-remove');
    if (removeBtn && !removeBtn.dataset.bound) {
        removeBtn.dataset.bound = '1';
        removeBtn.addEventListener('click', () => {
            removeSelectedWorkspace().catch((err) => console.error('Failed to remove workspace:', err));
        });
    }
    renderRecentFilesList();
}

// --- RECENT FILES STACK ---
const recentFilesChannel = new BroadcastChannel('famouskai_recent_files');
recentFilesChannel.onmessage = (e) => {
    if (e.data === 'RECENT_FILES_UPDATED') {
        renderRecentFilesList();
    }
};

async function getRecentFiles() {
    try {
        const list = await idbKeyval.get('famouskai_recent_files');
        return Array.isArray(list) ? list : [];
    } catch (e) {
        return [];
    }
}

async function addRecentFile(handle) {
    if (!handle || !handle.name) return;
    try {
        let recents = await getRecentFiles();
        let filtered = [];
        for (const entry of recents) {
            let isSame = false;
            if (entry && entry.handle && typeof entry.handle.isSameEntry === 'function') {
                try {
                    isSame = await entry.handle.isSameEntry(handle);
                } catch (e) {
                    isSame = (entry.name === handle.name);
                }
            } else {
                isSame = (entry.name === handle.name);
            }
            if (!isSame) {
                filtered.push(entry);
            }
        }
        filtered.unshift({
            name: handle.name,
            handle: handle,
            lastOpened: Date.now()
        });
        if (filtered.length > MAX_RECENT_FILES) {
            filtered = filtered.slice(0, MAX_RECENT_FILES);
        }
        await idbKeyval.set('famouskai_recent_files', filtered);
        renderRecentFilesList();
        recentFilesChannel.postMessage('RECENT_FILES_UPDATED');
    } catch (err) {
        console.error("Failed to update recent files stack:", err);
    }
}

let recentFilesRenderToken = 0;

async function renderRecentFilesList() {
    const listEl = document.getElementById('recent-files-list');
    const filterBtn = document.getElementById('btn-recent-filter-workspace');
    if (!listEl) return;

    const renderToken = ++recentFilesRenderToken;

    const isWorkspaceOpen = !!window.currentWorkspaceHandle;
    const isFilterOn = isRecentWorkspaceFilterActive();

    if (filterBtn) {
        filterBtn.disabled = !isWorkspaceOpen;
        if (isFilterOn && isWorkspaceOpen) {
            filterBtn.classList.add('active-filter');
            filterBtn.setAttribute('aria-pressed', 'true');
            filterBtn.title = "Showing recent files from the current workspace only (click to show all)";
        } else {
            filterBtn.classList.remove('active-filter');
            filterBtn.setAttribute('aria-pressed', 'false');
            filterBtn.title = "Show only recent files from the current workspace";
        }
    }

    const recents = await getRecentFiles();
    if (renderToken !== recentFilesRenderToken) return;

    if (recents.length === 0) {
        listEl.innerHTML = `<div class="workspace-empty-msg">No recent files</div>`;
        return;
    }

    let displayItems = [];
    if (isFilterOn && isWorkspaceOpen) {
        for (const item of recents) {
            let inside = false;
            if (item && item.handle && typeof window.currentWorkspaceHandle.resolve === 'function') {
                try {
                    const rel = await window.currentWorkspaceHandle.resolve(item.handle);
                    if (Array.isArray(rel)) {
                        inside = true;
                    }
                } catch (e) {
                    inside = false;
                }
            }
            if (inside) {
                displayItems.push(item);
            }
        }
        if (renderToken !== recentFilesRenderToken) return;

        if (displayItems.length === 0) {
            listEl.innerHTML = `<div class="workspace-empty-msg">No recent files in this workspace</div>`;
            return;
        }
    } else {
        displayItems = recents;
    }

    listEl.innerHTML = '';
    displayItems.forEach(item => {
        const ext = item.name.split('.').pop().toLowerCase();
        const div = document.createElement('div');
        div.className = 'workspace-file-item';
        div.style.paddingLeft = '8px';
        div.title = item.name;
        div.innerHTML = getFileIcon(ext);
        div.appendChild(document.createTextNode(item.name));

        div.onclick = async (e) => {
            if (e.ctrlKey || e.metaKey) {
                try {
                    const openFileId = Date.now().toString() + "_" + Math.random().toString(36).substring(2, 8);
                    const key = 'famouskai_open_file_' + openFileId;
                    await idbKeyval.set(key, item.handle);

                    const targetUrl = new URL(window.location.href);
                    targetUrl.searchParams.set('open_file_id', openFileId);

                    if (e.shiftKey) {
                        window.open(targetUrl.toString(), '_blank');
                    } else {
                        window.open(targetUrl.toString(), '_blank', 'popup=yes');
                    }
                } catch (err) {
                    console.error("Error opening recent file in new window/tab:", err);
                }
                return;
            }

            if (isModified && !confirm("Unsaved changes will be lost. Continue?")) return;

            try {
                const file = await item.handle.getFile();
                const text = await file.text();

                fileHandle = item.handle;
                currentFileName = item.name;
                lastKnownModifiedTime = file.lastModified;
                isInitialLoad = true;
                isModified = false;

                editor.setValue(text, -1);
                applyNativeColoration(currentFileName);
                emitFileOpen();
                updateUI();
                addRecentFile(item.handle);

                setTimeout(() => { editor.focus(); isInitialLoad = false; }, 50);
            } catch (err) {
                alert("File read error: " + err.message);
            }
        };

        listEl.appendChild(div);
    });
}
