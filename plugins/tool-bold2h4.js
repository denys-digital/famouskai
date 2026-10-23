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
 * Famouskai Editor - Bold to H4 Converter Tool
 */
window.FamousPluginCore.Manager.register({
    name: "Convert Bold to H4",
    extensions: ['md'], // Restrict tool visibility to Markdown files only
    
    action: function(editor) {
        // 1. Fetch current cursor position and the full text of that specific line
        const pos = editor.getCursorPosition();
        const line = editor.session.getLine(pos.row);
        
        // 2. Strict Regex: Match lines starting and ending with **, capturing the inner content
        const match = line.match(/^\s*\*\*(.+)\*\*\s*$/);
        
        if (match) {
            // Extract the core text without the markdown asterisks
            const innerText = match[1].trim();
            
            // 3. Define the precise range of the current line to overwrite it
            const Range = ace.require('ace/range').Range;
            const lineRange = new Range(pos.row, 0, pos.row, line.length);
            
            // 4. Inject the new H4 formatting
            editor.session.replace(lineRange, "#### " + innerText);
        } else {
            // Graceful failure if the cursor is on a non-compliant line
            alert("No bold title found on this line. Ensure the line is strictly formatted as **Your Title**.");
        }
    }
});