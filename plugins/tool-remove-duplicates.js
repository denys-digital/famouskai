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
 * Famouskai Editor - Remove Duplicate Lines
 * Author: Famouskai Community
 */
window.FamousPluginCore.Manager.register({
    name: "Remove Duplicate Lines",
    // Empty array to allow the tool on all file types, including unsaved ones
    extensions: [], 
    
    // Optional confirmation prompt
    confirmMsg: "Do you want to remove duplicate lines in the current selection?",
    
    action: function(editor) {
        // 1. Get current selection
        const range = editor.getSelectionRange();
        const selectedText = editor.session.getTextRange(range);
        
        if (!selectedText) {
            alert("Please select the text to deduplicate first!");
            return;
        }

        // 2. Process the text: split by line, use Set to keep only unique values
        const lines = selectedText.split('\n');
        const uniqueLines = [...new Set(lines)];
        
        // 3. Apply the deduplicated text back to the editor
        editor.session.replace(range, uniqueLines.join('\n'));
        
        // 4. Provide feedback with the exact number of removed lines
        if (window.showToast) {
            const removedCount = lines.length - uniqueLines.length;
            window.showToast(`${removedCount} duplicate(s) removed!`);
        }
    }
});