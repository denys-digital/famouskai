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
window.FamousPluginCore.Manager.register({
    name: "Set Default Workspace",
    extensions: [],
    
    action: async function(editor) {
        try {
            const directoryHandle = await window.showDirectoryPicker({
                id: 'famouskai-workspace',
                mode: 'readwrite'
            });
            
            if (typeof saveWorkspaceToStore === 'function') {
                await saveWorkspaceToStore(directoryHandle);
            } else {
                await idbKeyval.set('default_workspace_handle', directoryHandle);
                window.currentWorkspaceHandle = directoryHandle;
            }
            
            // Decoupled communication: we emit an event instead of calling a global function
            window.dispatchEvent(new CustomEvent('workspace-updated'));
            
            // Using a Toast or native alert
            console.log("Workspace set to: " + directoryHandle.name);
            
        } catch (error) {
            if (error.name !== 'AbortError') {
                alert("Workspace setup failed: " + error.message);
            }
        }
    }
});