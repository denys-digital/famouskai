# Famouskai Editor 🦊

*Read this in other languages: [Français](README.fr.md)*

Famouskai is a "Local-First" code and text editor built as a Progressive Web App (PWA). Designed for speed, privacy, and resilience, it runs entirely in your browser with no backend or remote database.

Coupled with **Diffskai**, its native conflict resolution tool, Famouskai ensures your local edits are never accidentally overwritten by an external program.

**Find the creator and other projects at: [github.com/denys-digital](https://github.com/denys-digital)**

## Core Features

*   **100% Local & Offline:** Direct read/write to your hard drive via the File System Access API.
*   **Built-in Diffskai:** Smart detection of external modifications with a native visual merge/diff tool.
*   **Zero Database:** Your files stay on your machine.
*   **PWA Architecture:** Native-like installation on Windows, macOS, Linux, and ChromeOS.
*   **Split-View & Markdown:** Dynamic preview rendering for writers (currently in development).

## Built With (Zero-CDN Architecture)

Famouskai is built to be resilient. To guarantee true offline capability, **all dependencies are vendored locally** (no CDN calls). See [`THIRD-PARTY-NOTICES.md`](./THIRD-PARTY-NOTICES.md) for legal details.

| Library | Version | Role | License |
| --- | --- | --- | --- |
| **[Ace Editor](https://github.com/ajaxorg/ace)** | 1.44.0 | Core text editing engine | BSD-3-Clause |
| **[Monaco Editor](https://github.com/microsoft/monaco-editor)** | 0.56.0 | Diff/Merge resolution engine (Diffskai) | MIT |
| **[Marked](https://github.com/markedjs/marked)** | 18.0.11 | Ultra-fast Markdown parser | MIT |
| **[js-beautify](https://github.com/beautifier/js-beautify)** | 2.0.3 | Code formatting and indentation tools | MIT |
| **[idb-keyval](https://github.com/jakearchibald/idb-keyval)** | 6.3.0 | Promise-based IndexedDB storage | Apache-2.0 |

## License & Usage (Dual License)

Famouskai is passionately developed under a **Dual License** model to guarantee its open evolution while ensuring long-term sustainability.

**1. Open Source (AGPLv3)**
You are free to use, modify, and distribute Famouskai for personal, academic, or open-source projects, provided you share your modifications under the exact same license (AGPLv3). Openness breeds openness. Full text: [`LICENSE`](./LICENSE).

**2. Commercial License**
Want to integrate Famouskai into your proprietary product (SaaS, closed CMS, internal corporate tool) without open-sourcing your own codebase? See [`docs/COMMERCIAL-LICENSE.md`](./docs/COMMERCIAL-LICENSE.md) for details, or contact me directly to acquire an affordable commercial license tailored to your needs.

## Sponsorship & Support

If Famouskai saves you time, or if Diffskai has saved your files from a fatal overwrite, please consider supporting the project! 

Any form of sponsorship helps me maintain the tool, pay for demo hosting, and build new features without ever relying on ad trackers or external investors.

🡪 **[Support Famouskai on Ko-fi](https://ko-fi.com/denysdigital)**

## Repository Structure

This repository keeps its root focused on **code only** — every governance and process file lives
in one of two well-known folders, both auto-detected by GitHub:

```
famouskai/
├── index.html, and all other source files       ← the actual project
├── CHANGELOG.md                                 ← version history (release-adjacent, kept at root)
├── LICENSE                                      ← full AGPLv3 text (must stay at root)
├── THIRD-PARTY-NOTICES.md                       ← vendors licenses (must stay at root)
├── README.md / README.fr.md
├── docs/                                        ← everything a human reads, not GitHub-"magic"
│   ├── 00-START-HERE-HOW-TO.md                  ← start here if you want to contribute
│   ├── CLA.md                                   ← Contributor License Agreement
│   ├── COMMERCIAL-LICENSE.md
│   └── WORKFLOW.fr.md                           ← maintainer's process notes (French)
└── .github/                                     ← everything GitHub reads automatically
    ├── CODE_OF_CONDUCT.md, CONTRIBUTING.md, FUNDING.yml
    ├── PULL_REQUEST_TEMPLATE.md, SECURITY.md
    ├── ISSUE_TEMPLATE/bug_report.md, config.yml, feature_request.md
    └── workflows/cla.yml
```

**Why split this way?** `.github/` holds files GitHub itself detects and acts on (issue/PR
templates, the Sponsor button, the CLA bot) — they only work if placed exactly there or at the
root. `docs/` holds everything meant for humans, not for GitHub's automation. Splitting the two
keeps the repository root free for what actually matters when browsing the code: the code itself.

New here? Start with [`docs/00-START-HERE-HOW-TO.md`](./docs/00-START-HERE-HOW-TO.md) — a step-by-step guide
that assumes zero prior GitHub experience, including a no-install/browser-only path for anyone
who (like the maintainer) doesn't want to set up a local Git command-line interface (CLI).

## Contributing

Contributions are highly appreciated! Whether it's fixing a bug, improving documentation, or proposing a feature, feel free to open an *Issue* or a *Pull Request (PR)*.

Before your first PR, please read:
- [`.github/CONTRIBUTING.md`](./.github/CONTRIBUTING.md) — how contributions work here.
- [`.github/CODE_OF_CONDUCT.md`](./.github/CODE_OF_CONDUCT.md) — expected behavior in this community.
- [`docs/00-START-HERE-HOW-TO.md`](./docs/00-START-HERE-HOW-TO.md) — a complete, beginner-friendly walkthrough (Fork → Pull Request), including a browser-only path if you'd rather not install anything locally.

Your first Pull Request will trigger an automated bot asking you to sign the lightweight
[Contributor License Agreement](./docs/CLA.md) (CLA) — a one-time, one-click step.
