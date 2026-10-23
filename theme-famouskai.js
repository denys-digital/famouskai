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
ace.define("ace/theme/famouskai", ["require", "exports", "module", "ace/lib/dom"], function(require, exports, module) {
    exports.isDark = true;
    exports.cssClass = "ace-famouskai";
    exports.cssText = `
        /* ==========================================================================
           ﹥ 1. ROOT VARIABLES (THEME PALETTE)
                 All the editor's base colors are defined here.
           ========================================================================== */
        .ace-famouskai {
            /* --- Surfaces & UI --- */
            --bg-editor: #202124;
            --bg-selection: #49483E;
            --bg-active-line: #2f3033;
            
            --editor-accent: #8ab4f8;
            --editor-muted: #5f6368;
            
            /* --- Textes de base --- */
            --text-main: #F8F8F2;      /* --fm-light: main text (fallback, languages override it) */
            --text-muted: #9AA0A6;     /* --fm-gray-light: comments (fallback, languages override it) */
            
            /* --- Tokens de Syntaxe (Fallback universel) --- */
            --token-accent: #AE81FF;    /* --fm-purple: keywords, cursors, tags */
            --token-variable: #F95B56;  /* --fm-red: variables, identifiers */
            --token-string: #60D673;    /* --fm-emerald: strings */
            --token-function: #FFDB0F;  /* --fm-gold: functions, classes */
            --token-constant: #FF96DA;  /* --fm-carnation: numbers, booleans, attributes */

            /* Application au conteneur principal */
            background-color: var(--bg-editor); 
            color: var(--text-main); 
        }
        
        /* ==========================================================================
           ﹥ 2. EDITOR UI (gutter, cursor, selection)
           ========================================================================== */
        .ace-famouskai .ace_cursor { color: var(--editor-accent); border-left: 2px solid var(--editor-accent); }
        .ace-famouskai .ace_marker-layer .ace_selection { background: var(--bg-selection); }
        .ace-famouskai .ace_marker-layer .ace_active-line { background: var(--bg-active-line); }
        .ace-famouskai .ace_gutter-active-line { background-color: var(--bg-active-line); color: var(--text-main); }
        
        .ace-famouskai .ace_gutter { background: var(--bg-editor); color: var(--editor-muted); border-right: none; }
        .ace-famouskai .ace_indent-guide { background: none; border-left: 1px dotted var(--editor-muted); opacity: 0.4; }
        
        .ace-famouskai .ace_layer.ace_text-layer { border-left: 1px dotted color-mix(in srgb, var(--editor-muted), #000 35%); }
        
        /* ==========================================================================
           ﹥ 3. BASE SYNTAX HIGHLIGHTING (Universal)
                 These rules apply if no language-specific definition is set.
           ========================================================================== */
        /* Comments */
        .ace-famouskai .ace_comment { color: var(--text-muted); }
        
        /* Control keywords and Declarations */
        .ace-famouskai .ace_keyword,
        .ace-famouskai .ace_storage,
        .ace-famouskai .ace_meta.ace_tag,
        .ace-famouskai .ace_tag-name { color: var(--token-accent); font-weight: normal; }
        
        /* Strings */
        .ace-famouskai .ace_string,
        .ace-famouskai .ace_meta.ace_string,
        .ace-famouskai .ace_attribute-value { color: var(--token-string); }
        
        /* Numbers and constants */
        .ace-famouskai .ace_numeric,
        .ace-famouskai .ace_boolean,
        .ace-famouskai .ace_constant,
        .ace-famouskai .ace_entity.ace_other.ace_attribute-name { color: var(--token-constant); }
        
        /* Function names and system calls */
        .ace-famouskai .ace_entity.ace_name.function,
        .ace-famouskai .ace_support.ace_class { color: var(--token-function); }
        
        /* Variables and arguments */
        .ace-famouskai .ace_support.ace_variable,
        .ace-famouskai .ace_variable,
        .ace-famouskai .ace_identifier { color: var(--token-variable); }
        
        /* Ponctuation & Operators */
        .ace-famouskai .ace_paren,
        .ace-famouskai .ace_lparen,
        .ace-famouskai .ace_keyword.ace_operator { color: var(--text-main); }

        /* Hyperlinks */
        .ace-famouskai .ace_markup.ace_underline { text-decoration: none; color: var(--token-accent); }

        /* --- Markdown links punctuation via Tokenizer JS (index.html) */
        .ace-famouskai .ace_paren.ace_bracket_title { color: var(--token-constant) !important; }
        .ace-famouskai .ace_paren.ace_bracket_url { color: var(--token-string) !important; }
        
        /* --- New dynamic brackets (outside Markdown links) --- */
        .ace-famouskai .ace_paren.ace_crochet { color: var(--text-main);  } /* !important; */

        /* ==========================================================================
           ﹥ 4. WIDGETS & FOLDING
           ========================================================================== */
           
        /* 1. Clean the native container */
        .ace-famouskai .ace_fold-widget {
            background-image: none !important;
            text-align: center !important;
        }

        /* 2. The element takes FULL line height (e.g., 21px) */
        .ace-famouskai .ace_fold-widget::before {
            content: "";
            display: inline-block;
            box-sizing: border-box;
            width: 14px;
            height: 100%;
            background-position: center;
            background-repeat: no-repeat;
            background-size: 14px 14px;
            opacity: 0.6;
            transition: opacity 0.2s;
        }

        /* 3. SVG Icons (Default neutral gray: %239aa0a6) */
        .ace-famouskai .ace_fold-widget.ace_closed::before { 
            background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%239aa0a6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>');
        }
        .ace-famouskai .ace_fold-widget.ace_open::before { 
            background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%239aa0a6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>');
        }

        /* 4. Hover (Goes to 100% opacity and becomes ChromeOS Blue: %238ab4f8) */
        .ace-famouskai .ace_fold-widget.ace_closed:hover::before {
            opacity: 1;
            background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%238ab4f8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>');
        }
        .ace-famouskai .ace_fold-widget.ace_open:hover::before {
            opacity: 1;
            background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%238ab4f8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>');
        }
        
        /* ==========================================================================
           ﹥ Revamp of the "Folded Text" block (...) in the middle of the code
           ========================================================================== */
         .ace-famouskai .ace_fold {
            background-image: none !important; 
            background-color: var(--bg-active-line) !important;
            border: 1px solid var(--editor-muted) !important;
            border-radius: 4px !important;
            color: var(--editor-accent) !important; 
            
            padding: 0 10px !important;
            margin: 0 4px !important;
            letter-spacing: 2px !important;
            font-size: 14px !important;
            
            height: 18px !important; 
            font-weight: bold;
            display: inline-flex !important;
            align-items: center;
            justify-content: center;
            vertical-align: middle !important;
            box-shadow: 0 1px 3px rgba(0,0,0,0.3);
            transition: all 0.2s;
        }
        
        .ace-famouskai .ace_fold:hover { 
            background-color: var(--editor-accent) !important; 
            color: var(--bg-editor) !important; 
            border-color: var(--editor-accent) !important; 
        }
    `;

    var dom = require("ace/lib/dom");
    dom.importCssString(exports.cssText, exports.cssClass);
});