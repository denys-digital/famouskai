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
 * Famouskai Editor - Demo Sidebar Tab Extension
 */
(function() {
    let isDemoEnabled = false;
    try {
        isDemoEnabled = (localStorage.getItem('famouskai_dev_demo_tab') === '1');
    } catch (e) {
        isDemoEnabled = false;
    }

    if (!isDemoEnabled) return;
    if (!window.FamousPluginCore || !window.FamousPluginCore.Sidebar) return;

    window.FamousPluginCore.Sidebar.registerTab({
        id: 'demo',
        title: 'Demo extension',
        icon: 'D',
        color: 'var(--color-tab-tools)',
        render: function(panelEl) {
            const header = document.createElement('div');
            header.className = 'sidebar-header';

            const title = document.createElement('div');
            title.className = 'sidebar-title';
            title.textContent = 'DEMO EXTENSION';
            header.appendChild(title);

            const desc = document.createElement('p');
            desc.style.padding = '8px 12px';
            desc.style.fontSize = '12px';
            desc.style.lineHeight = '1.4';
            desc.style.color = 'var(--color-text-secondary)';
            desc.textContent = 'This is a demo extension tab showcasing the dynamic sidebar tab registry and side drawer overlay.';

            const actions = document.createElement('div');
            actions.className = 'sidebar-actions';
            actions.style.padding = '0 12px';

            const btn = document.createElement('button');
            btn.id = 'btn-open-demo-drawer';
            btn.className = 'fold-btn';
            btn.style.width = '100%';
            btn.style.padding = '6px 10px';
            btn.textContent = 'Open Demo Drawer';

            btn.addEventListener('click', function() {
                const drawerContent = document.createElement('div');
                drawerContent.style.padding = '12px';

                const drawerDesc = document.createElement('p');
                drawerDesc.style.fontSize = '12px';
                drawerDesc.style.lineHeight = '1.4';
                drawerDesc.style.color = 'var(--color-text-primary)';
                drawerDesc.textContent = 'This drawer was opened from the Demo tab in size M (2x sidebar width).';

                drawerContent.appendChild(drawerDesc);

                window.FamousPluginCore.Sidebar.openDrawer('Demo drawer', drawerContent, { size: 'M' });
            });

            actions.appendChild(btn);

            panelEl.appendChild(header);
            panelEl.appendChild(desc);
            panelEl.appendChild(actions);
        },
        onShow: function(panelEl) {
            // Lifecycle hook when demo tab becomes visible
        },
        onHide: function(panelEl) {
            // Lifecycle hook when switching away or closing sidebar
        }
    });
})();
