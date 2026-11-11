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
 * Famouskai Core - Keyboard Shortcuts, Link Handler & Search Box Patch
 *
 * What it holds:
 *   - Clickable internet links click and hover handlers
 *   - Autosave and outline refresh editor change listener
 *   - Toolbar button action listeners (New, Open, Save, Save as, Move, Reload)
 *   - Custom keyboard shortcuts (Ctrl+S, Ctrl+F, Ctrl+H, Ctrl+O, Ctrl+N, Ctrl+M, Ctrl+Shift+M, Tab magic snippets)
 *   - Mode auto-detection on paste into empty document
 *   - Search box match counter patch and DOM observer
 *
 * Globals used:
 *   - editor
 *   - isInitialLoad
 *   - isAutoSaveEnabled
 *   - fileHandle
 *   - isModified
 *   - autoSaveTimer
 *   - isPreviewOpen
 *   - previewTimer
 *   - currentFileName
 *   - saveFile
 *   - toggleSearch
 *   - openFile
 *   - newFile
 *   - saveAsFile
 *   - moveFile
 *   - reloadFile
 *   - updatePreviewContent
 *   - updateUI
 *   - window.FamousPluginCore
 *   - ace
 *
 * Globals defined:
 *   - checkAndPatchSearchBox
 *   - observer
 */

// ﹥ CLICKABLE INTERNET LINKS
if (editor) {
    editor.on("click", function(e) {
        // Bloque si la case n'est pas cochée
        if (!document.getElementById("toggle-links").checked) return;

        const pos = e.getDocumentPosition();
        const token = editor.session.getTokenAt(pos.row, pos.column);
        if (token && /http/.test(token.value)) {
            const match = token.value.match(/https?:\/\/[^\s)\]'"]+/);
            if (match) window.open(match[0], "_blank");
        }
    });

    editor.on("mousemove", function(e) {
        // Désactive le pointeur si la case n'est pas cochée
        if (!document.getElementById("toggle-links").checked) {
            editor.renderer.content.style.cursor = "text";
            return;
        }

        const pos = e.getDocumentPosition();
        const token = editor.session.getTokenAt(pos.row, pos.column);
        if (token && /http/.test(token.value)) {
            editor.renderer.content.style.cursor = "pointer";
        } else {
            editor.renderer.content.style.cursor = "text";
        }
    });
}

// ﹥ AUTOSAVE & OUTLINE REFRESH
if (editor) {
    editor.session.on('change', () => {
        clearTimeout(window.tocTimer);
        // Call the external module update
        if (window.FamousPluginCore && window.FamousPluginCore.Outline) {
            window.tocTimer = setTimeout(() => window.FamousPluginCore.Outline.update(editor), 800);
        }

        // Mobkai: no autosave on a phone (docs-lab/MOBKAI-SPEC.md 14.3)
        const isMobkaiMode = typeof window.isMobkai === 'function' && window.isMobkai();
        if (!isInitialLoad && isAutoSaveEnabled && fileHandle && !isMobkaiMode) {
            clearTimeout(autoSaveTimer);
            const isAutoCleanupOnSave = Boolean(
                window.FamousPluginCore?.Manager?.getToolSettings?.("Tidy & Sanitize Text")?.cleanup_on_save
            );
            const autoSaveDelay = isAutoCleanupOnSave ? 4500 : 1500;
            autoSaveTimer = setTimeout(() => {
                if (isModified) saveFile();
            }, autoSaveDelay);
        }

        if (isPreviewOpen) {
            clearTimeout(previewTimer);
            previewTimer = setTimeout(updatePreviewContent, 300);
        }
    });
}

document.getElementById("btn-new").addEventListener("click", newFile);
document.getElementById("btn-open").addEventListener("click", openFile);
document.getElementById("btn-save").addEventListener("click", saveFile);
document.getElementById("btn-save-as").addEventListener("click", saveAsFile);
document.getElementById("btn-move").addEventListener("click", () => moveFile());
document.getElementById("btn-reload").addEventListener("click", reloadFile);

