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
window.FamousPluginCore = window.FamousPluginCore || {};

window.FamousPluginCore.Diffskai = {
    // Sessions opened from THIS Famouskai window: id -> buffer sent to Diffskai.
    // Lets the sync listener in index.html tell its own merge from another window's.
    ownSessions: new Map(),

    newId: function() {
        if (window.crypto && typeof window.crypto.randomUUID === 'function') return window.crypto.randomUUID();
        return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
    },

    sweep: async function() {
        try {
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('diffskai_t_')) localStorage.removeItem(key);
            });
        } catch (e) {}

        try {
            Object.keys(sessionStorage).forEach(key => {
                if (key.startsWith('diffskai_transfer_')) sessionStorage.removeItem(key);
            });
        } catch (e) {}

        if (typeof idbKeyval !== 'undefined' && typeof idbKeyval.keys === 'function') {
            try {
                const keys = await idbKeyval.keys();
                const now = Date.now();
                const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
                for (const key of keys) {
                    if (typeof key === 'string') {
                        if (key.startsWith('diffskai_conflict_handle')) {
                            await idbKeyval.del(key);
                        } else if (key.startsWith('diffskai_session_')) {
                            const record = await idbKeyval.get(key);
                            if (!record || !record.createdAt || (now - record.createdAt > TWENTY_FOUR_HOURS)) {
                                await idbKeyval.del(key);
                            }
                        }
                    }
                }
            } catch (e) {
                console.warn("Diffskai sweep error:", e);
            }
        }
    },

    prepareSession: async function({ mode, buffer, diskText = null, baseline = undefined }) {
        const fileInfo = (window.FamousPluginCore && window.FamousPluginCore.getCurrentFile)
            ? window.FamousPluginCore.getCurrentFile()
            : { handle: null, name: '', lastModified: 0 };

        // The Ace editor is not on window (window.editor is the #editor element), so the mode comes from getCurrentFile().
        const ext = fileInfo.ext || "text";

        const resolvedBaseline = (typeof baseline === 'number') ? baseline : (fileInfo.lastModified || 0);

        const record = {
            mode: mode,
            buffer: buffer,
            diskText: diskText,
            filename: fileInfo.name || 'Untitled_File',
            ext: ext,
            handle: fileInfo.handle || null,
            baseline: resolvedBaseline,
            createdAt: Date.now()
        };

        // Unique id: two windows (or two clicks) in the same millisecond must never share a record or a window.
        const id = this.newId();
        this.ownSessions.set(id, buffer);

        await this.sweep();

        if (typeof idbKeyval !== 'undefined') {
            await idbKeyval.set('diffskai_session_' + id, record);
        }

        return id;
    },

    openSession: function(id) {
        const left = (typeof screen.availLeft === 'number') ? screen.availLeft : 0;
        const top = (typeof screen.availTop === 'number') ? screen.availTop : 0;
        const windowFeatures = `popup=yes,width=${screen.availWidth},height=${screen.availHeight},left=${left},top=${top}`;
        window.open('plugins/tool-diffskai.html?session=' + id, 'DiffskaiWindow_' + id, windowFeatures);
    }
};

window.FamousPluginCore.Manager.register({
    name: "Compare this file (diffskai)",
    extensions: ['js', 'json', 'md', 'css', 'html', 'xml', 'svg', 'txt', 'log', 'csv', 'tsv', 'ts', 'yml', 'patch', 'diff', ''],
    toolbar: {
        letter: "D",
        color: "var(--fm-pink)"
    },
    
    action: async function(editor) {
        const currentContent = editor.getValue();
        
        if (!currentContent) {
            alert("The current file is empty.");
            return;
        }

        const id = await window.FamousPluginCore.Diffskai.prepareSession({
            mode: 'compare',
            buffer: currentContent
        });
        window.FamousPluginCore.Diffskai.openSession(id);
    }
});