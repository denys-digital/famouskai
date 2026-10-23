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
 * Famouskai Editor - Sort Lines
 * Author: Famouskai Community
 */
window.FamousPluginCore.Manager.register({
    name: "Sort Lines",
    // An empty array allows the tool to be available on all file types (including unsaved [New] files)
    extensions: [], 
    
    action: function(editor) {
        // 1. Validate selection
        const range = editor.getSelectionRange();
        const selectedText = editor.session.getTextRange(range);
        
        if (!selectedText) {
            alert("Please select the text to sort first!");
            return;
        }

        // 2. Prompt user for sorting direction (Simple native UI)
        const choice = prompt(
            "Choose sort order:\nA - Ascending (A-Z)\nZ - Descending (Z-A)\n\n(Click Cancel to abort)", 
            "A"
        );
        
        // 3. Execute sorting if user made a valid choice
        if (choice === "A" || choice === "Z") {
            const lines = selectedText.split('\n');
            
            if (choice === "A") {
                lines.sort((a, b) => a.localeCompare(b));
            } else if (choice === "Z") {
                lines.sort((a, b) => b.localeCompare(a));
            }
            
            // Apply modifications to the editor
            editor.session.replace(range, lines.join('\n'));
            
            // Visual feedback using Famouskai's global toast
            if (window.showToast) {
                window.showToast("Sort applied successfully!");
            }
        }
    }
});