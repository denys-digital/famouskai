# Manual Test Specification: YAML language lot (`.yml`, `.yaml`)

## Overview
One row per use of `docs/PLUGIN-ARCHITECTURE.md` section 4.b, part 1 (U1 to U11), for YAML. U5 (unsaved file) and U12 (paste detection) are not retested here: YAML paste detection already exists (`tests/manual-paste-detection.md`). A language is supported only when every row passes.

## Setup

Desktop Chromium. Fixture: `tests/fixtures-syntax-sample.yml`, opened with `<address>/?open=tests/fixtures-syntax-sample.yml`. For the rows on a disk file, save the fixture once in a test folder with `Ctrl+S` as `sample.yml`, and once more as `sample.yaml`.

## Test Matrix

| Test ID | Scenario | Pre-conditions | Action Steps | Expected Outcome |
| :--- | :--- | :--- | :--- | :--- |
| **TS-YML-01** | Open (U1) | `sample.yml` and `sample.yaml` saved in a test folder | 1. Open the folder in the Explorer<br>2. Click `Open` and pick `sample.yaml` | Step 1: both files show in the tree. Step 2: the picker lists `.yml` and `.yaml` files; the file opens. |
| **TS-YML-02** | Icon and filter (U2) | Same folder open in the Explorer | 1. Look at both files in the tree<br>2. Click the `Yᴍʟ` button of the filter bar | Step 1: both have the `Yᴍʟ` icon in red. Step 2: both stay listed, nothing else. |
| **TS-YML-03** | Colors (U3) | `sample.yaml` open | Look at the file | Same colors as the `.yml` fixture: keys, strings, numbers, booleans, anchors and tags colored; comments gray. |
| **TS-YML-04** | Folding (U4) | Fixture open | 1. Click the fold arrow of `jobs:` (line 21)<br>2. Look at the lines inside a `run: \|` block | Step 1: the whole job folds. Step 2: no fold arrow inside the block (its lines are shell code). |
| **TS-YML-05** | Save and rename (U6) | Fixture open (not saved) | 1. `As...`, save as `copy.yaml`<br>2. Rename `copy.yaml` to `copy.txt`, then back to `copy.yml` | Step 1: the dialog proposes a YAML file and keeps `.yaml`. Step 2: plain colors on `.txt`, YAML colors again on `.yml`. |
| **TS-YML-06** | Outline (U7) | Fixture open | 1. Open the Outline<br>2. Click the `Yᴍʟ` badge<br>3. Click `All` | Step 1: it starts with `﹥ Famouskai syntax sample...`, `﹥ 1. Workflow`, `name`, `on`, `pull_request` and `push` (one step in), `branches` (two steps in), `permissions`, `contents` (one step in), `jobs`, `sanity` (one step in), `runs-on`, `timeout-minutes`, `steps` (two steps in), `﹥ 2. Release card`, `release`, `name` (one step in)... Not listed: the keys of a fourth level, anything inside a `run: \|` block, the keys of a list entry (`- name: ...`, `- uses: ...`). Step 2: only the keys, still indented; no mark. Step 3: every item is back. |
| **TS-YML-07** | Famous Marks (U8) | Fixture open | 1. Click `Anchors, aliases and merge keys` in the Outline<br>2. Click the fold arrow of line 59 (`# • Anchors...`) | Step 1: the cursor goes to line 59. Step 2: the section folds, up to the line before `# • Lists...` (line 74). The `#` comments (`# quoted, so it stays a string...`) are never listed. |
| **TS-YML-08** | Diffskai (U9) | `sample.yaml` open from disk | 1. Change one line, do not save<br>2. Click `Compare this file (diffskai)`<br>3. Same with `sample.yml` | Step 2: the button shows on `.yaml` (it was missing before this lot); Diffskai opens; both panes have YAML colors, not plain text. Step 3: the same on `.yml`. |
| **TS-YML-09** | Tools (U10) | Fixture open | Open `Tools & Magic Snippets` | Clean Semantic Bookmarks is offered (unchanged); Beautify is not (no YAML formatter). The generic snippets (`fa`, `fb`, `md`...) work. |
| **TS-YML-10** | Offline (U11) | TS-YML-08 passed once online on this origin | 1. Cut the network (DevTools, Network, Offline)<br>2. Ctrl+R only, never Ctrl+Shift+R<br>3. Open the fixture link again, then Compare it | The file opens with YAML colors; Diffskai opens with both panes colored. |
