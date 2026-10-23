# Manual Test Specification: File Rename Extension Control (`rename-file-extension`)

## Overview
This document outlines manual testing scenarios for hot file renaming (`fileHandle.move`) extension control, auto-completion, dotfile confirmation, and cancellation.

## Sample Test Dataset
```text
Sample file content for testing hot rename extension preservation:
Famouskai Editor test file.
Row 2 content.
```

## Test Matrix

| Test ID | Scenario | Pre-conditions | Action Steps | Expected Outcome |
| :--- | :--- | :--- | :--- | :--- |
| **TS-RENAME-01** | Auto-append original extension when omitted | Active file opened on disk (e.g., `document.md`) | 1. Click filename in top toolbar to open rename dialog<br>2. Type `report` (without extension)<br>3. Submit rename form | File is renamed to `report.md` on disk. UI and title update to `report.md`. Toast confirms "Renamed to report.md". |
| **TS-RENAME-02** | Replace trailing dot with original extension | Active file opened on disk (e.g., `script.js`) | 1. Click filename to open rename dialog<br>2. Type `app.`<br>3. Submit rename form | Trailing dot is replaced by original extension `js`. File is renamed to `app.js`. Toast confirms "Renamed to app.js". |
| **TS-RENAME-03** | Explicit extension change | Active file opened on disk (e.g., `notes.txt`) | 1. Click filename to open rename dialog<br>2. Type `notes.md`<br>3. Submit rename form | New extension `.md` is accepted without warning. File is renamed to `notes.md`. Toast confirms "Renamed to notes.md". Syntax highlighting updates to Markdown. |
| **TS-RENAME-04** | Creating dotfile / hidden file confirmation (Accept) | Active file opened on disk (e.g., `config.json`) | 1. Click filename to open rename dialog<br>2. Type `.env`<br>3. Submit rename form<br>4. Click OK on confirmation prompt | Confirmation prompt appears: "Warning: You are creating a hidden file or file without a standard name/extension. Do you want to proceed?". Upon clicking OK, file is renamed to `.env`. |
| **TS-RENAME-05** | Creating dotfile / hidden file confirmation (Cancel) | Active file opened on disk (e.g., `config.json`) | 1. Click filename to open rename dialog<br>2. Type `.gitignore`<br>3. Submit rename form<br>4. Click Cancel on confirmation prompt | Confirmation prompt appears. Upon clicking Cancel, rename dialog remains open with `.gitignore` in input field for editing. |
| **TS-RENAME-06** | Creating extensionless file from extensionless file (Accept) | Active extensionless file opened on disk (e.g., `README`) | 1. Click filename to open rename dialog<br>2. Type `INSTALL`<br>3. Submit rename form<br>4. Click OK on confirmation prompt | Confirmation prompt appears: "Warning: You are creating a file without an extension. Do you want to proceed?". Upon clicking OK, file is renamed to `INSTALL`. |
| **TS-RENAME-07** | Creating extensionless file from extensionless file (Cancel) | Active extensionless file opened on disk (e.g., `README`) | 1. Click filename to open rename dialog<br>2. Type `INSTALL`<br>3. Submit rename form<br>4. Click Cancel on confirmation prompt | Confirmation prompt appears. Upon clicking Cancel, rename dialog remains open with `INSTALL` in input field for editing. |
