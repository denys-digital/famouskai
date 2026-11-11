/*
 * Unit Core Test Harness for Famouskai Editor
 * Loads the main app in a hidden iframe and provides helper utilities for testing core modules.
 *
 * How to write a unit-core-<domain>.html test page:
 * 1. Include unit-core-harness.js in <head> or <body> script.
 * 2. Define test cases using test(id, scenario, expected, fn).
 * 3. In window.onload, call await loadApp() to boot the app iframe context (appWin).
 * 4. Call appWin.eval('...') or harness helpers (mockFileHandle, mockDirectoryHandle) to invoke actions, mock handles or dialogs.
 * 5. Call await run(appWin) to execute all tests sequentially and update #summary element.
 */

(function (global) {
    let appIframe = null;
    let appWindow = null;
    const registeredTests = [];

    function loadApp() {
        return new Promise((resolve, reject) => {
            if (appIframe) {
                document.body.removeChild(appIframe);
                appIframe = null;
                appWindow = null;
            }

            const iframe = document.createElement('iframe');
            iframe.id = 'app-frame';
            iframe.src = '../index.html';
            iframe.style.position = 'absolute';
            iframe.style.left = '-10000px';
            iframe.style.top = '0';
            iframe.style.width = '1200px';
            iframe.style.height = '800px';
            iframe.style.border = '0';
            document.body.appendChild(iframe);
            appIframe = iframe;

            const start = Date.now();
            const timer = setInterval(() => {
                try {
                    const win = iframe.contentWindow;
                    if (win && win.document && win.document.readyState === 'complete' && win.editor && win.FamousPluginCore && win.FamousPluginCore.Manager && typeof win.savePreferences === 'function' && typeof win.newFile === 'function') {
                        clearInterval(timer);
                        appWindow = win;
                        resolve(win);
                        return;
                    }
                } catch (e) {
                    // Ignore cross-origin/loading transient errors
                }
                if (Date.now() - start > 10000) {
                    clearInterval(timer);
                    reject(new Error("App failed to boot within 10s"));
                }
            }, 50);
        });
    }

    function mockFileHandle(name, text = '', lastModified = Date.now()) {
        const handle = {
            name: name,
            kind: 'file',
            _text: text,
            lastModified: lastModified,
            writes: [],
            async getFile() {
                return new File([this._text], this.name, { lastModified: this.lastModified });
            },
            async createWritable() {
                const self = this;
                return {
                    async write(data) {
                        self._text = typeof data === 'string' ? data : new TextDecoder().decode(data);
                        self.writes.push(self._text);
                    },
                    async close() {
                        self.lastModified = Date.now();
                    }
                };
            },
            async queryPermission() { return 'granted'; },
            async requestPermission() { return 'granted'; },
            async isSameEntry(other) {
                if (!other) return false;
                if (this === other) return true;
                return this.name === other.name && this.kind === other.kind;
            }
        };
        return handle;
    }

    function mockDirectoryHandle(name, tree = {}) {
        const children = new Map();
        for (const [key, val] of Object.entries(tree)) {
            if (val && typeof val === 'object' && val.kind === 'file') {
                children.set(key, val);
            } else if (val && typeof val === 'object' && val.kind === 'directory') {
                children.set(key, val);
            } else if (typeof val === 'string') {
                children.set(key, mockFileHandle(key, val));
            } else if (typeof val === 'object' && val !== null) {
                children.set(key, mockDirectoryHandle(key, val));
            }
        }

        const handle = {
            name: name,
            kind: 'directory',
            _children: children,
            async *values() {
                for (const child of children.values()) {
                    yield child;
                }
            },
            async *entries() {
                for (const [k, child] of children.entries()) {
                    yield [k, child];
                }
            },
            async getFileHandle(childName, options = {}) {
                const child = children.get(childName);
                if (child && child.kind === 'file') return child;
                if (options.create) {
                    const newFile = mockFileHandle(childName, '');
                    children.set(childName, newFile);
                    return newFile;
                }
                throw new Error(`File '${childName}' not found`);
            },
            async getDirectoryHandle(childName, options = {}) {
                const child = children.get(childName);
                if (child && child.kind === 'directory') return child;
                if (options.create) {
                    const newDir = mockDirectoryHandle(childName, {});
                    children.set(childName, newDir);
                    return newDir;
                }
                throw new Error(`Directory '${childName}' not found`);
            },
            async queryPermission() { return 'granted'; },
            async requestPermission() { return 'granted'; },
            async isSameEntry(other) {
                if (!other) return false;
                if (this === other) return true;
                return this.name === other.name && this.kind === other.kind;
            },
            async resolve(possibleDescendant) {
                if (!possibleDescendant) return null;
                if (await this.isSameEntry(possibleDescendant)) return [];
                for (const [k, child] of children.entries()) {
                    if (await child.isSameEntry(possibleDescendant)) {
                        return [k];
                    }
                    if (child.kind === 'directory' && typeof child.resolve === 'function') {
                        const subPath = await child.resolve(possibleDescendant);
                        if (subPath) return [k, ...subPath];
                    }
                }
                return null;
            }
        };
        return handle;
    }

    function test(id, scenario, expected, fn) {
        registeredTests.push({ id, scenario, expected, fn });
    }

    async function run(appWin) {
        const win = appWin || appWindow;
        const resultsBody = document.getElementById('results');
        const summaryEl = document.getElementById('summary');
        let passedCount = 0;

        if (resultsBody) resultsBody.textContent = '';

        for (const tc of registeredTests) {
            let originalConfirm = null;
            let originalAlert = null;
            let originalPrompt = null;
            let originalShowOpenFilePicker = null;
            let originalShowSaveFilePicker = null;
            let originalAddRecentFile = null;

            if (win) {
                originalConfirm = win.confirm;
                originalAlert = win.alert;
                originalPrompt = win.prompt;
                originalShowOpenFilePicker = win.showOpenFilePicker;
                originalShowSaveFilePicker = win.showSaveFilePicker;
                originalAddRecentFile = win.addRecentFile;

                // Mock addRecentFile to prevent IndexedDB DataCloneError with mock handles
                win.addRecentFile = async () => {};
            }

            let passed = false;
            let detailMessage = '';

            try {
                await tc.fn(win);
                passed = true;
            } catch (err) {
                passed = false;
                detailMessage = err && err.message ? err.message : String(err);
            } finally {
                if (win) {
                    win.confirm = originalConfirm;
                    win.alert = originalAlert;
                    win.prompt = originalPrompt;
                    win.showOpenFilePicker = originalShowOpenFilePicker;
                    win.showSaveFilePicker = originalShowSaveFilePicker;
                    win.addRecentFile = originalAddRecentFile;
                }
            }

            if (passed) passedCount++;

            if (resultsBody) {
                const tr = document.createElement('tr');
                tr.className = passed ? 'pass' : 'fail';

                const tdStatus = document.createElement('td');
                tdStatus.className = 'status';
                tdStatus.textContent = passed ? 'PASS' : 'FAIL';

                const tdId = document.createElement('td');
                tdId.textContent = tc.id;

                const tdScenario = document.createElement('td');
                tdScenario.textContent = tc.scenario;

                const tdExpected = document.createElement('td');
                tdExpected.textContent = tc.expected;

                const tdDetail = document.createElement('td');
                tdDetail.textContent = detailMessage || (passed ? 'OK' : 'Failed');

                tr.appendChild(tdStatus);
                tr.appendChild(tdId);
                tr.appendChild(tdScenario);
                tr.appendChild(tdExpected);
                tr.appendChild(tdDetail);

                resultsBody.appendChild(tr);
            }
        }

        const totalCount = registeredTests.length;
        if (summaryEl) {
            summaryEl.textContent = `${passedCount}/${totalCount} passed`;
            summaryEl.className = `summary ${passedCount === totalCount ? 'pass' : 'fail'}`;
        }

        return { passed: passedCount === totalCount, passedCount, totalCount };
    }

    global.loadApp = loadApp;
    global.mockFileHandle = mockFileHandle;
    global.mockDirectoryHandle = mockDirectoryHandle;
    global.test = test;
    global.run = run;

})(typeof window !== 'undefined' ? window : this);
