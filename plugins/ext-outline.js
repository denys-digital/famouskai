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
        // Reorder mode is transient (one move, then done): a new file starts without it.
        this.leaveReorderMode();
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

    /**
     * Name of the file in the editor, empty for an unsaved new file.
     * @returns {string}
     */
    currentFilename: function() {
        return (typeof currentFileName !== 'undefined' && currentFileName) ? currentFileName : (window.currentFileName || '');
    },

    updateFilterButtons: function() {
        let filename = this.currentFilename();
        let ext = filename ? filename.split('.').pop().toLowerCase() : '';
        if (!ext && this.editorInstance && this.editorInstance.container) {
            ext = (this.editorInstance.container.getAttribute('data-lang') || '').toLowerCase();
        }

        const btnXml = document.getElementById('btn-outline-filter-xml');
        const btnJs = document.getElementById('btn-outline-filter-js');
        const btnPy = document.getElementById('btn-outline-filter-py');
        const btnYml = document.getElementById('btn-outline-filter-yml');
        const btnCss = document.getElementById('btn-outline-filter-css');

        const isXmlOrHtml = ['html', 'htm', 'xml', 'svg'].includes(ext);
        const isJsOrHtml = ['html', 'htm', 'js', 'mjs', 'cjs', 'ts', 'tsx'].includes(ext);

        if (btnXml) btnXml.style.display = isXmlOrHtml ? 'inline-block' : 'none';
        if (btnJs) btnJs.style.display = isJsOrHtml ? 'inline-block' : 'none';
        const isPy = ext === 'py' || (!ext && this.editorInstance && this.editorInstance.session && this.editorInstance.session.$modeId === 'ace/mode/python');
        if (btnPy) btnPy.style.display = isPy ? 'inline-block' : 'none';
        const isYml = ext === 'yml' || ext === 'yaml' || (!ext && this.editorInstance && this.editorInstance.session && this.editorInstance.session.$modeId === 'ace/mode/yaml');
        if (btnYml) btnYml.style.display = isYml ? 'inline-block' : 'none';
        const isCss = ext === 'css' || (!ext && this.editorInstance && this.editorInstance.session && this.editorInstance.session.$modeId === 'ace/mode/css');
        if (btnCss) btnCss.style.display = isCss ? 'inline-block' : 'none';

        // Markdown: '#' badge (headings only) shown, '•' badge hidden ('•' is a plain bullet
        // there). The file type comes from FamousMark.profile.
        const session0 = this.editorInstance && this.editorInstance.session;
        const fileProfile = this.fileProfile(filename, session0 && session0.$modeId);
        const isMarkdown = fileProfile === 'markdown';
        const hasMarks = fileProfile !== 'none';
        const btnMd = document.getElementById('btn-outline-filter-md');
        const btnDot = document.getElementById('btn-outline-filter-dot');
        // A file with no comment syntax (JSON, CSV, log) has no marks: no mark badges (matrix section 2).
        document.querySelectorAll('#outline-mark-filters .fold-btn[data-mark-group="marks"]').forEach(btn => {
            btn.style.display = hasMarks ? '' : 'none';
        });
        if (btnMd) btnMd.style.display = isMarkdown ? 'inline-block' : 'none';
        if (btnDot) btnDot.style.display = (isMarkdown || !hasMarks) ? 'none' : 'inline-block';

        // Reorder moves sections: # headings in Markdown, • sections in code and plain text.
        // Files with no comment syntax have none. Whether the file holds sections at all is
        // checked once the items are read (updateHeadingTools).
        const session = this.editorInstance && this.editorInstance.session;
        this.setReorderOffered(this.isReorderable(filename, session && session.$modeId));

        if (this.activeMarkFilter === '</>' && !isXmlOrHtml) {
            this.resetFilter();
        }
        if ((this.activeMarkFilter === 'js' || this.activeMarkFilter === 'JS') && !isJsOrHtml) {
            this.resetFilter();
        }
        if (this.activeMarkFilter === 'py' && !isPy) {
            this.resetFilter();
        }
        if (this.activeMarkFilter === 'yml' && !isYml) {
            this.resetFilter();
        }
        if (this.activeMarkFilter === 'css' && !isCss) {
            this.resetFilter();
        }
        if ((this.activeMarkFilter === '#' && !isMarkdown) || (this.activeMarkFilter === '•' && isMarkdown)
            || (!hasMarks && this.activeMarkFilter !== 'all')) {
            this.resetFilter();
        }
    },

    /**
     * The file's Famous Mark profile, read from the single source of truth
     * (FamousMark.profile in ext-famous-core.js). Falls back to 'plain' if that file failed to load.
     *
     * @param {string} filename - current file name, empty for an unsaved new file
     * @param {string} [modeId] - Ace mode id of the session
     * @returns {string} 'markdown', 'commented', 'plain' or 'none'
     */
    fileProfile: function(filename, modeId) {
        const FM = window.FamousPluginCore && window.FamousPluginCore.FamousMark;
        return (FM && typeof FM.profile === 'function') ? FM.profile(filename, modeId) : 'plain';
    },

    /**
     * Sets item.depth on every outline item: the indent step of the tree.
     * A section (an item with a numeric level: Markdown heading, • line, JSON key) of level N
     * has depth N - 1. Every other item (Famous Mark, TODO, @,
     * code symbol) is a leaf of the section that holds it: under a heading of level N it has
     * depth N (one step to the right of that heading); before the first heading, depth 0.
     *
     * @param {Array<{type: string, level?: number}>} items - outline items, in line order
     * @returns {Array} the same array, each item with a numeric depth
     */
    assignDepths: function(items) {
        let sectionLevel = 0;
        (items || []).forEach(item => {
            if (typeof item.level === 'number') {
                sectionLevel = item.level;
                item.depth = item.level - 1;
            } else {
                // A nested code symbol (Python method, YAML child key) sits one step right per level
                item.depth = sectionLevel + (item.subDepth || 0);
            }
        });
        return items;
    },

    /**
     * Shows or hides the Reorder button; hiding it also leaves Reorder mode.
     * @param {boolean} offered
     */
    setReorderOffered: function(offered) {
        const reorderBtn = document.getElementById('btn-outline-reorder-mode');
        if (reorderBtn) reorderBtn.style.display = offered ? '' : 'none';
        if (!offered) this.leaveReorderMode();
    },

    /**
     * Turns Reorder mode off and releases the button. Reorder is a transient state: it ends
     * when another file is opened (resetFilter) or the Outline tab is left (its onHide hook
     * in ext-sidebar.js). Re-renders the list only when the mode was on.
     */
    leaveReorderMode: function() {
        if (!this.isReorderMode) return;
        this.isReorderMode = false;
        this.draggedItemIndex = null;
        const reorderBtn = document.getElementById('btn-outline-reorder-mode');
        if (reorderBtn) reorderBtn.classList.remove('active-filter');
        if (this.editorInstance && typeof this.render === 'function') this.render();
    },

    /**
     * Whether Reorder mode is offered for the current document (matrix section 3.3).
     * A section owns a clean block: a # heading in Markdown, a • section in code and plain
     * text (the user decides where code blocks end by placing the marks). Files with no
     * comment syntax (JSON, CSV) have no sections. A saved file is judged by its extension,
     * an unsaved one by its Ace mode (FamousMark.profile).
     *
     * @param {string} filename - current file name, empty for an unsaved new file
     * @param {string} [modeId] - Ace mode id of the session, e.g. 'ace/mode/markdown'
     * @returns {boolean}
     */
    isReorderable: function(filename, modeId) {
        return this.fileProfile(filename, modeId) !== 'none';
    },

    /**
     * Whether an outline item is listed (and draggable) in Reorder mode: a section, i.e. a
     * Markdown heading or a • line. ﹥, °, TODO, @ lines and code symbols are not listed,
     * they move with the section that holds them (see sectionRange).
     *
     * @param {{type: string, level?: number}} item - outline item
     * @returns {boolean}
     */
    isReorderItem: function(item) {
        return !!item && (item.type === 'md' || (item.type === 'famous' && typeof item.level === 'number'));
    },

    update: function(editor) {
        if (!editor) return;
        this.editorInstance = editor;

        const sidebar = document.getElementById("sidebar-left");
        if (sidebar && sidebar.style.display === "none") return;

        this.updateFilterButtons();
        this.hookModeChange(editor);

        this.items = [];
        const lines = editor.session.getDocument().getAllLines();
        // Text the items were read from: Reorder refuses to move with items older than the text
        this.itemsText = lines.join('\n');
        const modeId = editor.session.$modeId;
        const profile = this.fileProfile(this.currentFilename(), modeId);
        this.profile = profile;

        // No comment syntax (JSON, CSV, log): no marks, no headings (matrix section 2).
        // JSON lists the keys of its first two object levels instead (section 3.1).
        if (profile === 'none') {
            const JO = window.FamousPluginCore && window.FamousPluginCore.JsonOutline;
            const isJson = /\.json$/i.test(this.currentFilename()) || (!this.currentFilename() && modeId === 'ace/mode/json');
            if (isJson && JO && typeof JO.outline === 'function') {
                this.items = JO.outline(lines.join('\n')).map(k => ({ type: 'json', level: k.level, text: k.text, line: k.line }));
            }
            this.assignDepths(this.items);
            this.updateHeadingTools(profile);
            this.render();
            return;
        }

        // In a code file a mark counts only inside a comment, as the syntax highlighter sees it.
        // If the highlighter is not loaded for this file type (text mode, mode not switched yet),
        // the plain rule applies: mark at the start of the line.
        const useTokens = profile === 'commented'
            && this.fileProfile('', modeId) === 'commented'
            && typeof editor.session.getTokens === 'function';

        // Standard Document Regexes
        const regexMD = /^(#{1,6})\s+(.*)$/;
        const regexXML = /^\s*<([a-zA-Z0-9_-]+)/;
        const regexJSFunc = /^\s*(?:export\s+)?(?:async\s+)?function\s+([a-zA-Z0-9_]+)/;
        const regexJSClass = /^\s*(?:export\s+)?class\s+([a-zA-Z0-9_]+)/;
        const regexJSArrow = /^\s*(?:(?:const|let|var)\s+)?([a-zA-Z0-9_-]+)\s*[:=]\s*(?:async\s+)?(?:\([^)]*\)|[a-zA-Z0-9_]+)?\s*=>/;
        const regexJSObjMethod = /^\s*([a-zA-Z0-9_]+)\s*:\s*(?:async\s+)?function\s*\(/;
        // Python: class, def and async def, nested up to 3 levels (class > method > inner function)
        const isPython = /\.py$/i.test(this.currentFilename()) || (!this.currentFilename() && modeId === 'ace/mode/python');
        const regexPySymbol = /^(\s*)(?:(class)\s+([a-zA-Z0-9_]+)|(?:async\s+)?def\s+([a-zA-Z0-9_]+)\s*\()/;
        const PY_MAX_DEPTH = 3;
        let pyIndents = []; // indents of the open class / def blocks
        // CSS: selectors and block at-rules, read once for the whole file (a rule can span lines)
        const isCss = /\.css$/i.test(this.currentFilename()) || (!this.currentFilename() && modeId === 'ace/mode/css');
        const cssByLine = new Map();
        if (isCss) this.cssSymbols(lines).forEach(sym => cssByLine.set(sym.line, sym));

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

        // YAML: the mapping keys of the first three levels, outside block scalars and list entries.
        const isYaml = /\.ya?ml$/i.test(this.currentFilename()) || (!this.currentFilename() && modeId === 'ace/mode/yaml');
        const regexYamlKey = /^(\s*)("[^"]*"|'[^']*'|[A-Za-z0-9_$][^:#]*?)\s*:(?:\s|$)/;
        const regexYamlBlockScalar = /:\s*[|>][-+0-9]*\s*(?:#.*)?$/;
        const YAML_MAX_DEPTH = 3;
        let yamlIndents = [];      // indents of the open parent keys
        let yamlScalarIndent = -1; // indent of the key that opened a | or > block, -1 = none

        lines.forEach((line, index) => {
            // Fenced code blocks hide marks and headings in Markdown only
            if (profile === 'markdown') {
                const fence = line.trim();
                if (fence.startsWith("```") || fence.startsWith("~~~")) { inCodeBlock = !inCodeBlock; return; }
                if (inCodeBlock) return;
            }
            if (line.match(/^\s*<\//)) { consecutiveScriptSrc = false; return; }

            // 1. Process Custom Famous Marks FIRST (Universal override)
            const mark = this.markOnLine(line, profile, useTokens ? editor.session.getTokens(index) : null);
            if (mark) {
                const famousItem = { type: 'famous', mark: mark.mark, text: mark.label, line: index };
                // A • line opens a section of level 1 to 4, like a # heading (matrix section 1)
                if (mark.kind === 'section') famousItem.level = mark.level;
                this.items.push(famousItem);
                consecutiveScriptSrc = false;
                return;
            }

            // 2. Process Standard Semantic Bookmarks (TODO / @)
            // In CSS a line starting with '@' is an at-rule (@media, @import), never an @ bookmark,
            // even before the highlighter is loaded
            const todo = (isCss && /^\s*@/.test(line)) ? null
                : this.todoOnLine(line, profile, useTokens ? editor.session.getTokens(index) : null);
            if (todo) {
                this.items.push({
                    type: todo.kind,
                    text: todo.text,
                    line: index
                });
                consecutiveScriptSrc = false;
                return;
            }

            // 3. Python symbols (Python files only; the code regexes below do not apply to Python)
            if (isPython) {
                if (line.trim() === '' || /^\s*#/.test(line)) return;
                const indent = line.match(/^\s*/)[0].length;
                // Any code line closes the blocks opened at its indent or deeper
                while (pyIndents.length && pyIndents[pyIndents.length - 1] >= indent) pyIndents.pop();
                const sym = line.match(regexPySymbol);
                if (!sym) return;
                const depth = pyIndents.length;
                pyIndents.push(indent);
                if (depth < PY_MAX_DEPTH) {
                    this.items.push({ type: 'py', line: index, subDepth: depth, text: sym[2] ? `class ${sym[3]}` : `${sym[4]}()` });
                }
                return;
            }

            // 3b. YAML keys (YAML files only; the code regexes below do not apply to YAML)
            if (isYaml) {
                if (/^(?:---|\.\.\.)\s*$/.test(line)) { yamlIndents = []; yamlScalarIndent = -1; return; }
                if (line.trim() === '' || /^\s*#/.test(line)) return;
                const indent = line.match(/^\s*/)[0].length;
                if (yamlScalarIndent >= 0) {
                    if (indent > yamlScalarIndent) return;
                    yamlScalarIndent = -1;
                }
                // A list entry ("- ...") is a parent level of its own: keys under it are deeper
                if (/^\s*-(?:\s|$)/.test(line)) {
                    while (yamlIndents.length && yamlIndents[yamlIndents.length - 1] >= indent) yamlIndents.pop();
                    yamlIndents.push(indent);
                    if (regexYamlBlockScalar.test(line)) yamlScalarIndent = indent;
                    return;
                }
                const key = line.match(regexYamlKey);
                if (!key) return;
                while (yamlIndents.length && yamlIndents[yamlIndents.length - 1] >= indent) yamlIndents.pop();
                const depth = yamlIndents.length;
                yamlIndents.push(indent);
                if (regexYamlBlockScalar.test(line)) yamlScalarIndent = indent;
                if (depth < YAML_MAX_DEPTH) {
                    this.items.push({ type: 'yaml', text: key[2].replace(/^["']|["']$/g, ''), line: index, subDepth: depth });
                }
                return;
            }

            // 4. CSS rules (CSS files only; the code regexes below do not apply to CSS)
            if (isCss) {
                const sym = cssByLine.get(index);
                if (sym) this.items.push({ type: 'css', line: index, subDepth: sym.subDepth, text: sym.text });
                return;
            }

            // 5. Process Standard Code Structure
            // '#' is a heading in Markdown only ('# comment' in YAML or Python is not one)
            const matchMD = profile === 'markdown' ? line.match(regexMD) : null;
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

        this.assignDepths(this.items);
        this.updateHeadingTools(profile);
        this.render();
    },

    /**
     * The CSS rules of a file, for the Outline: every selector (`main > .card`, `a, b`) and
     * every block at-rule (`@media ...`, `@font-face`, `@layer x`) that opens a `{` block,
     * nested up to 3 levels (`@media` > `.card` > `& button`). Comments and strings are
     * skipped, so a `{` inside them opens nothing. Statements ending with `;` (`@import`,
     * declarations) are not listed, nor the frames inside `@keyframes` (`from`, `50%`).
     * A rule that spans several lines (`a,` then `b {`) is listed on its first line.
     *
     * @param {Array<string>} lines - lines of the file
     * @returns {Array<{line: number, text: string, subDepth: number}>} rules in line order
     */
    cssSymbols: function(lines) {
        const CSS_MAX_DEPTH = 3;
        const MAX_TEXT = 60;
        const symbols = [];
        const stack = []; // open blocks: 'rule', or 'frames' for the inside of @keyframes
        let buf = '';
        let bufLine = 0;
        let inComment = false;
        let quote = '';
        (lines || []).forEach((line, index) => {
            for (let i = 0; i < line.length; i++) {
                const ch = line[i];
                if (inComment) {
                    if (ch === '*' && line[i + 1] === '/') { inComment = false; i++; }
                    continue;
                }
                if (quote) {
                    buf += ch;
                    if (ch === '\\') { buf += line[i + 1] || ''; i++; }
                    else if (ch === quote) quote = '';
                    continue;
                }
                if (ch === '/' && line[i + 1] === '*') { inComment = true; i++; continue; }
                if (ch === '{') {
                    const text = buf.replace(/\s+/g, ' ').trim();
                    const inFrames = stack.includes('frames');
                    if (text && !inFrames && stack.length < CSS_MAX_DEPTH) {
                        symbols.push({ line: bufLine, subDepth: stack.length, text: text.length > MAX_TEXT ? text.slice(0, MAX_TEXT - 3) + '...' : text });
                    }
                    stack.push(/^@(?:-[a-z]+-)?keyframes\b/i.test(text) ? 'frames' : 'rule');
                    buf = '';
                    continue;
                }
                if (ch === '}') { stack.pop(); buf = ''; continue; }
                if (ch === ';') { buf = ''; continue; }
                if (!buf && /\s/.test(ch)) continue;
                if (!buf) bufLine = index;
                buf += ch;
                if (ch === '\\') { buf += line[i + 1] || ''; i++; }
                else if (ch === '"' || ch === "'") quote = ch;
            }
            if (buf) buf += ' ';
        });
        return symbols;
    },

    /**
     * Shows the heading tools (+ H1-H4, -# +#) where they have something to act on:
     * Markdown files, and code or plain-text files that hold • sections (matrix section 3.4).
     *
     * @param {string} profile - FamousMark.profile of the current file
     */
    updateHeadingTools: function(profile) {
        const foldButtons = document.getElementById("markdown-fold-buttons");
        const hasDotSections = this.items.some(i => i.type === 'famous' && typeof i.level === 'number');
        if (foldButtons) foldButtons.style.display = (profile === 'markdown' || hasDotSections) ? "flex" : "none";
        // Outside Markdown, Reorder needs • sections to move
        if (profile !== 'markdown') this.setReorderOffered(profile !== 'none' && hasDotSections);
    },

    /**
     * The Famous Mark on one line, by its file-type rule.
     * - markdown: ﹥ or ° at the start of the line or right after '<!--'; • is a plain bullet.
     * - commented: the line's first non-blank token must be a comment token (Ace tokens).
     *   Without tokens (no highlighter), the plain rule applies.
     * - plain: a mark at the start of the line, after the tolerated comment prefixes.
     * - none: never a mark.
     *
     * @param {string} line - line text
     * @param {string} profile - FamousMark.profile result
     * @param {Array<{type: string, value: string}>|null} [tokens] - Ace tokens of the line (commented profile)
     * @returns {{kind: string, mark: string, level: number, label: string}|null}
     */
    markOnLine: function(line, profile, tokens) {
        const FM = window.FamousPluginCore && window.FamousPluginCore.FamousMark;
        if (!FM || typeof FM.parse !== 'function' || profile === 'none') return null;

        if (profile === 'markdown') {
            if (!/^\s*(?:<!--\s*)?[﹥°]/.test(line)) return null;
            const md = FM.parse(line);
            return (md && md.kind !== 'section') ? md : null;
        }

        if (profile === 'commented' && Array.isArray(tokens)) {
            const first = tokens.find(t => t.value && t.value.trim() !== '');
            if (!first || !/comment/.test(first.type)) return null;
        }
        return FM.parse(line);
    },

    /**
     * The TODO or @ bookmark on one line, by the same file-type rule as the Famous Marks:
     * - markdown: at the start of the line or right after '<!--' ('//' is not a comment in Markdown);
     * - commented: in a comment only (first non-blank Ace token is a comment), after its opener
     *   (// /* * <!-- # % ; --); without tokens, the plain rule applies;
     * - plain: at the start of the line, after the same optional openers;
     * - none: never.
     * TODO must be a whole word (TODO, TODO:, todo), not the start of 'TODOs'.
     *
     * @param {string} line - line text
     * @param {string} profile - FamousMark.profile result
     * @param {Array<{type: string, value: string}>|null} [tokens] - Ace tokens of the line (commented profile)
     * @returns {{kind: string, text: string}|null} kind 'todo' or 'at-mark', text as listed (e.g. 'TODO: x')
     */
    todoOnLine: function(line, profile, tokens) {
        if (profile === 'none' || typeof line !== 'string') return null;
        let m;
        if (profile === 'markdown') {
            m = line.match(/^\s*(?:<!--\s*)?(TODO\b|@)(.*?)\s*(?:-->)?\s*$/i);
        } else {
            if (profile === 'commented' && Array.isArray(tokens)) {
                const first = tokens.find(t => t.value && t.value.trim() !== '');
                if (!first || !/comment/.test(first.type)) return null;
            }
            m = line.match(/^\s*(?:\/\/+|\/\*+|\*|<!--|#+|%+|;+|--)?\s*(TODO\b|@)(.*?)\s*(?:-->|\*\/)?\s*$/i);
        }
        if (!m) return null;
        return { kind: m[1].toUpperCase() === 'TODO' ? 'todo' : 'at-mark', text: m[1] + m[2] };
    },

    /**
     * Re-reads the Outline when the editor's language mode changes. On file open the Outline
     * is read before the new mode is set (core-file.js), so the file-type rule needs a second pass.
     */
    hookModeChange: function(editor) {
        if (!editor || this._modeHookedOn === editor || typeof editor.on !== 'function') return;
        this._modeHookedOn = editor;
        editor.on('changeMode', () => this.update(editor));
    },

    /**
     * Text shown for an Outline item. A Famous Mark item shows its mark, so its meaning reads
     * at a glance: • •• ••• for a section level, ﹥ as a pointer, ° like the @ of a mention.
     * The label alone stays in item.text (search filter, Copy outline).
     *
     * @param {{type: string, text: string, mark?: string, level?: number}} item
     * @returns {string}
     */
    displayText: function(item) {
        if (!item || item.type !== 'famous' || !item.mark) return item ? item.text : '';
        const marks = typeof item.level === 'number' ? item.mark.repeat(item.level) : item.mark;
        return item.text ? marks + " " + item.text : marks;
    },

    matchesMarkFilter: function(item, filter) {
        if (!filter || filter === "all") return true;
        if (filter === "﹥" || filter === "•" || filter === "°") {
            return item.type === 'famous' && item.mark === filter;
        }
        if (filter === "#") return item.type === 'md';
        if (filter === "TODO") return item.type === 'todo';
        if (filter === "@") return item.type === 'at-mark';
        if (filter === "</>" || filter === "xml") return item.type === 'xml';
        if (filter === "js" || filter === "JS") return item.type === 'js';
        // A language filter: the code symbols of that language only, no marks
        if (filter === "py") return item.type === 'py';
        if (filter === "yml") return item.type === 'yaml';
        if (filter === "css") return item.type === 'css';
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
            this.syncPreview(0);
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

            // Reorder mode moves sections only (# headings, • sections); their ﹥ ° TODO lines and
            // code symbols move with them. Otherwise the badge filter applies.
            if (this.isReorderMode) {
                if (!this.isReorderItem(item)) return;
            } else if (!this.matchesMarkFilter(item, this.activeMarkFilter)) {
                return;
            }

            visibleCount++;
            const div = document.createElement("div");
            div.classList.add("toc-item");
            div.textContent = (this.isReorderMode ? "⋮⋮ " : "") + this.displayText(item);

            // Tree indent (assignDepths): a heading by padding, a leaf by margin so its
            // left border moves with it. A-Z sort and Reorder mode keep a flat list.
            const flat = this.isSortedAZ || this.isReorderMode;
            const indent = flat ? 0 : (item.depth || 0) * 12;
            if (item.type === 'md' || item.type === 'json') {
                div.style.paddingLeft = flat ? "4px" : indent + "px";
            } else if (indent > 0) {
                div.style.marginLeft = indent + "px";
            }

            if (item.type === 'md' || item.type === 'json') {
                div.classList.add("toc-item-md");
            } else if (item.type === 'xml') {
                div.classList.add("toc-item-xml");
            } else if (item.type === 'js' || item.type === 'py' || item.type === 'yaml' || item.type === 'css') {
                div.classList.add("toc-item-js");
            } else if (item.type === 'todo') {
                div.classList.add("toc-item-todo");
            } else if (item.type === 'at-mark') {
                div.classList.add("toc-item-at");
            } else if (item.type === 'famous') {
                div.classList.add("toc-item-famous");
                if (typeof item.level === 'number') div.classList.add("toc-item-section");
                else if (item.mark === '﹥') div.classList.add("toc-item-arrow");
                else if (item.mark === '°') div.classList.add("toc-item-note");
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
                    this.syncPreview(item.line);
                    editor.focus();
                };
            }

            tocList.appendChild(div);
        });

        // A file with no comment syntax and no key outline (CSV, log): say why the list is empty
        if (this.profile === 'none' && this.items.length === 0) {
            const noneMsg = document.createElement("div");
            noneMsg.className = "workspace-empty-msg";
            noneMsg.textContent = "No outline for this file type";
            tocList.appendChild(noneMsg);
        }

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
        // Reorder mode: dropping a section on [happy end] moves it to the end of the file
        if (this.isReorderMode) {
            divEnd.title = "Drop here to move a section to the end";
            divEnd.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                divEnd.classList.add('drag-over');
            });
            divEnd.addEventListener('dragleave', () => {
                divEnd.classList.remove('drag-over');
            });
            divEnd.addEventListener('drop', (e) => {
                e.preventDefault();
                divEnd.classList.remove('drag-over');
                if (this.draggedItemIndex !== null) {
                    this.reorderSection(this.draggedItemIndex, this.items.length);
                }
            });
        }
        divEnd.onclick = () => {
            editor.gotoLine(editor.session.getLength(), 0, true);
            this.syncPreview(editor.session.getLength() - 1);
            editor.focus();
        };
        tocList.appendChild(divEnd);
    },

    /**
     * A click on an Outline item also scrolls the open Markdown preview to that line
     * (scrollPreviewToLine, core-preview.js). No preview, or not Markdown: nothing happens.
     *
     * @param {number} line - 0-based editor line of the clicked item
     */
    syncPreview: function(line) {
        if (typeof scrollPreviewToLine === 'function') scrollPreviewToLine(line);
    },

    foldToLevel: function(targetLevel, editor) {
        if (!editor) return;
        editor.session.unfold();
        const lines = editor.session.getDocument().getAllLines();

        // Outside Markdown, H*n* folds every • section of level n and deeper (matrix section 3.4),
        // through the section fold mode (core-editor.js SectionFold).
        const profile = this.fileProfile(this.currentFilename(), editor.session.$modeId);
        const SF = window.FamousPluginCore && window.FamousPluginCore.SectionFold;
        if (profile !== 'markdown' && SF) {
            for (let i = lines.length - 1; i >= 0; i--) {
                const section = SF.sectionAt(editor.session, i);
                if (section && section.level >= targetLevel) {
                    const range = editor.session.getFoldWidgetRange(i);
                    if (range) editor.session.addFold("...", range);
                }
            }
            return;
        }

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
     * Lines of the section that starts at items[idx]: FamousMark.sectionRange, the one
     * section definition shared with folding (ext-famous-core.js).
     *
     * @param {Array<{type: string, line: number, level?: number}>} items - outline items, in line order
     * @param {number} idx - index of the section's first item
     * @param {number} totalLines - number of lines in the document
     * @returns {{start: number, end: number}} first and last line (inclusive)
     */
    sectionRange: function(items, idx, totalLines) {
        return window.FamousPluginCore.FamousMark.sectionRange(items, idx, totalLines);
    },

    reorderSection: function(fromIdx, toIdx) {
        const editor = this.editorInstance;
        if (!editor || !this.items || this.items.length === 0) return;
        if (fromIdx < 0 || fromIdx >= this.items.length || toIdx < 0 || toIdx > this.items.length) return;

        const doc = editor.session.getDocument();
        const allLines = doc.getAllLines();

        // The text changed since the Outline was read (an Undo, typing within the 800 ms
        // refresh delay): the item lines are stale, a move would cut the wrong lines.
        if (typeof this.itemsText === 'string' && allLines.join('\n') !== this.itemsText) {
            this.update(editor);
            if (window.showToast) window.showToast("Outline refreshed, drag again", "info");
            return;
        }

        const fromItem = this.items[fromIdx];

        const range = this.sectionRange(this.items, fromIdx, allLines.length);
        const startA = range.start;
        const endA = range.end;

        // toIdx === items.length: dropped on [happy end], the section goes to the end of the file
        const startB = toIdx === this.items.length ? allLines.length : this.items[toIdx].line;

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

    /**
     * Adds (delta 1) or removes (delta -1) one dot on the • section lines, levels 1 to 4
     * (the +# / -# buttons outside Markdown, matrix section 3.4).
     *
     * @param {string[]} lines - lines of the selection
     * @param {number} delta - 1 or -1
     * @param {function(number): boolean} [isSection] - whether line i is a • section in this
     *        file type (default: FamousMark.parse says so)
     * @returns {{lines: string[], changed: number}}
     */
    shiftDotLines: function(lines, delta, isSection) {
        if (!Array.isArray(lines)) return { lines: [], changed: 0 };
        const FM = window.FamousPluginCore && window.FamousPluginCore.FamousMark;
        let changed = 0;
        const resultLines = lines.map((line, i) => {
            const mark = FM ? FM.parse(line) : null;
            if (!mark || mark.kind !== 'section') return line;
            if (isSection && !isSection(i)) return line;
            const at = line.indexOf(mark.mark);
            if (delta === 1 && mark.level < 4) {
                changed++;
                return line.slice(0, at) + mark.mark + line.slice(at);
            }
            if (delta === -1 && mark.level > 1) {
                changed++;
                return line.slice(0, at) + line.slice(at + 1);
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
        const profile = this.fileProfile(this.currentFilename(), editor.session.$modeId);
        const SF = window.FamousPluginCore && window.FamousPluginCore.SectionFold;
        let result;
        if (profile === 'commented' || profile === 'plain') {
            // • lines get one dot more or less; the file-type rule decides which lines are sections
            result = this.shiftDotLines(targetLines, delta,
                SF ? (i => !!SF.sectionAt(editor.session, startRow + i)) : undefined);
        } else {
            result = this.shiftHeadingLines(targetLines, delta, this.isLineInFence(allLines, startRow));
        }
        const shiftedLines = result.lines;
        const changed = result.changed;

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