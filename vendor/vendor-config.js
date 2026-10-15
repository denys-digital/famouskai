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
/**
 * Famouskai Editor - Central Vendor Configuration
 * Single Source of Truth for all third-party dependencies.
 *
 * VENDOR OBJECT ANATOMY & USAGE:
 *
 * @property {string} id                 - Internal identifier. Used to specify the local target folder path in the generated `_VENDOR-INFO.md` instructions (`vendor/${id}/`).
 * @property {string} name               - Display name. Used in the `updater.html` UI dropdown, log titles, `_VENDOR-INFO.md` header, and both doc snippets.
 * @property {string} description        - Brief project description. Used to populate the Project line in the generated `_VENDOR-INFO.md`.
 * @property {string} license            - Open-source license (e.g., "MIT"). Used in `_VENDOR-INFO.md` and the `README.md` table row snippet.
 * @property {string} repoUrl            - Official repository URL. Used as the hyperlink in `_VENDOR-INFO.md` and the `README.md` table snippet.
 * @property {string} npmPackage         - Exact npm package name. Used to query the jsDelivr API for the latest version, populate _VENDOR-INFO.md, and enforce a security check on the local directory name.
 * @property {string} copyright          - Official copyright string. Used exclusively to generate the `THIRD-PARTY-NOTICES.md` list item snippet.
 * @property {string} role               - Internal purpose of the library. Used exclusively to generate the `README.md` table row snippet.
 * @property {string} [strategy]         - Optional download strategy. Set to "regex-tree" to dynamically fetch and filter the CDN file tree. Defaults to standard flat array.
 * @property {string} [basePath]         - Optional base path to strip from remote file paths when saving locally (used with "regex-tree").
 * @property {string[]} [keepPatterns]   - Optional array of RegExp strings. A file must match at least one to be kept (used with "regex-tree").
 * @property {string[]} [ignorePatterns] - Optional array of RegExp strings. A file matching any of these will be dropped (used with "regex-tree").
 * @property {Function} getBaseUrl       - Function returning the base jsDelivr CDN URL. Used by the download engine to fetch the files for a specific version.
 * @property {string[]} [files]          - Array of exact filenames. Required if strategy is not "regex-tree". Used by the download engine to fetch files, and listed in `_vendor-update.log` and `_VENDOR-INFO.md`.
 */
