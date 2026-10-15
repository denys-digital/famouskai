# PWA Toolchain: Local-First Vendor Maintenance & Git Sync

## 1. Project Overview & Architectural Reverse Engineering Summary
*   **Architecture Paradigm:** Serverless, browser-only Progressive Web Apps operating on local files via the Web File System Access API.
*   **Tool A (Central Vendor Updater):** Dependency acquisition engine bridging jsDelivr CDN and local storage, governed by a central SSOT configuration.
*   **Tool B (GitHub Tree Uploader):** Custom Git client bypassing standard API rate limits by utilizing low-level Git Database REST endpoints for atomic tree commits.
*   **Data Flow Synergy:** Tool A fetches and structures remote vendor files locally; Tool B serializes the local structure and pushes it to a remote Git branch.

## 2. Component A: Download & Documentation Generator (`updater.html`)

**Important Workflow Constraint:** This utility does **not** interface directly with GitHub. It is a strictly local tool designed to fetch and structure external library sources onto your local hard drive. Following a successful download, maintainers must manually update the project's root documentation files using the generated snippets, and subsequently push the changes to GitHub adhering to the standard project lifecycle (Issue 🡪 Local Branch 🡪 Upload 🡪 Commit 🡪 Pull Request 🡪 Merge), as defined in the `MAINTAINER-GUIDE.md`.

### 2.1. Initialization & Configuration
*   **SSOT Binding:** The tool natively imports `vendor-config.js`, extracting the `FAMOUSKAI_VENDORS` array which acts as the Single Source of Truth for all dependency definitions.
*   **State Management:** Dynamically populates the UI dropdown menu and sets the operational context (target package, base URL, metadata) based on the selected vendor object.

### 2.2. Version Resolution Pipeline
*   **Registry Query:** Interrogates the jsDelivr API (`https://data.jsdelivr.com/v1/package/npm/{npmPackage}`).
*   **Tag Extraction:** Parses the JSON response to extract the `latest` version tag, overriding manual input requirements and enabling the download button.

### 2.3. Download Strategies (The Routing Engine)
Depending on the vendor configuration, the tool routes the download through one of two distinct strategies:
*   **Flat Array Strategy (Default):** Iterates directly over a hardcoded `files` array defined in the configuration, appending the filenames to the base CDN URL.
*   **Regex-Tree Strategy:** Fetches the complete flat file tree from the CDN. Filters the tree dynamically by applying `keepPatterns` (files that must match) and `ignorePatterns` (files that are dropped, such as source maps or foreign localizations) using standard RegExp evaluation.

### 2.4. Local File System Operations
*   **Directory Access:** Invokes the Web File System Access API (`window.showDirectoryPicker({ mode: 'readwrite' })`) to request user permission for local disk writes.
*   **Security Validation:** Enforces a strict path check by verifying that the selected local folder name exactly matches the `npmPackage` string. The process aborts immediately to prevent arbitrary directory corruption if this validation fails.
*   **Recursive Structuring:** Utilizes a custom `ensureDirectoryHandle` function to rebuild the exact remote folder hierarchy locally before streaming the file blobs to disk via `createWritable()`.

### 2.5. Automated Artifact Generation
Upon successful download of all required assets, the utility automatically generates local maintenance files and documentation snippets:
*   **`_vendor-update.log`:** A timestamped audit trail written to the local directory, detailing the requested version, user agent, and a complete list of processed files and their remote source URLs.
*   **`_VENDOR-INFO.md`:** A localized instructional file for the specific dependency, injecting project metadata, licensing, and explicit update instructions.
*   **Doc Snippets:** Renders dynamic markdown strings in the UI intended for manual copy-pasting into the project's root `THIRD-PARTY-NOTICES.md` (copyright attribution list) and `README.md` (dependency table tracking).





## 2. Component A: Download & Documentation Generator (`updater.html`)
*   **Initialization & Configuration**
    *   Loading routine and dependency mapping via `vendor-config.js` (`FAMOUSKAI_VENDORS`).
    *   Dropdown population and UI state management.
*   **Version Resolution Pipeline**
    *   Querying the `data.jsdelivr.com` API.
    *   Extracting the `latest` tag from JSON response.
*   **Download Strategies (The Routing Engine)**
    *   **Flat Array Strategy:** Direct iteration over predefined filenames.
    *   **Regex-Tree Strategy:** Dynamic remote tree fetching, evaluated against `keepPatterns` and `ignorePatterns` (RegExp filtering).
*   **Local File System Operations**
    *   Requesting `readwrite` directory handles.
    *   Security validation (matching local folder name against `npmPackage`).
    *   Recursive directory creation (`ensureDirectoryHandle`).
    *   Blob streaming to disk (`createWritable`).
*   **Automated Artifact Generation**
    *   `_vendor-update.log`: Timestamped audit trail of downloaded assets.
    *   `_VENDOR-INFO.md`: Project metadata, licensing, and update instructions.
    *   **Doc Snippets:** Dynamic HTML rendering of markdown tables (`README.md`) and copyright strings (`THIRD-PARTY-NOTICES.md`) with copy-to-clipboard functionality.

## 3. Component B: GitHub PWA Uploader Workflows (`github-uploader.html`)
*   **Core Engine: Git Database REST API**
    *   Authentication via Personal Access Token (`localStorage` persistence).
    *   URL Parsing regex to extract `owner`, `repo`, and `branch`.
    *   Recursive local file scanning (excluding `.git` and `node_modules`).
*   **The Atomic Commit Sequence (Bottom-Up Construction)**
    *   Step 1: Fetch `latestCommitSha` from `heads/{branch}`.
    *   Step 2: Fetch `baseTreeSha` to preserve unmodified remote files.
    *   Step 3: POST distinct `/git/blobs` for every local file.
    *   Step 4: POST new `/git/trees` array referencing generated blobs and the `base_tree`.
    *   Step 5: POST new `/git/commits` referencing the new tree and parent commit.
    *   Step 6: PATCH `/git/refs/heads/{branch}` to point to the new commit.

### 3.1. Workflow 1: Mass Upload Mode (Initialization)
*   **Functional Definition:** Pushing a complete vendor directory for the first time.
*   **UI Configuration:** `gh-include-root` checkbox is **Checked**.
*   **Technical Behavior:** The script prefixes all file paths with the root directory name (`${dirHandle.name}/`).
*   **Result:** The remote repository creates a new namespaced folder containing all blobs, appended to the base tree.

### 3.2. Workflow 2: Patch Mode (Version Update)
*   **Functional Definition:** Updating an existing vendor directory without nesting folders.
*   **UI Configuration:** `gh-include-root` checkbox is **Unchecked**.
*   **Technical Behavior:** The script uses an empty string as the path prefix.
*   **Result:** New blobs overwrite existing blobs with the same path within the current directory level, leaving orthogonal files intact via the `base_tree` reference.

## 4. Required Dependencies & Local Setup
*   **Environment Constraints:** Optimized for Chromebooks/ChromeOS without Linux CLI. Requires a Chromium-based browser supporting the File System Access API.
*   **GitHub Authentication:** Generation of a Fine-grained PAT or Classic PAT with `repo` scope.
*   **Security Posture:** 
    *   Tokens are strictly volatile/local (`localStorage`).
    *   Cross-Origin Resource Sharing (CORS) limits bypass via direct REST API calls.