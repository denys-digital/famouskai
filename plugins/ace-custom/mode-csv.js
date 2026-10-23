/**
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
 * Ace Editor Custom Mode: CSV / TSV File Highlighter with 10-Color Column Cycling
 *
 * Adapted from Ace Editor's builtin CSV mode (vendor/ace-builds/mode-csv.js).
 * Copyright (c) 2010, Ajax.org B.V. BSD License.
 *
 * Features:
 * - 10-color fixed column cycle: csv_col_1 .. csv_col_10 (wraps at column 11 back to 1).
 * - Distinct tokens for separators (csv_separator) and quotes (csv_quote).
 * - Multi-line quoted field state tracking across line boundaries (string-<n>).
 * - Automatic separator detection for CSV/TSV/DSV files via window.FamousPluginCore.CsvMode.detectSeparator(text).
 */

ace.define('ace/mode/csv_highlight_rules', function(require, exports, module) {
    var oop = require("ace/lib/oop");
    var TextHighlightRules = require("ace/mode/text_highlight_rules").TextHighlightRules;

    var CsvHighlightRules = function() {
        this.$rules = {
            "start": []
        };
    };

    oop.inherits(CsvHighlightRules, TextHighlightRules);
    exports.CsvHighlightRules = CsvHighlightRules;
});

ace.define('ace/mode/csv', function(require, exports, module) {
    var oop = require("ace/lib/oop");
    var TextMode = require("ace/mode/text").Mode;
    var escapeRegExp = require("ace/lib/lang").escapeRegExp;
    var CsvHighlightRules = require("ace/mode/csv_highlight_rules").CsvHighlightRules;

    function tokenizeCsvLine(line, state, options) {
        var tokens = [];
        var parts = line.split(options.separatorRegex);
        var splitter = options.spliter;
        var quote = options.quote;

        var stateParts = (state || "start").split("-");
        var colIndex = parseInt(stateParts[1], 10) || 0;
        var inString = stateParts[0] === "string";
        var isCellBoundary = !inString;

        for (var i = 0; i < parts.length; i++) {
            var p = parts[i];
            if (!p) continue;

            var isSep = false;
            var isQuoteToken = false;

            if (p === splitter && !inString) {
                colIndex++;
                isCellBoundary = true;
                isSep = true;
            } else if (p === quote) {
                isQuoteToken = true;
                if (isCellBoundary) {
                    inString = true;
                    isCellBoundary = false;
                } else if (inString) {
                    if (parts[i + 1] === "" && parts[i + 2] === quote) {
                        p = quote + quote;
                        i += 2;
                    } else {
                        inString = false;
                    }
                }
            } else {
                isCellBoundary = false;
            }

            var tokenType;
            if (isSep) {
                tokenType = "csv_separator";
            } else if (isQuoteToken) {
                tokenType = "csv_quote";
            } else {
                var colorNum = (colIndex % 10) + 1;
                tokenType = "csv_col_" + colorNum;
            }

            tokens.push({
                value: p,
                type: tokenType
            });
        }

        var nextState = inString ? ("string-" + colIndex) : "start";
        return {
            tokens: tokens,
            state: nextState
        };
    }

    var Mode = function(options) {
        this.HighlightRules = CsvHighlightRules;
        options = options || {};
        var splitter = options.splitter || ",";
        var quote = options.quote || '"';
        var regexStr = "(" + escapeRegExp(splitter) + "|" + escapeRegExp(quote) + ")";

        this.$tokenizer = {
            getLineTokens: function(line, state) {
                return tokenizeCsvLine(line, state, this.options);
            },
            options: {
                quote: quote,
                spliter: splitter,
                splitter: splitter,
                separatorRegex: new RegExp(regexStr)
            },
            states: {}
        };
        this.$highlightRules = new this.HighlightRules();
    };

    oop.inherits(Mode, TextMode);

    (function() {
        this.getTokenizer = function() {
            return this.$tokenizer;
        };
        this.$id = "ace/mode/csv";
    }).call(Mode.prototype);

    exports.Mode = Mode;
});

// Expose CsvMode helper under FamousPluginCore namespace
window.FamousPluginCore = window.FamousPluginCore || {};
window.FamousPluginCore.CsvMode = {
    /**
     * Detects the primary CSV separator for a given text payload.
     * Algorithm:
     * - Inspects up to the first 20 non-empty lines.
     * - Counts occurrences of candidates (;, \t, ,, |) outside double quotes.
     * - Keeps candidates whose count is > 0 and identical on at least 80% of lines.
     * - Returns the candidate with the highest count.
     * - Ties resolved in order: ;, \t, ,, |
     * - Default fallback: ,
     *
     * @param {string} text Raw text content
     * @returns {string} Detected separator character (;, \t, ,, or |)
     */
    detectSeparator: function(text) {
        if (!text || typeof text !== 'string') {
            return ',';
        }

        var lines = text.split(/\r?\n/).filter(function(line) {
            return line.trim() !== '';
        }).slice(0, 20);

        if (lines.length === 0) {
            return ',';
        }

        function countOutsideQuotes(line, delim) {
            var count = 0;
            var inQuotes = false;
            for (var i = 0; i < line.length; i++) {
                var ch = line[i];
                if (ch === '"') {
                    inQuotes = !inQuotes;
                } else if (!inQuotes && ch === delim) {
                    count++;
                }
            }
            return count;
        }

        var candidates = [';', '\t', ',', '|'];
        var bestCandidate = ',';
        var maxCount = 0;
        var totalLines = lines.length;

        for (var c = 0; c < candidates.length; c++) {
            var delim = candidates[c];
            var freq = {};

            for (var l = 0; l < totalLines; l++) {
                var cnt = countOutsideQuotes(lines[l], delim);
                freq[cnt] = (freq[cnt] || 0) + 1;
            }

            // Find count C > 0 with max line frequency
            var bestCountForDelim = 0;
            var maxFreq = 0;

            for (var cntStr in freq) {
                var cntVal = parseInt(cntStr, 10);
                if (cntVal > 0 && freq[cntStr] > maxFreq) {
                    maxFreq = freq[cntStr];
                    bestCountForDelim = cntVal;
                }
            }

            // Check if count > 0 and present on at least 80% of lines
            if (bestCountForDelim > 0 && (maxFreq / totalLines) >= 0.8) {
                if (bestCountForDelim > maxCount) {
                    maxCount = bestCountForDelim;
                    bestCandidate = delim;
                }
            }
        }

        return bestCandidate;
    }
};
