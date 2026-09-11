# Famouskai Maintainer Operations Guide

This guide explains how to operate and maintain the Famouskai repository safely.

It is written for the current maintainer and any future trusted maintainer. It
does not replace the contributor documentation:

- Contributors should start with
  [`00-START-HERE-HOW-TO.md`](https://github.com/denys-digital/famouskai/blob/main/docs/00-START-HERE-HOW-TO.md).
- Contributors should follow
  [`CONTRIBUTING.md`](https://github.com/denys-digital/famouskai/blob/main/.github/CONTRIBUTING.md).
- This document explains the additional responsibilities required to administer
  the repository, GitHub settings, automation, releases, vendored dependencies,
  and community operations.

> **Last verified:** 2026-09-11  
> **Repository:** `denys-digital/famouskai`  
> **Default branch:** `main`

---

## 1. Maintainer principles

The project follows a deliberately lightweight process, but the rules below are
not optional.

1. **Every change reaches `main` through a Pull Request (PR).**
   Never edit or commit directly to `main`, including for documentation,
   configuration, or an apparent one-line fix.

2. **Keep each PR focused.**
   A PR should represent one logical change. For example, adding vendored
   dependencies and changing runtime loading paths are separate changes and
   must be reviewed separately.

3. **Use an Issue when a change needs durable context.**
   Create an Issue for bugs, features, governance changes, security-process
   changes, non-trivial documentation, and any decision that may need to be
   understood later. Very small spelling corrections may not need an Issue,
   but they still require a PR.

4. **Use squash merge only.**
   The final history on `main` should contain one clear commit per merged PR.
   Temporary commits such as `WIP`, `fix typo`, or `address review` belong to
   the contributor branch, not to the permanent project history.

5. **Do not optimize the process before a real need exists.**
   Famouskai is maintained by a solo developer with occasional contributors.
   Prefer a reliable small process over enterprise-style ceremony.

6. **Preserve the project boundaries.**
   Famouskai is Local-First, Offline-First, and backend-free by design.
   Evaluate every feature, dependency, and workflow against those constraints.

---

## 2. Repository map

```text
famouskai/
├── .github/
│   ├── CODE_OF_CONDUCT.md
│   ├── CONTRIBUTING.md
│   ├── FUNDING.yml
│   ├── ISSUE_TEMPLATE/
│   ├── PULL_REQUEST_TEMPLATE.md
│   ├── SECURITY.md
│   └── workflows/
│       └── cla.yml
├── docs/
│   ├── 00-START-HERE-HOW-TO.md
│   ├── CLA.md
│   ├── COMMERCIAL-LICENSE.md
│   ├── MAINTAINER-GUIDE.md
│   ├── PLUGIN-ARCHITECTURE.md
│   └── WORKFLOW.fr.md
├── plugins/
├── tests/
├── vendor/
├── CHANGELOG.md
├── LICENSE
├── README.md
├── README.fr.md
└── THIRD-PARTY-NOTICES.md
```

### Source-of-truth rule

| Subject | Source of truth |
|---|---|
| Application source code | Files at repository root and the relevant source directories |
| Plugin & CSS architecture | [`docs/PLUGIN-ARCHITECTURE.md`](https://github.com/denys-digital/famouskai/blob/main/docs/PLUGIN-ARCHITECTURE.md) |
| Public legal license | [`LICENSE`](https://github.com/denys-digital/famouskai/blob/main/LICENSE) |
| Commercial licensing explanation | [`docs/COMMERCIAL-LICENSE.md`](https://github.com/denys-digital/famouskai/blob/main/docs/COMMERCIAL-LICENSE.md) |
| Contributor rights agreement | [`docs/CLA.md`](https://github.com/denys-digital/famouskai/blob/main/docs/CLA.md) |
| Contributor workflow | [`.github/CONTRIBUTING.md`](https://github.com/denys-digital/famouskai/blob/main/.github/CONTRIBUTING.md) and [`docs/00-START-HERE-HOW-TO.md`](https://github.com/denys-digital/famouskai/blob/main/docs/00-START-HERE-HOW-TO.md) |
| Maintainer operations | This document |
| Release history | [`CHANGELOG.md`](https://github.com/denys-digital/famouskai/blob/main/CHANGELOG.md) |
| Third-party attribution and license tracking | [`THIRD-PARTY-NOTICES.md`](https://github.com/denys-digital/famouskai/blob/main/THIRD-PARTY-NOTICES.md) |
| Active GitHub branch protections | GitHub Settings → Rulesets |
| Private ruleset backup | Maintainer-controlled private backup storage |
| CLA signatures | [`cla-signatures` branch only](https://github.com/denys-digital/famouskai/tree/cla-signatures) |
---

## 3. Branch model

Famouskai uses a small branch model.

| Branch type | Purpose | Lifecycle | Merge into `main`? |
|---|---|---|---|
| `main` | Protected production/reference branch | Permanent | Not applicable |
| `feat/<name>` | New user-facing capability | Short-lived | Yes, via squash PR |
| `fix/<name>` | Bug or configuration correction | Short-lived | Yes, via squash PR |
| `docs/<name>` | Documentation-only work | Short-lived | Yes, via squash PR |
| `cla-signatures` | Bot-managed CLA signature registry | Permanent | **Never** |
| Other temporary branches | Isolated work with a clear purpose | Short-lived | Only if explicitly intended |

### Naming examples

```text
feat/local-first-vendoring
feat/markdown-preview-print
fix/contributing-overview-links
fix/cla-workflow-permissions
docs/maintainer-guide
docs/update-readme-fr
```

### Never do this

- Never commit directly to `main`.
- Never merge `cla-signatures` into `main`.
- Never use `cla-signatures` for product code, documentation, experiments, or
  manual notes.
- Never use a feature branch as permanent storage.
- Never create a generic `test`, `new`, `update`, or `misc` branch name.

---

## 4. Main branch protection

`main` is the protected integration branch. Its protection exists to prevent
accidental direct changes, history rewrites, and unreviewed merges.

### Expected `Protect main` ruleset

| Setting | Expected value | Why |
|---|---:|---|
| Enforcement status | Active | The rules must block, not merely observe |
| Target | Default branch (`main`) | Protects the repository reference branch |
| Bypass list | Empty | The protection applies to the maintainer too |
| Restrict deletions | Enabled | Prevents accidental deletion of `main` |
| Require linear history | Enabled | Prevents merge commits and preserves clean history |
| Require a pull request before merging | Enabled | Every change receives a PR record |
| Required approvals | `0` while solo-maintained | A solo maintainer cannot approve their own PR with a second account |
| Allowed merge methods | Squash only | One clean commit per merged PR |
| Require status checks | Disabled until a stable CI/check set exists | Avoids blocking merges on non-existent checks |
| Require signed commits | Disabled | Not required for the current project size |
| Block force pushes | Enabled | Protects the permanent history |

### Merge method reference

| Method | Behavior | Famouskai policy |
|---|---|---|
| Merge commit | Preserves every branch commit and adds a merge commit | Not allowed |
| Rebase merge | Replays every branch commit directly onto `main` | Not allowed |
| Squash merge | Combines the complete PR into one final commit | Required |

### Standard PR lifecycle

1. Create or confirm the relevant Issue when the work needs durable context.
2. Create a short-lived branch from the current `main`.
3. Make one focused change.
4. Test the change at the appropriate level.
5. Commit to the working branch.
6. Open a PR targeting `main`.
7. Complete the PR template honestly.
8. Verify checks, including CLA status where applicable.
9. Review the diff, links, user impact, and rollback implications.
10. Use **Squash and merge**.
11. Confirm that any linked Issue closes.
12. Delete the merged short-lived branch.
13. Perform the post-merge verification on `main`.

---

## 5. CLA Assistant and signatures

Famouskai uses an Individual Contributor License Agreement (CLA) because it is
dual-licensed:

- GNU Affero General Public License version 3 (AGPLv3) for Open Source use.
- A commercial license for closed-source or proprietary use cases.

The CLA allows the maintainer to distribute accepted external contributions
under both licensing paths while contributors retain copyright in their own
work.

Read the legal document at:
[`docs/CLA.md`](https://github.com/denys-digital/famouskai/blob/main/docs/CLA.md).

### Workflow location

The automation is defined at:

```text
.github/workflows/cla.yml
```

It uses the CLA Assistant GitHub Action and listens for:

- Newly opened or synchronized Pull Requests.
- Newly created Issue/PR comments.
- Closed Pull Requests, allowing the action to preserve the historical
  signature evidence in the completed PR conversation.

### Contributor signing phrase

The action expects the exact phrase:

```text
I have read the CLA Document and I hereby sign the CLA
```

A contributor signs by posting that exact text as a comment on their Pull
Request when the bot requests it.

### Maintainer allowlist

The workflow allowlist may exempt trusted automated or maintainer accounts from
the signature prompt. It currently includes the repository maintainer and
relevant GitHub automation accounts.

Do not add external human contributors to the allowlist merely to bypass the
process. A genuine external code contribution must follow the normal CLA flow.

### CLA check status

The CLA Assistant publishes a PR check. It is useful for visibility and must be
reviewed before merging external contributions.

Do not make the CLA check mandatory in the `main` ruleset until the full
external-contributor flow has been validated:

```text
external GitHub account
→ opens Pull Request
→ bot asks for the CLA signature
→ contributor posts the required phrase
→ bot updates the signatures registry
→ check turns green
→ PR becomes mergeable
```

A maintainer account in the allowlist proves that the bot can run. It does not
fully validate the external signing experience.

---

## 6. The `cla-signatures` branch

`cla-signatures` is a permanent technical branch managed by the CLA Assistant.

It stores the signature registry at:

```text
signatures/version1/cla.json
```

### Purpose

The branch exists so the bot can record signature data without directly writing
to protected `main`.

The branch is not application code, release content, contributor documentation,
or an archive of normal project changes.

### Non-negotiable rules

> **Never merge `cla-signatures` into `main`.**

> **Never manually create `signatures/version1/cla.json`.**

> **Never manually edit `cla.json` during normal operation.**

> **Never delete `cla-signatures` because GitHub offers “Compare & pull request”.**

GitHub displays a generic comparison banner whenever the bot pushes a new
signature commit. This is expected. It does not mean a Pull Request should be
opened or merged.

The CLA Assistant must create `cla.json` itself when it first needs it. A
manually pre-created file can prevent the action from working correctly.

### Expected `Protect CLA signatures` ruleset

| Setting | Expected value | Why |
|---|---:|---|
| Enforcement status | Active | Protection must be effective |
| Target | Exact pattern: `cla-signatures` | Applies only to the registry branch |
| Bypass list | Empty | Prevents casual deletion or history rewrite |
| Restrict deletions | Enabled | The registry branch must not disappear accidentally |
| Block force pushes | Enabled | Signature history must not be rewritten |
| Restrict updates | Disabled | The GitHub Action must commit directly |
| Require pull request before merging | Disabled | The bot cannot open a PR for every signature |
| Require linear history | Disabled | Unnecessary for a bot-managed registry |
| Require status checks | Disabled | No CI requirement is needed for signature commits |
| Require signed commits | Disabled | Could block bot-generated commits |

### Why this branch differs from `main`

`main` must require a PR because it contains the project’s permanent public
source and documentation.

`cla-signatures` must allow direct updates because the bot must record a
signature immediately after a contributor signs. Applying `main` protections to
this branch would break the CLA workflow.

### If the CLA bot fails

Use this triage sequence:

1. Open the failed run in GitHub Actions and read the exact error.
2. Confirm that `.github/workflows/cla.yml` on `main` is the intended version.
3. Confirm that `branch: cla-signatures` is configured in the workflow.
4. Confirm that the `cla-signatures` branch exists.
5. Confirm that the bot can update the branch:
   - Do not enable `Restrict updates`.
   - Do not require PRs on this branch.
6. Confirm that `cla.json` was created by the bot, not manually.
7. Confirm that `contents: write`, `pull-requests: write`, `statuses: write`,
   and any action-specific permissions required by the maintained workflow are
   present.
8. Re-run the failed job only after correcting the underlying configuration.
9. Document the incident in an Issue if the cause or fix could matter later.

### Recovery procedure

If `cla-signatures` is accidentally deleted, corrupted, or needs repair:

1. Stop and identify the incident before making additional changes.
2. Do not merge the branch into `main`.
3. Review the branch history and available private repository/ruleset backups.
4. Temporarily disable only the protection that prevents the necessary recovery.
5. Restore the branch deliberately from valid Git history or a known-good backup.
6. Re-enable protection immediately after recovery.
7. Trigger a controlled CLA workflow test.
8. Record the incident and the verified recovery steps in an Issue or follow-up
   documentation update.

---

## 7. GitHub templates and contributor experience

### Issue templates

GitHub issue templates live at:

```text
.github/ISSUE_TEMPLATE/
```

Current templates include:

| File | Purpose |
|---|---|
| `bug_report.md` | Structured bug reporting, including severity, scope, environment, frequency, and acceptance criteria |
| `feature_request.md` | Feature proposal mini-specification, including problem, audience, affected area, scope, alternatives, and definition of done |
| `config.yml` | Controls blank issues and provides the Discussion contact link |

### Pull Request template

The PR template lives at:

```text
.github/PULL_REQUEST_TEMPLATE.md
```

GitHub automatically inserts its contents into a new PR only after the template
exists on the default branch (`main`).

The first PR that added the template could not use the template automatically.
This is normal: the file did not yet exist on `main` at the time that PR was
opened.

### Security report entry

GitHub’s native **Report a security vulnerability** entry appears in the Issue
chooser because both of the following are true:

1. `.github/SECURITY.md` exists.
2. Private Vulnerability Reporting is enabled in repository settings.

Do not duplicate the same security-reporting destination in
`.github/ISSUE_TEMPLATE/config.yml`. One native security entry is clearer than
two nearly identical options.

### Discussions

Questions, exploratory ideas, and general discussion belong in GitHub
Discussions, not in a blank Issue or private email.

If the Discussion link in the Issue chooser stops working, verify:

```text
Settings → General → Features → Discussions
```

---

## 8. GitHub rendering caveat: `CONTRIBUTING.md`

GitHub renders `.github/CONTRIBUTING.md` in two relevant contexts:

1. At its physical location in `.github/`.
2. In the repository-level **Contributing** overview.

Those two contexts can resolve relative Markdown links differently.

### Policy

Use canonical absolute URLs for repository-internal links in
`.github/CONTRIBUTING.md`, for example:

```text
[https://github.com/denys-digital/famouskai/blob/main/docs/CLA.md](https://github.com/denys-digital/famouskai/blob/main/docs/CLA.md)
```

Do not rely on paths such as:

```text
../docs/CLA.md
./CODE_OF_CONDUCT.md
```

Those paths may work when the file is opened directly but fail from the
repository-level Contributing overview.

### Verification after editing `CONTRIBUTING.md`

Test all links from both contexts:

1. Open the repository home page and select **Contributing**.
2. Test every internal document, Issue, Discussion, and label link.
3. Open `.github/CONTRIBUTING.md` from the repository tree.
4. Repeat the same checks.
5. Confirm that no link reaches a 404 page.

---

## 9. Dependency vendoring

Famouskai is moving toward local copies of runtime dependencies to strengthen
its Local-First and Offline-First architecture.

Vendored assets belong in:

```text
vendor/
```

The vendor directory may include dependencies such as:

- Ace Editor.
- idb-keyval.
- js-beautify.
- marked.
- Monaco Editor.

### Vendor metadata

Each vendored library directory should include:

```text
_VENDOR-INFO.md
_vendor-update.log
```

These files must identify:

- Upstream project and source URL.
- Exact version.
- Original license.
- Download/build method.
- Files included.
- Date and reason for the update.
- Any local changes, if they exist.

### Required separation of work

Vendor work must be split into at least two PRs when possible.

#### PR 1: Vendor preparation

This PR adds or refreshes the local library assets and metadata.

It must not yet change:

- Application runtime paths.
- CDN references.
- HTML script tags.
- Service Worker cache entries.
- Product behavior.

This makes the imported files reviewable and reversible in isolation.

#### PR 2: Runtime switch

This PR changes Famouskai and/or Diffskai to load the local vendored assets.

It must include:

- Updated HTML and JavaScript references.
- Updated Service Worker cache entries.
- Offline/PWA testing.
- Tests for editor modes, workers, previews, formatting, persistence, and
  Diffskai where relevant.
- A rollback plan if an asset path or worker fails to load.

### Vendor update checklist

Before merging a vendor update:

- [ ] Confirm the exact upstream version.
- [ ] Confirm the upstream license.
- [ ] Update `_VENDOR-INFO.md`.
- [ ] Append to `_vendor-update.log`.
- [ ] Update `THIRD-PARTY-NOTICES.md`.
- [ ] Confirm no proprietary or incompatible asset was included.
- [ ] Keep generated Monaco asset names unchanged unless the upstream build
      process explicitly requires otherwise.
- [ ] Verify that required worker files are included.
- [ ] Verify the PWA works offline after the runtime-switch PR.
- [ ] Verify no CDN dependency remains unintentionally.

---

## 10. Architecture enforcement (Plugins & CSS)

Famouskai relies on a strict Zero-Build, Local-First architecture. When reviewing Pull Requests that add features or modify UI, the maintainer must enforce these boundaries.

### Plugin review checklist

- [ ] **No ES Modules:** Ensure no `<script type="module">` has been introduced.
- [ ] **Single Global Namespace:** Ensure the plugin attaches to `window.FamousPluginCore` and does not leak global variables.
- [ ] **HTML Registration:** Ensure the new `/plugins/*.js` file is correctly added to `index.html`.
- [ ] **Service Worker Cache:** **Critical:** Ensure the new file is added to the `URLS_TO_CACHE` array in `sw.js` AND that the `CACHE_NAME` version has been incremented. Failure to do this breaks offline support.

### CSS ITCSS review checklist

- [ ] **No external CSS files:** Plugin CSS must be inside `style.css`.
- [ ] **Strict Namespacing:** Ensure plugin CSS classes are prefixed (e.g., `.ext-wordcounter-box`). Reject generic classes like `.box` or `.btn`.
- [ ] **Layer compliance:** Ensure CSS is placed in the correct ITCSS layer (e.g., Layer 5 for plugins, Layer 3 for generic UI boxes).
- [ ] **No hardcoded colors:** Reject hex codes (`#ff0000`). Require `:root` semantic variables (e.g., `var(--color-text-primary)`).

---

## 11. Third-party notices

The repository’s third-party attribution record is:

```text
THIRD-PARTY-NOTICES.md
```

It must remain accurate whenever vendored libraries change.

### Required information

For every bundled or runtime-loaded dependency, record:

- Library name.
- Upstream source.
- Exact version.
- License.
- Copyright notice where required.
- Whether the library is locally vendored or loaded remotely.
- Any special attribution or notice obligation.

### Important principle

AGPLv3 does not erase the licensing obligations of embedded third-party
software. Preserve upstream notices and license requirements even when Famouskai
as a whole is distributed under AGPLv3 plus a commercial license.

---

## 12. Security operations

The public security policy is:

```text
.github/SECURITY.md
```

### Reporting channel

Security vulnerabilities must not be reported as public Issues.

The repository uses GitHub Private Vulnerability Reporting. Reporters should:

1. Open the repository’s Security area or the native security entry in the Issue
   chooser.
2. Read `SECURITY.md`.
3. Select **Report a vulnerability**.
4. Submit the report through GitHub’s private advisory flow.

### Maintainer response process

1. Acknowledge the report privately.
2. Determine whether it is a genuine security issue, a normal bug, or out of
   scope.
3. Assess impact, exploitability, affected versions, and possible data loss.
4. Create a private remediation plan.
5. Fix and test the issue without exposing exploit details prematurely.
6. Agree on coordinated disclosure timing with the reporter where appropriate.
7. Publish a release, changelog entry, and advisory when the fix is available.
8. Credit the reporter if they want public credit.

### Famouskai-specific security priorities

Pay particular attention to:

- File System Access API behavior.
- Unexpected read/write scope.
- File overwrite or data-loss conditions.
- Service Worker cache behavior.
- Third-party asset integrity and runtime loading.
- Markdown/HTML preview cross-site scripting (XSS).
- Diffskai merge or conflict-resolution data loss.
- Local storage and IndexedDB persistence behavior.

---

## 13. Releases and changelog

The release history is maintained in:

```text
CHANGELOG.md
```

Famouskai uses Semantic Versioning:

```text
vMAJOR.MINOR.PATCH
```

| Version component | Use when |
|---|---|
| MAJOR | A breaking compatibility change is introduced |
| MINOR | A backward-compatible feature is added |
| PATCH | A backward-compatible bug fix is released |

### Release checklist

1. Confirm that the target changes are merged into `main`.
2. Review open Issues and PRs to ensure the release scope is intentional.
3. Update `CHANGELOG.md`.
4. Test the application in supported browser contexts.
5. Test PWA installation and offline startup where relevant.
6. Test file open, save, save-as, reload, conflict detection, and Diffskai.
7. Test affected editor modes, preview behavior, and vendor assets.
8. Create an annotated release tag using `vMAJOR.MINOR.PATCH`.
9. Create a GitHub Release with concise human-readable notes.
10. Confirm that the published release matches the tagged `main` commit.
11. Monitor the first user reports after release.

---

## 14. Funding and public project settings

Famouskai accepts optional support through Ko-fi.

The repository configuration is:

```text
.github/FUNDING.yml
```

### Funding rules

- Keep `FUNDING.yml` limited to confirmed, active funding destinations.
- Do not add an unverified GitHub Sponsors, Ko-fi, Patreon, or other payment
  account.
- If a funding platform changes, update both `FUNDING.yml` and the relevant
  README links in one focused PR.
- Do not promise sponsorship rewards, support response times, or Membership
  benefits that cannot be maintained consistently.

### Ko-fi operating decisions

Current operating principles:

- Prefer **Tip** wording over charitable **Donation** wording.
- Keep one-time support easy.
- Allow recurring monthly tips, but do not make recurrence the default.
- Do not create Membership tiers until there are clear, sustainable benefits to
  provide.
- Keep public supporter counters and leaderboards disabled while the project is
  new and the numbers do not provide meaningful social proof.
- Do not expose unnecessary payment, personal, or supporter information.

---

## 15. Repository configuration backup

GitHub Settings are not fully stored in the source tree. Important configuration
must be backed up separately.

The maintainer’s repository export/backup tool should preserve, at minimum:

- Repository source and branches.
- Rulesets.
- Branch protection-relevant settings.
- GitHub Actions workflow files.
- Issue and PR templates.
- Labels, milestones, and relevant repository metadata where supported.
- Documentation and licensing files.

### Ruleset backup procedure

After creating or materially changing a ruleset:

1. Open GitHub **Settings → Rulesets**.
2. Export the affected ruleset as JSON.
3. Store the export in private, backed-up maintainer storage.
4. Record the date and purpose of the export.
5. Re-export after any meaningful ruleset change.

The active GitHub ruleset remains the live source of truth. The private export is
a recovery and migration backup, not a second public configuration to edit
independently.

### Never store operational documentation in `.env`

`.env` files are for environment variables and secrets. They must not become a
general notebook for rulesets, workflows, recovery notes, or project decisions.

Keep generic personal Open Source lessons in a separate private maintainer
playbook or private repository, not in a forgotten project branch.

---

## 16. Maintainer troubleshooting reference

| Symptom | Likely cause | First action |
|---|---|---|
| A contributor cannot merge into `main` | Expected branch protection | Review PR checks and ruleset requirements |
| A maintainer cannot push directly to `main` | Expected branch protection | Create a branch and PR; do not weaken the ruleset |
| CLA Assistant check fails | Workflow, permissions, branch, or signature issue | Read the exact GitHub Actions log |
| CLA bot cannot write signatures | `cla-signatures` protection blocks updates or branch is missing | Verify branch, workflow `branch:` value, and ruleset |
| `cla.json` was manually created or edited | Unsupported normal workflow | Restore bot-managed operation; do not continue manual edits |
| GitHub suggests merging `cla-signatures` | Normal generic branch comparison banner | Ignore it; never merge this branch |
| A CONTRIBUTING link gives a 404 from overview | Relative link rendered in a different context | Use a canonical absolute GitHub URL |
| Two security entries appear in Issue chooser | Native security entry plus duplicate `config.yml` link | Keep the native entry; remove the duplicate contact link |
| PR template did not auto-fill | Template is not yet on `main` | Merge template first; subsequent PRs will auto-fill |
| PWA works online but not offline | Missing Service Worker cache entry or vendor path | Inspect cache list and runtime asset requests |
| Monaco worker fails to load | Missing generated asset, wrong path, or renamed hash file | Compare vendor files with upstream distribution |
| A vendored library update is unclear | Missing metadata/version information | Stop and update `_VENDOR-INFO.md` before merging |
| A new plugin works locally but fails offline / on reload | Old Service Worker cache is active | Verify `CACHE_NAME` was incremented in `sw.js` and the file is in `URLS_TO_CACHE` |
| A plugin's UI breaks the core editor styling | CSS namespace collision | Verify the plugin's CSS uses strict prefixes and respects ITCSS layers in `style.css` |

---

## 17. Periodic maintainer review

Every few months, or before a major release, review:

- [ ] `main` ruleset is active and still targets the default branch.
- [ ] `cla-signatures` ruleset prevents deletion and force pushes but allows bot updates.
- [ ] CLA Assistant workflow still runs successfully.
- [ ] Private Vulnerability Reporting remains enabled.
- [ ] Discussions remain enabled.
- [ ] `FUNDING.yml` points only to active funding destinations.
- [ ] `THIRD-PARTY-NOTICES.md` matches the current vendor versions.
- [ ] Vendor metadata is current.
- [ ] `CHANGELOG.md` reflects recent releases.
- [ ] README funding links work.
- [ ] `CONTRIBUTING.md` links work both from its direct file view and from the
      repository-level Contributing overview.
- [ ] Private ruleset exports and repository backups are current.
- [ ] No unused branches have accumulated, except permanent operational branches
      such as `main` and `cla-signatures`.

---

## 18. Related documentation

- [`README.md`](https://github.com/denys-digital/famouskai/blob/main/README.md)
- [`README.fr.md`](https://github.com/denys-digital/famouskai/blob/main/README.fr.md)
- [`00-START-HERE-HOW-TO.md`](https://github.com/denys-digital/famouskai/blob/main/docs/00-START-HERE-HOW-TO.md)
- [`WORKFLOW.fr.md`](https://github.com/denys-digital/famouskai/blob/main/docs/WORKFLOW.fr.md)
- [`CONTRIBUTING.md`](https://github.com/denys-digital/famouskai/blob/main/.github/CONTRIBUTING.md)
- [`PLUGIN-ARCHITECTURE.md`](https://github.com/denys-digital/famouskai/blob/main/docs/PLUGIN-ARCHITECTURE.md)
- [`CODE_OF_CONDUCT.md`](https://github.com/denys-digital/famouskai/blob/main/.github/CODE_OF_CONDUCT.md)
- [`SECURITY.md`](https://github.com/denys-digital/famouskai/blob/main/.github/SECURITY.md)
- [`CLA.md`](https://github.com/denys-digital/famouskai/blob/main/docs/CLA.md)
- [`COMMERCIAL-LICENSE.md`](https://github.com/denys-digital/famouskai/blob/main/docs/COMMERCIAL-LICENSE.md)
- [`THIRD-PARTY-NOTICES.md`](https://github.com/denys-digital/famouskai/blob/main/THIRD-PARTY-NOTICES.md)
- [`CHANGELOG.md`](https://github.com/denys-digital/famouskai/blob/main/CHANGELOG.md)
