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
 */

// Browser tests run by GitHub Actions (.github/workflows/browser-tests.yml).
// Nobody needs to run this file by hand: open tests/unit-*.html in a browser instead.
//
// 1. Every tests/unit-*.html page must end with a green summary, and so must
//    the test hub (tests/index.html), which runs them all in frames.
// 2. Go/No-Go smoke test of the app (automatic No-Go criteria of the 0.1.0 plan):
//    G1 the app starts without an uncaught error,
//    G2 the app reloads offline from the Service Worker cache,
//    G3 the Markdown preview does not run injected HTML,
//    G4 Diffskai opens and finishes loading,
//    G5 Diffskai collapses unchanged lines right after a load.
//
// Usage: node tests/ci-browser-tests.mjs http://localhost:8000
// Browser: the Chrome installed on the runner, or CHROME_PATH if set.

import { chromium } from 'playwright-core';
import { readdirSync, existsSync, appendFileSync } from 'node:fs';

const BASE = (process.argv[2] || 'http://localhost:8000').replace(/\/$/, '');
const results = [];
const record = (name, passed, detail = '') => {
    results.push({ name, passed, detail });
    console.log(`${passed ? 'PASS' : 'FAIL'}  ${name}${detail ? '  (' + detail + ')' : ''}`);
};

const browser = await chromium.launch(
    process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : { channel: 'chrome' }
);

async function check(name, fn) {
    try {
        // Hard limit so a hung page can never block the whole run.
        const detail = await Promise.race([
            fn(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('timed out after 90 s')), 90000))
        ]);
        record(name, true, detail || '');
    } catch (err) {
        record(name, false, String(err.message || err).split('\n')[0]);
    }
}

// 1. Unit pages
const testUnitPages = readdirSync(new URL('.', import.meta.url))
    .filter(f => /^unit-.*\.html$/.test(f))
    .map(f => `tests/${f}`);

let factoryUnitPages = [];
const factoryDir = new URL('../factory', import.meta.url);
if (existsSync(factoryDir)) {
    factoryUnitPages = readdirSync(factoryDir)
        .filter(f => /^unit-.*\.html$/.test(f))
        .map(f => `factory/${f}`);
}

const unitPages = [...testUnitPages, ...factoryUnitPages].sort();

for (const file of unitPages) {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await check(`unit: ${file}`, async () => {
        await page.goto(`${BASE}/${file}`);
        await page.waitForFunction(() => {
            const s = document.getElementById('summary');
            return s && s.textContent.trim() && s.textContent.trim() !== 'Running tests...';
        }, null, { timeout: 30000 });
        const s = await page.evaluate(() => {
            const el = document.getElementById('summary');
            return { text: el.textContent.trim(), cls: el.className };
        });
        if (!/\bpass(ed)?\b/.test(s.cls)) throw new Error(s.text);
        if (errors.length) throw new Error('uncaught error: ' + errors[0]);
        return s.text;
    });
    await ctx.close();
}

// The test hub (tests/index.html) runs the same pages in frames: it must work too.
{
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    const hubViolations = [];
    page.on('console', msg => {
        const text = msg.text();
        if (/securitypolicyviolation/i.test(text) || (/content[ -]security[ -]policy/i.test(text) && (/violat/i.test(text) || /refused/i.test(text) || /blocked/i.test(text)))) {
            hubViolations.push(text);
        }
    });
    try {
        await page.addInitScript(() => {
            window.addEventListener('securitypolicyviolation', e => {
                console.warn(`securitypolicyviolation: ${e.violatedDirective} blocked ${e.blockedURI}`);
            });
        });
    } catch (_) {}
    await check('hub: tests/index.html', async () => {
        await page.goto(`${BASE}/tests/`);
        await page.waitForFunction(
            () => document.getElementById('summary').textContent.trim() !== 'Running tests...',
            null, { timeout: 80000 }
        );
        const s = await page.evaluate(() => {
            const el = document.getElementById('summary');
            return { text: el.textContent.trim(), cls: el.className };
        });
        if (!/\bpass\b/.test(s.cls)) throw new Error(s.text);
        if (hubViolations.length) throw new Error('CSP violation in hub: ' + hubViolations[0]);
        return s.text;
    });
    await ctx.close();
}

// 2. Go/No-Go smoke test
const ctx = await browser.newContext();
// Production enforces the CSP with the _headers file (Cloudflare). The meta tag in
// index.html and tool-diffskai.html holds the same policy as report-only (browsers
// ignore report-only in a meta tag; it keeps eval() usable for the unit pages, which
// load index.html in an iframe). Here each HTML page is served with that policy as
// an ENFORCED header, as in production, so a violation breaks G1-G4.
// Pages served later by the Service Worker bypass this route (Playwright limit).
const CSP_META = /<meta http-equiv="Content-Security-Policy-Report-Only" content="([^"]+)"/;
await ctx.route(url => url.origin === new URL(BASE).origin, async (route) => {
    if (route.request().resourceType() !== 'document') return route.continue();
    const resp = await route.fetch();
    const body = await resp.text();
    const m = body.match(CSP_META);
    const headers = Object.assign({}, resp.headers());
    if (m) headers['content-security-policy'] = m[1];
    return route.fulfill({ response: resp, body, headers });
});
const page = await ctx.newPage();
const appErrors = [];
const cspViolations = [];
const watch = async (p) => {
    p.on('pageerror', e => appErrors.push(`${p.url().split('/').pop()}: ${e.message}`));
    p.on('console', msg => {
        const text = msg.text();
        if (/securitypolicyviolation/i.test(text) || (/content[ -]security[ -]policy/i.test(text) && (/violat/i.test(text) || /refused/i.test(text) || /blocked/i.test(text)))) {
            cspViolations.push(`${p.url().split('/').pop() || 'page'}: ${text}`);
        }
    });
    try {
        await p.addInitScript(() => {
            window.addEventListener('securitypolicyviolation', e => {
                console.warn(`securitypolicyviolation: ${e.violatedDirective} blocked ${e.blockedURI}`);
            });
        });
    } catch (_) {}
};
await watch(page);
ctx.on('page', watch);
const appReady = () => page.waitForFunction(
    () => typeof editor !== 'undefined' && editor && window.FamousPluginCore && window.FamousPluginCore.Manager,
    null, { timeout: 30000 }
);

