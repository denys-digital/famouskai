# Manual Test Specification: Diffskai conflict while offline

This test checks that a save conflict can be merged in Diffskai with no network. Diffskai's editor (Monaco) is not in the first download: the Service Worker stores its files the first time Diffskai loads them online (`sw.js`) and serves them from its cache afterwards.

Desktop Chromium, on a deployed address (for example `https://app.famouskai.com`), never a page opened from `file://`: a `file://` page has no Service Worker, so nothing works offline there. No sample content is needed: each step says what to type. File `X` is any saved text file on disk.

---

## Before you start

1. Open the address once with the network on and wait 10 seconds (the Service Worker installs).
2. Still online, click toolbar **D** once: Diffskai opens and loads, then close it. Known limit (private issue 572): a Diffskai never opened online does not load offline, because the Service Worker stores Monaco's files only when Diffskai first loads them.
3. DevTools (`Ctrl+Shift+I`) > **Network**: the reload with `Ctrl+R` shows `(ServiceWorker)` in the **Size** column on almost every line.

---

## Test Scenarios

| Test ID | Scenario | Pre-conditions | Action Steps | Expected Outcome |
| :--- | :--- | :--- | :--- | :--- |
| **OFF-01** | Conflict opens Diffskai offline | Before you start done. File `X` open in Famouskai. DevTools > **Network** > throttling set to **Offline**. | 1. In another program, add the line `outside` to `X` and save.<br>2. In Famouskai type `inside`, press `Ctrl+S`.<br>3. Click OK. | 2. Famouskai asks `EDITING CONFLICT` / `The file has been modified on disk. Do you want to open the comparison tool?`<br>3. Diffskai opens with both panels filled within a few seconds: left `X - version on Disk (updated / read-only)` with `outside`, right `X - imported from Famouskai (unsaved / editable)` with `inside`. In the Diffskai DevTools > **Console**: no `Failed to fetch`, no `require is not defined`. |
| **OFF-02** | Merge and save offline | After OFF-01, still offline. | 1. Copy the `outside` line into the right panel (Monaco arrow).<br>2. Click **Save & Overwrite**, then OK. | 2. The alert reads `File successfully overwritten! The main editor has been updated.` Diffskai closes. Famouskai shows `Merge done` for 2 s; the editor and the file on disk hold `outside` and `inside`, no unsaved star. |
| **OFF-03** | Back online | After OFF-02. Throttling set back to **No throttling**. | 1. Repeat OFF-01 steps 1 to 3 with the lines `outside 2` and `inside 2`.<br>2. Repeat OFF-02. | Same results as OFF-01 and OFF-02 with the new lines. |

Online conflict cases in detail: `tests/manual-diffskai-sync.md` (CONF-01 to 04) and `tests/manual-diffskai-compare-save.md`.
