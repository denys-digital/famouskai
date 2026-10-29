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

// Import IDB Keyval to allow the Service Worker to save shared files locally on Android
importScripts('/vendor/idb-keyval/umd.min.js');

const CACHE_NAME = 'famouskai-0.1.1'; // Always increment this when updating files  to force cache cleanup

const URLS_TO_CACHE = [
    '/',
    '/index.html',
    '/sw.js',
    '/style.css',
    '/syntax-themes.css',
    '/preview-themes.css',
    '/theme-famouskai.js',
    '/icon.svg',
    '/manifest.json',

    // Vendor: Ace Editor
    '/vendor/ace-builds/ace.js',
    '/vendor/ace-builds/ext-searchbox.js',
    '/vendor/ace-builds/mode-css.js',
    '/vendor/ace-builds/mode-csv.js',
    '/vendor/ace-builds/mode-diff.js',
    '/vendor/ace-builds/mode-html.js',
    '/vendor/ace-builds/mode-javascript.js',
    '/vendor/ace-builds/mode-json.js',
    '/vendor/ace-builds/mode-markdown.js',
    '/vendor/ace-builds/mode-svg.js',
    '/vendor/ace-builds/mode-text.js',
    '/vendor/ace-builds/mode-xml.js',
    '/vendor/ace-builds/mode-yaml.js',
    '/vendor/ace-builds/worker-css.js',
    '/vendor/ace-builds/worker-html.js',
    '/vendor/ace-builds/worker-javascript.js',
    '/vendor/ace-builds/worker-json.js',
    '/vendor/ace-builds/worker-xml.js',
    '/vendor/ace-builds/worker-yaml.js',

    // Vendor: Diff2Html
    '/vendor/diff2html/css/diff2html.min.css',
    '/vendor/diff2html/js/diff2html.min.js',

    // Vendor: DOMPurify
    '/vendor/dompurify/purify.min.js',

    // Vendor: Marked
    '/vendor/marked/marked.umd.min.js',

    // Vendor: idb-keyval
    '/vendor/idb-keyval/umd.min.js',

    // Vendor: js-beautify
    '/vendor/js-beautify/beautify.min.js',
    '/vendor/js-beautify/beautify-css.min.js',
    '/vendor/js-beautify/beautify-html.min.js',

    // Vendor: Oswald (Fontsource)
    '/vendor/fontsource-oswald/files/oswald-latin-500-normal.woff2',
    '/vendor/fontsource-oswald/files/oswald-latin-700-normal.woff2',
    '/vendor/fontsource-oswald/LICENSE',

    // Custom colorization
    '/plugins/ace-custom/mode-log.js',
    '/plugins/ace-custom/mode-csv.js',
    '/plugins/ace-custom/folding-yaml.js',

    // Core & Extensions
    '/plugins/tools.js',
    '/plugins/ext-sidebar.js',
    '/plugins/ext-famous-core.js',
    '/plugins/ext-outline.js',
    '/plugins/ext-snippets.js',
    '/plugins/ext-export-html.js',
    '/plugins/ext-preview-code.js',

    // Tools
    '/plugins/tool-beautify.js',
    '/plugins/tool-bold2h4.js',
    '/plugins/tool-cleanup.js',
    '/plugins/tool-cleanup-text.js',
    '/plugins/tool-extract-mk-table.js',
    '/plugins/tool-sort-lines.js',
    '/plugins/tool-remove-duplicates.js',
    '/plugins/tool-workspace.js',

    // Diffskai (Monaco is lazy-loaded, so not pre-cached here to save startup bandwidth)
    '/plugins/tool-diffskai.js',
    '/plugins/tool-diffskai.html'
];