await check('G1 app starts without an uncaught error', async () => {
    await page.goto(`${BASE}/index.html`);
    await appReady();
    await page.waitForTimeout(1000);
    if (appErrors.length) throw new Error(appErrors.join(' | '));
    if (cspViolations.length) throw new Error('CSP violation in G1: ' + cspViolations.join(' | '));
});

await check('G2 app reloads offline from the Service Worker cache', async () => {
    const beforeCSP = cspViolations.length;
    const active = await page.evaluate(() => Promise.race([
        navigator.serviceWorker.ready.then(reg => !!reg.active),
        new Promise(r => setTimeout(() => r(false), 30000))
    ]));
    if (!active) throw new Error('the Service Worker did not install (a cached file may be missing)');
    // Wait until install has stored the whole cache list.
    await page.waitForFunction(async () => {
        const names = await caches.keys();
        if (!names.length) return false;
        const cache = await caches.open(names[names.length - 1]);
        return (await cache.keys()).length > 20;
    }, null, { timeout: 60000, polling: 500 });
    await page.reload();
    await appReady();
    await page.waitForFunction(() => !!navigator.serviceWorker.controller, null, { timeout: 15000 });
    await ctx.setOffline(true);
    try {
        await page.reload();
        await appReady();
    } finally {
        await ctx.setOffline(false);
    }
    const n = await page.evaluate(async () => {
        const names = await caches.keys();
        return `${names.join(',')}: ${(await (await caches.open(names[names.length - 1])).keys()).length} files`;
    });
    if (cspViolations.length > beforeCSP) throw new Error('CSP violation in G2: ' + cspViolations.slice(beforeCSP).join(' | '));
    return n;
});

await check('G3 Markdown preview does not run injected HTML', async () => {
    const beforeCSP = cspViolations.length;
    const out = await page.evaluate(async () => {
        window.__xss = 0;
        currentFileName = 'injection-test.md';
        editor.setValue('# Title\n\n<img src="x" onerror="window.__xss=1">\n\n<script>window.__xss=2</script>\n\n<a href="javascript:window.__xss=3">link</a>\n', -1);
        if (!isPreviewOpen) togglePreview();
        updatePreviewContent();
        await new Promise(r => setTimeout(r, 800));
        const el = document.getElementById('preview-render');
        el.querySelectorAll('a').forEach(a => a.click());
        await new Promise(r => setTimeout(r, 200));
        return {
            xss: window.__xss,
            html: el.innerHTML,
            heading: !!el.querySelector('h1')
        };
    });
    if (!out.heading) throw new Error('preview did not render');
    if (out.xss) throw new Error('injected code ran (' + out.xss + ')');
    if (/<script|onerror=|javascript:/i.test(out.html)) throw new Error('unsafe markup kept in the preview');
    if (cspViolations.length > beforeCSP) throw new Error('CSP violation in G3: ' + cspViolations.slice(beforeCSP).join(' | '));
});

let diffskaiPage = null;
await check('G4 Diffskai opens and finishes loading', async () => {
    const before = appErrors.length;
    const beforeCSP = cspViolations.length;
    const [p] = await Promise.all([
        ctx.waitForEvent('page', { timeout: 15000 }),
        page.evaluate(() => {
            const tool = window.FamousPluginCore.Manager.registry.find(t => /diffskai/i.test(t.name));
            if (!tool) throw new Error('Diffskai tool not registered');
            tool.action(editor);
        })
    ]);
    await p.waitForFunction(
        () => window.monaco && !document.getElementById('loader') && !document.getElementById('btn-open-right').disabled,
        null, { timeout: 30000 }
    );
    await p.waitForTimeout(500);
    if (appErrors.length > before) throw new Error(appErrors.slice(before).join(' | '));
    if (cspViolations.length > beforeCSP) throw new Error('CSP violation in G4: ' + cspViolations.slice(beforeCSP).join(' | '));
    diffskaiPage = p;
});

// "Collapse unchanged" is checked by default: a long identical block must be hidden
// right after the texts load, without touching the checkbox (private issue 306).
await check('G5 Diffskai collapses unchanged lines after a load', async () => {
    const p = diffskaiPage;
    if (!p) throw new Error('Diffskai page not open (G4 failed)');
    await p.evaluate(() => {
        const same = Array.from({ length: 200 }, (_, i) => 'same line ' + i).join('\n');
        loadSideText(originalModel, 'left\n' + same + '\nend left');
        loadSideText(modifiedModel, 'right\n' + same + '\nend right');
    });
    await p.waitForFunction(() => document.querySelectorAll('.diff-hidden-lines').length > 0, null, { timeout: 10000 });
    await p.close();
});

await browser.close();

// Report
const failed = results.filter(r => !r.passed);
const summary = [
    `### Browser tests: ${results.length - failed.length}/${results.length} passed`,
    '',
    '| Result | Test | Detail |',
    '|---|---|---|',
    ...results.map(r => `| ${r.passed ? 'PASS' : '**FAIL**'} | ${r.name} | ${r.detail.replace(/\|/g, '\\|')} |`),
    ''
].join('\n');
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
