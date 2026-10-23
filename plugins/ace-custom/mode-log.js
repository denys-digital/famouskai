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
 * ﹥ Log File Highlighter
 * 
 * This file serves as a showcase and tutorial for creating custom syntax 
 * highlighting and folding rules in the Ace Editor. 
 * 
 * Ace uses a state machine for syntax highlighting. You define "states" (like 'start'), 
 * and within each state, an array of rules. Each rule contains a regular expression 
 * and a token name. When the regex matches, the text is wrapped in a span with a CSS 
 * class corresponding to the token name (e.g., token "log-info" becomes class "ace_log-info").
 */
ace.define('ace/mode/log_highlight_rules', function(require, exports, module) {
    var oop = require("ace/lib/oop");
    var TextHighlightRules = require("ace/mode/text_highlight_rules").TextHighlightRules;

    var LogHighlightRules = function() {
        // Variables can be used to store complex regexes that are reused across different states.
        // This keeps the rule definitions clean and maintainable.
        var datetimeRegex = /(?:\d{2}\/[a-zA-Z]{3}\/\d{4}:\d{2}:\d{2}:\d{2}\s+[+-]\d{4})|(?:(?:[A-Z][a-z]{2}\s+)?[A-Z][a-z]{2}\s+\d{1,2}\s+\d{2}:\d{2}:\d{2}(?:\s+\d{4})?)|(?:\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}(?:[.,]\d+)?(?:Z|[+-]\d{2}:?\d{2})?)|(?:\b(?:\d{2}-\d{2}\s+)?\d{2}:\d{2}:\d{2}(?:[.,]\d{3})?\b)|(?:\b\d{4}\.\d{2}\.\d{2}\b)/;
        
        // this.$rules is the core of the Ace state machine. 
        // The editor always begins parsing lines in the "start" state.
        this.$rules = {
            "start" : [
                // RULES EVALUATION ORDER:
                // Ace evaluates these rules from top to bottom. 
                // The FIRST regex that matches a portion of the text wins.
                // Therefore, place highly specific rules at the top, and generic fallbacks at the bottom.

                { token: "log-ansi", regex: /\x1b\[[0-9;]*[a-zA-Z]/ },
                
                // 1. Comments
                // Using anchors like '^' ensures this rule only matches if the character is at the start of the line.
                { token: "log-comment", regex: /^[#=].*$/ },

                // 2. Timestamps and Dates
                { token: "log-at", regex: /^\s*at\b|^\s*>\s|(?<=[a-zA-Z])>\s|\s*\^|\s@\s|^\s*@\s/ }, 
                { token: "log-datetime", regex: datetimeRegex },

                // 3. Log Severity Levels
                // Multiple rules can assign different tokens to different keywords, allowing you 
                // to style FATAL errors differently than INFO messages in your CSS.
                { token: "log-critique",    regex: /(?:⨯)/ },
                { token: "log-info",        regex: /(?:✓)/ },
                { token: "log-critique",    regex: /(?:\b|(?<=[a-zA-Z]))(?:FATAL|CRITICAL|ERROR|error|EMERGENCY|ALERT|PANIC|SEVERE|DROP|FAIL|FATAL_ERR|Kernel panic|failure|failures|failed|Failed|FAILED)\b/ },
                { token: "log-warning",     regex: /(?:\b|(?<=[a-zA-Z]))(?:WARNING|Warning|warning|WARN|warn|ATTENTION|TIMEOUT|401|403|404|500|DENIED|forbidden|REJECTED|REUSED|Blocked|Violation|Forced|Invalid)\b/ },
                { token: "log-info",        regex: /(?:\b|(?<=[a-zA-Z]))(?:INFO|info|SUCCESS|Success|succeeded|OK|COMPLETION|NOTICE|200|CONNECTED|STARTED|INITIALIZED|DONE|PASSED|pass|ERR_INTERNET_DISCONNECTED|ERR_CONNECTION_REFUSED|ERR_FAILED|GET|POST|FETCH|Compiled|Can't)\b/ },
                { token: "log-debug",       regex: /(?:\b|(?<=[a-zA-Z]))(?:DEBUG|debug|TRACE|VERBOSE|FINE|FINER|FINEST|CONFIG|METRIC|DUMP|STATS|custom-level|Starting|Ready|Undefined|unknown|abnormally|invalid|root|password|required)\b/ },

                // 4. Network and File References - IP addresses (IPv4 and IPv6)
                { token: "log-ip", regex: /\b(?:\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}|(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4})\b/ },
                { token: "log-file", regex: /(?:(?:[\w.-]+\.[\w.-]+|(?:[\w.-]*\/)+[\w.-]+)(?:\?[\w=&.-]+)?|(?<=\))):\d+\b(?!:\d)/ },

                // 5. Stack Trace Elements
                { token: "log-more", regex: /^\s+\.\.\.\s\d+\smore\b/ },
                { token: "log-stacktrace", regex: /(?:Caused by:|^)\s*[a-zA-Z0-9_$]+(?:\.[a-zA-Z0-9_$]+)+Exception(?::.*)?/ }, 
                { token: "log-stacktrace", regex: /\b[a-zA-Z0-9_$]+\.(?:java|cs):\d+\b/ }, 

                // 6. Packages & Classes
                { token: "log-package", regex: /(?<=\s)[a-zA-Z0-9_]+\.[a-zA-Z0-9_]+\.[A-Z][a-zA-Z0-9_$]*(?=\s|$)/ },

                // 7. Encapsulated Content (Quotes, Brackets)
                { token: "log-quotes", regex: /"([^"\\]|\\.)*"/ },
                { token: "log-quotes", regex: /'([^'\\]|\\.)*'/ },
                { token: "log-brackets", regex: /\([^)]*\)/ },
                { token: "log-brackets", regex: /\{[^}]*\}/ },
                { token: "log-sqbrackets", regex: /[\[\]]/ },
                
                // STATE TRANSITIONS (next):
                // When this regex matches, Ace applies the "log-xml" token to the match, 
                // and then switches the parser into the "xml-tag" state defined below.
                { token: "log-xml", regex: /<\/?(?:[a-zA-Z0-9_.-]+)/, next: "xml-tag" },

                // 8. Message Body Transition
                // Logs often have a preamble followed by a separator (like " - "). 
                // This rule catches the separator and transitions the parser into the "message" state,
                // allowing us to apply different highlighting rules to the actual log payload.
                { token: "log-text", regex: /\s+-\s+/, next : "message" }
            ],
            
            // SECONDARY STATE: "message"
            // The parser enters this state after matching the " - " separator in the "start" state.
            "message" : [
                { token: "log-ansi", regex: /\x1b\[[0-9;]*[a-zA-Z]/ },

                { token: "log-datetime", regex: datetimeRegex },

                { token: "log-ip", regex: /\b(?:\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}|(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4})\b/ },

                { token: "log-quotes", regex: /"([^"\\]|\\.)*"/ },
                { token: "log-quotes", regex: /'([^'\\]|\\.)*'/ },
                { token: "log-brackets", regex: /\([^)]*\)/ },
                { token: "log-brackets", regex: /\{[^}]*\}/ },
                { token: "log-sqbrackets", regex: /[\[\]]/ },
                
                { token: "log-xml", regex: /<\/?(?:[a-zA-Z0-9_.-]+)/, next: "xml-tag" },
                
                // RETURNING TO START:
                // The '$' regex matches the end of the line. 
                // This ensures that when the line ends, the parser resets to the "start" state 
                // for the next line in the log file.
                { token: "log-text", regex: /$/, next : "start" },
                
                // DEFAULT TOKEN:
                // If no rules above match the current chunk of text, apply this token.
                // This prevents the parser from getting stuck and ensures all text has a baseline style.
                { defaultToken: "log-text" }
            ],
            
            // TERTIARY STATE: "xml-tag"
            // Handles syntax inside XML/HTML tags (like attributes and quotes).
            "xml-tag": [
                { token: "log-quotes", regex: /"[^"\\]*"/ }, 
                { token: "log-quotes", regex: /'[^'\\]*'/ }, 
                // The '>' character closes the tag. Apply the token, and return to the main "start" state.
                { token: "log-xml", regex: />/, next: "start" }, 
                // Captures attributes safely without exiting the state prematurely.
                { token: "log-xml", regex: /[^>"']+/ }, 
                { defaultToken: "log-xml" } 
            ]
        };
    };

    // Standard Ace boilerplate to inherit from the base TextHighlightRules class.
    oop.inherits(LogHighlightRules, TextHighlightRules);
    exports.LogHighlightRules = LogHighlightRules;
});


