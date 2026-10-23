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
 * Famouskai Editor - Magic Snippets Engine & Storage Architecture
 * Extends default static snippets with dynamic variables, user custom snippets,
 * local persistent storage via idbKeyval, and import/export capabilities.
 */
window.FamousPluginCore = window.FamousPluginCore || {};

window.FamousPluginCore.DefaultSnippets = {
    "fa": {
        snippet: '﹥ $1',
        help: "Famous arrow",
        extensions: []
    },
    "fb": {
        snippet: '° $1',
        help: "Flying bubble",
        extensions: []
    },
    "md": {
        snippet: '• $1',
        help: "Magic dot",
        extensions: []
    },
    "date": {
        snippet: "{{date}} $1",
        help: "Insert current date (YYYY-MM-DD)",
        extensions: []
    },
    "time": {
        snippet: "{{time}} $1",
        help: "Insert current time (HH:MM)",
        extensions: []
    },
    "cmt": {
        snippet: '<!-- $1 -->',
        help: "Multiline comment",
        extensions: ['md', 'html', 'xml', 'svg']
    },
    "pb": {
        snippet: '<div style="page-break-after: always;"></div>$1',
        help: "Force page break (PDF)",
        extensions: ['md', 'html']
    },
    "br": {
        snippet: "<br>$1",
        help: "Insert a line break",
        extensions: ['md', 'html']
    },
    "code": {
        snippet: "```$1\n```",
        help: "Insert a code section",
        extensions: ['md', 'log', 'txt']
    }
};

window.FamousPluginCore.Snippets = Object.assign({}, window.FamousPluginCore.DefaultSnippets);
window.FamousPluginCore.CustomSnippets = {};

