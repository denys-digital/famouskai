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
 * Famouskai Editor - Plugin Manager (Namespace Pattern)
 * 
 * ARCHITECTURAL NOTE: 
 * ES Modules (<script type="module">) are intentionally avoided in this project.
 * To strictly maintain the "Local-First" philosophy, the application must be fully 
 * functional by simply double-clicking 'index.html' (using the file:// protocol). 
 * Modern browsers block ES Module imports over file:// due to CORS policies.
 * Therefore, we use a single global namespace pattern to ensure zero-build, 
 * zero-server execution while keeping the global scope clean.
 */
window.FamousPluginCore = window.FamousPluginCore || {};

// Global Toast helper accessible to all tools
window.FamousPluginCore.showToast = function(msg, type) {
    if (typeof window.showToast === 'function') {
        window.showToast(msg, type);
    } else {
        const toast = document.getElementById('toast-msg');
        if (!toast) return;
        toast.textContent = msg;
        toast.classList.remove('toast-success', 'toast-warn', 'toast-error');
        if (type) toast.classList.add('toast-' + type);
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    }
};

window.FamousPluginCore.Manager = {
    registry: [],
    settingsState: {},

    /**
     * Loads persisted tool settings from LocalStorage
     */
    loadSettingsState: function() {
        try {
            const saved = localStorage.getItem('famouskai_tool_settings');
            this.settingsState = saved ? JSON.parse(saved) : {};
        } catch (err) {
            console.warn('[ToolManager] Failed to load tool settings:', err);
            this.settingsState = {};
        }
    },

    /**
     * Persists current tool settings to LocalStorage
     */
    saveSettingsState: function() {
        try {
            localStorage.setItem('famouskai_tool_settings', JSON.stringify(this.settingsState));
        } catch (err) {
            console.warn('[ToolManager] Failed to save tool settings:', err);
        }
    },

    /**
     * Retrieves settings key-value map for a given tool
     */
    getToolSettings: function(toolName) {
        return this.settingsState[toolName] || {};
    },

    /**
     * Updates a single setting value for a tool and persists it
     */
    setToolSetting: function(toolName, settingId, value) {
        if (!this.settingsState[toolName]) {
            this.settingsState[toolName] = {};
        }
        this.settingsState[toolName][settingId] = value;
        this.saveSettingsState();
    },

    register: function(tool) {
        if (tool.toolbar && tool.toolbar.letter) {
            tool.toolbar.letter = tool.toolbar.letter.charAt(0).toUpperCase();
        }

        // Initialize default settings values if defined by the tool
        if (tool.settings && Array.isArray(tool.settings)) {
            this.loadSettingsState();
            if (!this.settingsState[tool.name]) {
                this.settingsState[tool.name] = {};
            }
            tool.settings.forEach(setting => {
                if (this.settingsState[tool.name][setting.id] === undefined) {
                    this.settingsState[tool.name][setting.id] = setting.default !== undefined ? setting.default : false;
                }
            });
            this.saveSettingsState();
        }

        this.registry.push(tool);
    },

    /**
     * Central Event Dispatcher for Tool Lifecycle Triggers (e.g. onBeforeSave, onFileOpen)
     */
    emit: function(eventName, editorInstance, extraArgs = {}) {
        if (!editorInstance) return;

        const filename = extraArgs.filename || extraArgs.fileName || "";
        const ext = filename ? filename.split('.').pop().toLowerCase() : '';

        this.registry.forEach(tool => {
            if (tool.triggers && typeof tool.triggers[eventName] === 'function') {
                // A tool with an empty extensions list runs on every file; otherwise only its types.
                if (tool.extensions && tool.extensions.length > 0 && !tool.extensions.includes(ext)) {
                    return;
                }
                const toolSettings = this.getToolSettings(tool.name);
                try {
                    tool.triggers[eventName].call(tool, editorInstance, toolSettings, extraArgs);
                } catch (err) {
                    console.error(`[ToolTrigger] Error in ${tool.name} during ${eventName}:`, err);
                }
            }
        });
    },

    /**
     * Renders registered tool settings controls dynamically into the Settings panel
     */
    renderSettings: function(containerElement) {
        if (!containerElement) return;

        // Ensure settings state is up-to-date
        this.loadSettingsState();

        this.registry.forEach(tool => {
            if (tool.settings && Array.isArray(tool.settings) && tool.settings.length > 0) {
                tool.settings.forEach(setting => {
                    const settingKey = `tool_setting_${tool.name.replace(/\s+/g, '_')}_${setting.id}`;

                    // Prevent duplicate rendering
                    if (document.getElementById(settingKey)) return;

                    const label = document.createElement('label');
                    label.className = 'sidebar-label';
                    label.id = settingKey;
                    if (setting.tooltip) label.title = setting.tooltip;

                    const textSpan = document.createElement('span');
                    textSpan.textContent = setting.label;

                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.className = 'sidebar-checkbox';

                    const currentVal = this.settingsState[tool.name] && this.settingsState[tool.name][setting.id] !== undefined
                        ? this.settingsState[tool.name][setting.id]
                        : (setting.default !== undefined ? setting.default : false);

                    checkbox.checked = !!currentVal;

                    checkbox.addEventListener('change', (e) => {
                        this.setToolSetting(tool.name, setting.id, e.target.checked);
                    });

                    label.appendChild(textSpan);
                    label.appendChild(checkbox);
                    containerElement.appendChild(label);
                });
            }
        });
    },

    renderTools: function(editorInstance, filename = "") {
        const container = document.getElementById('tools-list');
        const section = document.getElementById('tools-section');
        
        const toolbarContainer = document.getElementById('toolbar-plugins');
        const toolbarRight = document.getElementById('toolbar-right');
        
        if (!container) return;
        
        container.innerHTML = ""; 
        if (toolbarContainer) {
            toolbarContainer.innerHTML = "";
        }
        
        let toolCount = 0; 
        let toolsInToolbarCount = 0;
        
        const ext = filename ? filename.split('.').pop().toLowerCase() : '';
        
        this.registry.forEach(tool => {
            if (tool.extensions && tool.extensions.length > 0) {
                if (!tool.extensions.includes(ext)) return; 
            }
            
            toolCount++; 
            
            const div = document.createElement('div');
            div.classList.add('tool-item');
            div.textContent = '› ' + tool.name;
            
            // Tooltip on hover for tools in the side menu
            const tooltipText = tool.description || tool.tooltip || tool.name;
            div.title = tooltipText;

            if (tool.toolbar && tool.toolbar.color) {
                div.style.setProperty('--tool-hover-bgcolor', tool.toolbar.color);
                div.style.setProperty('--tool-hover-color', 'var(--fm-dark)');
            }
            
            div.onclick = () => {
                const confirmMessage = typeof tool.confirmMsg === 'function'
                    ? tool.confirmMsg(editorInstance)
                    : tool.confirmMsg;

                if (!confirmMessage || confirm(confirmMessage)) {
                    tool.action(editorInstance);
                }
            };
            
            container.appendChild(div);
            
            if (tool.toolbar && toolbarContainer) {
                toolsInToolbarCount++;
                const btn = document.createElement('button');
                btn.className = 'toolbar-tool-btn';
                btn.textContent = tool.toolbar.letter;
                btn.title = tool.name;
                
                if (tool.toolbar.color) {
                    btn.style.setProperty('--tool-hover-bgcolor', tool.toolbar.color);
                }
                
                btn.onclick = () => {
                    const confirmMessage = typeof tool.confirmMsg === 'function'
                        ? tool.confirmMsg(editorInstance)
                        : tool.confirmMsg;

                    if (!confirmMessage || confirm(confirmMessage)) {
                        tool.action(editorInstance);
                    }
                };
                toolbarContainer.appendChild(btn);
            }
        });

        if (section) {
            section.style.display = (toolCount > 0) ? "block" : "none";
        }
        
        if (toolbarRight) {
            if (toolsInToolbarCount > 0) {
                toolbarRight.setAttribute('data-has-tools', 'true');
            } else {
                toolbarRight.removeAttribute('data-has-tools');
            }
        }
    }
};