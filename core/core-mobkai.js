/*
 * Famouskai Editor - Local-First PWA IDE
 * Copyright (C) 2026 Denys Poulat (https://github.com/denys-digital)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * -------------------------------------------------------------------------
 * COMMERCIAL LICENSE
 * For commercial integration without the AGPLv3 strict open-source
 * restrictions, please contact the author to acquire a commercial license.
 * -------------------------------------------------------------------------
 */
/*
 * Famouskai Core - Mobkai Detection (minimal mobile note mode)
 *
 * Loaded in <head>, before style.css, so the "mobkai" class is on <html>
 * before the first paint. Spec: docs-lab/MOBKAI-SPEC.md (sections 3, 13, 14).
 *
 * What it holds:
 *   - Pure decision function (window.FamousMobkai.decide), unit tested
 *   - Boot detection: URL ?mobkai=1|0|auto, then the stored override, then auto
 *   - The "mobkai" class on <html> when Mobkai is on
 *   - Read-only helper window.isMobkai()
 *
 * Globals used:
 *   - None (runs before every other script)
 *
 * Globals defined:
 *   - window.FamousMobkai (decide, STORAGE_KEY, DRAFT_KEY, shouldKeepDraft, shouldOfferDraft, clearDraft)
 *   - window.isMobkai
 */