// Installation with Cloudflare "Response Washing"
// ﹥ install
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(async (cache) => {
            console.log(CACHE_NAME + ' caching started...');

            // Execute all caching operations concurrently
            await Promise.all(URLS_TO_CACHE.map(async (url) => {
                const response = await fetch(url);

                if (!response.ok) {
                    // If ANY file fails, Promise.all rejects immediately.
                    // This aborts the SW installation and preserves the old cache.
                    throw new Error(`Critical asset failed to load: ${url}`);
                }

                // Wait for full download in RAM to avoid partial streams upon sudden app closure
                const bodyBlob = await response.blob();

                // Create a clean copy to bypass Cloudflare's "redirected: true" restriction
                const cleanResponse = new Response(bodyBlob, {
                    status: response.status,
                    statusText: response.statusText,
                    headers: response.headers
                });

                await cache.put(url, cleanResponse);
            }));

            // Non-blocking Monaco warm-up after mandatory assets succeed
            const monacoWarmupUrls = [
                '/vendor/monaco-editor/loader.js',
                '/vendor/monaco-editor/editor/editor.main.js',
                '/vendor/monaco-editor/editor/editor.main.css',
                '/vendor/monaco-editor/editor/editor.worker.js'
            ];

            await Promise.allSettled(monacoWarmupUrls.map(async (url) => {
                try {
                    const response = await fetch(url);
                    if (response.ok) {
                        const bodyBlob = await response.blob();
                        const cleanResponse = new Response(bodyBlob, {
                            status: response.status,
                            statusText: response.statusText,
                            headers: response.headers
                        });
                        await cache.put(url, cleanResponse);
                    } else {
                        console.warn(`Monaco warm-up failed for ${url}: status ${response.status}`);
                    }
                } catch (err) {
                    console.warn(`Monaco warm-up failed for ${url}:`, err);
                }
            }));
        })
    );
    // Force the waiting service worker to become the active service worker
    self.skipWaiting();
});

// Purge old caches to ensure the new version is loaded immediately
// ﹥ activate
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    // Take control of all clients immediately without requiring a page refresh
    self.clients.claim();
});

// Intercept fetch requests (Local-First Cache Strategy & Share Target)
// ﹥ fetch
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // 1. Handle Share Target API POST requests (Android sharing intent)
    if (url.pathname === '/share-target' && event.request.method === 'POST') {
        event.respondWith((async () => {
            try {
                const formData = await event.request.formData();
                const file = formData.get('file');
                const text = formData.get('text');

                // Store the received content in IndexedDB temporarily
                if (file) {
                    await idbKeyval.set('famouskai_shared_file', file);
                } else if (text) {
                    await idbKeyval.set('famouskai_shared_text', text);
                }

                // Redirect to the app with a flag in the URL
                return Response.redirect('/?shared=true', 303);
            } catch (err) {
                console.error("Share Target processing error:", err);
                return Response.redirect('/', 303); // Fallback redirection
            }
        })());
        return;
    }

    // 2. Standard Local-First caching behavior (Cache First strategy)
    event.respondWith((async () => {
        try {
            // Ignore search parameters to ensure cache matching works perfectly
            const cachedResponse = await caches.match(event.request, { ignoreSearch: true });
            if (cachedResponse) {
                return cachedResponse;
            }

            const networkResponse = await fetch(event.request);

            // Runtime caching for same-origin GET requests starting with /vendor/monaco-editor/
            const isSameOrigin = url.origin === self.location.origin;
            const isGetRequest = event.request.method === 'GET';
            const isMonacoAsset = url.pathname.startsWith('/vendor/monaco-editor/');

            if (isSameOrigin && isGetRequest && isMonacoAsset && networkResponse.ok) {
                const cache = await caches.open(CACHE_NAME);
                await cache.put(event.request, networkResponse.clone());
            }

            return networkResponse;
        } catch (err) {
            // Fall back to cached index.html for navigation requests
            if (event.request.mode === 'navigate') {
                const cachedIndex = await caches.match('/index.html', { ignoreSearch: true });
                if (cachedIndex) {
                    return cachedIndex;
                }
            }

            // Return clean 503 response when both cache and network fail
            return new Response('', { status: 503, statusText: 'Offline' });
        }
    })());
});
