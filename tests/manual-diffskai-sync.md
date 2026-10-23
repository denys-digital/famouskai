# Test Suite: Inter-Process Synchronization (Famouskai ↔ Diffskai)

## 1. Normal Mode Synchronization (Event: `DIFFSKAI_SAVED`)

| Test ID | Scenario | Pre-conditions | Action Steps | Expected Outcome |
| :--- | :--- | :--- | :--- | :--- |
| **SYNC-01** | Seamless Auto-Reload | File `X` open in Famouskai. No unsaved changes (`isModified === false`). File `X` is concurrently open in Diffskai. | 1. Modify file in Diffskai.<br>2. Save file via Diffskai. | Famouskai intercepts `DIFFSKAI_SAVED` payload. UI displays "✅ Auto-Synced". Editor content strictly mirrors the newly saved disk state. |
| **SYNC-02** | Unsaved Changes Protection (Accept) | File `X` open in Famouskai. Unsaved local changes exist (`isModified === true`). | 1. Save file via Diffskai.<br>2. Switch context to Famouskai.<br>3. Accept the modal confirmation prompt. | Famouskai intercepts `DIFFSKAI_SAVED` and halts automatic overwrite. Upon user acceptance, local memory state is discarded and replaced with the disk version. |
| **SYNC-03** | Unsaved Changes Protection (Decline) | File `X` open in Famouskai. Unsaved local changes exist (`isModified === true`). | 1. Save file via Diffskai.<br>2. Switch context to Famouskai.<br>3. Decline the modal confirmation prompt. | Famouskai intercepts `DIFFSKAI_SAVED`. Upon user decline, local editor state is preserved. Disk file remains mutated by Diffskai. |

## 2. Conflict Resolution Mode (Event: `MERGE_COMPLETE`)

| Test ID | Scenario | Pre-conditions | Action Steps | Expected Outcome |
| :--- | :--- | :--- | :--- | :--- |
| **CONF-01** | Conflict Detection & Launch | File `X` open in Famouskai. File `X` timestamp mutated externally (`diskFile.lastModified > lastKnownModifiedTime`). | 1. Input arbitrary keystrokes in Famouskai.<br>2. Trigger Save (`Ctrl+S`).<br>3. Accept conflict prompt. | I/O operation is aborted. Diffskai instantiates with `?conflict=[ID]` routing parameter. Left panel mounts Read-Only disk version; Right panel mounts local memory version. |
| **CONF-02** | Successful Merge & Broadcast | Diffskai running in active Conflict Mode (`isConflictMode === true`). | 1. Mutate Right Panel content.<br>2. Execute "Save & Overwrite". | Diffskai triggers garbage collection on `diffskai_t_*` keys (localStorage/IndexedDB). Broadcasts `MERGE_COMPLETE`. Diffskai window terminates. Famouskai auto-reloads and renders "✅ Merge done". |
| **CONF-03** | Conflict Abort & Garbage Collection | File `X` open in Famouskai. File `X` timestamp mutated externally. | 1. Trigger Save (`Ctrl+S`).<br>2. Decline conflict prompt. | Diffskai instantiation is bypassed. Famouskai flushes orphan `diffskai_t_*` conflict payloads from local storage. Editor state remains unsaved. |
| **CONF-04** | Post-Merge Timestamp Integrity | Famouskai has successfully recovered from a CONF-02 state. | 1. Mutate file in Famouskai.<br>2. Trigger Save (`Ctrl+S`). | Save executes synchronously without triggering a false positive conflict. `lastKnownModifiedTime` validates properly against the disk. |
