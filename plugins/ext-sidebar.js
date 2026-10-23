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
     * The 4 fixed tabs of 0.1.0. `color` is a CSS token of style.css (Layer 1): it fills
     * the tab button on hover and when selected, and draws the line on top of the open
     * panel, so each tab has its own recognizable color.
     */
    TABS: [
        { id: 'explorer', color: 'var(--color-tab-explorer)' },
        { id: 'outline', color: 'var(--color-tab-outline)' },
        { id: 'tools', color: 'var(--color-tab-tools)' },
        { id: 'settings', color: 'var(--color-tab-settings)' }
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

    init: function() {
        this.applyTabColors();
        this.bindToolbarTabs();
        this.bindHideButtons();
        this.initSideDrawer();

        // Restore persisted active tab state or default to 'explorer'
        const savedTab = localStorage.getItem('famouskai_active_sidebar_tab');
        if (savedTab && this.getTab(savedTab)) {
            this.activeTab = savedTab;
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
        const tabBtns = document.querySelectorAll('.sidebar-tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const targetTab = btn.dataset.tab;
                if (!targetTab) return;

                if (this.isOpen && this.activeTab === targetTab) {
                    this.closeSidebar();
                } else {
                    this.switchTab(targetTab, true);
                }
            });
        });
    },

    bindHideButtons: function() {
        const hideBtn = document.getElementById('btn-hide-sidebar');
        if (hideBtn) {
            hideBtn.addEventListener('click', () => {
                this.closeSidebar();
            });
        }
    },

    switchTab: function(tabId, openIfClosed = true) {
        if (!this.getTab(tabId)) return;

        this.activeTab = tabId;
        localStorage.setItem('famouskai_active_sidebar_tab', tabId);

        if (openIfClosed && !this.isOpen) {
            this.openSidebar();
        } else {
            this.updatePanelsDisplay();
            this.updateTabUI();
        }

        // Trigger Outline refresh if switching to Outline
        if (tabId === 'outline' && window.FamousPluginCore && window.FamousPluginCore.Outline) {
            if (typeof editor !== 'undefined' && editor) {
                window.FamousPluginCore.Outline.update(editor);
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

        if (typeof editor !== 'undefined' && editor) {
            setTimeout(() => editor.resize(), 50);
        }
    },

    closeSidebar: function() {
        const sidebar = document.getElementById('sidebar-left');
        if (!sidebar) return;

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
                panel.style.display = (panel.id === 'panel-tools' || panel.id === 'panel-explorer') ? 'flex' : 'block';
            } else {
                panel.style.display = 'none';
            }
        });
    },

    updateTabUI: function() {
        const tabBtns = document.querySelectorAll('.sidebar-tab-btn');
        tabBtns.forEach(btn => {
            const isActive = this.isOpen && btn.dataset.tab === this.activeTab;
            if (isActive) {
                btn.classList.add('is-active');
                btn.setAttribute('aria-selected', 'true');
            } else {
                btn.classList.remove('is-active');
                btn.setAttribute('aria-selected', 'false');
            }
        });

        // The open panel takes the color of its tab (line on top of the sidebar)
        const sidebar = document.getElementById('sidebar-left');
        const activeTab = this.getTab(this.activeTab);
        if (sidebar && activeTab) {
            sidebar.style.setProperty('--sidebar-active-color', activeTab.color);
        }
    },

    initSideDrawer: function() {
        // Two ways to close the drawer: the chevrons in its header, and the chevrons
        // next to "Hide Menu" (visible only while the drawer is open).
        ['sidebar-drawer-close', 'btn-hide-drawer'].forEach(id => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('click', () => {
                    this.closeDrawer();
                });
            }
        });
    },

    openDrawer: function(title, content) {
        const drawer = document.getElementById('sidebar-drawer');
        const drawerTitle = document.getElementById('sidebar-drawer-title');
        const drawerBody = document.getElementById('sidebar-drawer-body');

        if (!drawer || !drawerTitle || !drawerBody) return;

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
