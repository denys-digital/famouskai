# Contributing to Famouskai

Thanks for considering a contribution to Famouskai! This document covers what you need to know
before opening an issue or a pull request.

## Before you start

- **License:** Famouskai is dual-licensed (the GNU Affero General Public License, version 3 —
  AGPLv3 — plus commercial, see [`LICENSE`](../LICENSE) and
  [`COMMERCIAL-LICENSE.md`](../docs/COMMERCIAL-LICENSE.md)). Your first pull request will trigger a bot
  asking you to sign our lightweight [Contributor License Agreement (CLA)](../docs/CLA.md). This is a
  one-time step; read it, it's short.
- **Code of Conduct:** all interactions in this project are governed by our
  [Code of Conduct](./CODE_OF_CONDUCT.md).

## Ways to contribute

- **Bug reports** — open an [Issue](../issues/new/choose) using the bug report template.
- **Feature requests / ideas** — open an Issue using the feature request template, or start a
  [Discussion](../discussions) if it's more exploratory.
- **Code** — pick an issue labeled [`good first issue`](../labels/good%20first%20issue) or
  [`help wanted`](../labels/help%20wanted), or propose your own via an Issue first (see below).
- **Documentation** — typos, clarity fixes, translations: Pull Requests (PRs) welcome, no prior
  issue needed.

## Development workflow

No prior GitHub experience? Read [`docs/00-START-HERE-HOW-TO.md`](../docs/00-START-HERE-HOW-TO.md)
first — it covers two paths: a 100% browser-based workflow (no install, works on a Chromebook)
and a local Git command-line (CLI) workflow. The steps below are the general shape either path
follows.

1. **Fork** the repository (both paths: via the **Fork** button on GitHub.com).
2. **Branch** from `main` using a short, descriptive name (`feat/..` for new feature, 
   `fix/..` for fixing a bug, `docs/..` for updating any other document than code):
   - `feat/split-view-toggle`
   - `fix/diffskai-merge-crash`
   - `docs/update-readme-fr`
3. **Edit and test locally** — Famouskai has no build step. Open `index.html` directly in a
   browser to test your change. See [`docs/00-START-HERE-HOW-TO.md`](../docs/00-START-HERE-HOW-TO.md)
   for the full step-by-step setup on either path.
4. **Commit** using clear, present-tense messages (e.g. `Add markdown live-preview toggle`, not
   `added stuff`). Group related changes into a single commit where reasonable.
5. **Open a Pull Request** against `main`. Fill in the PR template — it's short, but the
   checklist matters (see below).
6. **Sign the CLA** if the bot asks (first-time contributors only).
7. **Respond to review.** For non-trivial changes, expect at least one round of feedback before
   merge — this isn't a formality, it's how we keep the codebase coherent as a small team.

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

## What "good first issue" means here

Issues labeled `good first issue` are scoped to be self-contained and don't require deep
familiarity with the whole codebase. If you're new to the project (or to open source generally),
start there — no need to ask permission, just comment on the issue to claim it.

## Release process (for context, not something contributors need to manage)

Releases follow [Semantic Versioning](https://semver.org/) and are tagged on `main`
(`vMAJOR.MINOR.PATCH`). The changelog is maintained in [`CHANGELOG.md`](../CHANGELOG.md).

## Questions?

Open a [Discussion](../discussions) rather than emailing directly — it helps future
contributors who hit the same question.
