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
window.FamousPluginCore.Manager.register({
    name: "Beautify selection",
    extensions: ['js', 'ts', 'json', 'html', 'xml', 'svg', 'css', 'md', ''],
    confirmMsg: "Do you want to format only the selected text?\n\n(Your line breaks will be preserved).",
    toolbar: {
        letter: "B",
        color: "var(--fm-lime)"
    },
    
    action: function(editor) {
        const selectedText = editor.session.getTextRange(editor.getSelectionRange());
        if (!selectedText) {
            alert("Please select the code block to format first!");
            return;
        }

        const mode = editor.session.$modeId;
        let formattedText = selectedText;

        const options = {
            indent_size: 4,
            indent_char: " ",
            preserve_newlines: true,
            max_preserve_newlines: 10,
            keep_array_indentation: false,
            break_chained_methods: false,
            indent_scripts: "normal",
            space_before_conditional: true,
            unescape_strings: false,
            jslint_happy: false,
            end_with_newline: false,
            indent_inner_html: false,
            comma_first: false,
            e4x: false,
            indent_empty_lines: false,
            brace_style: "collapse,preserve-inline",
            space_in_empty_paren: true,
            wrap_attributes: "auto",
            wrap_line_length: 0,
            unformatted: ['a', 'span', 'b', 'i', 'strong', 'em']
        };    
        
        try {
            const looksLikeMarkup = /^\s*<[a-zA-Z!]/.test(selectedText.trim());
        
            if (mode.includes('javascript') || mode.includes('json') ||
                ((mode.includes('html') || mode.includes('xml') || mode.includes('svg')) && !looksLikeMarkup)) {
                formattedText = js_beautify(selectedText, options);
                
            } else if (mode.includes('html') || mode.includes('xml') || mode.includes('markdown') || mode.includes('svg')) {
                if (typeof html_beautify !== 'undefined') {
                    formattedText = html_beautify(selectedText, options);
                } else {
                    alert("Error: beautify-html.min.js is missing.");
                    return;
                }
            } else if (mode.includes('css')) {
                if (typeof css_beautify !== 'undefined') {
                    formattedText = css_beautify(selectedText, options);
                } else {
                    alert("Error: beautify-css.min.js is missing.");
                    return;
                }
            }
        } catch (e) {
            alert("Formatting error: " + e.message);
            return;
        }
        
        editor.session.replace(editor.getSelectionRange(), formattedText);
    }
});