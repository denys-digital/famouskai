# Manual Test Specification: Python language lot (`.py`)

## Overview
One row per use of `docs/PLUGIN-ARCHITECTURE.md` section 4.b, part 1 (U1 to U11), for Python. U5 (unsaved file) and U12 (paste detection) are not in this lot: an unsaved file becomes Python only through paste detection, which the maintainer decides first. A language is supported only when every row passes.

## Setup

Desktop Chromium. Fixture: `tests/fixtures-syntax-sample.py`, opened with `<address>/?open=tests/fixtures-syntax-sample.py`. For U1, U6 and Diffskai on a disk file, save the fixture once in a test folder with `Ctrl+S` as `sample.py`. The Diffskai rows need the Monaco Python chunk (`vendor/monaco-editor/python-*.js`, added by the vendor update of this lot).

## Test Matrix

| Test ID | Scenario | Pre-conditions | Action Steps | Expected Outcome |
| :--- | :--- | :--- | :--- | :--- |
| **TS-PY-01** | Open (U1) | `sample.py` saved in a test folder | 1. Open the folder in the Explorer<br>2. Click `Open` and pick `sample.py` | Step 1: `sample.py` shows in the tree. Step 2: the picker lists `.py` files; the file opens. |
| **TS-PY-02** | Icon and filter (U2) | Same folder open in the Explorer | 1. Look at `sample.py` in the tree<br>2. Click the `Pʏ` button of the filter bar | Step 1: the icon is `Pʏ` in gold. Step 2: only `.py` files stay listed. The filter bar still fits on one row. |
| **TS-PY-03** | Colors (U3) | Fixture open | Look at the file | Keywords (`def`, `class`, `import`) pink, strings yellow, numbers and `True`/`False`/`None` purple, built-ins (`len`, `print`, `str`) and decorators (`@property`) cyan, `self`/`cls` orange italic, comments gray italic, names light. No red name. |
| **TS-PY-04** | Folding (U4) | Fixture open | 1. Click the fold arrow of `class Note:` (line 18)<br>2. Unfold, then click the arrow of `# • 2. A class with a decorator` (line 17) | Step 1: the class body folds. Step 2: the whole section folds, up to the line before `# • 3.` (line 37). |
| **TS-PY-05** | Save and rename (U6) | Fixture open (not saved) | 1. `As...`, save as `copy.py`<br>2. Rename `copy.py` to `copy.txt`, then back to `copy.py` | Step 1: the dialog proposes a Python file and keeps `.py`. Step 2: plain colors on `.txt`, Python colors again on `.py`. |
| **TS-PY-06** | Outline (U7) | Fixture open | 1. Open the Outline<br>2. Click the `Pʏ` badge<br>3. Click `All` | Step 1: items in order: `Famouskai syntax sample: Python (ace/mode/python)`, `1. Imports and constants`, `2. A class with a decorator`, `class Note`, `__init__()`, `is_empty()` and `from_file()` (these three one step right of `class Note`), `read the whole file...`, `3. Functions...`, `count_marks()`, `describe()`, `TODO: translate the label`, `main()`, `4. Nesting...`, `retry()`, `decorator()` (one step right of `retry()`), `wrapper()` (two steps right). `attempt()` is not listed (fourth level). No item for `# Open this file...` (a plain comment). Step 2: only `class Note`, `__init__()`, `is_empty()`, `from_file()`, `count_marks()`, `describe()`, `main()`, `retry()`, `decorator()`, `wrapper()`, still indented; no mark, no TODO. Step 3: every item is back. |
| **TS-PY-07** | Famous Marks (U8) | Fixture open | 1. Click `1. Imports and constants` in the Outline<br>2. Look at line 41, `line.startswith("#")` | Step 1: the cursor goes to line 6. Step 2: the `#` inside the string is code, not a heading: no Outline item for it. |
| **TS-PY-08** | Diffskai (U9) | `sample.py` open from disk, Monaco Python chunk vendored | 1. Change one line, do not save<br>2. Click `Compare this file (diffskai)` | Step 2: the button shows; Diffskai opens; both panes have Python colors (keywords and strings colored, not plain text). |
| **TS-PY-09** | Tools (U10) | Fixture open | Open `Tools & Magic Snippets` | Beautify and Clean Semantic Bookmarks are not offered (left out on purpose: no Python formatter, and Cleanup reads only `//` and `<!--` comments). The generic snippets (`fa`, `fb`, `md`...) work. |
| **TS-PY-10** | Offline (U11) | TS-PY-08 passed once online on this origin | 1. Cut the network (DevTools, Network, Offline)<br>2. Ctrl+R only, never Ctrl+Shift+R<br>3. Open the fixture link again, then Compare it | The file opens with Python colors; Diffskai opens with both panes colored. |
