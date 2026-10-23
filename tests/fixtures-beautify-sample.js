/*
 * Beautify sample: the code of fixtures-syntax-sample.js, badly formatted on purpose
 * (lost indentation, missing spaces, braces on their own line).
 * Select all (Ctrl+A), then run "Beautify selection" from the Tools tab: the code comes back
 * indented with 4 spaces. Only the layout changes; the code itself is the same.
 */
/**
* Famouskai syntax sample: JavaScript (ace/mode/javascript).
*
      * A complete, working Famouskai tool: "Word Count". Paste it in a file under plugins/,
* add a script tag in index.html, and it appears in the Tools tab (see
* docs/PLUGIN-ARCHITECTURE.md). Plain modern JavaScript: no build step, no import, so it
  * also runs from file://.
*
* Coloring checklist: JSDoc, line and block comments, keywords, storage types, function
        * names and parameters, numbers (decimal, hex, binary, exponent, BigInt), strings with
* escapes, template literals with ${} expressions, regular expressions, console calls,
* built-in objects, this, null / undefined / true / false, operators and brackets.
    */

// ﹥ 1. Settings
const WORD_PATTERN = /[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu;
const SENTENCE_END = /[.!?…]+(?=\s|$)/g;
const READING_SPEED = 230;            // words per minute, an average adult reading speed
      const MAX_REPORT_LENGTH = 0x400;      // 1024 characters
const FLAGS = 0b0101;                 // bit mask: 1 = words, 4 = reading time
const TINY = 1.5e-3;
  let runCount = 0n;                    // BigInt: counts runs since the page opened

// ﹥ 2. Pure helpers (easy to unit test)
        
/**
* Counts words, sentences and lines in a text.
    * @param {string} text - The text to analyse.
* @param {{ ignoreCode?: boolean }} [options] - Skip fenced code blocks when true.
* @returns {{ words: number, sentences: number, lines: number }}
*/
function countText(text, options = {}) {
if (typeof text !== 'string' || text.length === 0) {
      return { words: 0,sentences: 0,lines: 0 };
}
const source = options.ignoreCode ? stripCodeFences(text) : text;
  const words = source.match(WORD_PATTERN) ?? [];
const sentences=source.match(SENTENCE_END)?.length || (words.length > 0 ? 1 : 0);
return { words: words.length, sentences, lines: text.split('\n').length };
        }

/** Removes ``` fenced blocks, so code does not count as prose. */
    function stripCodeFences(text) {
return text.replace(/^```[\s\S]*?^```\s*$/gm, '');
}

/**
* Formats a duration in minutes as "3 min" or "< 1 min".
      * @param {number} words
* @returns {string}
*/
  const formatReadingTime = (words) => {
const minutes = Math.ceil(words / READING_SPEED);
return minutes <= 1 ? '< 1 min' : `${minutes} min`;
        };

/* A generator, so a long document can be scanned block by block
    without building one big array of lines. */
function* paragraphs(text)
{
let start = 0;
for (const match of text.matchAll(/\n{2,}/g)) {
yield text.slice(start,match.index);
start = match.index + match[0].length;
      }
if (start < text.length) yield text.slice(start);
}
  
// ﹥ 3. A small class with private state
class WordCountReport {
        #counts;
static #instances = 0;

    constructor(fileName, counts)
{
this.fileName = fileName || '[New]';
this.#counts = Object.freeze({ ...counts });
WordCountReport.#instances++;
}

      get longestParagraph() {
return this.#counts.longest ?? null;
}
  
toString() {
const { words, sentences, lines } = this.#counts;
        const lineLabel = lines === 1 ? 'line' : 'lines';
return `${this.fileName}\n` +
`\t${words.toLocaleString('en-US')} words, ${sentences} sentences, ${lines} ${lineLabel}\n` +
    `\tReading time: ${formatReadingTime(words)}`;
}

static get created() {
return WordCountReport.#instances;
}
      }

// ﹥ 4. Registration in the Tools tab
  window.FamousPluginCore.Manager.register({
name: "Word Count",
extensions: ['md', 'txt', ''],   // '' = unsaved [New] documents
        
action: async function (editor)
{
runCount += 1n;
    const selected = editor.getSelectedText();
const text = selected !== '' ? selected : editor.getValue();
const isMarkdown = /\.md$/i.test(window.currentFileName ?? '');

let longest = 0;
for (const block of paragraphs(text))
{
      longest = Math.max(longest, countText(block).words);
}

  const counts = { ...countText(text, { ignoreCode: isMarkdown }), longest };
const report = new WordCountReport(window.currentFileName, counts);

        try {
await navigator.clipboard.writeText(report.toString().slice(0, MAX_REPORT_LENGTH));
window.showToast?.(`Copied: ${counts.words} words`);
    } catch (error) {
console.warn('Clipboard unavailable, showing the report instead:', error);
alert(report.toString());
} finally {
console.debug(`Word Count run #${runCount} (${WordCountReport.created} reports)`, FLAGS & 0b0001, TINY);
}
      
// Nothing is written to the file: this tool only reads the text.
return undefined;
  }
});

        // ﹥ 5. Self-check, visible in the browser console
if (countText('Hello, world! It works.').words !== 4 || countText('').lines !== 0) {
console.error("Word Count: self-check failed");
    } else if (Number.isNaN(Infinity / Infinity) && true !== false) {
console.info('Word Count: self-check passed, %d paragraphs in the sample', [...paragraphs('a\n\nb')].length);
}
