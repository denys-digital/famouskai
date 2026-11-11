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
 * Famouskai Core - File Operations & Coloration
 *
 * What it holds:
 *   - Native syntax coloration mapping (applyNativeColoration)
 *   - File lifecycle operations (newFile, openFile, saveFile, saveAsFile, reloadFile)
 *   - File open event emission (emitFileOpen)
 *   - Save success feedback indicator (afficherSucces)
 *   - Search and replace dialog toggle (toggleSearch)
 *
 * Globals used:
 *   - editor, fileHandle, currentFileName, isModified, isInitialLoad, lastKnownModifiedTime
 *   - autoSaveTimer, isAutoSaveEnabled, activeExtFilter
 *   - window.FamousPluginCore, idbKeyval
 *   - updateUI, refreshWorkspaceList, renderWorkspaceSelect, renderRecentFilesList, addRecentFile
 *
 * Globals defined:
 *   - applyNativeColoration
 *   - emitFileOpen
 *   - newFile
 *   - openFile
 *   - saveAsFile
 *   - saveFile
 *   - reloadFile
 *   - afficherSucces
 *   - toggleSearch
 *
 * Note:
 *   - openFile(), saveFile(), saveAsFile() and reloadFile() dispatch the plugin
 *     hooks described in docs/PLUGIN-ARCHITECTURE.md (onFileOpen, onBeforeSave).
 */

function applyNativeColoration(filename) {
    if (!editor) return;

    if (window.FamousPluginCore && window.FamousPluginCore.Outline) {
        // Purge any leftover filter from the previous file
        window.FamousPluginCore.Outline.resetFilter();

        // Render the TOC immediately on file load instead of
        // waiting for the 800ms typing-debounce timer. That timer exists
        // to avoid re-parsing on every keystroke, but editor.setValue()
        // (called right before this function on every file-open path)
        // also fires a session "change" event and was incorrectly
        // falling into the same debounce, leaving the PREVIOUS file's
        // TOC on screen for ~800ms after opening a new one.
        clearTimeout(window.tocTimer);
        window.FamousPluginCore.Outline.update(editor);
    }

    const ext = filename.split('.').pop().toLowerCase();

    // Inject the extension as a data attribute on the editor's root container
    // This allows CSS to scope syntax highlighting variables per language
    editor.container.setAttribute('data-lang', ext);

    if (ext === 'css') editor.session.setMode("ace/mode/css");
    else if (ext === 'csv' || ext === 'tsv') editor.session.setMode({ path: "ace/mode/csv", splitter: ext === 'tsv' ? '\t' : window.FamousPluginCore.CsvMode.detectSeparator(editor.getValue()) });
    else if (ext === "patch" || ext === "diff") editor.session.setMode("ace/mode/diff");
    else if (ext === 'html') editor.session.setMode("ace/mode/html");
    else if (ext === 'js' || ext === 'ts') editor.session.setMode("ace/mode/javascript");
    else if (ext === 'json') editor.session.setMode("ace/mode/json");
    else if (ext === 'md') editor.session.setMode("ace/mode/markdown");
    else if (ext === 'svg') editor.session.setMode("ace/mode/svg");
    else if (ext === 'xml') editor.session.setMode("ace/mode/xml");
    else if (ext === 'yml' || ext === 'yaml') editor.session.setMode("ace/mode/yaml", () => window.FamousPluginCore.YamlFolding.apply(editor.session));
    else if (ext === 'log') editor.session.setMode("ace/mode/log"); /* Famous custom */
    else editor.session.setMode("ace/mode/text");

    const foldButtons = document.getElementById("markdown-fold-buttons");
    if (foldButtons) foldButtons.style.display = (ext === 'md') ? "flex" : "none";

    if (window.FamousPluginCore && window.FamousPluginCore.Manager) {
        window.FamousPluginCore.Manager.renderTools(editor, filename);
    }
}

