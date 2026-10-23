/**
 * Diffskai sample, original side: default settings of a Famouskai tool, version 1.
 * Open it in Famouskai, click D, then pick fixtures-diffskai-modified.js:
 * every kind of change Diffskai shows is in the pair, labeled in the modified file.
 */
const toolDefaults = {
    version: "1.0.0",
    language: "en",
    options: {
        autoCleanupOnOpen: false,
        trimTrailingSpaces: true,
        maxRecentFiles: 20
    },
    marks: [
        { char: "﹥", name: "Famous Arrow", snippet: "/fa" },
        { char: "•", name: "Magic Dot", snippet: "/md" },
        { char: "*", name: "Star", snippet: "/st" }
    ],
    // Kept for older files
    legacyFormat: "v0"
};

// Count the words of a text.
function countWords(text) {
    return text.split(" ").length;
}

function describe(settings) {
    console.log("Settings version " + settings.version);
    return true;
}

const unchangedLine = "This line is the same on both sides.";
