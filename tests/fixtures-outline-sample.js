// ﹥ Outline sample: every JavaScript line the Outline tab lists
// Open this file, then the Outline tab. Each line marked "listed" below shows up there,
// with its name; lines marked "not listed" document what the Outline does not detect yet.
// Rules: plugins/ext-outline.js. Famous Marks: docs/FAMOUS-MARK.md.

// • Functions
function init() {}                                   // listed: init()
async function loadSettings() {}                     // listed: loadSettings()
export function exportHtml() {}                      // listed: exportHtml()

// • Classes
class Manager {}                                     // listed: class Manager
export class Toast {}                                // listed: class Toast

// • Arrow functions
const run = () => {};                                // listed: run()
let countWords = (text) => text.split(/\s+/).length; // listed: countWords()
var trim = async line => line.trim();                // listed: trim()

// • Object methods
const tool = {
    action: function (editor) {},                    // listed: action()
    render: async function () {},                    // listed: render()
    onFileOpen: (file) => file,                      // listed: onFileOpen()
};

// • Semantic bookmarks: TODO is listed in orange, @ in purple
// TODO: count words in the selection only
// @ Entry point of the tool

// ° Not listed yet (the class itself is listed)
class Editor {
    save() {}                                        // not listed: class method
    static create() {}                               // not listed: static method
}
const handler = function () {};                      // not listed: function expression
