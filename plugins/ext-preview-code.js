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
 * Famouskai Editor Extension:
 * ﹥ Preview code blocks (`ext-preview-code.js`)
 *
 * Simplified coloring of fenced code blocks in the Markdown preview and in HTML exports:
 * code text in dark blue (preview-themes.css) and function names in bold.
 * No syntax engine, no dependency: it only marks identifiers followed by "(".
 *
 * Safety: it reads and splits text nodes and builds elements with createElement, so it
 * never turns text into HTML. Run it after DOMPurify, like FamousUp.process().
 */
window.FamousPluginCore = window.FamousPluginCore || {};

window.FamousPluginCore.PreviewCode = {
    /** Words that are followed by "(" without being a function name. */
    NOT_FUNCTIONS: ['if', 'for', 'while', 'switch', 'catch', 'return', 'typeof', 'function', 'elif', 'and', 'or', 'not', 'in', 'with', 'sizeof', 'new', 'await', 'yield', 'print'],

    /** Fence languages left untouched (parentheses mean nothing there). */
    SKIPPED_LANGUAGES: ['text', 'txt', 'plaintext', 'md', 'markdown', 'csv', 'log'],

    /**
     * Marks function names in every `pre > code` block under rootEl.
     * @param {HTMLElement} rootEl - The rendered preview (or a detached export container)
     */
    process: function(rootEl) {
        if (!rootEl) return;
        rootEl.querySelectorAll('pre > code').forEach(code => {
            const lang = (code.className.match(/language-([\w+-]+)/) || [])[1];
            if (lang && this.SKIPPED_LANGUAGES.includes(lang.toLowerCase())) return;
            this.markFunctions(code);
        });
    },

    /**
     * Wraps each function name of the block's text nodes in <span class="preview-code-fn">.
     * @param {HTMLElement} codeEl
     */
    markFunctions: function(codeEl) {
        const walker = document.createTreeWalker(codeEl, NodeFilter.SHOW_TEXT);
        const textNodes = [];
        while (walker.nextNode()) textNodes.push(walker.currentNode);

        const pattern = /[A-Za-z_$][\w$]*(?=\s*\()/g;
        textNodes.forEach(node => {
            const text = node.nodeValue;
            pattern.lastIndex = 0;
            let match, last = 0;
            const fragment = document.createDocumentFragment();
            while ((match = pattern.exec(text)) !== null) {
                // Skip a match that starts inside a word ("3abc(" is not a name).
                // After a dot it is a method name: "a.b(" marks "b".
                if (match.index > 0 && /[\w$]/.test(text[match.index - 1])) continue;
                if (this.NOT_FUNCTIONS.includes(match[0])) continue;
                fragment.appendChild(document.createTextNode(text.slice(last, match.index)));
                const span = document.createElement('span');
                span.className = 'preview-code-fn';
                span.textContent = match[0];
                fragment.appendChild(span);
                last = match.index + match[0].length;
            }
            if (last === 0) return;
            fragment.appendChild(document.createTextNode(text.slice(last)));
            node.parentNode.replaceChild(fragment, node);
        });
    }
};
