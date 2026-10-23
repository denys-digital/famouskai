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
 * Famouskai Editor Plugin: Extract & Copy Markdown Table Rows (`tool-extract-mk-table.js`)
 */

window.FamousPluginCore = window.FamousPluginCore || {};

window.FamousPluginCore.Manager.register({
    name: "Extract & Copy Table",
    description: "Extracts selected Markdown table rows along with the header and alignment rows directly to clipboard.",
    extensions: ['md'],

    /**
     * Helper to verify whether a line string is a Markdown table alignment/delimiter line.
     * Matches lines like `|---|:---|---:|:---:|` or `| --- | --- |` where delimiters have 3+ dashes.
     */
    isAlignmentLine: function(lineStr) {
        if (!lineStr || !lineStr.includes('|')) return false;
        return /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(lineStr);
    },

    /**
     * Helper to verify whether a line string is a Markdown table row (contains vertical bars and non-whitespace).
     */
    isTableRow: function(lineStr) {
        if (!lineStr || !lineStr.includes('|')) return false;
        return /^\s*\|.*\|\s*$/.test(lineStr) || /^\s*\|.+\s*$/.test(lineStr);
    },

    action: function(editor) {
        if (!editor) return;

        const doc = editor.session.getDocument();
        const totalLines = doc.getLength();

        // Retrieve all selection ranges (supports Ace multi-selection / disjoint selections via Ctrl+cursor)
        let ranges = [];
        if (editor.selection && typeof editor.selection.getAllRanges === 'function') {
            ranges = editor.selection.getAllRanges();
        }
        if (!ranges || ranges.length === 0) {
            ranges = [editor.getSelectionRange()];
        }

        // Collect all unique row indices touched by any of the selection ranges
        const selectedRowSet = new Set();

        ranges.forEach(range => {
            const startRow = range.start.row;
            let endRow = range.end.row;

            // If selection ends at column 0 on a subsequent line, adjust endRow back by 1
            if (range.end.column === 0 && endRow > startRow) {
                endRow--;
            }

            for (let r = startRow; r <= endRow; r++) {
                const line = doc.getLine(r);
                if (line && line.trim() !== '' && (this.isTableRow(line) || this.isAlignmentLine(line))) {
                    selectedRowSet.add(r);
                }
            }
        });

        // Convert set to sorted array of row indices
        const selectedLineIndices = Array.from(selectedRowSet).sort((a, b) => a - b);

        if (selectedLineIndices.length === 0) {
            alert("Please select one or more lines from the Markdown table.");
            return;
        }

        const minSelectedRow = selectedLineIndices[0];

        // Locate alignment line and header line
        let alignRowIdx = -1;
        let headerRowIdx = -1;

        // Scan upwards from minSelectedRow
        for (let r = minSelectedRow; r >= 0; r--) {
            const line = doc.getLine(r);
            if (!this.isTableRow(line) && !this.isAlignmentLine(line)) {
                break; // Table boundary reached
            }
            if (this.isAlignmentLine(line)) {
                alignRowIdx = r;
                break;
            }
        }

        // Fallback scan downwards if selection started on row 0 (header row)
        if (alignRowIdx === -1) {
            for (let r = minSelectedRow + 1; r < totalLines; r++) {
                const line = doc.getLine(r);
                if (!this.isTableRow(line) && !this.isAlignmentLine(line)) {
                    break;
                }
                if (this.isAlignmentLine(line)) {
                    alignRowIdx = r;
                    break;
                }
            }
        }

        if (alignRowIdx > 0) {
            headerRowIdx = alignRowIdx - 1;
        }

        if (headerRowIdx === -1 || alignRowIdx === -1) {
            alert("Please select one or more lines from the Markdown table.");
            return;
        }

        const headerLine = doc.getLine(headerRowIdx);
        const alignLine = doc.getLine(alignRowIdx);

        // Assemble resulting extracted lines without duplicating header or align lines and skipping blank lines
        const finalLines = [headerLine, alignLine];

        selectedLineIndices.forEach(r => {
            if (r !== headerRowIdx && r !== alignRowIdx) {
                const line = doc.getLine(r);
                if (line && line.trim() !== '' && this.isTableRow(line)) {
                    finalLines.push(line);
                }
            }
        });

        const outputText = finalLines.join('\n') + '\n';

        // Copy to clipboard and display Toast
        navigator.clipboard.writeText(outputText).then(() => {
            if (window.FamousPluginCore.showToast) {
                window.FamousPluginCore.showToast("Extracted and copied to clipboard!", "success");
            }
        }).catch((err) => {
            console.error("Clipboard write error:", err);
            alert("Extracted table:\n\n" + outputText);
        });
    }
});