window.addEventListener("keydown", (e) => {
    // Listen for Control key (Windows/ChromeOS) or Meta (Mac)
    if (e.ctrlKey || e.metaKey) {
        if (e.key === "s") { e.preventDefault();
            saveFile(); }
        if (e.key === "f" || e.key === "h") { e.preventDefault();
            toggleSearch(); }
        if (e.key === "o") { e.preventDefault();
            openFile(); }
        if (e.key === "n") { e.preventDefault();
            newFile(); }
    }
});

// Colorize new file after pasting (fast detection)
if (editor) {
    editor.on("paste", function(e) {
        if (currentFileName === "" || currentFileName === "[New]") {
            const text = e.text.trim();
            let newMode = "ace/mode/text"; // Fallback par défaut

            // 1. Diff/patch — signature quasi-infaillible, à tester en premier
            if (/^--- .+\n\+\+\+ .+/m.test(text) || /^@@ .+@@/m.test(text)) {
                newMode = 'ace/mode/diff';

            // 2. SVG — retiré de la branche HTML existante, testé avant elle
            } else if (/^\s*(<\?xml[^>]*>\s*)?<svg[\s>]/i.test(text)) {
                newMode = 'ace/mode/svg';

            // 3. HTML — inchangé, MOINS les tests <svg et <?xml (déplacés ci-dessus/dessous)
            } else if (text.startsWith('<html') || text.startsWith('<!DOCTYPE') || text.startsWith('<body') ||
                     text.startsWith('<script') || text.startsWith('<head') || text.startsWith('<style') ||
                     text.startsWith('<div')) {
                newMode = 'ace/mode/html';

            // 4. XML générique (ex: <?xml sans balise <svg>)
            } else if (text.startsWith('<?xml')) {
                newMode = 'ace/mode/xml';

            // YAML — tested before JS/CSS/Markdown so leading # comments, - key: value
            // lists, and flow mappings ({ key: val }) are not mistaken for Markdown or CSS.
            // Skip Markdown documents that begin with YAML front matter (--- ... --- + prose).
            } else if ((() => {
                const isYamlKey = (l) => {
                    const clean = l.replace(/(?:^|\s+)#.*$/, '').trimEnd();
                    return /^\s*(?:-\s+)?["']?[\w./-]+["']?\s*:(?:\s+.*|\s*)$/.test(clean) && !/[;{]$/.test(clean);
                };
                const fm = text.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n([\s\S]*)$/);
                if (fm) {
                    const bodyNonComment = fm[2].split(/\r?\n/).filter((l) => l.trim() && !/^\s*#/.test(l));
                    const isMdBody = bodyNonComment.length === 0 ? /^#{1,6}\s+\S/m.test(fm[2]) : !isYamlKey(bodyNonComment[0]);
                    if (isMdBody) return false;
                }
                const nonComment = text.split(/\r?\n/).filter((l) => l.trim() !== '' && !/^\s*#/.test(l));
                if (nonComment.length === 0) return false;
                const first = nonComment[0].trim();
                if (first === '---') return true;
                if (/^-\s+["']?[\w./-]+["']?\s*:\s+\S/.test(first)) return true;
                if (!isYamlKey(nonComment[0])) return false;
                const sample = nonComment.slice(0, 8);
                const keyCount = sample.filter(isYamlKey).length;
                const hasIndented = sample.slice(1).some((l) => /^\s{2,}(?:-\s+|\S)/.test(l));
                return keyCount >= 3 || (keyCount >= 2 && hasIndented) || (keyCount >= 1 && sample.some((l) => /^\s*-\s+\S/.test(l)));
            })()) {
                newMode = 'ace/mode/yaml';

            // JavaScript — mots-clés en limite de mot, testé en dernier recours
            } else if (/\b(function|const|let|var|=>)\b/.test(text)) {
                newMode = 'ace/mode/javascript';

            // JSON — sur la FORME, pas sur la validité stricte (tolère les fragments copiés)
            } else if (/["'][\w-]+["']\s*:\s*("|\[|\{|-?\d|true|false|null)/.test(text) && /[{}]/.test(text)) {
                newMode = 'ace/mode/json';

            // CSS — exige un vrai bloc "sélecteur { propriété: valeur }", pas juste un # isolé
            } else if (/[.#]?[\w-]+\s*\{[^{}]*:[^{}]*\}/.test(text)) {
                newMode = 'ace/mode/css';

            // Markdown — titre ancré en début de ligne avec espace obligatoire (plus de faux positif CSS)
            } else if (/^#{1,6}\s+\S/m.test(text) || /^[-*]\s+\S/m.test(text) || /^---\s*\r?\n[\s\S]*?\r?\n---\s*\r?\n[\s\S]*\S/.test(text)) {
                newMode = 'ace/mode/markdown';

            // 5. CSV — confiance faible, donc testé en tout dernier avant le fallback texte
            } else {
                const sample = text.split('\n').map(l => l.trim()).filter(Boolean).slice(0, 5);
                if (sample.length >= 2) {
                    for (const delim of [',', ';']) {
                        const counts = sample.map(l => l.split(delim).length - 1);
                        if (counts[0] > 0 && counts.every(c => c === counts[0])) {
                            newMode = 'ace/mode/csv';
                            break;
                        }
                    }
                }
            }

            if (editor.session.$modeId !== newMode) {
                editor.session.setMode(newMode, () => {
                    if (newMode === 'ace/mode/yaml' && window.FamousPluginCore?.YamlFolding) {
                        window.FamousPluginCore.YamlFolding.apply(editor.session);
                    }
                });
                if (editor.session.bgTokenizer) editor.session.bgTokenizer.start(0);
                if (editor.renderer) editor.renderer.updateFull(true);
                setTimeout(updateUI, 10);
            }
        }
    });
}

// ﹥ CUSTOM KEYBOARD SHORTCUTS (POWER USER)
if (editor) {

    // 1. Expand / Collapse (Ctrl + M / Ctrl + Shift + M)
    editor.commands.addCommand({
        name: "foldCustom",
        bindKey: { win: "Ctrl-M", mac: "Command-M" },
        exec: function(editor) {
            console.log("ctrl+M fold");
            editor.execCommand("fold"); // Hide
        }
    });

    editor.commands.addCommand({
        name: "unfoldCustom",
        bindKey: { win: "Ctrl-Shift-M", mac: "Command-Shift-M" },
        exec: function(editor) {
            editor.execCommand("unfold"); // Show
        }
    });
}

// 3. Magic Snippets (Triggered by '/' + keyword + Tab)
editor.commands.addCommand({
    name: "magicSnippets",
    bindKey: { win: "Tab", mac: "Tab" },
    exec: function(editor) {
        const ext = currentFileName ? currentFileName.split('.').pop().toLowerCase() : '';

        const pos = editor.getCursorPosition();
        const Range = ace.require('ace/range').Range;
        const line = editor.session.getLine(pos.row);

        const textBefore = line.substring(0, pos.column);
        const match = textBefore.match(/\/([a-zA-Z0-9_-]+)$/);
        const coreSnippets = window.FamousPluginCore ? window.FamousPluginCore.Snippets : null;

        if (match && coreSnippets) {
            const word = match[1].toLowerCase();
            const triggerLength = word.length + 1; // Word + '/'

            // FEATURE: The /help command (Filtered by extension)
            if (word === "help") {
                let helpMsg = `MAGIC SNIPPETS FOR .${ext.toUpperCase()}:\n\n`;
                for (const [key, data] of Object.entries(coreSnippets)) {
                    if (!data.extensions || data.extensions.length === 0 || data.extensions.includes(ext)) {
                        helpMsg += `/${key} ➔ ${data.help}\n`;
                    }
                }
                alert(helpMsg);
                editor.session.replace(new Range(pos.row, pos.column - triggerLength, pos.row, pos.column), "");
                return;
            }

            // STANDARD SNIPPET EXPANSION
            const snipData = coreSnippets[word];

            if (snipData && (!snipData.extensions || snipData.extensions.length === 0 || snipData.extensions.includes(ext))) {
                let rawSnippet = snipData.snippet;
                const selection = editor.getSelectedText ? editor.getSelectedText() : "";

                // Process dynamic variables if SnippetManager is available
                let snippet = rawSnippet;
                if (window.FamousPluginCore && window.FamousPluginCore.SnippetManager) {
                    snippet = window.FamousPluginCore.SnippetManager.parseDynamicVariables(rawSnippet, {
                        filename: currentFileName,
                        selection: selection
                    });
                }

                const lines = snippet.split('\n');

                let markerRow = -1;
                let markerCol = -1;

                for (let i = 0; i < lines.length; i++) {
                    const col = lines[i].indexOf("$1");
                    if (col !== -1) {
                        markerRow = i;
                        markerCol = col;
                        lines[i] = lines[i].replace("$1", "");
                        break;
                    }
                }

                const finalSnippet = lines.join('\n');
                editor.session.replace(new Range(pos.row, pos.column - triggerLength, pos.row, pos.column), finalSnippet);

                if (markerRow !== -1) {
                    const targetRow = pos.row + markerRow;
                    const targetCol = (markerRow === 0) ? (pos.column - triggerLength + markerCol) : markerCol;
                    editor.gotoLine(targetRow + 1, targetCol);
                }
                return;
            }
        }
        // Fallback to standard indentation if no magic snippet matched
        editor.execCommand("indent");
    }
});

function checkAndPatchSearchBox() {
    let optionsDiv = document.querySelector('.ace_search_options');
    if (!optionsDiv) return;

    let counter = document.querySelector('.ace_search_counter');
    if (!counter) {
        counter = document.createElement('span');
        counter.className = 'ace_search_counter';
        optionsDiv.insertBefore(counter, optionsDiv.firstChild);
    }

    if (editor && editor.searchBox && editor.searchBox.searchInput) {
        let searchInput = editor.searchBox.searchInput;

        if (!searchInput.dataset.counterPatched) {
            function updateCounter() {
                let term = searchInput.value;
                let displaySpan = document.querySelector('.ace_search_counter');

                if (!term || !displaySpan) {
                    if (displaySpan) displaySpan.textContent = "";
                    return;
                }

                let searchBoxDOM = document.querySelector('.ace_search');
                let isRegExp = searchBoxDOM.querySelector('[action="toggleRegexpMode"]')?.classList.contains('checked') || false;
                let isCase = searchBoxDOM.querySelector('[action="toggleCaseSensitive"]')?.classList.contains('checked') || false;
                let isWord = searchBoxDOM.querySelector('[action="toggleWholeWords"]')?.classList.contains('checked') || false;

                editor.$search.set({ needle: term, regExp: isRegExp, caseSensitive: isCase, wholeWord: isWord });
                let ranges = editor.$search.findAll(editor.session);
                let total = ranges.length;

                if (total === 0) {
                    displaySpan.textContent = "0 of 0";
                    return;
                }

                let cursor = editor.selection.getCursor();
                let currentIndex = 1;

                for (let i = 0; i < total; i++) {
                    if (ranges[i].end.row < cursor.row ||
                        (ranges[i].end.row === cursor.row && ranges[i].end.column <= cursor.column)) {
                        currentIndex = i + 1;
                    } else {
                        break;
                    }
                }

                displaySpan.textContent = currentIndex + " of " + total;
            }

            searchInput.addEventListener("input", updateCounter);
            editor.selection.on("changeCursor", () => setTimeout(updateCounter, 10));
            optionsDiv.addEventListener("click", () => setTimeout(updateCounter, 50));

            searchInput.dataset.counterPatched = "true";
            updateCounter();
        }
    }
}

const observer = new MutationObserver(checkAndPatchSearchBox);
observer.observe(document.body, { childList: true, subtree: true });
