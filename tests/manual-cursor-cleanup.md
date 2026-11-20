# Manual Test Specification: Cursor Position Cleanup (LocalStorage LRU)

Famouskai remembers the cursor of each file in `localStorage`, one key `cursor_<file name>` per file, and keeps the 50 most recent ones (LRU: least recently used first out). The cleanup runs at start and after each cursor move.

Desktop Chromium. The scripts below are pasted in the DevTools **Console** (`Ctrl+Shift+I`) of the Famouskai tab; they only create and count `cursor_*` keys. If Chrome asks, type `allow pasting` first.

---

## Test Datasets

| Dataset | File | Used by |
| :--- | :--- | :--- |
| A | `tests/fixtures-syntax-sample.txt` | TC-CURSOR-01 |

**To open a file:** open the address under test followed by `?open=tests/<file>`, for example `https://app.famouskai.com/?open=tests/fixtures-syntax-sample.txt`. It opens in the app under its own name, unsaved.

**Script S1** (removes every `cursor_*` key, then adds 55 keys `cursor_file_1.txt` to `cursor_file_55.txt`, `file_1` the oldest):

```javascript
Object.keys(localStorage).filter(k => k.startsWith('cursor_')).forEach(k => localStorage.removeItem(k));
for (let i = 1; i <= 55; i++) localStorage.setItem(`cursor_file_${i}.txt`, JSON.stringify({ row: i, column: 0, updatedAt: Date.now() - 1000 * (60 - i) }));
Object.keys(localStorage).filter(k => k.startsWith('cursor_')).length
```

**Script S2** (count and oldest entries left):

```javascript
const keys = Object.keys(localStorage).filter(k => k.startsWith('cursor_'));
[keys.length, ['cursor_old.txt', 'cursor_file_1.txt', 'cursor_file_5.txt', 'cursor_file_6.txt'].map(k => localStorage.getItem(k) !== null)]
```

---

## Test Scenarios

| Test ID | Scenario | Pre-conditions | Action Steps | Expected Outcome |
| :--- | :--- | :--- | :--- | :--- |
| **TC-CURSOR-01** | Position saved with `updatedAt` | Dataset A open | 1. In the Console: `editor.gotoLine(2, 10)` (line 2 `Plain text has no colors...`, after `Plain text`).<br>2. In the Console: `localStorage.getItem('cursor_fixtures-syntax-sample.txt')` | 1. The cursor is on line 2, right after `Plain text`.<br>2. `'{"row":1,"column":10,"updatedAt":<number>}'`: `row` counts from 0 (line 2 = 1), `updatedAt` is a 13-digit time in milliseconds. |
| **TC-CURSOR-02** | Old entry without `updatedAt` goes first | Any file open | 1. Run Script S1.<br>2. Run `localStorage.setItem('cursor_old.txt', JSON.stringify({ row: 2, column: 3 }))`<br>3. Run `window.cleanupCursorLocalStorage(55)`, then Script S2. | 1. `55`.<br>3. `[55, [false, true, true, true]]`: `cursor_old.txt` (no `updatedAt`, counted as the oldest) is removed, the 55 others stay. |
| **TC-CURSOR-03** | LRU above 50 entries | Any file open | 1. Run Script S1.<br>2. Run `window.cleanupCursorLocalStorage(50)`, then Script S2. | 1. `55`.<br>2. `[50, [false, false, false, true]]`: exactly 50 keys; `file_1` to `file_5` (the 5 oldest) are removed, `file_6` stays. |
| **TC-CURSOR-04** | Cleanup at start | Any file open | 1. Run Script S1.<br>2. Reload the page (`Ctrl+R`), wait for the editor.<br>3. Run Script S2. | 1. `55`.<br>3. `[50, [false, false, false, true]]`, without any action after the reload. |
