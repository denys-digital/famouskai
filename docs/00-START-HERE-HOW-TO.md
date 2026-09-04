# Start Here: Getting Started with the Famouskai Repository

This guide assumes **zero prior GitHub workflow experience**. If you already know Git, skip to
whichever section you need. For the *why* behind these steps, see
[`WORKFLOW.fr.md`](./WORKFLOW.fr.md)
(in French).

**Famouskai has no build step.** It's plain HyperText Markup Language, Cascading Style Sheets, and
JavaScript (HTML/CSS/JS) — there is no `npm install`, no bundler, nothing to compile. You edit
files and open `index.html` in a browser. This matters for which path below fits you.

## Choose your path

Throughout this guide, look for these markers to know if a paragraph concerns you:
**🔵 = Path A (browser-only)** — **🟧 = Path B (local Git command-line interface, CLI)** —
**🔵🟧 = applies to both.**

| | **🔵 Path A — Browser-only** | **🟧 Path B — Local Git CLI** |
|---|---|---|
| Best for | Chromebooks, tablets, "I don't want to install anything" | You already have a terminal (macOS/Linux/Windows) and are comfortable with it |
| Requires installing Git/Node.js? | No | Git only (still no Node.js/npm — see note above) |
| Where you edit | GitHub's web editor or [github.dev](https://github.dev) | Your own editor (VS Code, or Famouskai itself) |
| Where you test | Open `index.html` directly in the browser | Open `index.html` directly in the browser |
| How you commit/push | Done automatically by GitHub.com's editor or github.dev | `git` commands |

Both paths end up at the same place: a Pull Request. Pick whichever removes friction for you —
you can also mix them (e.g. edit via github.dev, but read Part 3 below to understand what's
happening under the hood).

---

## Part 1 — One-time setup

### 1.1 🔵🟧 Create accounts / install tools

