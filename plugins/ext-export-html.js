/*
 * Famouskai Editor - Standalone HTML Export Core Extension
 * Copyright (C) 2026 Denys Poulat (https://github.com/denys-digital)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */

window.FamousPluginCore = window.FamousPluginCore || {};

window.FamousPluginCore.ExportHTML = {
    /**
     * Generates a timestamped filename for markdown export.
     * Format: <baseName>_YYYY-MM-DD--HH-mm.html
     */
    getExportFileName: function(currentFileName) {
        let baseName = "document";
        if (currentFileName && currentFileName !== "[New]") {
            baseName = currentFileName.replace(/\.[^/.]+$/, "");
        }

        const now = new Date();
        const YYYY = now.getFullYear();
        const MM = String(now.getMonth() + 1).padStart(2, '0');
        const DD = String(now.getDate()).padStart(2, '0');
        const HH = String(now.getHours()).padStart(2, '0');
        const mm = String(now.getMinutes()).padStart(2, '0');

        const timestamp = `${YYYY}-${MM}-${DD}--${HH}-${mm}`;
        return `${baseName}_${timestamp}.html`;
    },

    /**
     * Filters preview-themes.css to keep strictly .markdown-body styles,
     * stripping out @media print and diff2html rules.
     */
    filterMarkdownBodyCSS: function(cssText) {
        if (!cssText) return "";

        let cleaned = cssText;

        // Safely strip @media print block including nested braces (e.g. @page)
        const mediaPrintIndex = cleaned.search(/@media\s+print/i);
        if (mediaPrintIndex !== -1) {
            const braceStart = cleaned.indexOf('{', mediaPrintIndex);
            if (braceStart !== -1) {
                let depth = 1;
                let i = braceStart + 1;
                while (i < cleaned.length && depth > 0) {
                    if (cleaned[i] === '{') depth++;
                    else if (cleaned[i] === '}') depth--;
                    i++;
                }
                cleaned = cleaned.substring(0, mediaPrintIndex) + cleaned.substring(i);
            }
        }

        // Remove Diff2Html section and variables
        cleaned = cleaned.replace(/\/\*\s*﹥\s*DIFF2HTML[\s\S]*$/i, "");
        cleaned = cleaned.replace(/:root\s*\{[\s\S]*?--d2h-[\s\S]*?\}/g, "");
        cleaned = cleaned.replace(/\.d2h-body[\s\S]*$/gi, "");

        return cleaned.trim();
    },

    /**
     * Dynamically loads preview-themes.css to adhere strictly to SSOT (Single Source of Truth).
     */
    getPreviewCSS: async function() {
        let rawCSS = "";

        // Attempt 1: Fetch preview-themes.css from the local app directory
        try {
            const response = await fetch('preview-themes.css');
            if (response.ok) {
                rawCSS = await response.text();
            }
        } catch (err) {
            console.warn("Fetch preview-themes.css failed, attempting DOM stylesheet inspection:", err);
        }

        // Attempt 2: Extract CSS rules from document.styleSheets if fetch failed
        if (!rawCSS && typeof document !== "undefined" && document.styleSheets) {
            try {
                for (const sheet of document.styleSheets) {
                    if (sheet.href && sheet.href.includes("preview-themes.css")) {
                        const rules = sheet.cssRules || sheet.rules;
                        if (rules) {
                            for (const rule of rules) {
                                rawCSS += rule.cssText + "\n";
                            }
                        }
                    }
                }
            } catch (err) {
                console.warn("DOM styleSheets extraction failed:", err);
            }
        }

        return this.embedFonts(this.filterMarkdownBodyCSS(rawCSS));
    },

    /**
     * Inlines the woff2 fonts referenced by url(...) as base64 data URLs, so an
     * exported file keeps the Oswald headings without any network access.
     * A font that cannot be read keeps its original url() and falls back to
     * the browser's sans-serif font.
     */
    embedFonts: async function(cssText) {
        if (!cssText) return "";

        const fontUrlRegex = /url\((['"]?)([^'")]+\.woff2)\1\)/g;
        const paths = [...new Set([...cssText.matchAll(fontUrlRegex)].map(m => m[2]))];
        const dataUrls = {};

        for (const path of paths) {
            if (path.startsWith('data:')) continue;
            try {
                const response = await fetch(path);
                if (!response.ok) throw new Error("HTTP " + response.status);
                const bytes = new Uint8Array(await response.arrayBuffer());
                let binary = "";
                for (let i = 0; i < bytes.length; i += 0x8000) {
                    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
                }
                dataUrls[path] = "data:font/woff2;base64," + btoa(binary);
            } catch (err) {
                console.warn("Font embedding failed for " + path + ", keeping the original url():", err);
            }
        }

        return cssText.replace(fontUrlRegex, (whole, quote, path) =>
            dataUrls[path] ? "url('" + dataUrls[path] + "')" : whole
        );
    },

    /**
     * Id of the theme checkbox in the exported file. Checked = dark theme.
     * preview-themes.css ("HTML EXPORT" section) uses the same id.
     */
    DARK_SWITCH_ID: "fmk-export-dark",

    /**
     * Body text sizes the exported file offers, in px; the first one is the
     * default. Same list as PREVIEW_TEXT_SIZES (core-settings.js). Each size
     * is a radio "fmk-export-text-<size>"; preview-themes.css reads them.
     */
    TEXT_SIZES: [15, 18, 23],

    /**
     * The text size the app preview shows right now (data-text-size on
     * #preview-render, set by the text size button), or the default.
     */
    getPreviewTextSize: function() {
        const fallback = this.TEXT_SIZES[0];
        if (typeof document === "undefined") return fallback;
        const previewEl = document.getElementById("preview-render");
        const size = previewEl ? Number(previewEl.getAttribute("data-text-size")) : NaN;
        return this.TEXT_SIZES.includes(size) ? size : fallback;
    },

    /**
     * The text size switch of the exported file: one radio per size, the
     * given one checked. It works without a script (preview-themes.css).
     */
    buildTextSizeSwitch: function(textSize) {
        const current = this.TEXT_SIZES.includes(textSize) ? textSize : this.TEXT_SIZES[0];
        const radios = this.TEXT_SIZES.map(size => {
            const checked = size === current ? " checked" : "";
            return `<label><input type="radio" name="fmk-export-text" id="fmk-export-text-${size}"${checked}> ${size}</label>`;
        }).join(" ");
        return `<span class="fmk-export-text-switch" role="radiogroup" aria-label="Text size in px">Text ${radios}</span>`;
    },

    /**
     * True when the app preview shows the dark theme right now: the class on
     * #preview-render is what the user sees (theme button, saved setting,
     * ?preview= link, Mobkai default).
     */
    isPreviewDark: function() {
        if (typeof document === "undefined") return false;
        const previewEl = document.getElementById("preview-render");
        return !!(previewEl && previewEl.classList.contains("preview-dark"));
    },

    /**
     * The exported file has no script, so its theme follows a checkbox:
     * every ".markdown-body.preview-dark" rule becomes
     * "body:has(#fmk-export-dark:checked) .markdown-body".
     */
    rewriteDarkSelectors: function(cssText) {
        if (!cssText) return "";
        return cssText.replace(/\.markdown-body\.preview-dark(?![\w-])/g,
            "body:has(#" + this.DARK_SWITCH_ID + ":checked) .markdown-body");
    },

    /**
     * The dark preview colors are app CSS variables (style.css :root), which
     * do not exist in the exported file. Resolves each variable the CSS uses
     * on sourceEl (default: the app root) and returns a ":root { ... }" block.
     * A variable with no value is left out.
     */
    buildThemeVariablesCSS: function(cssText, sourceEl) {
        if (!cssText || typeof getComputedStyle !== "function") return "";
        const el = sourceEl || (typeof document !== "undefined" ? document.documentElement : null);
        if (!el) return "";

        const names = [...new Set([...cssText.matchAll(/var\(\s*(--[\w-]+)/g)].map(m => m[1]))];
        const computed = getComputedStyle(el);
        const lines = [];
        for (const name of names) {
            const value = computed.getPropertyValue(name).trim();
            if (value) lines.push("    " + name + ": " + value + ";");
        }
        return lines.length ? ":root {\n" + lines.join("\n") + "\n}" : "";
    },

    /**
     * The CSS of an exported file: theme variables first, then the preview
     * CSS with its dark rules bound to the theme checkbox.
     */
    buildExportCSS: function(previewCSS, sourceEl) {
        const css = this.rewriteDarkSelectors(previewCSS);
        const vars = this.buildThemeVariablesCSS(css, sourceEl);
        return vars ? vars + "\n\n" + css : css;
    },

    /**
     * Generates a complete standalone HTML document string using strictly preview-themes.css.
     * isDark: the theme checkbox starts checked (dark theme).
     * textSize: the text size radio that starts checked (default: the first size).
     */
    buildStandaloneHTML: function(title, bodyHTML, previewCSS, lang, isDark, textSize) {
        const docLang = lang || (typeof document !== "undefined" && document.documentElement && document.documentElement.lang) || "en";
        const checked = isDark ? " checked" : "";

        return `<!DOCTYPE html>
<html lang="${docLang}">
<head>
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data: https:; style-src 'unsafe-inline'; font-src data:">
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        /* SSOT INJECTED CSS FROM preview-themes.css */
        ${previewCSS}
    </style>
</head>
<body class="fmk-export-page">
    <div class="fmk-export-controls">
        ${this.buildTextSizeSwitch(textSize)}
        <label class="fmk-export-theme-switch"><input type="checkbox" id="${this.DARK_SWITCH_ID}"${checked}> Dark theme</label>
    </div>
    <div class="markdown-body">
        ${bodyHTML}
    </div>
</body>
</html>`;
    },

    /**
     * Main action method to export active Markdown document as standalone HTML.
     */
    exportMarkdownToHTML: async function(editorInstance) {
        if (!editorInstance) return;

        const markdownText = editorInstance.getValue();
        if (!markdownText.trim()) {
            if (window.showToast) window.showToast("Cannot export empty document", "warn");
            return;
        }

        let bodyHTML = "";
        if (typeof marked !== "undefined" && typeof marked.parse === "function") {
            if (typeof DOMPurify !== 'undefined') {
                bodyHTML = DOMPurify.sanitize(marked.parse(typeof magicDotToMarkdownList === "function" ? magicDotToMarkdownList(markdownText) : markdownText));
            } else {
                console.warn("DOMPurify is undefined, falling back to preview content for HTML export");
                const previewEl = document.getElementById("preview-render");
                bodyHTML = previewEl ? previewEl.innerHTML : markdownText;
            }
            if (window.FamousPluginCore && window.FamousPluginCore.FamousUp) {
                const tempDiv = document.createElement("div");
                tempDiv.innerHTML = bodyHTML;
                window.FamousPluginCore.FamousUp.process(tempDiv);
                bodyHTML = tempDiv.innerHTML;
            }
            if (window.FamousPluginCore && window.FamousPluginCore.PreviewCode) {
                const codeDiv = document.createElement("div");
                codeDiv.innerHTML = bodyHTML;
                window.FamousPluginCore.PreviewCode.process(codeDiv);
                bodyHTML = codeDiv.innerHTML;
            }
        } else {
            const previewEl = document.getElementById("preview-render");
            bodyHTML = previewEl ? previewEl.innerHTML : markdownText;
        }

        const isDark = this.isPreviewDark();
        const textSize = this.getPreviewTextSize();
        const previewCSS = this.buildExportCSS(await this.getPreviewCSS());
        const activeName = (typeof currentFileName !== "undefined") ? currentFileName : "";
        const fileName = this.getExportFileName(activeName);
        const title = activeName ? activeName.replace(/\.[^/.]+$/, "") : "Export Markdown";
        const docLang = (typeof document !== "undefined" && document.documentElement && document.documentElement.lang) ? document.documentElement.lang : "en";
        const fullHTML = this.buildStandaloneHTML(title, bodyHTML, previewCSS, docLang, isDark, textSize);

        let saved = false;
        if ('showSaveFilePicker' in window) {
            try {
                const handle = await window.showSaveFilePicker({
                    suggestedName: fileName,
                    types: [{
                        description: 'HTML Document',
                        accept: { 'text/html': ['.html'] }
                    }]
                });
                const writable = await handle.createWritable();
                await writable.write(fullHTML);
                await writable.close();
                saved = true;
            } catch (err) {
                if (err.name === 'AbortError') return; // User cancelled save dialog
                console.warn("showSaveFilePicker failed, falling back to download link:", err);
            }
        }

        if (!saved) {
            try {
                const blob = new Blob([fullHTML], { type: 'text/html;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                setTimeout(() => URL.revokeObjectURL(url), 1000);
                saved = true;
            } catch (err) {
                console.error("Export HTML error:", err);
                alert("Export error: " + err.message);
                return;
            }
        }

        if (saved) {
            // Automatically open exported HTML in new tab for preview
            try {
                const previewBlob = new Blob([fullHTML], { type: 'text/html;charset=utf-8' });
                const previewUrl = URL.createObjectURL(previewBlob);
                const newWin = window.open(previewUrl, '_blank');
                if (newWin) {
                    let revoked = false;
                    const revoke = () => {
                        if (!revoked) {
                            revoked = true;
                            URL.revokeObjectURL(previewUrl);
                        }
                    };
                    try {
                        newWin.addEventListener('load', revoke, { once: true });
                    } catch (_) {}
                    setTimeout(revoke, 5000);
                } else {
                    URL.revokeObjectURL(previewUrl);
                }
            } catch (err) {
                console.warn("Auto-opening preview tab was blocked:", err);
            }

            if (window.showToast) {
                window.showToast("HTML exported successfully!", "success");
            }
        }
    }
};