window.FamousPluginCore.SnippetManager = {
    STORAGE_KEY: 'famouskai_user_snippets',
    activeModalSnippetFilter: null, // null | 'custom' | 'default'

    init: async function() {
        await this.loadUserSnippets();
        this.syncWithCore();
        this.ensureModalDOM();
        this.initUIListeners();
    },

    loadUserSnippets: async function() {
        try {
            if (typeof idbKeyval !== 'undefined') {
                const stored = await idbKeyval.get(this.STORAGE_KEY);
                if (stored && typeof stored === 'object') {
                    window.FamousPluginCore.CustomSnippets = stored;
                }
            } else {
                const stored = localStorage.getItem(this.STORAGE_KEY);
                if (stored) {
                    window.FamousPluginCore.CustomSnippets = JSON.parse(stored);
                }
            }
        } catch (e) {
            console.error("Failed to load user snippets:", e);
        }
    },

    saveUserSnippets: async function() {
        try {
            if (typeof idbKeyval !== 'undefined') {
                await idbKeyval.set(this.STORAGE_KEY, window.FamousPluginCore.CustomSnippets);
            } else {
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(window.FamousPluginCore.CustomSnippets));
            }
            this.syncWithCore();
            if (typeof updateSnippetsUI === 'function') {
                const fileName = typeof currentFileName !== 'undefined' ? currentFileName : (window.currentFileName || '');
                const ext = fileName ? fileName.split('.').pop().toLowerCase() : '';
                updateSnippetsUI(ext);
            }
        } catch (e) {
            console.error("Failed to save user snippets:", e);
        }
    },

    syncWithCore: function() {
        const mergedCustoms = {};
        for (const [k, v] of Object.entries(window.FamousPluginCore.CustomSnippets)) {
            mergedCustoms[k] = Object.assign({}, v, { isCustom: true });
        }

        window.FamousPluginCore.Snippets = Object.assign(
            {},
            window.FamousPluginCore.DefaultSnippets,
            mergedCustoms
        );
        this.bindFamousMarkLabels();
    },

    bindFamousMarkLabels: function() {
        const core = window.FamousPluginCore && window.FamousPluginCore.FamousMark;
        const snippets = window.FamousPluginCore && window.FamousPluginCore.Snippets;
        if (!core || !snippets) return;

        const bindings = [
            { snippetKey: "fa", markKey: "arrow" },
            { snippetKey: "md", markKey: "magic" },
            { snippetKey: "fb", markKey: "bubble" }
        ];

        bindings.forEach(function (b) {
            const entry = snippets[b.snippetKey];
            const mark = core.MARKS[b.markKey];
            if (entry && mark && mark.label) {
                entry.help = mark.label;
            }
        });
    },

    saveSnippet: async function(key, snippetData) {
        key = key.trim().toLowerCase().replace(/^\//, '');
        if (!key) return false;

        window.FamousPluginCore.CustomSnippets[key] = {
            snippet: snippetData.snippet,
            help: snippetData.help || key,
            extensions: Array.isArray(snippetData.extensions) ? snippetData.extensions : [],
            isCustom: true
        };

        await this.saveUserSnippets();
        return true;
    },

    deleteSnippet: async function(key) {
        key = key.trim().toLowerCase().replace(/^\//, '');
        if (window.FamousPluginCore.CustomSnippets[key]) {
            delete window.FamousPluginCore.CustomSnippets[key];
            await this.saveUserSnippets();
            return true;
        }
        return false;
    },

    exportJSON: function() {
        const allSnippets = window.FamousPluginCore.Snippets || {};
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(allSnippets, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `famouskai_snippets_${new Date().toISOString().slice(0, 10)}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    },

    importJSON: async function(jsonContent) {
        try {
            const parsed = JSON.parse(jsonContent);
            if (typeof parsed !== 'object' || parsed === null) throw new Error("Invalid JSON format");

            const defaultSnippets = window.FamousPluginCore.DefaultSnippets || {};
            let importedCount = 0;
            let skippedCount = 0;

            for (const [rawKey, item] of Object.entries(parsed)) {
                if (!item || typeof item.snippet !== 'string') continue;
                const key = rawKey.trim().toLowerCase().replace(/^\//, '');
                if (!key) continue;

                const exts = Array.isArray(item.extensions) ? item.extensions : [];
                const help = item.help || key;
                const snippet = item.snippet;

                // Check if identical to built-in default snippet
                if (defaultSnippets[key]) {
                    const def = defaultSnippets[key];
                    const sameSnippet = def.snippet === snippet;
                    const sameHelp = def.help === help;
                    const sameExts = JSON.stringify((def.extensions || []).slice().sort()) === JSON.stringify(exts.slice().sort());

                    if (sameSnippet && sameHelp && sameExts) {
                        skippedCount++;
                        continue;
                    }
                }

                // Check if already in CustomSnippets with exact same values
                if (window.FamousPluginCore.CustomSnippets[key]) {
                    const cust = window.FamousPluginCore.CustomSnippets[key];
                    const sameSnippet = cust.snippet === snippet;
                    const sameHelp = cust.help === help;
                    const sameExts = JSON.stringify((cust.extensions || []).slice().sort()) === JSON.stringify(exts.slice().sort());

                    if (sameSnippet && sameHelp && sameExts) {
                        skippedCount++;
                        continue;
                    }
                }

                // Save or update custom snippet
                window.FamousPluginCore.CustomSnippets[key] = {
                    snippet: snippet,
                    help: help,
                    extensions: exts,
                    isCustom: true
                };
                importedCount++;
            }

            if (importedCount > 0) {
                await this.saveUserSnippets();
            }

            return { success: true, imported: importedCount, skipped: skippedCount };
        } catch (e) {
            console.error("Import error:", e);
            alert("Error importing snippets: " + e.message);
            return { success: false, error: e.message };
        }
    },

    parseDynamicVariables: function(template, context = {}) {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');

        const dateStr = `${year}-${month}-${day}`;
        const timeStr = `${hours}:${minutes}`;
        const datetimeStr = `${dateStr} ${timeStr}`;

        const filename = context.filename || window.currentFileName || "[New]";
        const selection = context.selection || "";

        return template
            .replace(/\{\{date\}\}/g, dateStr)
            .replace(/\{\{time\}\}/g, timeStr)
            .replace(/\{\{datetime\}\}/g, datetimeStr)
            .replace(/\{\{filename\}\}/g, filename)
            .replace(/\{\{selection\}\}/g, selection);
    },

    ensureModalDOM: function() {
        if (document.getElementById('snippet-dialog')) return;

        const dialog = document.createElement('dialog');
        dialog.id = 'snippet-dialog';
        dialog.className = 'snippet-modal';

        dialog.innerHTML = `
            <div class="snippet-modal-header">
                <div class="sidebar-title">Manage Magic Snippets</div>
                <button type="button" class="fold-btn" id="snippet-modal-close">×</button>
            </div>

            <div class="snippet-modal-body">
                <!-- Action bar: Import/Export on left, Add on right -->
                <div class="snippet-modal-toolbar">
                    <div class="snippet-modal-toolbar-left">
                        <button type="button" id="btn-snippet-import" class="fold-btn" title="Import JSON">Import</button>
                        <button type="button" id="btn-snippet-export" class="fold-btn" title="Export JSON">Export</button>
                        <input type="file" id="snippet-import-file" accept=".json" style="display: none;">
                    </div>
                    <button type="button" id="btn-snippet-add" class="btn-active">+ Add Snippet</button>
                </div>

                <!-- Add/Edit Form (hidden by default) -->
                <form id="snippet-edit-form" style="display: none;" class="snippet-form-box">
                    <div class="snippet-form-group">
                        <label>Key (Trigger with /key + Tab):</label>
                        <input type="text" id="snip-input-key" required placeholder="e.g. prompt" autocomplete="off">
                    </div>
                    <div class="snippet-form-group">
                        <label>Help Description:</label>
                        <input type="text" id="snip-input-help" required placeholder="e.g. AI Prompt Template" autocomplete="off">
                    </div>
                    <div class="snippet-form-group">
                        <label>Snippet Content (Supports {{date}}, {{time}}, {{datetime}}, {{filename}}, {{selection}}, $1):</label>
                        <textarea id="snip-input-body" rows="4" required placeholder="Write snippet content here..."></textarea>
                    </div>
                    <div class="snippet-form-group">
                        <label>Allowed Extensions (comma-separated, leave empty for all):</label>
                        <input type="text" id="snip-input-exts" placeholder="e.g. md, txt, js">
                    </div>
                    <div class="dialog-buttons" style="margin-top: 10px;">
                        <button type="button" id="snip-form-cancel">Cancel</button>
                        <button type="submit" class="btn-active">Save Snippet</button>
                    </div>
                </form>

                <!-- Search filter inside modal -->
                <div class="snippet-search-row" style="margin: 10px 0;">
                    <div class="workspace-search-box snippet-search-wrapper">
                        <input type="text" id="snippet-modal-search" placeholder="Search snippet library..." autocomplete="off">
                        <button id="snippet-modal-search-clear" title="Clear filter" style="display: none;">×</button>
                    </div>
                    <div class="snippet-type-filters">
                        <button type="button" class="fold-btn btn-filter-custom" id="btn-modal-snip-filter-custom" title="Filter Custom snippets">Custom</button>
                        <button type="button" class="fold-btn btn-filter-default" id="btn-modal-snip-filter-default" title="Filter Default snippets">Default</button>
                    </div>
                </div>

                <!-- List of existing snippets -->
                <div id="snippet-modal-list" class="snippet-modal-list"></div>
            </div>
        `;

        document.body.appendChild(dialog);
    },

    initUIListeners: function() {
        this.ensureModalDOM();

        const manageBtn = document.getElementById('btn-manage-snippets');
        const modal = document.getElementById('snippet-dialog');
        const closeBtn = document.getElementById('snippet-modal-close');

        if (manageBtn) {
            manageBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (window.FamousPluginCore && window.FamousPluginCore.Sidebar) {
                    const modalBody = document.querySelector('.snippet-modal-body');
                    if (modalBody) {
                        const clone = modalBody.cloneNode(true);
                        // Clean up inline padding from cloned template
                        clone.style.padding = '0';
                        window.FamousPluginCore.Sidebar.openDrawer("Manage Magic Snippets", clone);
                        this.bindDrawerListeners();
                        this.renderModalList();
                        return;
                    }
                }
                if (modal) modal.showModal();
            });
        }

        if (closeBtn && modal) {
            closeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                modal.close();
            });
        }
    },

    showForm: function(container, editKey = null) {
        const root = container || document;
        const form = root.querySelector('#snippet-edit-form');
        const keyInput = root.querySelector('#snip-input-key');
        const helpInput = root.querySelector('#snip-input-help');
        const bodyInput = root.querySelector('#snip-input-body');
        const extsInput = root.querySelector('#snip-input-exts');

        if (!form) return;

        if (editKey && window.FamousPluginCore.Snippets[editKey]) {
            const snip = window.FamousPluginCore.Snippets[editKey];
            keyInput.value = editKey;
            keyInput.readOnly = true;
            helpInput.value = snip.help || '';
            bodyInput.value = snip.snippet || '';
            extsInput.value = (snip.extensions || []).join(', ');
        } else {
            keyInput.value = '';
            keyInput.readOnly = false;
            helpInput.value = '';
            bodyInput.value = '';
            extsInput.value = '';
        }

        form.style.display = 'block';
    },

    bindDrawerListeners: function() {
        const container = document.getElementById('sidebar-drawer-body');
        if (!container) return;

        const addBtn = container.querySelector('#btn-snippet-add');
        const form = container.querySelector('#snippet-edit-form');
        const cancelFormBtn = container.querySelector('#snip-form-cancel');
        const exportBtn = container.querySelector('#btn-snippet-export');
        const importBtn = container.querySelector('#btn-snippet-import');
        const importFile = container.querySelector('#snippet-import-file');
        const searchInput = container.querySelector('#snippet-modal-search');
        const searchClear = container.querySelector('#snippet-modal-search-clear');
        const btnFilterCustom = container.querySelector('#btn-modal-snip-filter-custom');
        const btnFilterDefault = container.querySelector('#btn-modal-snip-filter-default');

        if (addBtn && form) {
            addBtn.onclick = () => { this.showForm(container); };
        }
        if (cancelFormBtn && form) {
            cancelFormBtn.onclick = () => { form.style.display = 'none'; };
        }
        if (form) {
            form.onsubmit = async (e) => {
                e.preventDefault();
                const keyInput = container.querySelector('#snip-input-key');
                const helpInput = container.querySelector('#snip-input-help');
                const bodyInput = container.querySelector('#snip-input-body');
                const extsInput = container.querySelector('#snip-input-exts');

                if (keyInput && helpInput && bodyInput) {
                    const extsRaw = extsInput ? extsInput.value : '';
                    const extensions = extsRaw.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
                    await this.saveSnippet(keyInput.value, { snippet: bodyInput.value, help: helpInput.value, extensions });
                    form.style.display = 'none';
                    if (window.showToast) window.showToast("Snippet saved!", "success");
                    this.renderModalList();
                }
            };
        }
        if (exportBtn) {
            exportBtn.onclick = () => this.exportJSON();
        }
        if (importBtn && importFile) {
            importBtn.onclick = () => importFile.click();
            importFile.onchange = async (e) => {
                const file = e.target.files[0];
                if (file) {
                    const text = await file.text();
                    const res = await this.importJSON(text);
                    if (res && res.success) {
                        this.renderModalList();
                        const msg = res.imported > 0
                            ? `Imported ${res.imported} snippet(s)` + (res.skipped > 0 ? ` (${res.skipped} skipped/duplicate)` : '')
                            : `No new snippets added (${res.skipped} duplicate/default skipped)`;
                        if (window.showToast) window.showToast(msg, res.imported > 0 ? "success" : "warn");
                    }
                    importFile.value = '';
                }
            };
        }
        if (searchInput && searchClear) {
            searchInput.oninput = (e) => {
                const term = e.target.value;
                searchClear.style.display = term ? 'block' : 'none';
                this.renderModalList(term);
            };
            searchClear.onclick = () => {
                searchInput.value = '';
                searchClear.style.display = 'none';
                this.renderModalList('');
                searchInput.focus();
            };
        }

        if (btnFilterCustom && btnFilterDefault) {
            btnFilterCustom.onclick = () => {
                if (this.activeModalSnippetFilter === 'custom') {
                    this.activeModalSnippetFilter = null;
                    btnFilterCustom.classList.remove('active-filter');
                } else {
                    this.activeModalSnippetFilter = 'custom';
                    btnFilterCustom.classList.add('active-filter');
                    btnFilterDefault.classList.remove('active-filter');
                }
                const term = searchInput ? searchInput.value : '';
                this.renderModalList(term);
            };

            btnFilterDefault.onclick = () => {
                if (this.activeModalSnippetFilter === 'default') {
                    this.activeModalSnippetFilter = null;
                    btnFilterDefault.classList.remove('active-filter');
                } else {
                    this.activeModalSnippetFilter = 'default';
                    btnFilterDefault.classList.add('active-filter');
                    btnFilterCustom.classList.remove('active-filter');
                }
                const term = searchInput ? searchInput.value : '';
                this.renderModalList(term);
            };
        }
    },

    escapeHtml: function(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    },

    renderModalList: function(filterTerm = '') {
        const drawerList = document.querySelector('#sidebar-drawer-body #snippet-modal-list');
        const modalList = document.querySelector('#snippet-dialog #snippet-modal-list');
        const listContainer = drawerList || modalList;
        if (!listContainer) return;

        const term = filterTerm.trim().toLowerCase();
        const allSnippets = window.FamousPluginCore.Snippets || {};
        listContainer.innerHTML = '';

        let count = 0;
        for (const [key, data] of Object.entries(allSnippets)) {
            if (this.activeModalSnippetFilter === 'custom' && !data.isCustom) continue;
            if (this.activeModalSnippetFilter === 'default' && data.isCustom) continue;

            if (term && !key.toLowerCase().includes(term) && !(data.help && data.help.toLowerCase().includes(term))) {
                continue;
            }
            count++;
            const itemDiv = document.createElement('div');
            itemDiv.className = 'snippet-modal-item';

            const badgeHtml = data.isCustom ? `<span class="snippet-badge-custom">Custom</span>` : `<span class="snippet-badge-default">Default</span>`;
            const extsBadge = (data.extensions && data.extensions.length > 0) ? `[${data.extensions.join(', ')}]` : `[all]`;
            const keyClass = data.isCustom ? 'ext-snippets-key key-custom' : 'ext-snippets-key';

            const escapedHelp = this.escapeHtml(data.help);
            const escapedSnippet = this.escapeHtml(data.snippet);

            itemDiv.innerHTML = `
                <div class="snippet-item-info">
                    <div class="snippet-item-header">
                        <span class="${keyClass}">/${key}</span>
                        ${badgeHtml}
                        <span class="snippet-item-exts">${extsBadge}</span>
                    </div>
                    <div class="snippet-item-desc">${escapedHelp}</div>
                    <pre class="snippet-item-preview">${escapedSnippet}</pre>
                </div>
                <div class="snippet-item-actions">
                    ${data.isCustom ? `<button type="button" class="fold-btn btn-edit-snip" data-key="${key}">Edit</button>
                    <button type="button" class="fold-btn btn-del-snip" data-key="${key}" title="Delete"><svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>` : ``}
                </div>
            `;

            const editBtn = itemDiv.querySelector('.btn-edit-snip');
            if (editBtn) {
                editBtn.addEventListener('click', () => {
                    const drawerContainer = document.getElementById('sidebar-drawer-body');
                    this.showForm(drawerContainer, key);
                });
            }

            const delBtn = itemDiv.querySelector('.btn-del-snip');
            if (delBtn) {
                delBtn.addEventListener('click', async () => {
                    if (confirm(`Delete custom snippet /${key}?`)) {
                        await this.deleteSnippet(key);
                        this.renderModalList(filterTerm);
                        if (window.showToast) window.showToast("Snippet deleted", "warn");
                    }
                });
            }

            listContainer.appendChild(itemDiv);
        }

        if (count === 0) {
            listContainer.innerHTML = `<div class="workspace-empty-msg">No snippets found</div>`;
        }
    }
};

window.FamousPluginCore.SnippetManager.bindFamousMarkLabels();
