# Famouskai syntax sample: Markdown

<!-- ace/mode/markdown in the editor, Marked + DOMPurify in the preview. -->
This file shows every Markdown construct Famouskai colors in the editor and renders in the
preview, one short example each. Open the preview (**Preview** button) next to the text to compare
both views. The long sample, for printing and reading tests, is
`fixtures-syntax-sample-extended.md`.

﹥ Famous Arrow: this line is a bookmark in the Outline tab, and folds down to the next mark.

## 1. Headings

# Level 1
## Level 2
### Level 3
#### Level 4
##### Level 5
###### Level 6

Setext level 1
==============

Setext level 2
--------------

## 2. Inline formatting

Text in **bold**, in *italic*, in ***bold italic***, in __bold with underscores__ and
_italic with underscores_, ~~struck through~~, and `inline code`.
Inline code keeps HTML as text: `<script>alert(1)</script>` is shown, never run.
Escaped characters stay literal: \*not italic\*, \_not italic\_, \# not a heading, \`not code\`.
A line that ends with two spaces  
breaks here, and so does a line that ends with a backslash\
like this one.

## 3. Links

- Inline link: [Famouskai DNA](../DNA.md)
- Link with a title: [GNU AGPL v3](https://www.gnu.org/licenses/agpl-3.0.html "The license of Famouskai")
- Reference link: [File System Access API][fsa]
- Autolink: <https://developer.mozilla.org/>

[fsa]: https://developer.mozilla.org/en-US/docs/Web/API/File_System_API

## 4. Lists

- Unordered, with a dash
* Unordered, with an asterisk
+ Unordered, with a plus

1. Ordered
2. Ordered, with a nested list:
   - Second level
     - Third level
3. Ordered, with a code block inside:

   ```bash
   python3 -m http.server 8080
   ```

A new ordered list can start at any number:

7. Seventh
8. Eighth

Task list, before saving:

- [x] Edit the file
- [x] Check the preview
- [ ] Press <kbd>Ctrl</kbd>+<kbd>S</kbd>

## 5. Quotes

> Your files, on your disk, in your browser. Nothing in between.
>
> > A quote inside a quote.
>
> - A list inside a quote
> - with two items

## 6. Code blocks

```js
// The preview shows function names in bold (lot F26).
function isFamousMark(line) {
    return window.FamousPluginCore.FamousMark.test(line);
}
console.log(isFamousMark('// ﹥ Section'));   // true
```

```css
:root { --fm-sky: #8AB4F8; }   /* change a color in one line */
```

```json
{ "fa": { "snippet": "﹥ $1", "help": "Famous arrow", "extensions": [] } }
```

~~~text
A fence made of tildes. Plain text: nothing is colored or bolded here(), not even this().
~~~

    An indented code block (four spaces).

## 7. Tables

| Mark | Name          | Snippet | Code point |
| :--- | :-----------: | :-----: | ---------: |
| ﹥   | Famous Arrow  | `/fa`   | U+FE65     |
| •    | Magic Dot     | `/md`   | U+2022     |
| °    | Flying Bubble | `/fb`   | U+00B0     |

Left, center, center and right alignment. Cells accept **inline** *formatting* and a<br>line break.

## 8. HTML inside Markdown

<details>
<summary>Click to open</summary>

Hidden content, shown on click. Markdown **works** inside, after a blank line.

</details>

<mark>Highlighted text</mark>, keys such as <kbd>Ctrl</kbd>+<kbd>F</kbd> (search), and centered
titles made with the `/t1`, `/t2` and `/t3` snippets:

<div class="t1" align="center"><h1>Centered title, level 1</h1></div>

<div class="t2" align="center"><h2>Centered title, level 2</h2></div>

<div class="t3" align="center"><h3>Centered title, level 3</h3></div>

The preview removes anything that could run code (DOMPurify): this image has an `onerror`
handler that never fires, and this link does nothing.

<img src="x" alt="Broken image with a removed onerror handler" onerror="alert('XSS')">
[A javascript: link](javascript:alert('XSS'))

## 9. Rules

Three ways to draw a horizontal rule:

---

***

___

• Magic Dot: a second kind of bookmark.

° Flying Bubble: a third one. Famous Marks are ordinary characters: any other editor shows them as text.
