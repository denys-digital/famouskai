# Test Suite: Inter-Process Synchronization (Famouskai ↔ Diffskai)

Desktop Chromium. File `X` is a saved file on disk (for example `projectA/README.md`, as in `tests/manual-diffskai-compare-save.md`), opened in Famouskai. "Another program" is any other text editor. No sample content is needed: any text works, each step says what to type.

## 1. Normal Mode Synchronization (Event: `DIFFSKAI_SAVED`)

| Test ID | Scenario | Pre-conditions | Action Steps | Expected Outcome |
| :--- | :--- | :--- | :--- | :--- |
| **SYNC-01** | Seamless Auto-Reload | File `X` open in Famouskai, no unsaved star. Diffskai opened on it with toolbar **D**. | 1. In Diffskai, type `synced` on a new line of the right panel.<br>2. Click the right **Save**. | 2. No dialog. In Famouskai the file name is replaced by `Auto-Synced` for 2 s, then comes back without a star. The editor shows the `synced` line; the cursor stays where it was. |
| **SYNC-02** | Unsaved Changes Protection (Accept) | As SYNC-01, then type `local` in Famouskai (unsaved star). | 1. In Diffskai, type `synced`, click the right **Save**.<br>2. Switch to Famouskai.<br>3. Click OK. | 2. Famouskai asks `This file was just updated by Diffskai. Reload and lose your current unsaved changes?`<br>3. `local` is gone, `synced` is there, `Auto-Synced` for 2 s, no star. |
| **SYNC-03** | Unsaved Changes Protection (Decline) | As SYNC-02. | 1. In Diffskai, type `synced`, click the right **Save**.<br>2. Switch to Famouskai.<br>3. Click Cancel. | 2. The same question as SYNC-02.<br>3. Famouskai keeps `local` and its unsaved star, no `synced` line. The file on disk holds the Diffskai text (with `synced`). |

## 2. Conflict Resolution Mode (Event: `MERGE_COMPLETE`)

| Test ID | Scenario | Pre-conditions | Action Steps | Expected Outcome |
| :--- | :--- | :--- | :--- | :--- |
| **CONF-01** | Conflict Detection & Launch | File `X` open in Famouskai. Another program added the line `outside` to `X` and saved it. | 1. Type `inside` in Famouskai.<br>2. Press `Ctrl+S`.<br>3. Click OK. | 2. Nothing is written. Famouskai asks `EDITING CONFLICT` / `The file has been modified on disk. Do you want to open the comparison tool?`<br>3. Diffskai opens (address ends with `?conflict=<number>`) with the `CONFLICT RESOLUTION MODE:` banner. Left: `X - version on Disk (updated / read-only)` with `outside`, read-only. Right: `X - imported from Famouskai (unsaved / editable)` with `inside`. |
| **CONF-02** | Successful Merge & Broadcast | After CONF-01, Diffskai open. | 1. Copy the `outside` line into the right panel (Monaco arrow).<br>2. Click **Save & Overwrite**.<br>3. Click OK. | 2. The alert reads `File successfully overwritten! The main editor has been updated.`<br>3. Diffskai closes. In Famouskai the file name shows `Merge done` for 2 s; the editor holds `outside` and `inside`, no star. |
| **CONF-03** | Conflict Abort | As CONF-01 pre-conditions. | 1. Type `inside`, press `Ctrl+S`.<br>2. Click Cancel. | 2. No window opens, nothing is written, the unsaved star stays. The prepared session is removed (DevTools > Application > IndexedDB: no `diffskai_session_<number>` key left). |
| **CONF-04** | Post-Merge Timestamp Integrity | Right after CONF-02. | 1. Type `after` in Famouskai.<br>2. Press `Ctrl+S`. | 2. No conflict question. The Save button reads `Saved` (green) for a moment, the star goes away, the file on disk ends with `after`. |
