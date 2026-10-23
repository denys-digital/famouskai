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
 * Ace Editor Custom Mode:
 * ﹥ YAML Smart Folding Rules
 *
 * This module defines a custom Ace FoldMode for YAML files (ace/mode/folding/famous_yaml).
 * It replaces stock indentation folding to handle YAML-specific constructs:
 * 1. Key-form openers (key: with no inline value, including lists at the same indent).
 * 2. Dash key form (- key:) and list-item openers (- item with indented children).
 * 3. Stopping body ranges cleanly before column-0 document markers (--- / ...).
 * 4. Excluding blank lines, comment lines, and block scalar bodies (| / >) from fold widgets.
 */
ace.define('ace/mode/folding/famous_yaml', function(require, exports, module) {
    "use strict";

    var oop = require("ace/lib/oop");
    var BaseFoldMode = require("ace/mode/folding/fold_mode").FoldMode;
    var Range = require("ace/range").Range;

    var FoldMode = exports.FoldMode = function() {};
    oop.inherits(FoldMode, BaseFoldMode);

    (function() {

        function getIndent(line) {
            var match = line.match(/^(\s*)/);
            return match ? match[1].length : 0;
        }

        function isBlank(line) {
            return /^\s*$/.test(line);
        }

        function isComment(line) {
            return /^\s*#/.test(line);
        }

        function isRealDocMarker(line) {
            return /^(?:---|\.\.\.)/.test(line);
        }

        function hasBlockScalarHeader(line) {
            if (!line || isBlank(line) || isComment(line) || isRealDocMarker(line)) return false;
            var indent = getIndent(line);
            var rest = line.slice(indent).replace(/^-\s*/, "");
            var keyMatch = rest.match(/^(?:"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\')*'|[^?#\s:][^:#]*?)\s*:/);
            if (!keyMatch) return false;

            var afterColon = rest.slice(keyMatch[0].length);
            var cleaned = afterColon
                .replace(/^\s+/, "")
                .replace(/^&[^\s#]+/, "")
                .replace(/^\s+/, "")
                .replace(/^![^\s#]+/, "")
                .replace(/^\s+/, "");

            return /^[|>][\-+1-9]*\s*(?:#[^\r\n]*)?$/.test(cleaned);
        }

        function isInsideBlockScalar(session, row) {
            var line = session.getLine(row);
            if (!line || isBlank(line) || isComment(line) || isRealDocMarker(line)) return false;

            // Walk up through the lines that enclose this row (each one less indented than
            // every line seen so far). If one of them is a "key: |" or "key: >" header, every
            // line between it and this row is more indented, so this row is scalar text.
            var minIndent = getIndent(line);
            for (var r = row - 1; r >= 0 && minIndent > 0; r--) {
                var prev = session.getLine(r);
                if (!prev || isBlank(prev) || isComment(prev)) continue;
                if (isRealDocMarker(prev)) break;

                var prevIndent = getIndent(prev);
                if (prevIndent >= minIndent) continue;
                if (hasBlockScalarHeader(prev)) return true;
                minIndent = prevIndent;
            }
            return false;
        }

        function parseOpener(session, row) {
            var line = session.getLine(row);
            if (!line || isBlank(line) || isComment(line) || isRealDocMarker(line)) {
                return null;
            }
            if (isInsideBlockScalar(session, row)) {
                return null;
            }

            var rawIndent = getIndent(line);
            var rest = line.slice(rawIndent);
            var isDash = false;

            if (/^-\s+/.test(rest) || /^-\t/.test(rest) || rest === "-") {
                isDash = true;
                rest = rest.replace(/^-\s*/, "");
            }

            var refIndent = rawIndent;

            var keyMatch = rest.match(/^(?:"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\')*'|[^?#\s:][^:#]*?)\s*:/);

            if (keyMatch) {
                var afterColon = rest.slice(keyMatch[0].length);
                var cleaned = afterColon
                    .replace(/^\s+/, "")
                    .replace(/^&[^\s#]+/, "")
                    .replace(/^\s+/, "")
                    .replace(/^![^\s#]+/, "")
                    .replace(/^\s+/, "")
                    .replace(/^[|>][\-+1-9]*/, "")
                    .replace(/^\s+/, "")
                    .replace(/^#[^\r\n]*/, "")
                    .trim();

                if (cleaned === "") {
                    return {
                        type: "key_form",
                        refIndent: refIndent,
                        isDash: isDash
                    };
                }
            }

            if (isDash) {
                var maxRow = session.getLength();
                for (var r = row + 1; r < maxRow; r++) {
                    var nextLine = session.getLine(r);
                    if (!nextLine || isBlank(nextLine)) continue;
                    if (isRealDocMarker(nextLine)) break;

                    var nextIndent = getIndent(nextLine);
                    if (nextIndent > refIndent) {
                        return {
                            type: "list_item_form",
                            refIndent: refIndent,
                            isDash: true
                        };
                    } else {
                        break;
                    }
                }
            }

            return null;
        }

        this.getFoldWidgetRange = function(session, foldStyle, row) {
            var opener = parseOpener(session, row);
            if (!opener) return null;

            var maxRow = session.getLength();
            var endRow = -1;

            for (var r = row + 1; r < maxRow; r++) {
                var line = session.getLine(r);

                if (isRealDocMarker(line)) {
                    break;
                }

                if (isBlank(line)) {
                    continue;
                }

                var lineIndent = getIndent(line);

                if (lineIndent > opener.refIndent) {
                    endRow = r;
                    continue;
                }

                var rest = line.slice(lineIndent);
                var isLineDash = /^-\s+/.test(rest) || /^-\t/.test(rest) || rest === "-";

                if (opener.type === "key_form" && !opener.isDash && lineIndent === opener.refIndent && isLineDash) {
                    endRow = r;
                    continue;
                }

                break;
            }

            if (endRow === -1) {
                return null;
            }

            var startCol = session.getLine(row).length;
            var endCol = session.getLine(endRow).length;

            return new Range(row, startCol, endRow, endCol);
        };

        // Ace calls this for every visible row on each render, so it only looks at the next
        // non-blank line instead of computing the whole range: the range exists exactly
        // when that line belongs to the body (see getFoldWidgetRange).
        this.getFoldWidget = function(session, foldStyle, row) {
            var opener = parseOpener(session, row);
            if (!opener) return "";

            var maxRow = session.getLength();
            for (var r = row + 1; r < maxRow; r++) {
                var line = session.getLine(r);
                if (isRealDocMarker(line)) return "";
                if (isBlank(line)) continue;

                var lineIndent = getIndent(line);
                if (lineIndent > opener.refIndent) return "start";

                var rest = line.slice(lineIndent);
                var isLineDash = /^-\s+/.test(rest) || /^-\t/.test(rest) || rest === "-";
                if (opener.type === "key_form" && !opener.isDash && lineIndent === opener.refIndent && isLineDash) return "start";
                return "";
            }
            return "";
        };

    }).call(FoldMode.prototype);
});

window.FamousPluginCore = window.FamousPluginCore || {};
window.FamousPluginCore.YamlFolding = {
    apply: function(session) {
        var FamousYamlFoldMode = ace.require("ace/mode/folding/famous_yaml").FoldMode;
        session.$setFolding(new FamousYamlFoldMode());
    }
};
