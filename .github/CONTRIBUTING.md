# Contributing to Famouskai

Thanks for considering a contribution to Famouskai! This document covers what you need to know
before opening an issue or a pull request.

## Before you start

- **License:** Famouskai is dual-licensed (the GNU Affero General Public License, version 3 —
  AGPLv3 — plus commercial, see
  [`LICENSE`](https://github.com/denys-digital/famouskai/blob/main/LICENSE) and
  [`COMMERCIAL-LICENSE.md`](https://github.com/denys-digital/famouskai/blob/main/docs/COMMERCIAL-LICENSE.md)).
  Your first pull request will trigger a bot asking you to sign our lightweight
  [Contributor License Agreement (CLA)](https://github.com/denys-digital/famouskai/blob/main/docs/CLA.md).
  This is a one-time step; read it, it's short.
- **Code of Conduct:** all interactions in this project are governed by our
  [Code of Conduct](https://github.com/denys-digital/famouskai/blob/main/.github/CODE_OF_CONDUCT.md).

## Ways to contribute

- **Bug reports** — open an
  [Issue](https://github.com/denys-digital/famouskai/issues/new/choose) using the bug report template.
- **Feature requests / ideas** — open an Issue using the feature request template, or start a
  [Discussion](https://github.com/denys-digital/famouskai/discussions) if it's more exploratory.
- **Code** — pick an issue labeled
  [`good first issue`](https://github.com/denys-digital/famouskai/labels/good%20first%20issue) or
  [`help wanted`](https://github.com/denys-digital/famouskai/labels/help%20wanted), or propose your
  own via an Issue first (see below).
- **Documentation** — typos, clarity fixes, translations: Pull Requests (PRs) welcome, no prior
  issue needed.

## Development workflow

No prior GitHub experience? Read
[`docs/00-START-HERE-HOW-TO.md`](https://github.com/denys-digital/famouskai/blob/main/docs/00-START-HERE-HOW-TO.md)
first — it covers two paths: a 100% browser-based workflow (no install, works on a Chromebook)
and a local Git command-line (CLI) workflow. The steps below are the general shape either path
follows.

1. **Fork** the repository (both paths: via the **Fork** button on GitHub.com).
2. **Branch** from `main` using a short, descriptive name (`feat/..` for a new feature,
   `fix/..` for a bug fix, `docs/..` for a documentation-only change):
   - `feat/split-view-toggle`
   - `fix/diffskai-merge-crash`
   - `docs/update-readme-fr`
3. **Edit and test locally** — Famouskai has no build step. Open `index.html` directly in a
   browser to test your change. See
   [`docs/00-START-HERE-HOW-TO.md`](https://github.com/denys-digital/famouskai/blob/main/docs/00-START-HERE-HOW-TO.md)
   for the full step-by-step setup on either path.
4. **Commit** using clear, present-tense messages (for example,
   `Add markdown live-preview toggle`, not `added stuff`). Group related changes into a single
   commit where reasonable.
5. **Open a Pull Request** against `main`. Fill in the PR template — it's short, but the
   checklist matters (see below).
6. **Sign the CLA** if the bot asks (first-time contributors only).
7. **Respond to review.** For non-trivial changes, expect at least one round of feedback before
   merge — this isn't a formality; it's how we keep the codebase coherent as a small team.

## Before opening a Pull Request for a non-trivial change

Open an Issue first to discuss the approach, **unless** it's a small fix (typo, small bug, minor
doc update). This avoids wasted work on features that don't fit the product direction — Famouskai
has a specific "local-first, no backend" philosophy, and not every idea fits that constraint.

## Pull Request expectations

- One PR = one logical change. Don't bundle an unrelated refactor with a feature.
- Keep the diff focused — if you spot an unrelated bug while working, open a separate issue/PR
  for it rather than fixing it inline.
- If your change affects the user interface (UI), include a screenshot or short animated image
  (GIF) in the PR description.
- If your change affects Diffskai's conflict-resolution logic, describe the scenario you tested
  (what conflict, what the expected outcome was).

## Coding Standards

### In General

#### 1. Comments are written in English

All comments (HTML, JS, CSS, MD) are written in
English, regardless of the contributor's native language, so the
files read consistently for the whole open-source community.

### CSS Style Guide

No linter or formatter enforces these rules — they exist so every
contributor writes CSS the same way by hand, from the very first commit.
Please read this section before opening a pull request that touches `style.css`.

#### 1. One declaration per line, except for single-property rules

If a ruleset has **two or more declarations**, each one goes on its own
indented line, with the opening brace on the selector's line and the
closing brace alone on its own line:
```css
    .workspace-file-item {
        cursor: pointer;
        padding: 4px 6px;
        color: var(--color-text-primary);
    }
```

If a ruleset has **exactly one declaration**, it may stay on a single
line. This is the only accepted exception, typically used for grouped
one-liners such as color/icon variants:
```css
    #toast-msg.show { bottom: 20px; }
    .sidebar-header .sidebar-title { margin-bottom: 0; }
    .workspace-folder > summary::-webkit-details-marker { display: none; }
```

**Why:** a one-property-per-line diff shows exactly which property changed
in a pull request. A dense single-line rule makes every edit look like
the whole line changed, which makes code review harder and increases
merge-conflict noise.

#### 2. Never hardcode a color value in a rule

Every `color`, `background`, `border-color`, `box-shadow` color, etc.
must reference a token from the `:root` block at the top of the file
(`﹥ 0. DESIGN TOKENS`). If the token you need doesn't exist yet, add it
to that block first — do not inline a hex value anywhere else in the
file *(and in any other files)*.
```css
    :root {
        --color-text-primary:   #e8eaed;
    }
    ...
    .workspace-file-item {
        padding: 4px 6px;
        ...
        color: var(--color-text-primary);
    }
```

#### 3. Name tokens by usage, not by hue

Tokens describe **what the color is used for**, never what it looks
like. `--color-toc-markdown` is correct; `--color-blue` or
`--color-syntax-pink` is not. This lets you reason about "how Markdown
is represented in the outline" as a single line to edit, instead of
hunting for "the pink one" across the file.

#### 4. Section banners stay in place

The numbered `/* ﹥ N. SECTION NAME */` banners define the file's table
of contents. New rules belong inside the most relevant existing
section; only add a new numbered section for a genuinely new feature
area.

#### 5. Strict Namespacing for Plugins and Extensions

All CSS related to new tools or extensions must be placed at the very bottom of `style.css`, under the `/* ﹥ 13. PLUGINS & EXTENSIONS */` banner. 
To prevent styling conflicts with the core editor, **you must namespace your classes** using the plugin's name. Never use generic class names like `.button`, `.container`, or `.title`.

**Bad:**
```css
    .wrapper { padding: 10px; }
    .title { font-weight: bold; }
```

**Good:**
```css
    .ext-wordcounter-wrapper { padding: 10px; }
    .ext-wordcounter-title { font-weight: bold; }
```

## Quality Assurance & Testing

To maintain stability, all critical workflows in Famouskai are documented with manual test suites. 

### Manual Testing Protocol

Manual test definitions are located directly in the `tests/` directory. 
When creating a new manual test suite, use the suffix `-manual` to distinguish them clearly:
`tests/[feature-name]-manual.md` (e.g., `tests/sync-diffskai-manual.md`).

**Structure Requirements:**
Every manual test file MUST include a markdown table defining:
1. **Test ID:** (e.g., `SYNC-01`)
2. **Scenario:** Brief description.
3. **Pre-conditions:** System state before action.
4. **Action Steps:** Numbered list of user inputs.
5. **Expected Outcome:** Strict definition of the UI/System state post-action.

## What "good first issue" means here

Issues labeled `good first issue` are scoped to be self-contained and don't require deep
familiarity with the whole codebase. If you're new to the project (or to open source generally),
start there — no need to ask permission; just comment on the issue to claim it.

## Release process (for context, not something contributors need to manage)

Releases follow [Semantic Versioning](https://semver.org/) and are tagged on `main`
(`vMAJOR.MINOR.PATCH`). The changelog is maintained in
[`CHANGELOG.md`](https://github.com/denys-digital/famouskai/blob/main/CHANGELOG.md).

## Questions?

Open a [Discussion](https://github.com/denys-digital/famouskai/discussions) rather than emailing
directly — it helps future contributors who hit the same question.