**🔵 Path A (browser-only, no install):**
- A [GitHub account](https://github.com/join) (free). That's it — nothing to install.

**🟧 Path B (local Git CLI):**
- A [GitHub account](https://github.com/join) (free).
- [Git](https://git-scm.com/downloads) installed locally. Verify with:
  ```
  git --version
  ```
- A code editor (VS Code, or Famouskai itself once you have a local copy).
- ~~Node.js/npm~~ — **not needed.** Famouskai has no build tooling; opening `index.html` in a
  browser is enough to run and test it, on either path.

### 1.2 🟧 Configure Git (Path B only, first time on any new machine)

```
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

This name/email is what will appear on your commits — it doesn't need to match your GitHub
account exactly, but it's simplest if it does. (🔵 Path A: skip this — the GitHub web editor uses
your account identity automatically, no config needed.)

---

## Part 2 — Getting the code

### 🔵 Path A — Browser-only (no terminal, works on a Chromebook)

1. **Fork the repository:** go to `https://github.com/denys-digital/famouskai` and click **Fork**
   (top-right). This creates `https://github.com/YOUR-USERNAME/famouskai`.
2. **Edit files** using one of these, in increasing order of power:
   - **Quick single-file edit:** open the file on GitHub and click the pencil icon
     ("Edit this file"). Good for typos, small doc fixes, single-file tweaks.
   - **github.dev (recommended for most changes):** press the `.` key while viewing your fork on
     github.com, or change the web address (URL) from `github.com/...` to `github.dev/...`. This
     opens a full
     VS Code-like editor *in your browser tab* — no install, works on a Chromebook. It has a
     file tree, a Source Control panel (for staging/committing), and even an integrated terminal
     if you ever want one.
   - **GitHub Codespaces** (heavier, has monthly free-tier limits): a full cloud dev environment
     with a real terminal, still 100% browser-based. Click **Code → Codespaces → Create
     codespace** on your fork. Useful if a task genuinely needs a terminal and you still don't
     want to install anything locally.
3. **Test your change:** in github.dev, right-click `index.html` in the file tree → **Open with
   Live Preview** if the extension is available, or simply download/open the file locally in a
   browser tab to check the result. (github.dev alone can't execute `file://` JavaScript the same
   way a locally-opened tab can, since it's a remote editor — for a quick visual check on
   behavior tied to the File System Access Application Programming Interface (API) specifically,
   opening the file directly in Chrome, as described in 🟧 Path B's testing step, is the most
   reliable check.)
4. **Commit and open a pull request (PR):** github.dev's Source Control panel lets you stage,
   write a commit
   message, and commit — then a banner offers to push and open a Pull Request directly. The
   single-file "pencil edit" flow does this in one step: after editing, scroll down, GitHub asks
   you to "Create a new branch and start a pull request" automatically.

This covers everything Part 3 and Part 4 below describe with `git` commands — you're doing the
same steps, just through buttons instead of a terminal. Skip ahead to
**[Part 5](#part-5--other-common-tasks)** once you're comfortable, or read Part 3/4 anyway to
understand what's happening behind the UI.

### 🟧 Path B — Local Git CLI

#### 2.1 Fork the repository

A **fork** is your own personal copy of the repository, on your GitHub account. You do your work
there, then propose it back to the original project via a Pull Request.

1. Go to `https://github.com/denys-digital/famouskai`.
2. Click **Fork** (top-right). This creates `https://github.com/YOUR-USERNAME/famouskai`.

#### 2.2 Clone your fork locally

"Clone" = download the repository onto your computer.

```
git clone https://github.com/YOUR-USERNAME/famouskai.git
cd famouskai
```

#### 2.3 Add the original repository as a remote

This lets you pull in updates from the real project later.

```
git remote add upstream https://github.com/denys-digital/famouskai.git
```

Check it worked:

```
git remote -v
```

You should see two remotes: `origin` (your fork) and `upstream` (the original project).

#### 2.4 Run it locally

No install step needed. Open `index.html` directly in your browser (double-click it, or
`Right-click → Open with → [your browser]`) to test your changes as you make them.

*(If a future contribution genuinely introduces build tooling — a bundler, a test runner — this
section should be updated accordingly via a docs PR. As of now, there is none.)*

---


## Part 3 — Making a change (🟧 Path B / Git CLI)

*(🔵 Path A users: github.dev's Source Control panel does all of this through buttons — see the
Path A section in Part 2 above. This section documents the equivalent terminal commands, useful
background either way.)*

### 3.1 Sync with the latest version first

Always start from an up-to-date `main`, to avoid conflicts later:

```
git checkout main
git pull upstream main
git push origin main
```

### 3.2 Create a branch for your change

Never work directly on `main`. Name your branch descriptively:

```
git checkout -b feat/short-description
```

Examples: `feat/split-view-toggle`, `fix/diffskai-merge-crash`, `docs/fix-typo-readme`.

### 3.3 Make your changes

Edit the code. Reload `index.html` in your browser (already open from step 2.4) to verify your
change works as expected — no build/restart step needed.

### 3.4 Check what changed

```
git status
git diff
```

`git status` lists changed files; `git diff` shows the actual line-by-line changes.

### 3.5 Commit your changes

```
git add .
git commit -m "Add split-view toggle to the markdown preview"
```

**Commit message tips:**
- Present tense, imperative mood: "Add X", not "Added X" or "Adding X".
- Describe *what* changed, not *how* you felt about it.
- One commit per logical change is ideal, but don't over-optimize this as a beginner — a few
  commits combined into one clean PR is fine.

### 3.6 Push your branch to your fork

```
git push origin feat/short-description
```

---

## Part 4 — 🔵🟧 Opening a Pull Request (PR)

*(🔵 Path A users following github.dev or the single-file edit flow: this happens automatically as
described in Part 2 — the steps below are the manual/CLI equivalent.)*

1. Go to your fork on GitHub: `https://github.com/YOUR-USERNAME/famouskai`.
2. You'll see a banner: **"feat/short-description had recent pushes — Compare & pull request"**.
   Click it. (If you don't see it, go to the **Pull requests** tab and click **New pull
   request**.)
3. Make sure the base repository is `denys-digital/famouskai` / `main`, and the head is your
   fork / your branch.
4. Fill in the PR template that appears — it will prompt you for what the change does, how you
   tested it, and a checklist.
5. Click **Create pull request**.

### 4.1 🔵🟧 Sign the Contributor License Agreement (CLA) (first PR only)

A bot ("CLA Assistant") will automatically comment on your PR asking you to sign the
[Contributor License Agreement](./CLA.md). Read it, then comment exactly:

```
I have read the CLA Document and I hereby sign the CLA
```

This is recorded once per GitHub account — you won't be asked again on future PRs.

### 4.2 🟧 Respond to review (Path B / Git CLI)

The maintainer (or another reviewer) may leave comments requesting changes. To update your PR:

```
# make more edits locally
git add .
git commit -m "Address review feedback"
git push origin feat/short-description
```

The PR updates automatically — no need to open a new one.

**🔵 Path A:** open the same branch again in github.dev (from your fork, switch to the PR's
branch, or reopen the PR page and click **"Edit"**), make your changes, and commit again through
the Source Control panel — same result, no new PR needed.

### 4.3 🟧 After merge (Path B / Git CLI)

Once merged, clean up:

```
git checkout main
git pull upstream main
git branch -d feat/short-description        # delete local branch
git push origin --delete feat/short-description   # delete branch on your fork
```

**🔵 Path A:** GitHub offers a **"Delete branch"** button directly on the merged PR page — click
it. There's no local branch to clean up since you never had one.

---

## Part 5 — Other common tasks

### 5.1 🔵🟧 Claiming an issue

Found a [`good first issue`](../../../labels/good%20first%20issue)? Comment on it ("I'd like to work
on this") before starting, so two people don't duplicate effort. No formal assignment process is
required for small issues.

### 5.2 🔵🟧 Reporting a bug

Use the **Bug report** issue template (`New Issue` → choose "Bug report"). Fill in every field —
especially the browser/operating system (OS), since Famouskai's File System Access API behavior
varies significantly by browser.

### 5.3 🔵🟧 Suggesting a feature

Use the **Feature request** template. Open the issue *before* writing code for anything non-trivial
— see [`CONTRIBUTING.md`](../.github/CONTRIBUTING.md) for why.

### 5.4 🔵🟧 Keeping your fork updated over time

If you come back to contribute again after a while (🟧 Path B / CLI):

```
git checkout main
git fetch upstream
git merge upstream/main
git push origin main
```

**🔵 Path A:** on your fork's GitHub page, look for a **"Sync fork"** button (shown when your fork
is behind `main`) — one click does the same thing.

---

## Glossary (for absolute beginners)

| Term | Meaning |
|---|---|
| **Repository (repo)** | The project's folder, tracked by Git, hosted on GitHub. |
| **Fork** | Your personal copy of someone else's repository. |
| **Clone** | Downloading a repository (yours or someone else's) to your computer. |
| **Remote** | A named link to a repository hosted online (`origin`, `upstream`). |
| **Branch** | A parallel line of work, so you don't edit `main` directly. |
| **Commit** | A saved snapshot of your changes, with a message describing them. |
| **Push** | Sending your local commits to GitHub. |
| **Pull** | Downloading new commits from GitHub to your local machine. |
| **Pull Request (PR)** | A formal proposal to merge your branch into `main`. |
| **Merge** | Integrating a branch's changes into another branch (usually `main`). |
| **CLA** | Contributor License Agreement — a one-time legal sign-off, see [`CLA.md`](./CLA.md). |
| **github.dev** | GitHub's free, browser-based VS Code-like editor — no install, works on any device with a browser (press `.` on any repo page). |
| **Codespaces** | A full cloud dev environment (with a real terminal) that runs in your browser tab — free tier, no local install. |

If something in this guide is unclear or out of date, that's itself worth a documentation PR —
you'd be the perfect person to fix it, since you just felt the confusion firsthand.
