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
 * Famouskai Editor - Tabbed Sidebar Core Extension & Framework Manager
 */
window.FamousPluginCore = window.FamousPluginCore || {};

window.FamousPluginCore.Sidebar = {
    /**
     * Active registered tabs list. Each tab has { id, title, color, icon, ... }.
     * Pre-populated with the 4 core tabs of 0.1.0 so getTab() is immediately available.
     */
    TABS: [
        { id: 'explorer', title: 'Explorer (Workspaces & Files)', color: 'var(--color-tab-explorer)', static: true, displayStyle: 'flex', icon: 'E' },
        { id: 'outline', title: 'Outline (Structure & Reorder)', color: 'var(--color-tab-outline)', static: true, displayStyle: 'block', icon: 'O' },
        { id: 'tools', title: 'Tools & Magic Snippets', color: 'var(--color-tab-tools)', static: true, displayStyle: 'flex', icon: 'T' },
        { id: 'settings', title: 'Windows, Settings & Lexicon', color: 'var(--color-tab-settings)', static: true, displayStyle: 'block', icon: 'S' }
    ],
    activeTab: 'explorer',
    isOpen: false,

    /**
     * @param {string} tabId
     * @returns {Object|undefined} The TABS entry with this id.
     */
    getTab: function(tabId) {
        return this.TABS.find(tab => tab.id === tabId);
    },

    /**
     * Registers a new sidebar tab.
     * @param {Object} def
     * @param {string} def.id - Unique identifier ([a-z0-9_-]+).
     * @param {string} def.title - Tab title used for tooltips / aria.
     * @param {string} def.color - CSS variable token (never raw hex).
     * @param {string} [def.icon] - Text symbol of 1-2 characters.
     * @param {string} [def.displayStyle='flex'] - 'flex' or 'block'.
     * @param {function(HTMLElement): void} [def.render] - Lazy rendering callback.
     * @param {function(HTMLElement): void} [def.onShow] - Activation callback.
     * @param {function(HTMLElement): void} [def.onHide] - Deactivation callback.
     * @param {boolean} [def.static=false] - True if DOM markup already exists in HTML.
     * @returns {boolean} True if registered successfully.
     */
    registerTab: function(def) {
        if (!def || typeof def !== 'object') {
            throw new Error("[Sidebar] Tab definition must be an object.");
        }

        const id = def.id;
        if (!id || typeof id !== 'string' || !/^[a-z0-9_-]+$/i.test(id)) {
            throw new Error(`[Sidebar] Invalid or missing tab ID: ${id}`);
        }

        if (!def.title || typeof def.title !== 'string') {
            throw new Error(`[Sidebar] Tab title is required for tab: ${id}`);
        }

        if (!def.color || typeof def.color !== 'string' || !def.color.trim()) {
            throw new Error(`[Sidebar] Tab color is required for tab: ${id}`);
        }

        // Per rules: raw hex colors are strictly forbidden
        if (def.color.includes('#')) {
            throw new Error(`[Sidebar] Raw hex colors are forbidden. Use CSS tokens: ${def.color}`);
        }

        // Check for duplicates
        if (this.getTab(id)) {
            throw new Error(`[Sidebar] Tab already registered: ${id}`);
        }

        // Icon handling: 1 or 2 characters text symbol, fallback to first letter of title
        let iconText = '';
        if (def.icon && typeof def.icon === 'string') {
            const trimmed = def.icon.trim();
            if (trimmed.length > 0 && trimmed.length <= 2) {
                iconText = trimmed;
            } else {
                throw new Error(`[Sidebar] Icon must be a text symbol of 1 or 2 characters: ${def.icon}`);
            }
        } else {
            iconText = def.title.trim().charAt(0).toUpperCase() || id.charAt(0).toUpperCase();
        }

        const tabEntry = {
            id: id,
            title: def.title.trim(),
            color: def.color.trim(),
            icon: iconText,
            displayStyle: (def.displayStyle === 'block') ? 'block' : 'flex',
            render: (typeof def.render === 'function') ? def.render : null,
            onShow: (typeof def.onShow === 'function') ? def.onShow : null,
            onHide: (typeof def.onHide === 'function') ? def.onHide : null,
            static: !!def.static,
            _rendered: false
        };

        const tabGroup = document.getElementById('sidebar-tab-group');
        const sidebarInner = document.querySelector('#sidebar-left .sidebar-inner');

        let btnEl = document.getElementById(`tab-${id}`);
        if (!btnEl && tabGroup) {
            btnEl = document.createElement('button');
            btnEl.className = 'sidebar-tab-btn';
            btnEl.id = `tab-${id}`;
            btnEl.setAttribute('role', 'tab');
            btnEl.setAttribute('aria-controls', `panel-${id}`);
            btnEl.setAttribute('aria-selected', 'false');
            btnEl.setAttribute('tabindex', '-1');
            btnEl.dataset.tab = id;
            btnEl.title = tabEntry.title;

            const iconSpan = document.createElement('span');
            iconSpan.className = 'sidebar-tab-icon-text';
            iconSpan.textContent = iconText;
            btnEl.appendChild(iconSpan);

            tabGroup.appendChild(btnEl);

            // Mark as bound so init() does not add a second click handler
            // (two handlers = open then close at once).
            btnEl.dataset.bound = 'true';
            btnEl.addEventListener('click', () => {
                if (this.isOpen && this.activeTab === id) {
                    this.closeSidebar();
                } else {
                    this.switchTab(id, true);
                }
            });
        }

        if (btnEl) {
            btnEl.style.setProperty('--sidebar-tab-color', tabEntry.color);
        }

        let panelEl = document.getElementById(`panel-${id}`);
        if (!panelEl && sidebarInner) {
            panelEl = document.createElement('div');
            panelEl.className = 'sidebar-panel';
            panelEl.id = `panel-${id}`;
            panelEl.setAttribute('role', 'tabpanel');
            panelEl.setAttribute('aria-labelledby', `tab-${id}`);
            panelEl.style.display = 'none';
            sidebarInner.appendChild(panelEl);
        }

        this.TABS.push(tabEntry);
        this.updateTabUI();

        return true;
    },

    /**
     * Unregisters a sidebar tab and removes its DOM elements.
     * @param {string} tabId - Unique identifier of tab to remove.
     * @returns {boolean} True if found and removed.
     */
    unregisterTab: function(tabId) {
        const index = this.TABS.findIndex(tab => tab.id === tabId);
        if (index === -1) return false;

        const tabEntry = this.TABS[index];
        const panelEl = document.getElementById(`panel-${tabId}`);
        const btnEl = document.getElementById(`tab-${tabId}`);

        const wasActive = (this.activeTab === tabId);

        if (wasActive && tabEntry.onHide && panelEl) {
            try {
                tabEntry.onHide(panelEl);
            } catch (err) {
                console.error(`[Sidebar] Error in onHide for tab ${tabId}:`, err);
            }
        }

        // Remove DOM elements if not marked static
        if (!tabEntry.static) {
            if (btnEl) btnEl.remove();
            if (panelEl) panelEl.remove();
        }

        this.TABS.splice(index, 1);

        if (wasActive) {
            const fallbackTab = this.getTab('explorer') ? 'explorer' : (this.TABS[0] ? this.TABS[0].id : null);
            if (fallbackTab) {
                if (this.isOpen) {
                    this.switchTab(fallbackTab, true);
                } else {
                    this.activeTab = fallbackTab;
                    localStorage.setItem('famouskai_active_sidebar_tab', fallbackTab);
                    this.updatePanelsDisplay();
                    this.updateTabUI();
                }
            }
        } else {
            this.updateTabUI();
        }

        return true;
    },

    init: function() {
        // Register core tabs through the registry if not already registered
        const coreTabs = [
            { id: 'explorer', title: 'Explorer (Workspaces & Files)', color: 'var(--color-tab-explorer)', static: true, displayStyle: 'flex' },
            { id: 'outline', title: 'Outline (Structure & Reorder)', color: 'var(--color-tab-outline)', static: true, displayStyle: 'block' },
            { id: 'tools', title: 'Tools & Magic Snippets', color: 'var(--color-tab-tools)', static: true, displayStyle: 'flex' },
            { id: 'settings', title: 'Windows, Settings & Lexicon', color: 'var(--color-tab-settings)', static: true, displayStyle: 'block' }
        ];

        coreTabs.forEach(ct => {
            if (!this.getTab(ct.id)) {
                this.registerTab(ct);
            }
        });

        this.applyTabColors();
        this.bindToolbarTabs();
        this.bindHideButtons();
        this.initSideDrawer();

        // Restore persisted active tab state or default to 'explorer'
        const savedTab = localStorage.getItem('famouskai_active_sidebar_tab');
        if (savedTab && this.getTab(savedTab)) {
            this.activeTab = savedTab;
        } else {
            this.activeTab = 'explorer';
        }

        // Restore startup open/close preference
        let prefs = {};
        try {
            prefs = JSON.parse(localStorage.getItem('famouskai_prefs')) || {};
        } catch (e) {
            console.warn("Failed to parse famouskai_prefs preference from localStorage:", e);
        }

        if (prefs.sidebarStartup) {
            this.switchTab(this.activeTab, true);
        } else {
            this.updateTabUI();
        }
    },

    /**
     * Gives each tab button its color through the --sidebar-tab-color custom property
     * (same pattern as the toolbar tool buttons and --tool-hover-bgcolor).
     */
    applyTabColors: function() {
        document.querySelectorAll('.sidebar-tab-btn').forEach(btn => {
            const tab = this.getTab(btn.dataset.tab);
            if (tab) btn.style.setProperty('--sidebar-tab-color', tab.color);
        });
    },

    bindToolbarTabs: function() {
        const tabGroup = document.getElementById('sidebar-tab-group');
        if (!tabGroup) return;

        // Static buttons click handler
        const tabBtns = tabGroup.querySelectorAll('.sidebar-tab-btn');
        tabBtns.forEach(btn => {
            if (btn.dataset.bound) return;
            btn.dataset.bound = 'true';
            btn.addEventListener('click', () => {
                const targetTab = btn.dataset.tab;
                if (!targetTab) return;

                if (this.isOpen && this.activeTab === targetTab) {
                    this.closeSidebar();
                } else {
                    this.switchTab(targetTab, true);
                }
            });
        });

        // Arrow-key keyboard navigation (ARIA tablist pattern)
        if (!tabGroup.dataset.navBound) {
            tabGroup.dataset.navBound = 'true';
            tabGroup.addEventListener('keydown', (e) => {
                const buttons = Array.from(tabGroup.querySelectorAll('.sidebar-tab-btn:not([disabled])'));
                const currentIndex = buttons.indexOf(document.activeElement);
                if (currentIndex === -1) return;

                let nextIndex = -1;
                if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                    e.preventDefault();
                    nextIndex = (currentIndex + 1) % buttons.length;
                } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                    e.preventDefault();
                    nextIndex = (currentIndex - 1 + buttons.length) % buttons.length;
                } else if (e.key === 'Home') {
                    e.preventDefault();
                    nextIndex = 0;
                } else if (e.key === 'End') {
                    e.preventDefault();
                    nextIndex = buttons.length - 1;
                }

                if (nextIndex !== -1 && buttons[nextIndex]) {
                    buttons[nextIndex].focus();
                }
            });
        }
    },

    bindHideButtons: function() {
        const hideBtn = document.getElementById('btn-hide-sidebar');
        if (hideBtn && !hideBtn.dataset.bound) {
            hideBtn.dataset.bound = 'true';
            hideBtn.addEventListener('click', () => {
                this.closeSidebar();
            });
        }
    },

    switchTab: function(tabId, openIfClosed = true) {
        const prevTab = this.getTab(this.activeTab);
        const nextTab = this.getTab(tabId);
        if (!nextTab) return;

        // Call onHide hook for outgoing active tab if sidebar is open
        if (prevTab && prevTab.id !== tabId && prevTab.onHide && this.isOpen) {
            const prevPanel = document.getElementById(`panel-${prevTab.id}`);
            if (prevPanel) {
                try {
                    prevTab.onHide(prevPanel);
                } catch (err) {
                    console.error(`[Sidebar] Error in onHide for tab ${prevTab.id}:`, err);
                }
            }
        }

        this.activeTab = tabId;
        localStorage.setItem('famouskai_active_sidebar_tab', tabId);

        if (openIfClosed && !this.isOpen) {
            this.openSidebar();
        } else {
            this.updatePanelsDisplay();
            this.updateTabUI();
            this._runActiveTabHooks();
        }

        // Trigger Outline refresh if switching to Outline
        if (tabId === 'outline' && window.FamousPluginCore && window.FamousPluginCore.Outline) {
            if (typeof editor !== 'undefined' && editor) {
                window.FamousPluginCore.Outline.update(editor);
            }
        }
    },

    _runActiveTabHooks: function() {
        const activeTab = this.getTab(this.activeTab);
        if (!activeTab || !this.isOpen) return;

        const panelEl = document.getElementById(`panel-${this.activeTab}`);
        if (!panelEl) return;

        // Lazy render hook
        if (activeTab.render && !activeTab._rendered) {
            activeTab._rendered = true;
            try {
                activeTab.render(panelEl);
            } catch (err) {
                console.error(`[Sidebar] Error in render for tab ${activeTab.id}:`, err);
            }
        }

        // onShow hook
        if (activeTab.onShow) {
            try {
                activeTab.onShow(panelEl);
            } catch (err) {
                console.error(`[Sidebar] Error in onShow for tab ${activeTab.id}:`, err);
            }
        }
    },

    openSidebar: function() {
        const sidebar = document.getElementById('sidebar-left');
        if (!sidebar) return;

        this.isOpen = true;
        sidebar.style.display = 'flex';

        this.updatePanelsDisplay();
        this.updateTabUI();
        this._runActiveTabHooks();

        if (typeof editor !== 'undefined' && editor) {
            setTimeout(() => editor.resize(), 50);
        }
    },

    closeSidebar: function() {
        const sidebar = document.getElementById('sidebar-left');
        if (!sidebar) return;

        // Invoke onHide hook for current active tab
        const activeTab = this.getTab(this.activeTab);
        if (activeTab && activeTab.onHide) {
            const panelEl = document.getElementById(`panel-${this.activeTab}`);
            if (panelEl) {
                try {
                    activeTab.onHide(panelEl);
                } catch (err) {
                    console.error(`[Sidebar] Error in onHide on close for tab ${activeTab.id}:`, err);
                }
            }
        }

        this.isOpen = false;
        sidebar.style.display = 'none';

        this.updateTabUI();
        this.closeDrawer();

        if (typeof editor !== 'undefined' && editor) {
            setTimeout(() => editor.resize(), 50);
        }
    },

    toggleSidebar: function(tabId) {
        if (tabId) {
            if (this.isOpen && this.activeTab === tabId) {
                this.closeSidebar();
            } else {
                this.switchTab(tabId, true);
            }
        } else {
            if (this.isOpen) {
                this.closeSidebar();
            } else {
                this.openSidebar();
            }
        }
    },

    updatePanelsDisplay: function() {
        const panels = document.querySelectorAll('.sidebar-panel');
        panels.forEach(panel => {
            if (panel.id === `panel-${this.activeTab}`) {
                const tab = this.getTab(this.activeTab);
                panel.style.display = (tab && tab.displayStyle) ? tab.displayStyle : 'flex';
            } else {
                panel.style.display = 'none';
            }
        });
    },

    updateTabUI: function() {
        const tabBtns = document.querySelectorAll('.sidebar-tab-btn');
        tabBtns.forEach(btn => {
            const isCurrentTab = btn.dataset.tab === this.activeTab;
            const isActive = this.isOpen && isCurrentTab;
            if (isActive) {
                btn.classList.add('is-active');
                btn.setAttribute('aria-selected', 'true');
            } else {
                btn.classList.remove('is-active');
                btn.setAttribute('aria-selected', 'false');
            }
            // Roving tabindex: active tab gets 0, others get -1
            btn.setAttribute('tabindex', isCurrentTab ? '0' : '-1');
        });

        // The open panel takes the color of its tab (line on top of the sidebar)
        const sidebar = document.getElementById('sidebar-left');
        const activeTab = this.getTab(this.activeTab);
        if (sidebar && activeTab) {
            sidebar.style.setProperty('--sidebar-active-color', activeTab.color);
        }
    },

    _drawerOnClose: null,

    initSideDrawer: function() {
        // Two ways to close the drawer: the chevrons in its header, and the chevrons
        // next to "Hide Menu" (visible only while the drawer is open).
        ['sidebar-drawer-close', 'btn-hide-drawer'].forEach(id => {
            const btn = document.getElementById(id);
            if (btn && !btn.dataset.bound) {
                btn.dataset.bound = 'true';
                btn.addEventListener('click', () => {
                    this.closeDrawer();
                });
            }
        });
    },

    /**
     * Opens Side Drawer overlay with flexible content, sizes (S, M, L, XL),
     * top color band, and optional callbacks.
     * Opening a drawer replaces the previous one.
     * @param {string} title - Drawer header title text.
     * @param {string|HTMLElement} content - HTML string or DOM node.
     * @param {Object} [options] - Configuration options.
     * @param {string} [options.size='S'] - Drawer size ('S', 'M', 'L', 'XL').
     * @param {string} [options.color] - CSS token for top band color.
     * @param {function(): void} [options.onClose] - Callback fired when drawer closes.
     */
    openDrawer: function(title, content, options = {}) {
        const drawer = document.getElementById('sidebar-drawer');
        const drawerTitle = document.getElementById('sidebar-drawer-title');
        const drawerBody = document.getElementById('sidebar-drawer-body');
        const sidebar = document.getElementById('sidebar-left');

        if (!drawer || !drawerTitle || !drawerBody) return;

        // If a previous drawer was open with onClose, invoke it before replacing
        if (this._drawerOnClose) {
            const prevClose = this._drawerOnClose;
            this._drawerOnClose = null;
            try {
                prevClose();
            } catch (err) {
                console.error("Error executing previous drawer onClose callback:", err);
            }
        }

        this._drawerOnClose = (options && typeof options.onClose === 'function') ? options.onClose : null;

        // Band color: active tab color, or options.color if provided (CSS token, never raw hex)
        let bandColor = '';
        if (options && typeof options.color === 'string' && options.color.trim() && !options.color.includes('#')) {
            bandColor = options.color.trim();
        } else {
            const activeTabEntry = this.getTab(this.activeTab);
            bandColor = activeTabEntry ? activeTabEntry.color : 'var(--color-accent)';
        }
        drawer.style.setProperty('--sidebar-drawer-color', bandColor);

        // Calculate size width
        let requestedSize = (options && options.size && typeof options.size === 'string')
            ? options.size.toUpperCase()
            : 'S';
        if (!['S', 'M', 'L', 'XL'].includes(requestedSize)) {
            requestedSize = 'S';
        }

        // XL behaves as L under 1600 px window width
        if (requestedSize === 'XL' && window.innerWidth < 1600) {
            requestedSize = 'L';
        }

        // Measure sidebar width dynamically from DOM, fallback to 260 if unavailable
        let baseWidth = 260;
        let sidebarRight = 260;
        if (sidebar) {
            const rect = sidebar.getBoundingClientRect();
            if (rect.width > 0) baseWidth = rect.width;
            if (rect.right > 0) sidebarRight = rect.right;
        }

        const sizeMultipliers = { S: 1, M: 2, L: 3, XL: 4 };
        const sizeOrder = ['S', 'M', 'L', 'XL'];

        // Available space right of the sidebar
        const availableSpace = Math.max(0, window.innerWidth - sidebarRight);

        // Fall back to next smaller size if width does not fit in available space
        let currentIdx = sizeOrder.indexOf(requestedSize);
        while (currentIdx > 0 && (sizeMultipliers[sizeOrder[currentIdx]] * baseWidth) > availableSpace) {
            currentIdx--;
        }

        const resolvedSize = sizeOrder[currentIdx];
        const finalWidth = sizeMultipliers[resolvedSize] * baseWidth;
        drawer.style.width = `${finalWidth}px`;
        drawer.dataset.size = resolvedSize;

        drawerTitle.textContent = title || 'Extension Panel';
        drawerBody.innerHTML = '';

        if (typeof content === 'string') {
            drawerBody.innerHTML = content;
        } else if (content instanceof HTMLElement) {
            drawerBody.appendChild(content);
        }

        drawer.classList.add('is-open');
        this.setDrawerState(true);
    },

    closeDrawer: function() {
        const drawer = document.getElementById('sidebar-drawer');
        if (drawer) {
            drawer.classList.remove('is-open');
        }
        this.setDrawerState(false);

        if (this._drawerOnClose) {
            const cb = this._drawerOnClose;
            this._drawerOnClose = null;
            try {
                cb();
            } catch (err) {
                console.error("Error executing drawer onClose callback:", err);
            }
        }
    },

    /**
     * Marks #sidebar-left while the drawer is open, so style.css can show the
     * drawer close button next to "Hide Menu".
     * @param {boolean} isOpen
     */
    setDrawerState: function(isOpen) {
        const sidebar = document.getElementById('sidebar-left');
        if (sidebar) sidebar.classList.toggle('sidebar-drawer-open', isOpen);
    }
};
