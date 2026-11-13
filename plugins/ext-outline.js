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
 * Famouskai Editor - Outline & Navigation Manager
 */
window.FamousPluginCore = window.FamousPluginCore || {};

window.FamousPluginCore.Outline = {
    items: [],
    isSortedAZ: false,
    filterTerm: "",
    activeMarkFilter: "all",
    isReorderMode: false,
    draggedItemIndex: null,

    resetFilter: function() {
        // Clears the outline filter state so a newly opened file is never
        // hidden behind a search term left over from the previous file.
        this.filterTerm = "";
        this.activeMarkFilter = "all";
    
        const searchInput = document.getElementById('outline-search');
        const clearBtn = document.getElementById('outline-search-clear');
    
        if (searchInput) searchInput.value = "";
        if (clearBtn) clearBtn.style.display = "none";

        document.querySelectorAll('#outline-mark-filters .fold-btn').forEach(btn => {
            btn.classList.toggle('active-filter', btn.dataset.markFilter === 'all');
        });
    },

    editorInstance: null,
    
    init: function() {
        // Bind UI events
        const searchInput = document.getElementById('outline-search');
        const clearBtn = document.getElementById('outline-search-clear');

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterTerm = e.target.value.toLowerCase();
                if (clearBtn) {
                    clearBtn.style.display = this.filterTerm ? "block" : "none";
                }
                this.render();
            });
        }

        if (clearBtn && searchInput) {
            clearBtn.addEventListener('click', () => {
                searchInput.value = "";
                this.filterTerm = "";
                clearBtn.style.display = "none";
                this.render();
                searchInput.focus();
            });
        }

        const sortBtn = document.getElementById('btn-outline-sort');
        if (sortBtn) {
            sortBtn.addEventListener('click', (e) => {
                this.isSortedAZ = !this.isSortedAZ;
                e.target.classList.toggle('active-filter', this.isSortedAZ);
                this.render();
            });
        }

        const reorderBtn = document.getElementById('btn-outline-reorder-mode');
        if (reorderBtn) {
            reorderBtn.addEventListener('click', (e) => {
                this.isReorderMode = !this.isReorderMode;
                e.target.classList.toggle('active-filter', this.isReorderMode);
                if (this.isReorderMode && this.isSortedAZ) {
                    this.isSortedAZ = false;
                    if (sortBtn) sortBtn.classList.remove('active-filter');
                }
                this.render();
            });
        }

        // Quick Famous Marks & Headings Filter Badges
        const markFilterContainer = document.getElementById('outline-mark-filters');
        if (markFilterContainer) {
            markFilterContainer.querySelectorAll('.fold-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const filter = e.target.dataset.markFilter;
                    this.activeMarkFilter = filter;
                    markFilterContainer.querySelectorAll('.fold-btn').forEach(b => b.classList.remove('active-filter'));
                    e.target.classList.add('active-filter');
                    this.render();
                });
            });
        }
        
        const copyBtn = document.getElementById('btn-outline-copy');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                const textToCopy = this.items.map(i => i.text).join('\n');
                navigator.clipboard.writeText(textToCopy).then(() => {
                    if (window.showToast) window.showToast("Outline copied!", "success");
                });
            });
        }
    },

    updateFilterButtons: function() {
        let filename = (typeof currentFileName !== 'undefined' && currentFileName) ? currentFileName : (window.currentFileName || '');
        let ext = filename ? filename.split('.').pop().toLowerCase() : '';
        if (!ext && this.editorInstance && this.editorInstance.container) {
            ext = (this.editorInstance.container.getAttribute('data-lang') || '').toLowerCase();
        }

        const btnXml = document.getElementById('btn-outline-filter-xml');
        const btnJs = document.getElementById('btn-outline-filter-js');

        const isXmlOrHtml = ['html', 'htm', 'xml', 'svg'].includes(ext);
        const isJsOrHtml = ['html', 'htm', 'js', 'mjs', 'cjs', 'ts', 'tsx'].includes(ext);

        if (btnXml) btnXml.style.display = isXmlOrHtml ? 'inline-block' : 'none';
        if (btnJs) btnJs.style.display = isJsOrHtml ? 'inline-block' : 'none';

        // Reorder is Markdown only: in HTML, JS or CSS an outline item has no clean block
        // (no closing tag or brace), so a move would break the code.
        const session = this.editorInstance && this.editorInstance.session;
        const canReorder = this.isReorderable(filename, session && session.$modeId);
        const reorderBtn = document.getElementById('btn-outline-reorder-mode');
        if (reorderBtn) reorderBtn.style.display = canReorder ? '' : 'none';
        if (!canReorder && this.isReorderMode) {
            this.isReorderMode = false;
            if (reorderBtn) reorderBtn.classList.remove('active-filter');
        }

        if (this.activeMarkFilter === '</>' && !isXmlOrHtml) {
            this.resetFilter();
        }
        if ((this.activeMarkFilter === 'js' || this.activeMarkFilter === 'JS') && !isJsOrHtml) {
            this.resetFilter();
        }
    },

    /**
     * Whether Reorder mode is offered for the current document.
     * Only Markdown has a clean block (a heading owns its section). A saved file is judged
     * by its extension; an unsaved file without a name by its detected Ace mode.
     *
     * @param {string} filename - current file name, empty for an unsaved new file
     * @param {string} [modeId] - Ace mode id of the session, e.g. 'ace/mode/markdown'
     * @returns {boolean}
     */
    isReorderable: function(filename, modeId) {
        if (filename) {
            const ext = filename.includes('.') ? filename.split('.').pop().toLowerCase() : '';
            return ext === 'md' || ext === 'markdown';
        }
        return modeId === 'ace/mode/markdown';
    },

    /**
     * Whether an outline item is listed (and draggable) in Reorder mode.
     * Reorder is a Markdown heading reorder: Famous Mark, TODO and @ lines are not
     * listed, they move with the heading that owns them (see sectionRange).
     *
     * @param {{type: string}} item - outline item
     * @returns {boolean}
     */
    isReorderItem: function(item) {
        return !!item && item.type === 'md';
    },

    update: function(editor) {
        if (!editor) return;
        this.editorInstance = editor;

        const sidebar = document.getElementById("sidebar-left");
        if (sidebar && sidebar.style.display === "none") return;

        this.updateFilterButtons();

        this.items = [];
        const lines = editor.session.getDocument().getAllLines();

        // Standard Document Regexes
        const regexMD = /^(#{1,6})\s+(.*)$/;
        const regexXML = /^\s*<([a-zA-Z0-9_-]+)/;
        const regexJSFunc = /^\s*(?:export\s+)?(?:async\s+)?function\s+([a-zA-Z0-9_]+)/;
        const regexJSClass = /^\s*(?:export\s+)?class\s+([a-zA-Z0-9_]+)/;
        const regexJSArrow = /^\s*(?:(?:const|let|var)\s+)?([a-zA-Z0-9_-]+)\s*[:=]\s*(?:async\s+)?(?:\([^)]*\)|[a-zA-Z0-9_]+)?\s*=>/;
        const regexJSObjMethod = /^\s*([a-zA-Z0-9_]+)\s*:\s*(?:async\s+)?function\s*\(/;

        // Semantic Bookmarks Regexes
        const regexTODO = /^(?:\s*\/\/\s*|\s*<!--\s*)(TODO|@)(.*)(?:-->)?/i;
        
        // Universal Famous Marks: "Famous arrow" (U+FE65), "Magic dot" (U+2022), "Flying bubble" (U+00B0)
        // Read from the single source of truth (ext-famous-core.js) instead of a local
        // literal, so Outline bookmarking and ACE folding can never drift apart again.
        // Defensive fallback preserved verbatim in case ext-famous-core.js failed to load.
        const regexFamous = (window.FamousPluginCore && window.FamousPluginCore.FamousMark)
            ? window.FamousPluginCore.FamousMark.regex
            : /^\s*[/<*!\-#%;]*\s*[﹥•°]\s*(.*?)\s*(?:-->|\*\/)?\s/;

        const famousChars = (window.FamousPluginCore && window.FamousPluginCore.FamousMark && window.FamousPluginCore.FamousMark.CHAR_CLASS)
            ? window.FamousPluginCore.FamousMark.CHAR_CLASS
            : '﹥•°';
            
        const ignoredTags = [
            'div', 'span', 'p', 'a', 'button', 'main', 'meta', 'title',
            'ul', 'li', 'nav', 'header', 'footer', 'br', 'hr', 'img',
            'link', 'input', 'label', 'form', 'svg', 'path', 'iframe',
            'table', 'tr', 'td', 'th', 'tbody', 'thead', 'style', 'dialog',
            'h1', 'h2', 'h3', 'h4', 'h5', 'textarea', 'option', 'select',
            'em', 'strong', 'datalist'
        ];

        let inCodeBlock = false;
        let consecutiveScriptSrc = false;

        lines.forEach((line, index) => {
            if (line.trim().startsWith("```")) { inCodeBlock = !inCodeBlock; return; }
            if (inCodeBlock) return;
            if (line.match(/^\s*<\//)) { consecutiveScriptSrc = false; return; }

            // 1. Process Custom Famous Marks FIRST (Universal override)
            const matchFamous = line.match(regexFamous);
            if (matchFamous) {
                const markChar = line.split('').find(ch => famousChars.includes(ch)) || '';
                this.items.push({
                    type: 'famous', 
                    mark: markChar,
                    text: matchFamous[1], 
                    line: index
                });
                consecutiveScriptSrc = false;
                return;
            }

            // 2. Process Standard Semantic Bookmarks (TODO / @)
            const matchTODO = line.match(regexTODO);
            if (matchTODO) {
                const isTodo = matchTODO[1].toUpperCase() === 'TODO';
                this.items.push({
                    type: isTodo ? 'todo' : 'at-mark', 
                    text: `${matchTODO[1]}${matchTODO[2]}`, 
                    line: index
                });
                consecutiveScriptSrc = false;
                return;
            }

            // 3. Process Standard Code Structure
            const matchMD = line.match(regexMD);
            const matchXML = line.match(regexXML);
            const matchJSFunc = line.match(regexJSFunc);
            const matchJSClass = line.match(regexJSClass);
            const matchJSArrow = line.match(regexJSArrow);
            const matchJSObjMethod = line.match(regexJSObjMethod);

            if (matchXML) {
                const tagName = matchXML[1].toLowerCase();
                if (ignoredTags.includes(tagName)) return;
                
                if (tagName === 'script' && line.includes('src=')) {
                    if (consecutiveScriptSrc) return;
                    consecutiveScriptSrc = true;
                } else {
                    consecutiveScriptSrc = false;
                }
            } else {
                consecutiveScriptSrc = false;
            }

            if (matchMD || matchXML || matchJSFunc || matchJSClass || matchJSArrow || matchJSObjMethod) {
                let itemData = { type: 'standard', line: index, text: '' };

                if (matchMD) {
                    itemData.level = matchMD[1].length;
                    itemData.type = 'md';
                    itemData.text = matchMD[2];
                } else if (matchXML) {
                    itemData.type = 'xml';
                    itemData.text = "<" + matchXML[1] + ">";
                } else {
                    const name = (matchJSFunc || matchJSClass || matchJSArrow || matchJSObjMethod)[1];
                    itemData.type = 'js';
                    itemData.text = matchJSClass ? `class ${name}` : `${name}()`;
                }
                this.items.push(itemData);
            }
        });

        this.render();
    },

    matchesMarkFilter: function(item, filter) {
        if (!filter || filter === "all") return true;
        if (filter === "﹥" || filter === "•" || filter === "°") {
            return item.type === 'famous' && item.mark === filter;
        }
        if (filter === "TODO") return item.type === 'todo';
        if (filter === "@") return item.type === 'at-mark';
        if (filter === "</>" || filter === "xml") return item.type === 'xml';
        if (filter === "js" || filter === "JS") return item.type === 'js';
        return true;
    },

    render: function() {
        const tocList = document.getElementById("toc-list");
        if (!tocList) return;
        
        tocList.innerHTML = "";
        const editor = this.editorInstance;
        if (!editor) return;

        // Force l'affichage de la section globale de l'Outline (pour les nouveaux fichiers vides)
        const outlineSection = document.getElementById("outline-section");
        if (outlineSection) outlineSection.style.display = "block";

        // 1. Ajout de [top] (toujours visible)
        const divTop = document.createElement("div");
        divTop.classList.add("toc-item", "toc-item-end"); // Réutilise le style sémantique "end"
        divTop.textContent = "[top]";
        divTop.onclick = () => {
            editor.gotoLine(1, 0, true);
            editor.focus();
        };
        tocList.appendChild(divTop);

        // 2. Génération de la liste
        let displayItems = this.items.map((item, originalIdx) => Object.assign({}, item, { originalIdx }));
        if (this.isSortedAZ) {
            displayItems.sort((a, b) => a.text.localeCompare(b.text));
        }

        let visibleCount = 0;
        displayItems.forEach((item) => {
            // Text search filter
            if (this.filterTerm && !item.text.toLowerCase().includes(this.filterTerm)) {
                return;
            }

            // Reorder mode moves Markdown headings only (their ﹥ • ° and TODO lines move with
            // them), so it lists headings only; otherwise the badge filter applies.
            if (this.isReorderMode) {
                if (!this.isReorderItem(item)) return;
            } else if (!this.matchesMarkFilter(item, this.activeMarkFilter)) {
                return;
            }

            visibleCount++;
            const div = document.createElement("div");
            div.classList.add("toc-item");
            div.textContent = (this.isReorderMode ? "⋮⋮ " : "") + item.text;

            if (item.type === 'md') {
                div.classList.add("toc-item-md");
                div.style.paddingLeft = (this.isSortedAZ || this.isReorderMode) ? "4px" : ((item.level - 1) * 12) + "px";
            } else if (item.type === 'xml') {
                div.classList.add("toc-item-xml");
            } else if (item.type === 'js') {
                div.classList.add("toc-item-js");
            } else if (item.type === 'todo') {
                div.classList.add("toc-item-todo");
            } else if (item.type === 'at-mark') {
                div.classList.add("toc-item-at");
            } else if (item.type === 'famous') {
                div.classList.add("toc-item-famous");
            }

            // Drag & Drop Reordering Mode
            if (this.isReorderMode) {
                div.draggable = true;
                div.style.cursor = "grab";
                div.title = "Drag to reorder section";

                div.addEventListener('dragstart', (e) => {
                    this.draggedItemIndex = item.originalIdx;
                    e.dataTransfer.effectAllowed = 'move';
                    div.classList.add('is-dragging');
                });

                div.addEventListener('dragend', () => {
                    div.classList.remove('is-dragging');
                    this.draggedItemIndex = null;
                });

                div.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                    div.classList.add('drag-over');
                });

                div.addEventListener('dragleave', () => {
                    div.classList.remove('drag-over');
                });

                div.addEventListener('drop', (e) => {
                    e.preventDefault();
                    div.classList.remove('drag-over');
                    if (this.draggedItemIndex !== null && this.draggedItemIndex !== item.originalIdx) {
                        this.reorderSection(this.draggedItemIndex, item.originalIdx);
                    }
                });
            } else {
                div.onclick = () => {
                    editor.session.unfold(item.line);
                    editor.gotoLine(item.line + 1, 0, true);
                    editor.scrollToLine(item.line, true, true, function () {});
                    editor.focus();
                };
            }

            tocList.appendChild(div);
        });

        // Feedback UX optionnel si filtre actif mais sans résultats
        if (visibleCount === 0 && this.items.length > 0) {
            const emptyMsg = document.createElement("div");
            emptyMsg.className = "workspace-empty-msg";
            emptyMsg.textContent = "No results found";
            tocList.appendChild(emptyMsg);
        }

        // 3. Ajout de [happy end] (toujours visible)
        const divEnd = document.createElement("div");
        divEnd.classList.add("toc-item", "toc-item-end");
        divEnd.textContent = "[happy end]";
        divEnd.onclick = () => {
            editor.gotoLine(editor.session.getLength(), 0, true);
            editor.focus();
        };
        tocList.appendChild(divEnd);
    },

    foldToLevel: function(targetLevel, editor) {
        if (!editor) return;
        editor.session.unfold();
        const lines = editor.session.getDocument().getAllLines();
        const regex = /^(#{1,6})\s+(.*)$/;

        for (let i = lines.length - 1; i >= 0; i--) {
            const match = lines[i].match(regex);
            if (match && match[1].length === targetLevel) {
                const widget = editor.session.getFoldWidget(i);
                if (widget === "start") {
                    const range = editor.session.getFoldWidgetRange(i);
                    if (range) editor.session.addFold("...", range);
                }
            }
        }
    },

    /**
     * Lines of the section that starts at items[idx].
     * A Markdown heading of level L owns everything down to the next heading of level L or
     * higher (its sub-headings, Famous Mark lines, TODOs and plain text move with it).
     * Any other item owns the lines down to the next outline item.
     *
     * @param {Array<{type: string, line: number, level?: number}>} items - outline items, in line order
     * @param {number} idx - index of the section's first item
     * @param {number} totalLines - number of lines in the document
     * @returns {{start: number, end: number}} first and last line (inclusive)
     */
    sectionRange: function(items, idx, totalLines) {
        const item = items[idx];
        let end = totalLines - 1;
        for (let i = idx + 1; i < items.length; i++) {
            const next = items[i];
            if (item.type === 'md') {
                if (next.type === 'md' && next.level <= item.level) { end = next.line - 1; break; }
            } else {
                end = next.line - 1;
                break;
            }
        }
        return { start: item.line, end: end };
    },

    reorderSection: function(fromIdx, toIdx) {
        const editor = this.editorInstance;
        if (!editor || !this.items || this.items.length === 0) return;
        if (fromIdx < 0 || fromIdx >= this.items.length || toIdx < 0 || toIdx >= this.items.length) return;

        const doc = editor.session.getDocument();
        const allLines = doc.getAllLines();

        const fromItem = this.items[fromIdx];
        const toItem = this.items[toIdx];

        const range = this.sectionRange(this.items, fromIdx, allLines.length);
        const startA = range.start;
        const endA = range.end;

        const startB = toItem.line;

        // Dropping a section inside itself (on one of its own sub-headings or marks) changes nothing
        if (startB >= startA && startB <= endA + 1) return;

        // Extract section A
        const sectionALines = allLines.slice(startA, endA + 1);

        // Remove section A
        const modifiedLines = [...allLines];
        modifiedLines.splice(startA, sectionALines.length);

        // Compute insertion line in modified array
        let targetLine = startB;
        if (startB > startA) {
            targetLine = startB - sectionALines.length;
        }

        // Insert section A
        modifiedLines.splice(targetLine, 0, ...sectionALines);

        // Replace the whole text in one edit: Ctrl+Z undoes the move in one step
        const lastRow = allLines.length - 1;
        const AceRange = (window.ace && window.ace.require) ? window.ace.require('ace/range').Range : null;
        const fullRange = AceRange
            ? new AceRange(0, 0, lastRow, allLines[lastRow].length)
            : { start: { row: 0, column: 0 }, end: { row: lastRow, column: allLines[lastRow].length } };
        editor.session.replace(fullRange, modifiedLines.join(doc.getNewLineCharacter ? doc.getNewLineCharacter() : '\n'));

        if (window.showToast) {
            window.showToast("Section reordered!", "success");
        }

        // Re-update outline
        this.update(editor);
    },

    isLineInFence: function(allLines, row) {
        if (!allLines || row <= 0) return false;
        let inFence = false;
        const max = Math.min(row, allLines.length);
        for (let i = 0; i < max; i++) {
            const trimmed = allLines[i].trim();
            if (trimmed.startsWith("```") || trimmed.startsWith("~~~")) {
                inFence = !inFence;
            }
        }
        return inFence;
    },

    shiftHeadingLines: function(lines, delta, startsInFence = false) {
        if (!Array.isArray(lines)) return { lines: [], changed: 0 };
        let inFence = !!startsInFence;
        let changed = 0;
        const regexHeading = /^(#{1,6})([ \t]+|$)/;

        const resultLines = lines.map(line => {
            const trimmed = line.trim();
            if (trimmed.startsWith("```") || trimmed.startsWith("~~~")) {
                inFence = !inFence;
                return line;
            }
            if (inFence) {
                return line;
            }

            const match = line.match(regexHeading);
            if (!match) {
                return line;
            }

            const hashes = match[1];
            const rest = line.slice(hashes.length);
            const level = hashes.length;

            if (delta === 1) {
                if (level >= 1 && level <= 5) {
                    changed++;
                    return '#' + line;
                }
            } else if (delta === -1) {
                if (level >= 2 && level <= 6) {
                    changed++;
                    return line.slice(1);
                }
            }
            return line;
        });

        return { lines: resultLines, changed };
    },

    shiftHeadings: function(editor, delta) {
        if (!editor || !editor.session) return;
        const selectionRange = editor.getSelectionRange();
        const doc = editor.session.getDocument();
        const allLines = doc.getAllLines();

        let startRow = selectionRange.start.row;
        let endRow = selectionRange.end.row;

        if (selectionRange.isEmpty()) {
            const cursor = editor.getCursorPosition();
            startRow = cursor.row;
            endRow = cursor.row;
        } else {
            if (selectionRange.end.column === 0 && endRow > startRow) {
                endRow--;
            }
        }

        const targetLines = allLines.slice(startRow, endRow + 1);
        const startsInFence = this.isLineInFence(allLines, startRow);
        const { lines: shiftedLines, changed } = this.shiftHeadingLines(targetLines, delta, startsInFence);

        if (changed > 0) {
            const Range = (window.ace && window.ace.require) ? window.ace.require('ace/range').Range : null;
            const lastLineLen = doc.getLine(endRow).length;
            const replaceRange = Range
                ? new Range(startRow, 0, endRow, lastLineLen)
                : { start: { row: startRow, column: 0 }, end: { row: endRow, column: lastLineLen } };

            editor.session.replace(replaceRange, shiftedLines.join('\n'));

            const newLastLineLen = shiftedLines[shiftedLines.length - 1].length;
            editor.selection.setRange({
                start: { row: startRow, column: 0 },
                end: { row: endRow, column: newLastLineLen }
            });
        }

        const toast = (typeof window.showToast === 'function')
            ? window.showToast
            : (window.FamousPluginCore && typeof window.FamousPluginCore.showToast === 'function' ? window.FamousPluginCore.showToast : null);

        if (toast) {
            if (changed === 0) {
                toast("No heading changed", "info");
            } else {
                const direction = delta > 0 ? "down" : "up";
                const headingWord = changed === 1 ? "heading" : "headings";
                toast(`${changed} ${headingWord} moved ${direction}`);
            }
        }
    }
};