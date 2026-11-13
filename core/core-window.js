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
 * Famouskai Core - Window Helpers & Toast
 *
 * What it holds:
 *   - Window context and layout helpers (isPopupWindow, getCleanAppUrl, getPopupAppUrl)
 *   - Auto window layout initialization at startup (initWindowLayout)
 *   - Global toast display function (window.showToast)
 *   - window.currentWorkspaceHandle initialization
 *
 * Globals used:
 *   - DOM element #toast-msg
 *
 * Globals defined:
 *   - isPopupWindow
 *   - getCleanAppUrl
 *   - getPopupAppUrl
 *   - window.showToast
 *   - window.currentWorkspaceHandle
 */

// ﹥ CONTEXT & LAYOUT HELPERS
/**
 * Determines if the current application instance is running in a popup/standalone window
 * or in a standard browser tab.
 * @returns {boolean} True if running in a popup window, false if in a browser tab.
 */
function isPopupWindow() {
    // 1. Explicit URL parameter check (?mode=popup)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('mode') === 'popup') return true;

    // 2. PWA standalone display mode check
    if (window.matchMedia && (
        window.matchMedia('(display-mode: standalone)').matches ||
        window.matchMedia('(display-mode: window-controls-overlay)').matches
    )) {
        return true;
    }
    if (navigator.standalone) return true;

    // 3. Browser UI bar visibility check (popups do not show menubar/toolbar/locationbar)
    if (window.menubar && !window.menubar.visible) return true;
    if (window.toolbar && !window.toolbar.visible) return true;
    if (window.locationbar && !window.locationbar.visible) return true;

    return false;
}

/**
 * Returns a clean URL for opening a browser tab (removes popup-specific query params).
 * @returns {string} Clean URL string.
 */
function getCleanAppUrl() {
    const url = new URL(window.location.href);
    url.searchParams.delete('mode');
    url.searchParams.delete('pos');
    return url.toString();
}

/**
 * Returns a popup URL with mode=popup and optional positioning parameters.
 * @param {string} [pos] Position mode ('left', 'right', 'full')
 * @returns {string} Popup URL string.
 */
function getPopupAppUrl(pos) {
    const url = new URL(getCleanAppUrl());
    url.searchParams.set('mode', 'popup');
    if (pos) {
        url.searchParams.set('pos', pos);
    }
    return url.toString();
}

// ﹥ AUTO WINDOW LAYOUT ON STARTUP
(function initWindowLayout() {
    try {
        // Do not attempt window positioning/resizing if running inside a browser tab
        if (!isPopupWindow()) return;

        const screenWidth = window.screen.width;
        const dpr = window.devicePixelRatio || 1;
        // Physical screen width or CSS screen width (handles display scaling, e.g. 125%/150% on 2560px displays)
        const physicalWidth = screenWidth * dpr;
        const isWide = screenWidth > 2000 || physicalWidth > 2000;

        const screenLeft = window.screen.availLeft || 0;
        const screenTop = window.screen.availTop || 0;
        const availWidth = window.screen.availWidth;
        const availHeight = window.screen.availHeight;
        const halfWidth = Math.floor(availWidth / 2);

        const urlParams = new URLSearchParams(window.location.search);
        const pos = urlParams.get('pos');

        if (pos === 'right') {
            window.moveTo(screenLeft + halfWidth, screenTop);
            window.resizeTo(halfWidth, availHeight);
        } else if (pos === 'left') {
            window.moveTo(screenLeft, screenTop);
            window.resizeTo(halfWidth, availHeight);
        } else if (pos === 'full') {
            window.moveTo(screenLeft, screenTop);
            window.resizeTo(availWidth, availHeight);
        } else {
            if (isWide) {
                window.moveTo(screenLeft, screenTop);
                window.resizeTo(halfWidth, availHeight);
            } else {
                window.moveTo(screenLeft, screenTop);
                window.resizeTo(availWidth, availHeight);
            }
        }
    } catch (err) {
        console.warn("Window layout initialization failed:", err);
    }
})();

// ﹥ GLOBAL TOAST FUNCTION
// showToast(msg, type) closes by itself after a few seconds.
// showToast(msg, type, { sticky: true }) stays until the user clicks its "OK" link
// (for messages the user must read, such as the update message). Any later toast
// replaces it.
window.showToast = function(msg, type, options) {
    const toast = document.getElementById('toast-msg');
    if (!toast) return;
    const sticky = !!(options && options.sticky);
    toast.textContent = msg;
    toast.classList.remove('toast-success', 'toast-info', 'toast-warn', 'toast-error', 'toast-sticky');
    if (type) toast.classList.add('toast-' + type);
    clearTimeout(window._toastTimer);
    if (sticky) {
        toast.classList.add('toast-sticky');
        const close = document.createElement('a');
        close.href = '#';
        close.className = 'toast-close';
        close.textContent = 'OK';
        close.addEventListener('click', (e) => {
            e.preventDefault();
            toast.classList.remove('show', 'toast-sticky');
        });
        toast.appendChild(document.createTextNode(' '));
        toast.appendChild(close);
    }
    toast.classList.add('show');
    if (sticky) return;
    // Longer messages stay longer: 1 s plus about 70 ms per character, between 3 and 10 s.
    const duration = Math.min(10000, Math.max(3000, 1000 + String(msg).length * 70));
    window._toastTimer = setTimeout(() => toast.classList.remove('show'), duration);
};

window.currentWorkspaceHandle = null;