(function () {
    const STORAGE_KEY = 'famouskai_mobkai_override';
    const DRAFT_KEY = 'famouskai_mobkai_draft';

    /**
     * Determines whether an unsaved draft should be kept for [New] note.
     * Pure function: no DOM, no storage.
     * @param {Object} input
     * @param {string} [input.fileName]
     * @param {boolean} [input.modified]
     * @param {string} [input.text]
     * @returns {boolean}
     */
    function shouldKeepDraft(input) {
        if (!input) return false;
        const fn = input.fileName;
        const isNew = fn === '' || fn === '[New]' || fn == null;
        const isMod = !!input.modified;
        const hasText = typeof input.text === 'string' && input.text.trim().length > 0;
        return isNew && isMod && hasText;
    }

    /**
     * Determines whether an existing draft should be offered back at boot.
     * Pure function: no DOM, no storage.
     * @param {Object} input
     * @param {Object} [input.draft]
     * @param {string} [input.fileName]
     * @param {string} [input.text]
     * @param {string} [input.search]
     * @returns {boolean}
     */
    function shouldOfferDraft(input) {
        if (!input) return false;
        const d = input.draft;
        const validDraft = !!(d && typeof d === 'object' && typeof d.text === 'string' && d.text.trim().length > 0);
        if (!validDraft) return false;

        const fn = input.fileName;
        const isNew = fn === '' || fn === '[New]' || fn == null;
        const isBufferEmpty = !input.text || (typeof input.text === 'string' && input.text.trim().length === 0);
        if (!isNew || !isBufferEmpty) return false;

        const s = typeof input.search === 'string' ? input.search : '';
        if (s.includes('shared=true') || s.includes('open_file_id')) return false;

        return true;
    }

    /**
     * Decides whether Mobkai is on. Pure function: no DOM, no storage.
     * @param {Object} input
     * @param {string|null} input.query - value of ?mobkai= ("1", "0", "auto" or null)
     * @param {string|null} input.stored - stored override ("1", "0" or null)
     * @param {boolean} input.coarse - matchMedia('(pointer: coarse)')
     * @param {boolean} input.narrow - matchMedia('(max-width: 767px)')
     * @param {boolean|undefined} input.uaDataMobile - navigator.userAgentData.mobile, undefined if missing
     * @param {string} input.ua - navigator.userAgent
     * @returns {{on: boolean, store: string|null|undefined}} store: value to save, null to remove, undefined to leave as is
     */
    function decide(input) {
        const q = input.query;
        if (q === '1' || q === '0') return { on: q === '1', store: q };
        let store;
        let stored = input.stored;
        if (q === 'auto') { store = null; stored = null; }
        if (stored === '1' || stored === '0') return { on: stored === '1', store: store };
        const mobileDevice = (typeof input.uaDataMobile === 'boolean')
            ? input.uaDataMobile
            : /(Android|iPhone|iPod|Mobile)/i.test(input.ua || '');
        return { on: !!(input.coarse && input.narrow && mobileDevice), store: store };
    }

    function safeMatch(query) {
        try { return !!(window.matchMedia && window.matchMedia(query).matches); } catch (e) { return false; }
    }

    let on = false;
    try {
        let query = null;
        try { query = new URLSearchParams(window.location.search).get('mobkai'); } catch (e) { query = null; }
        let stored = null;
        try { stored = window.localStorage.getItem(STORAGE_KEY); } catch (e) { stored = null; }
        const uaData = navigator.userAgentData;
        const result = decide({
            query: query,
            stored: stored,
            coarse: safeMatch('(pointer: coarse)'),
            narrow: safeMatch('(max-width: 767px)'),
            uaDataMobile: (uaData && typeof uaData.mobile === 'boolean') ? uaData.mobile : undefined,
            ua: navigator.userAgent
        });
        on = result.on;
        try {
            if (result.store === null) window.localStorage.removeItem(STORAGE_KEY);
            else if (typeof result.store === 'string') window.localStorage.setItem(STORAGE_KEY, result.store);
        } catch (e) {
            console.warn('Mobkai: localStorage write failed:', e);
        }
    } catch (e) {
        console.warn('Mobkai: detection failed, desktop mode kept:', e);
        on = false;
    }

    // Decided once at boot: rotation or resize never switch the mode.
    if (on) {
        document.documentElement.classList.add('mobkai');

        // Virtual keyboard viewport resize handling (spec section 7.1 point 5 & 13.5)
        if (window.visualViewport) {
            let resizeTimer = null;
            function onViewportChange() {
                if (resizeTimer) clearTimeout(resizeTimer);
                resizeTimer = setTimeout(() => {
                    if (window.editor && typeof window.editor.resize === 'function') {
                        window.editor.resize();
                        if (window.editor.renderer && typeof window.editor.renderer.scrollCursorIntoView === 'function') {
                            window.editor.renderer.scrollCursorIntoView();
                        }
                    }
                }, 50);
            }
            window.visualViewport.addEventListener('resize', onViewportChange);
            window.visualViewport.addEventListener('scroll', onViewportChange);
        }

        // Status bar setup (docs-lab/MOBKAI-SPEC.md sections 13.5, 14.2 Q5, 14.5)
        function initStatusBar() {
            const statusBar = document.getElementById('mobkai-status-bar');
            const toastMsg = document.getElementById('toast-msg');
            const statusVersion = document.getElementById('mobkai-status-version');
            const btnCopyAll = document.getElementById('btn-copy-all');

            if (statusBar && toastMsg && statusVersion) {
                statusBar.insertBefore(toastMsg, statusVersion);
            }

            if (btnCopyAll) {
                btnCopyAll.addEventListener('click', async () => {
                    btnCopyAll.blur();
                    try {
                        const text = (window.editor && typeof window.editor.getValue === 'function')
                            ? window.editor.getValue()
                            : '';
                        if (!text) {
                            if (window.showToast) window.showToast('Nothing to copy', 'info');
                            return;
                        }
                        if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
                            await navigator.clipboard.writeText(text);
                            if (window.showToast) window.showToast('Copied', 'success');
                        } else {
                            if (window.showToast) window.showToast('Copy failed', 'error');
                        }
                    } catch (e) {
                        if (window.showToast) window.showToast('Copy failed', 'error');
                    }
                });
            }
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initStatusBar, { once: true });
        } else {
            initStatusBar();
        }

        // Draft saving on visibilitychange and pagehide (spec 6, 13.6, 13.7 Q6, 14.2 Q1/Q6)
        function saveDraftIfNeeded() {
            try {
                const text = (window.editor && typeof window.editor.getValue === 'function')
                    ? window.editor.getValue()
                    : '';
                const fileName = (typeof currentFileName !== 'undefined') ? currentFileName : '';
                const modified = (typeof isModified !== 'undefined') ? isModified : false;
                if (shouldKeepDraft({ fileName: fileName, modified: modified, text: text })) {
                    window.localStorage.setItem(DRAFT_KEY, JSON.stringify({
                        text: text,
                        savedAt: Date.now()
                    }));
                }
            } catch (e) {
                // Silently ignore storage errors (quota, private mode)
            }
        }

        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                saveDraftIfNeeded();
            }
        });
        window.addEventListener('pagehide', saveDraftIfNeeded);

        // Draft recovery at boot (spec 6, 13.6, 13.7 Q6, 14.2 Q1/Q6)
        function checkDraftAtBoot() {
            let raw = null;
            try {
                raw = window.localStorage.getItem(DRAFT_KEY);
            } catch (e) {
                return;
            }
            if (!raw) return;

            let draft = null;
            try {
                draft = JSON.parse(raw);
            } catch (e) {
                clearDraft();
                return;
            }

            const fileName = (typeof currentFileName !== 'undefined') ? currentFileName : '';
            const text = (window.editor && typeof window.editor.getValue === 'function')
                ? window.editor.getValue()
                : '';
            const search = window.location ? (window.location.search || '') : '';

            if (shouldOfferDraft({ draft: draft, fileName: fileName, text: text, search: search })) {
                const date = draft.savedAt ? new Date(draft.savedAt) : new Date();
                const hours = String(date.getHours()).padStart(2, '0');
                const minutes = String(date.getMinutes()).padStart(2, '0');
                showRestoreButton(draft.text, hours + ':' + minutes);
            }
        }

        // Restore button: takes the place of "Copy all" while the [New] buffer is empty.
        // A button, not a confirm(): Chrome for Android blocks dialogs when a killed tab is reopened.
        function showRestoreButton(draftText, timeStr) {
            const btnRestore = document.getElementById('btn-restore-draft');
            const btnCopyAll = document.getElementById('btn-copy-all');
            if (!btnRestore) return;
            btnRestore.title = 'Restore the unsaved note from ' + timeStr;
            btnRestore.hidden = false;
            if (btnCopyAll) btnCopyAll.hidden = true;

            function onRestore() {
                btnRestore.blur();
                hideRestoreButton();
                if (window.editor && typeof window.editor.setValue === 'function') {
                    window.editor.setValue(draftText, 1); // 1 = cursor at the end of the text
                }
                if (typeof isModified !== 'undefined') {
                    isModified = true;
                }
                if (typeof updateUI === 'function') {
                    updateUI();
                }
                if (typeof window.showToast === 'function') {
                    window.showToast('Note restored. Save to keep it.', 'info');
                }
                if (window.editor && typeof window.editor.focus === 'function') window.editor.focus();
            }
            btnRestore.addEventListener('click', onRestore, { once: true });

            // First character typed: Restore gives its place back to "Copy all".
            if (window.editor && window.editor.session) {
                const onChange = function () {
                    window.editor.session.off('change', onChange);
                    btnRestore.removeEventListener('click', onRestore);
                    hideRestoreButton();
                };
                window.editor.session.on('change', onChange);
            }
        }

        function scheduleDraftCheck() {
            setTimeout(checkDraftAtBoot, 500);
        }

        if (document.readyState === 'complete') {
            scheduleDraftCheck();
        } else {
            window.addEventListener('load', scheduleDraftCheck, { once: true });
        }
    }

    function hideRestoreButton() {
        const btnRestore = document.getElementById('btn-restore-draft');
        const btnCopyAll = document.getElementById('btn-copy-all');
        if (btnRestore) btnRestore.hidden = true;
        if (btnCopyAll) btnCopyAll.hidden = false;
    }

    function clearDraft() {
        if (!on) return;
        hideRestoreButton();
        try {
            window.localStorage.removeItem(DRAFT_KEY);
        } catch (e) {
            // Silently ignore storage errors (quota, private mode)
        }
    }

    window.FamousMobkai = {
        decide: decide,
        STORAGE_KEY: STORAGE_KEY,
        DRAFT_KEY: DRAFT_KEY,
        shouldKeepDraft: shouldKeepDraft,
        shouldOfferDraft: shouldOfferDraft,
        clearDraft: clearDraft
    };
    window.isMobkai = function () { return on; };
})();
