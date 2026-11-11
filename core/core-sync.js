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
 * Famouskai Core - Post-Merge & External Save Synchronization
 *
 * What it holds:
 *   - BroadcastChannel listener ('famouskai_sync') reacting to external saves and merges
 *   - Automatic reload & editor update on external changes from other windows or Diffskai
 *
 * Globals used:
 *   - editor
 *   - fileHandle
 *   - lastKnownModifiedTime
 *   - isModified
 *   - isInitialLoad
 *   - updateUI
 *   - window.FamousPluginCore
 *   - DOM element #file-name
 *
 * Globals defined:
 *   - syncChannel
 */

// ﹥ POST-MERGE & EXTERNAL SAVE SYNCHRONIZATION
const syncChannel = new BroadcastChannel('famouskai_sync');

syncChannel.onmessage = async (event) => {
    // Messages are { type, sessionId, handle }. A bare string comes from an older Diffskai window: treat it as untargeted.
    const msg = (typeof event.data === 'string') ? { type: event.data } : (event.data || {});
    if ((msg.type === 'MERGE_COMPLETE' || msg.type === 'DIFFSKAI_SAVED') && fileHandle) {
        try {
            // ISOLATION: only the window(s) showing the file Diffskai wrote may react.
            if (msg.handle && !(await fileHandle.isSameEntry(msg.handle))) return;

            // A silent reload is allowed only for this window's own merge, and only if the editor
            // still holds exactly the text it sent to Diffskai. Every other case asks first.
            const ownSessions = (window.FamousPluginCore && window.FamousPluginCore.Diffskai) ? window.FamousPluginCore.Diffskai.ownSessions : null;
            const isOwnMerge = msg.type === 'MERGE_COMPLETE' && !!msg.handle && !!ownSessions
                && ownSessions.has(msg.sessionId) && ownSessions.get(msg.sessionId) === editor.getValue();

            const diskFile = await fileHandle.getFile();

            if (diskFile.lastModified > lastKnownModifiedTime) {

                if (isModified && !isOwnMerge) {
                    if (!confirm("This file was just updated by Diffskai. Reload and lose your current unsaved changes?")) {
                        return;
                    }
                }
                if (isOwnMerge) ownSessions.delete(msg.sessionId);

                const text = await diskFile.text();

                isInitialLoad = true; // Bloque les événements de frappe
                const cursor = editor.getCursorPosition();

                editor.setValue(text, -1);
                editor.moveCursorToPosition(cursor);
                editor.clearSelection();

                // Update state with new timestamp
                lastKnownModifiedTime = diskFile.lastModified;
                isModified = false;

                // 1. Release the change listener block safely to allow future edits
                setTimeout(() => {
                    isInitialLoad = false;
                    if (editor) editor.focus();
                }, 50);

                // 2. Inject message safely via innerHTML without hardcoded styles
                const successMsg = msg.type === 'MERGE_COMPLETE' ? "Merge done" : "Auto-Synced";
                const titleEl = document.getElementById("file-name");
                titleEl.innerHTML = `<span class="sync-success-msg">${successMsg}</span>`;

                // 3. Restore original UI state asynchronously
                setTimeout(() => {
                    updateUI();
                }, 2000);
            }
        } catch (error) {
            console.error("External sync error:", error);
        }
    }
};
