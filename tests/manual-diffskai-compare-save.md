# Manual Test Specification: Diffskai compare and conflict saving (F17)

## Overview
Since F17, Diffskai receives the Famouskai file together with its link to the file on disk, in both modes. Saving the right panel writes straight back to that file, and a guard asks before overwriting a file that another program changed in the meantime. Run these checks in desktop Chromium (installed app or tab), with two project folders that both contain a `README.md`.

## Scope
- Compare mode (toolbar **D**) on a saved file, on a file changed on disk, and on a never-saved buffer.
- Opening the second file, Monaco arrows, Swap.
- Conflict mode (Save in Famouskai after another program changed the file).

---

## Test Scenarios

| Test ID | Scenario | Pre-conditions | Action Steps | Expected Outcome |
| :--- | :--- | :--- | :--- | :--- |
| **DSK-SAVE-01** | Compare, save goes to the real file | `projectA/README.md` open in Famouskai, saved. | 1. Click **D**.<br>2. In Diffskai, type a line in the right panel.<br>3. Click the right **Save**. | Diffskai is maximized. Right label: `README.md - from Famouskai (linked to file on disk)`. No file dialog opens. `projectA/README.md` contains the new line and Famouskai reloads it ("Auto-Synced"). |
| **DSK-SAVE-02** | Compare, file changed elsewhere | As above, Diffskai open. | 1. Change and save `projectA/README.md` in another editor.<br>2. Edit the right panel, click **Save**.<br>3. Click **Cancel**, then **Save** again and **OK**. | A confirm says the file was changed on disk after Diffskai opened it. Cancel writes nothing; OK overwrites. |
| **DSK-SAVE-03** | Compare, never-saved buffer | New untitled text in Famouskai. | 1. Click **D**.<br>2. Click the right **Save**. | Right label ends with `(not saved yet)`. The "Save as" dialog opens (unchanged behaviour). |
| **DSK-SAVE-04** | Second file from the same folder | DSK-SAVE-01 set-up. | 1. Click the left **Open**. | The file dialog opens in `projectA`, not in another project. |
| **DSK-SAVE-05** | Arrows and Swap | A second file loaded on the left. | 1. Click a Monaco arrow in the middle gutter.<br>2. Click **Swap**, then the left **Save**. | The arrow copies the change into the Famouskai file (right, marked `*`). After Swap, the Famouskai file is on the left and Save writes to `projectA/README.md`. |
| **DSK-SAVE-06** | Conflict mode | `projectA/README.md` open with unsaved edits; another program saved a different version. | 1. Click **Save** in Famouskai, accept the conflict prompt.<br>2. Merge, click **Save & Overwrite**. | Banner shown, left = disk version (read-only), right = your edits. Save writes the file, Famouskai shows "Merge done", Diffskai closes. |
| **DSK-SAVE-07** | Conflict cancelled | As DSK-SAVE-06. | 1. Click **Save**, then **Cancel** in the conflict prompt. | Nothing opens; the file is not written. |
| **DSK-SAVE-08** | Reload keeps content | Any Diffskai window. | 1. Press F5 in Diffskai. | Both panels come back with the same content and labels. |
| **DSK-ISO-01** | Two conflicts in parallel | Window A shows `projectA/README.md`, window B shows `projectB/README.md`, both with unsaved edits; another program changed both files. | 1. Save in B, accept the conflict prompt (Diffskai B opens).<br>2. Save in A, accept (Diffskai A opens).<br>3. Click **Save & Overwrite** in Diffskai A. | Each Diffskai shows only its own file and edits. After step 3, `projectA/README.md` is written, A shows "Merge done", and **B still shows its unsaved edits** (no reload, no prompt). |
| **DSK-ISO-02** | Finish the second conflict | After DSK-ISO-01. | 1. Click **Save & Overwrite** in Diffskai B. | `projectB/README.md` gets B's merge; `projectA/README.md` is unchanged; B shows "Merge done". |
| **DSK-ISO-03** | Conflict + pasted-text comparison | Window A in conflict (Diffskai A open); window C holds pasted text, never saved. | 1. Click **D** in C.<br>2. Save & Overwrite in Diffskai A. | Diffskai C shows the pasted text with "(not saved yet)"; A's merge leaves C untouched. |
| **DSK-ISO-04** | Same file in two windows | Windows A and B both show `shared.md`; only B has unsaved edits. | 1. **D** in A, edit the right panel, **Save**. | A reloads silently. B asks before reloading; answering Cancel keeps B's edits. |
| **DSK-ISO-05** | Typing after opening the conflict | Window A in conflict, Diffskai open. | 1. Type more text in Famouskai A.<br>2. Save & Overwrite in Diffskai. | Famouskai A asks before reloading (the text it sent is no longer what it shows). |
| **DSK-ISO-06** | Close warning | Diffskai with an unsaved change. | 1. Close the Diffskai window. | The browser asks to confirm leaving. After a successful Save & Overwrite, Diffskai closes without asking. |
| **DSK-KEY-01** | Ctrl+S in compare mode | Compare window open from `projectA/README.md`. | 1. Edit the right panel, press **Ctrl+S** (Cmd+S on macOS).<br>2. Click in the left panel, type, press **Ctrl+S**. | Step 1: the right panel is saved to `projectA/README.md`, exactly like its **Save** button; the browser's "Save page as" dialog never opens. Step 2: the left panel is saved (file picker if it has no file yet). With nothing modified, Ctrl+S does nothing. |
| **DSK-KEY-02** | Ctrl+S in conflict mode | As DSK-SAVE-06, Diffskai open. | 1. Merge, press **Ctrl+S**, wherever the cursor is. | Same as **Save & Overwrite**: the file is written and Diffskai closes. No browser dialog. |
| **DSK-UI-01** | File name with HTML characters | A file named `<b>x<i>.md`. | 1. Open it in Famouskai, click **D**. | The Diffskai label shows `<b>x<i>.md` literally, nothing in bold or italic. |

---

## Automated equivalent
The reviewer ran the DSK-ISO cases with several real windows in one browser (F18), and the same scenarios headless with Origin Private File System handles (real `FileSystemFileHandle` objects), except the file dialogs, which were stubbed to record their options.
