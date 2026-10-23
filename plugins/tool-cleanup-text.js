/**
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
/**
 * Famouskai Editor Plugin:
 * ﹥ Tidy & Sanitize Text Tool (`tool-cleanup-text.js`)
 *
 * TUTORIAL & EXEMPLARY CODE PATTERN FOR DEVELOPERS:
 * This tool serves as a reference implementation for Famouskai's Tool Framework.
 * It demonstrates:
 * 1. Declarative Plugin Settings Schema (`settings` array).
 * 2. Automated Lifecycle Event Hooks (`triggers` object: `onBeforeSave`, `onFileOpen`).
 * 3. Dynamic Scope Detection (Selection vs Entire Document) with confirmMsg callbacks.
 * 4. Silent non-intrusive automated execution for background triggers.
 * 5. Multi-rule text sanitization with regex, CRLF/LF line ending preservation & POSIX trailing newline normalization.
 * 6. Markdown-only rule: orphan list markers removal for empty list items.
 */

window.FamousPluginCore = window.FamousPluginCore || {};

window.FamousPluginCore.Manager.register({
    /**
     * Display name shown in the sidebar's "TOOLS" menu section
     */
    name: "Tidy & Sanitize Text",

    /**
     * Tooltip description revealed when hovering over the menu entry
     */
    description: "Cleans whitespace, double spaces, empty list items, leading/consecutive blank lines, and normalizes file ending",

    /**
     * Supported file extensions. An empty array [] allows availability across ALL file types
     */
    extensions: [],

    /**
     * Dynamic Settings Declarations:
     * Controls rendered automatically in the sidebar "Settings" panel.
     * Persisted across browser sessions via LocalStorage.
     */
    settings: [
        {
            id: "cleanup_on_save",
            label: "Auto-cleanup on Save",
            type: "checkbox",
            default: false,
            tooltip: "Automatically sanitize text formatting when saving a file"
        },
        {
            id: "cleanup_on_open",
            label: "Auto-cleanup on Open",
            type: "checkbox",
            default: false,
            tooltip: "Automatically sanitize text formatting when opening a file"
        }
    ],

    /**
     * Lifecycle Event Triggers:
     * Hooks called automatically by FamousPluginCore.Manager during app events.
     */
    triggers: {
        /**
         * Fired right before saving document content to disk
         * @param {Object} editor - The Ace Editor instance
         * @param {Object} settings - Key-value map of current tool settings
         */
        onBeforeSave: function(editor, settings) {
            if (settings && settings.cleanup_on_save) {
                this.actionSilently(editor);
            }
        },

        /**
         * Fired right after a file is loaded into the editor
         * @param {Object} editor - The Ace Editor instance
         * @param {Object} settings - Key-value map of current tool settings
         */
        onFileOpen: function(editor, settings) {
            if (settings && settings.cleanup_on_open) {
                this.actionSilently(editor);
            }
        }
    },

    /**
     * Dynamic confirmation prompt string generator.
     * Evaluates whether the user has selected text or wants to process the full document.
     *
     * @param {Object} editor - Ace Editor instance
     * @returns {string} - Prompt message displayed in native confirm() modal
     */
    confirmMsg: function(editor) {
        if (!editor) return "Do you want to clean up the document?";
        const selectionRange = editor.getSelectionRange();
        const isSelection = !selectionRange.isEmpty();

        if (isSelection) {
            return "Do you want to clean up the selected text?\n\nScope: Current selection\nNote: Multiple spaces will be compressed to single spaces.\nYou always can undo with Ctrl+Z (Cmd+Z).";
        } else {
            return "Do you want to clean up the entire document?\n\nScope: Entire document";
        }
    },

    /**
     * Interactive Action (User-triggered via sidebar click):
     * Asks confirmation, processes text, and displays a summary Toast notification.
     * Preserves cursor and scroll positions when processing full document.
     *
     * @param {Object} editor - Ace Editor instance
     */
    action: function(editor) {
        if (!editor) return;

        const selectionRange = editor.getSelectionRange();
        const isSelection = !selectionRange.isEmpty();

        const originalText = isSelection
            ? editor.session.getTextRange(selectionRange)
            : editor.getValue();

        if (!originalText) {
            if (window.FamousPluginCore.showToast) {
                window.FamousPluginCore.showToast("No text to clean.", "warn");
            }
            return;
        }

        // Detect if current document is Markdown
        const isMarkdown = /markdown/.test((editor.session.getMode() && editor.session.getMode().$id) || '');

        // Process text through sanitization engine
        const result = this.sanitizeText(originalText, isSelection, { markdown: isMarkdown });

        if (originalText === result.cleanedText) {
            if (window.FamousPluginCore.showToast) {
                window.FamousPluginCore.showToast("Text is already clean!", "info");
            }
            return;
        }

        // Apply updated text back to editor
        if (isSelection) {
            editor.session.replace(selectionRange, result.cleanedText);
        } else {
            const cursor = editor.getCursorPosition();
            const scrollTop = editor.session.getScrollTop();

            editor.setValue(result.cleanedText, -1);

            const newDocLength = editor.session.getLength();
            const targetRow = Math.min(cursor.row, Math.max(0, newDocLength - 1));
            editor.moveCursorTo(targetRow, cursor.column);
            editor.clearSelection();
            editor.session.setScrollTop(scrollTop);
        }

        // Display summary Toast feedback
        if (window.FamousPluginCore.showToast) {
            const scopeLabel = isSelection ? "Selection" : "Document";
            window.FamousPluginCore.showToast(`${scopeLabel} cleaned (${result.totalChanges} fix${result.totalChanges > 1 ? 'es' : ''} applied)`, "success");
        }
    },

    /**
     * Silent Non-Intrusive Action (Triggered by automated lifecycle events):
     * Runs sanitization without confirmation prompts or toasts, avoiding disruption to flow.
     * Preserves cursor and scroll positions when replacing document content.
     *
     * @param {Object} editor - Ace Editor instance
     */
    actionSilently: function(editor) {
        if (!editor) return;
        const originalText = editor.getValue();
        if (!originalText) return;

        // Detect if current document is Markdown
        const isMarkdown = /markdown/.test((editor.session.getMode() && editor.session.getMode().$id) || '');

        const result = this.sanitizeText(originalText, false, { markdown: isMarkdown });
        if (originalText !== result.cleanedText) {
            const cursor = editor.getCursorPosition();
            const scrollTop = editor.session.getScrollTop();

            editor.setValue(result.cleanedText, -1);

            const newDocLength = editor.session.getLength();
            const targetRow = Math.min(cursor.row, Math.max(0, newDocLength - 1));
            editor.moveCursorTo(targetRow, cursor.column);
            editor.clearSelection();
            editor.session.setScrollTop(scrollTop);
        }
    },

    /**
     * Core Sanitization Engine:
     * Applies the 7 fundamental text cleaning rules while preserving native line endings (\r\n vs \n).
     *
     * @param {string} text - Raw input text
     * @param {boolean} isSelection - Scope flag (true for selection, false for full document)
     * @param {Object} [options] - Optional processing configuration ({ markdown: boolean })
     * @returns {Object} - Object containing { cleanedText, totalChanges }
     */
    sanitizeText: function(text, isSelection, options) {
        // Detect native line separator (CRLF vs LF)
        const eol = text.includes('\r\n') ? '\r\n' : '\n';
        const lines = text.split(/\r?\n/);

        let emptyListItemsCount = 0;
        let trailingTrimmedCount = 0;
        let whiteLinesCleanedCount = 0;
        let doubleSpacesCount = 0;

        const isMarkdown = Boolean(options && options.markdown);
        let inFence = false;

        // RULE 7 (Markdown), 1, 2, & 6: Line-by-line processing
        const processedLines = lines.map(line => {
            let tempLine = line;

            // Code fence tracking (``` or ~~~) for Markdown document protection
            const trimmedStart = tempLine.trimStart();
            if (trimmedStart.startsWith('```') || trimmedStart.startsWith('~~~')) {
                inFence = !inFence;
            }

            // Rule 7: Empty list items (Markdown only, outside fenced code blocks)
            // Evaluated on original line before Rule 1 trailing space trimming
            let isEmptyListItem = false;
            if (isMarkdown && !inFence) {
                if (/^[ \t]*(?:[-*+]|\d{1,9}[.)])[ \t]+$/.test(tempLine)) {
                    tempLine = '';
                    emptyListItemsCount++;
                    isEmptyListItem = true;
                }
            }

            // Rule 1: Trim trailing spaces and tabs
            if (/[ \t]+$/.test(tempLine)) {
                tempLine = tempLine.replace(/[ \t]+$/, '');
                trailingTrimmedCount++;
            }

            // Rule 2: White lines (containing spaces/tabs only) -> empty lines
            // (not counted again for a line already emptied by rule 7)
            if (!isEmptyListItem && line.length > 0 && tempLine.trim() === '') {
                whiteLinesCleanedCount++;
                tempLine = '';
            }

            // Rule 6: Remove double/multiple spaces inside text body while preserving indentation (SELECTION ONLY)
            // To protect ASCII diagrams, Markdown tables, and CSS/code alignments, internal multiple spaces
            // are only compressed when processing an explicit user selection (`isSelection === true`).
            // Full document sanitization (manual or auto-cleanup on save/open) skips this rule.
            if (isSelection && tempLine.length > 0) {
                const indentMatch = tempLine.match(/^([ \t]*)(.*)$/);
                if (indentMatch) {
                    const indent = indentMatch[1];
                    const content = indentMatch[2];
                    if (/ {2,}/.test(content)) {
                        const replacedContent = content.replace(/ {2,}/g, ' ');
                        const matches = content.match(/ {2,}/g);
                        if (matches) {
                            doubleSpacesCount += matches.length;
                        }
                        tempLine = indent + replacedContent;
                    }
                }
            }

            return tempLine;
        });

        // RULE 4: Remove leading blank lines
        let leadingBlankRemovedCount = 0;
        while (processedLines.length > 0 && processedLines[0] === '') {
            processedLines.shift();
            leadingBlankRemovedCount++;
        }

        // RULE 3: Merge consecutive blank lines into a single blank line
        const mergedLines = [];
        let mergedBlankCount = 0;
        let prevWasBlank = false;

        for (let i = 0; i < processedLines.length; i++) {
            const isBlank = (processedLines[i] === '');
            if (isBlank) {
                if (!prevWasBlank) {
                    mergedLines.push('');
                    prevWasBlank = true;
                } else {
                    mergedBlankCount++;
                }
            } else {
                mergedLines.push(processedLines[i]);
                prevWasBlank = false;
            }
        }

        // RULE 5: Normalize document end with POSIX/Git compliant single trailing newline
        while (mergedLines.length > 0 && mergedLines[mergedLines.length - 1] === '') {
            mergedLines.pop();
        }

        let cleanedText = mergedLines.join(eol);

        if (!isSelection) {
            if (cleanedText.length > 0) {
                cleanedText += eol;
            }
        } else if (text.endsWith('\n') && !cleanedText.endsWith(eol)) {
            cleanedText += eol;
        }

        const totalChanges = emptyListItemsCount + trailingTrimmedCount + whiteLinesCleanedCount + doubleSpacesCount + leadingBlankRemovedCount + mergedBlankCount;

        return {
            cleanedText: cleanedText,
            totalChanges: totalChanges
        };
    }
});