// Runs the onFileOpen tool triggers (e.g. "Auto-cleanup on Open") and makes
// any change they make visible: the file is flagged as modified and a toast explains why.
// Returns true when a trigger changed the content.
function emitFileOpen() {
    if (!editor || !window.FamousPluginCore || !window.FamousPluginCore.Manager) return false;
    const before = editor.getValue();
    window.FamousPluginCore.Manager.emit('onFileOpen', editor, { filename: currentFileName });
    if (editor.getValue() !== before) {
        isModified = true;
        if (window.showToast) window.showToast("Auto-cleanup tidied this file on open. Save to keep the changes.", "info");
        return true;
    }
    return false;
}

function newFile() {
    if (!editor) return;
    if (isModified && !confirm("Unsaved changes will be lost. Continue?")) return;

    isInitialLoad = true;
    fileHandle = null;
    currentFileName = "";
    isModified = false;
    if (window.FamousMobkai && window.FamousMobkai.clearDraft) window.FamousMobkai.clearDraft();

    editor.setValue("", -1);
    editor.session.setMode("ace/mode/text");

    // The magic call that puts everything in "blank text" mode (hides buttons, empties tools, etc.)
    applyNativeColoration(currentFileName);

    updateUI();

    setTimeout(() => { editor.focus();
        isInitialLoad = false; }, 50);
}

function openFileViaInput() {
    return new Promise((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = WORKSPACE_ALLOWED_EXT.map(ext => "." + ext).join(',');
        input.addEventListener('change', async () => {
            const file = input.files && input.files[0];
            if (!file) return resolve();
            try {
                const text = await file.text();
                fileHandle = null;
                currentFileName = file.name;
                isInitialLoad = true;
                isModified = false;
                editor.setValue(text, -1);
                applyNativeColoration(currentFileName);
                emitFileOpen();
                updateUI();
                setTimeout(() => { editor.focus(); isInitialLoad = false; }, 50);
            } catch (err) {
                alert("Error: " + err.message);
            }
            resolve();
        });
        input.click();
    });
}

/**
 * Default name for a new file. Mobkai is a note mode with a Markdown preview, and
 * Android keeps the extension of the suggested name (see saveAsFile), so .md there.
 * @returns {string}
 */
function getDefaultFileName() {
    const mob = typeof window.isMobkai === 'function' && window.isMobkai();
    return mob ? "famous-untitled.md" : "famous-untitled.txt";
}