const FAMOUSKAI_VENDORS = [
    {
        id: "ace-editor",
        name: "Ace Editor",
        description: "Ajax.org Cloud9 Editor",
        license: "BSD-3-Clause",
        repoUrl: "https://github.com/ajaxorg/ace",
        npmPackage: "ace-builds",
        copyright: "Copyright (c) 2010, Ajax.org B.V.",
        role: "Core text editing engine",
        getBaseUrl: (version) => `https://cdn.jsdelivr.net/npm/ace-builds@${version}/src-min-noconflict/`,
        files: [
            'ace.js',
            'ext-searchbox.js',
            'mode-css.js',
            'mode-csv.js',
            'mode-diff.js',
            'mode-html.js',
            'mode-javascript.js',
            'mode-json.js',
            'mode-markdown.js',
            'mode-svg.js',
            'mode-text.js',
            'mode-xml.js',
            'mode-yaml.js',
            'worker-css.js',
            'worker-html.js',
            'worker-javascript.js',
            'worker-json.js',
            'worker-xml.js',
            'worker-yaml.js'
        ]
    },
    {
        id: "marked",
        name: "Marked",
        description: "Ultra-fast markdown parser and compiler",
        license: "MIT",
        repoUrl: "https://github.com/markedjs/marked",
        npmPackage: "marked",
        copyright: "Copyright (c) 2018+, MarkedJS. Copyright (c) 2011-2018, Christopher Jeffrey.",
        role: "Ultra-fast Markdown parser for live preview",
        getBaseUrl: (version) => `https://cdn.jsdelivr.net/npm/marked@${version}/lib/`,
        files: [
            'marked.umd.min.js'
        ]
    },
    {
        id: "js-beautify",
        name: "js-beautify",
        description: "Code formatting and indentation tools",
        license: "MIT",
        repoUrl: "https://github.com/beautifier/js-beautify",
        npmPackage: "js-beautify",
        copyright: "Copyright (c) 2007-2018 Einar Lielmanis, Liam Newman, and contributors.",
        role: "Code formatting and indentation tools",
        getBaseUrl: (version) => `https://cdn.jsdelivr.net/npm/js-beautify@${version}/js/lib/`,
        files: [
            'beautify.min.js',
            'beautify-css.min.js',
            'beautify-html.min.js'
        ]
    },
    {
        id: "idb-keyval",
        name: "idb-keyval",
        description: "Promise-based IndexedDB storage",
        license: "Apache-2.0",
        repoUrl: "https://github.com/jakearchibald/idb-keyval",
        npmPackage: "idb-keyval",
        copyright: "Copyright 2016, Jake Archibald.",
        role: "Promise-based IndexedDB storage",
        getBaseUrl: (version) => `https://cdn.jsdelivr.net/npm/idb-keyval@${version}/dist/`,
        files: [
            'umd.min.js'
        ]
    },
    {
        id: "diff2html",
        name: "Diff2Html",
        description: "Fast diff-to-HTML generator (parser + renderer, no UI/highlight wrapper)",
        license: "MIT",
        repoUrl: "https://github.com/rtfpessoa/diff2html",
        npmPackage: "diff2html",
        copyright: "Copyright 2014-present Rodrigo Fernandes.",
        role: "Read-only pretty rendering of .patch/.diff files in the Preview pane",
        getBaseUrl: (version) => `https://cdn.jsdelivr.net/npm/diff2html@${version}/bundles/`,
        files: [
            'js/diff2html.min.js',
            'css/diff2html.min.css'
        ]
    },
    {
        id: "dompurify",
        name: "DOMPurify",
        description: "DOM-only XSS sanitizer for HTML, MathML and SVG",
        license: "MPL-2.0 OR Apache-2.0",
        repoUrl: "https://github.com/cure53/DOMPurify",
        npmPackage: "dompurify",
        copyright: "Copyright (c) Dr.-Ing. Mario Heiderich, Cure53.",
        role: "Sanitizes the rendered Markdown preview and HTML export",
        getBaseUrl: (version) => `https://cdn.jsdelivr.net/npm/dompurify@${version}/dist/`,
        files: [
            'purify.min.js'
        ]
    },
    {
        id: "monaco-editor",
        name: "Monaco Editor",
        description: "The code editor that powers VS Code",
        license: "MIT",
        repoUrl: "https://github.com/microsoft/monaco-editor",
        npmPackage: "monaco-editor",
        copyright: "Copyright (c) Microsoft Corporation.",
        role: "Diff/Merge resolution engine (Diffskai)",
        strategy: "regex-tree",
        basePath: "/min/vs/",
        getBaseUrl: (version) => `https://cdn.jsdelivr.net/npm/monaco-editor@${version}`,
        keepPatterns: [
            "^/min/vs/assets/",
            "^/min/vs/basic-languages/monaco\\.contribution\\.js$",
            "^/min/vs/editor/",
            "^/min/vs/language/(css|html|json|typescript)/",
            "^/min/vs/(css|html|javascript|json|markdown|ts|typescript|xml|yaml)[a-zA-Z0-9_.-]*\\.js$",
            "^/min/vs/loader\\.js$",
            "^/min/vs/nls\\.messages-loader\\.js$",
            "^/min/vs/(editor|index|initialize|lspLanguageFeatures|main|monaco\\.contribution|toggleHighContrast|workers)[a-zA-Z0-9_.-]*\\.(js|css)$"
        ],
        ignorePatterns: [
            "\\.map$",                      // Ignore heavy source maps
            "^/min/vs/nls/lang/"            // Ignore foreign localizations (keeps English default)
        ]
    },
    {
        id: "fontsource-oswald",
        name: "Oswald (Fontsource)",
        description: "Headings font of the Markdown preview themes",
        license: "OFL-1.1",
        repoUrl: "https://github.com/googlefonts/OswaldFont",
        npmPackage: "@fontsource/oswald",
        copyright: "Copyright 2016 The Oswald Project Authors (https://github.com/googlefonts/OswaldFont)",
        role: "Headings font of the Markdown preview themes (weights 500 and 700, latin subset)",
        getBaseUrl: (version) => `https://cdn.jsdelivr.net/npm/@fontsource/oswald@${version}/`,
        files: [
            'files/oswald-latin-500-normal.woff2',
            'files/oswald-latin-700-normal.woff2',
            'LICENSE'
        ]
    }
];
