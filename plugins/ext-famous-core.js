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
 * Famouskai Editor - "Famous Mark" Core Concept (Single Source of Truth)
 *
 * 100% Famouskai-proprietary concept: "Famous Marks" is the family name of
 * three Unicode characters (Famous Arrow ﹥, Magic Dot •, Flying Bubble °)
 * that act as universal markers recognized by EVERY module that needs them
 * (Outline bookmarking, ACE code-folding, Snippets contextual help).
 *
 * This file is the ONLY place where:
 *   - the list of characters is declared,
 *   - the anchoring pattern (tolerated comment prefixes + character) is defined,
 *   - the canonical detection regex is built.
 *
 * No other file should redefine its own detection regex.
 * Every consumer MUST read from window.FamousPluginCore.FamousMark.
 *
 * LOAD ORDER: this script must be loaded BEFORE ext-outline.js, ext-snippets.js,
 * and before the main inline script of index.html (which uses it for the
 * ACE folding patch). See index.html, <script> section of <head>/<body>.
 * -------------------------------------------------------------------------
 */

window.FamousPluginCore = window.FamousPluginCore || {};

window.FamousPluginCore.FamousMark = (function () {

    // --- 1. Canonical character declaration ------------------------------
    // Semantic name -> { char, label }
    // Adding a 4th marker = adding ONE line here, nothing else.
    /**
     * Map of supported Famous Marks with their Unicode character and human-readable label.
     * @type {Object.<string, {char: string, label: string}>}
     * @example
     * const mark = FamousMark.MARKS.arrow; // { char: "\uFE65", label: "Famous arrow" }
     */
    const MARKS = {
        arrow:   { char: "\uFE65", label: "Famous arrow"  }, // ﹥
        magic:   { char: "\u2022", label: "Magic dot"     }, // •
        bubble:  { char: "\u00B0", label: "Flying bubble" }  // °
    };

    // --- 2. Character class auto-derived from MARKS -----------------------
    /**
     * Concatenated string of all supported Famous Mark characters used in regexes.
     * @type {string}
     * @example
     * console.log(FamousMark.CHAR_CLASS); // "\uFE65\u2022\u00B0"
     */
    const CHAR_CLASS = Object.values(MARKS).map(m => m.char).join("");

    // --- 3. Comment prefixes tolerated before the marker -------------------
    // //  /*  <!--  #  %  ;  - @
    /**
     * String class of tolerated comment prefix characters before a Famous Mark.
     * @type {string}
     * @example
     * console.log(FamousMark.PREFIX_CLASS); // "/!<*\\-#%;@"
     */
    const PREFIX_CLASS = "/!<*\\-#%;@";

    // --- 4. Canonical regex (anchored at line start) -----------------------
    // Group 1 = bookmark text after the marker.
    // Tolerates a trailing comment closer (--> or */).
    /**
     * Canonical regex matching lines anchored with a Famous Mark and capturing bookmark text.
     * Group 1 contains the extracted bookmark label text.
     * @type {RegExp}
     * @example
     * const match = "// ﹥ Section Title".match(FamousMark.regex);
     * console.log(match[1]); // "Section Title"
     */
    const regex = new RegExp(
        "^\\s*[" + PREFIX_CLASS + "]*\\s*[" + CHAR_CLASS + "]\\s*(.*?)\\s*(?:-->|\\*/)?\\s*$"
    );

    // --- 5. Lightweight "detection only" variant for test()-style needs ----
    // Used by the ACE folding patch: same anchoring guarantees,
    // no capture group (marginal perf gain, but mainly a dedicated API
    // so folding logic never depends on the exact shape of the captured group).
    const detectRegex = new RegExp(
        "^\\s*[" + PREFIX_CLASS + "]*\\s*[" + CHAR_CLASS + "]"
    );

    return {
        /**
         * Map of supported Famous Marks with their Unicode character and human-readable label.
         * @type {Object.<string, {char: string, label: string}>}
         * @example
         * const mark = FamousMark.MARKS.arrow; // { char: "\uFE65", label: "Famous arrow" }
         */
        MARKS: MARKS,

        /**
         * Concatenated string of all supported Famous Mark characters.
         * @type {string}
         * @example
         * console.log(FamousMark.CHAR_CLASS); // "\uFE65\u2022\u00B0"
         */
        CHAR_CLASS: CHAR_CLASS,

        /**
         * String class of tolerated comment prefix characters before a Famous Mark.
         * @type {string}
         * @example
         * console.log(FamousMark.PREFIX_CLASS); // "/!<*\\-#%;@"
         */
        PREFIX_CLASS: PREFIX_CLASS,

        /**
         * Canonical regex matching lines anchored with a Famous Mark.
         * @type {RegExp}
         * @example
         * const match = FamousMark.regex.exec("// ﹥ Section Title");
         */
        regex: regex,

        /**
         * Fast boolean check to test if a line begins with a Famous Mark (with optional comment prefix).
         * Used for code folding and quick detection.
         * @param {string} line - The text line to test.
         * @returns {boolean} True if line starts with a valid Famous Mark pattern, false otherwise.
         * @example
         * FamousMark.test("// ﹥ My Bookmark"); // returns true
         */
        test: function (line) {
            return detectRegex.test(line);
        },

        /**
         * Full regex match execution against a line to extract the Famous Mark label text.
         * Used for Outline bookmarking.
         * @param {string} line - The text line to match.
         * @returns {RegExpMatchArray|null} Match result array where index 1 contains extracted text, or null if no match.
         * @example
         * const res = FamousMark.match("// • Task Item");
         * console.log(res ? res[1] : null); // "Task Item"
         */
        match: function (line) {
            return line.match(regex);
        }
    };

})();
