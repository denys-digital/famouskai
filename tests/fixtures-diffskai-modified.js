/**
 * Diffskai sample, modified side: the same settings, version 2.
 * Open it in Famouskai, click D, then pick fixtures-diffskai-original.js:
 * every kind of change Diffskai shows is in the pair, labeled in the modified file.
 */
const toolDefaults = {
    version: "2.0.0",                     // CHANGED: value
    language: "en",
    options: {
        autoCleanupOnOpen: true,          // CHANGED: boolean
        trimTrailingSpaces: true,
        // REMOVED: maxRecentFiles
        keepLineEndings: true             // ADDED: key
    },
    marks: [
        { char: "﹥", name: "Famous Arrow", snippet: "/fa" },
        { char: "•", name: "Magic Dot", snippet: "/md" },    // CHANGED: nothing but this comment
        // REMOVED: the "Star" mark, "*" is a Markdown character
        { char: "°", name: "Flying Bubble", snippet: "/fb" } // ADDED: array item
    ],
    // ADDED: whole block
    storage: {
        location: "browser",
        sentToServer: false
    }
    // REMOVED: legacyFormat and its comment
};

// Count the words of a text, in any language.
function countWords(text) {
    const words = text.match(/[\p{L}\p{N}'’-]+/gu);   // CHANGED: function body
    return words === null ? 0 : words.length;
}

function describe(settings) {
    console.log(`Settings version ${settings.version}`); // CHANGED: template literal
    return true;
}

const unchangedLine = "This line is the same on both sides.";
