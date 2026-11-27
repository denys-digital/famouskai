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
 */

window.FamousPluginCore = window.FamousPluginCore || {};

/**
 * JSON Outline Extension for Famouskai
 * Pure function extracting top two levels of keys from objects.
 */
window.FamousPluginCore.JsonOutline = {
    /**
     * Keys of the first two levels of objects of a JSON text, in document order
     * Keys inside arrays and deeper keys
     * are not listed. Never throws, even on invalid JSON.
     *
     * @param {string} text - the JSON text
     * @returns {Array<{line: number, level: number, text: string}>} line is 0-based, level 1 or 2
     */
    outline: function (text) {
        const results = [];
        if (!text || typeof text !== 'string') {
            return results;
        }

        let line = 0;
        const stack = [];
        let i = 0;
        const len = text.length;

        while (i < len) {
            const c = text[i];

            if (c === '\n') {
                line++;
                i++;
                continue;
            }

            if (c === '{' || c === '[') {
                stack.push(c);
                i++;
                continue;
            }

            if (c === '}' || c === ']') {
                stack.pop();
                i++;
                continue;
            }

            if (c === '"') {
                const startLine = line;
                i++;
                let s = '';
                while (i < len) {
                    const ch = text[i];
                    if (ch === '\n') {
                        line++;
                        s += ch;
                        i++;
                    } else if (ch === '\\') {
                        if (i + 1 < len) {
                            s += ch + text[i + 1];
                            i += 2;
                        } else {
                            s += ch;
                            i++;
                        }
                    } else if (ch === '"') {
                        i++;
                        break;
                    } else {
                        s += ch;
                        i++;
                    }
                }

                while (i < len && (text[i] === ' ' || text[i] === '\t' || text[i] === '\r' || text[i] === '\n')) {
                    if (text[i] === '\n') {
                        line++;
                    }
                    i++;
                }

                if (i < len && text[i] === ':') {
                    if (stack.length === 1 || stack.length === 2) {
                        let allObjects = true;
                        for (let j = 0; j < stack.length; j++) {
                            if (stack[j] !== '{') {
                                allObjects = false;
                                break;
                            }
                        }
                        if (allObjects) {
                            results.push({
                                line: startLine,
                                level: stack.length,
                                text: s
                            });
                        }
                    }
                }
                continue;
            }

            i++;
        }

        return results;
    }
};
