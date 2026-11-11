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
 * Famouskai Core - Shared File & Editor State and Workspace Configuration
 *
 * What it holds:
 *   - Error handler for Ace script loading (showError)
 *   - Shared state of the open file (fileHandle, currentFileName, isInitialLoad, isModified, lastKnownModifiedTime)
 *   - Global file metadata accessor (window.FamousPluginCore.getCurrentFile)
 *   - Shared editor instance and autosave state (editor, autoSaveTimer, isAutoSaveEnabled)
 *   - Workspace file configuration table (WORKSPACE_FILE_GROUPS)
 *   - Auto-generated resources (FILE_ICON_MAP, WORKSPACE_ALLOWED_EXT, WORKSPACE_IGNORED_DIRS)
 *
 * Globals used:
 *   - document
 *   - window.FamousPluginCore
 *
 * Globals defined:
 *   - showError
 *   - fileHandle, currentFileName, isInitialLoad, isModified, lastKnownModifiedTime
 *   - window.FamousPluginCore.getCurrentFile
 *   - editor, autoSaveTimer, isAutoSaveEnabled
 *   - WORKSPACE_FILE_GROUPS, FILE_ICON_MAP, WORKSPACE_ALLOWED_EXT, WORKSPACE_IGNORED_DIRS
 *
 * Note: These variables are read and written by many later core files and plugins,
 * so they must stay top-level let/const with these exact names.
 */

function showError() { document.getElementById('error-msg').style.display = 'block'; }

let fileHandle = null;
let currentFileName = "";
let isInitialLoad = false;
let isModified = false;
let lastKnownModifiedTime = 0; // Stores the timestamp of the last read/written version

window.FamousPluginCore = window.FamousPluginCore || {};
window.FamousPluginCore.getCurrentFile = () => ({
    handle: fileHandle,
    name: currentFileName || '',
    lastModified: lastKnownModifiedTime,
    ext: (editor && editor.session && editor.session.$modeId) ? editor.session.$modeId.split('/').pop() : ''
});

let editor = null;
let autoSaveTimer = null;
let isAutoSaveEnabled = false;

/**
 * UNIFIED WORKSPACE CONFIGURATION (Single Source of Truth)
 * Maps functional groups to their filter UI and specific file icons.
 * This automatically dictates allowed extensions and color inheritance.
 */
const WORKSPACE_FILE_GROUPS = [
    { filter: 'JS',  className: 'icon-js',
        types: {
            js: 'JS',
            ts: { label: 'TS', className: 'icon-ts' }
        } },
    { filter: '{}',  className: 'icon-json', types: { json: '{}' } },
    { filter: '</>', className: 'icon-html',
        types: {
            html: '&lt;h&gt;',
            xml: { label: '&lt;x&gt;', className: 'icon-xml' },
            svg: { label: '&lt;s&gt;', className: 'icon-svg' }

        } },
    { filter: '#',   className: 'icon-css',  types: { css: '#' } },
    { filter: 'Yᴍʟ', className: 'icon-yml',  types: { yaml: 'Yᴍʟ', yml: 'Yᴍʟ' } },
    { filter: '±',   className: 'icon-diff', types: { patch: '±', diff: '±' } },
    { filter: 'M⇣',  className: 'icon-md',   types: { md: 'M⇣' } },
    { filter: '≣',   className: 'icon-txt',
        types: {
            txt: 'Txᴛ',
            log: { label: 'Lᴏɢ', className: 'icon-log' },
            csv: { label: '▥' , className: 'icon-csv' },
            tsv: { label: '▥' , className: 'icon-csv' }

        } }
];

// ﹥ AUTO-GENERATED RESOURCES (Do not edit directly)

// 1. Generate O(1) lookup map for fast file icon rendering
const FILE_ICON_MAP = Object.freeze(
    WORKSPACE_FILE_GROUPS.reduce((acc, group) => {
        Object.entries(group.types).forEach(([ext, value]) => {
            const isObject = typeof value === "object";
            acc[ext] = {
                label: isObject ? value.label : value,
                className: isObject && value.className ? value.className : group.className
            };
        });
        return acc;
    }, {})
);

// 2. Dynamically extract allowed extensions for the Workspace Explorer
const WORKSPACE_ALLOWED_EXT = Object.keys(FILE_ICON_MAP);

// 3. Workspace Configuration Constants (Keep only the ignored directories)
const WORKSPACE_IGNORED_DIRS = ['node_modules', '.git', '.vscode']; // Crash prevention