/**
 * Ace Editor Custom Mode: 
 * ﹥ Log File Folding
 * 
 * Folding defines the logic for collapsible code blocks (the small arrows in the gutter).
 * To create custom folding, you must implement two main functions:
 * 1. getFoldWidget: Determines IF a specific line should display a fold button.
 * 2. getFoldWidgetRange: Determines WHERE the fold ends when the button is clicked.
 */
ace.define('ace/mode/folding/log_fold_mode', function(require, exports, module) {
    var oop = require("ace/lib/oop");
    var BaseFoldMode = require("ace/mode/folding/fold_mode").FoldMode;
    var Range = require("ace/range").Range;

    var FoldMode = exports.FoldMode = function() {};
    oop.inherits(FoldMode, BaseFoldMode);

    (function() {
        // getFoldWidget returns a string indicating the type of fold for a given row.
        // Returning "start" tells Ace to render a fold arrow here. Returning "" means no fold.
        this.getFoldWidget = function(session, foldStyle, row) {
            var line = session.getLine(row);
            
            // We want to fold Java-style stack traces. 
            // First, we check if the current line contains an Error or Exception.
            if (/(?:Exception|Error|Err)\b/.test(line)) {
                var nextLine = session.getLine(row + 1);
                // If it does, we check if the NEXT line begins with "at ".
                // If both conditions are met, this line is the "start" of a stack trace fold.
                if (nextLine && /^\s+at\s/.test(nextLine)) {
                    return "start";
                }
            }
            return "";
        };

        // getFoldWidgetRange defines the exact span of text that will be hidden when folded.
        // It returns an Ace Range object: Range(startRow, startColumn, endRow, endColumn).
        this.getFoldWidgetRange = function(session, foldStyle, row) {
            var startRow = row;
            var endRow = row;
            var maxRow = session.getLength();
            
            // Iterate downwards through the lines to find where the stack trace ends.
            while (++endRow < maxRow) {
                var curLine = session.getLine(endRow);
                // A stack trace continues as long as lines start with "at ", "Caused by:", or "... X more".
                if (/^\s+at\s/.test(curLine) || /^Caused by:/.test(curLine) || /^\s+\.\.\.\s\d+\smore/.test(curLine)) {
                    continue;
                }
                // When we hit a line that doesn't match a stack trace pattern, the fold block ends.
                break;
            }
            
            // If the block is larger than a single line, return the Range to collapse.
            if (endRow > startRow + 1) {
                return new Range(startRow, session.getLine(startRow).length, endRow - 1, session.getLine(endRow - 1).length);
            }
        };
    }).call(FoldMode.prototype);
});


/**
 * Ace Editor Custom Mode: 
 * ﹥ Main Registration
 * 
 * This is the entry point for the custom language mode. It binds the 
 * syntax highlighting rules and the folding rules together into a single 
 * Mode object that Ace can consume.
 */
ace.define('ace/mode/log', function(require, exports, module) {
    var oop = require("ace/lib/oop");
    var TextMode = require("ace/mode/text").Mode;
    
    // Import the highlighter and folder defined in the modules above.
    var LogHighlightRules = require("ace/mode/log_highlight_rules").LogHighlightRules;
    var LogFoldMode = require("ace/mode/folding/log_fold_mode").FoldMode;

    var Mode = function() {
        // Assign our custom classes to the standard Ace mode properties.
        this.HighlightRules = LogHighlightRules;
        this.foldingRules = new LogFoldMode();
    };
    
    // Inherit from the base TextMode to get standard editor behaviors (typing, selection, etc.)
    oop.inherits(Mode, TextMode);

    (function() {
        // Set the internal ID to match the define statement.
        // This allows Ace to load this mode via session.setMode("ace/mode/log");
        this.$id = "ace/mode/log";
    }).call(Mode.prototype);

    exports.Mode = Mode;
});