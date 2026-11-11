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
 * Famouskai Core - Dynamic Snippets UI & Onclick Insertion
 *
 * What it holds:
 *   - Sidebar Magic Snippets UI filtering and display (updateSnippetsUI)
 *   - Onclick snippet insertion into active Ace editor (insertSnippetByKey)
 *   - HTML escaping helper (escapeHtml)
 *   - Snippet search input and filter buttons event listeners
 *
 * Globals used:
 *   - currentFileName
 *   - editor / window.editor
 *   - window.FamousPluginCore
 *   - alert
 *   - DOM elements (#snippets-lexicon, #snippet-search, #snippet-search-clear, #btn-snip-filter-custom, #btn-snip-filter-default)
 *
 * Globals defined:
 *   - activeSidebarSnippetFilter
 *   - escapeHtml
 *   - insertSnippetByKey
 *   - updateSnippetsUI
 */

// ﹥ DYNAMIC SNIPPETS UI & ONCLICK INSERTION
let activeSidebarSnippetFilter = null; // null | 'custom' | 'default'

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function insertSnippetByKey(snipKey) {
    if (!window.editor) return;

    const coreSnippets = window.FamousPluginCore ? window.FamousPluginCore.Snippets : null;
    const ext = currentFileName ? currentFileName.split('.').pop().toLowerCase() : '';

    if (snipKey === 'help') {
        if (coreSnippets) {
            let helpMsg = `MAGIC SNIPPETS FOR .${ext.toUpperCase()}:\n\n`;
            for (const [key, data] of Object.entries(coreSnippets)) {
                if (!data.extensions || data.extensions.length === 0 || data.extensions.includes(ext)) {
                    helpMsg += `/${key} ➔ ${data.help}\n`;
                }
            }
            alert(helpMsg);
        }
        window.editor.focus();
        return;
    }

    if (!coreSnippets || !coreSnippets[snipKey]) return;

    const snipData = coreSnippets[snipKey];
    let rawSnippet = snipData.snippet || '';
    const selection = window.editor.getSelectedText ? window.editor.getSelectedText() : '';

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
    const selectionRange = window.editor.getSelectionRange();
    const startPos = selectionRange ? selectionRange.start : window.editor.getCursorPosition();

    window.editor.insert(finalSnippet);

    if (markerRow !== -1) {
        const targetRow = startPos.row + markerRow;
        const targetCol = (markerRow === 0) ? (startPos.column + markerCol) : markerCol;
        window.editor.gotoLine(targetRow + 1, targetCol);
    }

    window.editor.focus();
}

function updateSnippetsUI(currentExt) {
    const container = document.getElementById('snippets-lexicon');
    const coreSnippets = window.FamousPluginCore ? window.FamousPluginCore.Snippets : null;
    if (!container || !coreSnippets) return;

    const searchInput = document.getElementById('snippet-search');
    const clearBtn = document.getElementById('snippet-search-clear');
    const filterTerm = searchInput ? searchInput.value.trim().toLowerCase() : '';

    if (clearBtn) clearBtn.style.display = filterTerm ? 'block' : 'none';

    let html = `<div class="snippet-lexicon-row" data-snip-key="help"><span class="ext-snippets-key">/help</span>: Show alert list</div>`;
    let count = 0;

    for (const [key, data] of Object.entries(coreSnippets)) {
        if (!data.extensions || data.extensions.length === 0 || data.extensions.includes(currentExt)) {
            if (activeSidebarSnippetFilter === 'custom' && !data.isCustom) continue;
            if (activeSidebarSnippetFilter === 'default' && data.isCustom) continue;

            if (!filterTerm || key.toLowerCase().includes(filterTerm) || (data.help && data.help.toLowerCase().includes(filterTerm))) {
                const keyClass = data.isCustom ? 'ext-snippets-key key-custom' : 'ext-snippets-key';
                const escapedHelp = escapeHtml(data.help);
                html += `<div class="snippet-lexicon-row" data-snip-key="${key}"><span class="${keyClass}">/${key}</span>: ${escapedHelp}</div>`;
                count++;
            }
        }
    }
    if (count === 0) html += `<span class="ext-snippets-empty">No matching snippets for .${currentExt || 'txt'}</span><br>`;

    html += `<div class="ext-snippets-separator"></div><i>Type keyword then press <b>Tab</b></i>`;
    container.innerHTML = html;

    container.querySelectorAll('.snippet-lexicon-row').forEach(row => {
        row.addEventListener('click', (e) => {
            e.preventDefault();
            const snipKey = row.getAttribute('data-snip-key');
            if (snipKey) {
                insertSnippetByKey(snipKey);
                // Same feedback as a click in the Manage Snippets drawer (ext-snippets.js)
                if (snipKey !== 'help' && window.showToast) window.showToast(`Snippet /${snipKey} inserted`, "success");
            }
        });
    });
}

const snipSearchInput = document.getElementById('snippet-search');
const snipSearchClear = document.getElementById('snippet-search-clear');
const btnSnipFilterCustom = document.getElementById('btn-snip-filter-custom');
const btnSnipFilterDefault = document.getElementById('btn-snip-filter-default');

if (snipSearchInput) {
    snipSearchInput.addEventListener('input', () => {
        const ext = currentFileName ? currentFileName.split('.').pop().toLowerCase() : '';
        updateSnippetsUI(ext);
    });
}

if (snipSearchClear) {
    snipSearchClear.addEventListener('click', () => {
        if (snipSearchInput) snipSearchInput.value = '';
        const ext = currentFileName ? currentFileName.split('.').pop().toLowerCase() : '';
        updateSnippetsUI(ext);
    });
}

if (btnSnipFilterCustom && btnSnipFilterDefault) {
    btnSnipFilterCustom.addEventListener('click', () => {
        if (activeSidebarSnippetFilter === 'custom') {
            activeSidebarSnippetFilter = null;
            btnSnipFilterCustom.classList.remove('active-filter');
        } else {
            activeSidebarSnippetFilter = 'custom';
            btnSnipFilterCustom.classList.add('active-filter');
            btnSnipFilterDefault.classList.remove('active-filter');
        }
        const ext = currentFileName ? currentFileName.split('.').pop().toLowerCase() : '';
        updateSnippetsUI(ext);
    });

    btnSnipFilterDefault.addEventListener('click', () => {
        if (activeSidebarSnippetFilter === 'default') {
            activeSidebarSnippetFilter = null;
            btnSnipFilterDefault.classList.remove('active-filter');
        } else {
            activeSidebarSnippetFilter = 'default';
            btnSnipFilterDefault.classList.add('active-filter');
            btnSnipFilterCustom.classList.remove('active-filter');
        }
        const ext = currentFileName ? currentFileName.split('.').pop().toLowerCase() : '';
        updateSnippetsUI(ext);
    });
}

updateSnippetsUI('');
