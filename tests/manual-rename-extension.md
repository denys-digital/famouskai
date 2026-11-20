# Manual Test Specification: File Rename Extension Control (`rename-file-extension`)

## Overview
This document outlines manual testing scenarios for hot file renaming (`fileHandle.move`) extension control, auto-completion, dotfile confirmation, and cancellation.

## Setup

Desktop Chromium only (the rename uses `FileSystemHandle.move`; elsewhere the app shows `Rename failed: ...`). Each test needs a saved file of the given name, in a test folder: open any `tests/fixtures-syntax-sample.*` file with `<address>/?open=tests/<file>` and save it with `Ctrl+S` under that name. The content does not matter.

## Test Matrix

| Test ID | Scenario | Pre-conditions | Action Steps | Expected Outcome |
| :--- | :--- | :--- | :--- | :--- |
| **TS-RENAME-01** | Auto-append original extension when omitted | `document.md` saved and open | 1. Click filename in top toolbar to open rename dialog<br>2. Type `report` (without extension)<br>3. Submit rename form | The dialog closes. The file in the folder is now `report.md` (no `document.md` left). The toolbar file name and the tab title read `report.md` (`report.md - Famouskai Editor`). Toast `Renamed to report.md`. |
| **TS-RENAME-02** | Replace trailing dot with original extension | `script.js` saved and open | 1. Click filename to open rename dialog<br>2. Type `app.`<br>3. Submit rename form | No question. The file is renamed `app.js` (the trailing dot gets the original extension). Toast `Renamed to app.js`. |
| **TS-RENAME-03** | Explicit extension change | `notes.txt` saved and open | 1. Click filename to open rename dialog<br>2. Type `notes.md`<br>3. Submit rename form | No question. The file is renamed `notes.md`. Toast `Renamed to notes.md`. The colors switch to Markdown and the file icon to the Markdown one. |
| **TS-RENAME-04** | Creating dotfile / hidden file confirmation (Accept) | `config.json` saved and open | 1. Click filename to open rename dialog<br>2. Type `.env`<br>3. Submit rename form<br>4. Click OK on confirmation prompt | Step 3: the question reads `Warning: You are creating a hidden file or file without a standard name/extension. Do you want to proceed?` Step 4: the file is renamed `.env`, toast `Renamed to .env`. |
| **TS-RENAME-05** | Creating dotfile / hidden file confirmation (Cancel) | `config.json` saved and open | 1. Click filename to open rename dialog<br>2. Type `.gitignore`<br>3. Submit rename form<br>4. Click Cancel on confirmation prompt | Step 3: the same question as TS-RENAME-04. Step 4: the rename dialog stays open with `.gitignore` in the field; the file keeps its name `config.json`. |
| **TS-RENAME-06** | Creating extensionless file from extensionless file (Accept) | `README` (no extension) saved and open | 1. Click filename to open rename dialog<br>2. Type `INSTALL`<br>3. Submit rename form<br>4. Click OK on confirmation prompt | Step 3: the question reads `Warning: You are creating a file without an extension. Do you want to proceed?` Step 4: the file is renamed `INSTALL`, toast `Renamed to INSTALL`. |
| **TS-RENAME-07** | Creating extensionless file from extensionless file (Cancel) | `README` (no extension) saved and open | 1. Click filename to open rename dialog<br>2. Type `INSTALL`<br>3. Submit rename form<br>4. Click Cancel on confirmation prompt | Step 3: the same question as TS-RENAME-06. Step 4: the rename dialog stays open with `INSTALL` in the field; the file keeps its name `README`. |
