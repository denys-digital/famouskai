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
 * Famouskai Editor - Clean Bookmarks Tool
 */
window.FamousPluginCore.Manager.register({
    name: "Clean Semantic Bookmarks",
    // Added '' to allow execution on [New] unsaved files
    extensions: ['js', 'json', 'html', 'xml', 'svg', 'css', 'md', 'ts', 'yaml', 'yml', 'txt', 'log', ''],
    confirmMsg: "This will permanently delete all lines containing 'TODO' or '@' comments in the document. Continue?",
    
    action: function(editor) {
        const lines = editor.session.getDocument().getAllLines();
        
        // Matches // TODO, // @, <!-- TODO, <!-- @
        const regexTODO = /^(?:\s*\/\/\s*|\s*<!--\s*)(TODO|@)/i;
        
        let removedCount = 0;
        let newLines = [];

        for (let i = 0; i < lines.length; i++) {
            if (lines[i].match(regexTODO)) {
                removedCount++;
            } else {
                newLines.push(lines[i]);
            }
        }

        if (removedCount > 0) {
            editor.session.setValue(newLines.join('\n'));
            if (window.showToast) window.showToast(`Cleaned up ${removedCount} bookmark(s).`);
        } else {
            if (window.showToast) window.showToast("No semantic bookmarks found to clean.");
        }
    }
});