function downloadCurrentFile() {
    if (!editor) return;
    const name = currentFileName || getDefaultFileName();
    const blob = new Blob([editor.getValue()], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    isModified = false;
    if (window.FamousMobkai && window.FamousMobkai.clearDraft) window.FamousMobkai.clearDraft();
    updateUI();
}

async function openFile() {
    if (!editor) return;
    if (isModified && !confirm("Unsaved changes will be lost. Continue?")) return;

    if (typeof window.showOpenFilePicker !== 'function') {
        return openFileViaInput();
    }

    try {
        const pickerOptions = {
            id: "editeur-chromeos-text-clone",
            types: [{ description: 'Famous files', accept: { 'text/*': WORKSPACE_ALLOWED_EXT.map(ext => "." + ext) } }]
        };

        if (fileHandle) {
            pickerOptions.startIn = fileHandle;
        } else if (window.currentWorkspaceHandle) {
            // Rights check just before opening if revoked by the system
            if (await window.currentWorkspaceHandle.queryPermission({ mode: 'readwrite' }) !== 'granted') {
                await window.currentWorkspaceHandle.requestPermission({ mode: 'readwrite' });
            }
            pickerOptions.startIn = window.currentWorkspaceHandle;
        }

        const [handle] = await window.showOpenFilePicker(pickerOptions);
        fileHandle = handle;
        currentFileName = handle.name;

        const file = await fileHandle.getFile();
        const text = await file.text();

        lastKnownModifiedTime = file.lastModified;

        isInitialLoad = true;
        isModified = false;
        editor.setValue(text, -1);

        applyNativeColoration(currentFileName);
        addRecentFile(handle);
        emitFileOpen();
        updateUI();

        const savedCursor = JSON.parse(localStorage.getItem(`cursor_${currentFileName}`));
        if (savedCursor) {
            editor.moveCursorTo(savedCursor.row, savedCursor.column);
            editor.clearSelection();
        }

        setTimeout(() => { editor.focus();
            isInitialLoad = false; }, 50);
    } catch (err) {
        if (err.name !== 'AbortError') alert("Error: " + err.message);
    }
}

// MIME types for the Save picker. Android builds the file name from the FIRST
// accepted type: with one generic 'text/*' entry, "famous-untitled.txt" came back
// as "famous-untitled.txt.json". The type of the suggested name now comes first.
// In Mobkai, saveAsFile() passes no type list at all (see there).
const SAVE_MIME_BY_EXT = {
    txt: 'text/plain', log: 'text/plain', md: 'text/markdown', json: 'application/json',
    js: 'text/javascript', ts: 'text/plain', html: 'text/html', xml: 'text/xml', svg: 'image/svg+xml',
    css: 'text/css', csv: 'text/csv', tsv: 'text/tab-separated-values', yaml: 'text/yaml', yml: 'text/yaml',
    patch: 'text/plain', diff: 'text/plain'
};

/**
 * Builds the showSaveFilePicker "types" list with the suggested file's own type first.
 * @param {string} name - Suggested file name
 * @returns {Array} picker types
 */
function getSaveTypesFor(name) {
    const all = { description: 'Famous files', accept: { 'text/*': WORKSPACE_ALLOWED_EXT.map(ext => "." + ext) } };
    const dot = name.lastIndexOf('.');
    const ext = dot > 0 ? name.slice(dot + 1).toLowerCase() : '';
    if (!ext || !WORKSPACE_ALLOWED_EXT.includes(ext)) return [all];
    const own = { description: ext.toUpperCase() + ' file', accept: {} };
    own.accept[SAVE_MIME_BY_EXT[ext] || 'text/plain'] = ['.' + ext];
    return [own, all];
}

async function saveAsFile() {
    if (!editor) return;
    if (typeof window.showSaveFilePicker !== 'function') {
        if (window.FamousPluginCore && window.FamousPluginCore.Manager) {
            window.FamousPluginCore.Manager.emit('onBeforeSave', editor, { filename: currentFileName });
        }
        downloadCurrentFile();
        return;
    }
    try {
        let suggestedName = currentFileName || getDefaultFileName();
        // Mobkai: the name (and its extension) is chosen in Famouskai first, see askFileName()
        if (typeof window.isMobkai === 'function' && window.isMobkai() && typeof askFileName === 'function') {
            const chosen = await askFileName(suggestedName, "Save as", "Save");
            if (!chosen) return;
            suggestedName = chosen;
        }
        const pickerOptions = {
            id: "editeur-chromeos-text-clone",
            suggestedName: suggestedName
        };
        // Mobkai (Android): no type list. The Android picker always ends the file with the
        // extension of the suggested name or type (typed .md 🡪 .md.txt), so the type list
        // is left out and the default name is .md in Mobkai (getDefaultFileName).
        if (!(typeof window.isMobkai === 'function' && window.isMobkai())) {
            pickerOptions.types = getSaveTypesFor(suggestedName);
        }

        if (fileHandle) {
            pickerOptions.startIn = fileHandle;
        } else if (window.currentWorkspaceHandle) {
            // Rights check just before opening if revoked by the system
            if (await window.currentWorkspaceHandle.queryPermission({ mode: 'readwrite' }) !== 'granted') {
                await window.currentWorkspaceHandle.requestPermission({ mode: 'readwrite' });
            }
            pickerOptions.startIn = window.currentWorkspaceHandle;
        }

        const handle = await window.showSaveFilePicker(pickerOptions);
        fileHandle = handle;
        currentFileName = handle.name;

        // Dispatch onBeforeSave trigger event to active tools (e.g. Auto-cleanup on Save)
        if (window.FamousPluginCore && window.FamousPluginCore.Manager) {
            window.FamousPluginCore.Manager.emit('onBeforeSave', editor, { filename: currentFileName });
        }

        const writable = await fileHandle.createWritable();
        await writable.write(editor.getValue());
        await writable.close();

        lastKnownModifiedTime = (await fileHandle.getFile()).lastModified;

        isModified = false;
        if (window.FamousMobkai && window.FamousMobkai.clearDraft) window.FamousMobkai.clearDraft();
        applyNativeColoration(currentFileName);
        addRecentFile(handle);
        updateUI();

        afficherSucces("btn-save-as");
    } catch (err) {
        if (err.name !== 'AbortError') alert("Save error: " + err.message);
    }
}

async function saveFile() {
    if (!editor) return;
    if (typeof window.showSaveFilePicker !== 'function') {
        return saveAsFile();
    }
    if (!fileHandle) return saveAsFile();

    try {
        // Dispatch onBeforeSave trigger event to active tools
        if (window.FamousPluginCore && window.FamousPluginCore.Manager) {
            window.FamousPluginCore.Manager.emit('onBeforeSave', editor, { filename: currentFileName });
        }

        // 1. CONFLICT CHECK BEFORE WRITING
        const currentFileOnDisk = await fileHandle.getFile();
        if (currentFileOnDisk.lastModified > lastKnownModifiedTime) {

            // Mobkai: no Diffskai on a phone, a simple confirm instead (docs-lab/MOBKAI-SPEC.md 13.3)
            if (typeof window.isMobkai === 'function' && window.isMobkai()) {
                if (!confirm("The file changed on disk. Overwrite it with your version?")) {
                    return; // Buffer stays unsaved (modified flag kept)
                }
            } else {
                // ﹥ ASYNCHRONOUS PREPARATION BEFORE CONFIRM (Bypass Popup Blocker)
                const diskText = await currentFileOnDisk.text();
                const conflictId = await window.FamousPluginCore.Diffskai.prepareSession({
                    mode: 'conflict',
                    buffer: editor.getValue(),
                    diskText,
                    baseline: currentFileOnDisk.lastModified
                });

                /// ﹥ USER INTERACTION IMMEDIATELY FOLLOWED BY WINDOW.OPEN
                if (confirm("EDITING CONFLICT\nThe file has been modified on disk. Do you want to open the comparison tool?")) {
                    window.FamousPluginCore.Diffskai.openSession(conflictId);
                } else {
                    // If the user cancels, we clean up the prepared data
                    if (typeof idbKeyval !== 'undefined') {
                        await idbKeyval.del('diffskai_session_' + conflictId);
                    }
                }
                return; // Intercept current save in all cases
            }
        }

        // 3. NORMAL SAVE IF NO CONFLICT
        const writable = await fileHandle.createWritable();
        await writable.write(editor.getValue());
        await writable.close();

        // 4. TIMESTAMP UPDATE AFTER WRITING
        const updatedFile = await fileHandle.getFile();
        lastKnownModifiedTime = updatedFile.lastModified;

        isModified = false;
        if (window.FamousMobkai && window.FamousMobkai.clearDraft) window.FamousMobkai.clearDraft();
        updateUI();
        afficherSucces("btn-save");
    } catch (err) {
        alert("Save error: " + err.message);
    }
}

async function reloadFile() {
    if (!editor || !fileHandle) return;
    if (isModified && !confirm("Do you really want to overwrite your current changes by reloading the file from disk?")) return;

    try {
        const file = await fileHandle.getFile();
        const text = await file.text();

        lastKnownModifiedTime = file.lastModified;

        isInitialLoad = true;
        const cursor = editor.getCursorPosition();

        editor.setValue(text, -1);

        editor.moveCursorToPosition(cursor);
        editor.clearSelection();

        isModified = false;
        applyNativeColoration(currentFileName);
        emitFileOpen();
        updateUI();

        setTimeout(() => { editor.focus(); isInitialLoad = false; }, 50);
    } catch (err) {
        alert("Reload error: " + err.message);
    }
}

function afficherSucces(btnId) {
    const btn = document.getElementById(btnId);
    // Mobkai: the button keeps its label, "Saved" goes to the status bar toast
    if (typeof window.isMobkai === 'function' && window.isMobkai()) {
        if (btn) btn.blur();
        if (window.showToast) window.showToast("Saved", "success");
        if (editor) editor.focus();
        return;
    }
    const originalText = btn.textContent;
    btn.textContent = "Saved";
    btn.classList.add('btn-success');
    // Give the focus back to the editor, so the button does not stay highlighted
    btn.blur();
    if (editor) editor.focus();
    setTimeout(() => { btn.textContent = originalText; btn.classList.remove('btn-success'); }, 1500);
}

function toggleSearch() { if (editor) editor.execCommand("replace"); }
